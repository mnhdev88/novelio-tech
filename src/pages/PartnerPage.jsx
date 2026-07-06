import SEO from '../components/SEO';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Handshake, ArrowRight, Check, Send, Users, Percent, Tag, Puzzle,
  Rocket, Building2, Megaphone, Headphones, BarChart3, ShieldCheck,
  ChevronDown, ChevronUp, FileText, PhoneCall, Settings,
} from 'lucide-react';
import { COMPANY } from '../data/siteData';
import { trackEvent } from '../utils/analytics';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay },
  viewport: { once: true },
});

const PARTNER_TYPES = [
  {
    icon: Percent,
    title: 'Referral Partner',
    desc: 'Refer businesses that need websites, SEO, or app development and earn a recurring commission on every client you send our way — no delivery work on your side.',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    icon: Tag,
    title: 'White-Label / Reseller',
    desc: 'Resell our services under your own brand. We build behind the scenes, you keep the client relationship — perfect for agencies wanting to expand what they offer.',
    color: 'from-fuchsia-600 to-indigo-600',
  },
  {
    icon: Puzzle,
    title: 'Technology & Integration',
    desc: 'SaaS platforms, tools, and product companies we integrate with or co-build on. Let\'s connect our offerings and reach each other\'s customers.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Rocket,
    title: 'Agency & Strategic',
    desc: 'Team up on larger projects, share overflow work, and co-deliver campaigns. Combine your strengths with ours to win and serve bigger clients together.',
    color: 'from-amber-500 to-orange-500',
  },
];

const BENEFITS = [
  {
    icon: Percent,
    title: 'Recurring Commissions',
    desc: 'Earn competitive, recurring payouts on every referred client for the life of the engagement — not just a one-time finder\'s fee.',
  },
  {
    icon: Tag,
    title: 'True White-Label Delivery',
    desc: 'We work invisibly under your brand — your logo, your client relationship. We never contact or poach your clients.',
  },
  {
    icon: Headphones,
    title: 'Dedicated Partner Manager',
    desc: 'A single point of contact who knows your business, handles onboarding, and keeps every project moving without a ticket queue.',
  },
  {
    icon: Megaphone,
    title: 'Co-Marketing Support',
    desc: 'Joint case studies, co-branded proposals, and shared campaigns that put your brand in front of new audiences.',
  },
  {
    icon: BarChart3,
    title: 'Transparent Tracking',
    desc: 'A partner dashboard with real-time visibility into referrals, project status, and commissions — no guessing, no chasing.',
  },
  {
    icon: ShieldCheck,
    title: 'Reliable, On-Time Delivery',
    desc: 'Your reputation is on the line when you refer us. We protect it with milestone-driven delivery and clear communication.',
  },
];

const WHO = [
  { icon: Building2, label: 'Marketing & Creative Agencies' },
  { icon: Users, label: 'Freelancers & Consultants' },
  { icon: Puzzle, label: 'SaaS & Technology Companies' },
  { icon: Settings, label: 'IT & Managed Service Providers' },
  { icon: BarChart3, label: 'Business Coaches & Advisors' },
  { icon: Megaphone, label: 'Media & Advertising Firms' },
];

const STEPS = [
  {
    step: '01',
    icon: FileText,
    title: 'Apply',
    desc: 'Fill out the partner form below with a bit about your business and how you\'d like to work together.',
  },
  {
    step: '02',
    icon: PhoneCall,
    title: 'Intro Call',
    desc: 'We hop on a short call to align on goals, commissions, and the right partnership model for you.',
  },
  {
    step: '03',
    icon: Settings,
    title: 'Onboarding',
    desc: 'We sign a simple agreement, set you up with your partner manager and dashboard, and share resources.',
  },
  {
    step: '04',
    icon: Rocket,
    title: 'Grow Together',
    desc: 'Start referring or co-delivering. Track everything transparently and earn as your clients succeed.',
  },
];

