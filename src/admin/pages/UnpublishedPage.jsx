import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  UploadCloud, Check, AlertTriangle, Loader2, ExternalLink, FileText, Trash2, Clock,
} from 'lucide-react';
import { useAdmin } from '../AdminContext';
import { ApiError } from '../api';
import { inputCls, PageHeader } from '../ui';

// content/blog/my-post.json -> "Blog post: my-post". The client should not have
// to read file paths to know what they are about to publish.
function describe(path) {
  const p = String(path).replace(/^content\//, '').replace(/\.json$/, '');
  if (p === 'blog/index') return { area: 'Blog', label: 'Post order and publish status' };
  if (p.startsWith('blog/')) return { area: 'Blog', label: p.slice(5) };
  if (p.startsWith('seo/')) return { area: 'Pages & SEO', label: 'Page titles and descriptions' };
  const KNOWN = {
    homepage: ['Home page', 'Section copy'],
    settings: ['Contact details', 'Phone, email, address and socials'],
    navigation: ['Header & footer', 'Menu and footer links'],
    pricing: ['Pricing', 'Plans and add-ons'],
    testimonials: ['Testimonials', 'Customer reviews'],
    services: ['Services', 'Service list'],
    industries: ['Industries', 'Industry list'],
    process: ['Process', 'Process steps'],
    stats: ['Home page', 'Headline numbers'],
    team: ['About', 'Team members'],
  };
  const hit = KNOWN[p];
  return hit ? { area: hit[0], label: hit[1] } : { area: 'Content', label: p };
}

export default function UnpublishedPage() {
  const { pending, deploy, publishAll, refreshPending, can } = useAdmin();
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [conflict, setConflict] = useState(null);

  const count = pending.length;
  const building = deploy && (deploy.status === 'building' || deploy.status === 'committed');

  async function run(force = false) {
    setBusy(true);
    setError(null);
    try {
      await publishAll(note.trim(), force);
      setNote('');
      setConflict(null);
    } catch (e) {
      if (e instanceof ApiError && e.code === 'conflict') setConflict(e.message);
      else setError(e.message);
      refreshPending();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Unpublished changes"
        subtitle="Everything you have edited that is not on the live site yet."
      />

      {/* ── Deploy running ──────────────────────────────────────────────── */}
      {building && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-4">
          <div className="flex items-center gap-3 mb-2">
            <Loader2 className="w-4 h-4 text-[#1B3172] animate-spin shrink-0" />
            <p className="font-heading font-800 text-[#1B3172]">Publishing to the live site</p>
          </div>
          <p className="text-sm text-[#64748b]">
            The whole site is being rebuilt so every page stays fast and visible to Google. This
            takes about four minutes. You can keep editing — anything you change now goes out with
            the next publish.
          </p>
          {deploy.run_url && (
            <a href={deploy.run_url} target="_blank" rel="noreferrer"
               className="inline-flex items-center gap-1 text-xs font-semibold text-[#1B3172] mt-3 hover:underline">
              Watch the build <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      )}

      {/* ── Last deploy failed ──────────────────────────────────────────── */}
      {!building && deploy?.status === 'failed' && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 mb-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-900">The last publish did not finish</p>
              <p className="text-xs text-amber-800 mt-0.5">
                Your changes are saved and committed — it was the site build that failed, so the
                live site still shows the previous version.
              </p>
              {deploy.run_url && (
                <a href={deploy.run_url} target="_blank" rel="noreferrer"
                   className="inline-flex items-center gap-1 text-xs font-semibold text-amber-900 mt-2 hover:underline">
                  See what went wrong <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Nothing waiting ─────────────────────────────────────────────── */}
      {count === 0 && !building ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
          <div className="w-11 h-11 rounded-full bg-green-50 grid place-items-center mx-auto mb-3">
            <Check className="w-5 h-5 text-green-600" />
          </div>
          <p className="font-heading font-800 text-[#1B3172] mb-1">Everything is published</p>
          <p className="text-sm text-[#64748b]">
            The live site matches what is in the panel.
          </p>
          {deploy?.created_at && (
            <p className="text-xs text-[#94a3b8] mt-2 inline-flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              Last published {new Date(deploy.created_at).toLocaleString(undefined, {
                dateStyle: 'medium', timeStyle: 'short',
              })}
            </p>
          )}
          <div className="mt-5">
            <Link to="/admin/blog/new"
              className="text-sm font-semibold text-[#1B3172] hover:underline">
              Write a new blog post
            </Link>
          </div>
        </div>
      ) : count > 0 && (
        <>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-4">
            {pending.map((p) => {
              const { area, label } = describe(p.path);
              return (
                <div key={p.path} className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 last:border-0">
                  <div className={`w-8 h-8 rounded-lg grid place-items-center shrink-0 ${
                    p.deleted ? 'bg-red-50 text-red-600' : 'bg-[#EEF2FF] text-[#1B3172]'
                  }`}>
                    {p.deleted ? <Trash2 className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#1B3172] truncate">
                      {area}
                      <span className="font-normal text-[#64748b]"> — {label}</span>
                    </p>
                    <p className="text-xs text-[#94a3b8]">
                      {p.deleted ? 'Will be removed from the site' : 'Edited'}
                      {p.updated_by_name && ` by ${p.updated_by_name}`}
                      {p.updated_at && ` · ${new Date(p.updated_at).toLocaleString(undefined, {
                        dateStyle: 'medium', timeStyle: 'short',
                      })}`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {can('content.publish') && !building && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <label className="block mb-3">
                <span className="block text-xs font-semibold text-[#475569] mb-1.5">
                  What changed? <span className="font-normal text-[#94a3b8]">(optional)</span>
                </span>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={120}
                  placeholder="e.g. New blog post and updated phone number"
                  className={inputCls}
                />
                <span className="block text-[11px] text-[#94a3b8] mt-1">
                  Saved with this publish so you can tell versions apart later.
                </span>
              </label>

              <button
                onClick={() => run(false)}
                disabled={busy}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-blue text-white text-sm font-semibold disabled:opacity-60 cursor-pointer"
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                Publish {count} change{count === 1 ? '' : 's'} to the live site
              </button>

              <p className="text-xs text-[#94a3b8] mt-3">
                Everything above goes out together, and the site rebuilds — about four minutes.
              </p>
            </div>
          )}

          {!can('content.publish') && (
            <p className="text-sm text-[#64748b]">
              Your account can edit but not publish. Ask an admin to publish these changes.
            </p>
          )}
        </>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 mt-4">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {conflict && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 mt-4">
          <div className="flex items-start gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-900 flex-1">{conflict}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-xs font-semibold text-amber-900 cursor-pointer"
            >
              Reload and review
            </button>
            <button
              onClick={() => run(true)}
              disabled={busy}
              className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-semibold disabled:opacity-60 cursor-pointer"
            >
              Overwrite with my version
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
