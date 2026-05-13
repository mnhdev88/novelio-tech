import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { STATS } from '../../data/siteData';
import { useEffect, useRef, useState } from 'react';

function useCountUp(target, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    const num = parseInt(target);
    let startTime = null;
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * num));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

const STAT_COLORS = [
  'from-[#6B3FA0] to-[#1D4ED8]',
  'from-[#F97316] to-[#FACC15]',
  'from-[#22C55E] to-[#0EA5E9]',
  'from-[#EC4899] to-[#F97316]',
];

function StatCard({ stat, started, index }) {
  const count = useCountUp(stat.number, 1800, started);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 24 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.55, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      viewport={{ once: true }}
      whileHover={{ y: -4, boxShadow: '0 16px 48px rgba(107,63,160,0.2)' }}
      className="rounded-2xl p-6 text-center relative overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.9)',
        border: '1px solid rgba(29,78,216,0.13)',
        boxShadow: '0 4px 24px rgba(27,49,114,0.08)',
        backdropFilter: 'blur(16px)',
      }}
    >
      {/* Corner accent */}
      <div className={`absolute top-0 right-0 w-16 h-16 rounded-bl-3xl bg-gradient-to-br ${STAT_COLORS[index]} opacity-10`} />
      <div className={`text-3xl font-heading font-800 bg-gradient-to-r ${STAT_COLORS[index]} bg-clip-text text-transparent mb-1`}>
        {count}{stat.suffix}
      </div>
      <div className="text-[#64748b] text-sm font-medium">{stat.label}</div>
    </motion.div>
  );
}

export default function AboutTeaser() {
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true); }, { threshold: 0.2 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="section-pad relative overflow-hidden bg-dark">
      {/* Background decoration */}
      <div className="orb orb-blue w-[500px] h-[500px] top-0 right-0 opacity-8" />
      <div className="orb orb-purple w-[300px] h-[300px] bottom-0 left-0 opacity-8" />
      <div className="dot-grid absolute inset-0 opacity-40" />

      {/* Decorative SVG — orbit rings */}
      <svg className="absolute left-0 top-1/2 -translate-y-1/2 w-[520px] h-[520px] opacity-[0.04] pointer-events-none -translate-x-1/3"
        viewBox="0 0 520 520" fill="none">
        <circle cx="260" cy="260" r="240" stroke="#6B3FA0" strokeWidth="1.5" strokeDasharray="8 6" />
        <circle cx="260" cy="260" r="180" stroke="#1D4ED8" strokeWidth="1" strokeDasharray="5 8" />
        <circle cx="260" cy="260" r="120" stroke="#6B3FA0" strokeWidth="0.8" />
        <circle cx="260" cy="260" r="60"  stroke="#1D4ED8" strokeWidth="0.6" />
        {/* orbiting dot */}
        <circle cx="260" cy="20" r="7" fill="#6B3FA0">
          <animateTransform attributeName="transform" type="rotate" from="0 260 260" to="360 260 260" dur="18s" repeatCount="indefinite" />
        </circle>
        <circle cx="440" cy="260" r="5" fill="#1D4ED8">
          <animateTransform attributeName="transform" type="rotate" from="0 260 260" to="-360 260 260" dur="12s" repeatCount="indefinite" />
        </circle>
      </svg>

      <div className="container-xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left — stats grid */}
          <div ref={ref} className="relative">
            <div className="grid grid-cols-2 gap-4">
              {STATS.map((s, i) => (
                <StatCard key={i} stat={s} started={started} index={i} />
              ))}
            </div>

            {/* Big results card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              viewport={{ once: true }}
              className="mt-4 rounded-2xl p-5 flex items-center gap-5 relative overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.9)',
                border: '1px solid rgba(107,63,160,0.2)',
                boxShadow: '0 8px 32px rgba(107,63,160,0.12)',
                backdropFilter: 'blur(16px)',
              }}
            >
              <div className="absolute inset-0 opacity-5 pointer-events-none rounded-2xl"
                style={{ background: 'linear-gradient(135deg, #6B3FA0 0%, #1D4ED8 100%)' }} />
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6B3FA0] to-[#1D4ED8] flex items-center justify-center flex-shrink-0"
                style={{ boxShadow: '0 0 24px rgba(107,63,160,0.4)' }}>
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-[#1B3172] font-heading font-700 text-lg">Results-First Agency</div>
                <div className="text-[#475569] text-sm mt-0.5">We measure success in revenue, not vanity metrics.</div>
              </div>
              {/* Animated bar decoration */}
              <div className="ml-auto flex gap-1 items-end h-8 flex-shrink-0">
                {[40, 65, 50, 80, 60, 90, 75].map((h, i) => (
                  <motion.div key={i}
                    className="w-1.5 rounded-full bg-gradient-to-t from-[#6B3FA0] to-[#0EA5E9]"
                    initial={{ height: 0 }}
                    whileInView={{ height: `${h}%` }}
                    transition={{ duration: 0.8, delay: 0.5 + i * 0.06, ease: 'easeOut' }}
                    viewport={{ once: true }}
                    style={{ minHeight: '4px' }}
                  />
                ))}
              </div>
            </motion.div>

            {/* Floating achievement badge */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-5 -right-5 rounded-2xl px-4 py-3 z-10"
              style={{
                background: 'rgba(255,255,255,0.95)',
                border: '1px solid rgba(107,63,160,0.2)',
                boxShadow: '0 8px 32px rgba(107,63,160,0.18)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <div className="text-xl font-heading font-800 gradient-text">4.9/5 ★</div>
              <div className="text-xs text-[#64748b]">Google Reviews</div>
            </motion.div>
          </div>

          {/* Right — text */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
          >
            <div className="section-label mb-4">About Novelio Technologies</div>
            <h2 className="text-4xl lg:text-5xl font-heading font-700 text-[#1B3172] mb-6 leading-tight">
              We Are Your <span className="gradient-text">End-To-End</span> Digital Growth Partner
            </h2>
            <p className="text-[#475569] text-lg leading-relaxed mb-8">
              Founded with a mission to democratize digital success, Novelio Technologies LLC has helped businesses across industries achieve measurable growth through data-driven strategies and cutting-edge technology.
            </p>
            <ul className="space-y-4 mb-10">
              {[
                'Data-driven strategies tailored to your business goals',
                'Dedicated account team, not shared resources',
                'Transparent weekly and monthly performance reports',
                'Full-service capabilities under one roof',
              ].map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#6B3FA0] to-[#1D4ED8] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-[#475569] text-[15px]">{item}</span>
                </motion.li>
              ))}
            </ul>
            <Link to="/about" className="btn-primary inline-flex group">
              Learn More About Us
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
