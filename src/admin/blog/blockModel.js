// ─────────────────────────────────────────────────────────────────────────────
// Blog body <-> block model.
//
// The 12 existing posts are hand-authored HTML carrying custom structures —
// stat boxes, CTA boxes, FAQ items, comparison tables, figures with captions,
// a table of contents. Feeding that through a plain WYSIWYG would quietly strip
// every class and unwrap every <div>, destroying both the styling and the
// FAQ/Article schema those structures back.
//
// So the editor works on a list of BLOCKS instead of one soup of HTML. Each
// recognised structure becomes a block with real fields the client can edit in a
// form; anything unrecognised is preserved verbatim as an { type: 'html' } block
// so nothing can ever be lost by opening a post.
//
// The safety rule this file exists to enforce:
//
//     serialize(parse(html)) must equal html
//
// `parseBody` checks that itself and, when it does not hold, refuses to guess —
// it hands back a single raw block and sets `lossless: false`, and the editor
// switches that post to HTML mode rather than silently rewriting it.
// ─────────────────────────────────────────────────────────────────────────────

const CLASS_BLOCKS = {
  'stat-box':      'statBox',
  'cta-box':       'ctaBox',
  'highlight-box': 'highlight',
  'author-box':    'authorBox',
  'faq-item':      'faqItem',
  toc:             'toc',
};

/** Human labels for the block palette and the block headers. */
export const BLOCK_LABELS = {
  richtext:  'Text',
  heading:   'Heading',
  statBox:   'Stat callout',
  ctaBox:    'Call to action',
  highlight: 'Highlight box',
  authorBox: 'Author bio',
  faqItem:   'FAQ question',
  toc:       'Table of contents',
  tags:      'Tag row',
  table:     'Table',
  figure:    'Image',
  hero:      'Post header',
  html:      'Custom HTML',
};

let uid = 0;
const nextId = () => `b${++uid}`;

// ── Parse ────────────────────────────────────────────────────────────────────

function classify(el) {
  const cls = [...el.classList];
  for (const c of cls) if (CLASS_BLOCKS[c]) return CLASS_BLOCKS[c];

  const tag = el.tagName.toLowerCase();
  if (tag === 'table') return 'table';
  if (tag === 'figure') return 'figure';
  if (tag === 'header' && cls.includes('hero')) return 'hero';
  // A paragraph whose only elements are .tag spans is the keyword row, not prose.
  if (tag === 'p' && el.querySelector('span.tag')) {
    const kids = [...el.children];
    if (kids.length && kids.every((c) => c.tagName === 'SPAN' && c.classList.contains('tag'))) return 'tags';
  }
  if (/^h[1-6]$/.test(tag)) return 'heading';
  return null;
}

function elementToBlock(el) {
  const kind = classify(el);
  const outer = el.outerHTML;

  switch (kind) {
    case 'hero':
      return {
        id: nextId(), type: 'hero', html: outer,
        title: el.querySelector('h1')?.innerHTML || '',
        meta: el.querySelector('.meta')?.innerHTML || '',
      };

    case 'tags':
      return {
        id: nextId(), type: 'tags', html: outer,
        tags: [...el.querySelectorAll('span.tag')].map((s) => s.textContent.trim()),
      };

    case 'faqItem': {
      // The markup pairs a heading with the answer that follows it inside the item.
      const q = el.querySelector('h3, h2, strong');
      return {
        id: nextId(), type: 'faqItem', html: outer,
        question: q ? q.innerHTML : '',
        answer: [...el.children].filter((c) => c !== q).map((c) => c.outerHTML).join(''),
      };
    }

    case 'figure': {
      const img = el.querySelector('img');
      return {
        id: nextId(), type: 'figure', html: outer,
        src: img?.getAttribute('src') || '',
        alt: img?.getAttribute('alt') || '',
        caption: el.querySelector('figcaption')?.innerHTML || '',
      };
    }

    case 'heading':
      return {
        id: nextId(), type: 'heading', html: outer,
        level: Number(el.tagName[1]),
        text: el.innerHTML,
        anchor: el.getAttribute('id') || '',
      };

    case 'statBox':
    case 'ctaBox':
    case 'highlight':
    case 'authorBox':
    case 'toc':
    case 'table':
      return { id: nextId(), type: kind, html: outer, inner: el.innerHTML };

    default:
      return null;   // prose — merged into a richtext run by the caller
  }
}

/**
 * Split a container's children into blocks, merging consecutive prose elements
 * (<p>, <ul>, <blockquote>…) into a single editable text block so the client
 * gets a normal writing experience instead of one box per paragraph.
 */
function childrenToBlocks(container) {
  const blocks = [];
  let run = [];

  const flushRun = () => {
    if (!run.length) return;
    blocks.push({ id: nextId(), type: 'richtext', html: run.join('') });
    run = [];
  };

  for (const node of container.childNodes) {
    if (node.nodeType === 3) {                       // text node
      if (node.textContent.trim()) run.push(node.textContent);
      continue;
    }
    if (node.nodeType !== 1) continue;               // comments etc. are dropped by the check below

    const block = elementToBlock(node);
    if (block) {
      flushRun();
      blocks.push(block);
    } else {
      run.push(node.outerHTML);
    }
  }
  flushRun();
  return blocks;
}

/**
 * Parse a post body into blocks.
 * Returns { blocks, lossless }. When `lossless` is false the caller MUST NOT
 * write the serialized form back — the post is only safe to edit as raw HTML.
 */
