import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Check, Minus, Phone, Sparkles, ShieldCheck, AlertCircle,
  Search, FileText, Settings2, ShoppingCart, MessageSquareQuote,
  BrainCircuit, PenLine, Link2, BarChart3, ClipboardList, FileWarning,
} from 'lucide-react';
import SEO from '../../components/SEO';
import CTABanner from '../../components/home/CTABanner';
import { COMPANY, PHONE_TEL } from '../../data/siteData';

// Deep scope companion to /services/seo-plans. Same commercial offer, every
// line item published — sent to prospects during scoping rather than indexed,
// so it can't cannibalise the SEO plans page it canonicalises to.

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay },
  viewport: { once: true },
});

const PLANS = [
  {
    id: 'essential',
    name: 'Essential',
    price: 299,
    strategy: 'Core SEO foundation',
    desc: 'For smaller stores that need a strong SEO foundation and consistent organic visibility.',
    bestFor: 'Building the foundation',
    highlights: [
      'Up to 15 priority keywords / themes',
      'Selected product & category optimisation',
      'Basic AEO & GEO implementation',
      'Technical SEO monitoring',
      'Monthly reporting',
    ],
    color: 'from-slate-500 to-blue-600',
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 499,
    badge: 'Recommended',
    highlight: true,
    strategy: 'Advanced SEO execution',
    desc: 'For businesses that want SEO to become a meaningful customer acquisition channel.',
    bestFor: 'Growing organic traffic and sales',
    highlights: [
      'Up to 30 priority keywords / themes',
      'Priority product & category optimisation',
      'Advanced AEO & GEO strategy',
      'Competitor & content gap analysis',
      'Authority building & monthly strategy review',
    ],
    color: 'from-violet-600 to-blue-600',
  },
  {
    id: 'scale',
    name: 'Scale',
    price: 799,
    strategy: 'Comprehensive e-commerce SEO',
    desc: 'For established stores aiming to build organic search into a serious growth channel.',
    bestFor: 'Scaling organic market presence',
    highlights: [
      '50+ keywords / themes with ongoing expansion',
      'Extensive product & category optimisation',
      'Advanced AEO & GEO implementation',
      'Topical authority & buying guide strategy',
      'Advanced competitor, conversion & visibility tracking',
    ],
    color: 'from-amber-500 to-orange-500',
  },
];

