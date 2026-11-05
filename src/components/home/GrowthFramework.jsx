import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { HOMEPAGE } from '../../data/siteData';
import { spectrumAt } from '../shared/spectrum';

const PILLARS = HOMEPAGE.growthFramework.pillars;
const COVERS = HOMEPAGE.growthFramework.covers;

// Three solid blocks from the logo. Yellow takes navy text; the others take white.
const PILLAR_STYLES = [
  { background: '#1376B4', color: '#FFFFFF' },
  { background: '#F0D030', color: '#0D246A' },
  { background: '#E02A2A', color: '#FFFFFF' },
];

// "An SMB needs three things to grow: visibility, trust, and conversion."
// What growth-focused website development must cover.

export default function GrowthFramework() {
  return (
    <section className="section-pad bg-white">
      <div className="container-xl">
        <div className="max-w-4xl mb-12">
          <div className="section-label">The Growth Framework</div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-800 leading-[1.05]">
            A Small Business Needs Three Things to Grow:{' '}
            <span className="gradient-text">Visibility, Trust & Conversion</span>
          </h2>
          <p className="text-[#3F4A6B] text-base sm:text-lg mt-6 max-w-3xl leading-relaxed">
            A normal website is only a brochure. A growth website is part of your sales funnel:
            it attracts, educates, builds trust, and converts visitors into leads. Here is how we
            make your website support all three.
          </p>
        </div>

        {/* Three pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-20 lg:mb-28">
          {PILLARS.map((p, i) => {
            const style = PILLAR_STYLES[i % PILLAR_STYLES.length];
            return (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
                className="rounded-3xl p-7 lg:p-9 lg:min-h-[340px] flex flex-col"
                style={style}
              >
                <p.icon className="w-12 h-12 mb-10 lg:mb-auto" strokeWidth={1.75} aria-hidden="true" />
                <h3 className="font-heading font-800 text-3xl lg:text-4xl mb-3 lg:mt-10" style={{ color: style.color }}>{p.title}</h3>
                <p className="text-base leading-relaxed">{p.desc}</p>
              </motion.div>
            );
          })}
        </div>

        {/* What website development covers */}
        <div className="grid lg:grid-cols-[1fr_2.4fr] gap-8 lg:gap-16">
          <div className="lg:sticky lg:top-32 self-start">
            <div className="section-label">Beyond a Brochure</div>
            <h3 className="text-3xl sm:text-4xl font-heading font-800 leading-tight">
              What a Growth Website <span className="gradient-text">Must Cover</span>
            </h3>
            <p className="text-[#3F4A6B] text-sm mt-5 mb-7 leading-relaxed">
              A normal website is only a brochure. A growth website attracts, educates, builds trust,
              and converts visitors into leads, and it is included free with every Novelio growth plan.
            </p>
            <Link to="/pricing" className="btn-primary text-[15px] px-5 py-3">
              See Growth Plans: Website Included Free
              <ArrowRight className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            </Link>
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 list-none p-0 m-0">
            {COVERS.map((c, i) => (
              <li key={c.title} className="flex gap-4 py-5 border-t border-[#0D246A]/15">
                <c.icon className="w-6 h-6 flex-shrink-0 mt-0.5" style={{ color: spectrumAt(i).mark }} aria-hidden="true" />
                <div>
                  <h4 className="font-heading font-700 text-lg mb-1 leading-snug">{c.title}</h4>
                  <p className="text-[#3F4A6B] text-sm leading-relaxed">{c.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
