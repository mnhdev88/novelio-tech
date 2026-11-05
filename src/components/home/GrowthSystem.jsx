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
        ? `${count} of ${total}: that’s a real gap`
        : `${count} of ${total}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: (index % 2) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      viewport={{ once: true }}
      className="flex flex-col rounded-3xl bg-white overflow-hidden border border-[#0D246A]/15"
    >
      {/* Solid colour header: this is where the logo's palette does the talking */}
      <div className="relative p-6 lg:p-7 text-white overflow-hidden" style={{ background: area.accent }}>
        <span
          className="pointer-events-none absolute -top-3 right-3 font-heading font-800 leading-none select-none text-white/20"
          style={{ fontSize: '112px' }}
          aria-hidden="true"
        >
          {area.num}
        </span>
        <area.icon className="relative w-9 h-9 mb-5" strokeWidth={1.75} aria-hidden="true" />
        <h3 className="relative text-white font-heading font-800 text-2xl lg:text-3xl mb-3">{area.title}</h3>
        <p className="relative text-[15px] leading-relaxed text-white">
          <span className="font-700">Main Pain: </span>
          {area.mainPain}
        </p>
      </div>

      <div className="flex flex-col flex-grow p-6 lg:p-7">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 mb-3">
          <p className="font-heading text-xs font-700 tracking-widest uppercase" style={{ color: area.accent }}>
            Real Business Pains It Fixes
          </p>
          <span
            className="text-xs whitespace-nowrap transition-colors"
            style={{ color: isGap ? area.accent : '#5C6685', fontWeight: isGap ? 700 : 500 }}
          >
            {counterText}
          </span>
        </div>

        <div className="space-y-1 mb-5 flex-grow">
          {area.problems.map((p, i) => {
            const on = checked.has(i);
            return (
              <button
                key={p}
                type="button"
                onClick={() => toggle(i)}
                aria-pressed={on}
                className="flex w-full items-start gap-3 text-left rounded-lg px-2 py-2 transition-colors duration-150 cursor-pointer hover:[background:var(--tint)]"
                style={{ ['--tint']: area.tint }}
              >
                <span
                  className="mt-px w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors duration-150"
                  style={{
                    background: on ? area.accent : 'transparent',
                    border: `2px solid ${on ? area.accent : 'rgba(13,36,106,0.3)'}`,
                  }}
                >
                  <Check
                    className="w-3 h-3 text-white"
                    strokeWidth={3.5}
                    style={{ opacity: on ? 1 : 0 }}
                    aria-hidden="true"
                  />
                </span>
                <span className={`text-sm leading-snug ${on ? 'text-[#0D246A] font-500' : 'text-[#3F4A6B]'}`}>
                  {p}
                </span>
              </button>
            );
          })}
        </div>

        {/* Result footer */}
        <div className="mt-auto rounded-2xl p-4 flex items-start gap-3" style={{ background: area.tint }}>
          <span
            className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: area.accent }}
          >
            <ArrowRight className="w-3.5 h-3.5 text-white" aria-hidden="true" />
          </span>
          <p className="text-sm leading-relaxed text-[#2B3557]">
            <span className="font-700" style={{ color: area.accent }}>Result: </span>
            {area.result}
          </p>
        </div>
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
    <section className="section-pad bg-[#FBFAF6]">
      <div className="container-xl">
        <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6 lg:gap-16 items-end mb-12">
          <div>
            <div className="section-label">The Growth System</div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-800 leading-[1.05]">
              We Fix the 4 Areas Where Most Small Businesses{' '}
              <span className="gradient-text">Lose Growth</span>
            </h2>
          </div>
          <p className="text-[#3F4A6B] text-base sm:text-lg leading-relaxed">
            A website alone does not grow a business. Visibility, capture, conversion and retention
            all have to work together. Miss one and the others leak revenue. Tap what sounds like you.
          </p>
        </div>

        {/* Four areas — 2 up, 2 down */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
          {AREAS.map((a, i) => (
            <AreaCard key={a.title} area={a} index={i} onCountChange={handleCountChange} />
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-7 mt-12">
          <button
            type="button"
            onClick={() => {
              trackEvent('growth_audit_form_open', {
                location: 'growth_system',
                trigger: 'cta_button',
              });
              setShowOffer(true);
            }}
            className="btn-primary text-base px-8 py-4 justify-center cursor-pointer flex-shrink-0"
          >
            Get Your Free Growth Audit
          </button>
          <p className="text-[#3F4A6B] text-sm max-w-md">
            See which of the 4 areas is costing you the most, before you spend on any of them.
          </p>
        </div>
      </div>

      {showOffer && <FreeWebsiteModal onClose={() => setShowOffer(false)} />}
    </section>
  );
}
