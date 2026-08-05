import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, CreditCard, ListChecks, Receipt, ArrowRight, ArrowUpRight,
  CheckCircle2, Clock, Circle, X, Sparkles, LogOut,
} from 'lucide-react';
import SEO from '../../components/SEO';
import { useAuth } from '../../portal/AuthContext';
import { getMySubscription, getMyInvoices, cancelSubscription, changeBilling } from '../../portal/store';
import { PRICING_PLANS, PRICING_ADDONS } from '../../data/siteData';

const STATUS_UI = {
  delivered:   { label: 'Delivered',   icon: CheckCircle2, cls: 'text-green-600' },
  in_progress: { label: 'In progress', icon: Clock,        cls: 'text-amber-500' },
  pending:     { label: 'Pending',     icon: Circle,       cls: 'text-slate-300' },
};

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">{label}</p>
      <p className="font-heading font-800 text-[#1B3172] text-2xl mt-1.5">{value}</p>
      {sub && <p className="text-xs text-[#64748b] mt-0.5">{sub}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [, force] = useState(0);
  const rerender = () => force((n) => n + 1);

  const sub = getMySubscription(user.id);
  const invoices = getMyInvoices(user.id);
  const plan = sub ? PRICING_PLANS.find((p) => p.id === sub.planId) : null;
  const justSubscribed = params.get('welcome') === '1';

  const doLogout = () => { logout(); navigate('/'); };
  const doCancel = () => { if (confirm('Cancel your subscription? Demo only — no real billing.')) { cancelSubscription(sub.id); rerender(); } };
  const doToggleBilling = () => { changeBilling(sub.id, sub.billing === 'monthly' ? 'yearly' : 'monthly'); rerender(); };

  const delivered = sub ? sub.deliverables.filter((d) => d.status === 'delivered').length : 0;
  const progress = sub && sub.deliverables.length ? Math.round((delivered / sub.deliverables.length) * 100) : 0;

  return (
    <main className="pt-20">
      <SEO title="Your Dashboard" canonical="/dashboard" noindex />
      <section className="section-pad-sm bg-[#EEF2FF] relative overflow-hidden min-h-[80vh]">
        <div className="line-grid absolute inset-0 opacity-30" />
        <div className="container-xl relative z-10">

          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-purple to-brand-blue flex items-center justify-center text-white">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-heading font-800 text-[#1B3172] text-xl sm:text-2xl leading-tight">
                  Welcome back, {user.name.split(' ')[0]}
                </h1>
                <p className="text-[#64748b] text-sm">{user.email}</p>
              </div>
            </div>
            <button onClick={doLogout} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-[#475569] hover:text-[#1B3172] hover:border-[#1B3172] transition-all cursor-pointer">
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>

          {justSubscribed && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex items-center gap-2.5 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-green-800 text-sm">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>Your <strong>{plan?.name}</strong> plan is active. Our team will reach out to kick off onboarding.</span>
            </motion.div>
          )}

          {/* No active subscription */}
          {!sub || sub.status !== 'active' ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center max-w-xl mx-auto">
              <h2 className="font-heading font-700 text-[#1B3172] text-xl mb-2">No active subscription</h2>
              <p className="text-[#64748b] text-sm mb-6">
                {sub?.status === 'cancelled' ? 'Your subscription was cancelled.' : "You haven't subscribed to a plan yet."} Choose a plan to get started.
              </p>
              <Link to="/pricing" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1B3172] hover:bg-[#0d1f5c] text-white text-sm font-semibold transition-all">
                View plans <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <>
              {/* Stat cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard label="Current plan" value={plan.name} sub={`Billed ${sub.billing}`} />
                <StatCard label="Recurring" value={`$${sub.monthlyTotal}/mo`} sub={sub.billing === 'yearly' ? `$${sub.monthlyTotal * 12}/yr` : '12-month plan'} />
                <StatCard label="Next renewal" value={sub.nextRenewal} />
                <StatCard label="Onboarding" value={`${progress}%`} sub={`${delivered}/${sub.deliverables.length} delivered`} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: deliverables */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <h2 className="font-heading font-700 text-[#1B3172] flex items-center gap-2 mb-1">
                      <ListChecks className="w-5 h-5 text-brand-purple" /> Your deliverables
                    </h2>
                    <p className="text-sm text-[#64748b] mb-4">What our team is delivering on your plan.</p>
                    {/* progress bar */}
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden mb-5">
                      <div className="h-full bg-gradient-to-r from-brand-purple to-brand-blue transition-all" style={{ width: `${progress}%` }} />
                    </div>
                    <ul className="space-y-3">
                      {sub.deliverables.map((d) => {
                        const ui = STATUS_UI[d.status];
                        const Icon = ui.icon;
                        return (
                          <li key={d.id} className="flex items-center justify-between gap-3 py-1">
                            <span className="flex items-center gap-3 text-sm text-[#334155]">
                              <Icon className={`w-4 h-4 shrink-0 ${ui.cls}`} /> {d.title}
                            </span>
                            <span className={`text-xs font-semibold ${ui.cls}`}>{ui.label}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {/* Invoices */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <h2 className="font-heading font-700 text-[#1B3172] flex items-center gap-2 mb-4">
                      <Receipt className="w-5 h-5 text-brand-purple" /> Invoices
                    </h2>
                    {invoices.length === 0 ? (
                      <p className="text-sm text-[#64748b]">No invoices yet.</p>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {invoices.map((inv) => (
                          <div key={inv.id} className="flex items-center justify-between py-3 text-sm">
                            <span className="text-[#475569]">{inv.date}</span>
                            <span className="font-semibold text-[#1B3172]">${inv.amount}.00</span>
                            <span className="text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-1 rounded-full capitalize">{inv.status}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: manage billing */}
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <h2 className="font-heading font-700 text-[#1B3172] flex items-center gap-2 mb-4">
                      <CreditCard className="w-5 h-5 text-brand-purple" /> Manage billing
                    </h2>
                    <div className="space-y-3">
                      {sub.addonIds.length > 0 && (
                        <div className="text-sm">
                          <p className="text-[#64748b] text-xs font-semibold uppercase tracking-wide mb-1.5">Active add-ons</p>
                          <ul className="space-y-1">
                            {sub.addonIds.map((id) => {
                              const a = PRICING_ADDONS.find((x) => x.id === id);
                              return <li key={id} className="flex justify-between text-[#475569]"><span>{a?.name}</span><span>+${a?.price}</span></li>;
                            })}
                          </ul>
                          <div className="border-t border-slate-100 my-3" />
                        </div>
                      )}
                      <Link to={`/checkout?plan=${sub.planId}&billing=${sub.billing}`} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1B3172] hover:bg-[#0d1f5c] text-white text-sm font-semibold transition-all">
                        Change plan / add-ons <ArrowUpRight className="w-4 h-4" />
                      </Link>
                      <button onClick={doToggleBilling} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-[#475569] hover:text-[#1B3172] hover:border-[#1B3172] transition-all cursor-pointer">
                        {sub.billing === 'monthly'
                          ? (() => {
                              // Savings vary per plan, so derive rather than hardcode.
                              const p = PRICING_PLANS.find((x) => x.id === sub.planId);
                              const saving = p?.termTotal
                                ? p.termTotal - (p.priceYearlyTotal ?? p.priceYearly * 12)
                                : 0;
                              return saving > 0 ? `Switch to yearly (save $${saving})` : 'Switch to yearly';
                            })()
                          : 'Switch to monthly'}
                      </button>
                      <button onClick={doCancel} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-sm font-semibold text-red-600 hover:bg-red-50 transition-all cursor-pointer">
                        <X className="w-4 h-4" /> Cancel subscription
                      </button>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-[#1B3172] to-[#091830] rounded-2xl p-6 text-white">
                    <h3 className="font-heading font-700 text-lg mb-1.5">Need a hand?</h3>
                    <p className="text-white/70 text-sm mb-4">Your growth team is one message away.</p>
                    <Link to="/contact" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#1B3172] text-sm font-semibold hover:bg-slate-100 transition-all">
                      Contact support <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
