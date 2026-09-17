import { useState, useMemo } from 'react';
import SEO from '../../components/SEO';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Check, X, Clock, Smartphone, HelpCircle, TrendingDown,
  ShieldAlert, MousePointerClick, Megaphone, EyeOff, Search, ShoppingCart,
  RefreshCw, LayoutTemplate, Wrench, Compass, PenTool, Code2, Rocket,
  ClipboardCheck, ChevronDown, ChevronUp, Sparkles, Globe, Target,
  MoveRight, Gauge,
} from 'lucide-react';
import CTABanner from '../../components/home/CTABanner';
import TestimonialsSection from '../../components/home/TestimonialsSection';
import { SERVICES, CALENDLY_LINK } from '../../data/siteData';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay },
  viewport: { once: true },
});

/* ── The real problem ─────────────────────────────────────────────────────── */
const PAIN_POINTS = [
  {
    icon: TrendingDown,
    title: 'Visitors come but do not contact you.',
    desc: 'The page gives information, but no clear reason to act.',
  },
  {
    icon: Clock,
    title: 'Your website feels slow or outdated.',
    desc: 'Trust drops before the customer ever speaks to you.',
  },
  {
    icon: Smartphone,
    title: 'The mobile experience is poor.',
    desc: 'Buttons, forms and content become difficult to use.',
  },
  {
    icon: HelpCircle,
    title: 'Your message is unclear.',
    desc: 'Visitors cannot quickly understand what you do or why they should choose you.',
  },
  {
    icon: ShieldAlert,
    title: 'Enquiries are leaking.',
    desc: 'Weak forms, broken journeys and unclear calls to action quietly cost opportunities.',
  },
];

/* ── The hidden cost ──────────────────────────────────────────────────────── */
const HIDDEN_COSTS = [
  {
    num: '01',
    icon: ShieldAlert,
    title: 'Lost Trust',
    desc: 'A potential customer compares you with a competitor who simply looks more credible online.',
  },
  {
    num: '02',
    icon: MousePointerClick,
    title: 'Lost Enquiries',
    desc: 'A visitor leaves before calling because the next step is unclear, difficult or broken.',
  },
  {
    num: '03',
    icon: Megaphone,
    title: 'Wasted Marketing',
    desc: 'SEO, ads and social traffic are wasted if the website cannot convert attention into action.',
  },
  {
    num: '04',
    icon: EyeOff,
    title: 'Invisible Revenue Leakage',
    desc: 'The hardest loss to see is the customer who never contacted you in the first place.',
  },
];

/* ── Customer journey ─────────────────────────────────────────────────────── */
const JOURNEY = [
  { n: '1', title: 'Understand', desc: 'Your visitor knows what you do within seconds.' },
  { n: '2', title: 'Trust', desc: 'Your experience, work, reviews and positioning create confidence.' },
  { n: '3', title: 'Explore', desc: 'Services and information are simple to find and easy to understand.' },
  { n: '4', title: 'Act', desc: 'Calls, quote requests and consultations are obvious and friction-free.' },
  { n: '5', title: 'Convert', desc: 'Your website supports the sales process instead of acting as a static brochure.' },
];

