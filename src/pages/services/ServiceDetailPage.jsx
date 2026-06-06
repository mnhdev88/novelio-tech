import SEO from '../../components/SEO';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Search, TrendingUp, Share2, Code2, ShoppingCart, FileText, Palette, Mail, Briefcase, ChevronDown, ChevronUp } from 'lucide-react';
import { SERVICES } from '../../data/siteData';
import CTABanner from '../../components/home/CTABanner';
import TestimonialsSection from '../../components/home/TestimonialsSection';
import { useState } from 'react';

const ICON_MAP = { Search, TrendingUp, Share2, Code2, ShoppingCart, FileText, Palette, Mail, Briefcase };

const SERVICE_FAQS = {
  'website-development': [
    { q: 'How long does a website build take?', a: 'A basic business site takes 2–4 weeks. A custom multi-page site with advanced features takes 4–8 weeks. We always deliver mobile-first, Core Web Vitals-optimized builds and keep you updated at every milestone.' },
    { q: 'What platform do you build on?', a: 'We build on modern frameworks (React, Next.js) for high-performance custom sites, or WordPress and Webflow for clients who need easy self-management. We recommend the right platform based on your goals, not our preference.' },
    { q: 'Will my website be mobile-friendly and fast?', a: 'Absolutely — all our sites are mobile-first by design, tested across devices and browsers, and built to pass Core Web Vitals. Page speed and mobile performance directly impact both rankings and conversions.' },
    { q: 'Do you provide ongoing website maintenance?', a: 'Yes — we offer monthly maintenance plans covering updates, security patches, backups, performance monitoring, and priority support. Most clients find ongoing maintenance pays for itself by preventing costly downtime or security incidents.' },
  ],
  'search-engine-optimization': [
    { q: 'How long does SEO take to show results?', a: 'SEO is a long-term strategy. Most businesses see meaningful improvements within 3–6 months, with stronger results at 6–12 months. Competitive niches may take longer, but we set clear milestones so you always know where you stand.' },
    { q: 'What is included in your SEO service?', a: 'Our SEO service includes a technical audit, on-page optimization, keyword research and strategy, content recommendations, link building, local SEO (if applicable), and monthly reporting with transparent metrics.' },
    { q: 'Do you guarantee #1 rankings?', a: 'No ethical SEO agency can guarantee specific rankings — Google\'s algorithm changes constantly. We do guarantee full transparency, best practices, and a measurable improvement in organic visibility, traffic, and leads.' },
    { q: 'Do you handle local SEO for businesses targeting nearby customers?', a: 'Yes — local SEO is one of our core specializations. We optimize your on-page signals, Google Business Profile, local citations, and location-specific content to help you rank in local searches and Google Maps.' },
  ],
  'google-business': [
    { q: 'What is Google Business Profile optimization?', a: 'GBP optimization covers fully completing your profile, adding photos, setting accurate hours and services, implementing a review generation strategy, posting weekly updates, and building citation consistency so Google ranks you higher in local search.' },
    { q: 'How long before I see local search improvements?', a: 'Most clients see measurable improvements in local pack rankings and calls within 30–60 days of a full GBP optimization. Review generation typically shows results within 2–4 weeks.' },
    { q: 'Do you respond to reviews on my behalf?', a: 'Yes. We craft professional, brand-consistent responses to both positive and negative reviews within 48 hours, which Google rewards with higher local ranking signals.' },
    { q: 'What if my business serves multiple locations?', a: 'We can optimize and manage GBP listings for multiple locations. Each location gets its own optimized profile with location-specific keywords, photos, and review strategy.' },
  ],
  'lead-generation': [
    { q: 'What does your lead generation service include?', a: 'We build the full system: landing pages, lead capture forms, follow-up automation, CRM integration, and tracking dashboards. We also manage paid campaigns (Google, Meta) to drive qualified traffic.' },
    { q: 'How quickly will I start seeing new leads?', a: 'Paid campaigns can generate leads within days of launch. Organic funnels typically take 30–60 days to build momentum. We set clear expectations at the start based on your budget and market.' },
    { q: 'Do you handle follow-up automation?', a: 'Yes — we build automated email and SMS follow-up sequences that nurture leads instantly, so you never lose a prospect because of a slow response.' },
    { q: 'What is a typical cost per lead?', a: 'Cost per lead varies by industry, location, and competition. We analyze your market and set realistic CPA targets before spending any budget. Most clients see CPLs improve 20–40% within 60 days of optimization.' },
  ],
  automation: [
    { q: 'What tools do you integrate and automate?', a: 'We work with CRMs (HubSpot, GoHighLevel, Zoho, Salesforce), email platforms (Mailchimp, ActiveCampaign, Klaviyo), booking systems, accounting tools, and custom workflows via Zapier or Make.' },
    { q: 'How much time can automation save my business?', a: 'Most clients reclaim 8–15 hours per week after implementing our automation systems — time previously spent on manual follow-ups, data entry, scheduling, and reporting.' },
    { q: 'Do I need technical knowledge to use the automations?', a: 'Not at all. We build systems that run without technical oversight. We also provide a short onboarding session and documentation so your team can manage day-to-day operations confidently.' },
    { q: 'Can you integrate my existing tools?', a: 'Yes. We audit your current tech stack first and maximize what you already have before recommending new tools. Most businesses can achieve significant automation gains with tools they already pay for.' },
  ],
  branding: [
    { q: 'What does your branding service include?', a: 'We deliver logo design, full brand identity (colors, typography, visual language), brand guidelines, social media templates, business card and print-ready assets, and brand voice and messaging documentation.' },
    { q: 'How long does a full branding project take?', a: 'A complete brand identity project typically takes 3–5 weeks including discovery, concepts, revisions, and final delivery of all assets.' },
    { q: 'Do you also rebrand existing businesses?', a: 'Yes. We work with businesses that need a full rebrand as well as those needing a brand refresh — updating an existing identity to feel more modern and consistent without losing brand equity.' },
    { q: 'Will I own all the brand assets?', a: 'Absolutely. All files are delivered in print-ready and digital formats (AI, EPS, PDF, PNG, SVG) and you own 100% of the rights to every asset we create.' },
  ],
  'tech-ops': [
    { q: 'What tech problems do you typically fix?', a: 'Common issues we resolve: slow or unreliable hosting, bloated plugin stacks, disconnected tools, overpriced subscriptions, broken integrations, accounting software setup, and email deliverability problems.' },
    { q: 'Can you migrate my website to a faster host?', a: 'Yes. We audit your current hosting, recommend the right tier and provider for your traffic and budget, handle the migration with zero downtime, and verify performance post-move.' },
    { q: 'Do you provide ongoing IT support?', a: 'Yes. We offer monthly tech-ops retainers covering routine monitoring, updates, security patches, integration maintenance, and a priority support line for critical issues.' },
    { q: 'How do you charge for tech ops work?', a: 'We offer both project-based pricing for one-time fixes and monthly retainers for ongoing support. Scope and cost are determined after a free tech audit.' },
  ],
  'email-marketing': [
    { q: 'Which email platforms do you work with?', a: 'We work with Mailchimp, Klaviyo, ActiveCampaign, ConvertKit, HubSpot, and most major platforms. We can migrate between platforms or optimize what you already use.' },
    { q: 'What does your email marketing service include?', a: 'Strategy, list segmentation, campaign design and copywriting, drip sequence setup, A/B testing, deliverability audit (SPF/DKIM/DMARC), and monthly analytics reporting.' },
    { q: 'What open rates can I expect?', a: 'With proper segmentation and subject line optimization, most clients achieve 25–40% open rates within 60 days — well above the industry average of 20–22%.' },
    { q: 'Can you set up automated welcome and nurture sequences?', a: 'Yes — welcome sequences, abandoned cart flows, post-purchase follow-ups, re-engagement campaigns, and custom drip sequences are all part of our automation setup service.' },
  ],
  'email-validator': [
    { q: 'Why does email list validation matter?', a: 'Sending to invalid or inactive addresses causes hard bounces, damages your sender reputation, and can get your account suspended by your ESP. A clean list delivers better open rates and protects your deliverability.' },
    { q: 'How does the validation process work?', a: 'We run your list through multi-layer verification: syntax checks, domain validation, MX record verification, and real-time SMTP verification to classify each address as valid, risky, or invalid.' },
    { q: 'How quickly can you validate a large list?', a: 'We can typically validate lists of up to 100,000 addresses within 24–48 hours. Larger lists are scoped individually.' },
    { q: 'What percentage of addresses are typically removed?', a: 'Most lists that haven\'t been cleaned in 12+ months contain 15–30% invalid or risky addresses. Removing these immediately reduces bounce rates and improves inbox placement.' },
  ],
};

