import SEO from '../../components/SEO';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Check, Search, TrendingUp, BarChart3,
  Globe, FileText, Link2, MapPin, AlertCircle,
  ChevronDown, ChevronUp, Shield, Clock, Eye,
  Target, Zap, Sparkles,
} from 'lucide-react';
import CTABanner from '../../components/home/CTABanner';
import ServiceLeadForm from '../../components/services/ServiceLeadForm';
import TestimonialsSection from '../../components/home/TestimonialsSection';
import { useState } from 'react';
import { SERVICES, CALENDLY_LINK } from '../../data/siteData';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay },
  viewport: { once: true },
});

const WHY_STATS = [
  { number: 'Free', label: 'SEO audit to see where your website stands today' },
  { number: '$299', label: 'per month is where our SEO, AEO and GEO plans start' },
  { number: '3–6 mo', label: 'typical window before SEO work shows measurable movement' },
  { number: '0', label: 'ranking guarantees, shortcuts, or black-hat tactics' },
];

const PAIN_POINTS = [
  {
    icon: AlertCircle,
    title: "You Don't Show Up for Important Searches",
    desc: "People are searching for exactly what you offer, but your website isn't appearing for those searches. When you're not visible, they find a competitor instead.",
  },
  {
    icon: TrendingUp,
    title: 'Traffic Is Flat or Declining',
    desc: "If organic traffic hasn't grown in months, technical problems, outdated pages, or stronger competitors may be holding you back. It rarely fixes itself.",
  },
  {
    icon: BarChart3,
    title: 'Paid Ads Stop Working When You Stop Paying',
    desc: 'Ads put you in front of people today, but the traffic stops when the budget does. SEO builds organic visibility that keeps working between campaigns.',
  },
  {
    icon: AlertCircle,
    title: "You've Tried SEO Before With No Results",
    desc: "Most SEO disappointments come from generic checklists, unclear deliverables, or chasing the wrong keywords. We review what was done and build a plan around your market.",
  },
];

