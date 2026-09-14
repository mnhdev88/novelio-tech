import { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Lock, ArrowRight, ArrowLeft, ShieldCheck, CreditCard, Loader2, AlertCircle } from 'lucide-react';
import SEO from '../../components/SEO';
import { useAuth } from '../../portal/AuthContext';
import { createSubscription } from '../../portal/store';
import { PRICING_PLANS, PRICING_ADDONS } from '../../data/siteData';
import { loadPayPalSdk, paypalEnabled, PAYPAL_ENV } from '../../utils/paypal';
import {
  razorpayEnabled,
  razorpayUsdEnabled,
  razorpayCurrencies,
  RAZORPAY_ENV,
  createRazorpayPlanOrder,
  openRazorpayCheckout,
  verifyRazorpayPayment,
} from '../../utils/razorpay';
import { computeCharge, formatMinor, formatAmount, addonPrice } from '../../utils/pricing';

export default function CheckoutPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const planId = params.get('plan') || 'growth';
  const plan = PRICING_PLANS.find((p) => p.id === planId) || PRICING_PLANS[2];

  // PayPal only ever charges USD, so USD stays the default and INR is opt-in.
  const urlCurrency = (params.get('currency') || '').toUpperCase();
  const [currency, setCurrency] = useState(
    urlCurrency === 'INR' && razorpayEnabled ? 'INR' : 'USD',
  );
  const [billing, setBilling] = useState(params.get('billing') === 'yearly' ? 'yearly' : 'monthly');
  const [addonIds, setAddonIds] = useState([]);
  const [card, setCard] = useState({ name: '', number: '', exp: '', cvc: '' });
  const [status, setStatus] = useState('idle'); // idle | processing
  const [payError, setPayError] = useState('');
  const [razorpayBusy, setRazorpayBusy] = useState(false);

  // ── Which gateways can take THIS currency ───────────────────────────────────
  // PayPal is USD-only. Razorpay always takes INR, and USD only where the account
  // has International Payments approved.
  const paypalAvailable = paypalEnabled && currency === 'USD';
  const razorpayAvailable = razorpayEnabled && razorpayCurrencies.includes(currency);
  const anyGatewayEnabled = paypalEnabled || razorpayEnabled;
  // Offer the currency switch only when something can actually charge in rupees.
  const currencyOptions = razorpayEnabled
    ? (paypalEnabled || razorpayUsdEnabled ? ['USD', 'INR'] : ['INR'])
    : ['USD'];

  const [payMethod, setPayMethod] = useState(paypalEnabled ? 'paypal' : 'razorpay');
  // Keep the selected method legal for the selected currency.
  const activeMethod = !paypalAvailable ? 'razorpay' : !razorpayAvailable ? 'paypal' : payMethod;
  const bothMethods = paypalAvailable && razorpayAvailable;

  const sandboxMode = activeMethod === 'razorpay'
    ? (razorpayEnabled && RAZORPAY_ENV !== 'live')
    : (paypalEnabled && PAYPAL_ENV === 'sandbox');

  // ── Order maths — mirrors the server (see src/utils/pricing.js) ─────────────
  const charge = useMemo(
    () => computeCharge({ plan, billing, addonIds, addons: PRICING_ADDONS, currency }),
    [plan, billing, addonIds, currency],
  );

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
  const selectionRef = useRef({ planId, billing, addonIds, currency });
  useEffect(() => {
    selectionRef.current = { planId, billing, addonIds, currency };
  }, [planId, billing, addonIds, currency]);
  const usePayPal = paypalEnabled && Boolean(user);

  // ── Razorpay Standard Checkout (overlay, no redirect) ───────────────────────
  // The server prices the order and opens it; the overlay collects the payment;
  // verify-payment.php checks the signature against Razorpay's own record before
  // the subscription is created. The browser never asserts an amount.
  const startRazorpay = async () => {
    if (!user) {
      navigate(`/signup?redirect=${encodeURIComponent(`/checkout?plan=${planId}&billing=${billing}`)}`);
      return;
    }
    setPayError('');
    setRazorpayBusy(true);
    try {
      const sel = selectionRef.current;
      const order = await createRazorpayPlanOrder({
        planId: sel.planId,
        billing: sel.billing,
        addonIds: sel.addonIds,
        currency: sel.currency,
        customer: { id: user.id, name: user.name, email: user.email },
      });

      await openRazorpayCheckout(order, {
        customer: { name: user.name, email: user.email },
        onDismiss: () => { setRazorpayBusy(false); setStatus('idle'); },
        onError: (message) => { setRazorpayBusy(false); setStatus('idle'); setPayError(message); },
        onSuccess: async (response) => {
          setStatus('processing');
          try {
            const result = await verifyRazorpayPayment(response);
            if (result.status === 'COMPLETED') {
              createSubscription({
                userId: user.id,
                planId: result.planId || sel.planId,
                billing: result.billing || sel.billing,
                addonIds: result.addonIds?.length ? result.addonIds : sel.addonIds,
              });
              navigate('/dashboard?welcome=1', { replace: true });
              return;
            }
            setRazorpayBusy(false);
            setStatus('idle');
            setPayError(result.status === 'PENDING'
              ? 'Your payment is still being confirmed. If it went through you’ll get an email shortly — please don’t pay again.'
              : (result.error || 'Payment could not be confirmed.'));
          } catch {
            setRazorpayBusy(false);
            setStatus('idle');
            setPayError('Something went wrong confirming your payment. Please contact us before retrying.');
          }
        },
      });
    } catch (e) {
      setRazorpayBusy(false);
      setPayError(e.message || 'Could not start the payment. Please try again.');
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

  const gatewayNames = paypalEnabled && razorpayEnabled
    ? 'PayPal or Razorpay'
    : razorpayEnabled ? 'Razorpay' : 'PayPal';

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
              <span><strong>Test mode:</strong> use a test account or test card — no real money moves.</span>
            </div>
          ) : (
            <div className="mb-6 flex items-center gap-2.5 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-green-800 text-sm">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Secure checkout. Your payment is processed by {gatewayNames} — we never see your card details.</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            {/* Left — config + payment */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
              className="lg:col-span-3 space-y-6"
            >
              <h1 className="font-heading font-800 text-[#1B3172] text-2xl sm:text-3xl">Complete your subscription</h1>

              {/* Currency — only shown when a gateway can actually take rupees */}
              {currencyOptions.length > 1 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <h2 className="font-heading font-700 text-[#1B3172] mb-1">Currency</h2>
                  <p className="text-sm text-[#64748b] mb-4">
                    Pay in rupees to Novelio India (GST applies) or in dollars to Novelio Technologies LLC.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {currencyOptions.map((c) => {
                      const active = currency === c;
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => { setCurrency(c); setPayError(''); }}
                          className={`text-left p-4 rounded-xl border-2 transition-all cursor-pointer ${active ? 'border-brand-purple bg-[#f5f3ff]' : 'border-slate-200 hover:border-slate-300'}`}
                        >
                          <span className="font-semibold text-[#1B3172]">
                            {c === 'INR' ? '₹ Indian Rupee' : '$ US Dollar'}
                          </span>
                          <span className="block text-sm text-[#64748b] mt-1">
                            {c === 'INR' ? 'Cards, UPI, net banking · +18% GST' : 'Cards & PayPal balance'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Billing cycle */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="font-heading font-700 text-[#1B3172] mb-4">Billing cycle</h2>
                <div className="grid grid-cols-2 gap-3">
                  {['monthly', 'yearly'].map((b) => {
                    const active = billing === b;
                    const saving = charge.termTotalMinor
                      ? charge.termTotalMinor - charge.yearlyTotalMinor
                      : 0;
                    return (
                      <button
                        key={b}
                        onClick={() => setBilling(b)}
                        className={`text-left p-4 rounded-xl border-2 transition-all cursor-pointer ${active ? 'border-brand-purple bg-[#f5f3ff]' : 'border-slate-200 hover:border-slate-300'}`}
                      >
                        <span className="flex items-center justify-between">
                          <span className="font-semibold text-[#1B3172] capitalize">{b}</span>
                          {b === 'yearly' && saving > 0 && (
                            <span className="text-[11px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                              Save {formatMinor(saving, currency)}
                            </span>
                          )}
                        </span>
                        <span className="block text-sm text-[#64748b] mt-1">
                          {b === 'yearly'
                            ? `${formatMinor(charge.yearlyTotalMinor, currency)} for 12 months`
                            : charge.isTermPlan
                              ? `${formatAmount(charge.price.monthly, currency)}/mo · ${charge.upfrontMonths} months upfront`
                              : `${formatAmount(charge.price.monthly, currency)}/mo`}
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
                            <span className="font-bold text-[#1B3172] text-sm whitespace-nowrap">+{formatAmount(addonPrice(a, currency), currency)}/mo</span>
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
                      {bothMethods ? ' PayPal or Razorpay' : activeMethod === 'razorpay' ? ' Razorpay' : ' PayPal'}
                      {currency === 'INR' ? ' (cards, UPI and net banking accepted)' : ' (debit/credit cards accepted)'}
                      . You’ll confirm the exact amount before paying.
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
                    {charge.isYearly
                      ? ' (12 months)'
                      : charge.isTermPlan
                        ? ` (${charge.upfrontMonths} months upfront)`
                        : ' (monthly)'}
                  </span>
                  <span className="font-semibold text-[#1B3172]">{formatMinor(charge.planDueMinor, currency)}</span>
                </div>
                {addonIds.map((id) => {
                  const a = PRICING_ADDONS.find((x) => x.id === id);
                  return (
                    <div key={id} className="flex items-center justify-between text-sm mb-2 text-[#64748b]">
                      <span>{a.name}</span>
                      <span>+{formatAmount(addonPrice(a, currency), currency)}/mo</span>
                    </div>
                  );
                })}

                {/* GST is charged in addition to the quoted fee for Novelio India
                    (see /terms) — it has to be a visible line, not a surprise on
                    the Razorpay overlay. */}
                {charge.gstMinor > 0 && (
                  <>
                    <div className="border-t border-slate-100 my-3" />
                    <div className="flex items-center justify-between text-sm mb-2 text-[#64748b]">
                      <span>Subtotal</span>
                      <span>{formatMinor(charge.subtotalMinor, currency)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mb-2 text-[#64748b]">
                      <span>GST ({charge.gstPercent}%)</span>
                      <span>+{formatMinor(charge.gstMinor, currency)}</span>
                    </div>
                  </>
                )}

                <div className="border-t border-slate-100 my-4" />
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[#475569] text-sm">
                    {charge.isYearly ? 'Then recurring' : 'Then monthly'}
                  </span>
                  <span className="font-semibold text-[#1B3172]">
                    {charge.isYearly
                      ? (charge.addonMinor > 0 ? `${formatMinor(charge.addonMinor, currency)}/mo` : '—')
                      : `${formatMinor(charge.monthlyMinor, currency)}/mo`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-heading font-700 text-[#1B3172]">Due today</span>
                  <span className="font-heading font-800 text-[#1B3172] text-xl">{formatMinor(charge.totalMinor, currency)}</span>
                </div>
                <p className="text-xs text-[#64748b] mt-1 leading-relaxed">
                  {charge.isYearly
                    ? `Your full 12 months, paid once.${charge.addonMinor > 0 ? ' Add-ons continue billing monthly.' : ''}`
                    : charge.isTermPlan
                      ? `Covers your first ${charge.upfrontMonths} months. The remaining ${12 - charge.upfrontMonths} months are billed at ${formatMinor(charge.monthlyMinor, currency)}/mo — ${formatMinor(charge.termTotalMinor + charge.addonMinor * 12, currency)} total over 12 months${charge.gstMinor > 0 ? ', plus GST' : ''}.`
                      : 'Billed monthly. 12-month plan.'}
                  {charge.gstMinor > 0 && ' Prices are exclusive of GST.'}
                </p>

                {anyGatewayEnabled ? (
                  <div className="mt-5">
                    {!user ? (
                      <Link
                        to={`/login?redirect=${encodeURIComponent(`/checkout?plan=${planId}&billing=${billing}`)}`}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#1B3172] hover:bg-[#0d1f5c] text-white text-[15px] font-semibold transition-all cursor-pointer"
                      >
                        <Lock className="w-4 h-4" /> Sign in to pay {formatMinor(charge.totalMinor, currency)} <ArrowRight className="w-4 h-4" />
                      </Link>
                    ) : (
                      <>
                        {status === 'processing' && (
                          <div className="mb-3 flex items-center justify-center gap-2 text-sm text-[#475569]">
                            <Loader2 className="w-4 h-4 animate-spin" /> Confirming your payment…
                          </div>
                        )}

                        {/* Payment-method tabs (only when both can take this currency) */}
                        {bothMethods && (
                          <div className="grid grid-cols-2 gap-1 mb-4 p-1 bg-slate-100 rounded-xl">
                            {[['paypal', 'PayPal'], ['razorpay', 'Card / UPI']].map(([m, label]) => (
                              <button
                                key={m}
                                type="button"
                                onClick={() => { setPayMethod(m); setPayError(''); }}
                                className={`py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${activeMethod === m ? 'bg-white text-[#1B3172] shadow-sm' : 'text-[#64748b] hover:text-[#1B3172]'}`}
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* PayPal Smart Buttons — kept mounted so they render even when hidden */}
                        {paypalEnabled && (
                          <div className={paypalAvailable && activeMethod === 'paypal' ? '' : 'hidden'}>
                            <div ref={paypalRef} />
                          </div>
                        )}

                        {razorpayAvailable && activeMethod === 'razorpay' && (
                          <button
                            type="button"
                            onClick={startRazorpay}
                            disabled={razorpayBusy}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#0C2451] hover:bg-[#081a3c] text-white text-[15px] font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                          >
                            {razorpayBusy
                              ? <><Loader2 className="w-4 h-4 animate-spin" /> Opening secure checkout…</>
                              : <>Pay {formatMinor(charge.totalMinor, currency)} <ArrowRight className="w-4 h-4" /></>}
                          </button>
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
                      : <><Lock className="w-4 h-4" /> Pay {formatMinor(charge.totalMinor, currency)} <ArrowRight className="w-4 h-4" /></>}
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
