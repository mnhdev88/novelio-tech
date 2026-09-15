import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, AlertCircle, Gauge, RotateCcw, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ScoreRing from './ScoreRing';
import { scoreColor } from './scoreScale';
import IssueCard, { PassedRow } from './IssueCard';
import UnlockGate from './UnlockGate';
import { runAudit, fetchSpeed } from '../../utils/auditApi';
import { trackEvent } from '../../utils/analytics';

// The visible steps while the audit runs. These are honest about what the server
// is doing rather than a fake loading bar — the last one genuinely waits on
// Google, which is why it is the one that takes a while.
const STEPS = [
  'Fetching the page',
  'Checking the technical setup',
  'Reading the content and headings',
  'Checking local search signals',
  'Asking Google for speed data',
];

function ProgressSteps({ step }) {
  return (
    <div className="space-y-2.5">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center gap-3">
          <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
            i < step ? 'bg-green-600' : i === step ? 'bg-brand-purple' : 'bg-slate-200'
          }`}>
            {i < step ? (
              <svg viewBox="0 0 12 12" className="w-3 h-3 text-white" aria-hidden="true">
                <path d="M2 6l2.5 2.5L10 3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : i === step ? (
              <Loader2 className="w-3 h-3 text-white animate-spin" aria-hidden="true" />
            ) : null}
          </div>
          <span className={`text-[14.5px] transition-colors ${
            i <= step ? 'text-[#1B3172] font-500' : 'text-[#94a3b8]'
          }`}>
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

function CategoryBars({ categories }) {
  return (
    <div className="space-y-3">
      {categories.map((c) => (
        <div key={c.key}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[13.5px] font-500 text-[#334155]">{c.label}</span>
            <span className="text-[13.5px] font-700" style={{ color: scoreColor(c.score) }}>{c.score}</span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-200/70 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: scoreColor(c.score) }}
              initial={{ width: 0 }}
              animate={{ width: `${c.score}%` }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function SpeedCard({ state, speed }) {
  if (state === 'pending') {
    return (
      <div className="glass-card rounded-xl p-5 flex items-center gap-3">
        <Loader2 className="w-4 h-4 animate-spin text-brand-purple" aria-hidden="true" />
        <div>
          <div className="text-[14.5px] font-600 text-[#1B3172]">Measuring speed with Google PageSpeed</div>
          <div className="text-[13px] text-[#64748b]">This takes 20–40 seconds — Google loads your page in a real browser.</div>
        </div>
      </div>
    );
  }

  if (state !== 'ready' || !speed) {
    return (
      <div className="glass-card rounded-xl p-5">
        <div className="text-[14.5px] font-600 text-[#1B3172] mb-0.5">Speed data unavailable</div>
        <div className="text-[13px] text-[#64748b]">
          Google&rsquo;s PageSpeed service did not return in time. Everything else in this report is unaffected.
        </div>
      </div>
    );
  }

  const metrics = [
    { label: 'Largest Contentful Paint', value: speed.lcp, hint: 'when the main content appears' },
    { label: 'Layout shift', value: speed.cls, hint: 'how much the page jumps' },
    { label: 'Blocking time', value: speed.tbt, hint: 'how long taps are ignored' },
  ].filter((m) => m.value);

  return (
    <div className="glass-card gradient-border rounded-xl p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Gauge className="w-4 h-4 text-brand-purple" aria-hidden="true" />
        <h3 className="font-heading font-700 text-[#1B3172] text-[16px]">Mobile speed, measured by Google</h3>
      </div>

      <div className="flex flex-wrap items-center gap-6">
        {speed.score != null && (
          <div>
            <div className="font-heading font-700 text-[34px] leading-none" style={{ color: scoreColor(speed.score) }}>
              {speed.score}
            </div>
            <div className="text-[11px] text-[#64748b] mt-1">PageSpeed score</div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1 min-w-[200px]">
          {metrics.map((m) => (
            <div key={m.label}>
              <div className="text-[17px] font-700 text-[#1B3172]">{m.value}</div>
              <div className="text-[11.5px] text-[#64748b] leading-tight">{m.label}</div>
            </div>
          ))}
        </div>
      </div>

      {speed.has_field && (
        <p className="text-[12.5px] text-[#64748b] mt-4 pt-4 border-t border-slate-200/80">
          Includes real visitor data from Chrome over the last 28 days — not just a lab test.
        </p>
      )}
    </div>
  );
}

export default function AuditRunner() {
  const [url, setUrl] = useState('');
  const [phase, setPhase] = useState('idle');       // idle | running | done
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [unlocked, setUnlocked] = useState(null);   // { issues, passed }
  const [website, setWebsite] = useState('');       // honeypot

  const resultsRef = useRef(null);
  const timers = useRef([]);
  const unlockedRef = useRef(false);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const submit = async (e) => {
    e.preventDefault();
    if (phase === 'running') return;

    const typed = url.trim();
    if (!typed) { setError('Enter your website address to start.'); return; }

    setError('');
    setResult(null);
    setUnlocked(null);
    unlockedRef.current = false;
    setPhase('running');
    setStep(0);
    trackEvent('audit_started', { site: typed });

    // Walk the first four steps on a timer. They correspond to work the server
    // really is doing inside one request, so there is no finer signal to drive
    // them from; the fifth waits on the actual PageSpeed call.
    clearTimers();
    [700, 1500, 2400, 3300].forEach((ms, i) => {
      timers.current.push(setTimeout(() => setStep(i + 1), ms));
    });

    try {
      const data = await runAudit(typed);
      clearTimers();
      setStep(4);
      setResult(data);
      setPhase('done');
      trackEvent('audit_completed', { site: data.host, score: data.overall });

      // Let the results mount before scrolling to them.
      requestAnimationFrame(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });

      if (data.speed_state === 'pending' && data.token) {
        fetchSpeed(data.token)
          .then((speedData) => {
            setResult((prev) => {
              if (!prev || prev.token !== data.token) return prev;
              return {
                ...prev,
                speed: speedData.speed,
                speed_state: speedData.speed_state,
                overall: speedData.overall ?? prev.overall,
                categories: speedData.categories ?? prev.categories,
                // While still gated, the free/locked split may have changed —
                // a failing speed metric can outrank what was shown before.
                free: unlockedRef.current ? prev.free : (speedData.free ?? prev.free),
                locked: unlockedRef.current ? [] : (speedData.locked ?? prev.locked),
                locked_count: unlockedRef.current ? 0 : (speedData.locked_count ?? prev.locked_count),
                fail_count: speedData.fail_count ?? prev.fail_count,
                warn_count: speedData.warn_count ?? prev.warn_count,
              };
            });

            // If the visitor unlocked while Google was still working, the server
            // sends the speed findings in full — fold them into the open report.
            if (speedData.unlocked && speedData.free?.length) {
              setUnlocked({ issues: speedData.free, passed: speedData.passed || [] });
            }
          })
          .catch(() => {
            setResult((prev) => (prev ? { ...prev, speed_state: 'unavailable' } : prev));
          });
      }
    } catch (err) {
      clearTimers();
      setPhase('idle');
      setStep(0);
      setError(err.message || 'Something went wrong. Please try again.');
    }
  };

  const reset = () => {
    clearTimers();
    setPhase('idle');
    setResult(null);
    setUnlocked(null);
    unlockedRef.current = false;
    setStep(0);
    setError('');
  };

  const shownIssues = unlocked ? unlocked.issues : (result?.free || []);

  return (
    <div>
      {/* ── The form ─────────────────────────────────────────────────── */}
      <form onSubmit={submit} className="max-w-2xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              type="text"
              inputMode="url"
              value={url}
              onChange={(e) => { setUrl(e.target.value); if (error) setError(''); }}
              placeholder="yourwebsite.com"
              aria-label="Your website address"
              disabled={phase === 'running'}
              className="w-full bg-white border border-slate-200/80 rounded-xl pl-11 pr-4 py-4 text-[#1B3172] placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-brand-purple/60 focus:ring-brand-purple/20 transition-all text-[16px] disabled:opacity-60"
            />
          </div>

          {/* Honeypot */}
          <input
            type="text" name="website" tabIndex={-1} autoComplete="off"
            value={website} onChange={(e) => setWebsite(e.target.value)}
            className="absolute left-[-9999px] w-px h-px opacity-0" aria-hidden="true"
          />

          <button type="submit" disabled={phase === 'running'} className="btn-primary justify-center sm:w-auto py-4 disabled:opacity-60">
            {phase === 'running' ? (
              <><Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Auditing…</>
            ) : (
              <>Run my free audit <ArrowRight className="w-4 h-4" aria-hidden="true" /></>
            )}
          </button>
        </div>

        {error && (
          <div className="flex items-start gap-2 mt-3 text-[14px] text-red-600">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {phase === 'idle' && !error && (
          <p className="text-[13px] text-[#64748b] text-center mt-3">
            No signup needed. You will see your score before we ask for anything.
          </p>
        )}
      </form>

      {/* ── Running ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {phase === 'running' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="max-w-2xl mx-auto mt-8 glass-card gradient-border rounded-2xl p-6 sm:p-7"
          >
            <ProgressSteps step={step} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Results ──────────────────────────────────────────────────── */}
      {phase === 'done' && result && (
        <div ref={resultsRef} className="mt-12 scroll-mt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="glass-card gradient-border rounded-2xl p-6 sm:p-8"
          >
            <div className="flex flex-col md:flex-row gap-8 md:gap-10 items-center md:items-start">
              <ScoreRing score={result.overall} />

              <div className="flex-1 w-full">
                <div className="mb-5">
                  <div className="text-[12px] text-[#64748b] mb-0.5">SEO audit for</div>
                  <h2 className="font-heading font-700 text-[#1B3172] text-[20px] sm:text-[23px] break-all">
                    {result.host}
                  </h2>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[13.5px]">
                    {result.fail_count > 0 && (
                      <span className="text-red-600 font-600">
                        {result.fail_count} critical {result.fail_count === 1 ? 'issue' : 'issues'}
                      </span>
                    )}
                    {result.warn_count > 0 && (
                      <span className="text-amber-600 font-600">{result.warn_count} warnings</span>
                    )}
                    <span className="text-green-700 font-600">{result.passed?.length || 0} checks passed</span>
                  </div>
                </div>

                <CategoryBars categories={result.categories} />
              </div>
            </div>
          </motion.div>

          <div className="mt-5">
            <SpeedCard state={result.speed_state} speed={result.speed} />
          </div>

          {/* Findings. Three of them before the gate, all of them after it. */}
          {shownIssues.length > 0 && (
            <div className="mt-8">
              <h3 className="font-heading font-700 text-[#1B3172] text-[20px] sm:text-[23px] mb-1">
                {unlocked ? 'Everything we found' : 'The three biggest problems'}
              </h3>
              <p className="text-[14.5px] text-[#64748b] mb-5">
                {unlocked
                  ? 'Ordered by how much each one is costing you. Work down the list.'
                  : 'Ranked by impact. Each one is explained in full below.'}
              </p>

              <div className="space-y-4">
                {shownIssues.map((issue, i) => (
                  <IssueCard key={issue.id} issue={issue} index={i + 1} />
                ))}
              </div>
            </div>
          )}

          {shownIssues.length === 0 && (
            <div className="mt-8 glass-card gradient-border rounded-2xl p-7 text-center">
              <h3 className="font-heading font-700 text-[#1B3172] text-[20px] mb-2">
                Nothing broken on this page
              </h3>
              <p className="text-[14.5px] text-[#64748b] max-w-lg mx-auto">
                Every check passed. That is genuinely uncommon — the opportunity here is content and
                authority rather than fixes.
              </p>
            </div>
          )}

          {/* ── The gate ─────────────────────────────────────────────── */}
          {!unlocked && (
            <div className="mt-8">
              <UnlockGate
                token={result.token}
                lockedIssues={result.locked || []}
                lockedCount={result.locked_count || 0}
                host={result.host}
                onUnlocked={(data) => {
                  unlockedRef.current = true;
                  setUnlocked(data);
                }}
              />
            </div>
          )}

          {/* ── After unlocking ──────────────────────────────────────── */}
          {unlocked && (
            <>
              {unlocked.passed?.length > 0 && (
                <div className="mt-8 glass-card rounded-2xl p-6 sm:p-7">
                  <h3 className="font-heading font-700 text-[#1B3172] text-[18px] mb-1">
                    What this site already gets right
                  </h3>
                  <p className="text-[13.5px] text-[#64748b] mb-4">
                    {unlocked.passed.length} checks passed. Worth knowing what not to touch.
                  </p>
                  <div className="grid sm:grid-cols-2 gap-x-8">
                    {unlocked.passed.map((p) => <PassedRow key={p.id} item={p} />)}
                  </div>
                </div>
              )}

              <div className="mt-8 glass-card gradient-border rounded-2xl p-7 sm:p-9 text-center">
                <h3 className="font-heading font-700 text-[#1B3172] text-[21px] sm:text-[25px] mb-2">
                  Want these fixed rather than listed?
                </h3>
                <p className="text-[15px] text-[#475569] max-w-xl mx-auto mb-6 leading-relaxed">
                  This report tells you what is wrong and how to fix it — you are welcome to hand it to
                  whoever built your site. If you would rather it were simply handled, that is what we do.
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <Link to="/contact" className="btn-primary">
                    Book a free 30-minute call <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Link>
                  <Link to="/services/search-engine-optimization" className="btn-ghost">
                    See how we work
                  </Link>
                </div>
              </div>
            </>
          )}

          <div className="mt-6 text-center">
            <button onClick={reset} className="inline-flex items-center gap-2 text-[14px] text-[#64748b] hover:text-brand-purple transition-colors">
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" /> Audit a different page
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
