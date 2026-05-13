import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { PROCESS_STEPS } from '../../data/siteData';

const STEP_COLORS = [
  { from: '#6B3FA0', to: '#1D4ED8', glow: 'rgba(107,63,160,0.35)' },
  { from: '#1D4ED8', to: '#0EA5E9', glow: 'rgba(29,78,216,0.35)' },
  { from: '#0EA5E9', to: '#22C55E', glow: 'rgba(14,165,233,0.35)' },
  { from: '#22C55E', to: '#FACC15', glow: 'rgba(34,197,94,0.35)' },
];

export default function ProcessSection() {
  const [active, setActive] = useState(null);

  return (
    <section id="how-it-works" className="section-pad bg-[#EEF2FF] relative overflow-hidden">
      <div className="dot-grid absolute inset-0 opacity-40" />
      {/* Top orb */}
      <div className="orb orb-purple w-[500px] h-[500px] top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-8" />

      {/* Decorative SVG hex pattern */}
      <svg className="absolute bottom-0 right-0 w-72 h-72 opacity-[0.04] pointer-events-none" viewBox="0 0 200 200" fill="none">
        {[0,1,2,3].map(row => [0,1,2].map(col => {
          const x = col * 55 + (row % 2) * 27;
          const y = row * 48;
          const pts = Array.from({length:6},(_,i) => {
            const a = Math.PI/180*(60*i-30);
            return `${x+24*Math.cos(a)},${y+24*Math.sin(a)}`;
          }).join(' ');
          return <polygon key={`${row}-${col}`} points={pts} stroke="#6B3FA0" strokeWidth="0.8" fill="none" />;
        }))}
      </svg>

      <div className="container-xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="section-label mx-auto mb-4">How It Works</div>
          <h2 className="text-4xl lg:text-5xl font-heading font-700 text-[#1B3172] mb-4">
            Your Growth Journey Starts Here — <span className="gradient-text">Zero Risk</span>
          </h2>
          <p className="text-[#475569] text-lg max-w-xl mx-auto">
            Three steps from first conversation to measurable results — no obligation, no guesswork.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">

          {/* Animated connector line — desktop only */}
          <div className="hidden lg:block absolute top-14 left-[12.5%] right-[12.5%] h-px z-0">
            {/* Base track */}
            <div className="absolute inset-0 bg-slate-200 rounded-full" />
            {/* Animated fill */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ background: 'linear-gradient(to right, #6B3FA0, #1D4ED8, #0EA5E9, #22C55E)' }}
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
              viewport={{ once: true }}
              transformOrigin="left"
            />
            {/* Traveling pulse dot */}
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white"
              style={{ boxShadow: '0 0 12px rgba(107,63,160,0.8), 0 0 4px rgba(107,63,160,1)' }}
              initial={{ left: '0%' }}
              whileInView={{ left: '100%' }}
              transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
              viewport={{ once: true }}
            />
          </div>

          {PROCESS_STEPS.map((step, i) => {
            const col = STEP_COLORS[i] || STEP_COLORS[0];
            const isActive = active === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
                onHoverStart={() => setActive(i)}
                onHoverEnd={() => setActive(null)}
                className="relative"
              >
                {/* Connector arrows on mobile */}
                {i < PROCESS_STEPS.length - 1 && (
                  <div className="lg:hidden flex justify-center my-2">
                    <motion.div
                      animate={{ y: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="text-slate-300 text-xl"
                    >↓</motion.div>
                  </div>
                )}

                <motion.div
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ duration: 0.25 }}
                  className="relative rounded-2xl p-7 text-center overflow-hidden"
                  style={{
                    background: isActive
                      ? `linear-gradient(135deg, rgba(255,255,255,0.97), rgba(255,255,255,0.92))`
                      : 'rgba(255,255,255,0.85)',
                    border: isActive
                      ? `1px solid ${col.from}50`
                      : '1px solid rgba(29,78,216,0.11)',
                    boxShadow: isActive
                      ? `0 20px 60px ${col.glow}, 0 4px 20px rgba(27,49,114,0.1)`
                      : '0 4px 20px rgba(27,49,114,0.07)',
                    backdropFilter: 'blur(16px)',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {/* Background gradient on hover */}
                  <div
                    className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 pointer-events-none"
                    style={{
                      background: `linear-gradient(135deg, ${col.from}06 0%, ${col.to}06 100%)`,
                      opacity: isActive ? 1 : 0,
                    }}
                  />

                  {/* Step number with animated ring */}
                  <div className="relative w-16 h-16 mx-auto mb-5">
                    {/* Pulsing ring */}
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 rounded-2xl"
                        style={{ background: `linear-gradient(135deg, ${col.from}, ${col.to})` }}
                        animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
                        transition={{ duration: 1.8, repeat: Infinity }}
                      />
                    )}
                    <div
                      className="relative w-full h-full rounded-2xl flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${col.from}, ${col.to})`,
                        boxShadow: `0 8px 24px ${col.glow}`,
                      }}
                    >
                      <span className="font-heading font-800 text-white text-xl">{step.step}</span>
                    </div>
                  </div>

                  <h3 className="text-[#1B3172] font-heading font-700 text-xl mb-3 relative z-10">{step.title}</h3>
                  <p className="text-[#64748b] text-sm leading-relaxed relative z-10">{step.description}</p>

                  {/* Bottom accent line */}
                  <motion.div
                    className="absolute bottom-0 left-0 h-0.5 rounded-b-2xl"
                    style={{ background: `linear-gradient(to right, ${col.from}, ${col.to})` }}
                    initial={{ width: 0 }}
                    animate={{ width: isActive ? '100%' : '0%' }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA pill */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium"
            style={{
              background: 'rgba(255,255,255,0.9)',
              border: '1px solid rgba(107,63,160,0.2)',
              boxShadow: '0 4px 20px rgba(107,63,160,0.1)',
              backdropFilter: 'blur(12px)',
            }}>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[#475569]">Most projects launch within</span>
            <span className="gradient-text font-700">3–5 business days</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
