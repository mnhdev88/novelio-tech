import { useEffect, useState } from 'react';
import { Search, ExternalLink, RotateCcw } from 'lucide-react';
import * as api from '../api';
import useContentFile from '../useContentFile';
import { inputCls, SaveState, ErrorNote, Spinner, PageHeader } from '../ui';

export default function PagesSeoPage() {
  const overrides = useContentFile('content/seo/pages.json');
  const [routes, setRoutes] = useState(null);
  const [filter, setFilter] = useState('');
  const [open, setOpen] = useState(null);

  useEffect(() => {
    api.content.get('content/seo/routes.json')
      .then((r) => setRoutes(r.payload || []))
      .catch(() => setRoutes([]));
  }, []);

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

              {isOpen && (
                <div className="px-4 pb-4 space-y-3 bg-[#F8FAFC]">
                  <div>
                    <span className="block text-xs font-semibold text-[#475569] mb-1.5">Page title</span>
                    <input
                      value={o.title || ''} onChange={(e) => setRoute(path, { title: e.target.value })}
                      placeholder="Leave blank to keep the current title" className={inputCls}
                    />
                  </div>

                  <div>
                    <span className="block text-xs font-semibold text-[#475569] mb-1.5">
                      Description <span className="font-normal text-[#94a3b8]">({(o.description || '').length} characters — aim for under 155)</span>
                    </span>
                    <textarea
                      value={o.description || ''} rows={3}
                      onChange={(e) => setRoute(path, { description: e.target.value })}
                      placeholder="Leave blank to keep the current description" className={inputCls}
                    />
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <p className="text-[#1a0dab] leading-snug truncate">
                      {o.title ? `${o.title} | Novelio Technologies` : 'The page’s own title'}
                    </p>
                    <p className="text-[#006621] text-xs">https://www.noveliotech.com{path}</p>
                    <p className="text-[#545454] text-sm mt-0.5 line-clamp-2">
                      {o.description || 'The page’s own description'}
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
              )}
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
