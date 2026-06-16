import SEO from '../../components/SEO';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Check, Code2, Monitor, Smartphone, Zap,
  ShoppingCart, Layout, RefreshCw, Globe, Settings,
  BarChart3, Layers, ChevronDown, ChevronUp, Star,
  Clock, Shield, Headphones,
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

const PAIN_POINTS = [
  {
    icon: Smartphone,
    title: 'Slow Mobile Speed',
    desc: 'Most visitors are on mobile. If your site loads slowly, they\'re gone before they read a single word — and Google\'s ranking reflects that.',
  },
  {
    icon: BarChart3,
    title: 'No Clear Conversion Flow',
    desc: 'Without a logical path from landing to enquiry, visitors wander and leave. Every page should guide visitors toward one clear next step.',
  },
  {
    icon: Shield,
    title: 'Weak Trust Signals',
    desc: 'Missing reviews, no team photos, no credentials — visitors can\'t tell if you\'re legitimate. Trust signals are what turn browsers into buyers.',
  },
  {
    icon: Layout,
    title: 'No Lead Capture System',
    desc: 'If your website has no form, no call-to-action, or no follow-up mechanism, you\'re losing warm leads who were ready to enquire.',
  },
  {
    icon: Globe,
    title: 'Poor SEO Setup',
    desc: 'Without meta tags, schema markup, and a proper site structure, you\'re invisible to search engines — even for searches you should be ranking for.',
  },
  {
    icon: Monitor,
    title: 'No Tracking or Analytics',
    desc: 'You can\'t improve what you can\'t measure. Without analytics, you have no idea which pages work, which don\'t, or where visitors are dropping off.',
  },
  {
    icon: Zap,
    title: 'Visitors Leave Without Taking Action',
    desc: 'High bounce rates signal that visitors aren\'t finding what they need — or aren\'t being shown a clear reason to stay and enquire.',
  },
  {
    icon: Clock,
    title: 'No Follow-Up Automation',
    desc: 'Every enquiry that doesn\'t get an immediate response loses trust. Automated follow-up sequences keep leads warm while you\'re busy.',
  },
  {
    icon: Layers,
    title: 'Outdated Website Structure',
    desc: 'An outdated site structure hurts SEO, confuses visitors, and makes it impossible to scale your content or service pages effectively.',
  },
];

const GROWTH_BENEFITS = [
  {
    icon: Globe,
    title: 'Rank Better on Google',
    desc: 'Proper on-page SEO, fast page speeds, clean code, and structured data help your site rank for the searches your customers are actually making.',
    color: 'from-violet-600 to-purple-600',
  },
  {
    icon: Shield,
    title: 'Build Trust Instantly',
    desc: 'Professional design, clear credentials, real testimonials, and trust signals tell visitors you\'re the right choice — before they\'ve even read your services.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: ArrowRight,
    title: 'Convert Visitors into Leads',
    desc: 'Clear calls-to-action, strategic layout, and conversion-focused copy guide visitors to take action — turning traffic into real business enquiries.',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    icon: Layout,
    title: 'Capture Enquiries Automatically',
    desc: 'Smart lead capture forms, automated email sequences, and CRM integration mean no enquiry falls through the cracks — even at 2am.',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: Star,
    title: 'Improve Customer Experience',
    desc: 'Fast load times, intuitive navigation, and mobile-first design make it easy for customers to find what they need and feel confident in your business.',
    color: 'from-pink-500 to-rose-500',
  },
  {
    icon: BarChart3,
    title: 'Support Marketing Campaigns',
    desc: 'Dedicated landing pages, trackable URLs, and conversion tracking make every ad, email, and social campaign measurably more effective.',
    color: 'from-indigo-500 to-blue-600',
  },
  {
    icon: Clock,
    title: 'Reduce Manual Follow-Up Effort',
    desc: 'Automation handles the repetitive work — confirmation emails, appointment reminders, follow-up sequences — so your team can focus on closing deals.',
    color: 'from-violet-600 to-indigo-600',
  },
];

