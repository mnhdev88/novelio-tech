import { useState } from 'react';
import { AlertTriangle, CheckCircle2, ImageOff, XCircle } from 'lucide-react';

// Everything here is what the audited page itself declares. All of it is rendered
// as plain React text, and image URLs are limited to http(s) on the server and
// again below, because this is content from a stranger's website.

const STATUS = {
  pass: { label: 'Passed', colour: '#0A8547', Icon: CheckCircle2, iconClass: 'text-[#0A8547]' },
  warn: { label: 'Warnings', colour: '#F0A030', Icon: AlertTriangle, iconClass: 'text-[#B86E0A]' },
  fail: { label: 'Critical', colour: '#E02A2A', Icon: XCircle, iconClass: 'text-[#E02A2A]' },
};
const STATUS_ORDER = ['pass', 'warn', 'fail'];

// How each parameter relates to ranking. Kept deliberately conservative: where
// Google has said something is not a ranking factor (meta description, social
// tags, word count, the lang attribute), the note says so rather than overselling.
// Status colours stay reserved for pass/warn/fail, so these chips are navy and neutral.
const RANK = {
  gate:     { label: 'Decides if it can rank', cls: 'bg-[#F0D030] text-[#0D246A]' },
  direct:   { label: 'Ranking factor', cls: 'bg-[#0D246A] text-white' },
  indirect: { label: 'Indirect effect', cls: 'border border-[#0D246A] text-[#0D246A]' },
  none:     { label: 'Not a ranking factor', cls: 'bg-[#E8E7DF] text-[#3F4A6B]' },
};

const NOTES = {
  title: { rank: 'direct', affects: 'Rankings and clicks', text: 'Google reads the title to understand what the page is about, and it is the headline people click in search results.' },
  description: { rank: 'none', affects: 'Clicks', text: 'Google has said it does not use the description for ranking. It is the pitch under your link, so it changes how many searchers click.' },
  canonical: { rank: 'indirect', affects: 'Indexing', text: 'Tells Google which address is the main copy, so ranking signals from duplicate addresses are combined on one page instead of split.' },
  robots: { rank: 'gate', affects: 'Indexing', text: 'A "noindex" here removes the page from Google completely. With no tag, Google is allowed to index the page.' },
  viewport: { rank: 'indirect', affects: 'Mobile experience', text: 'Google ranks the mobile version of your page. Without this tag, phones show a shrunk desktop page that visitors leave.' },
  lang: { rank: 'none', affects: 'Accessibility and translation', text: 'Google works out the language from your visible text, not this tag. Screen readers and browser translation do rely on it.' },
  og: { rank: 'none', affects: 'Clicks from shared links', text: 'Search engines do not rank on these tags. They decide how your link looks when shared on social media and messaging apps, which drives visits.' },
  twitter: { rank: 'none', affects: 'Clicks from shared links on X', text: 'Not used for search ranking. They control how your link looks when someone posts it on X.' },
  schema: { rank: 'indirect', affects: 'Rich results and AI answers', text: 'Not a direct ranking factor. It can make your listing eligible for extra details such as prices, ratings or breadcrumbs, which earn more clicks, and it helps search engines and AI assistants understand your business.' },
  headings: { rank: 'indirect', affects: 'Relevance and readability', text: 'Headings help Google understand the topics on the page and help visitors scan it.' },
  words: { rank: 'indirect', affects: 'Relevance', text: 'Google does not rank on word count, but very thin pages rarely give it enough to rank on.' },
  alt: { rank: 'direct', affects: 'Image search and accessibility', text: 'Alt text is how Google understands images, so it affects image search rankings. Screen readers read it aloud to blind visitors.' },
  internal: { rank: 'direct', affects: 'Crawling and rankings', text: 'Links between your pages help Google find them and pass ranking strength to the pages you link to.' },
  external: { rank: 'none', affects: 'Visitor trust', text: 'Linking out does not directly raise rankings. It mainly affects how far readers trust the page.' },
  html: { rank: 'indirect', affects: 'Speed and crawling', text: 'Heavy HTML is slower to download, especially on mobile data. Google only reads the first 15 MB of a page.' },
  speed: { rank: 'direct', affects: 'Rankings (a small signal) and visitors', text: 'Core Web Vitals are a confirmed ranking signal, but a small one. Their bigger effect is on visitors: slow pages lose people before they load.' },
};

