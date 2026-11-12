import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, CheckCircle, Search, LayoutTemplate, TrendingUp } from 'lucide-react';
import SEO from '../components/SEO';
import CTABanner from '../components/home/CTABanner';
import { INDUSTRIES, CALENDLY_LINK } from '../data/siteData';
import { spectrumAt } from '../components/shared/spectrum';

const BASE_URL = 'https://www.noveliotech.com';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] },
  viewport: { once: true },
});

const TOTAL_SITES = INDUSTRIES.reduce((n, i) => n + (i.sites?.length || 0), 0);

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'CollectionPage',
      '@id': `${BASE_URL}/industries#page`,
      name: 'Industries We Serve | Novelio Technologies',
      description: `Website design, SEO and lead generation for ${INDUSTRIES.length} industries, with ${TOTAL_SITES} live client sites you can browse.`,
      url: `${BASE_URL}/industries`,
      publisher: { '@type': 'Organization', name: 'Novelio Technologies LLC', url: BASE_URL },
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: INDUSTRIES.length,
        itemListElement: INDUSTRIES.map((ind, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: ind.name,
          url: `${BASE_URL}/industries/${ind.slug}`,
        })),
      },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
        { '@type': 'ListItem', position: 2, name: 'Industries', item: `${BASE_URL}/industries` },
      ],
    },
  ],
};