const INCLUDED = [
  {
    title: 'Custom Mobile-First Design',
    desc: 'Every design starts on mobile. We build up to tablet and desktop — not the other way around.',
  },
  {
    title: 'Core Web Vitals Optimization',
    desc: 'We optimize LCP, CLS, and INP so your site passes Google\'s performance thresholds and ranks accordingly.',
  },
  {
    title: 'SEO Foundation Setup',
    desc: 'Meta tags, schema markup, XML sitemaps, robots.txt, and canonical tags — all configured correctly from day one.',
  },
  {
    title: 'Analytics & Conversion Tracking',
    desc: 'Google Analytics 4 setup with goal tracking so you know exactly which pages generate leads and revenue.',
  },
  {
    title: 'Lead Capture & Contact Forms',
    desc: 'Custom forms integrated with your email inbox or CRM, with spam protection and instant notification.',
  },
  {
    title: 'Content Management System',
    desc: 'Update blog posts, service pages, team members, and more — without needing technical knowledge or a developer.',
  },
  {
    title: 'Cross-Browser & Device Testing',
    desc: 'We test on Chrome, Safari, Firefox, Edge, iOS, and Android before we hand anything over.',
  },
  {
    title: '30-Day Post-Launch Support',
    desc: 'Fixes, tweaks, and guidance for 30 days after launch — so you\'re never left to figure things out alone.',
  },
];

const PROCESS = [
  {
    step: '01',
    title: 'Discovery Call',
    time: 'Day 1–3',
    desc: 'We learn your business, target customers, competitors, and goals. This call shapes every decision that follows — nothing gets designed until we understand what you need to achieve.',
  },
  {
    step: '02',
    title: 'Sitemap & Wireframes',
    time: 'Week 1',
    desc: 'We map out the complete page structure and user flow before a single pixel gets designed. You approve the blueprint before we build on it.',
  },
  {
    step: '03',
    title: 'Design Mockups',
    time: 'Week 1–2',
    desc: 'Full visual design in your brand\'s style — colors, fonts, imagery, and layout. You review and give feedback. We revise until it\'s exactly right.',
  },
  {
    step: '04',
    title: 'Development',
    time: 'Week 2–4',
    desc: 'Clean, semantic code built for speed, security, and scalability. Tested across devices and browsers throughout development — not just at the end.',
  },
  {
    step: '05',
    title: 'Your Review & Revisions',
    time: 'Week 3–4',
    desc: 'You get a staging site to click through and test. We take your feedback and refine until you\'re completely satisfied with every detail.',
  },
  {
    step: '06',
    title: 'Launch & Handover',
    time: 'Week 4+',
    desc: 'Go live with a full DNS walkthrough, performance check, and CMS training session. You leave knowing exactly how to manage your site.',
  },
];

const TECH = [
  { name: 'React & Next.js', desc: 'For blazing-fast custom sites' },
  { name: 'WordPress', desc: 'For flexible content management' },
  { name: 'Webflow', desc: 'For design-rich, no-code sites' },
  { name: 'Shopify', desc: 'For e-commerce stores' },
  { name: 'Tailwind CSS', desc: 'For clean, maintainable styling' },
  { name: 'Vercel & AWS', desc: 'For reliable, scalable hosting' },
];

