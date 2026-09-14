import { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Lock, ShieldCheck, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import SEO from '../../components/SEO';
import { loadPayPalSdk, paypalEnabled, PAYPAL_ENV } from '../../utils/paypal';
import {
  razorpayEnabled,
  razorpayUsdEnabled,
  razorpayCurrencies,
  RAZORPAY_ENV,
  createRazorpayCustomOrder,
  openRazorpayCheckout,
  verifyRazorpayPayment,
} from '../../utils/razorpay';
import { CURRENCIES, gstPercentFor, toMinor, formatMinor } from '../../utils/pricing';
import { INR_PRICES_CONFIRMED } from '../../data/siteData';

// A custom / one-off payment page for invoices, quotes, deposits and buyouts.
// Send a client a ready link, e.g. /pay?amount=2222&ref=Invoice-014&desc=Website%20build
// (amount locks when provided in the URL), or let them type the amount you quoted.
//
// URL params: amount, ref, desc, currency (USD|INR), gst (add|inclusive).
//   ?currency=INR        — open on rupees instead of dollars
//   ?gst=inclusive       — the amount you sent ALREADY contains GST
// Default for INR is to ADD 18% on top, matching the Terms page.
export default function CustomPaymentPage() {
  const [params] = useSearchParams();

  // Prefilled amount from the URL locks the field so the client can't mistype it.
  const urlAmountRaw = params.get('amount');
  const urlAmount = urlAmountRaw && Number(urlAmountRaw) > 0 ? Number(urlAmountRaw) : null;
  const reference = params.get('ref') || '';
  const urlDesc = params.get('desc') || '';
  const urlCurrency = (params.get('currency') || '').toUpperCase();
  const gstMode = params.get('gst') === 'inclusive' ? 'inclusive' : 'add';

  const inrOffered = razorpayEnabled && INR_PRICES_CONFIRMED;
  const [currency, setCurrency] = useState(
    urlCurrency === 'INR' && inrOffered ? 'INR' : 'USD',
  );
  const [amount, setAmount] = useState(urlAmount ? String(urlAmount) : '');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | processing | paid
  const [payError, setPayError] = useState('');
  const [paid, setPaid] = useState(null); // { amount, currency, paymentId }
  const [razorpayBusy, setRazorpayBusy] = useState(false);

  const amountNum = useMemo(() => {
    const n = Number(amount);
    return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0;
  }, [amount]);

  const detailsValid = amountNum >= 1 && name.trim() !== '' && /.+@.+\..+/.test(email);

  // GST breakdown, mirroring create-custom-order.php so the buyer sees exactly
  // what the overlay will charge.
  const gstPercent = gstPercentFor(currency);
  const entered = toMinor(amountNum);
  const subtotalMinor = gstPercent === 0
    ? entered
    : gstMode === 'inclusive'
      ? Math.round((entered * 100) / (100 + gstPercent))
      : entered;
  const gstMinor = gstPercent === 0 ? 0 : (gstMode === 'inclusive' ? entered - subtotalMinor : Math.round((subtotalMinor * gstPercent) / 100));
  const totalMinor = subtotalMinor + gstMinor;

  // Latest values for the gateway callbacks without re-rendering the buttons.
  const fieldsRef = useRef({});
  useEffect(() => {
    fieldsRef.current = {
      amount: amountNum,
      currency,
      gstMode,
      reference,
      description: urlDesc,
      name: name.trim(),
      email: email.trim(),
    };
  }, [amountNum, currency, gstMode, reference, urlDesc, name, email]);

  const validRef = useRef(detailsValid);
  useEffect(() => { validRef.current = detailsValid; }, [detailsValid]);

  // PayPal is USD-only; Razorpay takes INR always and USD where approved.
  const paypalAvailable = paypalEnabled && currency === 'USD';
  const razorpayAvailable = razorpayEnabled && razorpayCurrencies.includes(currency);
  const anyGatewayEnabled = paypalEnabled || razorpayEnabled;
  const currencyOptions = [
    (paypalEnabled || razorpayUsdEnabled) && 'USD',
    inrOffered && 'INR',
  ].filter(Boolean);

  const bothMethods = paypalAvailable && razorpayAvailable;

  // Test mode is per-gateway, never ORed into one flag: PayPal can be live while
  // Razorpay is still on test keys. With both buttons on screen at once the
  // banner has to name which one is not taking real money, or it is a lie about
  // the other.
  const testGateways = [
    paypalAvailable && PAYPAL_ENV === 'sandbox' ? 'PayPal' : null,
    razorpayAvailable && RAZORPAY_ENV !== 'live' ? 'Razorpay' : null,
  ].filter(Boolean);

  // ── Razorpay Standard Checkout (overlay, no redirect) ───────────────────────
  const startRazorpay = async () => {
    if (!validRef.current) {
      setPayError('Please enter a valid amount, your name and a valid email first.');
      return;
    }
    setPayError('');
    setRazorpayBusy(true);
    try {
      const f = fieldsRef.current;
      const order = await createRazorpayCustomOrder({
        amount: f.amount,
        currency: f.currency,
        gstMode: f.gstMode,
        reference: f.reference,
        description: f.description,
        customer: { name: f.name, email: f.email },
      });

      await openRazorpayCheckout(order, {
        customer: { name: f.name, email: f.email },
        onDismiss: () => { setRazorpayBusy(false); setStatus('idle'); },
        onError: (message) => { setRazorpayBusy(false); setStatus('idle'); setPayError(message); },
        onSuccess: async (response) => {
          setStatus('processing');
          try {
            const result = await verifyRazorpayPayment(response);
            if (result.status === 'COMPLETED') {
              setPaid({ amount: result.amount, currency: result.currency, paymentId: result.paymentId });
              setStatus('paid');
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

  const paypalRef = useRef(null);

  useEffect(() => {
    if (!paypalEnabled) return;
    let cancelled = false;
    let buttons;

    loadPayPalSdk()
      .then((paypal) => {
        if (cancelled || !paypalRef.current) return;
        paypalRef.current.innerHTML = '';
        buttons = paypal.Buttons({
          style: { layout: 'vertical', color: 'gold', shape: 'pill', label: 'pay', height: 48 },

          onClick: (_data, actions) => {
            // Block the popup if required fields are missing.
            if (!validRef.current) {
              setPayError('Please enter a valid amount, your name and a valid email first.');
              return actions.reject();
            }
            setPayError('');
            return actions.resolve();
          },

          createOrder: async () => {
            const f = fieldsRef.current;
            const res = await fetch('/api/paypal/create-custom-order.php', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                amount: f.amount,
                reference: f.reference,
                description: f.description,
                customer: { name: f.name, email: f.email },
              }),
            });
            const data = await res.json();
            if (!res.ok || !data.id) throw new Error(data.error || 'Could not start payment');
            return data.id;
          },

          onApprove: async (data) => {
            setStatus('processing');
            const f = fieldsRef.current;
            try {
              const res = await fetch('/api/paypal/capture-order.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  orderID: data.orderID,
                  mode: 'custom',
                  reference: f.reference,
                  description: f.description,
                  customer: { name: f.name, email: f.email },
                }),
              });
              const result = await res.json();
              if (!res.ok || result.status !== 'COMPLETED') {
                setStatus('idle');
                setPayError(result.error || 'Payment could not be confirmed.');
                return;
              }
              setPaid({ amount: result.amount, currency: 'USD', paymentId: result.captureId });
              setStatus('paid');
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
  }, []);

  // Named from what is actually on screen for the CHOSEN currency, not from what
  // is configured — PayPal cannot settle rupees, so promising it under an INR
  // amount would be a claim the page can't honour.
  const activeGateways = [paypalAvailable && 'PayPal', razorpayAvailable && 'Razorpay'].filter(Boolean);
  const gatewayList = (joiner) => activeGateways.join(joiner) || 'PayPal';
  const symbol = (CURRENCIES[currency] || CURRENCIES.USD).symbol;

  return (
    <main className="pt-20">
      <SEO title="Make a payment" canonical="/pay" noindex />
      <section className="section-pad bg-[#EEF2FF] relative overflow-hidden min-h-[80vh]">
        <div className="line-grid absolute inset-0 opacity-40" />
        <div className="container-xl relative z-10 max-w-lg">
          <h1 className="font-heading font-800 text-[#1B3172] text-2xl sm:text-3xl mb-2">Make a payment</h1>
          <p className="text-[#64748b] text-sm mb-6">
            Securely pay an invoice, deposit or custom quote. Processed by {gatewayList(' or ')} — we never see your card details.
          </p>

          {status === 'paid' && paid ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-[0_8px_32px_rgba(27,49,114,0.08)]">
              <CheckCircle2 className="w-14 h-14 text-green-600 mx-auto mb-4" />
              <h2 className="font-heading font-800 text-[#1B3172] text-xl mb-1">Payment received</h2>
              <p className="text-[#475569] text-sm">
                Thank you — we’ve received <strong>{formatMinor(toMinor(paid.amount), paid.currency || currency, { decimals: true })}</strong>
                {reference ? <> for <strong>{reference}</strong></> : null}.
              </p>
              <p className="text-xs text-[#94a3b8] mt-2">Confirmation: {paid.paymentId}</p>
              <Link to="/" className="inline-block mt-6 px-6 py-3 rounded-xl bg-[#1B3172] hover:bg-[#0d1f5c] text-white text-sm font-semibold">
                Back to home
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-[0_8px_32px_rgba(27,49,114,0.08)]">
              {!anyGatewayEnabled ? (
                <div className="flex items-start gap-2.5 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-amber-800 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-px" />
                  <span>Online payments aren’t configured yet. Please contact us to complete your payment.</span>
                </div>
              ) : (
                <>
                  {testGateways.length > 0 && (
                    <div className="mb-4 flex items-center gap-2.5 rounded-xl bg-amber-50 border border-amber-200 px-4 py-2.5 text-amber-800 text-xs">
                      <ShieldCheck className="w-4 h-4 shrink-0" />
                      <span>
                        <strong>{testGateways.join(' and ')} {testGateways.length > 1 ? 'are' : 'is'} in test mode</strong>
                        {' '}— no real money moves{testGateways.length === 1 && bothMethods ? ' through it' : ''}.
                      </span>
                    </div>
                  )}

                  {reference && (
                    <div className="mb-4 text-sm">
                      <span className="text-[#64748b]">Reference: </span>
                      <span className="font-semibold text-[#1B3172]">{reference}</span>
                    </div>
                  )}

                  {/* Currency — only when a gateway can actually take rupees */}
                  {currencyOptions.length > 1 && (
                    <>
                      <label className="block text-sm font-semibold text-[#334155] mb-1.5">Currency</label>
                      <div className="grid grid-cols-2 gap-1 mb-4 p-1 bg-slate-100 rounded-xl">
                        {currencyOptions.map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => { setCurrency(c); setPayError(''); }}
                            className={`py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${currency === c ? 'bg-white text-[#1B3172] shadow-sm' : 'text-[#64748b] hover:text-[#1B3172]'}`}
                          >
                            {c === 'INR' ? '₹ INR' : '$ USD'}
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  <label className="block text-sm font-semibold text-[#334155] mb-1.5">
                    Amount ({currency}){gstPercent > 0 && gstMode === 'add' ? ' — before GST' : ''}
                  </label>
                  <div className="relative mb-4">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748b] font-semibold">{symbol}</span>
                    <input
                      type="number" min="1" step="0.01" inputMode="decimal"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      readOnly={Boolean(urlAmount)}
                      placeholder="0.00"
                      className={`w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#1B3172] focus:ring-2 focus:ring-[rgba(27,49,114,0.08)] ${urlAmount ? 'bg-slate-50 text-[#1B3172] font-bold' : 'bg-[#f8faff]'}`}
                    />
                  </div>

                  {/* GST is charged in addition to the quoted fee for Novelio
                      India (see /terms) — never let it surprise anyone on the
                      Razorpay overlay. */}
                  {gstMinor > 0 && amountNum > 0 && (
                    <div className="mb-4 rounded-xl bg-[#f8faff] border border-slate-200 px-4 py-3 text-sm">
                      <div className="flex items-center justify-between text-[#64748b] mb-1">
                        <span>Subtotal</span>
                        <span>{formatMinor(subtotalMinor, currency, { decimals: true })}</span>
                      </div>
                      <div className="flex items-center justify-between text-[#64748b] mb-1">
                        <span>GST ({gstPercent}%)</span>
                        <span>{gstMode === 'inclusive' ? '' : '+'}{formatMinor(gstMinor, currency, { decimals: true })}</span>
                      </div>
                      <div className="flex items-center justify-between font-semibold text-[#1B3172] pt-1.5 border-t border-slate-200">
                        <span>Total charged</span>
                        <span>{formatMinor(totalMinor, currency, { decimals: true })}</span>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-3 mb-5">
                    <input
                      required placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-[#f8faff] text-sm focus:outline-none focus:border-[#1B3172] focus:ring-2 focus:ring-[rgba(27,49,114,0.08)]" />
                    <input
                      required type="email" placeholder="Your email (for the receipt)" value={email} onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-[#f8faff] text-sm focus:outline-none focus:border-[#1B3172] focus:ring-2 focus:ring-[rgba(27,49,114,0.08)]" />
                  </div>

                  {status === 'processing' && (
                    <div className="mb-3 flex items-center justify-center gap-2 text-sm text-[#475569]">
                      <Loader2 className="w-4 h-4 animate-spin" /> Confirming your payment…
                    </div>
                  )}

                  {/* Both gateways are offered side by side rather than behind
                      tabs: with only two options, a tab hides half of what the
                      payer can do and costs a click to discover. */}
                  {bothMethods && (
                    <p className="text-xs font-semibold text-[#475569] mb-2.5">Choose how to pay</p>
                  )}

                  {/* PayPal Smart Buttons stay mounted whenever PayPal is
                      configured — the SDK renders into this node once, and
                      re-mounting it on a currency switch would re-fetch the SDK. */}
                  {paypalEnabled && (
                    <div className={paypalAvailable ? '' : 'hidden'}>
                      <div ref={paypalRef} className={detailsValid ? '' : 'opacity-60'} />
                    </div>
                  )}

                  {bothMethods && (
                    <div className="flex items-center gap-3 my-3">
                      <span className="h-px flex-1 bg-slate-200" />
                      <span className="text-xs text-[#94a3b8] font-medium">or</span>
                      <span className="h-px flex-1 bg-slate-200" />
                    </div>
                  )}

                  {razorpayAvailable && (
                    <button
                      type="button"
                      onClick={startRazorpay}
                      disabled={razorpayBusy || !detailsValid}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#0C2451] hover:bg-[#081a3c] text-white text-[15px] font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {razorpayBusy
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Opening secure checkout…</>
                        : <>Pay {amountNum > 0 ? formatMinor(totalMinor, currency, { decimals: true }) : 'securely'} with {currency === 'INR' ? 'Card / UPI / Netbanking' : 'Card'}</>}
                    </button>
                  )}

                  {/* PayPal cannot settle rupees, so say why it vanished rather
                      than letting it silently disappear on a currency switch. */}
                  {paypalEnabled && !paypalAvailable && razorpayAvailable && (
                    <p className="mt-2.5 text-xs text-[#94a3b8] text-center">
                      PayPal is available for USD payments — switch the currency above to use it.
                    </p>
                  )}

                  {payError && (
                    <div className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-px" /> <span>{payError}</span>
                    </div>
                  )}

                  <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-[#94a3b8]">
                    <Lock className="w-3.5 h-3.5" /> Secured by {gatewayList(' & ')}
                  </p>

                  {/* Aggregators require terms + refund policy to be reachable
                      from the payment page itself, not only from the footer. */}
                  <p className="mt-3 text-xs text-[#64748b] text-center">
                    By paying you agree to our{' '}
                    <Link to="/terms" className="text-brand-purple underline">Terms of Service</Link>{' '}
                    and{' '}
                    <Link to="/refund-policy" className="text-brand-purple underline">Refund &amp; Cancellation Policy</Link>.
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
