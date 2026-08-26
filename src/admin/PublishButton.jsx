// The publish control, in the app header.
//
// It lives here rather than over the page because it has to be visible from
// every screen: saving is instant but going live takes minutes, so a client who
// cannot see that anything is pending will edit ten things and leave without
// ever shipping them. The detailed list lives on the Unpublished page; this is
// the ambient reminder and the one-click path.

import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { UploadCloud, Check, AlertTriangle, Loader2, X } from 'lucide-react';
import { useAdmin } from './AdminContext';
import { ApiError } from './api';

// Matches the GitHub Actions build in practice (install + build + prerender + FTP).
const ETA_SECONDS = 240;

/** Thin strip across the bottom edge of the header while a deploy runs. */
function ProgressStrip({ startedAt }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const started = new Date(startedAt).getTime();
    const tick = () => setElapsed(Math.max(0, (Date.now() - started) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  // Eases toward 95% and stops. A bar sitting at 100% while the build is still
  // running reads as broken; admitting it is still going does not.
  const pct = Math.min(95, (1 - Math.exp(-elapsed / (ETA_SECONDS / 2.5))) * 100);
  const left = Math.max(0, Math.round(ETA_SECONDS - elapsed));

  return (
    <>
      <div className="absolute left-0 right-0 bottom-0 h-[3px] bg-slate-100">
        <div
          className="h-full bg-gradient-to-r from-brand-purple to-brand-blue transition-[width] duration-1000 ease-linear"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="hidden md:inline text-[11px] text-[#64748b] whitespace-nowrap">
        {left > 0 ? `about ${Math.ceil(left / 60)} min left` : 'finishing up'}
      </span>
    </>
  );
}

export default function PublishButton() {
  const { pending, deploy, publishAll, refreshPending, can } = useAdmin();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [conflict, setConflict] = useState(null);
  const wrap = useRef(null);

  const count = pending.length;
  const building = deploy && (deploy.status === 'building' || deploy.status === 'committed');

  // Dismiss the popover on an outside click, the way a popover should behave.
  useEffect(() => {
    if (!error && !conflict) return undefined;
    const onDown = (e) => {
      if (wrap.current && !wrap.current.contains(e.target)) { setError(null); setConflict(null); }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [error, conflict]);

  async function run(force = false) {
    setBusy(true);
    setError(null);
    try {
      // The header path publishes with a default message; the Unpublished page
      // is where someone can write a proper note first.
      await publishAll('', force);
      setConflict(null);
    } catch (e) {
      if (e instanceof ApiError && e.code === 'conflict') setConflict(e.message);
      else setError(e.message);
      refreshPending();
    } finally {
      setBusy(false);
    }
  }

  // ── Deploy in flight ───────────────────────────────────────────────────────
  if (building) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="w-3.5 h-3.5 text-[#1B3172] animate-spin shrink-0" />
        <span className="hidden sm:inline text-xs font-semibold text-[#1B3172]">Publishing…</span>
        <ProgressStrip startedAt={deploy.created_at} />
      </div>
    );
  }

  // ── Nothing waiting ────────────────────────────────────────────────────────
  if (count === 0) {
    if (deploy?.status === 'failed') {
      return (
        <Link
          to="/admin/unpublished"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100"
        >
          <AlertTriangle className="w-3.5 h-3.5" /> Deploy failed
        </Link>
      );
    }
    return (
      <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-[#94a3b8]">
        <Check className="w-3.5 h-3.5 text-green-600" /> All published
      </span>
    );
  }

  // ── Changes waiting ────────────────────────────────────────────────────────
  return (
    <div className="relative" ref={wrap}>
      {can('content.publish') ? (
        <button
          onClick={() => run(false)}
          disabled={busy}
          title={`${count} unpublished change${count === 1 ? '' : 's'}`}
          className="inline-flex items-center gap-2 pl-3 pr-2.5 py-1.5 rounded-lg bg-gradient-to-r from-brand-purple to-brand-blue text-white text-xs font-semibold disabled:opacity-60 cursor-pointer"
        >
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">Publish</span>
          <span className="inline-grid place-items-center min-w-[18px] h-[18px] px-1 rounded-full bg-white/25 text-[11px] leading-none">
            {count}
          </span>
        </button>
      ) : (
        <Link
          to="/admin/unpublished"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-amber-700 bg-amber-50"
        >
          {count} waiting
        </Link>
      )}

      {error && (
        <div className="absolute right-0 top-full mt-2 w-72 z-40 rounded-xl border border-red-200 bg-red-50 p-3 shadow-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <p className="text-xs text-red-800 flex-1">{error}</p>
            <button onClick={() => setError(null)} className="cursor-pointer" aria-label="Dismiss">
              <X className="w-3.5 h-3.5 text-red-600" />
            </button>
          </div>
        </div>
      )}

      {conflict && (
        <div className="absolute right-0 top-full mt-2 w-80 z-40 rounded-xl border border-amber-200 bg-amber-50 p-3 shadow-lg">
          <div className="flex items-start gap-2 mb-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-900 flex-1">{conflict}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => window.location.reload()}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-amber-300 text-[11px] font-semibold text-amber-900 cursor-pointer"
            >
              Reload and review
            </button>
            <button
              onClick={() => run(true)}
              disabled={busy}
              className="px-2.5 py-1.5 rounded-lg bg-amber-600 text-white text-[11px] font-semibold disabled:opacity-60 cursor-pointer"
            >
              Overwrite with mine
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
