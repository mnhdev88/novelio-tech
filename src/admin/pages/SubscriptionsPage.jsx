import { useEffect, useState, useCallback } from 'react';
import { Mail, Copy, Check, RefreshCw } from 'lucide-react';
import * as api from '../api';
import { useAdmin } from '../AdminContext';
import { inputCls, Card, Field, ErrorNote, Spinner, PageHeader } from '../ui';

// Monthly subscriptions clients set up from a /pay?months= link. Everything here
// is read live from Razorpay — no publishing involved.

const STATUS_STYLE = {
  created: 'bg-slate-100 text-slate-600',
  authenticated: 'bg-blue-100 text-blue-700',
  active: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  halted: 'bg-red-100 text-red-700',
  cancelled: 'bg-slate-100 text-slate-600',
  completed: 'bg-slate-100 text-slate-600',
  expired: 'bg-slate-100 text-slate-600',
  paused: 'bg-amber-100 text-amber-700',
};

// Razorpay's own words mean little to a client-facing team; say what they mean here.
const STATUS_LABEL = {
  created: 'not completed',
  authenticated: 'upfront paid',
  active: 'active',
  pending: 'charge failing',
  halted: 'halted',
  cancelled: 'cancelled',
  completed: 'completed',
  expired: 'expired',
  paused: 'paused',
};

const sym = (c) => (c === 'INR' ? '₹' : '$');
const date = (ts) => (ts ? new Date(ts * 1000).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '—');

