import SEO from '../components/SEO';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { COMPARISONS } from '../data/comparisonData';
import CTABanner from '../components/home/CTABanner';

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass-card gradient-border rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-5 text-left gap-4">
        <span className="text-[#1B3172] font-medium text-[15px]">{q}</span>
        {open ? <ChevronUp className="w-5 h-5 text-brand-purple flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-[#64748b] flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-5 pt-0 border-t border-slate-200">
          <p className="text-[#475569] text-sm leading-relaxed pt-4">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function ComparePage() {
  const { slug } = useParams();
  const data = COMPARISONS.find((c) => c.slug === slug);

  if (!data) return <Navigate to="/" replace />;

  const base = 'https://www.noveliotech.com';
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        name: data.title,
        description: data.metaDescription,
        url: `${base}/compare/${data.slug}`,
        isPartOf: { '@id': `${base}/#website` },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: base },
          { '@type': 'ListItem', position: 2, name: 'Compare', item: `${base}/compare/${data.slug}` },
          { '@type': 'ListItem', position: 3, name: data.title, item: `${base}/compare/${data.slug}` },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: data.faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ],
  };

  return (
    <main className="pt-20">
      <SEO
        title={data.title}
        description={data.metaDescription}
        canonical={`/compare/${data.slug}`}
        schema={schema}
      />

      {/* Hero */}
      <section className="section-pad relative overflow-hidden bg-dark">
        <div className="orb orb-purple w-[500px] h-[500px] -top-48 -left-48 opacity-15" />
        <div className="orb orb-blue w-[400px] h-[400px] top-0 -right-32 opacity-10" />
        <div className="dot-grid absolute inset-0 opacity-40" />
        <div className="container-lg relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="max-w-3xl">
            <div className="flex items-center gap-2 text-sm text-[#64748b] mb-6">
              <Link to="/" className="hover:text-[#1B3172] transition-colors">Home</Link>
              <span>/</span>
              <span className="text-[#1B3172]">Compare</span>
            </div>
            <div className="section-label mb-4">{data.eyebrow}</div>
            <h1 className="text-4xl lg:text-6xl font-heading font-800 text-[#1B3172] mb-6 leading-tight">
              {data.h1Lead} <span className="gradient-text">{data.h1Highlight}</span>
            </h1>
            <p className="text-[#475569] text-xl leading-relaxed mb-8">{data.intro}</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/contact" className="btn-primary">
                Get My Free Growth Audit
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/services" className="btn-ghost">See What We Do</Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Comparison matrix */}
      <section className="section-pad bg-[#EEF2FF] relative overflow-hidden">
        <div className="container-lg">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}
            className="text-center mb-12">
            <h2 className="text-4xl font-heading font-700 text-[#1B3172]">
              Novelio vs <span className="gradient-text">{data.competitor}</span>
            </h2>
          </motion.div>

          <div className="glass-card gradient-border rounded-2xl overflow-hidden max-w-4xl mx-auto">
            {/* Header row */}
            <div className="grid grid-cols-[1.1fr_1fr_1fr] bg-white/60 border-b border-slate-200">
              <div className="p-4 sm:p-5 text-[#64748b] text-xs sm:text-sm font-medium uppercase tracking-wider">Factor</div>
              <div className="p-4 sm:p-5 text-center text-[#1B3172] font-heading font-700 text-sm sm:text-base bg-gradient-to-b from-brand-purple/10 to-transparent">Novelio</div>
              <div className="p-4 sm:p-5 text-center text-[#64748b] font-heading font-600 text-sm sm:text-base">{data.competitor}</div>
            </div>
            {/* Rows */}
            {data.matrix.map((row, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.05 }} viewport={{ once: true }}
                className={`grid grid-cols-[1.1fr_1fr_1fr] ${i % 2 ? 'bg-white/30' : 'bg-white/50'} border-b border-slate-100 last:border-0`}>
                <div className="p-4 sm:p-5 text-[#1B3172] font-medium text-[13px] sm:text-[15px] flex items-center">{row.factor}</div>
                <div className="p-4 sm:p-5 flex gap-2 items-start bg-gradient-to-b from-brand-purple/[0.04] to-transparent">
                  <Check className="w-4 h-4 mt-0.5 text-emerald-500 flex-shrink-0" />
                  <span className="text-[#475569] text-[12px] sm:text-sm leading-snug">{row.novelio.text}</span>
                </div>
                <div className="p-4 sm:p-5 flex gap-2 items-start">
                  <X className="w-4 h-4 mt-0.5 text-rose-400 flex-shrink-0" />
                  <span className="text-[#64748b] text-[12px] sm:text-sm leading-snug">{row.them.text}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* When each is right — honest framing */}
      <section className="section-pad bg-dark relative overflow-hidden">
        <div className="orb orb-cyan w-[400px] h-[400px] -bottom-32 -left-32 opacity-8" />
        <div className="container-lg relative z-10">
          <div className="grid md:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }}
              className="glass-card gradient-border rounded-2xl p-7">
              <h3 className="text-[#1B3172] font-heading font-700 text-xl mb-5">{data.themGood.title}</h3>
              <ul className="space-y-3">
                {data.themGood.points.map((p, i) => (
                  <li key={i} className="flex gap-3 text-[#475569] text-sm leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 flex-shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }}
              className="glass-card gradient-border rounded-2xl p-7 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-primary" />
              <h3 className="text-[#1B3172] font-heading font-700 text-xl mb-5">{data.novelioGood.title}</h3>
              <ul className="space-y-3">
                {data.novelioGood.points.map((p, i) => (
                  <li key={i} className="flex gap-3 text-[#475569] text-sm leading-relaxed">
                    <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Other comparisons */}
      <section className="section-pad-sm bg-[#EEF2FF]">
        <div className="container-xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }}
            className="text-center mb-8">
            <h3 className="text-2xl font-heading font-700 text-[#1B3172]">Other Comparisons</h3>
          </motion.div>
          <div className="flex flex-wrap gap-3 justify-center">
            {COMPARISONS.filter((c) => c.slug !== slug).map((c) => (
              <Link key={c.slug} to={`/compare/${c.slug}`}
                className="glass-card gradient-border rounded-full px-5 py-2.5 text-sm font-medium text-[#475569] hover:text-[#1B3172] hover:shadow-glow transition-all">
                Novelio vs {c.competitor}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-pad bg-dark relative overflow-hidden">
        <div className="container-lg">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}
            className="text-center mb-12">
            <div className="section-label mx-auto mb-4">FAQs</div>
            <h2 className="text-4xl font-heading font-700 text-[#1B3172]">
              Common <span className="gradient-text">Questions</span>
            </h2>
          </motion.div>
          <div className="space-y-3 max-w-3xl mx-auto">
            {data.faqs.map((faq, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }} viewport={{ once: true }}>
                <FAQItem q={faq.q} a={faq.a} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <CTABanner />
    </main>
  );
}
