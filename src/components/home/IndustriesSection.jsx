import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { INDUSTRIES } from '../../data/siteData';

// Tailwind gradient class → hex for inline glow
const GLOW_COLORS = {
  'from-rose-500 to-pink-600':     '#F43F5E',
  'from-orange-500 to-amber-400':  '#F97316',
  'from-emerald-500 to-teal-600':  '#10B981',
  'from-yellow-500 to-orange-500': '#EAB308',
  'from-blue-600 to-indigo-700':   '#2563EB',
  'from-violet-500 to-purple-600': '#8B5CF6',
  'from-cyan-500 to-blue-600':     '#06B6D4',
  'from-slate-600 to-slate-800':   '#475569',
  'from-gray-500 to-zinc-700':     '#6B7280',
  'from-pink-500 to-rose-500':     '#EC4899',
  'from-amber-600 to-yellow-500':  '#D97706',
  'from-indigo-500 to-blue-700':   '#6366F1',
};

function IndustryCard({ industry, index }) {
  const cardRef = useRef(null);
  const [magnetic, setMagnetic] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const glowColor = GLOW_COLORS[industry.color] || '#6B3FA0';
  const hasSites = industry.sites && industry.sites.length > 0;

  const onMove = (e) => {
    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setMagnetic({
      x: (e.clientX - (r.left + r.width / 2)) * 0.14,
      y: (e.clientY - (r.top + r.height / 2)) * 0.14,
    });
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      viewport={{ once: true }}
      onMouseMove={onMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setMagnetic({ x: 0, y: 0 }); }}
      animate={{ x: hovered ? magnetic.x : 0, y: hovered ? magnetic.y : 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      <Link
        to={`/industries/${industry.slug}`}
        className="relative rounded-2xl p-5 text-center cursor-pointer overflow-hidden block"
        style={{
          background: hovered ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.82)',
          border: hovered ? `1px solid ${glowColor}44` : '1px solid rgba(29,78,216,0.11)',
          boxShadow: hovered ? `0 16px 48px ${glowColor}28` : '0 4px 16px rgba(27,49,114,0.07)',
          backdropFilter: 'blur(16px)',
          transition: 'background 0.3s, border 0.3s, box-shadow 0.3s',
        }}
      >
        {/* Hover glow burst */}
        {hovered && (
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ background: `radial-gradient(circle at 50% 40%, ${glowColor}14, transparent 70%)` }}
          />
        )}

        {/* Site count badge */}
        {hasSites && (
          <div
            className="absolute top-2.5 right-2.5 text-[10px] font-700 px-2 py-0.5 rounded-full"
            style={{
              background: `${glowColor}18`,
              color: glowColor,
              border: `1px solid ${glowColor}30`,
            }}
          >
            {industry.sites.length}
          </div>
        )}

        {/* Icon */}
        <motion.div
          className="text-4xl mb-3 block"
          animate={{ scale: hovered ? 1.2 : 1, y: hovered ? -3 : 0 }}
          transition={{ duration: 0.25 }}
        >
          {industry.icon}
        </motion.div>

        <div
          className="text-sm font-heading font-600 transition-colors duration-200"
          style={{ color: hovered ? '#1B3172' : '#334155' }}
        >
          {industry.name}
        </div>

        {/* Arrow on hover */}
        <motion.div
          className="absolute bottom-2.5 right-3"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.6 }}
          transition={{ duration: 0.2 }}
        >
          <ArrowUpRight className="w-3.5 h-3.5" style={{ color: glowColor }} />
        </motion.div>

        {/* Bottom shine bar */}
        <motion.div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full"
          style={{
            background: `linear-gradient(to right, transparent, ${glowColor}, transparent)`,
          }}
          animate={{ width: hovered ? '80%' : '0%' }}
          transition={{ duration: 0.3 }}
        />
      </Link>
    </motion.div>
  );
}

export default function IndustriesSection() {
  return (
    <section className="section-pad-sm bg-[#EEF2FF] relative overflow-hidden">
      {/* Scattered background dots */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.06]" aria-hidden="true">
        {Array.from({ length: 24 }).map((_, i) => (
          <circle key={i}
            cx={`${(i * 137.5) % 100}%`}
            cy={`${(i * 97.3) % 100}%`}
            r={i % 3 === 0 ? 3 : 2}
            fill="#6B3FA0"
          >
            <animate attributeName="opacity" values="0.3;0.8;0.3"
              dur={`${3 + (i % 5) * 0.7}s`}
              begin={`${(i * 0.3) % 4}s`}
              repeatCount="indefinite" />
          </circle>
        ))}
      </svg>

      <div className="orb orb-blue w-96 h-96 top-0 right-0 opacity-6 -translate-y-1/2 translate-x-1/2" />

      <div className="container-xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="section-label mx-auto mb-4">Industries We Serve</div>
          <h2 className="text-3xl lg:text-4xl font-heading font-700 text-[#1B3172]">
            Trusted Across <span className="gradient-text">Every Industry</span>
          </h2>
          <p className="text-[#64748b] mt-3 max-w-lg mx-auto">
            Click any sector to view our live client portfolio for that industry.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {INDUSTRIES.map((industry, i) => (
            <IndustryCard key={industry.slug} industry={industry} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
