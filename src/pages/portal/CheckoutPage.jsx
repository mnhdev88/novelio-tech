import { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Lock, ArrowRight, ArrowLeft, ShieldCheck, CreditCard, Loader2, AlertCircle } from 'lucide-react';
import SEO from '../../components/SEO';
import { useAuth } from '../../portal/AuthContext';
import { createSubscription } from '../../portal/store';
import { PRICING_PLANS, PRICING_ADDONS } from '../../data/siteData';
import { loadPayPalSdk, paypalEnabled, PAYPAL_ENV } from '../../utils/paypal';
import { payoneerEnabled, PAYONEER_ENV, startPayoneerPlan } from '../../utils/payoneer';

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
  const [payError, setPayError] = useState('');
  const [payoneerBusy, setPayoneerBusy] = useState(false);
  const [payMethod, setPayMethod] = useState('paypal'); // paypal | payoneer

  // MUST mirror compute_charge() in public/api/{paypal,payoneer}/_lib.php —
  // if these diverge the gateway rejects the order on an amount mismatch.
  const isTermPlan = Boolean(plan.termTotal);
  const upfrontMonths = plan.upfrontMonths ?? 1;
  const base = billing === 'yearly' ? plan.priceYearly : plan.priceMonthly;
  const addonTotal = useMemo(
    () => addonIds.reduce((s, id) => s + (PRICING_ADDONS.find((a) => a.id === id)?.price || 0), 0),
    [addonIds],
  );
  const monthlyTotal = base + addonTotal;
  // Plan portion due today; add-ons are always a single month on top.
  const planDue =
    billing === 'yearly'
      ? (plan.priceYearlyTotal ?? plan.priceYearly * 12)
      : plan.priceMonthly * upfrontMonths;
  const dueToday = planDue + addonTotal;

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

  // Phone-sold plans have no public price and are quoted on a call, so they must
  // never be self-serve checked out via a hand-typed /checkout?plan=… URL.
  useEffect(() => {
    if (plan.ctaPhone) navigate('/contact', { replace: true });
  }, [plan.ctaPhone, navigate]);

  // ── Real PayPal flow (active when VITE_PAYPAL_CLIENT_ID is set) ──────────────
  // The button reads the LATEST selection via a ref so we never have to re-render
  // the SDK button when the user toggles billing/add-ons.
  const paypalRef = useRef(null);
  const selectionRef = useRef({ planId, billing, addonIds });
  useEffect(() => {
    selectionRef.current = { planId, billing, addonIds };
  }, [planId, billing, addonIds]);
  const usePayPal = paypalEnabled && Boolean(user);

  // Either gateway being configured takes checkout out of demo mode.
  const anyGatewayEnabled = paypalEnabled || payoneerEnabled;
  const sandboxMode =
    (paypalEnabled && PAYPAL_ENV === 'sandbox') || (payoneerEnabled && PAYONEER_ENV === 'sandbox');

  // Payoneer is a full-page redirect: create the LIST server-side (server sets the
  // amount), then send the buyer to Payoneer's hosted page. Verification happens
  // on the way back at /payoneer/return.
  const startPayoneer = async () => {
    if (!user) {
      navigate(`/signup?redirect=${encodeURIComponent(`/checkout?plan=${planId}&billing=${billing}`)}`);
      return;
    }
    setPayError('');
    setPayoneerBusy(true);
    try {
      const sel = selectionRef.current;
      const { redirectUrl } = await startPayoneerPlan({
        planId: sel.planId,
        billing: sel.billing,
        addonIds: sel.addonIds,
        customer: { id: user.id, name: user.name, email: user.email },
      });
      window.location.href = redirectUrl;
    } catch (e) {
      setPayoneerBusy(false);
      setPayError(e.message || 'Could not start the Payoneer payment. Please try again.');
    }
  };

  useEffect(() => {
    if (!usePayPal) return;
    let cancelled = false;
    let buttons;

    loadPayPalSdk()
      .then((paypal) => {
        if (cancelled || !paypalRef.current) return;
        paypalRef.current.innerHTML = '';
        buttons = paypal.Buttons({
          style: { layout: 'vertical', color: 'gold', shape: 'pill', label: 'paypal', height: 48 },

          // Server sets the amount — the browser can't tamper with the price.
          createOrder: async () => {
            setPayError('');
            const sel = selectionRef.current;
            const res = await fetch('/api/paypal/create-order.php', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(sel),
            });
            const data = await res.json();
            if (!res.ok || !data.id) throw new Error(data.error || 'Could not start payment');
            return data.id;
          },

          // Capture + verify server-side before we trust the payment.
          onApprove: async (data) => {
            setStatus('processing');
            const sel = selectionRef.current;
            try {
              const res = await fetch('/api/paypal/capture-order.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  orderID: data.orderID,
                  ...sel,
                  customer: { id: user.id, name: user.name, email: user.email },
                }),
              });
              const result = await res.json();
              if (!res.ok || result.status !== 'COMPLETED') {
                setStatus('idle');
                setPayError(result.error || 'Payment could not be confirmed.');
                return;
              }
              createSubscription({ userId: user.id, planId: sel.planId, billing: sel.billing, addonIds: sel.addonIds });
              navigate('/dashboard?welcome=1', { replace: true });
            } catch {
              setStatus('idle');
              setPayError('Something went wrong confirming your payment. Please contact us before retrying.');
            }
          },

          onCancel: () => setStatus('idle'),
          onError: (err) => {
            console.error('[paypal]', err);
            setStatus('idle');
            setPayError('Payment error. Please try again.');
          },
        });
        buttons.render(paypalRef.current);
      })
      .catch(() => setPayError('Could not load PayPal. Refresh the page and try again.'));

    return () => {
      cancelled = true;
      try { buttons?.close(); } catch { /* ignore */ }
    };
  }, [usePayPal, user, navigate]);

  return (
    <main className="pt-20">
      <SEO title={`Checkout — ${plan.name} plan`} canonical="/checkout" noindex />
      <section className="section-pad bg-[#EEF2FF] relative overflow-hidden min-h-[80vh]">
        <div className="line-grid absolute inset-0 opacity-40" />
        <div className="container-xl relative z-10 max-w-5xl">
          <Link to="/pricing" className="inline-flex items-center gap-1.5 text-sm text-[#64748b] hover:text-[#1B3172] mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to plans
          </Link>

          {/* Payment-mode banner */}
          {!anyGatewayEnabled ? (
            <div className="mb-6 flex items-center gap-2.5 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-amber-800 text-sm">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span><strong>Demo mode:</strong> no real payment is processed. Enter any details to complete the flow.</span>
            </div>
          ) : sandboxMode ? (
            <div className="mb-6 flex items-center gap-2.5 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-amber-800 text-sm">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span><strong>Sandbox test mode:</strong> use a test account — no real money moves.</span>
            </div>
          ) : (
            <div className="mb-6 flex items-center gap-2.5 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-green-800 text-sm">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Secure checkout. Your payment is processed by PayPal or Payoneer — we never see your card details.</span>
            </div>
          )}

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
                    const active = billing === b;
                    const yearTotal = plan.priceYearlyTotal ?? plan.priceYearly * 12;
                    const saving = isTermPlan ? plan.termTotal - yearTotal : 0;
                    return (
                      <button
                        key={b}
                        onClick={() => setBilling(b)}
                        className={`text-left p-4 rounded-xl border-2 transition-all cursor-pointer ${active ? 'border-brand-purple bg-[#f5f3ff]' : 'border-slate-200 hover:border-slate-300'}`}
                      >
                        <span className="flex items-center justify-between">
                          <span className="font-semibold text-[#1B3172] capitalize">{b}</span>
                          {b === 'yearly' && saving > 0 && (
                            <span className="text-[11px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Save ${saving}</span>
                          )}
                        </span>
                        <span className="block text-sm text-[#64748b] mt-1">
                          {b === 'yearly'
                            ? `$${yearTotal.toLocaleString()} for 12 months`
                            : isTermPlan
                              ? `$${plan.priceMonthly}/mo · ${upfrontMonths} months upfront`
                              : `$${plan.priceMonthly}/mo`}
                        </span>
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

              {/* Payment */}
              {anyGatewayEnabled ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <h2 className="font-heading font-700 text-[#1B3172] mb-2 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-brand-purple" /> Payment
                  </h2>
                  {user ? (
                    <p className="text-sm text-[#64748b]">
                      Review your order on the right, then complete your payment securely with
                      {paypalEnabled && payoneerEnabled ? ' PayPal or Payoneer' : payoneerEnabled ? ' Payoneer' : ' PayPal'}
                      {' '}(debit/credit cards accepted). You’ll confirm the exact amount before paying.
                    </p>
                  ) : (
                    <p className="text-sm text-[#64748b]">
                      <Link to={`/login?redirect=${encodeURIComponent(`/checkout?plan=${planId}&billing=${billing}`)}`} className="text-brand-purple font-semibold underline">Sign in</Link>{' '}
                      or{' '}
                      <Link to={`/signup?redirect=${encodeURIComponent(`/checkout?plan=${planId}&billing=${billing}`)}`} className="text-brand-purple font-semibold underline">create an account</Link>{' '}
                      to complete your payment.
                    </p>
                  )}
                </div>
              ) : (
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
              )}

              {/* Payment aggregators (Razorpay in particular) require the terms
                  and refund policy to be reachable from the payment page itself,
                  not only from the footer. */}
              <p className="text-xs text-[#64748b] text-center">
                By completing this payment you agree to our{' '}
                <Link to="/terms" className="text-brand-purple underline">Terms of Service</Link>{' '}
                and{' '}
                <Link to="/refund-policy" className="text-brand-purple underline">Refund &amp; Cancellation Policy</Link>.
              </p>
            </motion.div>

            {/* Right — order summary */}
            <motion.aside
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
              className="lg:col-span-2 lg:sticky lg:top-28"
            >
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-[0_8px_32px_rgba(27,49,114,0.08)]">
                <h2 className="font-heading font-700 text-[#1B3172] mb-4">Order summary</h2>

                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-[#475569]">
                    {plan.name} plan
                    {billing === 'yearly'
                      ? ' (12 months)'
                      : isTermPlan
                        ? ` (${upfrontMonths} months upfront)`
                        : ' (monthly)'}
                  </span>
                  <span className="font-semibold text-[#1B3172]">${planDue.toLocaleString()}</span>
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
                  <span className="text-[#475569] text-sm">
                    {billing === 'yearly' ? 'Then recurring' : 'Then monthly'}
                  </span>
                  <span className="font-semibold text-[#1B3172]">
                    {billing === 'yearly'
                      ? (addonTotal > 0 ? `$${addonTotal}/mo` : '—')
                      : `$${monthlyTotal}/mo`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-heading font-700 text-[#1B3172]">Due today</span>
                  <span className="font-heading font-800 text-[#1B3172] text-xl">${dueToday.toLocaleString()}</span>
                </div>
                <p className="text-xs text-[#64748b] mt-1 leading-relaxed">
                  {billing === 'yearly'
                    ? `Your full 12 months, paid once.${addonTotal > 0 ? ' Add-ons continue billing monthly.' : ''}`
                    : isTermPlan
                      ? `Covers your first ${upfrontMonths} months. The remaining ${12 - upfrontMonths} months are billed at $${monthlyTotal}/mo — $${(plan.termTotal + addonTotal * 12).toLocaleString()} total over 12 months.`
                      : 'Billed monthly. 12-month plan.'}
                </p>

                {anyGatewayEnabled ? (
                  <div className="mt-5">
                    {!user ? (
                      <Link
                        to={`/login?redirect=${encodeURIComponent(`/checkout?plan=${planId}&billing=${billing}`)}`}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#1B3172] hover:bg-[#0d1f5c] text-white text-[15px] font-semibold transition-all cursor-pointer"
                      >
                        <Lock className="w-4 h-4" /> Sign in to pay ${dueToday} <ArrowRight className="w-4 h-4" />
                      </Link>
                    ) : (
                      <>
                        {status === 'processing' && (
                          <div className="mb-3 flex items-center justify-center gap-2 text-sm text-[#475569]">
                            <Loader2 className="w-4 h-4 animate-spin" /> Confirming your payment…
                          </div>
                        )}

                        {/* Payment-method tabs (only when both gateways are on) */}
                        {paypalEnabled && payoneerEnabled && (
                          <div className="grid grid-cols-2 gap-1 mb-4 p-1 bg-slate-100 rounded-xl">
                            {[['paypal', 'PayPal'], ['payoneer', 'Payoneer']].map(([m, label]) => (
                              <button
                                key={m}
                                type="button"
                                onClick={() => { setPayMethod(m); setPayError(''); }}
                                className={`py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${payMethod === m ? 'bg-white text-[#1B3172] shadow-sm' : 'text-[#64748b] hover:text-[#1B3172]'}`}
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* PayPal Smart Buttons — kept mounted so they render even when hidden */}
                        {paypalEnabled && (
                          <div className={paypalEnabled && payoneerEnabled && payMethod !== 'paypal' ? 'hidden' : ''}>
                            <div ref={paypalRef} />
                          </div>
                        )}

                        {payoneerEnabled && (
                          <div className={paypalEnabled && payoneerEnabled && payMethod !== 'payoneer' ? 'hidden' : ''}>
                            <button
                              type="button"
                              onClick={startPayoneer}
                              disabled={payoneerBusy}
                              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#FF4800] hover:bg-[#e64100] text-white text-[15px] font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                            >
                              {payoneerBusy
                                ? <><Loader2 className="w-4 h-4 animate-spin" /> Redirecting to Payoneer…</>
                                : <>Pay ${dueToday} with Payoneer <ArrowRight className="w-4 h-4" /></>}
                            </button>
                          </div>
                        )}
                      </>
                    )}
                    {payError && (
                      <div className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-px" /> <span>{payError}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    type="submit" form="pay-form" disabled={status === 'processing'}
                    className="w-full mt-5 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#1B3172] hover:bg-[#0d1f5c] text-white text-[15px] font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {status === 'processing'
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
                      : <><Lock className="w-4 h-4" /> Pay ${dueToday} <ArrowRight className="w-4 h-4" /></>}
                  </button>
                )}

                <ul className="mt-5 space-y-2">
                  {['Website included in your plan', 'We confirm scope before billing', 'Full ownership after 12 months'].map((t) => (
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
