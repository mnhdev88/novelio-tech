// Small shared pieces used across the panel's screens.

import { Loader2, Check, AlertTriangle } from 'lucide-react';

export const inputCls =
  'w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#1B3172]';

export function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-[#475569] mb-1.5">{label}</span>
      {children}
      {hint && <span className="block text-[11px] text-[#94a3b8] mt-1">{hint}</span>}
    </label>
  );
}

export function Text({ label, hint, value, onChange, ...rest }) {
  return (
    <Field label={label} hint={hint}>
      <input value={value ?? ''} onChange={(e) => onChange(e.target.value)} className={inputCls} {...rest} />
    </Field>
  );
}

export function Card({ title, description, children }) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-5">
      <h2 className="font-heading font-800 text-[#1B3172] mb-1">{title}</h2>
      {description && <p className="text-xs text-[#64748b] mb-4">{description}</p>}
      {children}
    </section>
  );
}

/** Autosave indicator — quiet by design; it should reassure, not demand attention. */
export function SaveState({ state }) {
  if (state === 'saving') {
    return <span className="text-xs text-[#94a3b8] inline-flex items-center gap-1.5"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</span>;
  }
  if (state === 'saved') {
    return <span className="text-xs text-[#94a3b8] inline-flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-green-600" /> Saved</span>;
  }
  return null;
}

export function ErrorNote({ children }) {
  if (!children) return null;
  return (
    <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 mb-4">
      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
      <p className="text-sm text-red-800">{children}</p>
    </div>
  );
}

export function Spinner() {
  return <div className="grid place-items-center py-20"><Loader2 className="w-6 h-6 animate-spin text-[#1B3172]" /></div>;
}

export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-5">
      <div>
        <h1 className="font-heading font-800 text-[#1B3172] text-xl">{title}</h1>
        {subtitle && <p className="text-sm text-[#64748b]">{subtitle}</p>}
      </div>
      <div className="flex-1" />
      {children}
    </div>
  );
}
