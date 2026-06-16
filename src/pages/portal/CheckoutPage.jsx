import { useState, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Lock, ArrowRight, ArrowLeft, ShieldCheck, CreditCard, Loader2 } from 'lucide-react';
import SEO from '../../components/SEO';
import { useAuth } from '../../portal/AuthContext';
import { createSubscription } from '../../portal/store';
import { PRICING_PLANS, PRICING_ADDONS } from '../../data/siteData';

export default function CheckoutPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const planId = params.get('plan') || 'growth';
  const plan = PRICING_PLANS.find((p) => p.id === planId) || PRICING_PLANS[2];

  const [billing, setBilling] = useState(params.get('billing') === 'yearly' ? 'yearly' : 'monthly');
  const [addonIds, setAddonIds] = useState([]);
  const [card, setCard] = useState({ name: '', number: '', exp: '', cvc: '' });
  const [status, setStatus] = useState('idle'); // idle | processing

  const base = billing === 'yearly' ? plan.priceYearly : plan.priceMonthly;
  const addonTotal = useMemo(
    () => addonIds.reduce((s, id) => s + (PRICING_ADDONS.find((a) => a.id === id)?.price || 0), 0),
    [addonIds],
  );
  const monthlyTotal = base + addonTotal;
  const dueToday = billing === 'yearly' ? monthlyTotal * 12 : monthlyTotal;

  const toggleAddon = (id) =>
    setAddonIds((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  const setCardField = (k) => (e) => setCard((c) => ({ ...c, [k]: e.target.value }));

  const handlePay = (e) => {
    e.preventDefault();
    // If somehow logged out, send to signup carrying the selection.
    if (!user) { navigate(`/signup?redirect=${encodeURIComponent(`/checkout?plan=${planId}&billing=${billing}`)}`); return; }
    setStatus('processing');
    // Demo: no real charge. Simulate processing, then create the subscription.
    setTimeout(() => {
      createSubscription({ userId: user.id, planId, billing, addonIds });
      navigate('/dashboard?welcome=1', { replace: true });
    }, 1100);
  };

  return (
    <main className="pt-20">
      <SEO title={`Checkout — ${plan.name} plan`} canonical="/checkout" noindex />
      <section className="section-pad bg-[#EEF2FF] relative overflow-hidden min-h-[80vh]">
        <div className="line-grid absolute inset-0 opacity-40" />
        <div className="container-xl relative z-10 max-w-5xl">
          <Link to="/pricing" className="inline-flex items-center gap-1.5 text-sm text-[#64748b] hover:text-[#1B3172] mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to plans
          </Link>

          {/* Demo banner */}
          <div className="mb-6 flex items-center gap-2.5 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-amber-800 text-sm">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span><strong>Demo mode:</strong> no real payment is processed. Enter any details to complete the flow.</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            {/* Left — config + payment */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
              className="lg:col-span-3 space-y-6"
            >
              <h1 className="font-heading font-800 text-[#1B3172] text-2xl sm:text-3xl">Complete your subscription</h1>

              {/* Billing cycle */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="font-heading font-700 text-[#1B3172] mb-4">Billing cycle</h2>
                <div className="grid grid-cols-2 gap-3">
                  {['monthly', 'yearly'].map((b) => {
                    const p = b === 'yearly' ? plan.priceYearly : plan.priceMonthly;
                    const active = billing === b;
                    return (
                      <button
                        key={b}
                        onClick={() => setBilling(b)}
                        className={`text-left p-4 rounded-xl border-2 transition-all cursor-pointer ${active ? 'border-brand-purple bg-[#f5f3ff]' : 'border-slate-200 hover:border-slate-300'}`}
                      >
                        <span className="flex items-center justify-between">
                          <span className="font-semibold text-[#1B3172] capitalize">{b}</span>
                          {b === 'yearly' && <span className="text-[11px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">2 mo free</span>}
                        </span>
                        <span className="block text-sm text-[#64748b] mt-1">${p}/mo</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Add-ons */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="font-heading font-700 text-[#1B3172] mb-1">Add-ons <span className="font-normal text-[#64748b] text-sm">(optional)</span></h2>
                <p className="text-sm text-[#64748b] mb-4">Recurring upsells billed monthly alongside your plan.</p>
                <div className="space-y-2.5">
                  {PRICING_ADDONS.map((a) => {
                    const checked = addonIds.includes(a.id);
                    return (
                      <label key={a.id} className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${checked ? 'border-brand-purple bg-[#f5f3ff]' : 'border-slate-200 hover:border-slate-300'}`}>
                        <input type="checkbox" checked={checked} onChange={() => toggleAddon(a.id)} className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#1B3172] focus:ring-[#1B3172] cursor-pointer shrink-0" />
                        <span className="flex-1">
                          <span className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-[#334155] text-sm">{a.name}</span>
                            <span className="font-bold text-[#1B3172] text-sm whitespace-nowrap">+${a.price}/mo</span>
                          </span>
                          <span className="block text-xs text-[#64748b] mt-0.5">{a.desc}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Payment (demo) */}
              <form id="pay-form" onSubmit={handlePay} className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="font-heading font-700 text-[#1B3172] mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-brand-purple" /> Payment details
                </h2>
                <div className="space-y-3">
                  <input required placeholder="Name on card" value={card.name} onChange={setCardField('name')}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-[#f8faff] text-sm focus:outline-none focus:border-[#1B3172] focus:ring-2 focus:ring-[rgba(27,49,114,0.08)]" />
                  <input required placeholder="Card number — e.g. 4242 4242 4242 4242" value={card.number} onChange={setCardField('number')}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-[#f8faff] text-sm focus:outline-none focus:border-[#1B3172] focus:ring-2 focus:ring-[rgba(27,49,114,0.08)]" />
                  <div className="grid grid-cols-2 gap-3">
                    <input required placeholder="MM / YY" value={card.exp} onChange={setCardField('exp')}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-[#f8faff] text-sm focus:outline-none focus:border-[#1B3172] focus:ring-2 focus:ring-[rgba(27,49,114,0.08)]" />
                    <input required placeholder="CVC" value={card.cvc} onChange={setCardField('cvc')}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-[#f8faff] text-sm focus:outline-none focus:border-[#1B3172] focus:ring-2 focus:ring-[rgba(27,49,114,0.08)]" />
                  </div>
                </div>
              </form>
            </motion.div>

            {/* Right — order summary */}
            <motion.aside
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
              className="lg:col-span-2 lg:sticky lg:top-28"
            >
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-[0_8px_32px_rgba(27,49,114,0.08)]">
                <h2 className="font-heading font-700 text-[#1B3172] mb-4">Order summary</h2>

                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-[#475569]">{plan.name} plan ({billing})</span>
                  <span className="font-semibold text-[#1B3172]">${base}/mo</span>
                </div>
                {addonIds.map((id) => {
                  const a = PRICING_ADDONS.find((x) => x.id === id);
                  return (
                    <div key={id} className="flex items-center justify-between text-sm mb-2 text-[#64748b]">
                      <span>{a.name}</span>
                      <span>+${a.price}/mo</span>
                    </div>
                  );
                })}

                <div className="border-t border-slate-100 my-4" />
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[#475569] text-sm">Recurring</span>
                  <span className="font-semibold text-[#1B3172]">${monthlyTotal}/mo</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-heading font-700 text-[#1B3172]">Due today</span>
                  <span className="font-heading font-800 text-[#1B3172] text-xl">${dueToday}</span>
                </div>
                <p className="text-xs text-[#64748b] mt-1">
                  {billing === 'yearly' ? 'Billed once per year (12 months).' : 'Billed monthly. 12-month plan.'}
                </p>

                <button
                  type="submit" form="pay-form" disabled={status === 'processing'}
                  className="w-full mt-5 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#1B3172] hover:bg-[#0d1f5c] text-white text-[15px] font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {status === 'processing'
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
                    : <><Lock className="w-4 h-4" /> Pay ${dueToday} <ArrowRight className="w-4 h-4" /></>}
                </button>

                <ul className="mt-5 space-y-2">
                  {['Website included free', 'We confirm scope before billing', 'Full ownership after 12 months'].map((t) => (
                    <li key={t} className="flex items-center gap-2 text-xs text-[#64748b]">
                      <Check className="w-3.5 h-3.5 text-green-600 shrink-0" /> {t}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.aside>
          </div>
        </div>
      </section>
    </main>
  );
}
