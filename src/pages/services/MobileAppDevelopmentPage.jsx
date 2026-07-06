import SEO from '../../components/SEO';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Check, Smartphone, Apple, Bell, Zap,
  ShieldCheck, Layers, RefreshCw, Cloud,
  BarChart3, CreditCard, ChevronDown, ChevronUp,
  Clock, Wifi, Headphones, Users,
} from 'lucide-react';
import CTABanner from '../../components/home/CTABanner';
import TestimonialsSection from '../../components/home/TestimonialsSection';
import { useState } from 'react';
import { SERVICES } from '../../data/siteData';

const ACCENT = 'from-fuchsia-600 to-indigo-600';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay },
  viewport: { once: true },
});

const PAIN_POINTS = [
  {
    icon: Clock,
    title: 'Endless, Over-Budget Builds',
    desc: 'Vague scope and no milestones turn a 3-month app into a 9-month money pit. Without a fixed roadmap, "almost done" becomes a permanent state.',
  },
  {
    icon: Smartphone,
    title: 'Clunky, Slow Experience',
    desc: 'Janky scrolling, slow load times, and confusing navigation get an app deleted within the first week. Users judge quality in the first 30 seconds.',
  },
  {
    icon: Apple,
    title: 'App Store Rejections',
    desc: 'Apple and Google reject apps for privacy, performance, and guideline issues. Without an experienced team, you burn weeks resubmitting instead of launching.',
  },
  {
    icon: Layers,
    title: 'Two Codebases, Double the Cost',
    desc: 'Building separate native iOS and Android apps from scratch doubles your budget and timeline — when a shared codebase would have shipped both at once.',
  },
  {
    icon: ShieldCheck,
    title: 'Weak Security & Data Handling',
    desc: 'Insecure APIs, unencrypted storage, and sloppy auth expose user data — and one breach or privacy violation can end an app before it grows.',
  },
  {
    icon: RefreshCw,
    title: 'No Post-Launch Plan',
    desc: 'OS updates break apps every year. Without ongoing maintenance, your app slowly stops working on the newest phones and drops out of the stores.',
  },
  {
    icon: BarChart3,
    title: 'No Analytics or Feedback Loop',
    desc: 'Shipping blind means you never learn what users tap, where they drop off, or which features matter. You can\'t improve what you don\'t measure.',
  },
  {
    icon: Cloud,
    title: 'Backend That Can\'t Scale',
    desc: 'An app that works for 100 users falls over at 10,000. A poorly architected backend turns growth into downtime instead of revenue.',
  },
  {
    icon: Users,
    title: 'Poor Onboarding & Retention',
    desc: 'If new users don\'t reach the "aha" moment fast, they leave and never return. Most apps lose the majority of users within the first three days.',
  },
];

const GROWTH_BENEFITS = [
  {
    icon: Layers,
    title: 'Reach Every Device at Once',
    desc: 'Cross-platform development with React Native ships iOS and Android from a single codebase — one build, two stores, half the maintenance cost.',
    color: 'from-fuchsia-600 to-indigo-600',
  },
  {
    icon: Zap,
    title: 'Native-Level Performance',
    desc: '60fps animations, instant load times, and buttery navigation. We build apps that feel native because performance is engineered in, not bolted on.',
    color: 'from-violet-600 to-purple-600',
  },
  {
    icon: Bell,
    title: 'Re-Engage With Push Notifications',
    desc: 'Bring users back with targeted, well-timed push notifications and in-app messaging — the highest-ROI retention channel a business can own.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: CreditCard,
    title: 'Monetize From Day One',
    desc: 'In-app purchases, subscriptions, and secure payment gateways built in — so your app can generate revenue the moment it hits the store.',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    icon: Wifi,
    title: 'Work Online or Offline',
    desc: 'Offline-first architecture and smart syncing keep your app usable without a signal — essential for field teams, travel, and real-world conditions.',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: BarChart3,
    title: 'Decisions Backed by Data',
    desc: 'Built-in analytics and crash reporting show exactly how people use your app, so every update is driven by real behavior — not guesswork.',
    color: 'from-pink-500 to-rose-500',
  },
  {
    icon: ShieldCheck,
    title: 'Secure & Compliant by Design',
    desc: 'Encrypted storage, secure authentication, and privacy-first data handling that meets App Store, Google Play, and GDPR requirements from the start.',
    color: 'from-indigo-500 to-blue-600',
  },
];

