import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { HOMEPAGE } from '../../data/siteData';

const PILLARS = HOMEPAGE.growthFramework.pillars;
const COVERS = HOMEPAGE.growthFramework.covers;

// "An SMB needs three things to grow: visibility, trust, and conversion."

// What growth-focused website development must cover.

export default function GrowthFramework() {
  return (
    <section className="section-pad bg-white relative overflow-hidden">
      <div className="dot-grid absolute inset-0 opacity-30" />
      <div className="container-xl relative z-10">
        <div className="text-center mb-14">
          <div className="section-label mx-auto mb-4">The Growth Framework</div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-800 text-[#1B3172] leading-tight">
            A Small Business Needs Three Things to Grow:{' '}
            <span className="gradient-text">Visibility, Trust & Conversion</span>
          </h2>
          <p className="text-[#64748b] text-base sm:text-lg mt-5 max-w-3xl mx-auto leading-relaxed">
            A normal website is only a brochure. A growth website is part of your sales funnel —
            it attracts, educates, builds trust, and converts visitors into leads. Here is how we
            make your website support all three.
          </p>
        </div>

        {/* Three pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {PILLARS.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="rounded-2xl bg-[#f8faff] border border-slate-200 p-7 hover:shadow-[0_8px_32px_rgba(27,49,114,0.12)] hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${p.color} flex items-center justify-center mb-5`}>
                <p.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-[#1B3172] font-heading font-700 text-xl mb-2">{p.title}</h3>
              <p className="text-[#64748b] text-sm leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* What website development covers */}
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="section-label mx-auto mb-4">Beyond a Brochure</div>
            <h3 className="text-2xl sm:text-3xl font-heading font-800 text-[#1B3172]">
              What a Growth Website <span className="gradient-text">Must Cover</span>
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {COVERS.map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: (i % 5) * 0.06 }}
                viewport={{ once: true }}
                className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-brand-purple/40 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-9 h-9 rounded-xl bg-[#EEF2FF] flex items-center justify-center mb-3">
                  <c.icon className="w-[18px] h-[18px] text-[#1B3172]" />
                </div>
                <h4 className="text-[#1B3172] font-heading font-700 text-sm mb-1.5 leading-snug">{c.title}</h4>
                <p className="text-[#64748b] text-xs leading-relaxed">{c.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-[#64748b] text-sm max-w-2xl mx-auto mb-6 leading-relaxed">
              A normal website is only a brochure. A growth website attracts, educates, builds trust,
              and converts visitors into leads — and it is included free with every Novelio growth plan.
            </p>
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#1B3172] hover:bg-[#0d1f5c] text-white text-sm font-semibold transition-all"
            >
              See Growth Plans — Website Included Free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
