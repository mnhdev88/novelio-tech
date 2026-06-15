import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, User, AlertCircle, ArrowRight } from 'lucide-react';
import SEO from '../../components/SEO';
import { useAuth } from '../../portal/AuthContext';
import { createSubscription } from '../../portal/store';

const inputCls =
  'w-full pl-11 pr-4 py-3 rounded-xl border border-[rgba(29,78,216,0.15)] bg-[#f8faff] text-[#334155] text-sm placeholder-[#94a3b8] focus:outline-none focus:border-[#1B3172] focus:ring-2 focus:ring-[rgba(27,49,114,0.08)] transition-all';

export default function AuthPage({ mode = 'login' }) {
  const isSignup = mode === 'signup';
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const redirect = params.get('redirect');
  const planParam = params.get('plan');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const res = isSignup ? signup(form) : login({ email: form.email, password: form.password });
    if (res.error) { setError(res.error); return; }

    // Free-plan signups from the pricing page get an active free subscription.
    if (isSignup && planParam === 'free' && res.user) {
      createSubscription({ userId: res.user.id, planId: 'free', billing: 'monthly', addonIds: [] });
    }
    navigate(redirect ? decodeURIComponent(redirect) : '/dashboard', { replace: true });
  };

  const otherHref = (base) => {
    const qs = params.toString();
    return qs ? `${base}?${qs}` : base;
  };

  return (
    <main className="pt-20">
      <SEO title={isSignup ? 'Create your account' : 'Sign in'} canonical={isSignup ? '/signup' : '/login'} noindex />
      <section className="section-pad relative overflow-hidden bg-dark min-h-[80vh] flex items-center">
        <div className="orb orb-purple w-[420px] h-[420px] -top-32 -left-32 opacity-15" />
        <div className="orb orb-blue w-[360px] h-[360px] bottom-0 -right-24 opacity-10" />
        <div className="dot-grid absolute inset-0 opacity-40" />
        <div className="container-xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="max-w-md mx-auto bg-white rounded-3xl border border-slate-200 shadow-[0_8px_40px_rgba(27,49,114,0.12)] p-8 sm:p-10"
          >
            <div className="text-center mb-8">
              <h1 className="font-heading font-800 text-[#1B3172] text-2xl sm:text-3xl mb-2">
                {isSignup ? 'Create your account' : 'Welcome back'}
              </h1>
              <p className="text-[#64748b] text-sm">
                {isSignup ? 'Start your subscription in minutes.' : 'Sign in to manage your subscription.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignup && (
                <div className="relative">
                  <User className="w-4 h-4 text-[#64748b] absolute left-4 top-1/2 -translate-y-1/2" />
                  <input type="text" required placeholder="Full name" value={form.name} onChange={set('name')} className={inputCls} />
                </div>
              )}
              <div className="relative">
                <Mail className="w-4 h-4 text-[#64748b] absolute left-4 top-1/2 -translate-y-1/2" />
                <input type="email" required placeholder="Email address" value={form.email} onChange={set('email')} className={inputCls} />
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#64748b] absolute left-4 top-1/2 -translate-y-1/2" />
                <input type="password" required placeholder="Password" value={form.password} onChange={set('password')} className={inputCls} />
              </div>

              {error && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button type="submit" className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#1B3172] hover:bg-[#0d1f5c] text-white text-[15px] font-semibold transition-all cursor-pointer">
                {isSignup ? 'Create account' : 'Sign in'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <p className="text-center text-sm text-[#64748b] mt-6">
              {isSignup ? 'Already have an account? ' : "Don't have an account? "}
              <Link to={otherHref(isSignup ? '/login' : '/signup')} className="text-brand-purple font-semibold hover:underline">
                {isSignup ? 'Sign in' : 'Sign up'}
              </Link>
            </p>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
