import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { TESTIMONIALS } from '../../data/siteData';

function TestimonialCard({ t, pos }) {
  const isCenter = pos === 1;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{
        opacity: pos === 1 ? 1 : 0.65,
        scale: pos === 1 ? 1 : 0.93,
        y: pos === 1 ? 0 : 12,
      }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ duration: 0.4 }}
      className="relative rounded-2xl p-7 flex flex-col"
      style={{
        background: isCenter
          ? 'rgba(255,255,255,0.97)'
          : 'rgba(255,255,255,0.8)',
        border: isCenter
          ? '1px solid rgba(107,63,160,0.22)'
          : '1px solid rgba(29,78,216,0.1)',
        boxShadow: isCenter
          ? '0 20px 60px rgba(107,63,160,0.18), 0 4px 20px rgba(27,49,114,0.1)'
          : '0 4px 20px rgba(27,49,114,0.07)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Gradient accent top-right corner */}
      {isCenter && (
        <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-[60px] rounded-tr-2xl opacity-10 pointer-events-none"
          style={{ background: 'linear-gradient(135deg, #6B3FA0, #1D4ED8)' }} />
      )}

      {/* Quote icon */}
      <div className="mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isCenter ? 'bg-gradient-to-br from-[#6B3FA0] to-[#1D4ED8]' : 'bg-slate-100'}`}>
          <Quote className={`w-5 h-5 ${isCenter ? 'text-white' : 'text-[#64748b]'}`} />
        </div>
      </div>

      <p className="text-[#475569] text-[15px] leading-relaxed flex-1 mb-5 italic">"{t.quote}"</p>

      {/* Stars */}
      <div className="flex gap-0.5 mb-4">
        {[...Array(t.rating)].map((_, i) => (
          <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
        ))}
      </div>

      {/* Author */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6B3FA0] to-[#1D4ED8] flex items-center justify-center text-white font-heading font-700 text-sm flex-shrink-0">
            {t.avatar}
          </div>
          <div>
            <div className="text-[#1B3172] font-heading font-600 text-sm">{t.name}</div>
            <div className="text-[#64748b] text-xs">{t.role}, {t.company}</div>
          </div>
        </div>
        <span className="text-[11px] bg-[#6B3FA0]/10 text-[#6B3FA0] border border-[#6B3FA0]/15 px-2.5 py-1 rounded-full font-medium">
          {t.service}
        </span>
      </div>
    </motion.div>
  );
}

export default function TestimonialsSection() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);

  const next = () => setCurrent((c) => (c + 1) % TESTIMONIALS.length);
  const prev = () => setCurrent((c) => (c - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);

  // Auto-advance
  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(next, 4000);
    return () => clearInterval(timerRef.current);
  }, [paused, current]);

  const getVisible = () => [
    (current - 1 + TESTIMONIALS.length) % TESTIMONIALS.length,
    current,
    (current + 1) % TESTIMONIALS.length,
  ];

  const visible = getVisible();

  return (
    <section
      className="section-pad bg-dark relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background orb */}
      <div className="orb orb-blue w-[600px] h-[600px] top-1/2 -translate-y-1/2 -right-64 opacity-8" />
      <div className="orb orb-purple w-[400px] h-[400px] bottom-0 -left-32 opacity-6" />

      {/* Wavy SVG divider top */}
      <svg className="absolute top-0 left-0 w-full pointer-events-none" viewBox="0 0 1440 40" preserveAspectRatio="none" aria-hidden="true" fill="none">
        <path d="M0,20 C360,40 720,0 1440,20" stroke="rgba(107,63,160,0.12)" strokeWidth="1.5" />
      </svg>

      <div className="container-xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="section-label mx-auto mb-4">Client Success Stories</div>
          <h2 className="text-4xl lg:text-5xl font-heading font-700 text-[#1B3172] mb-4">
            What Our <span className="gradient-text">Clients Say</span>
          </h2>
          <p className="text-[#475569] text-lg max-w-xl mx-auto">
            Don't take our word for it — hear from the 200+ businesses we've helped grow.
          </p>
        </motion.div>

        {/* Desktop: 3 visible cards */}
        <div className="hidden lg:grid grid-cols-3 gap-5 mb-10">
          {visible.map((idx, pos) => (
            <TestimonialCard key={`${idx}-${pos}`} t={TESTIMONIALS[idx]} pos={pos} />
          ))}
        </div>

        {/* Mobile: single card */}
        <div className="lg:hidden mb-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl p-7"
              style={{
                background: 'rgba(255,255,255,0.95)',
                border: '1px solid rgba(107,63,160,0.2)',
                boxShadow: '0 16px 48px rgba(107,63,160,0.15)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6B3FA0] to-[#1D4ED8] flex items-center justify-center mb-4">
                <Quote className="w-5 h-5 text-white" />
              </div>
              <p className="text-[#475569] text-[15px] leading-relaxed mb-5 italic">"{TESTIMONIALS[current].quote}"</p>
              <div className="flex gap-0.5 mb-4">
                {[...Array(TESTIMONIALS[current].rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6B3FA0] to-[#1D4ED8] flex items-center justify-center text-white font-heading font-700 text-sm">
                  {TESTIMONIALS[current].avatar}
                </div>
                <div>
                  <div className="text-[#1B3172] font-heading font-600 text-sm">{TESTIMONIALS[current].name}</div>
                  <div className="text-[#64748b] text-xs">{TESTIMONIALS[current].role}, {TESTIMONIALS[current].company}</div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button onClick={prev} aria-label="Previous testimonial"
            className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
            style={{
              background: 'rgba(255,255,255,0.85)',
              border: '1px solid rgba(29,78,216,0.12)',
              boxShadow: '0 4px 16px rgba(27,49,114,0.08)',
              backdropFilter: 'blur(12px)',
              color: '#1B3172',
            }}>
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Dot progress */}
          <div className="flex gap-2">
            {TESTIMONIALS.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                aria-label={`Go to testimonial ${i + 1}`}
                className="rounded-full transition-all duration-300 cursor-pointer"
                style={{
                  height: '8px',
                  width: i === current ? '28px' : '8px',
                  background: i === current
                    ? 'linear-gradient(to right, #6B3FA0, #1D4ED8)'
                    : 'rgba(100,116,139,0.3)',
                }}
              />
            ))}
          </div>

          <button onClick={next} aria-label="Next testimonial"
            className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
            style={{
              background: 'rgba(255,255,255,0.85)',
              border: '1px solid rgba(29,78,216,0.12)',
              boxShadow: '0 4px 16px rgba(27,49,114,0.08)',
              backdropFilter: 'blur(12px)',
              color: '#1B3172',
            }}>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Pause indicator */}
        {paused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mt-4"
          >
            <span className="text-xs text-[#64748b]">Auto-play paused</span>
          </motion.div>
        )}
      </div>
    </section>
  );
}