const INCLUDED = [
  {
    icon: Zap,
    title: 'Technical SEO and Website Optimization',
    paragraphs: [
      'Technical SEO helps search engines discover, crawl, understand, and index your important pages. Problems with indexing, redirects, duplicate URLs, or site architecture can hide your most valuable content.',
      'Our technical SEO audit covers crawlability, XML sitemaps, robots.txt, canonical tags, broken links, structured data, internal site structure, and Core Web Vitals. You get prioritized findings, and we fix the issues that matter most first.',
    ],
    link: { to: '/free-seo-audit', label: 'Run a free SEO audit' },
    color: 'from-violet-600 to-purple-600',
  },
  {
    icon: Search,
    title: 'Keyword Research and SEO Strategy',
    paragraphs: [
      'We look at the searches your customers actually use. Instead of picking terms by search volume alone, we weigh search intent, competition, relevance, and commercial value.',
      'That includes commercial keyword discovery, competitor keyword gaps, location-based research, and keyword mapping, so every important page has one clear job. The strategy ties keywords to content planning, internal linking, and page optimization, and avoids pages competing with each other.',
    ],
    color: 'from-indigo-500 to-blue-600',
  },
  {
    icon: FileText,
    title: 'On-Page SEO and Content Optimization',
    paragraphs: [
      'Every page should clearly explain what you offer, who you serve, and why someone should choose you. We improve title tags, meta descriptions, headings, page copy, image alt text, URLs, and internal links.',
      'We also rework existing pages to match search intent: clearer service descriptions, answers to real customer questions, and stronger calls to action. No keyword stuffing, just pages that are more useful to visitors and easier for search engines to understand.',
    ],
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Eye,
    title: 'SEO Content Strategy and Writing',
    paragraphs: [
      'Publishing more blog posts does not guarantee more rankings or leads. A good content strategy serves customer needs and supports your most important service pages.',
      'We find opportunities through content audits, competitor research, customer questions, and keyword analysis, then turn them into content plans, service-page briefs, and supporting blog topics. We improve what you already have before recommending new pages.',
    ],
    color: 'from-emerald-500 to-teal-600',
  },
  {
    icon: MapPin,
    title: 'Local SEO Services',
    paragraphs: [
      'Local SEO helps you appear in searches tied to the cities, towns, and areas you serve. It matters most for businesses with customers in a defined geographic market.',
      'We work on Google Business Profile optimization, local keyword research, business listing consistency, location pages, and local competitor analysis. Map visibility depends on relevance, distance, and prominence, so we focus on what you can control rather than promising specific map positions.',
    ],
    link: { to: '/services/google-business-profile', label: 'See Google Business Profile management' },
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: Link2,
    title: 'Link Building',
    paragraphs: [
      'Relevant backlinks build your website\'s authority and help new customers discover you. What counts is relevance and credibility, not the raw number of links.',
      'We analyze your current backlink profile and your competitors\' links, then research outreach opportunities from sources relevant to your industry, audience, and expertise. No link schemes or tactics that put your site at risk.',
    ],
    color: 'from-pink-500 to-rose-500',
  },
  {
    icon: Globe,
    title: 'Competitor SEO Analysis',
    paragraphs: [
      'We compare your site with the competitors that outrank you to find keyword gaps, content opportunities, and differences in search visibility.',
      'Those findings set the priorities for your content and optimization work, so effort goes where it can actually move the needle in your market.',
    ],
    color: 'from-teal-500 to-emerald-600',
  },
  {
    icon: BarChart3,
    title: 'SEO Reporting and Ongoing Optimization',
    paragraphs: [
      'Rankings alone don\'t tell the full story. We report on Google Search Console clicks and impressions, organic landing-page performance, query trends, ranking changes, and tracked inquiries or conversions.',
      'Every report explains what changed and what we are doing next in plain English. The data then shapes the following month\'s priorities, so your strategy keeps pace with your market.',
    ],
    color: 'from-slate-500 to-blue-600',
  },
];

const PROCESS = [
  {
    step: '01',
    phase: 'Month 1',
    title: 'Website SEO Audit and Business Analysis',
    desc: 'We review your site\'s technical condition, important landing pages, current content, and available performance data, and learn how your business wins customers. This tells us which issues and opportunities matter most.',
    bullets: ['Full technical SEO audit', 'Landing page and content review', 'Baseline traffic and visibility benchmark', 'Priority issue list'],
  },
  {
    step: '02',
    phase: 'Month 1',
    title: 'Keyword Research and Page Mapping',
    desc: 'We research commercial and informational searches, analyze intent, and map keyword groups to the right URLs. Each important page gets a defined role in your SEO strategy.',
    bullets: ['Commercial keyword discovery', 'Competitor keyword gap analysis', 'Location-based keyword research', 'Keyword-to-page mapping'],
  },
  {
    step: '03',
    phase: 'Month 1–3',
    title: 'Website and Content Optimization',
    desc: 'We work through technical fixes, on-page improvements, internal linking, and content updates in order of impact, based on the audit findings and your plan scope.',
    bullets: ['Crawlability and indexing fixes', 'Title, meta and heading optimization', 'Internal link structure', 'Content updates and new page briefs'],
  },
  {
    step: '04',
    phase: 'Month 3+',
    title: 'Authority Building',
    desc: 'Once the foundation is solid, we build credibility through relevant links and consistent local listings. Authority builds over time, and this is where long-term gains come from.',
    bullets: ['Backlink and competitor link review', 'Relevant outreach research', 'Local citation consistency', 'Industry-relevant link opportunities'],
  },
  {
    step: '05',
    phase: 'Ongoing',
    title: 'Performance Measurement and Refinement',
    desc: 'We review search and conversion data every month, report on progress, and adjust priorities as your website and competitive market change. SEO is ongoing work, not a one-time project.',
    bullets: ['Monthly performance report', 'Search Console query review', 'Conversion and inquiry tracking', 'Priority adjustments based on data'],
  },
];