export function parseBody(html) {
  const source = String(html || '');
  if (!source.trim()) return { blocks: [], lossless: true, wrapper: null };

  const doc = new DOMParser().parseFromString(`<div id="__root">${source}</div>`, 'text/html');
  const root = doc.getElementById('__root');

  // Most posts wrap their body in <div class="container">. Descend through it so
  // the client edits the content, not the wrapper — and remember it so
  // serializing puts it back exactly where it was.
  let wrapper = null;
  const blocks = [];

  for (const node of [...root.childNodes]) {
    if (node.nodeType === 1 && node.classList?.contains('container')) {
      wrapper = { tag: node.tagName.toLowerCase(), attrs: attrString(node), at: blocks.length };
      blocks.push(...childrenToBlocks(node).map((b) => ({ ...b, inContainer: true })));
      continue;
    }
    if (node.nodeType === 3) {
      if (node.textContent.trim()) blocks.push({ id: nextId(), type: 'richtext', html: node.textContent });
      continue;
    }
    if (node.nodeType !== 1) continue;

    const block = elementToBlock(node);
    blocks.push(block || { id: nextId(), type: 'richtext', html: node.outerHTML });
  }

  const result = { blocks, wrapper };
  const round = serializeBody(result);

  // Compare against the BROWSER's own re-serialization of the source, not the
  // raw source text. Parsing HTML decodes entities (`&middot;` becomes `·`) and
  // regularises attribute quoting — differences that render identically and are
  // unavoidable for anything DOM-based. Measuring against the raw bytes would
  // flag every post as unsafe and disable the editor entirely.
  //
  // What this check still catches is the thing that actually matters: block
  // logic dropping, reordering or unwrapping content.
  const baseline = root.innerHTML;

  if (normalize(round) !== normalize(baseline)) {
    return {
      blocks: [{ id: nextId(), type: 'html', html: source }],
      wrapper: null,
      lossless: false,
    };
  }

  return { ...result, lossless: true };
}

function attrString(el) {
  return [...el.attributes].map((a) => ` ${a.name}="${a.value}"`).join('');
}

const normalize = (s) => String(s).replace(/\s+/g, ' ').replace(/>\s+</g, '><').trim();

// ── Serialize ────────────────────────────────────────────────────────────────

function blockToHtml(block) {
  switch (block.type) {
    case 'hero':
      // Regenerate only when the client actually edited a field; otherwise the
      // original markup is reproduced byte for byte.
      if (block.dirty) {
        return `<header class="hero">\n  <h1>${block.title}</h1>\n  <p class="meta">${block.meta}</p>\n</header>`;
      }
      return block.html;

    case 'tags':
      if (block.dirty) {
        return `<p style="margin:24px 0 0">\n    ${block.tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join('\n    ')}\n  </p>`;
      }
      return block.html;

    case 'heading':
      if (block.dirty) {
        const id = block.anchor ? ` id="${block.anchor}"` : '';
        return `<h${block.level}${id}>${block.text}</h${block.level}>`;
      }
      return block.html;

    case 'figure':
      if (block.dirty) {
        return `<figure>\n  <img src="${block.src}" alt="${escapeHtml(block.alt)}" loading="lazy" />\n  <figcaption>${block.caption}</figcaption>\n</figure>`;
      }
      return block.html;

    case 'faqItem':
      if (block.dirty) {
        return `<div class="faq-item">\n  <h3>${block.question}</h3>\n  ${block.answer}\n</div>`;
      }
      return block.html;

    // Tables have no simplified form — the client edits their markup directly,
    // so the edited HTML *is* the block.
    case 'table':
      return block.html;

    case 'statBox':
    case 'ctaBox':
    case 'highlight':
    case 'authorBox':
    case 'toc':
      if (block.dirty) {
        const cls = { statBox: 'stat-box', ctaBox: 'cta-box', highlight: 'highlight-box', authorBox: 'author-box', toc: 'toc' }[block.type];
        return `<div class="${cls}">${block.inner}</div>`;
      }
      return block.html;

    case 'richtext':
    case 'html':
    default:
      return block.html;
  }
}

export function serializeBody({ blocks, wrapper }) {
  if (!wrapper) return blocks.map(blockToHtml).join('\n');

  const before = blocks.filter((b) => !b.inContainer && blocks.indexOf(b) < wrapper.at);
  const inside = blocks.filter((b) => b.inContainer);
  const after  = blocks.filter((b) => !b.inContainer && blocks.indexOf(b) >= wrapper.at);

  const parts = [];
  if (before.length) parts.push(before.map(blockToHtml).join('\n'));
  parts.push(`<${wrapper.tag}${wrapper.attrs}>\n${inside.map(blockToHtml).join('\n')}\n</${wrapper.tag}>`);
  if (after.length) parts.push(after.map(blockToHtml).join('\n'));
  return parts.join('\n');
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ── New blocks ───────────────────────────────────────────────────────────────

export function newBlock(type) {
  const base = { id: nextId(), type, dirty: true, inContainer: true };
  switch (type) {
    case 'heading':   return { ...base, level: 2, text: 'New section', anchor: '' };
    case 'statBox':   return { ...base, inner: '<strong>Key Stat:</strong> Add the number that makes the point. <em>(Source, year)</em>' };
    case 'ctaBox':    return { ...base, inner: '<h3>Ready to grow?</h3><p>Tell them what to do next.</p><a class="cta-btn" href="/contact">Book a free audit</a>' };
    case 'highlight': return { ...base, inner: '<p>The one thing a skim-reader should take away.</p>' };
    case 'faqItem':   return { ...base, question: 'A question people actually ask', answer: '<p>A direct answer in two or three sentences.</p>' };
    case 'figure':    return { ...base, src: '', alt: '', caption: '' };
    case 'tags':      return { ...base, tags: [] };
    case 'html':      return { ...base, html: '' };
    default:          return { ...base, type: 'richtext', html: '<p></p>' };
  }
}
