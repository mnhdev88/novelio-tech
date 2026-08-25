import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Search, MessageSquareQuote, Sparkles, Check,
  Target, ShieldCheck, AlertCircle, Phone,
} from 'lucide-react';
import SEO from '../../components/SEO';
import CTABanner from '../../components/home/CTABanner';
import { COMPANY } from '../../data/siteData';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay },
  viewport: { once: true },
});

// ── The three disciplines every plan covers ──────────────────────────────────
const FRAMEWORK = [
  {
    tag: 'SEO',
    icon: Search,
    title: 'Search Engine Optimisation',
    desc: 'Getting found through Google and traditional search — the technical and on-page foundation everything else builds on.',
    color: 'from-indigo-500 to-blue-600',
  },
  {
    tag: 'AEO',
    icon: MessageSquareQuote,
    title: 'Answer Engine Optimisation',
    desc: 'Structuring information so search engines can lift it directly into featured snippets and answer boxes.',
    color: 'from-violet-600 to-purple-600',
  },
  {
    tag: 'GEO',
    icon: Sparkles,
    title: 'Generative Engine Optimisation',
    desc: 'Making your brand, products and expertise easy for ChatGPT, Gemini, Perplexity and Google AI to understand, reference and surface.',
    color: 'from-emerald-500 to-teal-600',
  },
];

// ── Plan tiers ───────────────────────────────────────────────────────────────
const PLANS = [
  {
    id: 'essential',
    name: 'Essential',
    price: 299,
    strategy: 'Core SEO',
    bestFor: 'Small e-commerce stores building their SEO foundation.',
    objective: 'Build a strong SEO foundation.',
    highlights: [
      'Up to 15 keywords mapped to priority pages',
      'Core technical SEO and site health',
      'Foundational AEO and GEO structuring',
      'Monthly performance report',
    ],
    color: 'from-slate-500 to-blue-600',
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 499,
    badge: 'Recommended',
    highlight: true,
    strategy: 'Advanced SEO',
    bestFor: 'Stores actively looking to grow organic sales.',
    objective: 'Increase rankings, traffic and organic enquiries or sales.',
    highlights: [
      'Up to 30 keywords across categories, products and content',
      'Advanced technical monitoring + Product/FAQ schema',
      'Expanded snippet targeting and monthly AI tracking',
      'Monthly report, strategy insights and a strategy call',
    ],
    color: 'from-violet-600 to-blue-600',
  },
  {
    id: 'scale',
    name: 'Scale',
    price: 799,
    strategy: 'Full-scale e-commerce SEO',
    bestFor: 'Established stores targeting aggressive organic growth.',
    objective: 'Scale organic revenue and search-market presence.',
    highlights: [
      '50+ keywords with full-funnel mapping',
      'Site-wide architecture and advanced schema strategy',
      'Comprehensive AEO coverage and entity strategy',
      'Detailed growth review with competitor tracking',
    ],
    color: 'from-amber-500 to-orange-500',
  },
];