const STATS = [
  { number: '<2s', label: 'Avg Page Load Time' },
  { number: '95+', label: 'Lighthouse Score' },
  { number: '200+', label: 'Sites Launched' },
  { number: '100%', label: 'Mobile-First Builds' },
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

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Service',
      name: 'Website Development',
      description: 'Custom, fast-loading, mobile-first websites built around your buyer journey — designed to turn visitors into leads and customers from day one.',
      provider: {
        '@type': 'LocalBusiness',
        '@id': 'https://www.noveliotech.com/#business',
        name: 'Novelio Technologies LLC',
        url: 'https://www.noveliotech.com',
      },
      areaServed: { '@type': 'Country', name: 'United States' },
      serviceType: 'Website Development',
      url: 'https://www.noveliotech.com/services/website-development',
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
        title="Website Development — Websites Built to Convert. Delivered on Time."
        description="Custom, fast-loading, mobile-first websites built around your buyer journey. Turn visitors into leads and customers from day one. Free audit available."
        canonical="/services/website-development"
        schema={schema}
      />

      {/* ── Hero ── */}
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
              <div className="section-label mb-4">Web Design & Development</div>
              <h1 className="text-4xl lg:text-6xl font-heading font-800 text-[#1B3172] mb-6 leading-tight">
                We Build <span className="gradient-text">Business Growth Systems</span>{' '}
                — Not Just Websites
              </h1>
              <p className="text-[#475569] text-xl leading-relaxed mb-4">
                We help small and medium businesses build high-converting online systems designed
                to generate visibility, trust, leads, and sales — not just an online presence.
              </p>
              <p className="text-[#475569] text-base leading-relaxed mb-8">
                Every website is built with a clear focus on customer experience, lead generation,
                SEO visibility, and business growth.
              </p>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {['Custom Web Design', 'Mobile-First Development', 'Core Web Vitals', 'CMS Integration', 'Landing Page Design', 'E-commerce Development'].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-[#475569] text-sm">
                    <Check className="w-4 h-4 bg-gradient-to-br from-violet-600 to-purple-600 text-white rounded-full p-0.5 flex-shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/contact" className="btn-primary">
                  Get a Free Website Audit
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/contact" className="btn-ghost">Talk to Our Team</Link>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="relative hidden lg:block">
              <div className="w-full aspect-square rounded-3xl bg-gradient-to-br from-violet-600 to-purple-600 opacity-10 absolute inset-0 blur-3xl" />
              <div className="glass-card gradient-border rounded-3xl p-10 relative flex items-center justify-center">
                <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-glow">
                  <Code2 className="w-16 h-16 text-white" />
                </div>
              </div>
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity }}
                className="absolute -bottom-6 -left-6 glass-card gradient-border rounded-2xl px-5 py-3">
                <div className="text-2xl font-heading font-800 gradient-text">95+</div>
                <div className="text-xs text-[#475569]">Lighthouse Score</div>
              </motion.div>
              <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 4.5, repeat: Infinity }}
                className="absolute -top-6 -right-6 glass-card gradient-border rounded-2xl px-5 py-3">
                <div className="text-2xl font-heading font-800 gradient-text">&lt;2s</div>
                <div className="text-xs text-[#475569]">Avg Load Time</div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Pain Points ── */}
      <section className="section-pad bg-[#EEF2FF] relative overflow-hidden">
        <div className="container-xl">
          <motion.div {...fadeUp()} className="text-center mb-16">
            <div className="section-label mx-auto mb-4">Common Problems</div>
            <h2 className="text-4xl font-heading font-700 text-[#1B3172] mb-4">
              Is Your Website <span className="gradient-text">Quietly Losing Customers?</span>
            </h2>
            <p className="text-[#475569] text-lg max-w-2xl mx-auto">
              Most business websites fail because they were built like digital brochures instead of
              growth systems. Common issues we find:
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PAIN_POINTS.map((p, i) => (
              <motion.div key={i} {...fadeUp(i * 0.08)}
                className="glass-card gradient-border rounded-2xl p-6 group hover:-translate-y-1 hover:shadow-glow transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <p.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-[#1B3172] font-heading font-600 text-lg mb-2">{p.title}</h3>
                <p className="text-[#475569] text-sm leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
          <motion.div {...fadeUp(0.3)} className="text-center mt-12">
            <p className="text-[#475569] text-lg font-medium max-w-2xl mx-auto">
              Every one of these issues can reduce enquiries, conversions, and revenue.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── What We Build ── */}
      <section className="section-pad bg-dark relative overflow-hidden">
        <div className="orb orb-purple w-[400px] h-[400px] -top-32 -right-32 opacity-10" />
        <div className="container-xl relative z-10">
          <motion.div {...fadeUp()} className="text-center mb-16">
            <div className="section-label mx-auto mb-4">Business Growth</div>
            <h2 className="text-4xl font-heading font-700 text-[#1B3172] mb-4">
              Built for <span className="gradient-text">Business Growth</span> — Not Just Design
            </h2>
            <p className="text-[#475569] text-lg max-w-2xl mx-auto">
              A modern website should help your business:
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {GROWTH_BENEFITS.map((item, i) => (
              <motion.div key={i} {...fadeUp(i * 0.08)}
                className="glass-card gradient-border rounded-2xl p-7 group hover:-translate-y-1 hover:shadow-glow transition-all duration-300">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-[#1B3172] font-heading font-600 text-lg mb-3">{item.title}</h3>
                <p className="text-[#475569] text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
          <motion.div {...fadeUp(0.4)} className="text-center mt-12">
            <p className="text-[#475569] text-lg max-w-2xl mx-auto">
              That's why we focus on building complete business-ready online systems —{' '}
              <span className="font-semibold text-[#1B3172]">not just webpages.</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Everything Included ── */}
      <section className="section-pad bg-[#EEF2FF] relative overflow-hidden">
        <div className="container-xl">
          <motion.div {...fadeUp()} className="text-center mb-16">
            <div className="section-label mx-auto mb-4">What You Get</div>
            <h2 className="text-4xl font-heading font-700 text-[#1B3172] mb-4">
              Everything Included in <span className="gradient-text">Every Project</span>
            </h2>
            <p className="text-[#475569] text-lg max-w-2xl mx-auto">
              We don't nickel-and-dime you with add-ons. These are standard in every build we deliver.
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {INCLUDED.map((item, i) => (
              <motion.div key={i} {...fadeUp(i * 0.07)}
                className="glass-card gradient-border rounded-2xl p-6 group hover:-translate-y-1 hover:shadow-glow transition-all duration-300">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-[#1B3172] font-heading font-600 text-[15px] mb-2">{item.title}</h4>
                <p className="text-[#475569] text-xs leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Our Process ── */}
      <section className="section-pad bg-dark relative overflow-hidden">
        <div className="orb orb-blue w-[400px] h-[400px] -bottom-32 -left-32 opacity-10" />
        <div className="container-lg relative z-10">
          <motion.div {...fadeUp()} className="text-center mb-16">
            <div className="section-label mx-auto mb-4">How We Work</div>
            <h2 className="text-4xl font-heading font-700 text-[#1B3172] mb-4">
              Our <span className="gradient-text">Build Process</span>
            </h2>
            <p className="text-[#475569] text-lg max-w-2xl mx-auto">
              A transparent, structured process that keeps you informed and in control from
              day one to launch day.
            </p>
          </motion.div>
          <div className="space-y-5">
            {PROCESS.map((step, i) => (
              <motion.div key={i} {...fadeUp(i * 0.1)}
                className="glass-card gradient-border rounded-2xl p-7 flex flex-col sm:flex-row gap-6 items-start group hover:shadow-glow transition-all duration-300">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform">
                    <span className="text-white font-heading font-800 text-sm">{step.step}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h3 className="text-[#1B3172] font-heading font-700 text-lg">{step.title}</h3>
                    <span className="text-xs text-brand-purple bg-[#6B3FA0]/10 border border-[#6B3FA0]/20 rounded-full px-3 py-0.5 font-medium">
                      {step.time}
                    </span>
                  </div>
                  <p className="text-[#475569] text-sm leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tech Stack + Stats ── */}
      <section className="section-pad bg-[#EEF2FF] relative overflow-hidden">
        <div className="container-xl">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Tech Stack */}
            <motion.div {...fadeUp()}>
              <div className="section-label mb-4">Technologies</div>
              <h2 className="text-3xl font-heading font-700 text-[#1B3172] mb-4">
                Built with the <span className="gradient-text">Right Tools for the Job</span>
              </h2>
              <p className="text-[#475569] text-base leading-relaxed mb-8">
                We don't force every project into the same technology. We match the stack to your
                goals, budget, and how you'll manage the site after launch.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {TECH.map((t, i) => (
                  <motion.div key={i} {...fadeUp(i * 0.07)}
                    className="glass-card gradient-border rounded-xl p-4 flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-br from-violet-600 to-purple-600 mt-2 flex-shrink-0" />
                    <div>
                      <p className="text-[#1B3172] font-heading font-600 text-sm">{t.name}</p>
                      <p className="text-[#64748b] text-xs">{t.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div {...fadeUp(0.15)}>
              <div className="section-label mb-4">Results</div>
              <h2 className="text-3xl font-heading font-700 text-[#1B3172] mb-4">
                Numbers That <span className="gradient-text">Speak for Themselves</span>
              </h2>
              <p className="text-[#475569] text-base leading-relaxed mb-8">
                Every site we build is held to the same performance and quality benchmarks —
                regardless of budget.
              </p>
              <div className="grid grid-cols-2 gap-5">
                {STATS.map((s, i) => (
                  <motion.div key={i} {...fadeUp(i * 0.1)}
                    className="glass-card gradient-border rounded-2xl p-6 text-center group hover:-translate-y-1 hover:shadow-glow transition-all duration-300">
                    <div className="text-3xl font-heading font-800 gradient-text mb-1">{s.number}</div>
                    <div className="text-[#475569] text-sm">{s.label}</div>
                  </motion.div>
                ))}
              </div>
              <motion.div {...fadeUp(0.3)} className="mt-6 glass-card gradient-border rounded-2xl p-6 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-[#1B3172] font-heading font-600 text-sm mb-1">You Own Your Website</p>
                  <p className="text-[#475569] text-xs leading-relaxed">
                    Full ownership transfers to you after your plan term — no proprietary platform lock-in, no hostage hosting, no hidden fees.
                  </p>
                </div>
              </motion.div>
              <motion.div {...fadeUp(0.35)} className="mt-3 glass-card gradient-border rounded-2xl p-6 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <Headphones className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-[#1B3172] font-heading font-600 text-sm mb-1">Dedicated Point of Contact</p>
                  <p className="text-[#475569] text-xs leading-relaxed">
                    You work directly with your project lead — not a ticketing system. Real responses, real accountability.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Other Services ── */}
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

      {/* ── FAQ ── */}
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

      <TestimonialsSection />
      <CTABanner />
    </main>
  );
}
