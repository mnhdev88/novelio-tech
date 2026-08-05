import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, ArrowRight, Star, ChevronDown, ChevronUp, CheckCircle, Phone } from 'lucide-react';
import SEO from '../components/SEO';
import CTABanner from '../components/home/CTABanner';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
  viewport: { once: true },
});

const PAIN_POINTS = [
  {
    num: '01',
    title: 'Invisible when Newark residents search for your service',
    desc: "Google's local pack shows only 3 results. Without proper on-page SEO, location signals, and schema markup, your business simply doesn't appear — no matter how good your product or service is.",
    stat: '91% of searchers never click past page one',
  },
  {
    num: '02',
    title: 'Your current website loses visitors before they ever contact you',
    desc: 'Slow load times, broken mobile layouts, and no clear call-to-action send potential customers straight to your competitors. Visitors decide in under 3 seconds — your site needs to win that moment.',
    stat: '53% of users abandon sites that take over 3 seconds to load',
  },
  {
    num: '03',
    title: 'Paying for ads but your website can\'t convert the traffic',
    desc: "Paid traffic without a high-converting landing page is money down the drain. If visitors can't immediately find your prices, trust signals, and a way to contact you, your ad spend is feeding your competitors.",
    stat: 'Optimised sites see 2–5× more leads per visitor',
  },
];

const DEMO_INCLUDES = [
  'Custom homepage with your brand, services & Newark location',
  'Services or products page with clear pricing layout',
  'Contact form, phone click-to-call & Google Maps integration',
  'Google reviews section & social proof display',
  'Local SEO structure targeting Newark NJ searches',
  'Mobile-optimised, sub-2-second load time design',
];

const STATS = [
  { value: '8,000+', label: 'Small businesses competing in Newark NJ' },
  { value: '23%',    label: 'Have a website that ranks on Google page one locally' },
  { value: '76%',    label: 'Of local searches lead to a visit within 24 hours' },
  { value: '$150/mo', label: 'Growth plans — website included, demo always first' },
];

const FAQS = [
  {
    q: 'How much does a website cost for a Newark NJ business?',
    a: "Novelio builds your demo website completely free — you see the finished site before any payment is discussed. Your website, SSL, hosting and lead-capture setup are then included with a growth plan starting at $150/month, so there is no $1,500–$3,000 upfront website cost. No hidden fees.",
  },
  {
    q: 'How long does it take to build a business website in Newark?',
    a: 'Your demo website is ready within 48–72 hours of your initial call. Once you approve it, the full live site goes live within 5–7 business days. Domain setup and hosting guidance are included in the process.',
  },
  {
    q: 'Will my Newark business website actually show up on Google?',
    a: 'Yes. Every Novelio website is built with on-page SEO, local keyword targeting for Newark NJ, Google Business Profile optimisation, and schema markup — all the technical foundations Google needs to rank you for local searches like "best [your service] in Newark NJ."',
  },
  {
    q: 'What makes Novelio the best website developer in Newark NJ?',
    a: "We build your website before you pay a cent. No other Newark web developer does that. Every site is custom-designed, mobile-first, SEO-structured, and built to generate real leads — not just look good. We also offer ongoing support so your site keeps performing long after launch.",
  },
];

function FAQItem({ q, a, index }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div {...fadeUp(index * 0.07)} className="border border-[#E2E8F0] rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-6 text-left bg-white hover:bg-[#F8FAFF] transition-colors"
        aria-expanded={open}
      >
        <span className="font-heading font-600 text-[#1B3172] text-base pr-4">{q}</span>
        {open
          ? <ChevronUp className="w-5 h-5 text-[#6B3FA0] flex-shrink-0" />
          : <ChevronDown className="w-5 h-5 text-[#64748b] flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-6 pb-6 bg-white text-[#475569] text-sm leading-relaxed border-t border-[#F1F5F9]">
          <p className="pt-4">{a}</p>
        </div>
      )}
    </motion.div>
  );
}

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      name: 'Best Website Developer in Newark, NJ',
      url: 'https://www.noveliotech.com/best-website-developer-in-newark',
      description: 'Novelio Technologies builds fast, SEO-ready, lead-generating websites for Newark NJ businesses. Free demo built first — no upfront cost.',
    },
    {
      '@type': 'LocalBusiness',
      name: 'Novelio Technologies LLC',
      url: 'https://www.noveliotech.com',
      telephone: '+18887384655',
      email: 'info@noveliotech.com',
      areaServed: { '@type': 'City', name: 'Newark', containedInPlace: { '@type': 'State', name: 'New Jersey' } },
      serviceType: ['Website Design', 'Web Development', 'Local SEO', 'Lead Generation'],
    },
    {
      '@type': 'FAQPage',
      mainEntity: FAQS.map(f => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ],
};

