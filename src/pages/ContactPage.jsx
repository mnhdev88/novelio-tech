import SEO from '../components/SEO';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MessageCircle, Send, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { COMPANY } from '../data/siteData';
import { trackEvent } from '../utils/analytics';

const faqs = [
  { q: 'How long does it take to get started?', a: 'After our initial consultation and contract signing, most projects kick off within 3–5 business days.' },
  { q: 'What is your pricing model?', a: 'We offer monthly retainers and project-based pricing depending on the service. Contact us for a custom quote tailored to your goals.' },
  { q: 'Do you work with international clients?', a: 'Yes — we work with clients across North America, UK, Middle East, and South Asia. We accommodate different time zones.' },
  { q: 'Is there a minimum contract length?', a: 'Most of our retainer services have a 3-month minimum to give strategies enough time to show results. Project work is one-off.' },
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

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', source: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
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
      trackEvent('generate_lead', { form: 'contact' });
      setSuccess(true);
    } catch {
      setErrors({ submit: 'Something went wrong. Please try again or email us directly at info@noveliotech.com.' });
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
        title="Contact Us — Get Your Free Growth Audit"
        description="Book your free 30-minute Growth Audit with Novelio. No obligation, no credit card. We analyze your website, Google listing, leads, and more."
        canonical="/contact"
      />
      {/* Hero */}
      <section className="section-pad-sm relative overflow-hidden bg-dark">
        <div className="orb orb-purple w-[500px] h-[500px] -top-48 -left-48 opacity-15" />
        <div className="dot-grid absolute inset-0 opacity-40" />
        <div className="container-xl relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="section-label mx-auto mb-4">Get In Touch</div>
            <h1 className="text-5xl lg:text-7xl font-heading font-800 text-[#1B3172] mb-6 leading-tight">
              Let's Talk About <span className="gradient-text">Your Growth</span>
            </h1>
            <p className="text-[#475569] text-xl max-w-2xl mx-auto">
              Ready to dominate your market? Fill out the form below and we'll be in touch within 24 hours.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact cards */}
      <section className="py-12 bg-[#EEF2FF]">
        <div className="container-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: Phone, label: 'Call Us', value: COMPANY.phone, sub: 'Mon–Fri, 9am–6pm EST', href: `tel:${COMPANY.phone}`, color: 'from-brand-purple to-brand-blue' },
              { icon: MessageCircle, label: 'WhatsApp', value: 'Chat with us 24/7', sub: 'Instant response', href: `https://wa.me/${COMPANY.whatsapp}`, color: 'from-[#128C7E] to-[#25D366]' },
              { icon: Mail, label: 'Email Us', value: COMPANY.email, sub: 'Response within 24 hrs', href: `mailto:${COMPANY.email}`, color: 'from-brand-blue to-brand-cyan' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.a key={i} href={item.href} target={i === 1 ? '_blank' : undefined} rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="glass-card gradient-border rounded-2xl p-7 flex items-center gap-5 group hover:-translate-y-1 hover:shadow-glow transition-all duration-300">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-glow`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-[#64748b] text-xs uppercase tracking-widest font-medium mb-1">{item.label}</div>
                    <div className="text-[#1B3172] font-heading font-600 text-[15px] mb-0.5">{item.value}</div>
                    <div className="text-[#64748b] text-xs">{item.sub}</div>
                  </div>
                </motion.a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main form */}
      <section className="section-pad bg-dark relative overflow-hidden">
        <div className="orb orb-blue w-[500px] h-[500px] -bottom-64 -right-64 opacity-10" />
        <div className="container-lg relative z-10">
          <div className="grid lg:grid-cols-5 gap-12">

            {/* Left sidebar */}
            <div className="lg:col-span-2">
              <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
                <h2 className="text-3xl font-heading font-700 text-[#1B3172] mb-4">
                  Ready to <span className="gradient-text">Get Started?</span>
                </h2>
                <p className="text-[#475569] leading-relaxed mb-8">
                  Tell us about your business and goals. We'll put together a custom strategy and get back to you within 24 hours.
                </p>
                <div className="space-y-5 mb-8">
                  {[
                    { icon: Check, text: 'Free initial consultation' },
                    { icon: Check, text: 'Custom strategy proposal' },
                    { icon: Check, text: 'No obligation, no pressure' },
                    { icon: Check, text: 'Response within 24 hours' },
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-[#475569] text-sm">{item.text}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Office hours */}
                <div className="glass-card gradient-border rounded-2xl p-5">
                  <h4 className="text-[#1B3172] font-heading font-600 mb-3">Office Hours</h4>
                  <div className="space-y-2 text-sm text-[#475569]">
                    <div className="flex justify-between"><span>Monday – Friday</span><span className="text-[#1B3172]">9:00 AM – 6:00 PM EST</span></div>
                    <div className="flex justify-between"><span>Saturday</span><span className="text-[#1B3172]">10:00 AM – 2:00 PM EST</span></div>
                    <div className="flex justify-between"><span>WhatsApp Support</span><span className="text-emerald-400">24/7</span></div>
                  </div>
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
                      <h3 className="text-[#1B3172] font-heading font-700 text-2xl mb-3">Message Sent!</h3>
                      <p className="text-[#475569] max-w-xs mx-auto">
                        Thank you! We'll review your request and get back to you within 24 hours.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} noValidate className="space-y-5">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-[#475569] uppercase tracking-widest mb-2">Full Name *</label>
                          <input type="text" value={form.name} onChange={handleChange('name')} placeholder="John Smith" className={inputClass('name')} />
                          {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[#475569] uppercase tracking-widest mb-2">Email Address *</label>
                          <input type="email" value={form.email} onChange={handleChange('email')} placeholder="john@company.com" className={inputClass('email')} />
                          {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[#475569] uppercase tracking-widest mb-2">Phone Number</label>
                          <input type="tel" value={form.phone} onChange={handleChange('phone')} placeholder="+1 (555) 000-0000" className={inputClass('phone')} />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[#475569] uppercase tracking-widest mb-2">Company Name</label>
                          <input type="text" value={form.company} onChange={handleChange('company')} placeholder="Your Company" className={inputClass('company')} />
                        </div>
                      </div>

                      {errors.submit && <p className="text-red-400 text-sm">{errors.submit}</p>}

                      <button type="submit" disabled={submitting}
                        className="btn-primary w-full justify-center text-base py-4 disabled:opacity-60 disabled:cursor-not-allowed">
                        {submitting ? (
                          <>
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5" />
                            Send My Inquiry
                          </>
                        )}
                      </button>

                      <p className="text-center text-xs text-[#64748b]">
                        By submitting this form you agree to our{' '}
                        <a href="/privacy" className="text-brand-purple hover:underline">Privacy Policy</a>.
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

      {/* FAQ */}
      <section className="section-pad bg-[#EEF2FF] relative overflow-hidden">
        <div className="container-lg">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}
            className="text-center mb-12">
            <div className="section-label mx-auto mb-4">FAQs</div>
            <h2 className="text-4xl font-heading font-700 text-[#1B3172] mb-4">
              Quick <span className="gradient-text">Answers</span>
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
    </main>
  );
}
