import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';
import FreeWebsiteModal from '../FreeWebsiteModal';
import { HOMEPAGE } from '../../data/siteData';

const BENEFITS = HOMEPAGE.freeWebsiteCTA.benefits;

// Benefits of starting with the free optimized website setup.

export default function FreeWebsiteCTA() {
  const [showOffer, setShowOffer] = useState(false);

  return (
    <section className="section-pad-sm bg-white">
      <div className="container-xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center rounded-3xl p-8 sm:p-12 text-white"
          style={{ background: 'linear-gradient(135deg, #1B3172 0%, #2a1a6e 55%, #6B3FA0 100%)' }}
        >
          {/* Copy + CTA */}
          <div>
            <h2 className="text-3xl sm:text-4xl font-heading font-800 leading-tight mb-4 text-white">
              Start With a Free Optimized Website Setup
            </h2>
            <p className="text-white/75 text-base sm:text-lg leading-relaxed mb-8 max-w-lg">
              You don&apos;t need a big upfront website investment to start building your online
              growth system.
            </p>

            <button
              type="button"
              onClick={() => setShowOffer(true)}
              className="inline-flex items-center gap-2 font-heading font-700 px-8 py-4 rounded-full text-[15px] bg-white text-[#6B3FA0] hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
              style={{ boxShadow: '0 8px 32px rgba(255,255,255,0.2)' }}
            >
              Claim My Free Website Setup
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <p className="text-white/55 text-sm mt-4">
              Limited setup slots available for small businesses.
            </p>
          </div>

          {/* Benefits checklist */}
          <div className="rounded-2xl bg-white/[0.06] border border-white/10 p-6 sm:p-7 backdrop-blur-sm">
            <div className="space-y-3.5">
              {BENEFITS.map((b) => (
                <div key={b} className="flex items-start gap-3 text-white/90 text-sm sm:text-base leading-snug">
                  <span className="w-5 h-5 rounded-full bg-emerald-400/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                  </span>
                  {b}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {showOffer && <FreeWebsiteModal onClose={() => setShowOffer(false)} />}
    </section>
  );
}
