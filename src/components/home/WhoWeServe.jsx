import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { PHONE_TEL } from '../../data/siteData';

const PILLS = [
  { label: 'Plumbers',        color: '#1376B4', bg: 'rgba(37,99,235,0.1)',  border: 'rgba(37,99,235,0.25)' },
  { label: 'Salons & Spas',   color: '#E02A2A', bg: 'rgba(236,72,153,0.1)', border: 'rgba(236,72,153,0.25)' },
  { label: 'HVAC & Trades',   color: '#F07030', bg: 'rgba(240,112,48,0.1)', border: 'rgba(240,112,48,0.25)' },
  { label: 'Restaurants',     color: '#E02A2A', bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.25)' },
  { label: 'Medical & Dental',color: '#0A924E', bg: 'rgba(10,146,78,0.1)', border: 'rgba(10,146,78,0.25)' },
  { label: 'Real Estate',     color: '#7A4BB0', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.25)' },
  { label: 'Retail',          color: '#F07030', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)' },
  { label: 'Consultants',     color: '#42499D', bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.25)' },
  { label: 'Chiropractors',   color: '#0D9488', bg: 'rgba(13,148,136,0.1)', border: 'rgba(13,148,136,0.25)' },
  { label: 'Event Planners',  color: '#5E328C', bg: 'rgba(217,70,239,0.1)', border: 'rgba(217,70,239,0.25)' },
  { label: 'Contractors',     color: '#3F4A6B', bg: 'rgba(71,85,105,0.1)',  border: 'rgba(71,85,105,0.25)' },
  { label: 'Accountants',     color: '#1376B4', bg: 'rgba(19,118,180,0.1)',  border: 'rgba(19,118,180,0.25)' },
];

export default function WhoWeServe() {
  return (
    <section className="section-pad bg-[#F3F2EC] relative overflow-hidden">
      <div className="orb orb-purple w-96 h-96 top-0 right-0 opacity-6 -translate-y-1/3 translate-x-1/4" />

      <div className="container-xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Left — text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
          >
            <div className="section-label mb-4">Who We Serve</div>
            <h2 className="text-4xl lg:text-5xl font-heading font-700 text-[#0D246A] mb-6 leading-tight">
              Built for Small Business Owners{' '}
              <span className="gradient-text">Who Are Done Guessing</span>
            </h2>
            <p className="text-[#3F4A6B] text-lg leading-relaxed mb-8">
              We work best with owner-operated service businesses, retail shops, restaurants, and trade businesses who are ready to invest in growth and want a partner who is accountable for results.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <a href={PHONE_TEL} className="btn-primary inline-flex group">
                Get My Free Audit
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <div className="flex items-center gap-2 text-sm text-[#5C6685]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                No obligation
              </div>
            </div>
          </motion.div>

          {/* Right — pill tags */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
          >
            <div className="flex flex-wrap gap-3">
              {PILLS.map((pill, i) => (
                <motion.div
                  key={pill.label}
                  initial={{ opacity: 0, scale: 0.75 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35, delay: i * 0.045, ease: [0.22, 1, 0.36, 1] }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.06, y: -2 }}
                  className="px-4 py-2 rounded-full text-sm font-heading font-600 cursor-default"
                  style={{
                    color: pill.color,
                    background: pill.bg,
                    border: `1px solid ${pill.border}`,
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  {pill.label}
                </motion.div>
              ))}
            </div>
            <p className="text-[#5C6685] text-xs mt-5">
              Serving businesses globally · Dover, DE registered company
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