function IndustryCard({ industry, index }) {
  const colour = spectrumAt(index);
  const count = industry.sites?.length || 0;
  const examples = (industry.sites || []).slice(0, 3);

  return (
    <motion.div {...fadeUp((index % 3) * 0.06)} className="h-full">
      <Link
        to={`/industries/${industry.slug}`}
        className="group flex flex-col h-full bg-white border border-[#0D246A]/12 rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(13,36,106,0.12)] hover:[border-color:var(--fill)] focus-visible:[border-color:var(--fill)]"
        style={{ '--fill': colour.fill, '--fg': colour.fg, '--mark': colour.mark }}
      >
        <div className="flex items-start justify-between gap-4 mb-5">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-200 bg-[#F3F2EC] group-hover:[background:var(--fill)]"
          >
            <industry.icon
              className="w-6 h-6 text-[color:var(--mark)] group-hover:text-[color:var(--fg)] transition-colors duration-200"
              strokeWidth={1.75}
              aria-hidden="true"
            />
          </div>
          {count > 0 && (
            <span className="text-xs font-700 text-[#0D246A] bg-[#F3F2EC] px-2.5 py-1 rounded-full whitespace-nowrap">
              {count} live site{count !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        <h2 className="font-heading font-700 text-xl text-[#0D246A] mb-2">
          {industry.name}
        </h2>
        {industry.summary && (
          <p className="text-[#3F4A6B] text-sm leading-relaxed mb-5">{industry.summary}</p>
        )}

        {examples.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {examples.map((s) => (
              <span key={s.url} className="text-[11px] bg-[#FBFAF6] border border-[#0D246A]/10 text-[#42499D] rounded-full px-2.5 py-0.5 font-medium">
                {s.label}
              </span>
            ))}
          </div>
        )}

        <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-[#0D246A] group-hover:text-[#5E328C] transition-colors">
          View {industry.name} portfolio
          <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" aria-hidden="true" />
        </span>
      </Link>
    </motion.div>
  );
}

const WHY = [
  {
    Icon: Search,
    title: 'Keywords your customers actually use',
    desc: 'A med spa and a fence contractor search Google in completely different ways. We research the terms buyers in your sector type before writing a word.',
  },
  {
    Icon: LayoutTemplate,
    title: 'Layouts built for how your industry sells',
    desc: 'Bookings for clinics and spas, calls for home services, quote requests for B2B. Each site is shaped around the action that brings you revenue.',
  },
  {
    Icon: TrendingUp,
    title: 'Proof from businesses like yours',
    desc: `We have shipped ${TOTAL_SITES} live sites across ${INDUSTRIES.length} sectors, so we start from what already works rather than a blank template.`,
  },
];

export default function IndustriesPage() {
  return (
    <main className="pt-20 bg-[#FBFAF6]">
      <SEO
        title="Industries We Serve: Website Design & SEO by Sector"
        description={`Website design, SEO and lead generation for healthcare, spas, home services, hospitality, retail and more. Browse ${TOTAL_SITES} live client sites across ${INDUSTRIES.length} industries.`}
        canonical="/industries"
        keywords={['industry website design', 'website design by industry', 'small business website portfolio', 'industry SEO services']}
        schema={schema}
      />

      {/* ── Hero ── */}
      <section className="section-pad relative overflow-hidden bg-dark">
        <div className="orb orb-purple w-[560px] h-[560px] -top-64 -right-48 opacity-10" />
        <div className="dot-grid absolute inset-0 opacity-40" />

        <div className="container-xl relative z-10">
          <nav aria-label="Breadcrumb" className="text-sm text-[#5C6685] mb-8">
            <Link to="/" className="hover:text-[#0D246A] transition-colors">Home</Link>
            <span className="mx-2" aria-hidden="true">/</span>
            <span className="text-[#0D246A] font-medium" aria-current="page">Industries</span>
          </nav>

          <motion.div {...fadeUp(0)} className="max-w-3xl">
            <div className="section-label mb-4">Industries We Serve</div>
            <h1 className="text-5xl lg:text-6xl font-heading font-800 text-[#0D246A] mb-6 leading-[1.05]">
              Websites &amp; SEO Built for <span className="gradient-text">Your Industry</span>
            </h1>
            <p className="text-[#3F4A6B] text-xl leading-relaxed mb-10">
              Every sector wins customers differently. Pick yours to see the live sites we've built for businesses like you, then let's talk about what yours needs.
            </p>
          </motion.div>

          <motion.dl {...fadeUp(0.1)} className="grid grid-cols-3 gap-4 max-w-xl mb-10">
            {[
              { value: INDUSTRIES.length, label: 'Industries' },
              { value: TOTAL_SITES, label: 'Live client sites' },
              { value: '200+', label: 'Businesses served' },
            ].map((s) => (
              <div key={s.label} className="bg-white/80 border border-[#0D246A]/10 rounded-2xl px-4 py-4">
                <dt className="sr-only">{s.label}</dt>
                <dd className="text-3xl font-heading font-800 gradient-text leading-none">{s.value}</dd>
                <p className="text-xs text-[#5C6685] mt-1.5" aria-hidden="true">{s.label}</p>
              </div>
            ))}
          </motion.dl>

          <motion.div {...fadeUp(0.15)} className="flex flex-col sm:flex-row gap-4">
            <a {...CALENDLY_LINK} className="btn-primary text-base px-8 py-4">
              Book a Free Strategy Call
              <ArrowRight className="w-5 h-5" />
            </a>
            <Link to="/services" className="btn-ghost text-base px-8 py-4">
              View All Services
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Industry grid ── */}
      <section className="section-pad">
        <div className="container-xl">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {INDUSTRIES.map((industry, i) => (
              <IndustryCard key={industry.slug} industry={industry} index={i} />
            ))}

            {/* Catch-all so a visitor outside the list still has a next step */}
            <motion.div {...fadeUp(0.06)} className="h-full">
              <Link
                to="/contact"
                className="group flex flex-col justify-center h-full min-h-[220px] rounded-2xl p-6 border border-dashed border-[#0D246A]/25 hover:border-[#5E328C] transition-colors text-center"
              >
                <h2 className="font-heading font-700 text-xl text-[#0D246A] mb-2">Don't see your industry?</h2>
                <p className="text-[#3F4A6B] text-sm leading-relaxed mb-4 max-w-xs mx-auto">
                  These are the sectors with live work to show. We build for any small business. Tell us about yours.
                </p>
                <span className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-[#0D246A] group-hover:text-[#5E328C] transition-colors">
                  Get in touch <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </span>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Why industry-specific ── */}
      <section className="section-pad bg-white">
        <div className="container-xl">
          <motion.div {...fadeUp(0)} className="max-w-2xl mb-12">
            <div className="section-label mb-3">Why It Matters</div>
            <h2 className="text-4xl lg:text-5xl font-heading font-800 text-[#0D246A] leading-[1.05]">
              One-size-fits-all sites don't rank or convert
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {WHY.map(({ Icon, title, desc }, i) => (
              <motion.div key={title} {...fadeUp(i * 0.08)} className="bg-[#FBFAF6] border border-[#E2E8F0] rounded-2xl p-7">
                <Icon className="w-7 h-7 text-[#5E328C] mb-4" strokeWidth={1.75} aria-hidden="true" />
                <h3 className="font-heading font-700 text-lg text-[#0D246A] mb-2">{title}</h3>
                <p className="text-[#3F4A6B] text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust strip ── */}
      <section className="py-10 bg-[#FBFAF6] border-y border-[#E2E8F0]">
        <div className="container-xl">
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-[#5C6685]">
            {['200+ Small Businesses Served', '4.9★ Google Reviews', '12+ Years Experience', 'Free 30-Min Growth Audit'].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" aria-hidden="true" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTABanner />
    </main>
  );
}