// ── Full scope comparison ────────────────────────────────────────────────────
const COMPARISON = [
  { group: 'Strategy & Technical Foundation' },
  {
    feature: 'Keyword Research & Mapping',
    values: [
      'Up to 15 keywords, mapped to priority pages',
      'Up to 30 keywords, mapped across categories, products and content',
      '50+ keywords, full-funnel mapping with continuous expansion',
    ],
  },
  {
    feature: 'Competitor Analysis',
    values: ['Initial review', 'Detailed review + periodic monitoring', 'Continuous competitive gap analysis'],
  },
  {
    feature: 'On-Page Optimisation',
    note: 'Titles, meta, headings, internal links, image alt',
    values: [
      'Priority pages only',
      'Priority categories + products, strategic linking',
      'Comprehensive coverage, advanced site-wide architecture',
    ],
  },
  {
    feature: 'Technical SEO & Site Health',
    note: 'Indexing, sitemap, Search Console, Core Web Vitals, redirects',
    values: ['Core maintenance', 'Advanced monitoring', 'Advanced + continuous optimisation'],
  },
  {
    feature: 'Structured Data & Content Quality',
    note: 'Schema, duplicate/thin content, canonicalisation',
    values: [
      'Basic schema + basic review',
      'Product / FAQ / Breadcrumb schema + ongoing review',
      'Advanced schema strategy + detailed ongoing audit',
    ],
  },

  { group: 'Content, AEO & GEO' },
  {
    feature: 'Content Strategy',
    note: 'Blog topics, briefs, buying guides — writing quoted separately',
    values: [
      '2 topics/month, basic briefs',
      '4 topics/month, detailed briefs, limited guide input',
      '6–8 topics/month, full SEO/AEO/GEO briefs and guide strategy',
    ],
  },
  {
    feature: 'AEO — Answer Engine Optimisation',
    note: 'FAQ, snippets, People Also Ask, question research',
    values: [
      'Foundational — FAQ optimisation, basic snippet targeting',
      'Advanced — expanded snippet and PAA targeting, detailed research',
      'Comprehensive — site-wide opportunities, extensive research',
    ],
  },
  {
    feature: 'GEO — Generative Engine Optimisation',
    note: 'AI structuring, entity clarity, AI visibility tracking',
    values: [
      'Foundation — AI-readable structuring, basic entity clarity',
      'Growth — advanced entity clarity, monthly AI tracking',
      'Advanced — comprehensive entity strategy, detailed monthly tracking',
    ],
  },

  { group: 'Authority, Local & Conversion' },
  {
    feature: 'Authority & Link Building',
    note: 'Backlink review, outreach, citations, brand mentions',
    values: ['Review + limited outreach', 'Review + monthly outreach', 'Review + higher-volume strategic outreach'],
  },
  {
    feature: 'Local SEO & Google Business Profile',
    values: ['Basic optimisation', 'Optimisation + posts/relevance', 'Advanced local visibility strategy'],
  },
  {
    feature: 'Conversion & UX Review',
    values: [
      'Basic CTA recommendations',
      'CTA review + search intent alignment',
      'Detailed CTA, UX and intent-to-landing-page review',
    ],
  },

  { group: 'Reporting' },
  {
    feature: 'Monthly Reporting & Strategy',
    note: 'Rankings, traffic, Search Console, AEO/GEO visibility',
    values: [
      'Monthly performance report',
      'Monthly report + strategy insights + monthly call',
      'Detailed monthly growth review + competitor tracking + monthly call',
    ],
  },
];

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Service',
      name: 'SEO, AEO & GEO Growth Plans',
      description:
        'Monthly SEO, Answer Engine Optimisation and Generative Engine Optimisation plans for e-commerce brands building visibility across Google, answer engines and AI search.',
      provider: {
        '@type': 'LocalBusiness',
        '@id': 'https://www.noveliotech.com/#business',
        name: 'Novelio Technologies LLC',
        url: 'https://www.noveliotech.com',
      },
      areaServed: { '@type': 'Country', name: 'United States' },
      serviceType: 'Search Engine Optimization',
      url: 'https://www.noveliotech.com/services/seo-plans',
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'SEO, AEO & GEO Growth Plans',
        itemListElement: PLANS.map((p) => ({
          '@type': 'Offer',
          name: p.name + ' — ' + p.strategy,
          description: p.bestFor,
          price: p.price,
          priceCurrency: 'USD',
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            price: p.price,
            priceCurrency: 'USD',
            unitCode: 'MON',
            billingDuration: 1,
          },
        })),
      },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.noveliotech.com' },
        { '@type': 'ListItem', position: 2, name: 'Services', item: 'https://www.noveliotech.com/services' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Search Engine Optimization',
          item: 'https://www.noveliotech.com/services/search-engine-optimization',
        },
        { '@type': 'ListItem', position: 4, name: 'SEO Plans', item: 'https://www.noveliotech.com/services/seo-plans' },
      ],
    },
  ],
};

