import SEO from '../../components/SEO';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Check, Search, TrendingUp, BarChart3,
  Globe, FileText, Link2, MapPin, AlertCircle,
  ChevronDown, ChevronUp, Shield, Clock, Eye,
  Target, Zap,
} from 'lucide-react';
import CTABanner from '../../components/home/CTABanner';
import TestimonialsSection from '../../components/home/TestimonialsSection';
import { useState } from 'react';
import { SERVICES } from '../../data/siteData';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay },
  viewport: { once: true },
});

const WHY_STATS = [
  { number: '93%', label: 'of online experiences begin with a search engine' },
  { number: '75%', label: 'of users never scroll past the first page of results' },
  { number: '53%', label: 'of all website traffic comes from organic search' },
  { number: '14.6x', label: 'better close rate for SEO leads vs. outbound' },
];

const PAIN_POINTS = [
  {
    icon: AlertCircle,
    title: "You're Not Ranking for Your Keywords",
    desc: 'Your ideal customers are searching for what you offer every day — but they\'re finding your competitors, not you. That\'s revenue walking out the door before it ever reaches you.',
  },
  {
    icon: TrendingUp,
    title: 'Traffic Is Flat or Declining',
    desc: 'If your organic traffic hasn\'t grown in months, algorithm changes or competitor investments are quietly eating your market share. Doing nothing makes it worse.',
  },
  {
    icon: BarChart3,
    title: 'Paid Ads Stop Working When You Stop Paying',
    desc: 'PPC gets you in front of people today — but the moment you pause spend, the traffic stops. SEO builds compounding organic visibility that keeps generating leads for years.',
  },
  {
    icon: AlertCircle,
    title: "You've Tried SEO Before With No Results",
    desc: 'Most SEO failures come from generic tactics, no clear strategy, or optimizing for the wrong keywords. We audit what went wrong and build a plan around what actually works for your market.',
  },
];

const INCLUDED = [
  {
    icon: Zap,
    title: 'Technical SEO Audit',
    desc: 'We crawl every page to find and fix crawlability issues, broken links, duplicate content, page speed problems, and indexation gaps. The technical foundation must be solid before anything else works.',
    color: 'from-violet-600 to-purple-600',
  },
  {
    icon: Search,
    title: 'Keyword Research & Strategy',
    desc: 'We identify the exact phrases your ideal customers type when they\'re ready to buy — not just high-volume terms. We map keywords to pages and build a content calendar around commercial intent.',
    color: 'from-indigo-500 to-blue-600',
  },
  {
    icon: FileText,
    title: 'On-Page Optimization',
    desc: 'Title tags, meta descriptions, header structure, internal linking, image alt text, and schema markup — all optimized for your target keywords. We touch every ranking signal on the page.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Eye,
    title: 'Content Strategy & Optimization',
    desc: 'We analyze your top competitors\' content to find the gaps. Then we create a clear plan: which pages to add, which to consolidate, and how to rewrite existing pages to outrank them.',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    icon: MapPin,
    title: 'Local SEO',
    desc: 'City-specific landing pages, Google Business Profile signals, local citations, and NAP consistency across the web — so you rank in the local pack and Google Maps for your service area.',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: Link2,
    title: 'Link Building',
    desc: 'White-hat backlink acquisition from relevant, authoritative sites in your industry. We build domain authority the right way — no spammy tactics that put your site at risk.',
    color: 'from-pink-500 to-rose-500',
  },
  {
    icon: BarChart3,
    title: 'Monthly Reporting',
    desc: 'Clear dashboards showing keyword rankings, organic traffic, clicks, CTR, and conversions. Every report comes with a plain-English explanation of what changed and why.',
    color: 'from-slate-500 to-blue-600',
  },
  {
    icon: Globe,
    title: 'Competitor Analysis',
    desc: 'We track what your top competitors are doing — their keyword positions, new content, backlink gains — and use that intelligence to stay one step ahead in your niche.',
    color: 'from-teal-500 to-emerald-600',
  },
];

