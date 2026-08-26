// The post body editor: an ordered list of blocks, each with the right form for
// what it actually is. See blockModel.js for why the body is not one WYSIWYG.

import { useState } from 'react';
import {
  ChevronUp, ChevronDown, Trash2, Plus, Code2, Type, Hash, Quote,
  Megaphone, HelpCircle, Image as ImageIcon, ListTree, Tag, User, Table2,
} from 'lucide-react';
import RichText from './RichText';
import { BLOCK_LABELS, newBlock } from './blockModel';

const ICONS = {
  richtext: Type, heading: Hash, statBox: Quote, ctaBox: Megaphone,
  highlight: Quote, authorBox: User, faqItem: HelpCircle, toc: ListTree,
  tags: Tag, table: Table2, figure: ImageIcon, hero: Type, html: Code2,
};

// What the client can add. Hero/toc/tags/author are one-per-post structural
// pieces that already exist in every post, so they are not in the palette.
const ADDABLE = ['richtext', 'heading', 'statBox', 'highlight', 'ctaBox', 'faqItem', 'figure', 'html'];

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-[#475569] mb-1.5">{label}</span>
      {children}
    </label>
  );
}

const inputCls = 'w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#1B3172]';

function BlockBody({ block, update, onPickImage }) {
  const set = (patch) => update({ ...block, ...patch, dirty: true });

  switch (block.type) {
    case 'richtext':
      return <RichText html={block.html} onChange={(html) => set({ html })} />;

    case 'heading':
      return (
        <div className="grid sm:grid-cols-[100px_1fr] gap-3">
          <Field label="Size">
            <select value={block.level} onChange={(e) => set({ level: Number(e.target.value) })} className={inputCls}>
              <option value={2}>Section</option>
              <option value={3}>Sub-section</option>
              <option value={4}>Minor</option>
            </select>
          </Field>
          <Field label="Heading text">
            <input value={stripTags(block.text)} onChange={(e) => set({ text: e.target.value })} className={inputCls} />
          </Field>
          {block.anchor && (
            <p className="sm:col-span-2 text-[11px] text-[#94a3b8]">
              Links to this heading use <code>#{block.anchor}</code> — renaming the text is safe, the link keeps working.
            </p>
          )}
        </div>
      );

    case 'faqItem':
      return (
        <div className="space-y-3">
          <Field label="Question">
            <input value={stripTags(block.question)} onChange={(e) => set({ question: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Answer">
            <RichText html={block.answer} onChange={(answer) => set({ answer })} />
          </Field>
          <p className="text-[11px] text-[#94a3b8]">
            FAQ blocks also feed the page&rsquo;s Google FAQ markup, so keep questions phrased the way people search.
          </p>
        </div>
      );

    case 'figure':
      return (
        <div className="space-y-3">
          {block.src && (
            <img src={block.src} alt="" className="max-h-48 rounded-xl border border-slate-200" />
          )}
          <div className="flex gap-2">
            <input value={block.src} onChange={(e) => set({ src: e.target.value })} placeholder="/blog/image.jpg" className={inputCls} />
            <button type="button" onClick={() => onPickImage((url) => set({ src: url }))}
              className="px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-[#475569] whitespace-nowrap cursor-pointer">
              Choose
            </button>
          </div>
          <Field label="Alt text (describes the image for screen readers and Google)">
            <input value={block.alt} onChange={(e) => set({ alt: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Caption">
            <input value={stripTags(block.caption)} onChange={(e) => set({ caption: e.target.value })} className={inputCls} />
          </Field>
        </div>
      );

    case 'tags':
      return (
        <Field label="Keywords (comma separated)">
          <input
            value={(block.tags || []).join(', ')}
            onChange={(e) => set({ tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })}
            className={inputCls}
          />
        </Field>
      );

    case 'toc':
      return (
        <p className="text-sm text-[#64748b]">
          The table of contents links to the sections below. Edit it as HTML if you add or rename sections.
        </p>
      );

    case 'statBox':
    case 'ctaBox':
    case 'highlight':
    case 'authorBox':
      return <RichText html={block.inner} onChange={(inner) => set({ inner })} />;

    case 'hero':
      return (
        <div className="space-y-3">
          <Field label="Title (this is the big heading on the post)">
            <input value={stripTags(block.title)} onChange={(e) => set({ title: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Byline">
            <input value={stripTags(block.meta)} onChange={(e) => set({ meta: e.target.value })} className={inputCls} />
          </Field>
        </div>
      );

    case 'table':
    case 'html':
    default:
      return (
        <div>
          <textarea
            value={block.html || ''}
            onChange={(e) => set({ html: e.target.value })}
            rows={8}
            spellCheck={false}
            className={`${inputCls} font-mono text-xs leading-relaxed`}
          />
          <p className="text-[11px] text-[#94a3b8] mt-1.5">
            Raw HTML. It is rendered exactly as written — a broken tag here breaks the page layout.
          </p>
        </div>
      );
  }
}

function AddBar({ at, open, onOpen, onPick }) {
  return (
    <div className="relative py-1">
      {open ? (
        <div className="flex flex-wrap gap-1.5 p-2 rounded-xl border border-[#1B3172] bg-white">
          {ADDABLE.map((type) => {
            const Icon = ICONS[type] || Type;
            return (
              <button key={type} type="button" onClick={() => onPick(at, type)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#475569] hover:bg-[#EEF2FF] hover:text-[#1B3172] cursor-pointer">
                <Icon className="w-3.5 h-3.5" /> {BLOCK_LABELS[type]}
              </button>
            );
          })}
          <button type="button" onClick={() => onOpen(null)}
            className="px-2.5 py-1.5 text-xs text-[#94a3b8] cursor-pointer">Cancel</button>
        </div>
      ) : (
        <button
          type="button" onClick={() => onOpen(at)}
          className="group w-full flex items-center gap-2 py-1 cursor-pointer"
          aria-label="Add a block here"
        >
          <span className="flex-1 h-px bg-slate-200 group-hover:bg-[#1B3172] transition-colors" />
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#94a3b8] group-hover:text-[#1B3172]">
            <Plus className="w-3 h-3" /> Add
          </span>
          <span className="flex-1 h-px bg-slate-200 group-hover:bg-[#1B3172] transition-colors" />
        </button>
      )}
    </div>
  );
}

export default function BlockEditor({ blocks, onChange, onPickImage }) {
  const [adding, setAdding] = useState(null);   // index to insert at

  const update = (i, block) => onChange(blocks.map((b, j) => (j === i ? block : b)));

  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= blocks.length) return;
    const next = [...blocks];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  const remove = (i) => {
    if (!window.confirm(`Delete this ${BLOCK_LABELS[blocks[i].type] || 'block'}? This cannot be undone.`)) return;
    onChange(blocks.filter((_, j) => j !== i));
  };

  const insert = (at, type) => {
    const next = [...blocks];
    // New blocks inherit the container flag from their neighbour, or the body
    // wrapper would end up with content outside it.
    const neighbour = blocks[at - 1] || blocks[at];
    next.splice(at, 0, { ...newBlock(type), inContainer: neighbour ? !!neighbour.inContainer : true });
    onChange(next);
    setAdding(null);
  };

  const addBar = (at) => (
    <AddBar at={at} open={adding === at} onOpen={setAdding} onPick={insert} />
  );

  return (
    <div>
      {addBar(0)}
      {blocks.map((block, i) => {
        const Icon = ICONS[block.type] || Type;
        return (
          <div key={block.id}>
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100 bg-[#F8FAFC]">
                <Icon className="w-3.5 h-3.5 text-[#64748b] shrink-0" />
                <span className="text-xs font-semibold text-[#475569]">{BLOCK_LABELS[block.type] || block.type}</span>
                <div className="flex-1" />
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0}
                  className="p-1 rounded text-[#94a3b8] hover:text-[#1B3172] disabled:opacity-30 cursor-pointer" aria-label="Move up">
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === blocks.length - 1}
                  className="p-1 rounded text-[#94a3b8] hover:text-[#1B3172] disabled:opacity-30 cursor-pointer" aria-label="Move down">
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => remove(i)}
                  className="p-1 rounded text-[#94a3b8] hover:text-red-600 cursor-pointer" aria-label="Delete block">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="p-3">
                <BlockBody block={block} update={(b) => update(i, b)} onPickImage={onPickImage} />
              </div>
            </div>
            {addBar(i + 1)}
          </div>
        );
      })}
    </div>
  );
}

/** Headings and captions are plain text in the UI even though they hold inline HTML. */
function stripTags(html) {
  return String(html || '').replace(/<[^>]*>/g, '');
}
