import { Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import BrandMark from '../shared/BrandMark';
import { PHONE_TEL } from '../../data/siteData';

const PROOF = [
  { label: '200+', sub: 'Businesses Served' },
  { label: '12+', sub: 'Years Experience' },
  { label: 'Free', sub: '30-Min Growth Audit' },
];

export default function CTABanner() {
  return (
    <section
      className="on-dark section-pad relative overflow-hidden text-white"
      style={{ background: 'linear-gradient(120deg, #5E328C 0%, #42499D 100%)' }}
    >
      <BrandMark
        animate={false}
        className="absolute -right-24 top-1/2 -translate-y-1/2 w-[760px] max-w-none opacity-[0.16] pointer-events-none hidden md:block"
      />

      <div className="container-xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true }}
          className="max-w-3xl"
        >
          <p className="inline-flex items-center gap-2 text-white text-sm font-500 mb-6">
            <span className="w-2 h-2 rounded-full bg-[#F0D030]" aria-hidden="true" />
            Limited spots available this month
          </p>

          <h2 className="text-5xl lg:text-7xl font-heading font-800 text-white mb-6 leading-[1.02]">
            Ready to See What&apos;s{' '}
            <span className="text-[#F0D030]">Holding Your Business Back?</span>
          </h2>

          <p className="text-white text-lg sm:text-xl max-w-2xl mb-9 leading-relaxed">
            Takes 30 minutes. No credit card. No sales pitch. Just an honest look at your business.
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-12">
            <a href={PHONE_TEL} className="btn-primary text-lg px-8 py-4 justify-center">
              <Phone className="w-5 h-5" aria-hidden="true" />
              Call Us Now
            </a>
            <p className="text-white/90 text-sm text-center sm:text-left">
              Call us directly:{' '}
              <a href={PHONE_TEL} className="text-white font-600 underline underline-offset-4">(908) 639-5666</a>
            </p>
          </div>

          <div className="flex flex-wrap gap-x-10 gap-y-5">
            {PROOF.map((b) => (
              <div key={b.sub}>
                <div className="text-3xl font-heading font-800 text-white leading-none">{b.label}</div>
                <div className="text-white/85 text-sm mt-1.5">{b.sub}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
