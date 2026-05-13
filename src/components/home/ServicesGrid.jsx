import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Code2, MapPin, TrendingUp, Zap, Palette, Settings, Mail, CheckSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { SERVICES } from '../../data/siteData';

const ICON_MAP = { Code2, MapPin, TrendingUp, Zap, Palette, Settings, Mail, CheckSquare };

function ServiceCard({ service, index }) {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glow, setGlow] = useState({ x: 50, y: 50, show: false });
  const Icon = ICON_MAP[service.icon] || Search;

  const onMove = (e) => {
    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    setTilt({ x: (py - 0.5) * -12, y: (px - 0.5) * 12 });
    setGlow({ x: px * 100, y: py * 100, show: true });
  };

  const onLeave = () => {
    setTilt({ x: 0, y: 0 });
    setGlow((g) => ({ ...g, show: false }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, delay: (index % 3) * 0.12, ease: [0.22, 1, 0.36, 1] }}
      viewport={{ once: true }}
    >
      <div
        ref={cardRef}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{
          transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: 'transform 0.18s ease',
        }}
        className="relative rounded-2xl overflow-hidden h-full"
      >
        {/* Spotlight follow glow */}
        {glow.show && (
          <div className="pointer-events-none absolute inset-0 z-10 rounded-2xl transition-opacity duration-300"
            style={{
              background: `radial-gradient(180px circle at ${glow.x}% ${glow.y}%, rgba(107,63,160,0.13), transparent 70%)`,
            }} />
        )}

        <Link to={service.slug}
          className="group glass-card gradient-border rounded-2xl p-7 flex flex-col h-full block relative overflow-hidden"
          style={{ boxShadow: '0 4px 24px rgba(27,49,114,0.07)' }}>

          {/* Hover background sweep */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
            style={{ background: 'linear-gradient(135deg, rgba(107,63,160,0.04) 0%, rgba(29,78,216,0.04) 100%)' }} />

          {/* Icon box */}
          <div className="relative mb-5 w-fit">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center shadow-glow
              group-hover:scale-110 group-hover:rotate-3 transition-all duration-400`}
              style={{ boxShadow: '0 4px 20px rgba(107,63,160,0.3)' }}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            {/* Ping ring */}
            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-30
              group-hover:scale-150 transition-all duration-500 blur-md`} />
          </div>

          <h3 className="text-[#1B3172] font-heading font-600 text-xl mb-3 leading-snug group-hover:gradient-text transition-all duration-300">
            {service.title}
          </h3>
          <p className="text-[#64748b] text-sm leading-relaxed flex-1 mb-5">{service.description}</p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {service.features.slice(0, 3).map((f) => (
              <span key={f} className="text-[11px] text-[#6B3FA0] bg-[#6B3FA0]/8 border border-[#6B3FA0]/15 px-2.5 py-1 rounded-full font-medium">
                {f}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 text-brand-purple font-medium text-sm group-hover:gap-3 transition-all duration-200">
            Learn More
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
          </div>
        </Link>
      </div>
    </motion.div>
  );
}

export default function ServicesGrid() {
  return (
    <section className="section-pad bg-[#EEF2FF] relative overflow-hidden">
      {/* Background SVG grid lines */}
      <div className="line-grid absolute inset-0 opacity-50" />
      {/* Orbs */}
      <div className="orb orb-purple w-[500px] h-[500px] -top-48 -right-48 opacity-8" />
      <div className="orb orb-blue w-[400px] h-[400px] -bottom-32 -left-32 opacity-8" />

      {/* Decorative SVG rings */}
      <svg className="absolute top-0 right-0 w-96 h-96 opacity-5 pointer-events-none" viewBox="0 0 400 400" fill="none">
        <circle cx="350" cy="50" r="180" stroke="#6B3FA0" strokeWidth="1" />
        <circle cx="350" cy="50" r="120" stroke="#1D4ED8" strokeWidth="0.8" />
        <circle cx="350" cy="50" r="60" stroke="#6B3FA0" strokeWidth="0.6" />
      </svg>

      <div className="container-xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="section-label mx-auto mb-4">Service Pillars</div>
          <h2 className="text-4xl lg:text-5xl font-heading font-700 text-[#1B3172] mb-4">
            Every Aspect of Your <span className="gradient-text">Business Growth, Covered</span>
          </h2>
          <p className="text-[#475569] text-lg max-w-2xl mx-auto">
            From your homepage to your accounting software — we assess, fix, and scale what matters.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SERVICES.map((service, i) => (
            <ServiceCard key={service.id} service={service} index={i} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link to="/services" className="btn-ghost px-8 py-3.5 group">
            View All Services
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
