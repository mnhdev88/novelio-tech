import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ArrowRight, Sparkles, ShieldCheck, HelpCircle } from 'lucide-react';
import SEO from '../components/SEO';
import CTABanner from '../components/home/CTABanner';
import { PRICING_PLANS, PRICING_ADDONS, PRICING_FAQ, PRICING_COMPARISON } from '../data/siteData';
import { trackEvent } from '../utils/analytics';

export default function PricingPage() {
  const [billing, setBilling] = useState('monthly'); // 'monthly' | 'yearly'
  const navigate = useNavigate();

  const choosePlan = (plan) => {
    trackEvent('select_plan', { plan_id: plan.id, plan_name: plan.name, billing });
    if (plan.id === 'free') navigate('/signup?plan=free');
    else navigate(`/checkout?plan=${plan.id}&billing=${billing}`);
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: PRICING_FAQ.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <main className="pt-20">
      <SEO
        title="Pricing — Business Growth Plans with Website Included Free"
        description="Your website, SSL, hosting, lead capture, Google setup and growth system — included in one monthly growth plan starting at $249/month. No heavy upfront website cost."
        canonical="/pricing"
        schema={faqSchema}
      />

      {/* Hero */}
      <section className="section-pad relative overflow-hidden bg-dark">
        <div className="orb orb-purple w-[500px] h-[500px] -top-48 -left-48 opacity-15" />
        <div className="orb orb-blue w-[400px] h-[400px] top-0 -right-32 opacity-10" />
        <div className="dot-grid absolute inset-0 opacity-40" />
        <div className="container-xl relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="section-label mx-auto mb-4">Simple, Transparent Pricing</div>
            <h1 className="text-4xl lg:text-6xl font-heading font-800 text-[#1B3172] mb-6 leading-tight">
              Your Growth Partner, <span className="gradient-text">on a Subscription</span>
            </h1>
            <p className="text-[#475569] text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed">
              Your website, SSL, hosting, lead capture, Google setup and growth tracking — included
              free with one predictable monthly growth plan. No $1,500–$3,000 upfront website cost.
            </p>

            {/* Billing toggle */}
            <div className="inline-flex items-center gap-1 mt-10 p-1.5 rounded-2xl bg-white border border-slate-200 shadow-[0_4px_24px_rgba(27,49,114,0.08)]">
              <button
                onClick={() => setBilling('monthly')}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  billing === 'monthly' ? 'bg-[#1B3172] text-white' : 'text-[#475569] hover:text-[#1B3172]'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBilling('yearly')}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                  billing === 'yearly' ? 'bg-[#1B3172] text-white' : 'text-[#475569] hover:text-[#1B3172]'
                }`}
              >
                Yearly
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  billing === 'yearly' ? 'bg-white/20 text-white' : 'bg-green-100 text-green-700'
                }`}>
                  2 months free
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Plans */}
      <section className="section-pad bg-[#EEF2FF] relative overflow-hidden">
        <div className="line-grid absolute inset-0 opacity-40" />
        <div className="container-xl relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch">
            {PRICING_PLANS.map((plan, i) => {
              const price = billing === 'yearly' ? plan.priceYearly : plan.priceMonthly;
              const isFree = price === 0;
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: (i % 4) * 0.08 }}
                  viewport={{ once: true }}
                  className={`relative rounded-2xl p-7 flex flex-col h-full bg-white border transition-all duration-300 hover:-translate-y-2 ${
                    plan.highlight
                      ? 'border-transparent ring-2 ring-brand-purple shadow-glow'
                      : 'border-slate-200 hover:shadow-[0_8px_32px_rgba(27,49,114,0.12)]'
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-brand-purple to-brand-blue text-white text-[11px] font-bold tracking-wide shadow-md">
                      <Sparkles className="w-3 h-3" />
                      {plan.badge}
                    </div>
                  )}

                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-5`}>
                    <span className="text-white font-heading font-bold text-lg">{plan.name[0]}</span>
                  </div>

                  <h3 className="text-[#1B3172] font-heading font-700 text-xl mb-1">{plan.name}</h3>
                  <p className="text-[#64748b] text-sm leading-relaxed mb-5 min-h-[40px]">{plan.tagline}</p>

                  <div className="mb-6">
                    {isFree ? (
                      <span className="text-4xl font-heading font-800 text-[#1B3172]">Free</span>
                    ) : (
                      <div className="flex items-end gap-1">
                        <span className="text-4xl font-heading font-800 text-[#1B3172]">${price}</span>
                        <span className="text-[#64748b] text-sm mb-1.5">/mo</span>
                      </div>
                    )}
                    {!isFree && (
                      <p className="text-xs text-[#64748b] mt-1">
                        {billing === 'yearly' ? `Billed yearly ($${price * 12}/yr)` : 'Billed monthly · 12-month plan'}
                        {' · '}
                        {plan.setupFee > 0 ? `$${plan.setupFee} setup` : 'no setup fee'}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => choosePlan(plan)}
                    className={`w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer mb-6 ${
                      plan.highlight
                        ? 'bg-[#1B3172] hover:bg-[#0d1f5c] text-white'
                        : 'border border-[rgba(29,78,216,0.2)] text-[#1B3172] hover:bg-[#1B3172] hover:text-white'
                    }`}
                  >
                    {plan.cta}
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <ul className="space-y-3 flex-1">
                    {plan.features.map((f, fi) => (
                      <li key={fi} className="flex items-start gap-2.5 text-[#475569] text-sm leading-snug">
                        <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  {plan.note && (
                    <p className="text-xs text-[#64748b] mt-6 pt-5 border-t border-slate-100">{plan.note}</p>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Custom / Enterprise strip */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mt-8 rounded-2xl bg-gradient-to-br from-[#1B3172] to-[#091830] p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left"
          >
            <div>
              <h3 className="text-white font-heading font-700 text-2xl mb-2">Need something custom?</h3>
              <p className="text-white/70 text-sm sm:text-base max-w-xl leading-relaxed">
                Multi-location, e-commerce or specialized needs? We'll scope a tailored monthly package around exactly what your business needs.
              </p>
            </div>
            <Link
              to="/contact"
              className="shrink-0 inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white text-[#1B3172] text-sm font-semibold hover:bg-slate-100 transition-all cursor-pointer"
            >
              Talk to Us
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* Add-ons + reassurance */}
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-white border border-slate-200 p-7">
              <h4 className="font-heading font-700 text-[#1B3172] text-lg mb-4">Optional add-ons</h4>
              <div className="flex flex-wrap gap-2.5">
                {PRICING_ADDONS.map((a) => (
                  <span key={a.id} className="px-3.5 py-1.5 rounded-full bg-[#EEF2FF] text-[#475569] text-sm">
                    {a.name} <span className="font-semibold text-[#1B3172]">+${a.price}/mo</span>
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-2xl bg-white border border-slate-200 p-7 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-heading font-700 text-[#1B3172] text-base mb-1">No payment to start</h4>
                <p className="text-[#64748b] text-sm leading-relaxed">
                  Pick a plan and we'll confirm scope and pricing with you before any billing begins.
                  Full website ownership transfers to you after your 12-month term.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Plan comparison */}
      <section className="section-pad bg-white">
        <div className="container-xl max-w-5xl">
          <div className="text-center mb-12">
            <div className="section-label mx-auto mb-4">Compare Plans</div>
            <h2 className="text-3xl sm:text-4xl font-heading font-800 text-[#1B3172]">
              Everything in Each <span className="gradient-text">Growth Plan</span>
            </h2>
            <p className="text-[#64748b] text-base mt-4 max-w-2xl mx-auto">
              Every plan includes your website free — with SSL, hosting and maintenance.
              Higher plans add the lead, sales, payment and retention systems that turn a website into a growth engine.
            </p>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-[#1B3172] text-white">
                  <th className="px-5 py-4 font-heading font-700 min-w-[180px]">Feature</th>
                  <th className="px-5 py-4 font-heading font-700 min-w-[150px]">Start My Growth<span className="block text-xs font-normal text-white/70 mt-0.5">$249/mo</span></th>
                  <th className="px-5 py-4 font-heading font-700 min-w-[150px] bg-brand-purple/90">Grow My Leads<span className="block text-xs font-normal text-white/70 mt-0.5">$499/mo</span></th>
                  <th className="px-5 py-4 font-heading font-700 min-w-[150px]">Scale My Business<span className="block text-xs font-normal text-white/70 mt-0.5">$999/mo</span></th>
                </tr>
              </thead>
              <tbody>
                {PRICING_COMPARISON.map((row, i) => (
                  <tr key={row.feature} className={i % 2 ? 'bg-[#f8faff]' : 'bg-white'}>
                    <td className="px-5 py-3.5 font-semibold text-[#1B3172]">{row.feature}</td>
                    {row.values.map((v, vi) => (
                      <td key={vi} className={`px-5 py-3.5 text-[#475569] ${vi === 1 ? 'bg-[#EEF2FF]/60' : ''}`}>
                        {v === '—' ? <span className="text-[#cbd5e1]">—</span> : v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-pad bg-[#EEF2FF]">
        <div className="container-xl max-w-3xl">
          <div className="text-center mb-12">
            <div className="section-label mx-auto mb-4">Questions</div>
            <h2 className="text-3xl sm:text-4xl font-heading font-800 text-[#1B3172]">
              Pricing <span className="gradient-text">FAQs</span>
            </h2>
          </div>
          <div className="space-y-4">
            {PRICING_FAQ.map((f) => (
              <details key={f.q} className="group rounded-2xl border border-slate-200 bg-[#f8faff] p-5 open:bg-white open:shadow-[0_4px_24px_rgba(27,49,114,0.08)] transition-all">
                <summary className="flex items-start gap-3 cursor-pointer list-none font-heading font-700 text-[#1B3172] text-base">
                  <HelpCircle className="w-5 h-5 text-brand-purple shrink-0 mt-0.5" />
                  <span className="flex-1">{f.q}</span>
                </summary>
                <p className="text-[#64748b] text-sm leading-relaxed mt-3 pl-8">{f.a}</p>
              </details>
            ))}
          </div>
          <p className="text-center text-[#64748b] text-sm mt-10">
            Still not sure which plan fits?{' '}
            <Link to="/contact" className="text-brand-purple font-semibold hover:underline">Get a free 30-min growth audit →</Link>
          </p>
        </div>
      </section>

      <CTABanner />
    </main>
  );
}
