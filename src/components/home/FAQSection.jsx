import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const FAQS = [
  {
    q: 'What exactly is a Growth Audit and is it really free?',
    a: 'Yes — completely free, no strings attached. A Growth Audit is a 30-minute deep-dive into your business\'s digital presence. We review your website, Google Business Profile, online reviews, social media, competitor positioning, and lead capture systems. At the end, you get a prioritized action list you can implement yourself or hire us to execute. No credit card, no sales pressure.',
  },
  {
    q: 'How is Novelio different from a regular web design agency?',
    a: 'Most agencies hand you a website and disappear. We diagnose your entire growth picture first — website, local SEO, lead follow-up, automation, branding — then build a system that works together. We measure success by leads and revenue generated, not just deliverables handed off. Think of us as a growth partner, not a vendor.',
  },
  {
    q: 'Do you only build websites or handle other business problems too?',
    a: 'We handle the full spectrum: website design and development, Google Business Profile optimization, local SEO, lead generation funnels, marketing automation, branding, tech-ops integrations, email marketing, and email list validation. If it impacts how customers find, trust, and buy from you — we cover it.',
  },
  {
    q: 'How long before I see results?',
    a: 'Most clients see measurable improvements within 30–60 days. Quick wins like Google profile optimization and review generation can show results in days. SEO and lead nurture systems typically compound over 60–90 days. We set realistic timelines in your Growth Plan so there are no surprises.',
  },
  {
    q: 'What does it cost and are there long-term contracts?',
    a: 'Pricing depends on which services you need and your business size. We don\'t believe in locking clients into long-term contracts — our work speaks for itself. Most clients start with a single project or a 3-month engagement, then continue because they see ROI. Pricing is transparent and discussed after your free audit.',
  },
  {
    q: 'Do you work with businesses outside New Jersey?',
    a: 'Absolutely. We work with small businesses across all 50 US states. While we started in New Jersey, our team is fully remote and our clients span Texas, Florida, California, and beyond. As long as you\'re a US-based business, we\'re your partner.',
  },
];

function FAQItem({ faq, index, isOpen, onToggle }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      viewport={{ once: true }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: isOpen ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.82)',
        border: isOpen ? '1px solid rgba(107,63,160,0.22)' : '1px solid rgba(29,78,216,0.1)',
        boxShadow: isOpen ? '0 8px 32px rgba(107,63,160,0.12)' : '0 2px 12px rgba(27,49,114,0.06)',
        backdropFilter: 'blur(16px)',
        transition: 'all 0.3s ease',
      }}
    >
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <span className="font-heading font-600 text-[#1B3172] text-[15px] leading-snug pr-2">
          {faq.q}
        </span>
        <span
          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300"
          style={{
            background: isOpen ? 'linear-gradient(135deg, #6B3FA0, #1D4ED8)' : 'rgba(27,49,114,0.08)',
          }}
        >
          {isOpen
            ? <Minus className="w-4 h-4 text-white" />
            : <Plus className="w-4 h-4 text-[#1B3172]" />
          }
        </span>
      </button>

      {/* Answer always in DOM for SEO; height animated via CSS */}
      <div
        style={{
          maxHeight: isOpen ? '400px' : '0px',
          overflow: 'hidden',
          transition: 'max-height 0.35s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        <p className="px-6 pb-5 text-[#475569] text-[15px] leading-relaxed">
          {faq.a}
        </p>
      </div>
    </motion.div>
  );
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section className="section-pad bg-[#EEF2FF] relative overflow-hidden">
      <div className="orb orb-blue w-[480px] h-[480px] -top-48 -right-48 opacity-5" />
      <div className="orb orb-purple w-[320px] h-[320px] -bottom-32 -left-32 opacity-5" />

      <div className="container-xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="section-label mx-auto mb-4">FAQ</div>
          <h2 className="text-4xl lg:text-5xl font-heading font-700 text-[#1B3172] mb-4 leading-tight">
            Questions We Hear{' '}
            <span className="gradient-text">Every Week</span>
          </h2>
          <p className="text-[#475569] text-lg max-w-xl mx-auto">
            Straight answers — no jargon, no sales spin.
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-3">
          {FAQS.map((faq, i) => (
            <FAQItem
              key={i}
              faq={faq}
              index={i}
              isOpen={openIndex === i}
              onToggle={() => toggle(i)}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-[#64748b] text-sm mb-4">Still have questions?</p>
          <a
            href="tel:+19082012264"
            className="btn-primary inline-flex"
          >
            Call Us — (908) 201-2264
          </a>
        </motion.div>
      </div>
    </section>
  );
}