const PROCESS = [
  {
    step: '01',
    phase: 'Month 1',
    title: 'Audit & Research',
    desc: 'We start with a comprehensive technical audit, keyword research, and competitor analysis. We establish baseline rankings and traffic benchmarks so we can measure every improvement from here.',
    bullets: ['Full technical SEO audit', 'Keyword gap analysis vs. competitors', 'Baseline ranking & traffic benchmark', 'Priority issue identification'],
  },
  {
    step: '02',
    phase: 'Month 1–2',
    title: 'Technical Foundation',
    desc: 'We fix the issues blocking Google from crawling and indexing your site properly. Fast pages, clean URL structure, correct canonicalization, and complete schema markup.',
    bullets: ['Crawlability & indexation fixes', 'Page speed optimization', 'Schema markup implementation', 'XML sitemap & robots.txt setup'],
  },
  {
    step: '03',
    phase: 'Month 2–3',
    title: 'On-Page & Content',
    desc: 'We optimize your existing pages for target keywords and create new content to fill gaps. Every page gets a clear keyword focus, proper internal links, and content depth that outpaces competitors.',
    bullets: ['Title tag & meta optimization', 'Header & content restructuring', 'Internal link architecture', 'New content creation & briefs'],
  },
  {
    step: '04',
    phase: 'Month 3+',
    title: 'Authority Building',
    desc: 'Once the foundation is solid, we build your domain authority through white-hat link acquisition and local citation building. Authority compounds over time — this is where the long-term gains come from.',
    bullets: ['White-hat backlink outreach', 'Local citation building', 'Digital PR & content promotion', 'Guest posting on relevant sites'],
  },
  {
    step: '05',
    phase: 'Ongoing',
    title: 'Monitor, Report & Refine',
    desc: 'Monthly reporting with clear metrics, algorithm monitoring, and continuous refinement. SEO never stops — and neither do we. Every month we analyze what\'s working and double down on it.',
    bullets: ['Monthly ranking & traffic report', 'Algorithm change monitoring', 'Conversion rate tracking', 'Strategy refinement based on data'],
  },
];

const WHY_US = [
  {
    icon: Shield,
    title: 'No Black-Hat Tactics',
    desc: 'We only use Google-compliant methods. No link spam, no keyword stuffing, no tactics that risk penalizing your site.',
  },
  {
    icon: Eye,
    title: 'Full Transparency',
    desc: 'You see exactly what we do every month. Every action is documented and explained in plain English — no smoke and mirrors.',
  },
  {
    icon: Target,
    title: 'Industry-Specific Strategy',
    desc: 'We don\'t run the same playbook for every client. Your strategy is built around your specific market, competitors, and customer intent.',
  },
  {
    icon: MapPin,
    title: 'Local SEO Specialists',
    desc: 'We specialize in ranking businesses in specific cities and service areas — not just generic national keywords.',
  },
  {
    icon: Clock,
    title: 'No Heavy Upfront Cost',
    desc: 'Your website, hosting and SEO setup are included in one predictable monthly growth plan — no $3,000 project invoice before results start.',
  },
  {
    icon: TrendingUp,
    title: 'ROI-Focused Reporting',
    desc: 'We track rankings AND conversions. Higher rankings that don\'t generate leads are vanity metrics — we measure what matters.',
  },
];

const RESULT_STATS = [
  { number: '47%', label: 'Avg organic traffic increase in 6 months' },
  { number: '15+', label: 'Page-1 keyword positions per client' },
  { number: '3–6mo', label: 'Avg time to first meaningful results' },
  { number: '200+', label: 'Businesses ranked by our team' },
];

