import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, Users, Phone, Repeat, Check, ArrowRight } from 'lucide-react';
import FreeWebsiteModal from '../FreeWebsiteModal';

// "We fix the 4 areas where most small businesses lose growth."
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
      'People search you up before they ever call. If they cannot find you, do not trust what they see, or land on a site that looks abandoned, they pick someone else — even if you do better work.',
    problems: [
      'Your business barely shows up when people search on Google',
      "Your logo and website don't clearly say who you are or who you serve",
      'Competitors with weaker work rank above you on Google',
      'People check your profile, see no reviews or old photos, and leave',
      'Your website looks like a brochure, not an active business',
      "You're stuck depending on referrals because no one finds you cold",
    ],
    result:
      'People find you first, trust you faster, and reach out before they call a competitor.',
  },
  {
    num: '02',
    icon: Users,
    title: 'Lead Capture & CRM',
    color: 'from-violet-600 to-blue-600',
    accent: '#7C3AED',
    glow: 'rgba(124,58,237,0.30)',
    tint: 'rgba(124,58,237,0.07)',
    mainPain:
      'Even when people show interest, nothing is actually catching them. A form goes to an inbox no one checks. A WhatsApp message gets answered two days late. Every gap is a lead you paid for and lost.',
    problems: [
      'Website visitors leave without a clear way to enquire',
      'Leads land in email, WhatsApp and calls — nothing in one place',
      'No one owns follow-up, so leads just sit there untouched',
      "You can't tell which leads are serious and which are browsing",
      'Good enquiries go cold because no one replied fast enough',
      'No record exists of what was promised to which customer',
    ],
    result:
      'Every enquiry lands somewhere, gets owned, and gets answered — before it disappears.',
  },
  {
    num: '03',
    icon: Phone,
    title: 'Sales & Follow-up',
    color: 'from-amber-500 to-orange-500',
    accent: '#F97316',
    glow: 'rgba(249,115,22,0.30)',
    tint: 'rgba(249,115,22,0.07)',
    mainPain:
      'Most sales happen on the third or fourth follow-up, not the first call. With no script, no quote process and no easy way to pay, the deal stalls right when the customer was ready to say yes.',
    problems: [
      '"Send me details" turns into silence — no one follows up',
      'Quotes go out but nobody tracks if they were accepted',
      "Pricing isn't clear, so every deal turns into a negotiation",
      'Payment follow-up feels awkward, so it gets delayed or skipped',
      'No consistent script, so results depend on who picks up the call',
      'Deals that were 90% closed quietly die for no clear reason',
    ],
    result:
      'A repeatable way to follow up, quote, and close — so deals stop dying from silence.',
  },
  {
    num: '04',
    icon: Repeat,
    title: 'Customer Growth',
    color: 'from-emerald-500 to-teal-500',
    accent: '#10B981',
    glow: 'rgba(16,185,129,0.30)',
    tint: 'rgba(16,185,129,0.07)',
    mainPain:
      'Winning a customer once is the expensive part. Most businesses do it and then never ask for more — no repeat orders, no referrals, no relationship after the invoice is paid.',
    problems: [
      'Customers finish the job and you never hear from them again',
      'No one asks for a review, so your online trust never grows',
      "Past customers don't know you offer anything else to buy",
      'Referrals happen by luck, not because anyone ever asked',
      "Complaints aren't tracked, so the same mistakes repeat",
      'Nothing gives a past customer a reason to think of you again',
    ],
    result:
      'Past customers come back, refer others, and become your cheapest source of new business.',
  },
];