const WHY_US = [
  {
    icon: Target,
    title: 'A Strategy Built Around Your Business',
    desc: 'Your plan reflects your audience, services, competitors, and growth goals. We don\'t apply the same checklist to every website.',
  },
  {
    icon: Eye,
    title: 'Clear Priorities and Deliverables',
    desc: 'You know exactly what is included, what we are working on each month, and how it supports your goals. Every plan has its scope published.',
  },
  {
    icon: Search,
    title: 'Technical and Content Expertise',
    desc: 'From technical audits to keyword research and content, we treat each part of SEO as one connected system rather than separate tasks.',
  },
  {
    icon: Sparkles,
    title: 'Built for AI Search Too',
    desc: 'Our plans cover answer engine (AEO) and generative engine (GEO) optimization, so your business can be cited in AI Overviews and AI assistants, not just blue links.',
  },
  {
    icon: TrendingUp,
    title: 'A Focus on Measurable Progress',
    desc: 'We track organic visibility, relevant traffic, landing-page performance, and conversions. Higher rankings that bring no inquiries are not the goal.',
  },
  {
    icon: Shield,
    title: 'Sustainable, Google-Compliant Practices',
    desc: 'Useful content, sound technical work, and credible authority building. We don\'t guarantee first-page rankings or fixed timelines, because no one honestly can.',
  },
  {
    icon: Clock,
    title: 'No Heavy Upfront Cost',
    desc: 'Your website, hosting and SEO setup are included in one predictable monthly growth plan. No $3,000 project invoice before results start.',
  },
];

const MEASURE_STATS = [
  { number: 'Clicks', label: 'and impressions from Google Search Console' },
  { number: 'Pages', label: 'organic landing-page performance' },
  { number: 'Queries', label: 'search query trends and ranking changes' },
  { number: 'Leads', label: 'tracked inquiries and conversions' },
];

const FAQS = [
  { q: 'What are SEO services for small businesses?', a: 'SEO services help small businesses appear in unpaid search results. They typically include technical SEO, keyword research, on-page optimization, content strategy, local SEO, competitor analysis, link building, and performance reporting.' },
  { q: 'How long does SEO take to show results?', a: 'SEO is a long-term investment. Most businesses see measurable movement within 3–6 months, with stronger results at 6–12 months. Competitive markets can take longer, and we report on progress every month so you always know where you stand.' },
  { q: 'How do I choose an SEO agency for my small business?', a: 'Choose an agency that explains its approach, defines deliverables in writing, communicates clearly, and measures traffic and inquiries rather than rankings alone. Be cautious of anyone who guarantees rankings.' },
  { q: 'Are affordable SEO services effective?', a: 'Yes, when the scope matches your priorities. A focused plan with clear deliverables and realistic goals usually beats a cheap package that spreads effort too thin.' },
  { q: 'Do you offer monthly SEO services?', a: 'Yes. Our monthly SEO plans cover ongoing optimization, content improvements, and performance reporting. What is included depends on the plan you choose, and every plan has its scope published.' },
  { q: 'Can I hire an SEO consultant instead of an agency?', a: 'Yes. If you mainly need an audit, keyword research, or strategic guidance, a consulting engagement can work well. If you also need the work implemented, an ongoing SEO plan is usually the better fit.' },
  { q: 'How much do SEO packages for small businesses cost?', a: 'Pricing depends on your website, competition, target market, and the work required. Our SEO, AEO and GEO plans start at $299 per month, and the full scope of each plan is published on our SEO plans page.' },
  { q: 'Will you need access to my website and Google accounts?', a: 'Yes. We need access to your CMS for on-page changes, Google Search Console for indexing and search data, and Google Analytics for traffic tracking. You keep ownership of every account.' },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass-card gradient-border rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-5 text-left gap-4">
        <span className="text-[#1B3172] font-medium text-[15px]">{q}</span>
        {open
          ? <ChevronUp className="w-5 h-5 text-brand-purple flex-shrink-0" />
          : <ChevronDown className="w-5 h-5 text-[#64748b] flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-5 pt-0 border-t border-slate-200">
          <p className="text-[#475569] text-sm leading-relaxed pt-4">{a}</p>
        </div>
      )}
    </div>
  );
}

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Service',
      name: 'SEO Services for Small Businesses',
      description: 'Search engine optimization services for small businesses: technical SEO, keyword research, on-page and content optimization, local SEO, link building, and monthly performance reporting.',
      provider: {
        '@type': 'LocalBusiness',
        '@id': 'https://www.noveliotech.com/#business',
        name: 'Novelio Technologies LLC',
        url: 'https://www.noveliotech.com',
      },
      areaServed: { '@type': 'Country', name: 'United States' },
      serviceType: 'Search Engine Optimization',
      url: 'https://www.noveliotech.com/services/search-engine-optimization',
      offers: {
        '@type': 'Offer',
        url: 'https://www.noveliotech.com/services/seo-plans',
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: 299,
          priceCurrency: 'USD',
          unitText: 'MONTH',
        },
      },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.noveliotech.com' },
        { '@type': 'ListItem', position: 2, name: 'Services', item: 'https://www.noveliotech.com/services' },
        { '@type': 'ListItem', position: 3, name: 'Search Engine Optimization', item: 'https://www.noveliotech.com/services/search-engine-optimization' },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: FAQS.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ],
};

