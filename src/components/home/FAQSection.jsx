import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Plus, Minus, Phone } from 'lucide-react';
import { HOMEPAGE, PHONE_TEL } from '../../data/siteData';

const FAQS = HOMEPAGE.faq.items;

function FAQItem({ faq, isOpen, onToggle }) {
  return (
    <div className="border-t-2 border-[#0D246A]/15 last:border-b-2">
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between gap-4 py-5 text-left cursor-pointer group"
      >
        <span className="font-heading font-600 text-[#0D246A] text-lg leading-snug pr-2">
          {faq.q}
        </span>
        <span
          className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-200 ${isOpen ? 'bg-[#F0D030]' : 'bg-[#F3F2EC] group-hover:bg-[#E8E7DF]'}`}
        >
          {isOpen
            ? <Minus className="w-4 h-4 text-[#0D246A]" aria-hidden="true" />
            : <Plus className="w-4 h-4 text-[#0D246A]" aria-hidden="true" />
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
        <p className="pb-6 pr-12 text-[#3F4A6B] text-base leading-relaxed">
          {faq.a}
        </p>
      </div>
    </div>
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
    <section className="section-pad bg-white">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <div className="container-xl grid lg:grid-cols-[1fr_1.6fr] gap-10 lg:gap-20">
        <div className="lg:sticky lg:top-32 self-start">
          <div className="section-label">FAQ</div>
          <h2 className="text-4xl lg:text-6xl font-heading font-800 mb-5 leading-[1.03]">
            Questions We Hear{' '}
            <span className="gradient-text">Every Week</span>
          </h2>
          <p className="text-[#3F4A6B] text-lg mb-8">
            Straight answers: no jargon, no sales spin.
          </p>
          <p className="text-[#3F4A6B] text-sm mb-3">Still have questions?</p>
          <a href={PHONE_TEL} className="btn-primary">
            <Phone className="w-4 h-4" aria-hidden="true" />
            Call Us: (908) 639-5666
          </a>
        </div>

        <div>
          {FAQS.map((faq, i) => (
            <FAQItem
              key={i}
              faq={faq}
              isOpen={openIndex === i}
              onToggle={() => toggle(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
