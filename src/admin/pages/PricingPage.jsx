import { AlertTriangle, Plus, Trash2 } from 'lucide-react';
import useContentFile from '../useContentFile';
import { Card, Text, Field, inputCls, SaveState, ErrorNote, Spinner, PageHeader } from '../ui';

export default function PricingPage() {
  const { data, update, state, error } = useContentFile('content/pricing.json');
  if (!data) return <Spinner />;

  const setPlan = (i, patch) =>
    update({ ...data, plans: data.plans.map((p, j) => (j === i ? { ...p, ...patch } : p)) });

  const setAddon = (i, patch) =>
    update({ ...data, addons: data.addons.map((a, j) => (j === i ? { ...a, ...patch } : a)) });

  const setInrMeta = (patch) =>
    update({ ...data, inrPricing: { ...(data.inrPricing || {}), ...patch } });

  const num = (v) => (v === '' ? 0 : Number(v));
  const inrConfirmed = data.inrPricing?.confirmed === true;

  return (
    <div className="max-w-3xl space-y-4">
      <PageHeader title="Pricing" subtitle="Plans, add-ons and what customers are actually charged.">
        <SaveState state={state} />
      </PageHeader>

      <ErrorNote>{error}</ErrorNote>

      {/* Prices here are not cosmetic: the payment server recomputes every charge
          from this same file, so an edit changes what a customer pays. */}
      <div className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-900">
          These prices are what the checkout charges, not just what the page displays.
          They take effect on the live site when you publish.
        </p>
      </div>

      {/* The rupee column ships pre-filled from a USD conversion, which is a
          guess. Razorpay refuses every INR charge until someone ticks this. */}
      {!inrConfirmed && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="text-sm text-red-900">
            <p className="font-semibold">Rupee prices are unconfirmed placeholders.</p>
            <p className="mt-1">
              {data.inrPricing?.seededFromUsdRate
                ? `They were seeded from the dollar prices at ₹${data.inrPricing.seededFromUsdRate} per $1, rounded to ₹100. `
                : ''}
              Razorpay rejects every INR payment until you check each ₹ figure below and tick the box.
              Dollar payments are unaffected.
            </p>
          </div>
        </div>
      )}

      {data.plans.map((plan, i) => (
        <Card key={plan.id} title={plan.name} description={`Plan ID: ${plan.id}`}>
          <div className="grid sm:grid-cols-2 gap-4">
            <Text label="Plan name" value={plan.name} onChange={(v) => setPlan(i, { name: v })} />
            <Text label="Tagline" value={plan.tagline} onChange={(v) => setPlan(i, { tagline: v })} />

            <Field label="Monthly price ($)">
              <input type="number" min="0" value={plan.priceMonthly}
                onChange={(e) => setPlan(i, { priceMonthly: num(e.target.value) })} className={inputCls} />
            </Field>

            <Field label="Monthly price (₹)">
              <input type="number" min="0" value={plan.priceMonthlyINR ?? 0}
                onChange={(e) => setPlan(i, { priceMonthlyINR: num(e.target.value) })} className={inputCls} />
              <span className="block text-[11px] text-[#94a3b8] mt-1">
                Before GST — 18% is added at checkout.
              </span>
            </Field>

            <Field label="Yearly price, shown per month ($)">
              <input type="number" min="0" value={plan.priceYearly}
                onChange={(e) => setPlan(i, { priceYearly: num(e.target.value) })} className={inputCls} />
            </Field>

            <Field label="Yearly price, shown per month (₹)">
              <input type="number" min="0" value={plan.priceYearlyINR ?? 0}
                onChange={(e) => setPlan(i, { priceYearlyINR: num(e.target.value) })} className={inputCls} />
            </Field>

            {plan.yearlyTotal !== undefined && (
              <Field label="Yearly total charged ($)">
                <input type="number" min="0" value={plan.yearlyTotal}
                  onChange={(e) => setPlan(i, { yearlyTotal: num(e.target.value), priceYearlyTotal: num(e.target.value) })}
                  className={inputCls} />
                <span className="block text-[11px] text-[#94a3b8] mt-1">
                  This exact amount is charged for a year — it is not the monthly price times twelve.
                </span>
              </Field>
            )}

            {plan.priceYearlyTotalINR !== undefined && (
              <Field label="Yearly total charged (₹)">
                <input type="number" min="0" value={plan.priceYearlyTotalINR}
                  onChange={(e) => setPlan(i, { priceYearlyTotalINR: num(e.target.value) })} className={inputCls} />
                <span className="block text-[11px] text-[#94a3b8] mt-1">
                  Before GST. Charged as one payment for the year.
                </span>
              </Field>
            )}

            {plan.upfrontMonths !== undefined && (
              <Field label="Months collected at checkout">
                <input type="number" min="1" max="12" value={plan.upfrontMonths}
                  onChange={(e) => setPlan(i, { upfrontMonths: num(e.target.value) })} className={inputCls} />
                <span className="block text-[11px] text-[#94a3b8] mt-1">
                  The remaining {12 - (plan.upfrontMonths || 0)} months are billed later.
                </span>
              </Field>
            )}
          </div>

          <div className="mt-4">
            <span className="block text-xs font-semibold text-[#475569] mb-1.5">What&rsquo;s included</span>
            <div className="space-y-2">
              {(plan.features || []).map((f, k) => (
                <div key={k} className="flex gap-2">
                  <input
                    value={f}
                    onChange={(e) => setPlan(i, { features: plan.features.map((x, m) => (m === k ? e.target.value : x)) })}
                    className={`${inputCls} flex-1`}
                  />
                  <button
                    onClick={() => setPlan(i, { features: plan.features.filter((_, m) => m !== k) })}
                    className="p-2 text-[#94a3b8] hover:text-red-600 cursor-pointer" aria-label="Remove feature"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => setPlan(i, { features: [...(plan.features || []), ''] })}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-slate-300 text-xs font-semibold text-[#64748b] hover:border-[#1B3172] hover:text-[#1B3172] cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add feature
              </button>
            </div>
          </div>
        </Card>
      ))}

      <Card title="Add-ons" description="Optional extras, always billed monthly. Rupee prices are before GST.">
        <div className="space-y-3">
          <div className="hidden sm:grid sm:grid-cols-[1fr_110px_110px] gap-2 text-[11px] font-semibold text-[#94a3b8]">
            <span>Name</span><span>Price ($)</span><span>Price (₹)</span>
          </div>
          {data.addons.map((a, i) => (
            <div key={a.id} className="grid sm:grid-cols-[1fr_110px_110px] gap-2">
              <input value={a.name} onChange={(e) => setAddon(i, { name: e.target.value })} className={inputCls} />
              <input type="number" min="0" value={a.price}
                onChange={(e) => setAddon(i, { price: num(e.target.value) })} className={inputCls} />
              <input type="number" min="0" value={a.priceINR ?? 0}
                onChange={(e) => setAddon(i, { priceINR: num(e.target.value) })} className={inputCls} />
              <input value={a.desc || ''} onChange={(e) => setAddon(i, { desc: e.target.value })}
                placeholder="Short description" className={`${inputCls} sm:col-span-3 text-xs`} />
            </div>
          ))}
        </div>
      </Card>

      <Card title="Rupee pricing" description="Razorpay will not charge in INR until this is confirmed.">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={inrConfirmed}
            onChange={(e) => setInrMeta({ confirmed: e.target.checked })}
            className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#1B3172] focus:ring-[#1B3172] cursor-pointer shrink-0"
          />
          <span className="text-sm text-[#334155]">
            <span className="font-semibold">The ₹ prices above are correct and may be charged.</span>
            <span className="block text-xs text-[#64748b] mt-1">
              Until this is ticked and published, every INR payment attempt is refused by the server
              with a message asking the customer to pay in USD or get in touch. USD is never affected.
            </span>
          </span>
        </label>
      </Card>
    </div>
  );
}
