import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { TESTIMONIALS } from '../../data/siteData';

function Stars({ count }) {
  return (
    <div className="flex gap-0.5" role="img" aria-label={`${count} out of 5 stars`}>
      {[...Array(count)].map((_, i) => (
        <Star key={i} className="w-4 h-4 text-[#F0A030] fill-[#F0A030]" aria-hidden="true" />
      ))}
    </div>
  );
}

// The middle card is the featured one: solid navy, with the side cards on white.
function TestimonialCard({ t, featured = false }) {
  return (
    <div className={`rounded-3xl p-7 lg:p-8 flex flex-col h-full ${featured ? 'bg-[#0D246A] text-white' : 'bg-white border border-[#0D246A]/15'}`}>
      <Stars count={t.rating} />
      <p className={`text-base lg:text-[17px] leading-relaxed flex-1 mt-5 mb-7 ${featured ? 'text-white' : 'text-[#2B3557]'}`}>
        &ldquo;{t.quote}&rdquo;
      </p>
      <div className="flex items-center gap-3">
        <div className={`w-11 h-11 rounded-full flex items-center justify-center font-heading font-700 text-sm flex-shrink-0 ${featured ? 'bg-[#F0D030] text-[#0D246A]' : 'bg-[#0D246A] text-white'}`}>
          {t.avatar}
        </div>
        <div className="min-w-0">
          <div className={`font-heading font-700 text-base leading-tight ${featured ? 'text-white' : 'text-[#0D246A]'}`}>{t.name}</div>
          <div className={`text-[13px] ${featured ? 'text-white/85' : 'text-[#5C6685]'}`}>{t.role}, {t.company}</div>
        </div>
      </div>
      <div className={`mt-5 pt-4 border-t text-xs font-600 ${featured ? 'border-white/20 text-[#F0D030]' : 'border-[#0D246A]/15 text-[#0D246A]'}`}>
        {t.service}
      </div>
    </div>
  );
}

export default function TestimonialsSection() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = () => setCurrent((c) => (c + 1) % TESTIMONIALS.length);
  const prev = () => setCurrent((c) => (c - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);

  // Auto-advance. Also pauses while keyboard focus is inside the carousel.
  useEffect(() => {
    if (paused) return undefined;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [paused, current]);

  const visible = [
    (current - 1 + TESTIMONIALS.length) % TESTIMONIALS.length,
    current,
    (current + 1) % TESTIMONIALS.length,
  ];

  return (
    <section
      className="section-pad bg-[#F3F2EC]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="container-xl">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div>
            <div className="section-label">Client Success Stories</div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-800 mb-4 leading-[1.05]">
              What Our <span className="gradient-text">Clients Say</span>
            </h2>
            <p className="text-[#3F4A6B] text-lg max-w-xl">
              Don&apos;t take our word for it. Hear from the 200+ businesses we&apos;ve helped grow.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={prev}
              aria-label="Previous testimonial"
              className="w-12 h-12 rounded-full flex items-center justify-center border-2 border-[#0D246A] text-[#0D246A] hover:bg-[#0D246A] hover:text-white transition-colors duration-200 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" aria-hidden="true" />
            </button>
            <button
              onClick={next}
              aria-label="Next testimonial"
              className="w-12 h-12 rounded-full flex items-center justify-center border-2 border-[#0D246A] text-[#0D246A] hover:bg-[#0D246A] hover:text-white transition-colors duration-200 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Desktop: 3 visible cards */}
        <div className="hidden lg:grid grid-cols-3 gap-5 mb-8">
          {visible.map((idx, pos) => (
            <motion.div
              key={`${idx}-${pos}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <TestimonialCard t={TESTIMONIALS[idx]} featured={pos === 1} />
            </motion.div>
          ))}
        </div>

        {/* Mobile: single card */}
        <div className="lg:hidden mb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25 }}
            >
              <TestimonialCard t={TESTIMONIALS[current]} featured />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress. The 44px hit area sits around a much smaller visible bar. */}
        <div className="flex gap-1">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Go to testimonial ${i + 1}`}
              aria-current={i === current}
              className="flex-1 h-11 flex items-center cursor-pointer group"
            >
              <span
                className="block w-full h-1 rounded-full transition-colors duration-200"
                style={{ background: i === current ? '#0D246A' : 'rgba(13,36,106,0.2)' }}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
