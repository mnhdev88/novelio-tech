import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { HOMEPAGE, PHONE_TEL } from '../../data/siteData';

const FAQS = HOMEPAGE.faq.items;


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
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left cursor-pointer"
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

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  };

  return (
    <section className="section-pad bg-[#EEF2FF] relative overflow-hidden">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>
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
            href={PHONE_TEL}
            className="btn-primary inline-flex"
          >
            Call Us — (908) 639-5666
          </a>
        </motion.div>
      </div>
    </section>
  );
}
