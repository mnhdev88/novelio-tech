import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';
import FreeWebsiteModal from '../FreeWebsiteModal';
import { HOMEPAGE } from '../../data/siteData';

const BENEFITS = HOMEPAGE.freeWebsiteCTA.benefits;

// Benefits of starting with the free optimized website setup.
// The one full-yellow moment on the page: the offer should be impossible to scroll past.

export default function FreeWebsiteCTA() {
  const [showOffer, setShowOffer] = useState(false);

  return (
    <section className="bg-[#F0D030] text-[#0D246A]">
      <div className="container-xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center py-16 lg:py-24"
        >
          <div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-800 leading-[1.03] mb-5">
              Start With a Free Optimized Website Setup
            </h2>
            <p className="text-lg leading-relaxed mb-8 max-w-lg">
              You don&apos;t need a big upfront website investment to start building your online
              growth system.
            </p>

            <button
              type="button"
              onClick={() => setShowOffer(true)}
              className="group inline-flex items-center gap-2 font-heading font-700 px-8 py-4 rounded-[14px] text-base bg-[#0D246A] text-white hover:bg-[#081648] transition-colors duration-200 cursor-pointer"
            >
              Claim My Free Website Setup
              <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
            </button>

            <p className="text-sm font-500 mt-4">
              Limited setup slots available for small businesses.
            </p>
          </div>

          <ul className="list-none p-0 m-0">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-start gap-3 py-3.5 border-t-2 border-[#0D246A]/20 font-500 text-base sm:text-lg leading-snug">
                <span className="w-6 h-6 rounded-full bg-[#0D246A] flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 text-[#F0D030]" strokeWidth={3} aria-hidden="true" />
                </span>
                {b}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {showOffer && <FreeWebsiteModal onClose={() => setShowOffer(false)} />}
    </section>
  );
}
