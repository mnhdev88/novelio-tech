import { useEffect, useState } from 'react';
import { Search, ExternalLink, RotateCcw } from 'lucide-react';
import * as api from '../api';
import useContentFile from '../useContentFile';
import { inputCls, SaveState, ErrorNote, Spinner, PageHeader } from '../ui';

// A page's real title and description live in that page's own component, not in
// content/ — so the panel had nothing to show and every field looked empty, as
// if the pages had no SEO at all. Rather than refactor 40 page components, read
// what the live page actually serves: the panel is same-origin with the site and
// every route is prerendered, so the <title> and description are right there in
// the HTML. This shows the client exactly what Google sees today.
const SUFFIX = ' | Novelio Technologies';

async function fetchLiveSeo(path) {
  const res = await fetch(path, { headers: { Accept: 'text/html' } });
  if (!res.ok) throw new Error('could not load page');
  const doc = new DOMParser().parseFromString(await res.text(), 'text/html');

  const raw = doc.querySelector('title')?.textContent || '';
  return {
    // The Title field holds the part BEFORE the site name, which the SEO
    // component appends — strip it so it matches what the client would type.
    title: raw.endsWith(SUFFIX) ? raw.slice(0, -SUFFIX.length) : raw,
    description: doc.querySelector('meta[name="description"]')?.getAttribute('content') || '',
  };
}

export default function PagesSeoPage() {
  const overrides = useContentFile('content/seo/pages.json');
  const [routes, setRoutes] = useState(null);
  const [filter, setFilter] = useState('');
  const [open, setOpen] = useState(null);
  const [live, setLive] = useState({});     // path -> { title, description } | 'error'

  useEffect(() => {
    api.content.get('content/seo/routes.json')
      .then((r) => setRoutes(r.payload || []))
      .catch(() => setRoutes([]));
  }, []);

  // Fetched per row as it opens — pulling all 55 pages up front would be a lot
  // of traffic for data most of which is never looked at.
  useEffect(() => {
    if (!open || live[open]) return;
    let cancelled = false;
    fetchLiveSeo(open)
      .then((v) => { if (!cancelled) setLive((l) => ({ ...l, [open]: v })); })
      .catch(() => { if (!cancelled) setLive((l) => ({ ...l, [open]: 'error' })); });
    return () => { cancelled = true; };
  }, [open, live]);

  if (!overrides.data || !routes) return <Spinner />;

  const data = overrides.data;
  const setRoute = (path, patch) => {
    const next = { ...data, [path]: { ...(data[path] || {}), ...patch } };
    // Drop an entry once every field is blank again, so the file stays a list of
    // real overrides rather than a pile of empty objects.
    if (Object.values(next[path]).every((v) => v === '' || v === undefined || v === false)) delete next[path];
    overrides.update(next);
  };

  const reset = (path) => {
    const next = { ...data };
    delete next[path];
    overrides.update(next);
  };

  const shown = routes.filter((r) => r.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Pages & SEO"
        subtitle="Change what Google shows for any page. Blank means the page keeps its built-in wording."
      >
        <SaveState state={overrides.state} />
      </PageHeader>

      <ErrorNote>{overrides.error}</ErrorNote>

      <div className="relative mb-4">
        <Search className="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={filter} onChange={(e) => setFilter(e.target.value)}
          placeholder="Find a page…" className={`${inputCls} pl-9`}
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {shown.map((path) => {
          const o = data[path] || {};
          const customised = Object.keys(o).length > 0;
          const isOpen = open === path;

          return (
            <div key={path} className="border-b border-slate-100 last:border-0">
              <button
                onClick={() => setOpen(isOpen ? null : path)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#F8FAFC] cursor-pointer"
              >
                <span className="font-mono text-sm text-[#1B3172] truncate">{path}</span>
                {customised && (
                  <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                    custom
                  </span>
                )}
                {o.noindex && (
                  <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">
                    hidden from google
                  </span>
                )}
                <div className="flex-1" />
                <span className="text-xs text-[#94a3b8]">{isOpen ? 'Close' : 'Edit'}</span>
              </button>

              {isOpen && (() => {
                const cur = live[path];
                const loading = !cur;
                const failed = cur === 'error';
                const curTitle = (loading || failed) ? '' : cur.title;
                const curDesc  = (loading || failed) ? '' : cur.description;

                // What the page shows right now: the override if one is set,
                // otherwise the wording built into the page itself.
                const shownTitle = o.title || curTitle;
                const shownDesc  = o.description || curDesc;

                return (
                <div className="px-4 pb-4 space-y-3 bg-[#F8FAFC]">
                  <div>
                    <span className="block text-xs font-semibold text-[#475569] mb-1.5">Page title</span>
                    <input
                      value={o.title || ''} onChange={(e) => setRoute(path, { title: e.target.value })}
                      placeholder={loading ? 'Loading the current title…' : (curTitle || 'Add a title')}
                      className={inputCls}
                    />
                    {!o.title && curTitle && (
                      <p className="text-[11px] text-[#94a3b8] mt-1">
                        Currently: &ldquo;{curTitle}&rdquo; — type here to replace it.
                      </p>
                    )}
                  </div>

                  <div>
                    <span className="block text-xs font-semibold text-[#475569] mb-1.5">
                      Description{' '}
                      <span className="font-normal text-[#94a3b8]">
                        ({(o.description || curDesc || '').length} characters — aim for under 155)
                      </span>
                    </span>
                    <textarea
                      value={o.description || ''} rows={3}
                      onChange={(e) => setRoute(path, { description: e.target.value })}
                      placeholder={loading ? 'Loading the current description…' : (curDesc || 'Add a description')}
                      className={inputCls}
                    />
                    {!o.description && curDesc && (
                      <p className="text-[11px] text-[#94a3b8] mt-1">Currently in use — type here to replace it.</p>
                    )}
                  </div>

                  {failed && (
                    <p className="text-[11px] text-amber-700">
                      Could not read this page&rsquo;s current wording. You can still set a new
                      title and description here.
                    </p>
                  )}

                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-[#94a3b8] mb-1.5">
                      How this looks in Google
                    </p>
                    <p className="text-[#1a0dab] leading-snug truncate">
                      {shownTitle ? `${shownTitle}${SUFFIX}` : 'The page’s own title'}
                    </p>
                    <p className="text-[#006621] text-xs">https://www.noveliotech.com{path}</p>
                    <p className="text-[#545454] text-sm mt-0.5 line-clamp-2">
                      {shownDesc || 'The page’s own description'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox" checked={!!o.noindex}
                        onChange={(e) => setRoute(path, { noindex: e.target.checked })}
                        className="w-4 h-4 rounded"
                      />
                      <span className="text-sm text-[#475569]">Hide this page from Google</span>
                    </label>

                    <div className="flex-1" />

                    <a href={path} target="_blank" rel="noreferrer"
                       className="inline-flex items-center gap-1 text-xs font-semibold text-[#475569] hover:text-[#1B3172]">
                      View page <ExternalLink className="w-3 h-3" />
                    </a>

                    {customised && (
                      <button onClick={() => reset(path)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#475569] hover:text-[#1B3172] cursor-pointer">
                        <RotateCcw className="w-3 h-3" /> Reset
                      </button>
                    )}
                  </div>
                </div>
                );
              })()}
            </div>
          );
        })}

        {shown.length === 0 && (
          <p className="px-4 py-6 text-sm text-[#94a3b8] text-center">No pages match “{filter}”.</p>
        )}
      </div>

      <p className="text-xs text-[#94a3b8] mt-3">
        Blog posts have their own search settings — edit them on the post itself.
      </p>
    </div>
  );
}