// Every row: [activity, essential, growth, scale] — '+' renders a tick, '-' a dash.
const SCOPE = [
  {
    id: 'keyword-strategy',
    icon: Search,
    title: 'Keyword & Search Strategy',
    rows: [
      ['Keyword Research', 'Up to 15 priority keywords/themes', 'Up to 30 priority keywords/themes', '50+ keywords/themes with ongoing expansion'],
      ['Commercial Keyword Targeting', '+', '+', '+'],
      ['Informational Keyword Research', 'Basic', 'Included', 'Advanced'],
      ['Product Keyword Research', 'Selected', 'Priority groups', 'Extensive'],
      ['Category Keyword Mapping', 'Selected', 'Included', 'Comprehensive'],
      ['Search Intent Mapping', 'Basic', 'Included', 'Advanced'],
      ['Competitor Keyword Analysis', 'Initial review', 'Detailed', 'Ongoing'],
    ],
  },
  {
    id: 'on-page',
    icon: FileText,
    title: 'On-Page SEO',
    rows: [
      ['Titles & Meta Descriptions', '+', '+', '+'],
      ['Heading Structure', '+', '+', '+'],
      ['Internal Linking', 'Basic', 'Strategic', 'Advanced'],
      ['Priority Category Optimisation', 'Limited', 'Included', 'Extensive'],
      ['Product Page Optimisation', 'Selected', 'Priority products', 'Extensive'],
      ['Image Alt Text Recommendations', '+', '+', '+'],
      ['Search Intent vs Landing Page Review', 'Basic', 'Included', 'Advanced'],
    ],
  },
  {
    id: 'technical',
    icon: Settings2,
    title: 'Technical SEO',
    rows: [
      ['Crawlability & Indexing Review', '+', '+', '+'],
      ['XML Sitemap / Robots.txt', '+', '+', '+'],
      ['Google Search Console Monitoring', '+', '+', '+'],
      ['Broken Links / Redirect Review', 'Basic', 'Included', 'Advanced'],
      ['Canonical Tag Review', 'Basic', 'Included', 'Advanced'],
      ['Core Web Vitals Monitoring', '+', '+', '+'],
      ['Duplicate / Thin Content Review', 'Basic', 'Included', 'Ongoing'],
      ['Schema / Structured Data', 'Basic', 'Advanced', 'Comprehensive'],
    ],
  },
  {
    id: 'ecommerce',
    icon: ShoppingCart,
    title: 'E-commerce SEO',
    rows: [
      ['Product SEO', 'Priority products', 'Priority product groups', 'Extensive'],
      ['Category / Collection SEO', 'Selected', 'Included', 'Comprehensive'],
      ['Product Schema Review', 'Basic', 'Included', 'Advanced'],
      ['Product Description Recommendations', '+', '+', '+'],
      ['Buying Guide Strategy', '-', 'Limited', '+'],
      ['Product Comparison Content Strategy', '-', 'Selected', '+'],
      ['Conversion-Focused SEO Recommendations', 'Basic', 'Included', 'Advanced'],
    ],
  },
  {
    id: 'aeo',
    icon: MessageSquareQuote,
    title: 'AEO — Answer Engine Optimisation',
    intro:
      'Designed to help search engines and answer engines understand and surface clear answers to customer questions.',
    rows: [
      ['FAQ Optimisation', '+', '+', '+'],
      ['Question-Based Keyword Research', 'Basic', 'Detailed', 'Extensive'],
      ['Direct-Answer Content Structure', '+', '+', '+'],
      ['Featured Snippet Opportunities', 'Basic', 'Included', 'Advanced'],
      ['People Also Ask Targeting', 'Basic', 'Included', 'Advanced'],
      ['Conversational Search Optimisation', 'Basic', 'Included', 'Advanced'],
      ['FAQ / Q&A Schema', 'Basic', 'Included', 'Advanced'],
    ],
  },
  {
    id: 'geo',
    icon: BrainCircuit,
    title: 'GEO — Generative Engine Optimisation',
    intro:
      'Improves the clarity, authority and structure of your content for AI-driven search and discovery experiences.',
    rows: [
      ['AI-Friendly Content Structure', '+', '+', '+'],
      ['Brand Entity Optimisation', 'Basic', 'Advanced', 'Comprehensive'],
      ['Product / Service Context Structuring', 'Included', 'Included', 'Advanced'],
      ['Citation-Friendly Content Structure', 'Basic', 'Included', 'Advanced'],
      ['Expert & Trust Signals', 'Recommendations', 'Included', 'Advanced'],
      ['Topical Authority Development', 'Basic', 'Included', 'Full strategy'],
      ['AI Search Visibility Review', 'Basic', 'Monthly', 'Detailed'],
    ],
  },
  {
    id: 'content',
    icon: PenLine,
    title: 'Content Strategy',
    rows: [
      ['Blog Topic Recommendations', 'Up to 2/month', 'Up to 4/month', '6–8/month'],
      ['SEO Content Briefs', 'Basic', 'Detailed', 'Detailed'],
      ['AEO Content Recommendations', 'Basic', 'Included', 'Advanced'],
      ['GEO Content Recommendations', 'Basic', 'Included', 'Advanced'],
      ['Content Gap Analysis', '-', 'Included', 'Advanced'],
      ['Topical Content Clusters', '-', 'Basic', 'Advanced'],
      ['Content Writing', 'Separate scope', 'Separate scope', 'Separate scope'],
    ],
  },
  {
    id: 'authority',
    icon: Link2,
    title: 'Authority, Local SEO & Conversion',
    rows: [
      ['Backlink Profile Review', '+', '+', '+'],
      ['Link Opportunity Identification', 'Limited', 'Included', 'Advanced'],
      ['Competitor Backlink Analysis', '-', 'Periodic', 'Ongoing'],
      ['Google Business Profile Optimisation', 'Basic', 'Advanced', 'Advanced'],
      ['Local Keyword Strategy', 'Basic', 'Included', 'Extensive'],
      ['CTA / Conversion Review', 'Basic', 'Included', 'Detailed'],
      ['Product / Category UX Recommendations', '-', 'Included', 'Advanced'],
    ],
  },
  {
    id: 'reporting',
    icon: BarChart3,
    title: 'Reporting & Monitoring',
    rows: [
      ['Monthly SEO Report', '+', '+', '+'],
      ['Keyword Ranking Tracking', '+', '+', '+'],
      ['Organic Traffic & GSC Reporting', '+', '+', '+'],
      ['AEO Visibility Review', 'Basic', 'Included', 'Detailed'],
      ['GEO / AI Visibility Review', 'Basic', 'Included', 'Detailed'],
      ['Competitor Progress Review', '-', 'Periodic', 'Included'],
      ['Monthly Strategy Call', '-', 'Included', 'Included'],
    ],
  },
];

