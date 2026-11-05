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
 * One finding: what we saw and what it is costing the business.
 *
 * Deliberately no fix. The server never sends one to the page, because the fix
 * is what we go through with the visitor on a call.
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
            <h3 className="font-heading font-700 text-[#0D246A] text-[16px] sm:text-[17px]">
              {index != null && <span className="text-[#5C6685] mr-1.5">{index}.</span>}
              {issue.title}
            </h3>
            <span className={`text-[11px] font-600 px-2 py-0.5 rounded-full border ${style.chip}`}>
              {style.label}
            </span>
            <span className="text-[11px] font-500 px-2 py-0.5 rounded-full border border-slate-200 text-[#5C6685]">
              {CATEGORY_LABELS[issue.cat] || issue.cat}
            </span>
          </div>

          {issue.evidence && (
            <p className="text-[12.5px] text-[#5C6685] font-mono bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 mb-3 break-words">
              {issue.evidence}
            </p>
          )}

          {issue.impact && (
            <p className="text-[14.5px] text-[#2B3557] leading-relaxed">{issue.impact}</p>
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
      <span className="text-[14px] text-[#0D246A] font-500 flex-1 min-w-0 truncate">{issue.title}</span>
      <span className="text-[11px] text-[#5C6685] hidden sm:inline">
        {CATEGORY_LABELS[issue.cat] || issue.cat}
      </span>
      <Lock className="w-3.5 h-3.5 text-[#5C6685] flex-shrink-0" aria-hidden="true" />
    </div>
  );
}