/* ── Services ─────────────────────────────────────────────────────────────── */
const OFFERINGS = [
  {
    tag: 'Business Websites',
    icon: Globe,
    title: 'Professional Business Websites',
    desc: 'Modern websites for small and growing businesses that need credibility, clarity and enquiries.',
    color: 'from-violet-600 to-purple-600',
  },
  {
    tag: 'Custom Development',
    icon: Code2,
    title: 'Custom Website Development',
    desc: 'Website structure and functionality designed around your services, customer journey and goals.',
    color: 'from-blue-600 to-indigo-600',
  },
  {
    tag: 'Service Businesses',
    icon: Target,
    title: 'Lead-Focused Service Websites',
    desc: 'Built around calls, quote requests, appointments and consultation bookings.',
    color: 'from-cyan-500 to-blue-600',
  },
  {
    tag: 'Redesign',
    icon: RefreshCw,
    title: 'Website Redesign',
    desc: 'Improve an outdated website without rebuilding blindly. Keep what works. Fix what does not.',
    color: 'from-orange-500 to-amber-500',
  },
  {
    tag: 'Landing Pages',
    icon: LayoutTemplate,
    title: 'Conversion Landing Pages',
    desc: 'Focused pages for campaigns, paid traffic, offers, local services and lead generation.',
    color: 'from-rose-500 to-pink-600',
  },
  {
    tag: 'E-Commerce',
    icon: ShoppingCart,
    title: 'E-Commerce Websites',
    desc: 'Simple product discovery, cleaner buying journeys and a smoother customer experience.',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    tag: 'Migration',
    icon: MoveRight,
    title: 'Website Migration',
    desc: 'Move your website or hosting environment with planning around URLs, forms, content and continuity.',
    color: 'from-sky-500 to-cyan-600',
  },
  {
    tag: 'Maintenance',
    icon: Wrench,
    title: 'Website Maintenance',
    desc: 'Updates, backups, content changes, technical checks and ongoing support after launch.',
    color: 'from-purple-600 to-fuchsia-600',
  },
  {
    tag: 'SEO Foundation',
    icon: Search,
    title: 'Search-Friendly Development',
    desc: 'Clean structure, headings, metadata readiness, internal linking and technical foundations for SEO.',
    color: 'from-indigo-600 to-blue-700',
  },
];

/* ── Approach ─────────────────────────────────────────────────────────────── */
const APPROACH = [
  { n: '1', icon: Compass, title: 'Discover', desc: 'Business, customer, competitors, services and conversion goals.' },
  { n: '2', icon: ClipboardCheck, title: 'Plan', desc: 'Site structure, messaging hierarchy, page goals and user journey.' },
  { n: '3', icon: PenTool, title: 'Design', desc: 'Professional UI built around clarity, trust and action.' },
  { n: '4', icon: Code2, title: 'Develop', desc: 'Responsive, performance-conscious development with clean functionality.' },
  { n: '5', icon: Rocket, title: 'Test & Launch', desc: 'Mobile checks, forms, key pages, performance and launch readiness.' },
];

/* ── 30-second self-check ─────────────────────────────────────────────────── */
const CHECKS = [
  'Can a visitor understand what you do in 5 seconds?',
  'Is it clear who your ideal customer is?',
  'Does your website explain why someone should choose you?',
  'Does it work properly on mobile?',
  'Is there a clear next step on important pages?',
  'Do forms and enquiries reach you reliably?',
];

/* ── Why Novelio ──────────────────────────────────────────────────────────── */
const PRINCIPLES = [
  { title: 'Clear Messaging', desc: 'People should understand you fast.' },
  { title: 'Professional UI/UX', desc: 'Design should create trust, not confusion.' },
  { title: 'Mobile First', desc: 'The experience must work wherever customers are.' },
  { title: 'Conversion Thinking', desc: 'Every important page should lead somewhere.' },
];