export default function SeoPlansPage() {
  const telHref = `tel:${COMPANY.phone.replace(/[\s()-]/g, '')}`;

  return (
    <main className="pt-20">
      <SEO
        title="SEO, AEO & GEO Growth Plans — Pricing from $299/month"
        description="Three monthly SEO plans for e-commerce brands — $299, $499 and $799 — covering search engine, answer engine and generative (AI) search optimisation. Full scope comparison included."
        canonical="/services/seo-plans"
        keywords={['SEO pricing', 'SEO packages', 'AEO', 'GEO', 'AI search optimisation', 'ecommerce SEO plans']}
        schema={schema}
      />

      {/* ── Hero ── */}
      <section className="section-pad relative overflow-hidden bg-dark">
        <div className="orb orb-blue w-[500px] h-[500px] -top-48 -left-48 opacity-15" />
        <div className="orb orb-purple w-[400px] h-[400px] top-0 -right-32 opacity-10" />
        <div className="dot-grid absolute inset-0 opacity-40" />
        <div className="container-xl relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="flex flex-wrap items-center gap-2 text-sm text-[#64748b] mb-6">
              <Link to="/" className="hover:text-[#1B3172] transition-colors">Home</Link>
              <span>/</span>
              <Link to="/services" className="hover:text-[#1B3172] transition-colors">Services</Link>
              <span>/</span>
              <Link to="/services/search-engine-optimization" className="hover:text-[#1B3172] transition-colors">SEO</Link>
              <span>/</span>
              <span className="text-[#1B3172]">Plans</span>
            </div>

            <div className="section-label mb-4">Search Growth Plans</div>
            <h1 className="text-4xl lg:text-6xl font-heading font-800 text-[#1B3172] mb-6 leading-tight max-w-4xl">
              SEO, AEO &amp; GEO <span className="gradient-text">Growth Plans</span>
            </h1>
            <p className="text-[#475569] text-lg sm:text-xl leading-relaxed max-w-3xl mb-8">
              Three engagement tiers for e-commerce brands building visibility across Google,
              answer engines, and AI search — with the full scope of every tier published below.
            </p>

            <div className="flex flex-wrap gap-3 mb-9">
              {['6-month recommended engagement', 'Content writing quoted separately', 'Nothing billed until scope is agreed'].map((m) => (
                <span key={m} className="glass-card gradient-border rounded-full px-4 py-2 text-sm text-[#475569]">
                  {m}
                </span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/contact" className="btn-primary">
                Get a Free SEO Audit
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a href={telHref} className="btn-ghost">
                <Phone className="w-4 h-4" /> {COMPANY.phone}
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Three disciplines ── */}
      <section className="section-pad bg-[#EEF2FF] relative overflow-hidden">
        <div className="line-grid absolute inset-0 opacity-40" />
        <div className="container-xl relative z-10">
          <motion.div {...fadeUp()} className="text-center mb-12">
            <div className="section-label mx-auto mb-4">Three Disciplines, One Strategy</div>
            <h2 className="text-3xl sm:text-4xl font-heading font-800 text-[#1B3172]">
              Search Isn't Just <span className="gradient-text">Google</span> Anymore
            </h2>
            <p className="text-[#64748b] text-base mt-4 max-w-2xl mx-auto leading-relaxed">
              Your customers now find answers in three places — classic search results, answer boxes,
              and AI assistants. Every plan below works all three at once.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FRAMEWORK.map((f, i) => (
              <motion.div
                key={f.tag}
                {...fadeUp(i * 0.1)}
                className="glass-card gradient-border rounded-2xl p-7 hover:-translate-y-1 hover:shadow-glow transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-5`}>
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-xs font-heading font-700 tracking-widest text-brand-purple uppercase mb-2">{f.tag}</div>
                <h3 className="text-[#1B3172] font-heading font-700 text-lg mb-2">{f.title}</h3>
                <p className="text-[#475569] text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Plans ── */}
      <section className="section-pad bg-white">
        <div className="container-xl">
          <motion.div {...fadeUp()} className="text-center mb-12">
            <div className="section-label mx-auto mb-4">Plans at a Glance</div>
            <h2 className="text-3xl sm:text-4xl font-heading font-800 text-[#1B3172]">
              Pick the Tier That Matches <span className="gradient-text">Your Ambition</span>
            </h2>
            <p className="text-[#64748b] text-base mt-4 max-w-2xl mx-auto leading-relaxed">
              Every plan runs on a 6-month recommended engagement so the work has time to compound.
              Nothing is billed until scope is agreed with you in writing.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {PLANS.map((plan, i) => (
              <motion.div
                key={plan.id}
                {...fadeUp((i % 3) * 0.08)}
                className={`relative rounded-2xl p-7 flex flex-col h-full bg-white border transition-all duration-300 hover:-translate-y-2 ${
                  plan.highlight
                    ? 'border-transparent ring-2 ring-brand-purple shadow-glow'
                    : 'border-slate-200 hover:shadow-[0_8px_32px_rgba(27,49,114,0.12)]'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-brand-purple to-brand-blue text-white text-[11px] font-bold tracking-wide shadow-md whitespace-nowrap">
                    <Sparkles className="w-3 h-3" />
                    {plan.badge}
                  </div>
                )}

                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-5`}>
                  <span className="text-white font-heading font-bold text-lg">{plan.name[0]}</span>
                </div>

                <h3 className="text-[#1B3172] font-heading font-700 text-xl mb-1">{plan.name}</h3>
                <p className="text-brand-purple text-sm font-semibold mb-5">{plan.strategy}</p>

                <div className="mb-6">
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-heading font-800 text-[#1B3172]">${plan.price}</span>
                    <span className="text-[#64748b] text-sm mb-1.5">/mo</span>
                  </div>
                  <p className="text-xs text-[#64748b] mt-1.5 leading-relaxed">
                    6-month recommended engagement · content writing quoted separately
                  </p>
                </div>

                <Link
                  to="/contact"
                  className={`w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer mb-6 ${
                    plan.highlight
                      ? 'bg-[#1B3172] hover:bg-[#0d1f5c] text-white'
                      : 'border border-[rgba(29,78,216,0.2)] text-[#1B3172] hover:bg-[#1B3172] hover:text-white'
                  }`}
                >
                  Start With {plan.name}
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <ul className="space-y-3 flex-1">
                  {plan.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2.5 text-[#475569] text-sm leading-snug">
                      <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>

                <p className="text-xs text-[#64748b] mt-6 pt-5 border-t border-slate-100">
                  <span className="font-semibold text-[#1B3172]">Best for:</span> {plan.bestFor}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Cross-reference to the website growth plans — these are a separate service line */}
          <motion.div
            {...fadeUp(0.1)}
            className="mt-8 rounded-2xl bg-[#EEF2FF] border border-slate-200 p-6 sm:p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
          >
            <p className="text-[#475569] text-sm leading-relaxed max-w-2xl">
              <span className="font-semibold text-[#1B3172]">Need a website first?</span>{' '}
              These SEO plans are a separate service line for brands that already have a site to optimise.
              If you need the website itself — with hosting, SSL and lead capture included — that lives in our growth plans.
            </p>
            <Link
              to="/pricing"
              className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[rgba(29,78,216,0.2)] bg-white text-[#1B3172] text-sm font-semibold hover:bg-[#1B3172] hover:text-white transition-all"
            >
              See Growth Plans
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Full comparison ── */}
      <section className="section-pad bg-[#EEF2FF]">
        <div className="container-xl max-w-6xl">
          <motion.div {...fadeUp()} className="text-center mb-12">
            <div className="section-label mx-auto mb-4">Full Comparison</div>
            <h2 className="text-3xl sm:text-4xl font-heading font-800 text-[#1B3172]">
              Every Line of <span className="gradient-text">Scope</span>
            </h2>
            <p className="text-[#64748b] text-base mt-4 max-w-2xl mx-auto leading-relaxed">
              No vague deliverables. Here's exactly what changes as you move up a tier.
            </p>
          </motion.div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-sm text-left min-w-[860px]">
              <thead>
                <tr className="bg-[#1B3172] text-white">
                  <th className="px-5 py-4 font-heading font-700 min-w-[230px]">Scope</th>
                  <th className="px-5 py-4 font-heading font-700 min-w-[200px]">
                    Essential<span className="block text-xs font-normal text-white/70 mt-0.5">$299/mo</span>
                  </th>
                  <th className="px-5 py-4 font-heading font-700 min-w-[200px] bg-brand-purple/90">
                    Growth<span className="block text-xs font-normal text-white/70 mt-0.5">$499/mo</span>
                  </th>
                  <th className="px-5 py-4 font-heading font-700 min-w-[200px]">
                    Scale<span className="block text-xs font-normal text-white/70 mt-0.5">$799/mo</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) =>
                  row.group ? (
                    <tr key={row.group}>
                      <td
                        colSpan={4}
                        className="px-5 py-2.5 bg-[#EEF2FF] text-brand-purple font-heading font-700 text-xs uppercase tracking-widest"
                      >
                        {row.group}
                      </td>
                    </tr>
                  ) : (
                    <tr key={row.feature} className={i % 2 ? 'bg-[#f8faff]' : 'bg-white'}>
                      <td className="px-5 py-3.5 align-top">
                        <span className="font-semibold text-[#1B3172]">{row.feature}</span>
                        {row.note && <span className="block text-xs text-[#94a3b8] mt-1 leading-snug">{row.note}</span>}
                      </td>
                      {row.values.map((v, vi) => (
                        <td
                          key={vi}
                          className={`px-5 py-3.5 align-top text-[#475569] leading-snug ${vi === 1 ? 'bg-[#EEF2FF]/60' : ''}`}
                        >
                          {v}
                        </td>
                      ))}
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* Primary objective by tier */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            {PLANS.map((p, i) => (
              <motion.div key={p.id} {...fadeUp(i * 0.08)} className="border-l-[3px] border-brand-purple pl-5 py-1">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-brand-purple" />
                  <span className="font-heading font-700 text-[#1B3172]">{p.name}</span>
                </div>
                <p className="text-[#475569] text-sm leading-relaxed">{p.objective}</p>
              </motion.div>
            ))}
          </div>

          {/* Deep-scope companion page — noindex, sent to prospects during scoping */}
          <motion.p {...fadeUp(0.15)} className="text-center text-[#64748b] text-sm mt-10 leading-relaxed">
            Want the line-by-line version?{' '}
            <Link to="/services/seo-price" className="text-brand-purple font-semibold hover:underline">
              See the complete scope of work, tier by tier →
            </Link>
          </motion.p>
        </div>
      </section>

      {/* ── Performance commitment ── */}
      <section className="section-pad bg-white">
        <div className="container-xl max-w-4xl">
          <motion.div {...fadeUp()} className="text-center mb-10">
            <div className="section-label mx-auto mb-4">Performance Commitment</div>
            <h2 className="text-3xl sm:text-4xl font-heading font-800 text-[#1B3172]">
              What We <span className="gradient-text">Commit To</span>
            </h2>
          </motion.div>

          <motion.div
            {...fadeUp(0.1)}
            className="rounded-2xl bg-white border border-slate-200 border-l-4 border-l-amber-500 p-7 sm:p-9 shadow-[0_4px_24px_rgba(27,49,114,0.08)]"
          >
            <div className="flex items-start gap-4 mb-5">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-[#475569] text-base leading-relaxed">
                We mutually identify a defined set of priority commercial keywords and search themes at the
                start of the engagement. Our objective is measurable improvement in rankings, organic
                visibility and qualified traffic over the 6-month term, with selected realistic keywords
                targeted for Page 1 positions.
              </p>
            </div>
            <p className="text-[#475569] text-base leading-relaxed sm:pl-14">
              SEO, AEO and GEO performance is tracked through Google Search Console, analytics, ranking
              tools and AI-search visibility reviews wherever measurable.
            </p>

            <div className="mt-7 rounded-xl bg-amber-50 border border-amber-100 p-5 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[#64748b] text-sm leading-relaxed">
                Search-engine rankings, AI-generated answers and citations are controlled by third-party
                platforms such as Google, ChatGPT, Gemini and Perplexity. No ethical SEO provider can
                guarantee a specific permanent ranking or AI citation. Our commitment is to execute the
                agreed optimisation strategy, monitor performance, and continuously improve identified
                opportunities.
              </p>
            </div>
          </motion.div>

          <motion.p {...fadeUp(0.15)} className="text-center text-[#64748b] text-sm mt-8 leading-relaxed">
            <span className="font-semibold text-[#1B3172]">Scope note</span> — content writing and major
            development work remain outside the monthly fee and are quoted separately.{' '}
            <Link to="/contact" className="text-brand-purple font-semibold hover:underline">
              Ask us for a written quote →
            </Link>
          </motion.p>
        </div>
      </section>

      <CTABanner />
    </main>
  );
}
