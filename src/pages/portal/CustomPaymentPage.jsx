import { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Lock, ShieldCheck, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import SEO from '../../components/SEO';
import { loadPayPalSdk, paypalEnabled, PAYPAL_ENV } from '../../utils/paypal';
import { payoneerEnabled, PAYONEER_ENV, startPayoneerCustom } from '../../utils/payoneer';

// A custom / one-off payment page for invoices, quotes, deposits and buyouts.
// Send a client a ready link, e.g. /pay?amount=2222&ref=Invoice-014&desc=Website%20build
// (amount locks when provided in the URL), or let them type the amount you quoted.
export default function CustomPaymentPage() {
  const [params] = useSearchParams();

  // Prefilled amount from the URL locks the field so the client can't mistype it.
  const urlAmountRaw = params.get('amount');
  const urlAmount = urlAmountRaw && Number(urlAmountRaw) > 0 ? Number(urlAmountRaw) : null;
  const reference = params.get('ref') || '';
  const urlDesc = params.get('desc') || '';

  const [amount, setAmount] = useState(urlAmount ? String(urlAmount) : '');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | processing | paid
  const [payError, setPayError] = useState('');
  const [paid, setPaid] = useState(null); // { amount, captureId }
  const [payoneerBusy, setPayoneerBusy] = useState(false);
  const [payMethod, setPayMethod] = useState('paypal'); // paypal | payoneer

  const amountNum = useMemo(() => {
    const n = Number(amount);
    return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0;
  }, [amount]);

  const detailsValid = amountNum >= 1 && name.trim() !== '' && /.+@.+\..+/.test(email);

  // Latest values for the PayPal callbacks without re-rendering the button.
  const fieldsRef = useRef({});
  useEffect(() => {
    fieldsRef.current = { amount: amountNum, reference, description: urlDesc, name: name.trim(), email: email.trim() };
  }, [amountNum, reference, urlDesc, name, email]);

  const validRef = useRef(detailsValid);
  useEffect(() => { validRef.current = detailsValid; }, [detailsValid]);

  const anyGatewayEnabled = paypalEnabled || payoneerEnabled;
  const sandboxMode =
    (paypalEnabled && PAYPAL_ENV === 'sandbox') || (payoneerEnabled && PAYONEER_ENV === 'sandbox');

  // Payoneer is a full-page redirect: create the LIST server-side (bounded amount),
  // then send the buyer to the hosted page. The receipt shows at /payoneer/return.
  const startPayoneer = async () => {
    if (!validRef.current) {
      setPayError('Please enter a valid amount, your name and a valid email first.');
      return;
    }
    setPayError('');
    setPayoneerBusy(true);
    try {
      const f = fieldsRef.current;
      const { redirectUrl } = await startPayoneerCustom({
        amount: f.amount,
        reference: f.reference,
        description: f.description,
        customer: { name: f.name, email: f.email },
      });
      window.location.href = redirectUrl;
    } catch (e) {
      setPayoneerBusy(false);
      setPayError(e.message || 'Could not start the Payoneer payment. Please try again.');
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
              setPaid({ amount: result.amount, captureId: result.captureId });
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

  return (
    <main className="pt-20">
      <SEO title="Make a payment" canonical="/pay" noindex />
      <section className="section-pad bg-[#EEF2FF] relative overflow-hidden min-h-[80vh]">
        <div className="line-grid absolute inset-0 opacity-40" />
        <div className="container-xl relative z-10 max-w-lg">
          <h1 className="font-heading font-800 text-[#1B3172] text-2xl sm:text-3xl mb-2">Make a payment</h1>
          <p className="text-[#64748b] text-sm mb-6">
            Securely pay an invoice, deposit or custom quote. Processed by PayPal or Payoneer — we never see your card details.
          </p>

          {status === 'paid' && paid ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-[0_8px_32px_rgba(27,49,114,0.08)]">
              <CheckCircle2 className="w-14 h-14 text-green-600 mx-auto mb-4" />
              <h2 className="font-heading font-800 text-[#1B3172] text-xl mb-1">Payment received</h2>
              <p className="text-[#475569] text-sm">
                Thank you — we’ve received <strong>${Number(paid.amount).toFixed(2)}</strong>
                {reference ? <> for <strong>{reference}</strong></> : null}.
              </p>
              <p className="text-xs text-[#94a3b8] mt-2">Confirmation: {paid.captureId}</p>
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
                  {sandboxMode && (
                    <div className="mb-4 flex items-center gap-2.5 rounded-xl bg-amber-50 border border-amber-200 px-4 py-2.5 text-amber-800 text-xs">
                      <ShieldCheck className="w-4 h-4 shrink-0" />
                      <span><strong>Sandbox test mode</strong> — no real money moves.</span>
                    </div>
                  )}

                  {reference && (
                    <div className="mb-4 text-sm">
                      <span className="text-[#64748b]">Reference: </span>
                      <span className="font-semibold text-[#1B3172]">{reference}</span>
                    </div>
                  )}

                  <label className="block text-sm font-semibold text-[#334155] mb-1.5">Amount (USD)</label>
                  <div className="relative mb-4">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748b] font-semibold">$</span>
                    <input
                      type="number" min="1" step="0.01" inputMode="decimal"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      readOnly={Boolean(urlAmount)}
                      placeholder="0.00"
                      className={`w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#1B3172] focus:ring-2 focus:ring-[rgba(27,49,114,0.08)] ${urlAmount ? 'bg-slate-50 text-[#1B3172] font-bold' : 'bg-[#f8faff]'}`}
                    />
                  </div>

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
                      <div ref={paypalRef} className={detailsValid ? '' : 'opacity-60'} />
                    </div>
                  )}

                  {payoneerEnabled && (
                    <div className={paypalEnabled && payoneerEnabled && payMethod !== 'payoneer' ? 'hidden' : ''}>
                      <button
                        type="button"
                        onClick={startPayoneer}
                        disabled={payoneerBusy || !detailsValid}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#FF4800] hover:bg-[#e64100] text-white text-[15px] font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {payoneerBusy
                          ? <><Loader2 className="w-4 h-4 animate-spin" /> Redirecting to Payoneer…</>
                          : <>Pay with Payoneer</>}
                      </button>
                    </div>
                  )}

                  {payError && (
                    <div className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-px" /> <span>{payError}</span>
                    </div>
                  )}

                  <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-[#94a3b8]">
                    <Lock className="w-3.5 h-3.5" /> Secured by {paypalEnabled && payoneerEnabled ? 'PayPal & Payoneer' : payoneerEnabled ? 'Payoneer' : 'PayPal'}
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