const FAQS = [
  { q: 'How long does a website build take?', a: 'A basic business site takes 2–4 weeks. A custom multi-page site with advanced features takes 4–8 weeks. We always deliver mobile-first, Core Web Vitals-optimized builds and keep you updated at every milestone.' },
  { q: 'What platform do you build on?', a: 'We build on modern frameworks (React, Next.js) for high-performance custom sites, or WordPress and Webflow for clients who need easy self-management. We recommend the right platform based on your goals, not our preference.' },
  { q: 'Will my website be mobile-friendly and fast?', a: 'Absolutely — all our sites are mobile-first by design, tested across devices and browsers, and built to pass Core Web Vitals. Page speed and mobile performance directly impact both rankings and conversions.' },
  { q: 'Do you provide ongoing website maintenance?', a: 'Yes — we offer monthly maintenance plans covering updates, security patches, backups, performance monitoring, and priority support. Most clients find ongoing maintenance pays for itself by preventing costly downtime or security incidents.' },
  { q: 'Do you write the copy for the website?', a: 'We provide copywriting guidance and structure during the wireframe phase, and many clients find our content brief makes writing much easier. Full copywriting is available as an add-on — ask us during the discovery call.' },
  { q: 'What if I already have a website and just want improvements?', a: 'We handle redesigns and targeted improvements too. We\'ll audit your current site first, identify what\'s holding it back, and recommend the most impactful changes — whether that\'s a full rebuild or targeted optimization.' },
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

/* Interactive version of the printed "YES / NO" checklist. Answering is the
   point: the verdict below reacts live, which is what turns a static list into
   a reason to book the consultation. */
function WebsiteCheck() {
  const [answers, setAnswers] = useState({});

  const answered = Object.keys(answers).length;
  const yesCount = Object.values(answers).filter(Boolean).length;

  const verdict = useMemo(() => {
    if (answered < CHECKS.length) return null;
    if (yesCount === 6) {
      return {
        tone: 'good',
        title: 'Your website is doing its job.',
        desc: 'The fundamentals are in place. The next gain usually comes from traffic and search visibility rather than another rebuild.',
        cta: { label: 'Explore SEO Services', to: '/services/search-engine-optimization' },
      };
    }
    if (yesCount >= 4) {
      return {
        tone: 'warn',
        title: 'A few gaps are costing you enquiries.',
        desc: 'Most of the structure is working. Targeted fixes to messaging, mobile or the next step are usually enough — a full rebuild is probably not necessary.',
        cta: { label: 'Get a Free Website Audit', to: '/free-seo-audit' },
      };
    }
    return {
      tone: 'bad',
      title: 'The website may need to be rethought.',
      desc: 'With this many gaps, changing the logo or adding another page will not move the numbers. The structure and message need to be rebuilt around the customer journey.',
      cta: { label: 'Book a Free Consultation', book: true },
    };
  }, [answered, yesCount]);

  const toneStyles = {
    good: { border: 'rgba(34,197,94,0.35)', bg: 'rgba(34,197,94,0.08)', color: '#15803d' },
    warn: { border: 'rgba(249,115,22,0.35)', bg: 'rgba(249,115,22,0.08)', color: '#c2410c' },
    bad: { border: 'rgba(244,63,94,0.35)', bg: 'rgba(244,63,94,0.08)', color: '#be123c' },
  };

  return (
    <div>
      <div className="grid md:grid-cols-2 gap-4">
        {CHECKS.map((q, i) => {
          const value = answers[i];
          return (
            <motion.div
              key={i}
              {...fadeUp(i * 0.06)}
              className="glass-card gradient-border rounded-2xl p-5 flex items-center justify-between gap-4"
            >
              <span className="text-[#1B3172] text-[15px] font-medium leading-snug">{q}</span>
              <div className="flex gap-2 flex-shrink-0" role="group" aria-label={q}>
                <button
                  type="button"
                  aria-pressed={value === true}
                  onClick={() => setAnswers((a) => ({ ...a, [i]: true }))}
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200"
                  style={value === true
                    ? { background: 'linear-gradient(135deg,#22C55E,#15803d)', color: '#fff', boxShadow: '0 4px 16px rgba(34,197,94,0.35)' }
                    : { background: 'rgba(27,49,114,0.05)', color: '#64748b', border: '1px solid rgba(27,49,114,0.12)' }}
                >
                  <Check className="w-5 h-5" />
                  <span className="sr-only">Yes</span>
                </button>
                <button
                  type="button"
                  aria-pressed={value === false}
                  onClick={() => setAnswers((a) => ({ ...a, [i]: false }))}
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200"
                  style={value === false
                    ? { background: 'linear-gradient(135deg,#f43f5e,#be123c)', color: '#fff', boxShadow: '0 4px 16px rgba(244,63,94,0.35)' }
                    : { background: 'rgba(27,49,114,0.05)', color: '#64748b', border: '1px solid rgba(27,49,114,0.12)' }}
                >
                  <X className="w-5 h-5" />
                  <span className="sr-only">No</span>
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Progress + verdict */}
      <div className="mt-8 max-w-2xl mx-auto">
        <div className="h-1.5 rounded-full bg-[#1B3172]/10 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg,#6B3FA0,#1D4ED8,#0EA5E9)' }}
            animate={{ width: `${(answered / CHECKS.length) * 100}%` }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
        <p className="text-center text-[#64748b] text-sm mt-3">
          {answered} of {CHECKS.length} answered
        </p>

        {verdict && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-6 rounded-2xl p-7 text-center"
            style={{
              background: toneStyles[verdict.tone].bg,
              border: `1px solid ${toneStyles[verdict.tone].border}`,
            }}
          >
            <div
              className="text-4xl font-heading font-800 mb-2"
              style={{ color: toneStyles[verdict.tone].color }}
            >
              {yesCount}/6
            </div>
            <h3 className="text-[#1B3172] font-heading font-700 text-xl mb-2">{verdict.title}</h3>
            <p className="text-[#475569] text-sm leading-relaxed mb-6 max-w-lg mx-auto">{verdict.desc}</p>
            {/* The worst-score verdict books a call; the others route to pages
                that stay inside the app, so this picks the right element. */}
            {verdict.cta.book ? (
              <a {...CALENDLY_LINK} className="btn-primary">
                {verdict.cta.label}
                <ArrowRight className="w-5 h-5" />
              </a>
            ) : (
              <Link to={verdict.cta.to} className="btn-primary">
                {verdict.cta.label}
                <ArrowRight className="w-5 h-5" />
              </Link>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Service',
      name: 'Website Development',
      description: 'Fast, professional, mobile-friendly website development for small businesses — built so visitors understand you, trust you and contact you.',
      provider: {
        '@type': 'LocalBusiness',
        '@id': 'https://www.noveliotech.com/#business',
        name: 'Novelio Technologies LLC',
        url: 'https://www.noveliotech.com',
      },
      areaServed: { '@type': 'Country', name: 'United States' },
      serviceType: 'Website Development',
      url: 'https://www.noveliotech.com/services/website-development',
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Website Development Services',
        itemListElement: OFFERINGS.map((o) => ({
          '@type': 'Offer',
          itemOffered: { '@type': 'Service', name: o.title, description: o.desc },
        })),
      },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.noveliotech.com' },
        { '@type': 'ListItem', position: 2, name: 'Services', item: 'https://www.noveliotech.com/services' },
        { '@type': 'ListItem', position: 3, name: 'Website Development', item: 'https://www.noveliotech.com/services/website-development' },
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

export default function WebsiteDevelopmentPage() {
  return (
    <main className="pt-20">
      <SEO
        title="Website Development Services for Small Businesses"
        description="Professional website development services for small businesses. Get a fast, mobile-friendly, conversion-focused website designed to build trust and generate enquiries."
        canonical="/services/website-development"
        schema={schema}
      />

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="section-pad relative overflow-hidden bg-dark">
        <div className="orb orb-purple w-[500px] h-[500px] -top-48 -left-48 opacity-15" />
        <div className="orb orb-blue w-[400px] h-[400px] top-0 -right-32 opacity-10" />
        <div className="dot-grid absolute inset-0 opacity-40" />

        <div className="container-xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
              <div className="flex items-center gap-2 text-sm text-[#64748b] mb-6">
                <Link to="/" className="hover:text-[#1B3172] transition-colors">Home</Link>
                <span>/</span>
                <Link to="/services" className="hover:text-[#1B3172] transition-colors">Services</Link>
                <span>/</span>
                <span className="text-[#1B3172]">Website Development</span>
              </div>

              <div className="section-label mb-4">Website Development Services</div>

              <h1 className="text-4xl lg:text-6xl font-heading font-800 text-[#1B3172] mb-6 leading-tight">
                Your Website Should Help You{' '}
                <span className="gradient-text">Win Business.</span>
              </h1>

              <p className="text-[#475569] text-xl leading-relaxed mb-8">
                Novelio Technologies builds fast, professional, mobile-friendly websites designed to
                help small businesses get understood, trusted and contacted.
              </p>

              <div className="grid grid-cols-2 gap-3 mb-8">
                {['Mobile-First Build', 'Clear Messaging', 'Conversion-Focused', 'Search-Friendly'].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-[#475569] text-sm">
                    <Check className="w-4 h-4 bg-gradient-to-br from-violet-600 to-purple-600 text-white rounded-full p-0.5 flex-shrink-0" />
                    {f}
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <a {...CALENDLY_LINK} className="btn-primary">
                  Get a Free Website Consultation
                  <ArrowRight className="w-5 h-5" />
                </a>
                <a href="#website-check" className="btn-ghost">Check My Website</a>
              </div>
            </motion.div>

            {/* Browser mockup */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="w-full aspect-square rounded-3xl bg-gradient-to-br from-violet-600 to-blue-600 opacity-10 absolute inset-0 blur-3xl" />

              <div className="glass-card gradient-border rounded-3xl p-5 relative" aria-hidden="true">
                <div className="rounded-2xl overflow-hidden bg-white shadow-card">
                  {/* Browser chrome */}
                  <div className="flex items-center gap-2 px-4 py-3 bg-[#EEF2FF] border-b border-slate-200">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <div className="ml-3 flex-1 h-5 rounded-full bg-white border border-slate-200" />
                  </div>

                  {/* Skeleton page */}
                  <div className="p-7">
                    <motion.div
                      className="h-2.5 rounded-full w-3/5 mb-3 origin-left"
                      style={{ background: 'linear-gradient(90deg,#6B3FA0,#1D4ED8)' }}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.7, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    />
                    <div className="h-2 rounded-full bg-slate-200 w-11/12 mb-2.5" />
                    <div className="h-2 rounded-full bg-slate-200 w-4/5 mb-6" />

                    <div className="grid grid-cols-3 gap-3 mb-6">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="h-20 rounded-xl bg-[#F5F7FF] border border-slate-200"
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 3.5, repeat: Infinity, delay: i * 0.4, ease: 'easeInOut' }}
                        />
                      ))}
                    </div>

                    <div className="h-9 w-40 rounded-full flex items-center justify-center text-white text-xs font-heading font-600"
                      style={{ background: 'linear-gradient(135deg,#6B3FA0,#1D4ED8)' }}>
                      Get a Quote
                    </div>
                  </div>
                </div>
              </div>

              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -bottom-6 -left-6 glass-card gradient-border rounded-2xl px-5 py-3"
              >
                <div className="flex items-center gap-2">
                  <Gauge className="w-5 h-5 text-brand-purple" />
                  <div>
                    <div className="text-xl font-heading font-800 gradient-text leading-none">&lt;2s</div>
                    <div className="text-[11px] text-[#475569] mt-0.5">Target Load Time</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4.5, repeat: Infinity }}
                className="absolute -top-6 -right-6 glass-card gradient-border rounded-2xl px-5 py-3"
              >
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-brand-blue" />
                  <div>
                    <div className="text-xl font-heading font-800 gradient-text leading-none">100%</div>
                    <div className="text-[11px] text-[#475569] mt-0.5">Mobile-First</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── The real problem ────────────────────────────────────────────── */}
      <section className="section-pad bg-[#EEF2FF] relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-0.5"
          style={{ background: 'linear-gradient(to right, transparent, #F97316, #FACC15, #EC4899, transparent)' }} />

        <div className="container-xl relative z-10">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-14 items-start">
            <motion.div {...fadeUp()} className="lg:sticky lg:top-28">
              <div className="section-label mb-4"
                style={{ background: 'rgba(249,115,22,0.12)', borderColor: 'rgba(249,115,22,0.28)', color: '#F97316' }}>
                The Real Problem
              </div>
              <h2 className="text-4xl lg:text-5xl font-heading font-700 text-[#1B3172] mb-5 leading-tight">
                A Website Can Look Fine And Still{' '}
                <span className="gradient-text-pink">Lose Business.</span>
              </h2>
              <p className="text-[#475569] text-lg leading-relaxed">
                Most business owners do not know why visitors leave. They only see fewer calls,
                fewer enquiries and too much dependence on referrals.
              </p>
            </motion.div>

            <div className="grid gap-4">
              {PAIN_POINTS.map((p, i) => (
                <motion.div
                  key={i}
                  {...fadeUp(i * 0.08)}
                  className="glass-card gradient-border rounded-2xl p-6 flex gap-5 items-start group hover:-translate-y-1 hover:shadow-glow transition-all duration-300"
                >
                  <div className="service-icon-box w-12 h-12 rounded-xl group-hover:scale-110">
                    <p.icon className="w-6 h-6 text-brand-purple" />
                  </div>
                  <div>
                    <h3 className="text-[#1B3172] font-heading font-600 text-lg mb-1.5">{p.title}</h3>
                    <p className="text-[#475569] text-sm leading-relaxed">{p.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── The hidden cost ─────────────────────────────────────────────── */}
      <section
        className="section-pad relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0E1E38 0%, #1a1050 55%, #0E1E38 100%)' }}
      >
        <div className="absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(244,63,94,0.28), transparent 65%)' }} />
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg, white 0px, white 1px, transparent 1px, transparent 60px)' }} />

        <div className="container-xl relative z-10">
          <motion.div {...fadeUp()} className="max-w-3xl mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-5"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)' }}>
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
              The Hidden Cost
            </div>
            <h2 className="text-4xl lg:text-5xl font-heading font-800 text-white mb-5 leading-tight">
              A Weak Website Costs More Than Its Development Price.
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-5">
            {HIDDEN_COSTS.map((c, i) => (
              <motion.div
                key={i}
                {...fadeUp(i * 0.08)}
                className="rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.28)' }}>
                    <c.icon className="w-5 h-5 text-rose-300" />
                  </div>
                  <span className="font-heading font-800 text-3xl text-rose-300/50 leading-none">{c.num}</span>
                </div>
                <h3 className="text-white font-heading font-700 text-xl mb-2">{c.title}</h3>
                <p className="text-white/65 text-sm leading-relaxed">{c.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.blockquote {...fadeUp(0.25)}
            className="mt-14 text-2xl lg:text-4xl font-heading font-800 text-white leading-tight max-w-4xl">
            <span className="gradient-text-rainbow">&ldquo;</span>
            The customer you lose rarely tells you why. They simply call someone else.
            <span className="gradient-text-rainbow">&rdquo;</span>
          </motion.blockquote>
        </div>
      </section>

      {/* ── Customer journey ────────────────────────────────────────────── */}
      <section className="section-pad bg-dark relative overflow-hidden">
        <div className="orb orb-cyan w-[400px] h-[400px] -top-32 -right-32 opacity-10" />

        <div className="container-xl relative z-10">
          <motion.div {...fadeUp()} className="text-center mb-14">
            <div className="section-label mx-auto mb-4">What A Good Website Should Do</div>
            <h2 className="text-4xl lg:text-5xl font-heading font-700 text-[#1B3172] mb-4">
              Make The Customer Journey <span className="gradient-text">Easier.</span>
            </h2>
            <p className="text-[#475569] text-lg max-w-2xl mx-auto">
              A business website should guide a visitor from first impression to enquiry without confusion.
            </p>
          </motion.div>

          <div className="relative">
            {/* Connecting line, desktop only */}
            <div className="hidden lg:block absolute top-[38px] left-[10%] right-[10%] h-px"
              style={{ background: 'linear-gradient(90deg, rgba(107,63,160,0.35), rgba(29,78,216,0.35), rgba(14,165,233,0.35))' }} />

            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5 relative">
              {JOURNEY.map((s, i) => (
                <motion.div
                  key={i}
                  {...fadeUp(i * 0.1)}
                  className="glass-card gradient-border rounded-2xl p-6 text-center group hover:-translate-y-1 hover:shadow-glow transition-all duration-300"
                >
                  <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-4 shadow-glow group-hover:scale-110 transition-transform"
                    style={{ background: 'linear-gradient(135deg,#6B3FA0,#1D4ED8)' }}>
                    <span className="text-white font-heading font-800">{s.n}</span>
                  </div>
                  <h3 className="text-[#1B3172] font-heading font-700 text-lg mb-2">{s.title}</h3>
                  <p className="text-[#475569] text-sm leading-relaxed">{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Services ────────────────────────────────────────────────────── */}
      <section className="section-pad bg-[#EEF2FF] relative overflow-hidden">
        <div className="container-xl">
          <motion.div {...fadeUp()} className="text-center mb-14">
            <div className="section-label mx-auto mb-4">Website Development Services</div>
            <h2 className="text-4xl lg:text-5xl font-heading font-700 text-[#1B3172] mb-4">
              Built Around What Your Business <span className="gradient-text">Actually Needs.</span>
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {OFFERINGS.map((o, i) => (
              <motion.div
                key={i}
                {...fadeUp(i * 0.06)}
                className="glass-card gradient-border rounded-2xl p-7 group hover:-translate-y-1 hover:shadow-glow transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${o.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <o.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-[11px] font-heading font-700 uppercase tracking-[0.08em] text-brand-purple mb-2">
                  {o.tag}
                </div>
                <h3 className="text-[#1B3172] font-heading font-600 text-lg mb-3">{o.title}</h3>
                <p className="text-[#475569] text-sm leading-relaxed">{o.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Our approach ────────────────────────────────────────────────── */}
      <section className="section-pad bg-dark relative overflow-hidden">
        <div className="orb orb-purple w-[450px] h-[450px] -bottom-40 -left-40 opacity-10" />

        <div className="container-xl relative z-10">
          <div className="grid lg:grid-cols-[0.92fr_1.08fr] gap-14 items-start">
            <motion.div {...fadeUp()} className="lg:sticky lg:top-28">
              <div className="section-label mb-4">Our Approach</div>
              <h2 className="text-4xl font-heading font-700 text-[#1B3172] mb-5 leading-tight">
                We Don&rsquo;t Start With Colors.{' '}
                <span className="gradient-text">We Start With Your Customer.</span>
              </h2>
              <p className="text-[#475569] text-lg leading-relaxed mb-8">
                Before design starts, we understand the business, customer, services, objections
                and desired action.
              </p>
              <a {...CALENDLY_LINK} className="btn-primary">
                Start With a Free Consultation
                <ArrowRight className="w-5 h-5" />
              </a>
            </motion.div>

            <div className="grid gap-4">
              {APPROACH.map((s, i) => (
                <motion.div
                  key={i}
                  {...fadeUp(i * 0.09)}
                  className="glass-card gradient-border rounded-2xl p-6 flex gap-5 items-start group hover:shadow-glow transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-glow group-hover:scale-110 transition-transform"
                    style={{ background: 'linear-gradient(135deg,#6B3FA0,#1D4ED8)' }}>
                    <s.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1.5">
                      <h3 className="text-[#1B3172] font-heading font-700 text-lg">{s.title}</h3>
                      <span className="text-[11px] text-brand-purple bg-[#6B3FA0]/10 border border-[#6B3FA0]/20 rounded-full px-2.5 py-0.5 font-medium">
                        Step {s.n}
                      </span>
                    </div>
                    <p className="text-[#475569] text-sm leading-relaxed">{s.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 30-second website check ─────────────────────────────────────── */}
      <section id="website-check" className="section-pad bg-[#EEF2FF] relative overflow-hidden scroll-mt-24">
        <div className="container-lg relative z-10">
          <motion.div {...fadeUp()} className="text-center mb-12">
            <div className="section-label mx-auto mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              30-Second Website Check
            </div>
            <h2 className="text-4xl lg:text-5xl font-heading font-700 text-[#1B3172] mb-4 leading-tight">
              Would You Confidently Send A New Prospect To{' '}
              <span className="gradient-text">Your Website?</span>
            </h2>
            <p className="text-[#475569] text-lg max-w-2xl mx-auto">
              Answer these six honestly. Your score tells you whether you need a tune-up or a rethink.
            </p>
          </motion.div>

          <WebsiteCheck />
        </div>
      </section>

      {/* ── Why Novelio ─────────────────────────────────────────────────── */}
      <section className="section-pad bg-dark relative overflow-hidden">
        <div className="orb orb-blue w-[400px] h-[400px] top-0 -right-32 opacity-10" />

        <div className="container-xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <motion.div {...fadeUp()}>
              <div className="section-label mb-4">Why Novelio Technologies</div>
              <h2 className="text-4xl lg:text-5xl font-heading font-700 text-[#1B3172] mb-5 leading-tight">
                Business First. <span className="gradient-text">Technology Second.</span>
              </h2>
              <p className="text-[#475569] text-lg leading-relaxed mb-6">
                There are thousands of companies that can build websites. The harder part is
                building one that fits the business and supports the customer journey.
              </p>
              <p className="text-[#1B3172] font-heading font-600 mb-4">
                Novelio approaches website development in this order:
              </p>

              <div className="flex flex-wrap items-center gap-2">
                {['Business', 'Customer', 'Journey', 'Technology'].map((step, i) => (
                  <div key={step} className="flex items-center gap-2">
                    {i > 0 && <ArrowRight className="w-4 h-4 text-brand-purple/50" />}
                    <span className="glass-card gradient-border rounded-full px-4 py-2 text-sm font-heading font-600 text-[#1B3172]">
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            <div className="grid sm:grid-cols-2 gap-5">
              {PRINCIPLES.map((p, i) => (
                <motion.div
                  key={i}
                  {...fadeUp(i * 0.08)}
                  className="glass-card gradient-border rounded-2xl p-6 group hover:-translate-y-1 hover:shadow-glow transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                    style={{ background: 'linear-gradient(135deg,#6B3FA0,#1D4ED8)' }}>
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-[#1B3172] font-heading font-600 text-base mb-1.5">{p.title}</h3>
                  <p className="text-[#475569] text-sm leading-relaxed">{p.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────── */}
      <section className="section-pad bg-[#EEF2FF] relative overflow-hidden">
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

      {/* ── Other services ──────────────────────────────────────────────── */}
      <section className="section-pad-sm bg-dark">
        <div className="container-xl">
          <motion.div {...fadeUp()} className="text-center mb-8">
            <h3 className="text-2xl font-heading font-700 text-[#1B3172]">Explore Our Other Services</h3>
          </motion.div>
          <div className="flex flex-wrap gap-3 justify-center">
            {SERVICES.filter((s) => s.id !== 'website-development').map((s) => (
              <Link key={s.id} to={s.slug}
                className="glass-card gradient-border rounded-full px-5 py-2.5 text-sm font-medium text-[#475569] hover:text-[#1B3172] hover:shadow-glow transition-all">
                {s.short}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <TestimonialsSection />
      <CTABanner />
    </main>
  );
}