const INCLUDED = [
  {
    title: 'iOS & Android Coverage',
    desc: 'One project delivers both platforms — iPhone, iPad, and the full range of Android devices, tested on real hardware.',
  },
  {
    title: 'UI/UX App Design',
    desc: 'Intuitive, platform-native interfaces designed around your users — following Apple Human Interface and Material Design guidelines.',
  },
  {
    title: 'API & Backend Integration',
    desc: 'Secure connections to your CRM, payment providers, databases, and third-party services — or a full custom backend built to scale.',
  },
  {
    title: 'Push Notifications',
    desc: 'Firebase and APNs push messaging wired in, so you can re-engage users with updates, offers, and reminders.',
  },
  {
    title: 'Secure Authentication',
    desc: 'Email, social, biometric (Face ID / fingerprint), and OTP login options with encrypted token handling.',
  },
  {
    title: 'Analytics & Crash Reporting',
    desc: 'Firebase Analytics and Crashlytics set up from day one so you see usage, retention, and stability in real time.',
  },
  {
    title: 'App Store Deployment',
    desc: 'We handle the full submission to the Apple App Store and Google Play — listings, screenshots, review, and approval.',
  },
  {
    title: 'Post-Launch Support',
    desc: 'Bug fixes, OS-update compatibility, and guidance after launch — so your app keeps working as phones and stores evolve.',
  },
];

const PROCESS = [
  {
    step: '01',
    title: 'Discovery & Strategy',
    time: 'Week 1',
    desc: 'We define who the app is for, the core problem it solves, and the must-have features for version one. We scope an MVP that ships fast and proves value — nothing gets built until the plan is clear.',
  },
  {
    step: '02',
    title: 'UX Wireframes & Prototype',
    time: 'Week 1–2',
    desc: 'We map every screen and user flow, then build an interactive prototype you can tap through on your own phone — so you experience the app before a line of code is written.',
  },
  {
    step: '03',
    title: 'UI Design',
    time: 'Week 2–3',
    desc: 'Pixel-perfect, platform-native visual design in your brand style — screens, states, icons, and animations. You review and we refine until it feels exactly right.',
  },
  {
    step: '04',
    title: 'Development & Integration',
    time: 'Week 3–8',
    desc: 'Clean, tested code with your backend, APIs, payments, and notifications wired in. You get regular builds to install and try throughout — never just a big reveal at the end.',
  },
  {
    step: '05',
    title: 'QA & Device Testing',
    time: 'Week 7–9',
    desc: 'We test across real iPhones and Android devices, screen sizes, and OS versions — checking performance, edge cases, offline behavior, and security before anything ships.',
  },
  {
    step: '06',
    title: 'Launch & Store Submission',
    time: 'Week 9+',
    desc: 'We prepare store listings, submit to the App Store and Google Play, handle the review process, and go live — then monitor the launch and stand by for support.',
  },
];

const TECH = [
  { name: 'React Native', desc: 'One codebase, iOS + Android' },
  { name: 'Swift (iOS)', desc: 'For native iOS builds' },
  { name: 'Kotlin (Android)', desc: 'For native Android builds' },
  { name: 'Firebase', desc: 'Auth, push, analytics & data' },
  { name: 'Node.js & APIs', desc: 'For scalable custom backends' },
  { name: 'Stripe & In-App Purchase', desc: 'For payments & subscriptions' },
];

const STATS = [
  { number: '2', label: 'Platforms, One Build' },
  { number: '60fps', label: 'Smooth Native Feel' },
  { number: '100%', label: 'App Store Ready' },
  { number: 'MVP', label: 'Launch-First Approach' },
];

