import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, DollarSign, Activity, FileCheck2, LogOut, RotateCcw, ChevronRight } from 'lucide-react';
import SEO from '../../components/SEO';
import { useAuth } from '../../portal/AuthContext';
import { getAllCustomers, adminStats, cycleDeliverable, resetDemo } from '../../portal/store';
import { PRICING_PLANS } from '../../data/siteData';

const STATUS_CLS = {
  delivered:   'bg-green-100 text-green-700',
  in_progress: 'bg-amber-100 text-amber-700',
  pending:     'bg-slate-100 text-slate-500',
};
const STATUS_LABEL = { delivered: 'Delivered', in_progress: 'In progress', pending: 'Pending' };

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-purple to-brand-blue flex items-center justify-center text-white shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[#5C6685]">{label}</p>
        <p className="font-heading font-800 text-[#0D246A] text-xl">{value}</p>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [, force] = useState(0);
  const rerender = () => force((n) => n + 1);
  const [openId, setOpenId] = useState(null);

  const stats = adminStats();
  const customers = getAllCustomers();
  const planName = (id) => PRICING_PLANS.find((p) => p.id === id)?.name || '—';

  const doLogout = () => { logout(); navigate('/'); };
  const doReset = () => { if (confirm('Reset all demo data back to the seeded state?')) { resetDemo(); setOpenId(null); rerender(); } };
  const advance = (subId, dId) => { cycleDeliverable(subId, dId); rerender(); };

  return (
    <main className="pt-20">
      <SEO title="Admin: Back office" canonical="/portal/admin" noindex />
      <section className="section-pad-sm bg-[#F3F2EC] relative overflow-hidden min-h-[80vh]">
        <div className="line-grid absolute inset-0 opacity-30" />
        <div className="container-xl relative z-10">

          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0D246A] text-white text-xs font-bold tracking-wide mb-2">
                <Activity className="w-3.5 h-3.5" /> ADMIN BACK-OFFICE
              </div>
              <h1 className="font-heading font-800 text-[#0D246A] text-xl sm:text-2xl">Client &amp; subscription management</h1>
              <p className="text-[#5C6685] text-sm">Signed in as {user.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={doReset} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-[#3F4A6B] hover:text-[#0D246A] hover:border-[#0D246A] transition-all cursor-pointer">
                <RotateCcw className="w-4 h-4" /> Reset demo
              </button>
              <button onClick={doLogout} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-[#3F4A6B] hover:text-[#0D246A] hover:border-[#0D246A] transition-all cursor-pointer">
                <LogOut className="w-4 h-4" /> Sign out
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Stat icon={Users} label="Customers" value={stats.customers} />
            <Stat icon={Activity} label="Active subs" value={stats.activeSubs} />
            <Stat icon={DollarSign} label="Recurring (MRR)" value={`$${stats.mrr}`} />
            <Stat icon={FileCheck2} label="Paid invoices" value={stats.paidInvoices} />
          </div>

          {/* Customer table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="font-heading font-700 text-[#0D246A]">Customers</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {customers.map((c) => {
                const sub = c.subscription;
                const open = openId === c.id;
                return (
                  <div key={c.id}>
                    <button
                      onClick={() => setOpenId(open ? null : c.id)}
                      className="w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-purple to-brand-blue flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {c.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#0D246A] text-sm truncate">{c.name}</p>
                        <p className="text-xs text-[#5C6685] truncate">{c.email}</p>
                      </div>
                      <div className="hidden sm:block text-sm">
                        {sub && sub.status === 'active'
                          ? <span className="font-semibold text-[#0D246A]">{planName(sub.planId)}</span>
                          : <span className="text-[#5C6685]">No active plan</span>}
                      </div>
                      <div className="hidden md:block text-sm text-[#3F4A6B] w-20 text-right">
                        {sub && sub.status === 'active' ? `$${sub.monthlyTotal}/mo` : '—'}
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${sub?.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                        {sub?.status === 'active' ? 'Active' : sub?.status === 'cancelled' ? 'Cancelled' : 'None'}
                      </span>
                      <ChevronRight className={`w-4 h-4 text-[#5C6685] transition-transform ${open ? 'rotate-90' : ''}`} />
                    </button>

                    {open && sub && (
                      <div className="px-6 pb-5 bg-slate-50/60">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 text-sm">
                          <div><p className="text-[#5C6685] text-xs">Billing</p><p className="font-semibold text-[#0D246A] capitalize">{sub.billing}</p></div>
                          <div><p className="text-[#5C6685] text-xs">Started</p><p className="font-semibold text-[#0D246A]">{sub.createdAt}</p></div>
                          <div><p className="text-[#5C6685] text-xs">Next renewal</p><p className="font-semibold text-[#0D246A]">{sub.nextRenewal}</p></div>
                          <div><p className="text-[#5C6685] text-xs">Add-ons</p><p className="font-semibold text-[#0D246A]">{sub.addonIds.length}</p></div>
                        </div>
                        <p className="text-xs font-semibold text-[#0D246A] mb-2">Deliverables: click a status to advance it</p>
                        <ul className="space-y-2">
                          {sub.deliverables.map((d) => (
                            <li key={d.id} className="flex items-center justify-between gap-3">
                              <span className="text-sm text-[#2B3557]">{d.title}</span>
                              <button
                                onClick={() => advance(sub.id, d.id)}
                                className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-all cursor-pointer hover:opacity-80 ${STATUS_CLS[d.status]}`}
                                title="Click to advance status"
                              >
                                {STATUS_LABEL[d.status]}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-xs text-[#5C6685] mt-4">
            Demo data lives in your browser (localStorage). “Reset demo” restores the seeded customers and subscriptions.
          </p>
        </div>
      </section>
    </main>
  );
}
