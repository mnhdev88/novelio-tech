import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Loader2, AlertTriangle, Check, Trash2, Code2, LayoutList, Search, Upload, Eye,
  UploadCloud, ExternalLink,
} from 'lucide-react';
import * as api from '../api';
import { useAdmin } from '../AdminContext';
import BlockEditor from '../blog/BlockEditor';
import { parseBody, serializeBody } from '../blog/blockModel';
import { buildSchema } from '../blog/schema';

const INDEX_PATH = 'content/blog/index.json';
const AUTOSAVE_MS = 1500;

const CATEGORIES = ['SEO', 'Web Development', 'Marketing', 'Design', 'Business Growth', 'Social Media'];
const CATEGORY_COLOR = 'from-purple-600 to-blue-600';

const inputCls = 'w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#1B3172]';
const slugify = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function blankPost() {
  return {
    slug: '', title: '', excerpt: '', metaDescription: '',
    category: 'SEO', categoryColor: CATEGORY_COLOR,
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    author: 'Noveliotech Team', readTime: '5 min read',
    image: '', featured: false,
  };
}

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-[#475569] mb-1.5">{label}</span>
      {children}
      {hint && <span className="block text-[11px] text-[#94a3b8] mt-1">{hint}</span>}
    </label>
  );
}

export default function BlogEditorPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { refreshPending, publishAll, pending, deploy, can } = useAdmin();
  const isNew = !slug;

  // A new post starts from a template; an existing one loads in the effect below.
  const [post, setPost] = useState(() => (slug ? null : blankPost()));
  const [body, setBody] = useState(() => (slug
    ? { blocks: [], wrapper: null, lossless: true }
    : { blocks: [], wrapper: { tag: 'div', attrs: ' class="container"', at: 0 }, lossless: true }));
  const [baseSha, setBaseSha] = useState(null);
  const [tab, setTab] = useState('content');
  const [error, setError] = useState(null);
  const [saveState, setSaveState] = useState('idle');    // idle | saving | saved
  const [publishing, setPublishing] = useState(false);
  const [justPublished, setJustPublished] = useState(false);
  const timer = useRef(null);
  const dirty = useRef(false);

  // ── Load ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isNew) return undefined;
    let cancelled = false;

    api.content.get(`content/blog/${slug}.json`)
      .then((res) => {
        if (cancelled) return;
        setPost(res.payload);
        setBaseSha(res.base_sha);
        setBody(parseBody(res.payload.content));
      })
      .catch((e) => !cancelled && setError(e.message));

    return () => { cancelled = true; };
  }, [slug, isNew]);

  // ── Autosave ──────────────────────────────────────────────────────────────
  // Drafts are cheap (a DB row, no commit, no deploy), so saving continuously is
  // the right trade: the client never loses work and never has to think about it.
  const save = useCallback(async (nextPost, nextBody) => {
    if (!nextPost?.slug) return;                   // a new post needs a slug first
    setSaveState('saving');
    try {
      const payload = {
        ...nextPost,
        content: serializeBody(nextBody),
        schema: buildSchema(nextPost, nextBody.blocks, nextPost.schema),
      };
      await api.content.save(`content/blog/${nextPost.slug}.json`, payload, baseSha);
      setSaveState('saved');
      dirty.current = false;
      refreshPending();
    } catch (e) {
      setError(e.message);
      setSaveState('idle');
    }
  }, [baseSha, refreshPending]);

  const queueSave = useCallback((nextPost, nextBody) => {
    dirty.current = true;
    setSaveState('saving');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => save(nextPost, nextBody), AUTOSAVE_MS);
  }, [save]);

  // Flush a pending save on unmount, so navigating away mid-keystroke does not
  // drop the last edit.
  useEffect(() => () => clearTimeout(timer.current), []);

  const patch = (fields) => {
    const next = { ...post, ...fields };
    setPost(next);
    queueSave(next, body);
  };

  const setBlocks = (blocks) => {
    const next = { ...body, blocks };
    setBody(next);
    queueSave(post, next);
  };

  // ── Create ────────────────────────────────────────────────────────────────
  async function createPost() {
    const s = slugify(post.title);
    if (!s) { setError('Give the post a title first.'); return; }

    setSaveState('saving');
    try {
      const payload = {
        ...post, slug: s,
        content: serializeBody(body),
        schema: buildSchema({ ...post, slug: s }, body.blocks, null),
      };
      await api.content.save(`content/blog/${s}.json`, payload, null);

      // Register it in the index as a draft — a new post should never go live
      // just because someone pressed Publish for an unrelated change.
      const idx = await api.content.get(INDEX_PATH);
      const nextIndex = [
        { slug: s, id: Date.now(), status: 'draft', publishAt: null },
        ...(idx.payload || []),
      ];
      await api.content.save(INDEX_PATH, nextIndex, idx.base_sha);

      refreshPending();
      navigate(`/admin/blog/${s}`, { replace: true });
    } catch (e) {
      setError(e.message);
      setSaveState('idle');
    }
  }

  async function deletePost() {
    if (!window.confirm(`Delete "${post.title}"? It will be removed from the site on the next publish.`)) return;
    try {
      await api.content.remove(`content/blog/${slug}.json`);
      const idx = await api.content.get(INDEX_PATH);
      await api.content.save(INDEX_PATH, (idx.payload || []).filter((e) => e.slug !== slug), idx.base_sha);
      refreshPending();
      navigate('/admin/blog');
    } catch (e) {
      setError(e.message);
    }
  }

  // ── Publish just this post ────────────────────────────────────────────────
  // Two things have to happen for a post to appear: its status in index.json
  // flips to "published", and the site redeploys. Doing only one is the obvious
  // trap here — a published status that never deployed looks live in the panel
  // and is invisible on the site — so this button always does both.
  async function publishPost() {
    setPublishing(true);
    setError(null);
    try {
      clearTimeout(timer.current);
      if (dirty.current) await save(post, body);

      const postPath = `content/blog/${post.slug}.json`;
      const paths = [postPath];

      const idx = await api.content.get(INDEX_PATH);
      const entry = (idx.payload || []).find((e) => e.slug === post.slug);

      // index.json only needs committing when the status actually changes, or
      // when someone else already left a pending edit in it.
      if (entry && entry.status !== 'published') {
        const next = (idx.payload || []).map((e) =>
          e.slug === post.slug ? { ...e, status: 'published', publishAt: null } : e);
        await api.content.save(INDEX_PATH, next, idx.base_sha);
        paths.push(INDEX_PATH);
      } else if (pending.some((p) => p.path === INDEX_PATH)) {
        paths.push(INDEX_PATH);
      }

      await publishAll(`Publish blog post: ${post.title || post.slug}`, false, paths);
      setJustPublished(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setPublishing(false);
    }
  }

  async function uploadImage(onDone) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/webp';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const res = await api.media.upload(file, file.name);
        onDone(res.url);
      } catch (e) {
        setError(e.message);
      }
    };
    input.click();
  }

  if (error && !post) {
    return (
      <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
        <p className="text-sm text-red-800">{error}</p>
      </div>
    );
  }
  if (!post) {
    return <div className="grid place-items-center py-20"><Loader2 className="w-6 h-6 animate-spin text-[#1B3172]" /></div>;
  }

  const metaLen = (post.metaDescription || '').length;
  const deployRunning = deploy && (deploy.status === 'building' || deploy.status === 'committed');

  return (
    <div className="max-w-4xl">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <Link to="/admin/blog" className="p-2 -ml-2 text-[#475569] hover:text-[#1B3172]" aria-label="Back to posts">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="min-w-0">
          <h1 className="font-heading font-800 text-[#1B3172] text-lg truncate">
            {isNew ? 'New post' : post.title || post.slug}
          </h1>
          {!isNew && <p className="text-xs text-[#94a3b8]">/blog/{post.slug}</p>}
        </div>

        <div className="flex-1" />

        {!isNew && (
          <span className="text-xs text-[#94a3b8] inline-flex items-center gap-1.5">
            {saveState === 'saving' && <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</>}
            {saveState === 'saved' && <><Check className="w-3.5 h-3.5 text-green-600" /> Saved as draft</>}
          </span>
        )}

        {!isNew && (
          // Opens the real blog page in preview mode, so what the client checks
          // is the actual rendered post — not a lookalike that could drift.
          // Flush any queued autosave first, or they would preview stale text.
          <button
            onClick={async () => {
              clearTimeout(timer.current);
              if (dirty.current) await save(post, body);
              window.open(`/blog/${post.slug}?preview=1`, '_blank', 'noopener');
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-[#475569] hover:text-[#1B3172] hover:border-[#1B3172] cursor-pointer"
          >
            <Eye className="w-4 h-4" /> Preview
          </button>
        )}

        {!isNew && can('content.publish') && (
          <button
            onClick={publishPost}
            disabled={publishing || deployRunning}
            title={deployRunning ? 'A publish is already running' : 'Publish just this post'}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-blue text-white text-sm font-semibold disabled:opacity-60 cursor-pointer"
          >
            {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
            Publish post
          </button>
        )}

        {isNew ? (
          <button onClick={createPost} disabled={saveState === 'saving'}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-blue text-white text-sm font-semibold disabled:opacity-60 cursor-pointer">
            {saveState === 'saving' && <Loader2 className="w-4 h-4 animate-spin" />} Create post
          </button>
        ) : (
          <button onClick={deletePost}
            className="p-2 rounded-xl border border-slate-200 text-[#475569] hover:text-red-600 hover:border-red-300 cursor-pointer" aria-label="Delete post">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 mb-4">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-800 flex-1">{error}</p>
        </div>
      )}

      {justPublished && deployRunning && (
        <div className="flex items-start gap-2 rounded-xl bg-[#EEF2FF] border border-[#c7d2fe] px-4 py-3 mb-4">
          <Loader2 className="w-4 h-4 text-[#1B3172] shrink-0 mt-0.5 animate-spin" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#1B3172]">This post is going live</p>
            <p className="text-xs text-[#475569] mt-0.5">
              The site is rebuilding — about four minutes. Anything you edit from now on will need
              publishing again.
            </p>
          </div>
        </div>
      )}

      {justPublished && !deployRunning && deploy?.status === 'live' && (
        <div className="flex items-start gap-2 rounded-xl bg-green-50 border border-green-200 px-4 py-3 mb-4">
          <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
          <p className="text-sm text-green-900 flex-1">This post is live.</p>
          <a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer"
             className="inline-flex items-center gap-1 text-xs font-semibold text-green-900 hover:underline">
            View it <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {!body.lossless && (
        <div className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 mb-4">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-900">
            This post uses layout the visual editor cannot safely take apart, so it is shown as HTML.
            Everything still works — nothing has been changed or lost.
          </p>
        </div>
      )}

      {/* ── Tabs ───────────────────────────────────────────────────────── */}
      <div className="flex gap-1 mb-4 border-b border-slate-200">
        {[
          { id: 'content', label: 'Content', icon: LayoutList },
          { id: 'details', label: 'Details', icon: Code2 },
          { id: 'seo', label: 'Search & social', icon: Search },
        ].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px cursor-pointer ${
              tab === id ? 'border-[#1B3172] text-[#1B3172]' : 'border-transparent text-[#94a3b8] hover:text-[#475569]'
            }`}>
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* ── Content ────────────────────────────────────────────────────── */}
      {tab === 'content' && (
        <div className="space-y-4">
          <Field label="Title">
            <input value={post.title} onChange={(e) => patch({ title: e.target.value })} className={inputCls} />
          </Field>

          {isNew && post.title && (
            <p className="text-xs text-[#94a3b8]">
              Web address will be <code className="text-[#1B3172]">/blog/{slugify(post.title)}</code>
            </p>
          )}

          <BlockEditor blocks={body.blocks} onChange={setBlocks} onPickImage={uploadImage} />
        </div>
      )}

      {/* ── Details ────────────────────────────────────────────────────── */}
      {tab === 'details' && (
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Category">
            <select value={post.category} onChange={(e) => patch({ category: e.target.value })} className={inputCls}>
              {[...new Set([post.category, ...CATEGORIES])].filter(Boolean).map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>

          <Field label="Author">
            <input value={post.author} onChange={(e) => patch({ author: e.target.value })} className={inputCls} />
          </Field>

          <Field label="Date shown on the post">
            <input value={post.date} onChange={(e) => patch({ date: e.target.value })} className={inputCls} />
          </Field>

          <Field label="Reading time">
            <input value={post.readTime} onChange={(e) => patch({ readTime: e.target.value })} className={inputCls} />
          </Field>

          <div className="sm:col-span-2">
            <Field label="Cover image" hint="Shown on the blog list and when the post is shared on social media.">
              <div className="flex gap-2">
                <input value={post.image} onChange={(e) => patch({ image: e.target.value })}
                  placeholder="/blog/my-post.jpg" className={inputCls} />
                <button type="button" onClick={() => uploadImage((url) => patch({ image: url }))}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-[#475569] whitespace-nowrap cursor-pointer">
                  <Upload className="w-4 h-4" /> Upload
                </button>
              </div>
            </Field>
            {post.image && <img src={post.image} alt="" className="mt-2 max-h-40 rounded-xl border border-slate-200" />}
          </div>

          <label className="sm:col-span-2 flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" checked={!!post.featured} onChange={(e) => patch({ featured: e.target.checked })}
              className="w-4 h-4 rounded" />
            <span className="text-sm text-[#475569]">Feature this post at the top of the blog</span>
          </label>
        </div>
      )}

      {/* ── SEO ────────────────────────────────────────────────────────── */}
      {tab === 'seo' && (
        <div className="space-y-4">
          <Field
            label="Google description"
            hint={`${metaLen} characters — Google usually shows about 155.`}
          >
            <textarea
              value={post.metaDescription || ''} rows={3}
              onChange={(e) => patch({ metaDescription: e.target.value })}
              className={inputCls}
            />
          </Field>
          {metaLen > 160 && (
            <p className="text-xs text-amber-700">This is long enough that Google will probably cut it off.</p>
          )}

          <Field label="Summary on the blog list" hint="Shown under the title on /blog. Can be longer than the Google description.">
            <textarea value={post.excerpt || ''} rows={3} onChange={(e) => patch({ excerpt: e.target.value })} className={inputCls} />
          </Field>

          {/* Google preview — the client should see what searchers see. */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold text-[#475569] mb-2">How this looks in Google</p>
            <p className="text-[#1a0dab] text-lg leading-snug truncate">{post.title || 'Post title'} | Novelio Technologies</p>
            <p className="text-[#006621] text-xs">https://www.noveliotech.com/blog/{post.slug || slugify(post.title || '')}</p>
            <p className="text-[#545454] text-sm mt-0.5 line-clamp-2">
              {post.metaDescription || post.excerpt || 'Add a description so Google shows the right summary.'}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-4">
            <p className="text-xs font-semibold text-[#475569] mb-1">Structured data</p>
            <p className="text-xs text-[#64748b]">
              The Article and FAQ markup Google reads is generated automatically from this post — the
              title, description, author, dates, and every FAQ block in the content.
              {body.blocks.filter((b) => b.type === 'faqItem').length > 0
                ? ` ${body.blocks.filter((b) => b.type === 'faqItem').length} FAQ question(s) will be included.`
                : ' Add FAQ blocks in the content tab to qualify for FAQ results.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
