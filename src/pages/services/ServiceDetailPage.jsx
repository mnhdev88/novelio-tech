import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Search, TrendingUp, Share2, Code2, ShoppingCart, FileText, Palette, Mail, Briefcase, ChevronDown, ChevronUp } from 'lucide-react';
import { SERVICES } from '../../data/siteData';
import CTABanner from '../../components/home/CTABanner';
import TestimonialsSection from '../../components/home/TestimonialsSection';
import { useState } from 'react';

const ICON_MAP = { Search, TrendingUp, Share2, Code2, ShoppingCart, FileText, Palette, Mail, Briefcase };

const SERVICE_FAQS = {
  seo: [
    { q: 'How long does SEO take to show results?', a: 'SEO is a long-term strategy. Most businesses see meaningful improvements within 3–6 months, with stronger results at 6–12 months. Competitive niches may take longer.' },
    { q: 'What is included in your SEO service?', a: 'Our SEO service includes technical audit, on-page optimization, keyword research and strategy, content recommendations, link building, local SEO (if applicable), and monthly reporting.' },
    { q: 'Do you guarantee #1 rankings?', a: 'No ethical SEO agency can guarantee specific rankings as Google\'s algorithm changes constantly. We do guarantee full transparency, best practices, and a measurable improvement in organic visibility and traffic.' },
    { q: 'Do you work with small businesses?', a: 'Absolutely. We tailor our SEO strategies to fit your budget and business size, whether you\'re a local business or a growing e-commerce brand.' },
  ],
  ppc: [
    { q: 'What\'s the minimum budget for Google Ads?', a: 'We recommend a minimum ad spend of $500–$1,000/month for meaningful data and results. Our management fee is separate from your ad budget.' },
    { q: 'How long before I see PPC results?', a: 'Unlike SEO, PPC can generate results immediately. Most campaigns see meaningful data within the first 2–4 weeks, which we use to optimize.' },
    { q: 'Which ad platforms do you manage?', a: 'We manage Google Ads (Search, Display, Shopping, YouTube), Meta Ads (Facebook & Instagram), Bing Ads, LinkedIn Ads, and TikTok Ads.' },
  ],
  'social-media': [
    { q: 'Which social platforms do you manage?', a: 'We manage Instagram, Facebook, LinkedIn, Twitter/X, TikTok, YouTube, Pinterest, and Snapchat.' },
    { q: 'How often will you post on our accounts?', a: 'Posting frequency depends on your package. Typically 3–7 posts per week per platform, plus Stories and Reels where applicable.' },
    { q: 'Will you create the content or do we provide it?', a: 'We handle full content creation — copywriting, graphic design, video editing, and scheduling. You just need to approve before publishing.' },
  ],
  'web-development': [
    { q: 'How long does a website take to build?', a: 'A basic website takes 2–4 weeks. A custom multi-page site with advanced features takes 4–8 weeks. E-commerce stores typically 6–10 weeks.' },
    { q: 'What platforms do you build on?', a: 'We build on WordPress, Shopify, WooCommerce, React/Next.js, and fully custom stacks depending on your needs.' },
    { q: 'Will my website be mobile-friendly?', a: 'Absolutely. Every website we build is fully responsive, mobile-first, and tested across all devices and browsers.' },
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

  return (
    <main className="pt-20">
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
