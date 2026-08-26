import { useState } from 'react';
import { useNavigate, useSearchParams, Navigate } from 'react-router-dom';
import { Loader2, AlertTriangle, Lock } from 'lucide-react';
import SEO from '../../components/SEO';
import { useAdmin } from '../AdminContext';

export default function LoginPage() {
  const { user, loading, login } = useAdmin();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  // Where the guard bounced them from, so a deep link survives signing in.
  // Only same-site paths — an attacker-supplied ?next=https://… must not be
  // able to turn this form into an open redirect.
  const raw = params.get('next') || '/admin';
  const next = raw.startsWith('/') && !raw.startsWith('//') ? raw : '/admin';

  if (!loading && user) return <Navigate to={next} replace />;

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(email.trim(), password);
      navigate(next, { replace: true });
    } catch (err) {
      setError(err.message);
      setPassword('');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen grid place-items-center bg-[#EEF2FF] px-4">
      <SEO title="Sign in" canonical="/admin/login" noindex />

      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-purple to-brand-blue grid place-items-center text-white mx-auto mb-3">
            <Lock className="w-5 h-5" />
          </div>
          <h1 className="font-heading font-800 text-[#1B3172] text-xl">Novelio site manager</h1>
          <p className="text-sm text-[#64748b]">Sign in to edit the website.</p>
        </div>

        <form onSubmit={submit} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-[#475569] mb-1.5">Email</label>
            <input
              id="email" type="email" required autoComplete="username"
              value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#1B3172]"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-[#475569] mb-1.5">Password</label>
            <input
              id="password" type="password" required autoComplete="current-password"
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#1B3172]"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 px-3 py-2.5">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <button
            type="submit" disabled={busy}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-blue text-white text-sm font-semibold disabled:opacity-60 cursor-pointer"
          >
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}
            Sign in
          </button>
        </form>

        <p className="text-center text-xs text-[#94a3b8] mt-4">
          Forgot your password? An admin can reset it from the Team page.
        </p>
      </div>
    </main>
  );
}
