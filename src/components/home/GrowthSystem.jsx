import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';
import FreeWebsiteModal from '../FreeWebsiteModal';
import { trackEvent } from '../../utils/analytics';
import { HOMEPAGE } from '../../data/siteData';

const AREAS = HOMEPAGE.growthSystem.areas;

// "We fix the 4 areas where most small businesses lose growth."

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
const TRIGGER_AT = 4;

export default function GrowthSystem() {
  const [showOffer, setShowOffer] = useState(false);
  const countsRef = useRef(AREAS.map(() => 0));
  const firedRef = useRef(false);

  const handleCountChange = (index, count) => {
    countsRef.current[index] = count;
    const total = countsRef.current.reduce((sum, n) => sum + n, 0);
    if (total >= TRIGGER_AT && !firedRef.current) {
      firedRef.current = true;
      trackEvent('growth_audit_form_open', {
        location: 'growth_system',
        trigger: 'pain_threshold',
        pains_selected: total,
      });
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
            onClick={() => {
              trackEvent('growth_audit_form_open', {
                location: 'growth_system',
                trigger: 'cta_button',
              });
              setShowOffer(true);
            }}
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
