import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { INDUSTRIES } from '../../data/siteData';
import { spectrumAt } from '../shared/spectrum';

function IndustryCard({ industry, index }) {
  const colour = spectrumAt(index);
  const hasSites = industry.sites && industry.sites.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: (index % 7) * 0.04, ease: [0.22, 1, 0.36, 1] }}
      viewport={{ once: true }}
      className="h-full"
    >
      {/* Colours go through CSS variables so hover fills with no JS or re-render. */}
      <Link
        to={`/industries/${industry.slug}`}
        className="group relative h-full min-h-[148px] rounded-2xl p-5 flex flex-col justify-between gap-6 cursor-pointer bg-white border border-[#0D246A]/15 transition-colors duration-200 hover:[background:var(--fill)] hover:[border-color:var(--fill)] focus-visible:[background:var(--fill)]"
        style={{ '--fill': colour.fill, '--fg': colour.fg, '--mark': colour.mark }}
      >
        <industry.icon
          className="w-8 h-8 text-[color:var(--mark)] group-hover:text-[color:var(--fg)] group-focus-visible:text-[color:var(--fg)] transition-colors duration-200"
          strokeWidth={1.75}
          aria-hidden="true"
        />

        {hasSites && (
          <span className="absolute top-4 right-4 text-xs font-700 text-[#0D246A] bg-[#F3F2EC] px-2 py-0.5 rounded-full">
            {industry.sites.length}
          </span>
        )}

        <span className="flex items-end justify-between gap-2 font-heading font-700 text-base leading-tight text-[#0D246A] group-hover:text-[color:var(--fg)] group-focus-visible:text-[color:var(--fg)] transition-colors duration-200">
          {industry.name}
          <ArrowUpRight className="w-4 h-4 flex-shrink-0 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-200" aria-hidden="true" />
        </span>
      </Link>
    </motion.div>
  );
}

export default function IndustriesSection() {
  return (
    <section className="section-pad bg-[#FBFAF6]">
      <div className="container-xl">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-10">
          <div>
            <div className="section-label">Industries We Serve</div>
            <h2 className="text-4xl lg:text-5xl font-heading font-800 leading-[1.05]">
              Trusted Across <span className="gradient-text">Every Industry</span>
            </h2>
          </div>
          <p className="text-[#3F4A6B] max-w-sm">
            Click any sector to view our live client portfolio for that industry.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3">
          {INDUSTRIES.map((industry, i) => (
            <IndustryCard key={industry.slug} industry={industry} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