const FAQS = [
  { q: 'How long does SEO take to show results?', a: 'SEO is a long-term strategy. Most businesses see meaningful improvements within 3–6 months, with stronger results at 6–12 months. Competitive niches may take longer, but we set clear milestones so you always know where you stand.' },
  { q: 'What is included in your SEO service?', a: 'Our SEO service includes a technical audit, on-page optimization, keyword research and strategy, content recommendations, link building, local SEO (if applicable), and monthly reporting with transparent metrics.' },
  { q: 'Do you guarantee #1 rankings?', a: 'No ethical SEO agency can guarantee specific rankings — Google\'s algorithm changes constantly. We do guarantee full transparency, best practices, and a measurable improvement in organic visibility, traffic, and leads.' },
  { q: 'Do you handle local SEO for businesses targeting nearby customers?', a: 'Yes — local SEO is one of our core specializations. We optimize your on-page signals, Google Business Profile, local citations, and location-specific content to help you rank in local searches and Google Maps.' },
  { q: 'What if my industry is very competitive?', a: 'Competitive markets require smarter strategy, not just more effort. We identify keyword opportunities your competitors are missing, build stronger content, and target long-tail phrases that convert well — creating a path to rankings even in crowded spaces.' },
  { q: 'Will you need access to my website and Google accounts?', a: 'Yes — we\'ll need access to your CMS for on-page changes, Google Search Console for indexation data, and Google Analytics for traffic tracking. We can also create separate view-only access so you can monitor progress anytime.' },
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
      name: 'Search Engine Optimization',
      description: 'Data-driven SEO strategies that grow your organic rankings, drive qualified traffic, and convert search visitors into paying customers — month after month.',
      provider: {
        '@type': 'LocalBusiness',
        '@id': 'https://www.noveliotech.com/#business',
        name: 'Novelio Technologies LLC',
        url: 'https://www.noveliotech.com',
      },
      areaServed: { '@type': 'Country', name: 'United States' },
      serviceType: 'Search Engine Optimization',
      url: 'https://www.noveliotech.com/services/search-engine-optimization',
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
        title="Search Engine Optimization — Rankings Built to Last. Traffic That Converts."
        description="Data-driven SEO that grows organic rankings, drives qualified traffic, and converts visitors into paying customers. Free SEO audit available."
        canonical="/services/search-engine-optimization"
        schema={schema}
      />

      {/* ── Hero ── */}
      <section className="section-pad relative overflow-hidden bg-dark">
        <div className="orb orb-blue w-[500px] h-[500px] -top-48 -left-48 opacity-15" />
        <div className="orb orb-purple w-[400px] h-[400px] top-0 -right-32 opacity-10" />
        <div className="dot-grid absolute inset-0 opacity-40" />
        <div className="container-xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
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
                Rankings Built to <span className="gradient-text">Last.</span>{' '}
                Traffic That <span className="gradient-text">Converts.</span>
              </h1>
              <p className="text-[#475569] text-xl leading-relaxed mb-8">
                Data-driven SEO strategies that grow your organic rankings, drive qualified traffic,
                and convert search visitors into paying customers — month after month.
              </p>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {['Technical SEO Audit', 'On-Page Optimization', 'Keyword Research & Strategy', 'Local SEO', 'Link Building', 'Monthly Reporting'].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-[#475569] text-sm">
                    <Check className="w-4 h-4 bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-full p-0.5 flex-shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/contact" className="btn-primary">
                  Get a Free SEO Audit
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/contact" className="btn-ghost">Talk to Our Team</Link>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="relative hidden lg:block">
              <div className="w-full aspect-square rounded-3xl bg-gradient-to-br from-indigo-500 to-blue-600 opacity-10 absolute inset-0 blur-3xl" />
              <div className="glass-card gradient-border rounded-3xl p-10 relative flex items-center justify-center">
                <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-glow">
                  <Search className="w-16 h-16 text-white" />
                </div>
              </div>
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity }}
                className="absolute -bottom-6 -left-6 glass-card gradient-border rounded-2xl px-5 py-3">
                <div className="text-2xl font-heading font-800 gradient-text">47%</div>
                <div className="text-xs text-[#475569]">Avg Traffic Increase</div>
              </motion.div>
              <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 4.5, repeat: Infinity }}
                className="absolute -top-6 -right-6 glass-card gradient-border rounded-2xl px-5 py-3">
                <div className="text-2xl font-heading font-800 gradient-text">15+</div>
                <div className="text-xs text-[#475569]">Page-1 Keywords</div>
              </motion.div>
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
              Your Competitors Are Ranking. <span className="gradient-text">You Should Be Too.</span>
            </h2>
            <p className="text-[#475569] text-lg max-w-2xl mx-auto">
              Search is the highest-intent marketing channel that exists. When someone Googles
              what you offer, they're already raising their hand. The only question is whether they find you.
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
              Every Deliverable in Our <span className="gradient-text">SEO Service</span>
            </h2>
            <p className="text-[#475569] text-lg max-w-2xl mx-auto">
              We cover every ranking factor — technical, on-page, content, and off-page. Nothing is left on the table.
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {INCLUDED.map((item, i) => (
              <motion.div key={i} {...fadeUp(i * 0.07)}
                className="glass-card gradient-border rounded-2xl p-6 group hover:-translate-y-1 hover:shadow-glow transition-all duration-300">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-[#1B3172] font-heading font-600 text-[15px] mb-2">{item.title}</h4>
                <p className="text-[#475569] text-xs leading-relaxed">{item.desc}</p>
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
              Our Month-by-Month <span className="gradient-text">SEO Process</span>
            </h2>
            <p className="text-[#475569] text-lg max-w-2xl mx-auto">
              SEO done right is a structured, sequenced process — not random tasks thrown at a wall.
              Here's exactly what happens from day one.
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

      {/* ── Results + Why Us ── */}
      <section className="section-pad bg-dark relative overflow-hidden">
        <div className="orb orb-purple w-[400px] h-[400px] -bottom-32 -right-32 opacity-10" />
        <div className="container-xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Results */}
            <div>
              <motion.div {...fadeUp()}>
                <div className="section-label mb-4">Results</div>
                <h2 className="text-3xl font-heading font-700 text-[#1B3172] mb-4">
                  Real Numbers from <span className="gradient-text">Real Clients</span>
                </h2>
                <p className="text-[#475569] text-base leading-relaxed mb-8">
                  These aren't projections or case-study cherrypicks. They're the averages we see
                  across our client base within the first 6 months of an engagement.
                </p>
              </motion.div>
              <div className="grid grid-cols-2 gap-5">
                {RESULT_STATS.map((s, i) => (
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
                  What Makes Our SEO <span className="gradient-text">Different</span>
                </h2>
                <p className="text-[#475569] text-base leading-relaxed mb-8">
                  There's no shortage of SEO agencies. Here's how to tell us apart from the rest.
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
              Common <span className="gradient-text">Questions</span>
            </h2>
          </motion.div>
          <div className="space-y-3 max-w-3xl mx-auto">
            {FAQS.map((faq, i) => (
              <motion.div key={i} {...fadeUp(i * 0.08)}>
                <FAQItem q={faq.q} a={faq.a} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <TestimonialsSection />
      <CTABanner />
    </main>
  );
}
