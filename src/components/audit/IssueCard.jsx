import { AlertTriangle, XCircle, Lock } from 'lucide-react';

const CATEGORY_LABELS = {
  technical: 'Technical',
  onpage: 'On-page',
  content: 'Content',
  speed: 'Speed',
  local: 'Local',
};

const STATE_STYLE = {
  fail: {
    Icon: XCircle,
    iconClass: 'text-red-600',
    chip: 'bg-red-50 text-red-700 border-red-200',
    label: 'Critical',
  },
  warn: {
    Icon: AlertTriangle,
    iconClass: 'text-amber-600',
    chip: 'bg-amber-50 text-amber-700 border-amber-200',
    label: 'Warning',
  },
};

/**
 * One finding, fully explained.
 *
 * `impact` and `detail` only ever arrive from the server once the report has
 * been unlocked, so there is no client-side hiding to defeat here — a locked
 * finding genuinely has nothing to reveal.
 */
export default function IssueCard({ issue, index }) {
  const style = STATE_STYLE[issue.state] || STATE_STYLE.warn;
  const { Icon } = style;

  return (
    <div className="glass-card gradient-border rounded-xl p-5 sm:p-6">
      <div className="flex items-start gap-3.5">
        <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${style.iconClass}`} aria-hidden="true" />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <h3 className="font-heading font-700 text-[#1B3172] text-[16px] sm:text-[17px]">
              {index != null && <span className="text-[#94a3b8] mr-1.5">{index}.</span>}
              {issue.title}
            </h3>
            <span className={`text-[11px] font-600 px-2 py-0.5 rounded-full border ${style.chip}`}>
              {style.label}
            </span>
            <span className="text-[11px] font-500 px-2 py-0.5 rounded-full border border-slate-200 text-[#64748b]">
              {CATEGORY_LABELS[issue.cat] || issue.cat}
            </span>
          </div>

          {issue.evidence && (
            <p className="text-[12.5px] text-[#64748b] font-mono bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 mb-3 break-words">
              {issue.evidence}
            </p>
          )}

          {issue.impact && (
            <p className="text-[14.5px] text-[#334155] leading-relaxed mb-3">{issue.impact}</p>
          )}

          {issue.detail && (
            <div className="border-l-2 border-brand-purple/40 pl-4 py-0.5">
              <div className="text-[11px] font-700 tracking-wide text-brand-purple mb-1">HOW TO FIX IT</div>
              {/* Speed opportunities arrive as one fix per line. */}
              <p className="text-[14px] text-[#475569] leading-relaxed whitespace-pre-line">{issue.detail}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** A finding the visitor can see exists but not read. */
export function LockedIssueRow({ issue }) {
  const style = STATE_STYLE[issue.state] || STATE_STYLE.warn;

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/70 border border-slate-200">
      <style.Icon className={`w-4 h-4 flex-shrink-0 ${style.iconClass}`} aria-hidden="true" />
      <span className="text-[14px] text-[#1B3172] font-500 flex-1 min-w-0 truncate">{issue.title}</span>
      <span className="text-[11px] text-[#94a3b8] hidden sm:inline">
        {CATEGORY_LABELS[issue.cat] || issue.cat}
      </span>
      <Lock className="w-3.5 h-3.5 text-[#94a3b8] flex-shrink-0" aria-hidden="true" />
    </div>
  );
}