export function Note({ id }) {
  const n = NOTES[id];
  if (!n) return null;
  const r = RANK[n.rank];
  return (
    <div className="mt-2 text-[12.5px] leading-relaxed text-[#3F4A6B]">
      <span className={`inline-block text-[11px] font-600 px-2 py-px rounded-full mr-2 align-[1px] ${r.cls}`}>{r.label}</span>
      <span className="font-600 text-[#0D246A]">Affects: {n.affects}.</span> {n.text}
    </div>
  );
}

function RankKey() {
  const items = [
    ['gate', 'Can block the page from Google entirely'],
    ['direct', 'Google uses it when ranking pages'],
    ['indirect', 'Helps Google or visitors, which helps rankings'],
    ['none', 'Does not affect ranking, but affects clicks or visitors'],
  ];
  return (
    <div className="glass-card rounded-2xl p-4 sm:p-5">
      <div className="text-[13px] font-600 text-[#0D246A] mb-2.5">How to read the notes</div>
      <ul className="list-none p-0 m-0 grid sm:grid-cols-2 gap-x-6 gap-y-2">
        {items.map(([k, text]) => (
          <li key={k} className="text-[12.5px] text-[#3F4A6B] leading-relaxed">
            <span className={`inline-block text-[11px] font-600 px-2 py-px rounded-full mr-2 ${RANK[k].cls}`}>{RANK[k].label}</span>
            {text}
          </li>
        ))}
      </ul>
    </div>
  );
}

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
const safeImage = (u) => (typeof u === 'string' && /^https?:\/\//i.test(u) ? u : '');
const clip = (s, n) => (s && s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);

function Panel({ title, intro, children }) {
  return (
    <section className="glass-card rounded-2xl p-5 sm:p-6">
      <h4 className="font-heading font-700 text-[18px] sm:text-[20px] text-[#0D246A]">{title}</h4>
      {intro && <p className="text-[14px] text-[#5C6685] leading-relaxed mt-1">{intro}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

// ── Results chart ────────────────────────────────────────────────────────────

/** Checks by category. The counts stay visible, so colour is never the only signal. */
export function CheckBreakdown({ categories = [], passed = [], free = [], locked = [] }) {
  const rows = categories.map((c) => {
    const counts = { pass: 0, warn: 0, fail: 0 };
    passed.forEach((i) => { if (i.cat === c.key) counts.pass += 1; });
    [...free, ...locked].forEach((i) => {
      if (i.cat === c.key && counts[i.state] !== undefined) counts[i.state] += 1;
    });
    return { ...c, counts, total: counts.pass + counts.warn + counts.fail };
  }).filter((r) => r.total > 0);

  if (!rows.length) return null;

  return (
    <Panel title="How the checks came out" intro="Every check we ran on this page, by category.">
      <div className="flex flex-wrap gap-x-5 gap-y-1 mb-5">
        {STATUS_ORDER.map((s) => {
          const { Icon, label, iconClass } = STATUS[s];
          return (
            <span key={s} className="inline-flex items-center gap-1.5 text-[13px] text-[#3F4A6B]">
              <Icon className={`w-4 h-4 ${iconClass}`} aria-hidden="true" /> {label}
            </span>
          );
        })}
      </div>

      <div className="space-y-4">
        {rows.map((r) => {
          const summary = `${r.label}: ${r.counts.pass} passed, ${r.counts.warn} warnings, ${r.counts.fail} critical`;
          return (
            <div key={r.key} role="img" aria-label={summary}>
              <div className="flex items-baseline justify-between gap-3 mb-1.5">
                <span className="text-[14px] font-600 text-[#0D246A]">{r.label}</span>
                <span className="text-[13px] text-[#3F4A6B] whitespace-nowrap">
                  {r.counts.pass} passed · {r.counts.warn} warn · {r.counts.fail} critical
                </span>
              </div>
              <div className="flex gap-0.5 h-3">
                {STATUS_ORDER.filter((s) => r.counts[s] > 0).map((s) => (
                  <div
                    key={s}
                    title={`${STATUS[s].label}: ${r.counts[s]} of ${r.total}`}
                    className="first:rounded-l last:rounded-r"
                    style={{ flexGrow: r.counts[s], flexBasis: 0, background: STATUS[s].colour }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

// ── Meta tags and the Google preview ─────────────────────────────────────────

function LengthMeter({ length, idealMin, idealMax, okMin, okMax, scale }) {
  const verdict = length === 0 ? 'Missing'
    : length >= idealMin && length <= idealMax ? 'Good length'
      : length >= okMin && length <= okMax ? 'Acceptable'
        : length < okMin ? 'Too short' : 'Too long';
  // Matches the audit's own scoring: a wrong length is a warning, only missing is critical.
  const colour = verdict === 'Good length' ? '#0A8547' : verdict === 'Missing' ? '#E02A2A' : '#F0A030';
  const pct = (v) => `${Math.min(100, (v / scale) * 100)}%`;

  // Shows the verdict only. The target range is part of the fix, which is given on a call.
  return (
    <div className="mt-2">
      <div className="relative h-2 rounded bg-[#E8E7DF] overflow-hidden">
        <div className="absolute inset-y-0 left-0 rounded" style={{ width: pct(length), background: colour, opacity: 0.85 }} />
      </div>
      <div className="text-[12px] text-[#5C6685] mt-1">{length} characters · {verdict}</div>
    </div>
  );
}

function TagValue({ name, value, note, children }) {
  return (
    <div className="py-3.5 border-t border-[#0D246A]/10 first:border-t-0 first:pt-0">
      <div className="text-[12px] font-600 font-mono text-[#5C6685] mb-0.5">{name}</div>
      {value
        ? <div className="text-[14px] text-[#0D246A] break-words">{value}</div>
        : <div className="text-[14px] font-500 text-[#E02A2A]">Not set</div>}
      {children}
      {note && <Note id={note} />}
    </div>
  );
}

function SerpPreview({ meta, url, host }) {
  let crumb = host;
  try { crumb = new URL(url).href.replace(/^https?:\/\//, '').replace(/\/$/, '').replace(/\//g, ' › '); } catch { /* keep the host */ }

  return (
    <div className="rounded-xl border border-[#0D246A]/15 bg-white p-4 font-[Arial,sans-serif]">
      <div className="text-[12px] text-[#4D5156] truncate">{crumb}</div>
      <div className="text-[19px] leading-snug text-[#1A0DAB] mt-1 break-words">
        {clip(meta.title, 62) || <span className="italic text-[#70757A]">No title: Google will write its own</span>}
      </div>
      <div className="text-[14px] leading-snug text-[#4D5156] mt-1 break-words">
        {clip(meta.description, 160) || <span className="italic text-[#70757A]">No description: Google will pull text from the page</span>}
      </div>
    </div>
  );
}

// ── Social cards ─────────────────────────────────────────────────────────────

function CardImage({ src, className = '' }) {
  const url = safeImage(src);
  const [failedUrl, setFailedUrl] = useState('');

  if (!url || failedUrl === url) {
    return (
      <div className={`flex flex-col items-center justify-center gap-1 bg-[#E8E7DF] text-[#5C6685] text-[12px] ${className}`}>
        <ImageOff className="w-5 h-5" aria-hidden="true" />
        {url ? 'Image did not load' : 'No image set'}
      </div>
    );
  }

  return (
    <img
      src={url}
      alt=""
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailedUrl(url)}
      className={`object-cover bg-[#E8E7DF] ${className}`}
    />
  );
}

function OgCard({ og, fallback, host }) {
  return (
    <div className="rounded-lg overflow-hidden border border-[#0D246A]/15 bg-white">
      <CardImage src={og.image} className="w-full aspect-[1.91/1]" />
      <div className="p-3 bg-[#F2F3F5]">
        <div className="text-[11px] uppercase tracking-wide text-[#606770] truncate">{og.site_name || host}</div>
        <div className="text-[15px] font-600 text-[#1D2129] mt-0.5 line-clamp-2 break-words">{og.title || fallback.title || host}</div>
        <div className="text-[13px] text-[#606770] mt-0.5 line-clamp-2 break-words">{og.description || fallback.description}</div>
      </div>
    </div>
  );
}

function TwitterCard({ tw, og, fallback, host }) {
  const title = tw.title || og.title || fallback.title || host;
  const description = tw.description || og.description || fallback.description;
  const image = tw.image || og.image;

  if (tw.card === 'summary') {
    return (
      <div className="flex rounded-xl overflow-hidden border border-[#0D246A]/15 bg-white">
        <CardImage src={image} className="w-28 h-28 flex-shrink-0" />
        <div className="p-3 min-w-0">
          <div className="text-[13px] text-[#536471] truncate">{host}</div>
          <div className="text-[14px] text-[#0F1419] mt-0.5 line-clamp-1">{title}</div>
          <div className="text-[13px] text-[#536471] mt-0.5 line-clamp-2">{description}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl overflow-hidden border border-[#0D246A]/15 bg-white">
      <CardImage src={image} className="w-full aspect-[1.91/1]" />
      <div className="p-3">
        <div className="text-[13px] text-[#536471] truncate">{host}</div>
        <div className="text-[15px] text-[#0F1419] mt-0.5 line-clamp-1 break-words">{title}</div>
        <div className="text-[13px] text-[#536471] mt-0.5 line-clamp-2 break-words">{description}</div>
      </div>
    </div>
  );
}

function TagList({ tags }) {
  return (
    <ul className="list-none p-0 m-0 mt-4 space-y-1.5">
      {tags.map(([name, value, note]) => (
        <li key={name} className="flex items-start gap-2 text-[13px]">
          {value
            ? <CheckCircle2 className="w-4 h-4 text-[#0A8547] flex-shrink-0 mt-px" aria-hidden="true" />
            : <XCircle className="w-4 h-4 text-[#E02A2A] flex-shrink-0 mt-px" aria-hidden="true" />}
          <span className="min-w-0">
            <span className="font-mono text-[#2B3557]">{name}</span>
            {' '}
            <span className="text-[#5C6685]">{value ? 'set' : (note || 'missing')}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

// ── Schema ───────────────────────────────────────────────────────────────────

function SchemaPanel({ schema }) {
  const blocks = schema?.blocks || [];
  const microdata = schema?.microdata || [];
  const invalid = schema?.invalid || 0;

  return (
    <Panel
      title="Structured data (schema)"
      intro="The labels that tell Google and AI assistants what your business and this page are."
    >
      {blocks.length === 0 && microdata.length === 0 && invalid === 0 && (
        <p className="text-[14px] font-500 text-[#E02A2A]">No structured data found on this page.</p>
      )}

      {invalid > 0 && (
        <p className="flex items-start gap-2 text-[14px] text-[#2B3557] mb-4">
          <XCircle className="w-4 h-4 text-[#E02A2A] flex-shrink-0 mt-0.5" aria-hidden="true" />
          {plural(invalid, 'block')} of JSON-LD could not be read. Search engines cannot read broken markup either.
        </p>
      )}

      <div className="space-y-3">
        {blocks.map((block, i) => (
          <div key={i} className="rounded-xl border border-[#0D246A]/15 p-4">
            <ul className="list-none p-0 m-0 space-y-2">
              {block.entities.map((e, j) => (
                <li key={j} className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5 text-[14px]">
                  <span className="font-heading font-700 text-[#0D246A]">{e.type || 'Untyped'}</span>
                  {e.name && <span className="text-[#3F4A6B] break-words min-w-0">{e.name}</span>}
                  <span className="text-[12px] text-[#5C6685]">{plural(e.fields, 'field')}</span>
                </li>
              ))}
            </ul>
            <details className="mt-3">
              <summary className="text-[13px] font-600 text-[#1376B4] cursor-pointer">View the code</summary>
              <pre className="mt-2 max-h-72 overflow-auto rounded-lg bg-[#081648] text-[#E8E7DF] text-[12px] leading-relaxed p-3 whitespace-pre-wrap break-words">
                {block.json}{block.truncated ? '\n…' : ''}
              </pre>
            </details>
          </div>
        ))}
      </div>

      {microdata.length > 0 && (
        <p className="text-[14px] text-[#3F4A6B] mt-3">
          <span className="font-600 text-[#0D246A]">Microdata:</span> {microdata.join(', ')}
        </p>
      )}

      <div className="mt-4"><Note id="schema" /></div>
    </Panel>
  );
}

// ── Page structure ───────────────────────────────────────────────────────────

function StructurePanel({ headings, outline, stats }) {
  const levels = Object.entries(headings || {});
  const max = Math.max(1, ...levels.map(([, n]) => n));
  const altPct = stats.images ? Math.round((stats.images_alt / stats.images) * 100) : null;

  const tiles = [
    ['Words', stats.words.toLocaleString(), 'words'],
    ['Images with alt text', stats.images ? `${stats.images_alt} of ${stats.images} (${altPct}%)` : 'No images', 'alt'],
    ['Internal links', stats.links_internal, 'internal'],
    ['External links', stats.links_external, 'external'],
    ['HTML size', `${stats.html_kb} KB`, 'html'],
  ];

  return (
    <Panel title="Page structure" intro="How the page is organised, as a search engine reads it.">
      <div className="grid sm:grid-cols-2 gap-x-8 gap-y-5 mb-8">
        {tiles.map(([label, value, note]) => (
          <div key={label}>
            <div className="flex items-baseline gap-2">
              <span className="font-heading font-700 text-[18px] text-[#0D246A] leading-tight">{value}</span>
              <span className="text-[13px] text-[#5C6685]">{label}</span>
            </div>
            <Note id={note} />
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-[1fr_1.6fr] gap-7">
        <div>
          <div className="text-[13px] font-600 text-[#0D246A] mb-2.5">Headings by level</div>
          <div className="space-y-1.5">
            {levels.map(([level, n]) => (
              <div key={level} className="flex items-center gap-2.5" title={`${level.toUpperCase()}: ${n}`}>
                <span className="w-6 text-[12px] font-mono text-[#5C6685] uppercase">{level}</span>
                <div className="flex-1 h-3">
                  {n > 0 && <div className="h-full rounded-r bg-[#1376B4]" style={{ width: `${(n / max) * 100}%` }} />}
                </div>
                <span className="w-6 text-right text-[13px] font-600 text-[#0D246A]">{n}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="min-w-0">
          <div className="text-[13px] font-600 text-[#0D246A] mb-2.5">Heading outline</div>
          {outline?.length > 0 ? (
            <ul className="list-none p-0 m-0 space-y-1.5 text-[13.5px]">
              {outline.map((h, i) => (
                <li key={i} className="flex gap-2" style={{ paddingLeft: (h.level - 1) * 14 }}>
                  <span className="font-mono text-[11.5px] text-[#5C6685] mt-0.5 flex-shrink-0">H{h.level}</span>
                  <span className={`min-w-0 break-words ${h.level === 1 ? 'font-600 text-[#0D246A]' : 'text-[#3F4A6B]'}`}>{h.text}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[14px] font-500 text-[#E02A2A]">No headings found on this page.</p>
          )}
        </div>
      </div>

      <div className="mt-5"><Note id="headings" /></div>
    </Panel>
  );
}

// ── The section ──────────────────────────────────────────────────────────────

export default function PageSnapshot({ snapshot, url, host }) {
  if (!snapshot) return null;
  const { meta, og, twitter, schema, headings, outline, stats } = snapshot;
  const fallback = { title: meta.title, description: meta.description };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-heading font-700 text-[#0D246A] text-[20px] sm:text-[23px] mb-1">
          What your page tells the world
        </h3>
        <p className="text-[14.5px] text-[#5C6685]">
          Read directly from your page&rsquo;s code, as Google and social networks see it. Each item
          notes whether it affects your Google ranking, and how.
        </p>
      </div>

      <RankKey />

      <Panel title="Google preview and meta tags" intro="An approximate preview. Google can choose to rewrite both lines.">
        <SerpPreview meta={meta} url={url} host={host} />
        <div className="mt-5">
          <TagValue name="title" value={meta.title} note="title">
            <LengthMeter length={meta.title.length} idealMin={50} idealMax={60} okMin={30} okMax={65} scale={80} />
          </TagValue>
          <TagValue name="meta description" value={meta.description} note="description">
            <LengthMeter length={meta.description.length} idealMin={140} idealMax={155} okMin={70} okMax={165} scale={200} />
          </TagValue>
          <TagValue name="canonical" value={meta.canonical} note="canonical" />
          <TagValue name="meta robots" value={meta.robots || 'Not set, so Google can index this page by default'} note="robots" />
          <TagValue name="viewport" value={meta.viewport} note="viewport" />
          <TagValue name="html lang" value={meta.lang} note="lang" />
        </div>
      </Panel>

      <div className="grid md:grid-cols-2 gap-5">
        <Panel title="Open Graph card" intro="How a shared link can look on Facebook, LinkedIn and WhatsApp.">
          <OgCard og={og} fallback={fallback} host={host} />
          <TagList tags={[
            ['og:title', og.title], ['og:description', og.description], ['og:image', og.image],
            ['og:url', og.url], ['og:type', og.type], ['og:site_name', og.site_name],
          ]} />
          <Note id="og" />
        </Panel>

        <Panel title="Twitter / X card" intro="How a shared link can look on X. Missing tags fall back to Open Graph.">
          <TwitterCard tw={twitter} og={og} fallback={fallback} host={host} />
          <TagList tags={[
            ['twitter:card', twitter.card, 'missing, so X may not show a large preview'],
            ['twitter:title', twitter.title, og.title ? 'missing, using og:title' : 'missing'],
            ['twitter:description', twitter.description, og.description ? 'missing, using og:description' : 'missing'],
            ['twitter:image', twitter.image, og.image ? 'missing, using og:image' : 'missing'],
            ['twitter:site', twitter.site],
          ]} />
          <Note id="twitter" />
        </Panel>
      </div>

      <SchemaPanel schema={schema} />
      <StructurePanel headings={headings} outline={outline} stats={stats} />
    </div>
  );
}
