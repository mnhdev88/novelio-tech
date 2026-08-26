import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, Loader2, AlertTriangle, Star, ChevronUp, ChevronDown, ExternalLink } from 'lucide-react';
import * as api from '../api';
import { useAdmin } from '../AdminContext';

const INDEX_PATH = 'content/blog/index.json';

const STATUS_STYLE = {
  published: 'bg-green-100 text-green-700',
  draft:     'bg-slate-100 text-slate-600',
  scheduled: 'bg-amber-100 text-amber-700',
};

export default function BlogListPage() {
  const { refreshPending } = useAdmin();
  const [index, setIndex] = useState(null);
  const [baseSha, setBaseSha] = useState(null);
  const [posts, setPosts] = useState({});
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.content.get(INDEX_PATH);
      setIndex(res.payload || []);
      setBaseSha(res.base_sha);

      // Titles and dates live in the post files, not the index; fetch them so
      // the list is readable rather than a column of slugs.
      const entries = await Promise.all(
        (res.payload || []).map(async (e) => {
          try {
            const p = await api.content.get(`content/blog/${e.slug}.json`);
            return [e.slug, p.payload];
          } catch {
            return [e.slug, null];   // listed but missing — surfaced in the row
          }
        })
      );
      setPosts(Object.fromEntries(entries));
    } catch (e) {
      setError(e.message);
    }
  }, []);

  // `load` performs no synchronous setState — every update happens after an
  // await — so this cannot cause the cascading render the rule guards against.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  const persist = async (next) => {
    setIndex(next);
    setSaving(true);
    try {
      await api.content.save(INDEX_PATH, next, baseSha);
      refreshPending();
    } catch (e) {
      setError(e.message);
      load();                       // put the UI back to the server's truth
    } finally {
      setSaving(false);
    }
  };

  const setStatus = (slug, status) =>
    persist(index.map((e) => (e.slug === slug ? { ...e, status } : e)));

  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= index.length) return;
    const next = [...index];
    [next[i], next[j]] = [next[j], next[i]];
    persist(next);
  };

  if (error && !index) {
    return (
      <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
        <p className="text-sm text-red-800">{error}</p>
      </div>
    );
  }

  if (!index) {
    return <div className="grid place-items-center py-20"><Loader2 className="w-6 h-6 animate-spin text-[#1B3172]" /></div>;
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div>
          <h1 className="font-heading font-800 text-[#1B3172] text-xl">Blog</h1>
          <p className="text-sm text-[#64748b]">
            {index.length} post{index.length === 1 ? '' : 's'} — the order here is the order on the site.
          </p>
        </div>
        <div className="flex-1" />
        {saving && <Loader2 className="w-4 h-4 animate-spin text-[#94a3b8]" />}
        <Link
          to="/admin/blog/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-blue text-white text-sm font-semibold"
        >
          <Plus className="w-4 h-4" /> New post
        </Link>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 mb-4">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {index.map((entry, i) => {
          const post = posts[entry.slug];
          return (
            <div key={entry.slug} className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 last:border-0">
              <div className="flex flex-col">
                <button onClick={() => move(i, -1)} disabled={i === 0}
                  className="p-0.5 text-[#cbd5e1] hover:text-[#1B3172] disabled:opacity-30 cursor-pointer" aria-label="Move up">
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button onClick={() => move(i, 1)} disabled={i === index.length - 1}
                  className="p-0.5 text-[#cbd5e1] hover:text-[#1B3172] disabled:opacity-30 cursor-pointer" aria-label="Move down">
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {post?.image ? (
                <img src={post.image} alt="" className="w-14 h-10 object-cover rounded-lg border border-slate-200 shrink-0" />
              ) : (
                <div className="w-14 h-10 rounded-lg bg-slate-100 grid place-items-center shrink-0">
                  <FileText className="w-4 h-4 text-slate-400" />
                </div>
              )}

              <div className="min-w-0 flex-1">
                <Link to={`/admin/blog/${entry.slug}`} className="block font-semibold text-sm text-[#1B3172] truncate hover:underline">
                  {post ? post.title : entry.slug}
                  {post?.featured && <Star className="inline w-3.5 h-3.5 ml-1.5 text-amber-500 fill-amber-500" />}
                </Link>
                <p className="text-xs text-[#94a3b8] truncate">
                  {post ? `${post.category} · ${post.date} · ${post.readTime}` : 'This post file is missing'}
                </p>
              </div>

              <select
                value={entry.status}
                onChange={(e) => setStatus(entry.slug, e.target.value)}
                className={`text-xs font-semibold rounded-lg px-2 py-1 border-0 cursor-pointer ${STATUS_STYLE[entry.status] || ''}`}
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
              </select>

              {entry.status === 'scheduled' && (
                <input
                  type="date"
                  value={entry.publishAt ? String(entry.publishAt).slice(0, 10) : ''}
                  onChange={(e) => persist(index.map((x) => (x.slug === entry.slug ? { ...x, publishAt: e.target.value } : x)))}
                  className="text-xs rounded-lg border border-slate-200 px-2 py-1"
                />
              )}

              {entry.status === 'published' && (
                <a href={`/blog/${entry.slug}`} target="_blank" rel="noreferrer"
                   className="p-1.5 text-[#94a3b8] hover:text-[#1B3172]" aria-label="View on the site">
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-[#94a3b8] mt-3">
        Drafts and future-dated posts are left out of the site and the sitemap entirely — they only
        appear once published and the site has rebuilt.
      </p>
    </div>
  );
}
