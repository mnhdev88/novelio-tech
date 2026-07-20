import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2, AlertCircle, XCircle, Clock } from 'lucide-react';
import SEO from '../../components/SEO';
import { useAuth } from '../../portal/AuthContext';
import { createSubscription } from '../../portal/store';
import { confirmPayoneer } from '../../utils/payoneer';

// Landing page for the redirect back from Payoneer's hosted payment page.
// It verifies the payment SERVER-SIDE (confirmPayoneer → /api/payoneer/confirm.php)
// and only then creates the subscription (plan) or shows a receipt (custom).
export default function PayoneerReturnPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const ref = params.get('ref') || '';
  const cancelled = params.get('cancelled') === '1';

  // checking | completed | pending | failed | cancelled
  const [state, setState] = useState(cancelled ? 'cancelled' : (ref ? 'checking' : 'failed'));
  const [result, setResult] = useState(null);
  const [error, setError] = useState(!cancelled && !ref ? 'Missing payment reference.' : '');
  const attemptsRef = useRef(0);

  useEffect(() => {
    if (cancelled || !ref) return;

    let stopped = false;
    let timer;

    const run = async () => {
      const data = await confirmPayoneer(ref);
      if (stopped) return;

      if (data.status === 'COMPLETED') {
        // Plan purchase → record the subscription and go to the dashboard.
        if (data.type === 'plan' && data.planId) {
          createSubscription({
            userId: user?.id || data.customer?.id,
            planId: data.planId,
            billing: data.billing || 'monthly',
            addonIds: data.addonIds || [],
          });
          navigate('/dashboard?welcome=1', { replace: true });
          return;
        }
        // Custom / one-off payment → show a receipt.
        setResult(data);
        setState('completed');
        return;
      }

      if (data.status === 'FAILED') {
        setError(data.error || 'The payment could not be completed. You have not been charged.');
        setState('failed');
        return;
      }

      // PENDING — the paid state isn't visible yet; poll a few times, then stop.
      attemptsRef.current += 1;
      if (attemptsRef.current >= 5) { setState('pending'); return; }
      timer = setTimeout(run, 2500);
    };

    run();
    return () => { stopped = true; clearTimeout(timer); };
  }, [ref, cancelled, user, navigate]);

  return (
    <main className="pt-20">
      <SEO title="Payment status" canonical="/payoneer/return" noindex />
      <section className="section-pad bg-[#EEF2FF] relative overflow-hidden min-h-[80vh]">
        <div className="line-grid absolute inset-0 opacity-40" />
        <div className="container-xl relative z-10 max-w-lg">
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-[0_8px_32px_rgba(27,49,114,0.08)]">

            {state === 'checking' && (
              <>
                <Loader2 className="w-12 h-12 text-brand-purple mx-auto mb-4 animate-spin" />
                <h1 className="font-heading font-800 text-[#1B3172] text-xl mb-1">Confirming your payment…</h1>
                <p className="text-[#64748b] text-sm">Please wait — don’t close this page.</p>
              </>
            )}

            {state === 'completed' && result && (
              <>
                <CheckCircle2 className="w-14 h-14 text-green-600 mx-auto mb-4" />
                <h1 className="font-heading font-800 text-[#1B3172] text-xl mb-1">Payment received</h1>
                <p className="text-[#475569] text-sm">
                  Thank you — we’ve received <strong>${Number(result.amount).toFixed(2)}</strong>
                  {result.reference ? <> for <strong>{result.reference}</strong></> : null}.
                </p>
                <p className="text-xs text-[#94a3b8] mt-2">Confirmation: {result.ref}</p>
                <Link to="/" className="inline-block mt-6 px-6 py-3 rounded-xl bg-[#1B3172] hover:bg-[#0d1f5c] text-white text-sm font-semibold">
                  Back to home
                </Link>
              </>
            )}

            {state === 'pending' && (
              <>
                <Clock className="w-14 h-14 text-amber-500 mx-auto mb-4" />
                <h1 className="font-heading font-800 text-[#1B3172] text-xl mb-1">Payment processing</h1>
                <p className="text-[#475569] text-sm">
                  Your payment is still being confirmed by Payoneer. If it went through, you’ll get an
                  email confirmation shortly and we’ll follow up — no need to pay again.
                </p>
                <Link to="/" className="inline-block mt-6 px-6 py-3 rounded-xl bg-[#1B3172] hover:bg-[#0d1f5c] text-white text-sm font-semibold">
                  Back to home
                </Link>
              </>
            )}

            {state === 'failed' && (
              <>
                <AlertCircle className="w-14 h-14 text-red-500 mx-auto mb-4" />
                <h1 className="font-heading font-800 text-[#1B3172] text-xl mb-1">Payment not completed</h1>
                <p className="text-[#475569] text-sm">{error}</p>
                <div className="mt-6 flex items-center justify-center gap-3">
                  <Link to="/pricing" className="px-6 py-3 rounded-xl bg-[#1B3172] hover:bg-[#0d1f5c] text-white text-sm font-semibold">
                    Back to plans
                  </Link>
                  <Link to="/contact" className="px-6 py-3 rounded-xl border border-slate-200 text-[#1B3172] text-sm font-semibold hover:border-slate-300">
                    Contact us
                  </Link>
                </div>
              </>
            )}

            {state === 'cancelled' && (
              <>
                <XCircle className="w-14 h-14 text-slate-400 mx-auto mb-4" />
                <h1 className="font-heading font-800 text-[#1B3172] text-xl mb-1">Payment cancelled</h1>
                <p className="text-[#475569] text-sm">No charge was made. You can pick up where you left off whenever you’re ready.</p>
                <Link to="/pricing" className="inline-block mt-6 px-6 py-3 rounded-xl bg-[#1B3172] hover:bg-[#0d1f5c] text-white text-sm font-semibold">
                  Back to plans
                </Link>
              </>
            )}

          </div>
        </div>
      </section>
    </main>
  );
}
