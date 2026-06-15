import { motion } from 'framer-motion';
import { Globe, Megaphone, Workflow, Check, ArrowRight } from 'lucide-react';

// "We fix the 3 areas where most small businesses lose growth."
const AREAS = [
  {
    num: '01',
    icon: Globe,
    title: 'Correct Website',
    color: 'from-blue-500 to-cyan-500',
    accent: '#0EA5E9',
    glow: 'rgba(14,165,233,0.30)',
    tint: 'rgba(14,165,233,0.07)',
    desc: 'A good website helps customers understand your business, trust you faster, and take the next step without confusion.',
    problems: [
      'Customers visit your website but do not enquire',
      'People do not clearly understand what you offer',
      'Your business does not look trustworthy enough online',
      'Customers leave because they cannot find the right information',
      'You depend only on phone calls, referrals, or social messages',
    ],
    result: 'More trust, better enquiries, and a clearer path for customers to contact you.',
  },
  {
    num: '02',
    icon: Megaphone,
    title: 'Digital Presence',
    color: 'from-violet-600 to-blue-600',
    accent: '#7C3AED',
    glow: 'rgba(124,58,237,0.30)',
    tint: 'rgba(124,58,237,0.07)',
    desc: 'Customers check your Google profile, reviews, social media, and website before they decide to contact you.',
    problems: [
      'Customers cannot find you easily online',
      'Your competitors look more active and professional',
      'Your reviews and proof are not visible enough',
      'People see your business but do not feel confident',
      'You spend on ads without enough trust-building support',
    ],
    result: 'Better visibility, stronger trust, and more qualified customer enquiries.',
  },
  {
    num: '03',
    icon: Workflow,
    title: 'Automation',
    color: 'from-amber-500 to-orange-500',
    accent: '#F97316',
    glow: 'rgba(249,115,22,0.30)',
    tint: 'rgba(249,115,22,0.07)',
    desc: 'Automation helps you capture leads, follow up on time, track enquiries, support customers, and bring them back again.',
    problems: [
      'Leads come in but nobody follows up properly',
      'Quotes are sent but not tracked',
      'Customer messages get missed on WhatsApp or email',
      'Reviews are not collected after delivery',
      'Old customers are not contacted again for repeat sales',
    ],
    result: 'Fewer missed leads, faster follow-up, repeat sales, and referrals.',
  },
];

export default function GrowthSystem() {
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
            Your website, online presence, and follow-up system should work together. If one area is
            weak, leads get lost and sales slow down.
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

              <h3 className="text-[#1B3172] font-heading font-800 text-xl mb-2">{a.title}</h3>
              <p className="text-[#64748b] text-sm leading-relaxed mb-6">{a.desc}</p>

              <div className="h-px bg-slate-100 mb-5" />

              <p className="text-[11px] font-bold tracking-widest uppercase mb-3" style={{ color: a.accent }}>
                Problems it solves
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
      </div>
    </section>
  );
}