const FAQS = [
  { q: 'How much can I earn as a referral partner?', a: 'Referral commissions are recurring and competitive, based on the service and deal size. We share exact numbers on the intro call once we understand your model — but partners earn on every referred client for the life of the engagement, not just a one-time fee.' },
  { q: 'Will you contact or take over my clients?', a: 'Never. Under our white-label and referral models, you own the client relationship. We work behind the scenes under your brand and never market to, poach, or bill your clients directly.' },
  { q: 'What services can I refer or resell?', a: 'Everything we offer — website development, mobile app development, SEO, Google Business Profile, lead generation, automation & CRM, branding, and email marketing. You can partner on one service or our full stack.' },
  { q: 'Is there a cost to become a partner?', a: 'No. Joining the partner program is free. There are no setup fees or monthly costs — we only succeed when you and your clients do.' },
  { q: 'Do I need technical or design skills?', a: 'Not at all. Referral partners simply introduce clients, and white-label partners let us handle delivery. If you can spot a business that needs a website, app, or marketing help, you can partner with us.' },
  { q: 'How quickly can we get started?', a: 'Most partners are onboarded within a few days of the intro call. Once the agreement is signed and your dashboard is set up, you can start referring or briefing projects immediately.' },
];

const PARTNERSHIP_OPTIONS = [
  'Referral Partner',
  'White-Label / Reseller',
  'Technology & Integration',
  'Agency & Strategic',
  'Not sure yet',
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
        <div className="px-5 pb-5 border-t border-slate-200 pt-4">
          <p className="text-[#475569] text-sm leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      name: 'Partner With Novelio Technologies',
      description: 'Join the Novelio partner program — referral, white-label, technology, and agency partnerships for companies that want to grow together.',
      url: 'https://www.noveliotech.com/partners',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.noveliotech.com' },
        { '@type': 'ListItem', position: 2, name: 'Become a Partner', item: 'https://www.noveliotech.com/partners' },
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

export default function PartnerPage() {
  const [form, setForm] = useState({
    name: '', email: '', company: '', website: '', partnershipType: '', message: '', formType: 'partner',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.company.trim()) e.company = 'Company is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      const res = await fetch('https://formspree.io/f/xwpbqpbq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('submission failed');
      trackEvent('generate_lead', { form: 'partner' });
      setSuccess(true);
    } catch {
      setErrors({ submit: `Something went wrong. Please try again or email us directly at ${COMPANY.email}.` });
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors((er) => ({ ...er, [field]: '' }));
  };

  const inputClass = (field) =>
    `w-full bg-white border rounded-xl px-4 py-3.5 text-[#1B3172] placeholder-slate-400 focus:outline-none focus:ring-2 transition-all text-[15px] ${
      errors[field] ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200/80 focus:border-brand-purple/60 focus:ring-brand-purple/20'
    }`;

  return (
    <main className="pt-20">
      <SEO
        title="Become a Partner — Grow With Novelio Technologies"
        description="Partner with Novelio Technologies through referral, white-label, technology, and agency partnerships. Earn recurring commissions, resell under your brand, and grow together. Free to join."
        canonical="/partners"
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
                <span className="text-[#1B3172]">Become a Partner</span>
              </div>
              <div className="section-label mb-4">Partner Program</div>
              <h1 className="text-4xl lg:text-6xl font-heading font-800 text-[#1B3172] mb-6 leading-tight">
                Let's <span className="gradient-text">Grow Together</span>
              </h1>
              <p className="text-[#475569] text-xl leading-relaxed mb-4">
                Team up with Novelio Technologies to deliver more to your clients — websites, apps,
                SEO, and full-stack growth systems — without hiring or building a delivery team.
              </p>
              <p className="text-[#475569] text-base leading-relaxed mb-8">
                Whether you want to refer, resell under your brand, or co-deliver bigger projects,
                we make it simple, transparent, and profitable to partner with us.
              </p>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {['Recurring Commissions', 'White-Label Delivery', 'Dedicated Manager', 'Free to Join'].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-[#475569] text-sm">
                    <Check className="w-4 h-4 bg-gradient-to-br from-fuchsia-600 to-indigo-600 text-white rounded-full p-0.5 flex-shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="#partner-form" className="btn-primary">
                  Become a Partner
                  <ArrowRight className="w-5 h-5" />
                </a>
                <Link to="/contact" className="btn-ghost">Talk to Our Team</Link>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="relative hidden lg:block">
              <div className="w-full aspect-square rounded-3xl bg-gradient-to-br from-fuchsia-600 to-indigo-600 opacity-10 absolute inset-0 blur-3xl" />
              <div className="glass-card gradient-border rounded-3xl p-10 relative flex items-center justify-center">
                <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-fuchsia-600 to-indigo-600 flex items-center justify-center shadow-glow">
                  <Handshake className="w-16 h-16 text-white" />
                </div>
              </div>
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity }}
                className="absolute -bottom-6 -left-6 glass-card gradient-border rounded-2xl px-5 py-3">
                <div className="text-2xl font-heading font-800 gradient-text">Recurring</div>
                <div className="text-xs text-[#475569]">Commissions</div>
              </motion.div>
              <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 4.5, repeat: Infinity }}
                className="absolute -top-6 -right-6 glass-card gradient-border rounded-2xl px-5 py-3">
                <div className="text-2xl font-heading font-800 gradient-text">White-Label</div>
                <div className="text-xs text-[#475569]">Under Your Brand</div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Partnership Types ── */}
      <section className="section-pad bg-[#EEF2FF] relative overflow-hidden">
        <div className="container-xl">
          <motion.div {...fadeUp()} className="text-center mb-16">
            <div className="section-label mx-auto mb-4">Ways to Partner</div>
            <h2 className="text-4xl font-heading font-700 text-[#1B3172] mb-4">
              Find the Partnership <span className="gradient-text">That Fits You</span>
            </h2>
            <p className="text-[#475569] text-lg max-w-2xl mx-auto">
              Every business partners differently. Pick the model that matches how you work — or tell
              us and we'll shape one around you.
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 gap-6">
            {PARTNER_TYPES.map((p, i) => (
              <motion.div key={i} {...fadeUp(i * 0.08)}
                className="glass-card gradient-border rounded-2xl p-7 group hover:-translate-y-1 hover:shadow-glow transition-all duration-300">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <p.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-[#1B3172] font-heading font-600 text-lg mb-3">{p.title}</h3>
                <p className="text-[#475569] text-sm leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Benefits ── */}
      <section className="section-pad bg-dark relative overflow-hidden">
        <div className="orb orb-purple w-[400px] h-[400px] -top-32 -right-32 opacity-10" />
        <div className="container-xl relative z-10">
          <motion.div {...fadeUp()} className="text-center mb-16">
            <div className="section-label mx-auto mb-4">Why Partner With Us</div>
            <h2 className="text-4xl font-heading font-700 text-[#1B3172] mb-4">
              Built to Make <span className="gradient-text">Partners Win</span>
            </h2>
            <p className="text-[#475569] text-lg max-w-2xl mx-auto">
              We treat partners like an extension of our team — with the support, transparency, and
              reliability your reputation depends on.
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {BENEFITS.map((item, i) => (
              <motion.div key={i} {...fadeUp(i * 0.08)}
                className="glass-card gradient-border rounded-2xl p-7 group hover:-translate-y-1 hover:shadow-glow transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fuchsia-600 to-indigo-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-[#1B3172] font-heading font-600 text-lg mb-3">{item.title}</h3>
                <p className="text-[#475569] text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Who We Partner With ── */}
      <section className="section-pad bg-[#EEF2FF] relative overflow-hidden">
        <div className="container-xl">
          <motion.div {...fadeUp()} className="text-center mb-16">
            <div className="section-label mx-auto mb-4">Who We Work With</div>
            <h2 className="text-4xl font-heading font-700 text-[#1B3172] mb-4">
              Companies We Love to <span className="gradient-text">Partner With</span>
            </h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {WHO.map((w, i) => (
              <motion.div key={i} {...fadeUp(i * 0.07)}
                className="glass-card gradient-border rounded-2xl p-6 flex items-center gap-4 group hover:-translate-y-1 hover:shadow-glow transition-all duration-300">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-fuchsia-600 to-indigo-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <w.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-[#1B3172] font-heading font-600 text-[15px]">{w.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="section-pad bg-dark relative overflow-hidden">
        <div className="orb orb-blue w-[400px] h-[400px] -bottom-32 -left-32 opacity-10" />
        <div className="container-lg relative z-10">
          <motion.div {...fadeUp()} className="text-center mb-16">
            <div className="section-label mx-auto mb-4">How It Works</div>
            <h2 className="text-4xl font-heading font-700 text-[#1B3172] mb-4">
              From Hello to <span className="gradient-text">Growing Together</span>
            </h2>
            <p className="text-[#475569] text-lg max-w-2xl mx-auto">
              Getting started is simple. Most partners are up and running within a few days.
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s, i) => (
              <motion.div key={i} {...fadeUp(i * 0.1)}
                className="glass-card gradient-border rounded-2xl p-7 group hover:shadow-glow transition-all duration-300">
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-fuchsia-600 to-indigo-600 flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform">
                    <s.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-3xl font-heading font-800 text-[#1B3172]/10">{s.step}</span>
                </div>
                <h3 className="text-[#1B3172] font-heading font-700 text-lg mb-2">{s.title}</h3>
                <p className="text-[#475569] text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Application Form ── */}
      <section id="partner-form" className="section-pad bg-[#EEF2FF] relative overflow-hidden scroll-mt-24">
        <div className="container-lg relative z-10">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Left sidebar */}
            <div className="lg:col-span-2">
              <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
                <div className="section-label mb-4">Apply Now</div>
                <h2 className="text-3xl font-heading font-700 text-[#1B3172] mb-4">
                  Ready to <span className="gradient-text">Partner Up?</span>
                </h2>
                <p className="text-[#475569] leading-relaxed mb-8">
                  Tell us about your business and how you'd like to work together. We'll review your
                  application and get back to you within 24 hours to set up an intro call.
                </p>
                <div className="space-y-5 mb-8">
                  {[
                    'Free to join — no setup or monthly fees',
                    'Recurring commissions on every referral',
                    'We never contact or poach your clients',
                    'Response within 24 hours',
                  ].map((text, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-fuchsia-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-[#475569] text-sm">{text}</span>
                    </div>
                  ))}
                </div>
                <div className="glass-card gradient-border rounded-2xl p-5">
                  <h4 className="text-[#1B3172] font-heading font-600 mb-2">Questions first?</h4>
                  <p className="text-[#475569] text-sm mb-3">
                    Prefer to chat before applying? Reach out any time.
                  </p>
                  <a href={`mailto:${COMPANY.email}`} className="text-brand-purple font-medium text-sm hover:underline break-all">
                    {COMPANY.email}
                  </a>
                </div>
              </motion.div>
            </div>

            {/* Form */}
            <div className="lg:col-span-3">
              <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
                <div className="glass-card gradient-border rounded-3xl p-8">
                  {success ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
                        <Check className="w-10 h-10 text-emerald-400" />
                      </div>
                      <h3 className="text-[#1B3172] font-heading font-700 text-2xl mb-3">Application Received!</h3>
                      <p className="text-[#475569] max-w-xs mx-auto">
                        Thanks for your interest in partnering with us. We'll review your application and
                        reach out within 24 hours.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} noValidate className="space-y-5">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-[#475569] uppercase tracking-widest mb-2">Full Name *</label>
                          <input type="text" value={form.name} onChange={handleChange('name')} placeholder="John Smith" className={inputClass('name')} />
                          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[#475569] uppercase tracking-widest mb-2">Email Address *</label>
                          <input type="email" value={form.email} onChange={handleChange('email')} placeholder="john@company.com" className={inputClass('email')} />
                          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[#475569] uppercase tracking-widest mb-2">Company Name *</label>
                          <input type="text" value={form.company} onChange={handleChange('company')} placeholder="Your Company" className={inputClass('company')} />
                          {errors.company && <p className="text-red-500 text-xs mt-1">{errors.company}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[#475569] uppercase tracking-widest mb-2">Website</label>
                          <input type="url" value={form.website} onChange={handleChange('website')} placeholder="https://yourcompany.com" className={inputClass('website')} />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-[#475569] uppercase tracking-widest mb-2">Partnership Type</label>
                        <select value={form.partnershipType} onChange={handleChange('partnershipType')} className={inputClass('partnershipType')}>
                          <option value="">Select a partnership type</option>
                          {PARTNERSHIP_OPTIONS.map((o) => (
                            <option key={o} value={o}>{o}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-[#475569] uppercase tracking-widest mb-2">Tell Us About Your Business</label>
                        <textarea rows={4} value={form.message} onChange={handleChange('message')}
                          placeholder="What do you do, and how would you like to partner with us?"
                          className={`${inputClass('message')} resize-none`} />
                      </div>

                      {errors.submit && <p className="text-red-500 text-sm">{errors.submit}</p>}

                      <button type="submit" disabled={submitting}
                        className="btn-primary w-full justify-center text-base py-4 disabled:opacity-60 disabled:cursor-not-allowed">
                        {submitting ? (
                          <>
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5" />
                            Submit Partner Application
                          </>
                        )}
                      </button>

                      <p className="text-center text-xs text-[#64748b]">
                        By submitting this form you agree to our{' '}
                        <Link to="/privacy" className="text-brand-purple hover:underline">Privacy Policy</Link>.
                        We never share your information.
                      </p>
                    </form>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="section-pad bg-dark relative overflow-hidden">
        <div className="container-lg">
          <motion.div {...fadeUp()} className="text-center mb-12">
            <div className="section-label mx-auto mb-4">FAQs</div>
            <h2 className="text-4xl font-heading font-700 text-[#1B3172] mb-4">
              Partner <span className="gradient-text">Questions</span>
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
    </main>
  );
}
