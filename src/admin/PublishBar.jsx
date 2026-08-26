// The publish control: how many changes are waiting, and what the deploy is doing.
//
// This is the one piece of the panel that has to manage an expectation rather
// than just show data. Saving is instant but going live takes minutes, and
// without visible progress that gap reads as "the button didn't work" — so the
// bar always says which of the two states you are in.

import { useState, useEffect } from 'react';
import { UploadCloud, Check, AlertTriangle, Loader2, ExternalLink, X } from 'lucide-react';
import { useAdmin } from './AdminContext';
import { ApiError } from './api';

// Matches the GitHub Actions build in practice (install + build + prerender + FTP).
const ETA_SECONDS = 240;

function Progress({ startedAt }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const started = new Date(startedAt).getTime();
    const tick = () => setElapsed(Math.max(0, (Date.now() - started) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  // Ease toward 95% and stop: a bar that sits at 100% while still building is
  // worse than one that admits it is still going.
  const pct = Math.min(95, (1 - Math.exp(-elapsed / (ETA_SECONDS / 2.5))) * 100);
  const left = Math.max(0, Math.round(ETA_SECONDS - elapsed));

  return (
    <div className="flex-1 min-w-[180px]">
      <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-brand-purple to-brand-blue transition-[width] duration-1000 ease-linear"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-[11px] text-[#64748b] mt-1">
        {left > 0
          ? `Building and deploying — about ${Math.ceil(left / 60)} min left`
          : 'Almost there — finishing the deploy'}
      </p>
    </div>
  );
}

export default function PublishBar() {
  const { pending, deploy, publishAll, refreshPending, can } = useAdmin();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const [error, setError] = useState(null);
  const [conflict, setConflict] = useState(null);
  const [open, setOpen] = useState(false);

  const count = pending.length;
  const building = deploy && (deploy.status === 'building' || deploy.status === 'committed');

  async function run(force = false) {
    setBusy(true);
    setError(null);
    try {
      await publishAll(note.trim(), force);
      setNote('');
      setOpen(false);
      setConflict(null);
    } catch (e) {
      if (e instanceof ApiError && e.code === 'conflict') {
        setConflict(e.message);
      } else {
        setError(e.message);
      }
      refreshPending();
    } finally {
      setBusy(false);
    }
  }

  // ── Deploy in flight ───────────────────────────────────────────────────────
  if (building) {
    return (
      <div className="flex items-center gap-4 px-4 py-3 bg-white border border-slate-200 rounded-xl">
        <Loader2 className="w-4 h-4 text-[#1B3172] animate-spin shrink-0" />
        <Progress startedAt={deploy.created_at} />
        <p className="text-xs text-[#64748b] hidden sm:block">
          You can keep editing — new changes go out next time you publish.
        </p>
      </div>
    );
  }

  // ── Nothing waiting ────────────────────────────────────────────────────────
  if (count === 0) {
    const failed = deploy?.status === 'failed';
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl">
        {failed ? (
          <>
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <p className="text-sm text-[#475569]">
              The last deploy failed. Your content is committed — the build needs a look.
            </p>
            {deploy.run_url && (
              <a href={deploy.run_url} target="_blank" rel="noreferrer"
                 className="text-xs font-semibold text-[#1B3172] inline-flex items-center gap-1 hover:underline">
                View log <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </>
        ) : (
          <>
            <Check className="w-4 h-4 text-green-600 shrink-0" />
            <p className="text-sm text-[#475569]">Everything is published. The live site is up to date.</p>
          </>
        )}
      </div>
    );
  }

  // ── Changes waiting ────────────────────────────────────────────────────────
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 px-4 py-3">
        <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs font-bold grid place-items-center shrink-0">
          {count}
        </span>
        <button
          onClick={() => setOpen((v) => !v)}
          className="text-sm text-[#475569] hover:text-[#1B3172] font-medium cursor-pointer"
        >
          {count === 1 ? '1 unpublished change' : `${count} unpublished changes`}
        </button>

        <div className="flex-1" />

        {can('content.publish') && (
          <button
            onClick={() => run(false)}
            disabled={busy}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-purple to-brand-blue text-white text-sm font-semibold disabled:opacity-60 cursor-pointer"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
            Publish to live site
          </button>
        )}
      </div>

      {open && (
        <div className="border-t border-slate-200 px-4 py-3 bg-[#F8FAFC]">
          <ul className="space-y-1 mb-3 max-h-48 overflow-auto">
            {pending.map((p) => (
              <li key={p.path} className="text-xs text-[#475569] flex items-center gap-2">
                <span className={`px-1.5 py-0.5 rounded font-semibold ${
                  p.deleted ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {p.deleted ? 'deleted' : 'edited'}
                </span>
                <span className="font-mono">{p.path.replace(/^content\//, '')}</span>
                {p.updated_by_name && <span className="text-[#94a3b8]">by {p.updated_by_name}</span>}
              </li>
            ))}
          </ul>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={120}
            placeholder="What changed? (optional — shows in the publish history)"
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#1B3172]"
          />
        </div>
      )}

      {error && (
        <div className="border-t border-red-200 bg-red-50 px-4 py-3 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-800 flex-1">{error}</p>
          <button onClick={() => setError(null)} className="cursor-pointer"><X className="w-4 h-4 text-red-600" /></button>
        </div>
      )}

      {conflict && (
        <div className="border-t border-amber-200 bg-amber-50 px-4 py-3">
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