const TERMS = [
  {
    id: 'commitment',
    icon: ShieldCheck,
    title: 'Performance Commitment',
    accent: 'border-l-amber-500',
    body: [
      'At the beginning of the engagement, both parties mutually identify priority commercial keywords, product categories and search themes. The objective during the minimum 6-month engagement is measurable improvement in keyword rankings, organic visibility, search impressions, qualified traffic, product discovery and AI-search visibility wherever measurable.',
      'Selected commercially relevant and realistically achievable keywords may be targeted for Page 1 positions. Performance is monitored using Google Search Console, analytics, keyword tracking tools, technical SEO tools and AI-search visibility reviews where measurable.',
    ],
    warning:
      'Search rankings, AI-generated responses and citations are controlled by third-party platforms such as Google, ChatGPT, Gemini and Perplexity. No permanent ranking, exact Google position or guaranteed AI citation can be ethically promised by any provider.',
  },
  {
    id: 'responsibilities',
    icon: ClipboardList,
    title: 'Client Responsibilities',
    accent: 'border-l-brand-purple',
    body: [
      'The client provides timely website access, Google Search Console access, Google Business Profile access where applicable, analytics access, product information, brand information, images, testimonials, certifications, case studies, approvals and the technical permissions required for implementation.',
      'Recommended turnaround for approvals and feedback: 2–3 business days.',
    ],
  },
  {
    id: 'additional-work',
    icon: FileWarning,
    title: 'Additional Work',
    accent: 'border-l-slate-400',
    body: [
      'Unless specifically included, the following may require a separate quotation: long-form content writing, bulk product description writing, major website development, website redesign, custom integrations, advanced CRO implementation, paid advertising, PR campaigns, paid placements, and bulk data entry or product uploads.',
    ],
  },
];

// Reused by every scope table so all three price columns stay in the same order.
function ScopeValue({ value }) {
  if (value === '+') {
    return (
      <span className="inline-flex items-center gap-1.5 font-semibold text-green-700">
        <Check className="w-4 h-4 shrink-0" aria-hidden="true" />
        <span className="sr-only">Included</span>
      </span>
    );
  }
  if (value === '-') {
    return (
      <span className="inline-flex items-center text-[#94a3b8]">
        <Minus className="w-4 h-4 shrink-0" aria-hidden="true" />
        <span className="sr-only">Not included</span>
      </span>
    );
  }
  return <span>{value}</span>;
}