export default function BestWebDevNewarkPage() {
  return (
    <main className="pt-20">
      <SEO
        title="Best Website Developer in Newark, NJ"
        description="Looking for the best website developer in Newark NJ? Novelio builds fast, SEO-ready, lead-generating websites — free demo first, no upfront cost."
        canonical="/best-website-developer-in-newark"
        keywords={[
          'best website developer in Newark NJ',
          'web developer Newark',
          'website design Newark New Jersey',
          'web design company Newark NJ',
          'affordable website developer Newark',
          'professional web developer Newark',
        ]}
        schema={schema}
      />

      {/* ── Hero ── */}
      <section className="section-pad relative overflow-hidden bg-dark">
        <div className="orb orb-purple w-[600px] h-[600px] -top-64 -left-48 opacity-12" />
        <div className="orb orb-cyan w-[400px] h-[400px] -bottom-48 -right-48 opacity-8" />
        <div className="dot-grid absolute inset-0 opacity-40" />

        <div className="container-xl relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="section-label mx-auto mb-4 flex items-center gap-1.5 justify-center">
              <MapPin className="w-3.5 h-3.5" />
              Serving Newark, NJ
            </div>
          </motion.div>

          <h1 className="text-5xl lg:text-7xl font-heading font-800 text-[#1B3172] mb-6 leading-tight">
            {['The', 'Best', 'Website', 'Developer'].map((w, i) => (
              <motion.span key={w}
                initial={{ opacity: 0, y: 32, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.55, delay: 0.1 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="inline-block mr-[0.22em]"
              >{w}</motion.span>
            ))}
            {' '}
            {['in', 'Newark,', 'NJ'].map((w, i) => (
              <motion.span key={w}
                initial={{ opacity: 0, y: 32, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.55, delay: 0.44 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="inline-block mr-[0.22em]"
                style={{ background: 'linear-gradient(135deg, #6B3FA0 0%, #1D4ED8 50%, #0EA5E9 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
              >{w}</motion.span>
            ))}
            {' '}
            {['Builds', 'Yours', 'First'].map((w, i) => (
              <motion.span key={w}
                initial={{ opacity: 0, y: 32, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.55, delay: 0.72 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="inline-block mr-[0.22em]"
              >{w}</motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.95 }}
            className="text-[#475569] text-xl max-w-3xl mx-auto leading-relaxed mb-8"
          >
            Most Newark businesses have websites that are invisible on Google and bleed leads every day.
            Novelio builds fast, SEO-ready, conversion-focused sites — and you see your free demo before spending a single dollar.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.08 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
          >
            <a href="tel:+18887384655" className="btn-primary text-base px-8 py-4 w-full sm:w-auto justify-center">
              Get Your Free Demo Site
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                className="flex"
              >
                <ArrowRight className="w-5 h-5" />
              </motion.span>
            </a>
            <Link to="/locations/new-jersey/newark" className="btn-ghost text-base px-8 py-4 w-full sm:w-auto justify-center">
              Newark Location Page →
            </Link>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto"
          >
            {[
              { value: '$0', label: 'Cost to see your demo' },
              { value: '48h', label: 'Demo turnaround' },
              { value: '$150/mo', label: 'Growth plan — website included' },
              { value: '100%', label: 'Pay only if you love it' },
            ].map((stat, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center backdrop-blur-sm">
                <div className="text-2xl font-heading font-800 gradient-text">{stat.value}</div>
                <div className="text-xs text-[#64748b] mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Pain Points ── */}
      <section className="section-pad bg-white">
        <div className="container-xl">
          <motion.div className="text-center mb-14" {...fadeUp(0)}>
            <div className="section-label mx-auto mb-3">The Real Problem</div>
            <h2 className="text-4xl lg:text-5xl font-heading font-800 text-[#1B3172] mb-4">
              Your Competitors' Websites Are Winning Clients That Should Be Yours
            </h2>
            <p className="text-[#475569] text-lg max-w-2xl mx-auto">
              Newark has thousands of small businesses competing for the same local customers. The ones winning on Google share one thing — a website built to rank and convert.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {PAIN_POINTS.map((point, i) => (
              <motion.div key={i} {...fadeUp(i * 0.1)} className="bg-[#F8FAFF] border border-[#E2E8F0] rounded-2xl p-8">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6B3FA0] to-[#1D4ED8] flex items-center justify-center mb-5">
                  <span className="text-white font-heading font-700 text-sm">{point.num}</span>
                </div>
                <h3 className="text-lg font-heading font-700 text-[#1B3172] mb-2">{point.title}</h3>
                <p className="text-[#475569] text-sm leading-relaxed mb-4">{point.desc}</p>
                <span className="inline-block text-xs font-medium text-[#4338CA] bg-[#EEF2FF] border border-[#C7D2FE] rounded-full px-3 py-1">
                  {point.stat}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works + Demo Card ── */}
      <section className="section-pad bg-dark" id="how-it-works">
        <div className="dot-grid absolute inset-0 opacity-30 pointer-events-none" />
        <div className="container-xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left: steps */}
            <div>
              <motion.div {...fadeUp(0)}>
                <div className="section-label mb-3">Zero-Risk Offer</div>
                <h2 className="text-4xl lg:text-5xl font-heading font-800 text-[#1B3172] mb-6 leading-tight">
                  We Build Your Newark Website First.{' '}
                  <span className="gradient-text">You Pay After.</span>
                </h2>
                <p className="text-[#475569] text-lg leading-relaxed mb-10">
                  No deposits, no contracts, no risk. We research your Newark business, your market, and your competitors — then build a real, live demo and walk you through it on a call. Love it, we launch. Don't love it, you owe us nothing.
                </p>
              </motion.div>

              <div className="flex flex-col gap-6">
                {[
                  { n: '1', title: 'Quick intake call (15 min)', desc: 'Tell us about your Newark business — services, goals, and what makes you different.' },
                  { n: '2', title: 'We build your demo site (48–72 hrs)', desc: 'A fully designed, mobile-first, SEO-structured site built around your business and Newark location.' },
                  { n: '3', title: 'Review call — you decide', desc: 'See the demo live on a call. Love it → we launch. Don\'t → walk away with no bill.' },
                ].map((step, i) => (
                  <motion.div key={i} {...fadeUp(0.1 + i * 0.1)} className="flex items-start gap-5">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6B3FA0] to-[#1D4ED8] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white font-heading font-700 text-sm">{step.n}</span>
                    </div>
                    <div>
                      <p className="font-heading font-700 text-[#1B3172] mb-1">{step.title}</p>
                      <p className="text-[#475569] text-sm leading-relaxed">{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right: demo card */}
            <motion.div {...fadeUp(0.2)}>
              <div className="bg-white border border-[#E2E8F0] rounded-3xl p-10 shadow-lg">
                <div className="section-label mb-4">What's Included in Your Free Demo</div>
                <h3 className="text-2xl font-heading font-800 text-[#1B3172] mb-6 leading-snug">
                  Your Newark business's complete website — built & ready to review
                </h3>

                <ul className="flex flex-col gap-3 mb-8">
                  {DEMO_INCLUDES.map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-[#475569] text-sm">
                      <CheckCircle className="w-4 h-4 text-[#6B3FA0] flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-5xl font-heading font-900 gradient-text">$0</span>
                  <span className="text-[#64748b] text-sm">to see your demo · growth plans from $150/mo with website included</span>
                </div>

                <a
                  href="tel:+18887384655"
                  className="btn-primary w-full justify-center text-base py-4 mb-3"
                >
                  <Phone className="w-4 h-4" />
                  Call to Start Your Free Demo — (888) 738-4655
                </a>
                <p className="text-center text-xs text-[#64748b]">
                  Or email <a href="mailto:info@noveliotech.com" className="text-[#4338CA] hover:underline">info@noveliotech.com</a> · Response within 2 hours
                </p>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── Local Stats ── */}
      <section className="section-pad bg-white">
        <div className="container-xl">
          <motion.div className="text-center mb-12" {...fadeUp(0)}>
            <div className="section-label mx-auto mb-3">Newark Market</div>
            <h2 className="text-4xl lg:text-5xl font-heading font-800 text-[#1B3172] mb-4">
              Why Newark Businesses Can't Afford to Ignore Their Website
            </h2>
            <p className="text-[#475569] text-lg max-w-2xl mx-auto">
              Newark, NJ is one of the fastest-growing metros in the Northeast. But fewer than 1 in 4 local businesses has a website that ranks on Google's first page. That gap is your opportunity.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {STATS.map((stat, i) => (
              <motion.div key={i} {...fadeUp(i * 0.1)} className="bg-[#F8FAFF] border border-[#E2E8F0] rounded-2xl p-7 text-center">
                <div className="text-3xl font-heading font-800 gradient-text mb-1">{stat.value}</div>
                <div className="text-sm text-[#64748b]">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Before / After ── */}
      <section className="section-pad bg-dark">
        <div className="dot-grid absolute inset-0 opacity-30 pointer-events-none" />
        <div className="container-xl relative z-10">
          <motion.div className="text-center mb-12" {...fadeUp(0)}>
            <div className="section-label mx-auto mb-3">The Difference</div>
            <h2 className="text-4xl lg:text-5xl font-heading font-800 text-[#1B3172] mb-4">
              What Changes When Your Newark Business Has the Right Website
            </h2>
            <p className="text-[#475569] text-lg max-w-2xl mx-auto">
              The difference between a site that sits there and one that actively grows your business.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Before */}
            <motion.div {...fadeUp(0.1)} className="bg-white border border-[#E2E8F0] rounded-2xl p-8">
              <div className="inline-block text-xs font-medium tracking-widest uppercase bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] rounded-full px-3 py-1 mb-5">
                Without Novelio
              </div>
              <h3 className="font-heading font-700 text-[#1B3172] mb-4">What most Newark business sites look like</h3>
              <ul className="flex flex-col gap-3">
                {[
                  'Hard to find on Google — no local SEO structure',
                  'Outdated design, broken on mobile',
                  'No clear CTA — visitors don\'t know what to do',
                  'No social proof or Google reviews displayed',
                  'Slow load times — losing more than half of visitors',
                  'No lead capture — traffic vanishes without converting',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-[#64748b] text-sm">
                    <span className="text-[#DC2626] font-bold mt-0.5 flex-shrink-0">✕</span>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* After */}
            <motion.div {...fadeUp(0.2)} className="bg-gradient-to-br from-[#6B3FA0] to-[#1D4ED8] rounded-2xl p-8 text-white">
              <div className="inline-block text-xs font-medium tracking-widest uppercase bg-white/15 border border-white/25 rounded-full px-3 py-1 mb-5">
                With Novelio
              </div>
              <h3 className="font-heading font-700 text-white mb-4">Your growth-ready Newark website</h3>
              <ul className="flex flex-col gap-3">
                {[
                  'Ranks for "[your service] in Newark NJ" & nearby keywords',
                  'Modern, fast, pixel-perfect on every device',
                  'Clear CTAs, pricing & contact info that converts visitors',
                  'Google reviews & trust signals prominently featured',
                  'Sub-2-second load times, Core Web Vitals optimised',
                  'Lead capture forms & click-to-call on every page',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-white/90 text-sm">
                    <CheckCircle className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Testimonial ── */}
      <section className="section-pad bg-white">
        <div className="container-xl">
          <motion.div {...fadeUp(0)} className="max-w-3xl mx-auto text-center">
            <div className="section-label mx-auto mb-6">What Our Clients Say</div>
            <div className="bg-[#F8FAFF] border border-[#E2E8F0] rounded-3xl p-10">
              <div className="flex justify-center gap-0.5 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-amber-500 fill-amber-500" />
                ))}
              </div>
              <blockquote className="text-xl text-[#1B3172] font-medium leading-relaxed mb-8 italic">
                "We had Instagram followers but no one was booking online. Novelio built us a site with real SEO and a booking integration — within 45 days we were getting appointments through the website every single day."
              </blockquote>
              <div className="flex items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6B3FA0] to-[#1D4ED8] flex items-center justify-center text-white font-heading font-700 text-sm flex-shrink-0">
                  JT
                </div>
                <div className="text-left">
                  <div className="font-heading font-700 text-[#1B3172] text-sm">Jasmine T.</div>
                  <div className="text-[#64748b] text-xs">Owner · Hair Salon, Newark NJ</div>
                </div>
                <div className="ml-4 pl-4 border-l border-[#E2E8F0]">
                  <span className="text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
                    Daily online bookings within 45 days
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="section-pad bg-[#F8FAFF] border-y border-[#E2E8F0]" id="faq">
        <div className="container-xl">
          <motion.div className="text-center mb-14" {...fadeUp(0)}>
            <div className="section-label mx-auto mb-3">FAQ</div>
            <h2 className="text-4xl lg:text-5xl font-heading font-800 text-[#1B3172] mb-4">
              Questions Newark Business Owners Ask Us
            </h2>
            <p className="text-[#475569] text-lg max-w-2xl mx-auto">
              Common questions about web development, cost, and local SEO from Newark business owners.
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-3">
            {FAQS.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Internal Links ── */}
      <section className="py-10 bg-white border-b border-[#E2E8F0]">
        <div className="container-xl">
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <Link to="/locations/new-jersey/newark" className="text-[#4338CA] hover:text-[#6B3FA0] font-medium transition-colors flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              Newark, NJ Location Page
            </Link>
            <span className="text-[#CBD5E1]">·</span>
            <Link to="/services/website-development" className="text-[#4338CA] hover:text-[#6B3FA0] font-medium transition-colors">
              Website Development Services
            </Link>
            <span className="text-[#CBD5E1]">·</span>
            <Link to="/services/google-business" className="text-[#4338CA] hover:text-[#6B3FA0] font-medium transition-colors">
              Google Business Profile
            </Link>
            <span className="text-[#CBD5E1]">·</span>
            <Link to="/locations" className="text-[#4338CA] hover:text-[#6B3FA0] font-medium transition-colors">
              All Locations
            </Link>
            <span className="text-[#CBD5E1]">·</span>
            <Link to="/contact" className="text-[#4338CA] hover:text-[#6B3FA0] font-medium transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      <CTABanner />
    </main>
  );
}