const DEFAULT_FAQ = [
  { q: 'How do we get started?', a: 'Simply fill out our contact form or call us. We\'ll schedule a free discovery call to understand your goals and recommend the right service mix.' },
  { q: 'Do you work with international clients?', a: 'Yes — we work with clients across North America, UK, Europe, Middle East, and South Asia. We accommodate different time zones for calls and reporting.' },
  { q: 'What makes Novelio different from other agencies?', a: 'We focus exclusively on ROI. Every strategy is built around your business goals, not industry benchmarks. And we\'re transparent — you always know exactly what we\'re doing and why.' },
];

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

export default function ServiceDetailPage() {
  const { serviceId } = useParams();
  const service = SERVICES.find((s) => s.id === serviceId);

  if (!service) return <Navigate to="/services" replace />;

  const Icon = ICON_MAP[service.icon] || Search;
  const faqs = SERVICE_FAQS[serviceId] || DEFAULT_FAQ;

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        name: service.title,
        description: service.description,
        provider: {
          '@type': 'LocalBusiness',
          '@id': 'https://www.noveliotech.com/#business',
          name: 'Novelio Technologies LLC',
          url: 'https://www.noveliotech.com',
        },
        areaServed: { '@type': 'Country', name: 'United States' },
        serviceType: service.title,
        url: `https://www.noveliotech.com${service.slug}`,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.noveliotech.com' },
          { '@type': 'ListItem', position: 2, name: 'Services', item: 'https://www.noveliotech.com/services' },
          { '@type': 'ListItem', position: 3, name: service.title, item: `https://www.noveliotech.com${service.slug}` },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map((f) => ({
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
        title={`${service.title} — ${service.tagline}`}
        description={service.description}
        canonical={service.slug}
        schema={serviceSchema}
      />
      {/* Hero */}
      <section className="section-pad relative overflow-hidden bg-dark">
        <div className="orb orb-purple w-[500px] h-[500px] -top-48 -left-48 opacity-15" />
        <div className="orb orb-blue w-[400px] h-[400px] top-0 -right-32 opacity-10" />
        <div className="dot-grid absolute inset-0 opacity-40" />
        <div className="container-xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm text-[#64748b] mb-6">
                <Link to="/" className="hover:text-[#1B3172] transition-colors">Home</Link>
                <span>/</span>
                <Link to="/services" className="hover:text-[#1B3172] transition-colors">Services</Link>
                <span>/</span>
                <span className="text-[#1B3172]">{service.title}</span>
              </div>

              <div className="section-label mb-4">Our Services</div>
              <h1 className="text-4xl lg:text-6xl font-heading font-800 text-[#1B3172] mb-6 leading-tight">
                {service.tagline.split(' ').map((word, i, arr) =>
                  i >= arr.length - 2 ? (
                    <span key={i} className="gradient-text">{word} </span>
                  ) : `${word} `
                )}
              </h1>
              <p className="text-[#475569] text-xl leading-relaxed mb-8">{service.description}</p>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {service.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-[#475569] text-sm">
                    <Check className={`w-4 h-4 bg-gradient-to-br ${service.color} text-white rounded-full p-0.5 flex-shrink-0`} />
                    {f}
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/contact" className="btn-primary">
                  Get Started Today
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/contact" className="btn-ghost">Request Free Audit</Link>
              </div>
            </motion.div>

            {/* Visual */}
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
              className="relative">
              <div className={`w-full aspect-square rounded-3xl bg-gradient-to-br ${service.color} opacity-10 absolute inset-0 blur-3xl`} />
              <div className="glass-card gradient-border rounded-3xl p-10 relative flex items-center justify-center">
                <div className={`w-32 h-32 rounded-3xl bg-gradient-to-br ${service.color} flex items-center justify-center shadow-glow`}>
                  <Icon className="w-16 h-16 text-white" />
                </div>
              </div>
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity }}
                className="absolute -bottom-6 -left-6 glass-card gradient-border rounded-2xl px-5 py-3">
                <div className="text-2xl font-heading font-800 gradient-text">10x</div>
                <div className="text-xs text-[#475569]">Average ROI</div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why this service matters */}
      <section className="section-pad bg-[#EEF2FF] relative overflow-hidden">
        <div className="container-xl">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}
            className="text-center mb-16">
            <h2 className="text-4xl font-heading font-700 text-[#1B3172] mb-4">
              Everything Included in Our <span className="gradient-text">{service.short}</span> Service
            </h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {service.features.map((feature, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }} viewport={{ once: true }}
                className="glass-card gradient-border rounded-2xl p-6 group hover:-translate-y-1 hover:shadow-glow transition-all duration-300">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Check className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-[#1B3172] font-heading font-600 text-[15px]">{feature}</h4>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Other services teaser */}
      <section className="section-pad-sm bg-dark">
        <div className="container-xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }}
            className="text-center mb-8">
            <h3 className="text-2xl font-heading font-700 text-[#1B3172]">Explore Our Other Services</h3>
          </motion.div>
          <div className="flex flex-wrap gap-3 justify-center">
            {SERVICES.filter((s) => s.id !== serviceId).map((s) => (
              <Link key={s.id} to={s.slug}
                className="glass-card gradient-border rounded-full px-5 py-2.5 text-sm font-medium text-[#475569] hover:text-[#1B3172] hover:shadow-glow transition-all">
                {s.short}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-pad bg-[#EEF2FF] relative overflow-hidden">
        <div className="container-lg">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}
            className="text-center mb-12">
            <div className="section-label mx-auto mb-4">FAQs</div>
            <h2 className="text-4xl font-heading font-700 text-[#1B3172] mb-4">
              Common <span className="gradient-text">Questions</span>
            </h2>
          </motion.div>
          <div className="space-y-3 max-w-3xl mx-auto">
            {faqs.map((faq, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }} viewport={{ once: true }}>
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