export default function SeoPricePage() {
  const telHref = PHONE_TEL;

  return (
    <main className="pt-20">
      {/* Deliberately noindex + canonicalised to /services/seo-plans: this page
          carries the same offer in full detail and must not compete with it. */}
      <SEO
        title="SEO, AEO & GEO Plans — Full Scope & Pricing"
        description="The complete line-by-line scope behind our $299, $499 and $799 monthly SEO, AEO and GEO plans for e-commerce brands."
        canonical="/services/seo-plans"
        noindex
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
              <Link to="/services/seo-plans" className="hover:text-[#1B3172] transition-colors">SEO Plans</Link>
              <span>/</span>
              <span className="text-[#1B3172]">Full Scope</span>
            </div>

            <div className="section-label mb-4">Minimum Recommended Engagement: 6 Months</div>
            <h1 className="text-4xl lg:text-6xl font-heading font-800 text-[#1B3172] mb-6 leading-tight max-w-4xl">
              E-commerce SEO, AEO &amp; GEO <span className="gradient-text">Plans</span>
            </h1>
            <p className="text-[#475569] text-lg sm:text-xl leading-relaxed max-w-3xl mb-8">
              A complete organic growth framework designed to improve search visibility, product
              discovery, AI-readiness, qualified traffic and conversions — with every activity in
              every tier published in full below.
            </p>

            <div className="glass-card gradient-border rounded-2xl px-5 py-4 mb-9 inline-flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-semibold text-[#1B3172]">
              {['Visibility', 'Qualified Traffic', 'Product Discovery', 'Trust', 'Conversions', 'Revenue'].map(
                (step, i, arr) => (
                  <span key={step} className="inline-flex items-center gap-3">
                    {step}
                    {i < arr.length - 1 && <ArrowRight className="w-3.5 h-3.5 text-brand-purple" aria-hidden="true" />}
                  </span>
                )
              )}
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

      {/* ── Plans ── */}
      <section className="section-pad bg-white">
        <div className="container-xl">
          <motion.div {...fadeUp()} className="text-center mb-12">
            <div className="section-label mx-auto mb-4">Plans at a Glance</div>
            <h2 className="text-3xl sm:text-4xl font-heading font-800 text-[#1B3172]">
              Three Tiers, One <span className="gradient-text">Growth Framework</span>
            </h2>
            <p className="text-[#64748b] text-base mt-4 max-w-2xl mx-auto leading-relaxed">
              Every plan covers search, answer engines and AI search together. Nothing is billed until
              the scope is agreed with you in writing.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {PLANS.map((plan, i) => (
              <motion.div
                key={plan.id}
                {...fadeUp(i * 0.08)}
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

                <p className="text-[#475569] text-sm leading-relaxed mb-5">{plan.desc}</p>

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
        </div>
      </section>

      {/* ── Full scope, section by section ── */}
      <section className="section-pad bg-[#EEF2FF] relative overflow-hidden">
        <div className="line-grid absolute inset-0 opacity-40" />
        <div className="container-xl max-w-6xl relative z-10">
          <motion.div {...fadeUp()} className="text-center mb-12">
            <div className="section-label mx-auto mb-4">Complete Scope of Work</div>
            <h2 className="text-3xl sm:text-4xl font-heading font-800 text-[#1B3172]">
              Every Activity, <span className="gradient-text">Tier by Tier</span>
            </h2>
            <p className="text-[#64748b] text-base mt-4 max-w-2xl mx-auto leading-relaxed">
              Nine disciplines, roughly sixty deliverables. This is the working document behind the
              plans — no vague line items, no hidden inclusions.
            </p>
          </motion.div>

          {/* Jump links keep a long scope document navigable */}
          <motion.nav
            {...fadeUp(0.05)}
            aria-label="Scope sections"
            className="flex flex-wrap justify-center gap-2 mb-12"
          >
            {SCOPE.map((s, i) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="inline-flex items-center gap-2 rounded-full bg-white border border-slate-200 px-4 py-2 text-xs sm:text-sm font-semibold text-[#1B3172] hover:border-brand-purple hover:text-brand-purple transition-colors"
              >
                <span className="text-[#94a3b8]">{i + 1}</span>
                {s.title.split(' — ')[0]}
              </a>
            ))}
          </motion.nav>

          <div className="space-y-10">
            {SCOPE.map((section, i) => (
              <motion.div key={section.id} id={section.id} {...fadeUp(0.05)} className="scroll-mt-28">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shrink-0">
                    <section.icon className="w-5 h-5 text-white" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-heading font-800 text-[#1B3172] leading-tight">
                      <span className="text-brand-purple">{i + 1}.</span> {section.title}
                    </h3>
                    {section.intro && (
                      <p className="text-[#64748b] text-sm mt-2 leading-relaxed max-w-3xl">{section.intro}</p>
                    )}
                  </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                  <table className="w-full text-sm text-left min-w-[860px]">
                    <caption className="sr-only">{section.title} — scope by plan tier</caption>
                    <thead>
                      <tr className="bg-[#1B3172] text-white">
                        <th scope="col" className="px-5 py-4 font-heading font-700 min-w-[250px]">Activity</th>
                        {PLANS.map((p) => (
                          <th
                            key={p.id}
                            scope="col"
                            className={`px-5 py-4 font-heading font-700 min-w-[195px] ${
                              p.highlight ? 'bg-brand-purple/90' : ''
                            }`}
                          >
                            {p.name}
                            <span className="block text-xs font-normal text-white/70 mt-0.5">${p.price}/mo</span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {section.rows.map((row, ri) => (
                        <tr key={row[0]} className={ri % 2 ? 'bg-[#f8faff]' : 'bg-white'}>
                          <th scope="row" className="px-5 py-3.5 align-top text-left font-semibold text-[#1B3172]">
                            {row[0]}
                          </th>
                          {row.slice(1).map((value, vi) => (
                            <td
                              key={vi}
                              className={`px-5 py-3.5 align-top text-[#475569] leading-snug ${
                                vi === 1 ? 'bg-[#EEF2FF]/60' : ''
                              }`}
                            >
                              <ScopeValue value={value} />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Engagement terms ── */}
      <section className="section-pad bg-white">
        <div className="container-xl max-w-4xl">
          <motion.div {...fadeUp()} className="text-center mb-10">
            <div className="section-label mx-auto mb-4">How the Engagement Works</div>
            <h2 className="text-3xl sm:text-4xl font-heading font-800 text-[#1B3172]">
              What We Commit To — and <span className="gradient-text">What We Don't</span>
            </h2>
          </motion.div>

          <div className="space-y-6">
            {TERMS.map((t, i) => (
              <motion.div
                key={t.id}
                {...fadeUp(i * 0.08)}
                className={`rounded-2xl bg-white border border-slate-200 border-l-4 ${t.accent} p-7 sm:p-8 shadow-[0_4px_24px_rgba(27,49,114,0.08)]`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] flex items-center justify-center shrink-0">
                    <t.icon className="w-5 h-5 text-brand-purple" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-heading font-700 text-[#1B3172]">{t.title}</h3>
                </div>

                {t.body.map((p) => (
                  <p key={p.slice(0, 40)} className="text-[#475569] text-base leading-relaxed mb-4 last:mb-0">
                    {p}
                  </p>
                ))}

                {t.warning && (
                  <div className="mt-6 rounded-xl bg-amber-50 border border-amber-100 p-5 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
                    <p className="text-[#64748b] text-sm leading-relaxed">{t.warning}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          <motion.div
            {...fadeUp(0.1)}
            className="mt-10 rounded-2xl bg-[#EEF2FF] border border-slate-200 p-7 text-center"
          >
            <p className="text-[#1B3172] font-heading font-700 text-lg mb-1.5">
              Recommended plan: Growth — $499/month
            </p>
            <p className="text-[#475569] text-sm leading-relaxed max-w-2xl mx-auto">
              Balanced for SEO, AEO, GEO, technical optimisation, e-commerce visibility and ongoing
              growth. Not sure which tier fits?{' '}
              <Link to="/contact" className="text-brand-purple font-semibold hover:underline">
                Ask us for a written recommendation →
              </Link>
            </p>
          </motion.div>
        </div>
      </section>

      <CTABanner />
    </main>
  );
}