function AreaCard({ area, index, onCountChange }) {
  const [checked, setChecked] = useState(() => new Set());

  const toggle = (i) => {
    const next = new Set(checked);
    next.has(i) ? next.delete(i) : next.add(i);
    setChecked(next);
    onCountChange?.(index, next.size);
  };

  const count = checked.size;
  const total = area.problems.length;
  const isGap = count >= 3;
  const counterText =
    count === 0
      ? 'Tap what sounds familiar'
      : isGap
        ? `${count} of ${total} — that’s a real gap`
        : `${count} of ${total}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      className="group relative flex flex-col rounded-2xl bg-white/90 backdrop-blur-sm border border-slate-200/80 p-5 pt-6 overflow-hidden transition-shadow duration-300 hover:shadow-[0_24px_60px_var(--glow)] hover:border-transparent"
      style={{ ['--glow']: area.glow }}
    >
      {/* Top gradient accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${area.color}`} />

      {/* Ghost watermark number */}
      <span
        className="pointer-events-none absolute -top-1 right-3 font-heading font-800 leading-none select-none transition-all duration-300 group-hover:scale-110"
        style={{ fontSize: '70px', color: area.accent, opacity: 0.07 }}
      >
        {area.num}
      </span>

      <div className="flex items-center gap-3 mb-3">
        {/* Icon tile */}
        <div
          className={`relative w-11 h-11 rounded-xl bg-gradient-to-br ${area.color} flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-105`}
          style={{ boxShadow: `0 8px 22px ${area.glow}` }}
        >
          <area.icon className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-[#1B3172] font-heading font-800 text-lg">{area.title}</h3>
      </div>

      <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3.5 text-[13px] leading-relaxed text-[#475569] mb-4">
        <span className="font-bold text-[#1B3172]">Main Pain: </span>
        {area.mainPain}
      </div>

      <div className="flex items-baseline justify-between gap-2 mb-2">
        <p className="text-[11px] font-bold tracking-widest uppercase" style={{ color: area.accent }}>
          Real Business Pains It Fixes
        </p>
        <span
          className="text-[11px] font-semibold whitespace-nowrap transition-colors"
          style={{ color: isGap ? area.accent : '#94A3B8', fontWeight: isGap ? 700 : 600 }}
        >
          {counterText}
        </span>
      </div>

      <div className="space-y-0.5 mb-4 flex-grow">
        {area.problems.map((p, i) => {
          const on = checked.has(i);
          return (
            <button
              key={p}
              type="button"
              onClick={() => toggle(i)}
              aria-pressed={on}
              className="flex w-full items-start gap-2.5 text-left rounded-lg px-2 py-1.5 border border-transparent transition-colors cursor-pointer hover:[background:var(--tint)] hover:[border-color:var(--glow)]"
              style={{ ['--tint']: area.tint, ['--glow']: area.glow }}
            >
              <span
                className="mt-px w-[17px] h-[17px] rounded-md flex items-center justify-center shrink-0 transition-all"
                style={{
                  background: on ? area.accent : 'transparent',
                  border: `1.5px solid ${on ? area.accent : area.glow}`,
                }}
              >
                <Check
                  className="w-2.5 h-2.5 text-white transition-all"
                  strokeWidth={3}
                  style={{ opacity: on ? 1 : 0, transform: on ? 'scale(1)' : 'scale(0.5)' }}
                />
              </span>
              <span
                className="text-[13px] leading-snug text-[#475569] transition-opacity"
                style={{ opacity: on ? 0.48 : 1 }}
              >
                {p}
              </span>
            </button>
          );
        })}
      </div>

      {/* Result footer */}
      <div
        className="mt-auto rounded-xl p-3.5 flex items-start gap-3"
        style={{ background: area.tint, border: `1px solid ${area.glow}` }}
      >
        <span
          className={`w-6 h-6 rounded-lg bg-gradient-to-br ${area.color} flex items-center justify-center shrink-0`}
        >
          <ArrowRight className="w-3.5 h-3.5 text-white" />
        </span>
        <p className="text-[13px] leading-relaxed text-[#475569]">
          <span className="font-bold" style={{ color: area.accent }}>Result: </span>
          {area.result}
        </p>
      </div>
    </motion.div>
  );
}

// Opens the lead form once a visitor has tapped this many pains across all cards.
const TRIGGER_AT = 5;

export default function GrowthSystem() {
  const [showOffer, setShowOffer] = useState(false);
  const countsRef = useRef(AREAS.map(() => 0));
  const firedRef = useRef(false);

  const handleCountChange = (index, count) => {
    countsRef.current[index] = count;
    const total = countsRef.current.reduce((sum, n) => sum + n, 0);
    if (total >= TRIGGER_AT && !firedRef.current) {
      firedRef.current = true;
      setShowOffer(true);
    } else if (total < TRIGGER_AT) {
      // re-arm so it can fire again if they uncheck then re-cross the threshold
      firedRef.current = false;
    }
  };

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
            We Fix the 4 Areas Where Most Small Businesses{' '}
            <span className="gradient-text">Lose Growth</span>
          </h2>
          <p className="text-[#64748b] text-base sm:text-lg mt-5 max-w-3xl mx-auto leading-relaxed">
            A website alone does not grow a business. Visibility, capture, conversion and retention
            all have to work together — miss one and the others leak revenue. Tap what sounds like you.
          </p>
        </div>

        {/* Four areas — 2 up, 2 down */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-7">
          {AREAS.map((a, i) => (
            <AreaCard key={a.title} area={a} index={i} onCountChange={handleCountChange} />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <button
            type="button"
            onClick={() => setShowOffer(true)}
            className="btn-primary inline-flex text-base px-8 py-4 cursor-pointer"
          >
            Get Your Free Growth Audit
          </button>
          <p className="text-[#64748b] text-sm mt-4">
            See which of the 4 areas is costing you the most — before you spend on any of them.
          </p>
        </div>
      </div>

      {showOffer && <FreeWebsiteModal onClose={() => setShowOffer(false)} />}
    </section>
  );
}