const FAQS = [
  { q: 'How much does it cost to build a mobile app?', a: 'It depends on scope. A focused MVP with core features typically starts lower and ships in 6–10 weeks, while a feature-rich app with a custom backend costs more and takes longer. We scope and price your project after a free discovery call, and we recommend starting with an MVP to validate demand before investing in every feature.' },
  { q: 'Should I build native or cross-platform?', a: 'For most businesses, cross-platform (React Native) is the smart choice — you get both iOS and Android from a single codebase at lower cost and with faster updates. We recommend fully native (Swift/Kotlin) only when an app needs deep hardware access or maximum performance, like heavy graphics or AR. We advise based on your goals, not our convenience.' },
  { q: 'Do you publish the app to the App Store and Google Play?', a: 'Yes — full store deployment is included. We prepare your listings, screenshots, and metadata, handle the Apple and Google submission process, and manage the review until your app is approved and live. We also guide you on the developer accounts you\'ll need to own.' },
  { q: 'How long does it take to build an app?', a: 'A well-scoped MVP usually takes 6–10 weeks from kickoff to store submission. Larger apps with custom backends, complex integrations, or multiple user roles take 3–5 months. We work in milestones and give you installable builds throughout, so you\'re never waiting in the dark.' },
  { q: 'Will I own the app and its source code?', a: 'Absolutely. You own 100% of the source code, design files, and app store listings. There\'s no platform lock-in and no hostage code — everything transfers to you, and you\'re free to take it anywhere.' },
  { q: 'Do you maintain the app after launch?', a: 'Yes — we offer maintenance plans covering bug fixes, OS-update compatibility (iOS and Android release major updates every year), security patches, and new features. Mobile apps aren\'t "launch and forget" — ongoing maintenance keeps yours working and in the stores as devices evolve.' },
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
      name: 'Mobile App Development',
      description: 'iOS, Android, and cross-platform mobile apps built around your business goals — fast, secure, and designed for real users, from MVP to App Store launch.',
      provider: {
        '@type': 'LocalBusiness',
        '@id': 'https://www.noveliotech.com/#business',
        name: 'Novelio Technologies LLC',
        url: 'https://www.noveliotech.com',
      },
      areaServed: { '@type': 'Country', name: 'United States' },
      serviceType: 'Mobile App Development',
      url: 'https://www.noveliotech.com/services/mobile-app-development',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.noveliotech.com' },
        { '@type': 'ListItem', position: 2, name: 'Services', item: 'https://www.noveliotech.com/services' },
        { '@type': 'ListItem', position: 3, name: 'Mobile App Development', item: 'https://www.noveliotech.com/services/mobile-app-development' },
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

export default function MobileAppDevelopmentPage() {
  return (
    <main className="pt-20">
      <SEO
        title="Mobile App Development — Native-Quality Apps, Built to Scale"
        description="iOS, Android, and cross-platform mobile app development for small and medium businesses. From MVP to App Store launch — fast, secure, and built to convert. Free consultation."
        canonical="/services/mobile-app-development"
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
                <span className="text-[#1B3172]">Mobile App Development</span>
              </div>
              <div className="section-label mb-4">iOS, Android & Cross-Platform</div>
              <h1 className="text-4xl lg:text-6xl font-heading font-800 text-[#1B3172] mb-6 leading-tight">
                Mobile Apps Built to{' '}
                <span className="gradient-text">Grow Your Business</span>{' '}
                — Not Just Launch
              </h1>
              <p className="text-[#475569] text-xl leading-relaxed mb-4">
                We design and build fast, secure, native-quality mobile apps that customers actually
                use — engineered around your business goals, your users, and real-world growth.
              </p>
              <p className="text-[#475569] text-base leading-relaxed mb-8">
                From a lean MVP to a full-featured product, we take you from idea to a live app on the
                App Store and Google Play — with a clear roadmap at every step.
              </p>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {['iOS & Android', 'Cross-Platform Builds', 'UI/UX App Design', 'API & Backend', 'App Store Launch', 'Ongoing Support'].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-[#475569] text-sm">
                    <Check className={`w-4 h-4 bg-gradient-to-br ${ACCENT} text-white rounded-full p-0.5 flex-shrink-0`} />
                    {f}
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/contact" className="btn-primary">
                  Get a Free App Consultation
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/contact" className="btn-ghost">Talk to Our Team</Link>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="relative hidden lg:block">
              <div className={`w-full aspect-square rounded-3xl bg-gradient-to-br ${ACCENT} opacity-10 absolute inset-0 blur-3xl`} />
              <div className="glass-card gradient-border rounded-3xl p-10 relative flex items-center justify-center">
                <div className={`w-32 h-32 rounded-3xl bg-gradient-to-br ${ACCENT} flex items-center justify-center shadow-glow`}>
                  <Smartphone className="w-16 h-16 text-white" />
                </div>
              </div>
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity }}
                className="absolute -bottom-6 -left-6 glass-card gradient-border rounded-2xl px-5 py-3">
                <div className="text-2xl font-heading font-800 gradient-text">iOS + Android</div>
                <div className="text-xs text-[#475569]">One Codebase</div>
              </motion.div>
              <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 4.5, repeat: Infinity }}
                className="absolute -top-6 -right-6 glass-card gradient-border rounded-2xl px-5 py-3">
                <div className="text-2xl font-heading font-800 gradient-text">60fps</div>
                <div className="text-xs text-[#475569]">Native Feel</div>
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
              Why So Many Apps{' '}
              <span className="gradient-text">Never Get Traction</span>
            </h2>
            <p className="text-[#475569] text-lg max-w-2xl mx-auto">
              Most apps fail before they ever grow — not because of a bad idea, but because of how
              they were scoped, built, and shipped. The usual culprits:
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PAIN_POINTS.map((p, i) => (
              <motion.div key={i} {...fadeUp(i * 0.08)}
                className="glass-card gradient-border rounded-2xl p-6 group hover:-translate-y-1 hover:shadow-glow transition-all duration-300">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${ACCENT} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <p.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-[#1B3172] font-heading font-600 text-lg mb-2">{p.title}</h3>
                <p className="text-[#475569] text-sm leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
          <motion.div {...fadeUp(0.3)} className="text-center mt-12">
            <p className="text-[#475569] text-lg font-medium max-w-2xl mx-auto">
              We build around every one of these — so your app launches, performs, and keeps growing.
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
              Built for <span className="gradient-text">Users & Revenue</span> — Not Just the Store
            </h2>
            <p className="text-[#475569] text-lg max-w-2xl mx-auto">
              A great app should do more than exist. It should:
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
              That's why we build complete, business-ready mobile products —{' '}
              <span className="font-semibold text-[#1B3172]">not just screens on a phone.</span>
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
              Everything Included in <span className="gradient-text">Every App</span>
            </h2>
            <p className="text-[#475569] text-lg max-w-2xl mx-auto">
              No surprise add-ons for the essentials. These come standard in every app we ship.
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {INCLUDED.map((item, i) => (
              <motion.div key={i} {...fadeUp(i * 0.07)}
                className="glass-card gradient-border rounded-2xl p-6 group hover:-translate-y-1 hover:shadow-glow transition-all duration-300">
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${ACCENT} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
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
              Our <span className="gradient-text">App Build Process</span>
            </h2>
            <p className="text-[#475569] text-lg max-w-2xl mx-auto">
              A transparent, milestone-driven process that keeps you in control from the first idea
              to a live app in the stores.
            </p>
          </motion.div>
          <div className="space-y-5">
            {PROCESS.map((step, i) => (
              <motion.div key={i} {...fadeUp(i * 0.1)}
                className="glass-card gradient-border rounded-2xl p-7 flex flex-col sm:flex-row gap-6 items-start group hover:shadow-glow transition-all duration-300">
                <div className="flex-shrink-0">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${ACCENT} flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform`}>
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
                Built with the <span className="gradient-text">Right Stack for Your App</span>
              </h2>
              <p className="text-[#475569] text-base leading-relaxed mb-8">
                We match the technology to your product — cross-platform to move fast and save budget,
                or fully native when performance demands it.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {TECH.map((t, i) => (
                  <motion.div key={i} {...fadeUp(i * 0.07)}
                    className="glass-card gradient-border rounded-xl p-4 flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${ACCENT} mt-2 flex-shrink-0`} />
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
              <div className="section-label mb-4">How We Build</div>
              <h2 className="text-3xl font-heading font-700 text-[#1B3172] mb-4">
                Principles That <span className="gradient-text">Ship Better Apps</span>
              </h2>
              <p className="text-[#475569] text-base leading-relaxed mb-8">
                Every app we build is held to the same standards — performance, quality, and a
                launch-first mindset, regardless of budget.
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
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${ACCENT} flex items-center justify-center flex-shrink-0`}>
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-[#1B3172] font-heading font-600 text-sm mb-1">You Own Your App</p>
                  <p className="text-[#475569] text-xs leading-relaxed">
                    Full source code, design files, and store listings transfer to you — no platform lock-in, no hostage code, no hidden fees.
                  </p>
                </div>
              </motion.div>
              <motion.div {...fadeUp(0.35)} className="mt-3 glass-card gradient-border rounded-2xl p-6 flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${ACCENT} flex items-center justify-center flex-shrink-0`}>
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
            {SERVICES.filter((s) => s.id !== 'mobile-app-development').map((s) => (
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