export default function SubscriptionsPage() {
  const { can } = useAdmin();
  const [showAll, setShowAll] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let live = true;
    api.subscriptions.list(showAll)
      .then((d) => { if (live) { setData(d); setError(null); } })
      .catch((e) => { if (live) { setError(e.message); setData({ items: [] }); } });
    return () => { live = false; };
  }, [showAll, reloadKey]);

  const load = useCallback(() => {
    setData(null);
    setReloadKey((k) => k + 1);
  }, []);

  const cancel = async (row) => {
    const when = row.status === 'active'
      ? `at the end of the current month (${date(row.current_end)})`
      : 'now';
    if (!window.confirm(
      `Cancel ${row.customer_name || row.customer_email || 'this'} subscription ${when}?\n\n`
      + 'No further payments will be collected and nothing already paid is refunded. This cannot be undone.',
    )) return;

    setBusyId(row.id);
    try {
      await api.subscriptions.cancel(row.id);
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <PageHeader title="Subscriptions" subtitle="Monthly payments set up from /pay subscription links, live from Razorpay.">
        <label className="inline-flex items-center gap-2 text-sm text-[#475569] cursor-pointer">
          <input type="checkbox" checked={showAll} onChange={(e) => { setData(null); setShowAll(e.target.checked); }} />
          Show unfinished checkouts
        </label>
        <button
          onClick={load}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-[#475569] hover:text-[#1B3172] hover:border-[#1B3172] cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </PageHeader>

      <ErrorNote>{error}</ErrorNote>

      {data?.env === 'test' && (
        <p className="mb-4 rounded-xl bg-amber-50 border border-amber-200 px-4 py-2.5 text-xs text-amber-800">
          Razorpay is on <strong>test keys</strong> — these are test subscriptions; no real money moves.
        </p>
      )}

      {!data ? <Spinner /> : data.items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center mb-6">
          <p className="text-sm text-[#64748b]">No subscriptions yet.</p>
          <p className="text-xs text-[#94a3b8] mt-1">Create a link below and send it to a client.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-6">
          {data.items.map((row) => (
            <div key={row.id} className="px-4 py-3 border-b border-slate-100 last:border-0">
              <div className="flex flex-wrap items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm text-[#1B3172] truncate">
                    {row.customer_name || row.customer_email || '(no name)'}
                    {row.reference && <span className="font-normal text-[#64748b]"> — {row.reference}</span>}
                  </p>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-[#94a3b8] mt-0.5">
                    {row.customer_email && (
                      <a href={`mailto:${row.customer_email}`} className="inline-flex items-center gap-1 hover:text-[#1B3172]">
                        <Mail className="w-3 h-3" /> {row.customer_email}
                      </a>
                    )}
                    <span>
                      {sym(row.currency)}{row.cycle}/mo{row.gst_percent ? ` incl. ${row.gst_percent}% GST` : ''}
                      {' · '}{row.total_months} months
                      {row.upfront_months > 0 ? ` (${row.upfront_months} upfront)` : ''}
                    </span>
                    <span>{row.paid_count} of {row.total_count} monthly charges paid</span>
                    {['active', 'authenticated', 'pending'].includes(row.status) && row.charge_at && !row.cancel && (
                      <span>Next charge {date(row.charge_at)}</span>
                    )}
                    <span className="font-mono">{row.id}</span>
                  </div>
                  {row.cancel && (
                    <p className="text-xs text-[#64748b] mt-1">
                      Cancelled by {row.cancel.by || 'an admin'} on {new Date(row.cancel.at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                      {row.cancel.at_cycle_end && row.cancel.ends_at ? ` — ends ${date(row.cancel.ends_at)}` : ''}
                    </p>
                  )}
                </div>

                <span className={`text-xs font-semibold rounded-lg px-2 py-1 ${STATUS_STYLE[row.status] || 'bg-slate-100 text-slate-600'}`}>
                  {STATUS_LABEL[row.status] || row.status}
                </span>

                {can('payments.write') && row.cancellable && (
                  <button
                    onClick={() => cancel(row)}
                    disabled={busyId === row.id}
                    className="text-xs font-semibold rounded-lg px-2.5 py-1 border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-50 cursor-pointer"
                  >
                    {busyId === row.id ? 'Cancelling…' : 'Cancel'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <LinkBuilder />
    </div>
  );
}

/** Builds a /pay subscription link so nobody has to hand-assemble the query string. */
function LinkBuilder() {
  const [f, setF] = useState({ amount: '', currency: 'USD', months: '12', upfront: '3', ref: '', desc: '', gst: 'add' });
  const [copied, setCopied] = useState(false);
  const set = (k) => (e) => { setF((v) => ({ ...v, [k]: e.target.value })); setCopied(false); };

  const months = Number(f.months);
  const upfront = Number(f.upfront || 0);
  const valid = Number(f.amount) > 0 && Number.isInteger(months) && months >= 2 && months <= 60
    && Number.isInteger(upfront) && upfront >= 0 && upfront < months;

  const qs = new URLSearchParams({ amount: f.amount, months: f.months });
  if (upfront > 0) qs.set('upfront', String(upfront));
  if (f.currency === 'INR') {
    qs.set('currency', 'INR');
    if (f.gst === 'inclusive') qs.set('gst', 'inclusive');
  }
  if (f.ref.trim()) qs.set('ref', f.ref.trim());
  if (f.desc.trim()) qs.set('desc', f.desc.trim());
  const link = `${window.location.origin}/pay?${qs.toString()}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
    } catch { /* clipboard blocked — the link is still selectable */ }
  };

  return (
    <Card
      title="Create a subscription link"
      description="The client opens the link, pays the upfront months today and authorises the rest to be collected monthly."
    >
      <div className="grid sm:grid-cols-3 gap-3 mb-3">
        <Field label="Monthly amount">
          <input type="number" min="1" step="0.01" value={f.amount} onChange={set('amount')} className={inputCls} placeholder="150" />
        </Field>
        <Field label="Currency">
          <select value={f.currency} onChange={set('currency')} className={inputCls}>
            <option value="USD">USD</option>
            <option value="INR">INR</option>
          </select>
        </Field>
        {f.currency === 'INR' ? (
          <Field label="GST (18%)">
            <select value={f.gst} onChange={set('gst')} className={inputCls}>
              <option value="add">Add on top</option>
              <option value="inclusive">Already included</option>
            </select>
          </Field>
        ) : <div />}
        <Field label="Term (months)" hint="2–60">
          <input type="number" min="2" max="60" value={f.months} onChange={set('months')} className={inputCls} />
        </Field>
        <Field label="Paid upfront (months)" hint="0 = just the first month today">
          <input type="number" min="0" value={f.upfront} onChange={set('upfront')} className={inputCls} />
        </Field>
        <Field label="Reference">
          <input value={f.ref} onChange={set('ref')} className={inputCls} placeholder="Client name or invoice" />
        </Field>
      </div>
      <Field label="Description (shown to the client)">
        <input value={f.desc} onChange={set('desc')} className={inputCls} placeholder="Grow My Leads — monthly plan" />
      </Field>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <code className={`flex-1 min-w-0 break-all text-xs rounded-xl px-3 py-2.5 border ${valid ? 'bg-[#f8faff] border-slate-200 text-[#1B3172]' : 'bg-slate-50 border-slate-100 text-[#94a3b8]'}`}>
          {valid ? link : 'Fill in the amount, a term of 2–60 months, and fewer upfront months than the term.'}
        </code>
        <button
          onClick={copy}
          disabled={!valid}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1B3172] text-white text-sm font-semibold disabled:opacity-50 cursor-pointer"
        >
          {copied ? <><Check className="w-4 h-4" /> Copied</> : <><Copy className="w-4 h-4" /> Copy link</>}
        </button>
      </div>
      {f.currency === 'INR' && (
        <p className="text-[11px] text-[#94a3b8] mt-2">
          INR links only work once the rupee prices are confirmed in Pricing.
        </p>
      )}
    </Card>
  );
}
