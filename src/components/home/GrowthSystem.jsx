import { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, Megaphone, Workflow, Check, ArrowRight } from 'lucide-react';
import FreeWebsiteModal from '../FreeWebsiteModal';

// "We fix the 3 areas where most small businesses lose growth."
const AREAS = [
  {
    num: '01',
    icon: Globe,
    title: 'Online Presence',
    color: 'from-blue-500 to-cyan-500',
    accent: '#0EA5E9',
    glow: 'rgba(14,165,233,0.30)',
    tint: 'rgba(14,165,233,0.07)',
    mainPain:
      'Customers search online before they call or buy. If your business is not visible on Google, your website is weak, or your online image does not build trust, they choose someone else.',
    problems: [
      'Your business is not showing properly on Google',
      'Customers search for your service, but competitors appear before you',
      'People nearby do not find your business online',
      'Customers check your business online and then do not call',
      'Ads bring visitors, but they do not trust enough to enquire',
      'Your business depends too much on referrals and old customers',
    ],
    result:
      'Better visibility, more trust, and more serious enquiries from people who are already looking for your service.',
  },
  {
    num: '02',
    icon: Megaphone,
    title: 'Lead Generation',
    color: 'from-violet-600 to-blue-600',
    accent: '#7C3AED',
    glow: 'rgba(124,58,237,0.30)',
    tint: 'rgba(124,58,237,0.07)',
    mainPain:
      'Either you are not getting enough leads, or you are getting leads that do not convert into paying customers.',
    problems: [
      'New leads are not coming regularly',
      'You have enough leads, but they are not the right clients',
      'You are getting price shoppers, not serious buyers',
      'You paid a lot for campaigns, but sales did not grow',
      'You do not know who to target or who to send emails to',
      'Your website, ads, or social media get views but not enquiries',
    ],
    result:
      'Better quality leads, clearer offers, stronger CTAs, and less wasted money on random marketing.',
  },
  {
    num: '03',
    icon: Workflow,
    title: 'Automation System',
    color: 'from-amber-500 to-orange-500',
    accent: '#F97316',
    glow: 'rgba(249,115,22,0.30)',
    tint: 'rgba(249,115,22,0.07)',
    mainPain:
      'Leads are coming, but sales are still not growing because follow-up, payment reminders, quotes, and customer communication are not managed properly.',
    problems: [
      'Leads come in, but nobody follows up on time',
      'Customers say "send details" and then go cold',
      'Quotes are sent, but nobody tracks them properly',
      'Payment follow-ups are manual and uncomfortable',
      'WhatsApp, email, calls, and website leads are scattered',
      'Old customers are not contacted again for repeat sales or referrals',
    ],
    result:
      'Faster follow-up, better lead tracking, better payment control, more conversions, repeat sales, and referrals.',
  },
];

export default function GrowthSystem() {
  const [showOffer, setShowOffer] = useState(false);
  return (
    <section className="section-pad bg-[#f6f8ff] relative overflow-hidden">
      {/* Decorative background */}
      <div className="dot-grid absolute inset-0 opacity-[0.35]" />
      <div className="absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.12), transparent 70%)' }} />
      <div className="absolute -bottom-32 -right-24 w-[460px] h-[460px] rounded-full blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.12), transparent 70%)' }} />

      <div className="container-xl relative z-10">
        <div className="text-center mb-14">
          <div className="section-label mx-auto mb-4">The Growth System</div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-800 text-[#1B3172] leading-tight">
            We Fix the 3 Areas Where Most Small Businesses{' '}
            <span className="gradient-text">Lose Growth</span>
          </h2>
          <p className="text-[#64748b] text-base sm:text-lg mt-5 max-w-3xl mx-auto leading-relaxed">
            Business growth does not happen only by having a website or running ads. You need
            visibility, the right leads, and a system that converts enquiries into sales.
          </p>
        </div>

        {/* Three areas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-7">
          {AREAS.map((a, i) => (
            <motion.div
              key={a.title}
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              whileHover={{ y: -8 }}
              className="group relative flex flex-col rounded-3xl bg-white/90 backdrop-blur-sm border border-slate-200/80 p-7 pt-8 overflow-hidden transition-shadow duration-300 hover:shadow-[0_24px_60px_var(--glow)] hover:border-transparent"
              style={{ ['--glow']: a.glow }}
            >
              {/* Top gradient accent bar */}
              <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${a.color}`} />

              {/* Ghost watermark number */}
              <span
                className="pointer-events-none absolute -top-2 right-3 font-heading font-800 leading-none select-none transition-all duration-300 group-hover:scale-110"
                style={{ fontSize: '92px', color: a.accent, opacity: 0.07 }}
              >
                {a.num}
              </span>

              {/* Icon tile */}
              <div
                className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${a.color} flex items-center justify-center mb-5 shadow-lg transition-transform duration-300 group-hover:scale-105`}
                style={{ boxShadow: `0 10px 28px ${a.glow}` }}
              >
                <a.icon className="w-7 h-7 text-white" />
              </div>

              <h3 className="text-[#1B3172] font-heading font-800 text-xl mb-4">{a.title}</h3>

              <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-4 text-sm leading-relaxed text-[#475569] mb-6">
                <span className="font-bold text-[#1B3172]">Main Pain: </span>
                {a.mainPain}
              </div>

              <div className="h-px bg-slate-100 mb-5" />

              <p className="text-[11px] font-bold tracking-widest uppercase mb-3" style={{ color: a.accent }}>
                Real Business Pains It Fixes
              </p>
              <div className="space-y-3 mb-7">
                {a.problems.map((p) => (
                  <div key={p} className="flex items-start gap-2.5 text-[#475569] text-sm leading-snug">
                    <span
                      className="mt-0.5 w-[18px] h-[18px] rounded-full flex items-center justify-center shrink-0"
                      style={{ background: a.tint }}
                    >
                      <Check className="w-3 h-3" strokeWidth={3} style={{ color: a.accent }} />
                    </span>
                    {p}
                  </div>
                ))}
              </div>

              {/* Result footer */}
              <div
                className="mt-auto rounded-2xl p-4 flex items-start gap-3"
                style={{ background: a.tint, border: `1px solid ${a.glow}` }}
              >
                <span
                  className={`w-7 h-7 rounded-lg bg-gradient-to-br ${a.color} flex items-center justify-center shrink-0`}
                >
                  <ArrowRight className="w-4 h-4 text-white" />
                </span>
                <p className="text-sm leading-relaxed text-[#475569]">
                  <span className="font-bold" style={{ color: a.accent }}>Result: </span>
                  {a.result}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <button
            type="button"
            onClick={() => setShowOffer(true)}
            className="btn-primary inline-flex text-base px-8 py-4 cursor-pointer"
          >
            Get Your Free Optimized Website Setup
          </button>
          <p className="text-[#64748b] text-sm mt-4">
            Start with your website, then connect lead generation and automation.
          </p>
        </div>
      </div>

      {showOffer && <FreeWebsiteModal onClose={() => setShowOffer(false)} />}
    </section>
  );
}