export default function SearchEngineOptimizationPage() {
  return (
    <main className="pt-20">
      <SEO
        title="SEO Services for Small Businesses"
        description="SEO services for small businesses: technical fixes, keyword strategy, local SEO and monthly reporting. Plans from $299/mo. Get a free SEO audit."
        canonical="/services/search-engine-optimization"
        schema={schema}
      />

      {/* ── Hero ── */}
      <section className="section-pad relative overflow-hidden bg-dark">
        <div className="orb orb-blue w-[500px] h-[500px] -top-48 -left-48 opacity-15" />
        <div className="orb orb-purple w-[400px] h-[400px] top-0 -right-32 opacity-10" />
        <div className="dot-grid absolute inset-0 opacity-40" />
        <div className="container-xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
              <div className="flex items-center gap-2 text-sm text-[#64748b] mb-6">
                <Link to="/" className="hover:text-[#1B3172] transition-colors">Home</Link>
                <span>/</span>
                <Link to="/services" className="hover:text-[#1B3172] transition-colors">Services</Link>
                <span>/</span>
                <span className="text-[#1B3172]">Search Engine Optimization</span>
              </div>
              <div className="section-label mb-4">SEO Services</div>
              <h1 className="text-4xl lg:text-6xl font-heading font-800 text-[#1B3172] mb-6 leading-tight">
                Search Engine Optimization Services for{' '}
                <span className="gradient-text">Small Businesses</span>
              </h1>
              <p className="text-[#475569] text-xl leading-relaxed mb-8">
                Help more customers find your business online. We combine technical fixes, keyword
                research, content optimization, local SEO, and clear reporting to grow organic
                visibility and turn searches into inquiries.
              </p>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {['Technical SEO Audit', 'On-Page Optimization', 'Keyword Research & Strategy', 'Local SEO', 'Link Building', 'Monthly Reporting'].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-[#475569] text-sm">
                    <Check className="w-4 h-4 bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-full p-0.5 flex-shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <a {...CALENDLY_LINK} className="btn-ghost">Prefer to Talk? Book a Call</a>
                <Link to="/free-seo-audit" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#4338CA] hover:text-[#1B3172] transition-colors">
                  Or run our instant SEO audit tool
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>

            <motion.div id="seo-review-form" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="relative scroll-mt-28">
              <div className="w-full h-full rounded-3xl bg-gradient-to-br from-indigo-500 to-blue-600 opacity-10 absolute inset-0 blur-3xl" />
              <div className="relative">
                <ServiceLeadForm
                  source="seo-hero"
                  service="SEO"
                  title="Get a Free SEO Review"
                  subtitle="Tell us about your website. We'll review it and send you the biggest opportunities we find, with no obligation."
                  goals={['More local customers', 'More website traffic', 'More leads from my site', 'Fix technical SEO issues', 'Not sure yet']}
                  submitLabel="Get My Free SEO Review"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Why SEO Matters ── */}
      <section className="section-pad bg-[#EEF2FF] relative overflow-hidden">
        <div className="container-xl">
          <motion.div {...fadeUp()} className="text-center mb-16">
            <div className="section-label mx-auto mb-4">The Opportunity</div>
            <h2 className="text-4xl font-heading font-700 text-[#1B3172] mb-4">
              Help More Customers <span className="gradient-text">Find Your Business Online</span>
            </h2>
            <p className="text-[#475569] text-lg max-w-2xl mx-auto">
              When people search for the products or services you offer, your website needs to be
              visible, relevant, and easy to use. If it doesn't appear for those searches, they find
              a competitor instead. Whether you need a technical audit, stronger service pages, or a
              complete SEO strategy, we tailor the work to your goals and your market.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
            {WHY_STATS.map((s, i) => (
              <motion.div key={i} {...fadeUp(i * 0.1)}
                className="glass-card gradient-border rounded-2xl p-6 text-center group hover:-translate-y-1 hover:shadow-glow transition-all duration-300">
                <div className="text-4xl font-heading font-800 gradient-text mb-3">{s.number}</div>
                <p className="text-[#475569] text-sm leading-snug">{s.label}</p>
              </motion.div>
            ))}
          </div>

          <motion.div {...fadeUp(0.2)} className="text-center mb-12">
            <h3 className="text-2xl font-heading font-700 text-[#1B3172] mb-4">
              Sound Familiar? <span className="gradient-text">We've Heard It Before.</span>
            </h3>
          </motion.div>
          <div className="grid sm:grid-cols-2 gap-6">
            {PAIN_POINTS.map((p, i) => (
              <motion.div key={i} {...fadeUp(i * 0.1)}
                className="glass-card gradient-border rounded-2xl p-6 flex items-start gap-5 group hover:-translate-y-1 hover:shadow-glow transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <p.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-[#1B3172] font-heading font-600 text-[15px] mb-1">{p.title}</h4>
                  <p className="text-[#475569] text-sm leading-relaxed">{p.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What's Included ── */}
      <section className="section-pad bg-dark relative overflow-hidden">
        <div className="orb orb-blue w-[400px] h-[400px] -top-32 -right-32 opacity-10" />
        <div className="container-xl relative z-10">
          <motion.div {...fadeUp()} className="text-center mb-16">
            <div className="section-label mx-auto mb-4">What's Included</div>
            <h2 className="text-4xl font-heading font-700 text-[#1B3172] mb-4">
              Our SEO Services for <span className="gradient-text">Small Businesses</span>
            </h2>
            <p className="text-[#475569] text-lg max-w-2xl mx-auto">
              Technical, on-page, content, local, and off-page SEO, planned as one strategy and
              measured against the inquiries and sales your website generates.
            </p>
          </motion.div>
          <div className="grid lg:grid-cols-2 gap-5">
            {INCLUDED.map((item, i) => (
              <motion.div key={i} {...fadeUp((i % 2) * 0.07)}
                className="glass-card gradient-border rounded-2xl p-7 group hover:-translate-y-1 hover:shadow-glow transition-all duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-[#1B3172] font-heading font-600 text-lg leading-snug">{item.title}</h3>
                </div>
                {item.paragraphs.map((p, j) => (
                  <p key={j} className="text-[#475569] text-sm leading-relaxed mb-3 last:mb-0">{p}</p>
                ))}
                {item.link && (
                  <Link to={item.link.to}
                    className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-[#4338CA] hover:text-[#1B3172] transition-colors">
                    {item.link.label}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Our Process ── */}
      <section className="section-pad bg-[#EEF2FF] relative overflow-hidden">
        <div className="container-lg">
          <motion.div {...fadeUp()} className="text-center mb-16">
            <div className="section-label mx-auto mb-4">How We Work</div>
            <h2 className="text-4xl font-heading font-700 text-[#1B3172] mb-4">
              Our Search Engine <span className="gradient-text">Optimization Process</span>
            </h2>
            <p className="text-[#475569] text-lg max-w-2xl mx-auto">
              SEO works best as a structured, sequenced process, not a list of random tasks.
              Here's what happens from day one.
            </p>
          </motion.div>
          <div className="space-y-5">
            {PROCESS.map((step, i) => (
              <motion.div key={i} {...fadeUp(i * 0.1)}
                className="glass-card gradient-border rounded-2xl p-7 group hover:shadow-glow transition-all duration-300">
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform">
                      <span className="text-white font-heading font-800 text-sm">{step.step}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="text-[#1B3172] font-heading font-700 text-lg">{step.title}</h3>
                      <span className="text-xs text-[#4338CA] bg-[#4338CA]/10 border border-[#4338CA]/20 rounded-full px-3 py-0.5 font-medium">
                        {step.phase}
                      </span>
                    </div>
                    <p className="text-[#475569] text-sm leading-relaxed mb-4">{step.desc}</p>
                    <ul className="grid sm:grid-cols-2 gap-2">
                      {step.bullets.map((b, j) => (
                        <li key={j} className="flex items-center gap-2 text-[#475569] text-xs">
                          <Check className="w-3.5 h-3.5 text-[#4338CA] flex-shrink-0" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Measurement + Why Us ── */}
      <section className="section-pad bg-dark relative overflow-hidden">
        <div className="orb orb-purple w-[400px] h-[400px] -bottom-32 -right-32 opacity-10" />
        <div className="container-xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Measurement */}
            <div>
              <motion.div {...fadeUp()}>
                <div className="section-label mb-4">Reporting</div>
                <h2 className="text-3xl font-heading font-700 text-[#1B3172] mb-4">
                  We Measure Progress, <span className="gradient-text">Not Just Rankings</span>
                </h2>
                <p className="text-[#475569] text-base leading-relaxed mb-8">
                  Rankings alone don't show whether SEO is working. Each month we review the numbers
                  that connect search visibility to your business, explain them in plain English, and
                  use them to set the next month's priorities.
                </p>
              </motion.div>
              <div className="grid grid-cols-2 gap-5">
                {MEASURE_STATS.map((s, i) => (
                  <motion.div key={i} {...fadeUp(i * 0.1)}
                    className="glass-card gradient-border rounded-2xl p-6 text-center group hover:-translate-y-1 hover:shadow-glow transition-all duration-300">
                    <div className="text-3xl font-heading font-800 gradient-text mb-1">{s.number}</div>
                    <div className="text-[#475569] text-xs">{s.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Why Us */}
            <div>
              <motion.div {...fadeUp(0.1)}>
                <div className="section-label mb-4">Why Novelio</div>
                <h2 className="text-3xl font-heading font-700 text-[#1B3172] mb-4">
                  Why Choose <span className="gradient-text">Novelio Technologies?</span>
                </h2>
                <p className="text-[#475569] text-base leading-relaxed mb-8">
                  There's no shortage of SEO agencies. Here's how we work differently.
                </p>
              </motion.div>
              <div className="space-y-4">
                {WHY_US.map((item, i) => (
                  <motion.div key={i} {...fadeUp(0.1 + i * 0.08)}
                    className="glass-card gradient-border rounded-xl p-5 flex items-start gap-4 group hover:shadow-glow transition-all duration-300">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <item.icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-[#1B3172] font-heading font-600 text-sm mb-1">{item.title}</p>
                      <p className="text-[#475569] text-xs leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SEO plans ── */}
      <section className="section-pad-sm bg-white">
        <div className="container-xl">
          <motion.div
            {...fadeUp()}
            className="rounded-2xl bg-gradient-to-br from-[#1B3172] to-[#091830] p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left"
          >
            <div>
              <h3 className="text-white font-heading font-700 text-2xl mb-2">
                See the SEO, AEO &amp; GEO plans
              </h3>
              <p className="text-white/70 text-sm sm:text-base max-w-2xl leading-relaxed">
                Three monthly engagement tiers from $299, with every line of scope published, from
                keyword mapping and technical health to answer-engine and AI-search visibility.
              </p>
            </div>
            <Link
              to="/services/seo-plans"
              className="shrink-0 inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white text-[#1B3172] text-sm font-semibold hover:bg-slate-100 transition-all"
            >
              Compare SEO Plans
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Other Services ── */}
      <section className="section-pad-sm bg-[#EEF2FF]">
        <div className="container-xl">
          <motion.div {...fadeUp()} className="text-center mb-8">
            <h3 className="text-2xl font-heading font-700 text-[#1B3172]">Explore Our Other Services</h3>
          </motion.div>
          <div className="flex flex-wrap gap-3 justify-center">
            {SERVICES.filter((s) => s.id !== 'search-engine-optimization').map((s) => (
              <Link key={s.id} to={s.slug}
                className="glass-card gradient-border rounded-full px-5 py-2.5 text-sm font-medium text-[#475569] hover:text-[#1B3172] hover:shadow-glow transition-all">
                {s.short}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="section-pad bg-dark relative overflow-hidden">
        <div className="container-lg">
          <motion.div {...fadeUp()} className="text-center mb-12">
            <div className="section-label mx-auto mb-4">FAQs</div>
            <h2 className="text-4xl font-heading font-700 text-[#1B3172] mb-4">
              Frequently Asked Questions <span className="gradient-text">About SEO Services</span>
            </h2>
          </motion.div>
          <div className="space-y-3 max-w-3xl mx-auto">
            {FAQS.map((faq, i) => (
              <motion.div key={i} {...fadeUp(i * 0.08)}>
                <FAQItem q={faq.q} a={faq.a} />
              </motion.div>
            ))}
          </div>
          <p className="text-center text-[#475569] text-sm mt-8 max-w-3xl mx-auto">
            Want more detail? Read our guides to{' '}
            <Link to="/blog/small-business-seo-services" className="text-[#4338CA] font-medium hover:text-[#1B3172] transition-colors">
              choosing small business SEO services
            </Link>{' '}
            and{' '}
            <Link to="/blog/seo-for-small-business-websites" className="text-[#4338CA] font-medium hover:text-[#1B3172] transition-colors">
              SEO for small business websites
            </Link>.
          </p>
        </div>
      </section>

      {/* ── Closing CTA ── */}
      <section className="section-pad-sm bg-white">
        <div className="container-xl">
          <motion.div
            {...fadeUp()}
            className="rounded-2xl bg-gradient-to-br from-[#1B3172] to-[#091830] p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left"
          >
            <div>
              <h2 className="text-white font-heading font-700 text-2xl mb-2">
                Improve Your Search Visibility With Novelio Technologies
              </h2>
              <p className="text-white/70 text-sm sm:text-base max-w-2xl leading-relaxed">
                Whether you need technical fixes, local optimization, content support, or a complete
                SEO strategy, start by understanding where your website stands today. Request a free
                SEO audit and we'll show you the biggest opportunities.
              </p>
            </div>
            <div className="shrink-0 flex flex-col sm:flex-row gap-3">
              <Link
                to="/free-seo-audit"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white text-[#1B3172] text-sm font-semibold hover:bg-slate-100 transition-all"
              >
                Get a Free SEO Audit
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border border-white/30 text-white text-sm font-semibold hover:bg-white/10 transition-all"
              >
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <TestimonialsSection />
      <CTABanner />
    </main>
  );
}
