import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import { COMPANY } from '../../data/siteData';

// Particle positions (deterministic so no hydration mismatch)
const PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  cx: ((i * 137.508) % 100).toFixed(1),
  cy: ((i * 97.312) % 100).toFixed(1),
  r:  (1.2 + (i % 4) * 0.6).toFixed(1),
  dur: (4 + (i % 7) * 0.9).toFixed(1),
  begin: ((i * 0.35) % 4).toFixed(1),
}));

export default function CTABanner() {
  const sectionRef = useRef(null);
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });

  const onMove = (e) => {
    const r = sectionRef.current?.getBoundingClientRect();
    if (!r) return;
    setGlowPos({
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
    });
  };

  return (
    <section
      ref={sectionRef}
      onMouseMove={onMove}
      className="section-pad-sm relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0E1E38 0%, #1a1050 50%, #0E1E38 100%)' }}
    >
      {/* Animated gradient mesh background */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-150"
        style={{
          background: `radial-gradient(ellipse 55% 50% at ${glowPos.x}% ${glowPos.y}%, rgba(107,63,160,0.35) 0%, transparent 65%)`,
        }}
      />
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 40% 45% at ${glowPos.x}% ${glowPos.y}%, rgba(29,78,216,0.2), transparent 60%)`,
          transition: 'background 0.15s ease',
        }} />

      {/* Particle field SVG */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
        {PARTICLES.map((p, i) => (
          <circle key={i} cx={`${p.cx}%`} cy={`${p.cy}%`} r={p.r} fill="white">
            <animate attributeName="opacity" values="0.05;0.4;0.05"
              dur={`${p.dur}s`} begin={`${p.begin}s`} repeatCount="indefinite" />
            <animate attributeName="r" values={`${p.r};${parseFloat(p.r)+1.5};${p.r}`}
              dur={`${p.dur}s`} begin={`${p.begin}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </svg>

      {/* Concentric pulse rings */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        {[12, 22, 34, 48].map((r, i) => (
          <circle key={i} cx="50" cy="50" r={r} stroke="white" strokeWidth="0.15" fill="none">
            <animate attributeName="r" values={`${r};${r+6};${r}`} dur={`${5+i*1.5}s`} begin={`${i*1.2}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.8;0.2;0.8" dur={`${5+i*1.5}s`} begin={`${i*1.2}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </svg>

      {/* Diagonal shine lines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: 'repeating-linear-gradient(45deg, white 0px, white 1px, transparent 1px, transparent 60px)',
        }} />

      {/* Edge glow blobs */}
      <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-white/5 blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-white/5 blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="container-lg relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true }}
        >
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-white/80 text-sm font-medium mb-8"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              backdropFilter: 'blur(12px)',
            }}
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Limited spots available this month
          </motion.div>

          {/* Headline — word by word */}
          <h2 className="text-4xl lg:text-6xl font-heading font-800 text-white mb-6 leading-tight">
            {['Ready', 'to', 'See', "What's"].map((w, i) => (
              <motion.span key={w}
                initial={{ opacity: 0, y: 28, filter: 'blur(6px)' }}
                whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
                className="inline-block mr-[0.2em]"
              >
                {w}
              </motion.span>
            ))}
            <br />
            {['Holding', 'Your', 'Business', 'Back?'].map((w, i) => (
              <motion.span key={w}
                initial={{ opacity: 0, y: 28, filter: 'blur(6px)' }}
                whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.5, delay: 0.38 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
                className="inline-block mr-[0.2em]"
                style={{ backgroundImage: 'linear-gradient(90deg, #F97316, #FACC15, #22C55E, #0EA5E9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
              >
                {w}
              </motion.span>
            ))}
          </h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            viewport={{ once: true }}
            className="text-white/75 text-xl max-w-2xl mx-auto mb-3 leading-relaxed"
          >
            Takes 30 minutes. No credit card. No sales pitch. Just an honest look at your business.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.65 }}
            viewport={{ once: true }}
            className="text-white/50 text-sm mb-10"
          >
            Call us directly: <a href="tel:+19082012264" className="text-white/80 hover:text-white font-medium transition-colors">(908) 201-2264</a>
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.72 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a href="tel:+19082012264"
              className="inline-flex items-center gap-2 font-heading font-700 px-8 py-4 rounded-full text-[15px] w-full sm:w-auto justify-center group transition-all duration-300 hover:-translate-y-1"
              style={{
                background: 'white',
                color: '#6B3FA0',
                boxShadow: '0 8px 32px rgba(255,255,255,0.2)',
              }}
            >
              <Phone className="w-5 h-5" />
              Call Us Now
            </a>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.88 }}
            viewport={{ once: true }}
            className="flex flex-wrap items-center justify-center gap-6 mt-10"
          >
            {[
              { label: '200+', sub: 'Businesses Served' },
              { label: '12+',  sub: 'Years Experience' },
              { label: 'Free', sub: '30-Min Growth Audit' },
            ].map((b, i) => (
              <div key={i} className="flex items-center gap-3">
                {i > 0 && <div className="w-px h-6 bg-white/20" />}
                <div className="text-center">
                  <div className="text-xl font-heading font-800 text-white">{b.label}</div>
                  <div className="text-white/55 text-xs font-medium">{b.sub}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
