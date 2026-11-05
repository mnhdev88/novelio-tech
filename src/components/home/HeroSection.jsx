import { useState } from 'react';
import { ArrowRight, Check, Rocket } from 'lucide-react';
import { motion } from 'framer-motion';
import FreeWebsiteModal from '../FreeWebsiteModal';
import BrandMark from '../shared/BrandMark';
import { HOMEPAGE, COMPANY, PHONE_TEL } from '../../data/siteData';

const HERO = HOMEPAGE.hero;

const PROMISES = ['No lock-in', 'No risk', "No charges if you can't see the difference yourself"];

const STATS = [
  { value: '200+', label: 'Businesses Served' },
  { value: '12+', label: 'Years Experience' },
  { value: 'Free', label: 'Growth Audit' },
  { value: '30min', label: 'Avg Audit Time' },
];

export default function HeroSection() {
  const [showOffer, setShowOffer] = useState(false);

  return (
    <section className="on-dark relative overflow-hidden bg-[#081648] text-white pt-28 lg:pt-36">
      {/* Soft light behind the mark so the loop has something to glow against */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 55% 70% at 78% 42%, rgba(19,118,180,0.32) 0%, transparent 70%), radial-gradient(ellipse 40% 50% at 8% 95%, rgba(94,50,140,0.45) 0%, transparent 70%)' }}
      />

      <div className="container-xl relative z-10">
        <div className="grid lg:grid-cols-[1.08fr_1fr] gap-6 lg:gap-4 items-center pb-12 lg:pb-16">
          {/* The headline is deliberately not animated in: it is the LCP element. */}
          <div>
            <div className="section-label">{HERO.badge}</div>

            <h1 className="text-[2.75rem] sm:text-6xl xl:text-[4.75rem] font-heading font-800 text-white leading-[1.04] tracking-[-0.02em] mb-6">
              {HERO.headlineBefore}{' '}
              <button
                type="button"
                onClick={() => setShowOffer(true)}
                className="inline p-0 text-[#F0D030] cursor-pointer hover:underline decoration-[5px] underline-offset-8 text-left"
                style={{ font: 'inherit', letterSpacing: 'inherit' }}
              >
                {HERO.headlineHighlight}
              </button>
              {' '}{HERO.headlineAfter}
            </h1>

            <p className="font-heading font-600 text-lg sm:text-xl text-white mb-3">{HERO.tagline}</p>

            <p className="text-base sm:text-lg text-white/80 leading-relaxed max-w-xl mb-9">
              {HERO.subheadline}
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-7 mb-8">
              <button
                type="button"
                onClick={() => setShowOffer(true)}
                className="btn-primary group text-lg px-8 py-4 justify-center cursor-pointer"
              >
                <Rocket className="w-5 h-5" aria-hidden="true" />
                {HERO.ctaLabel}
                <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
              </button>
              <a href={PHONE_TEL} className="text-sm text-white/80 hover:text-white transition-colors text-center sm:text-left">
                {HERO.callPrompt} <span className="font-600 text-white underline underline-offset-4">Call {COMPANY.phone}</span>
              </a>
            </div>

            <ul className="flex flex-wrap gap-x-5 gap-y-2 list-none p-0 m-0">
              {PROMISES.map((promise) => (
                <li key={promise} className="inline-flex items-center gap-2 text-sm text-white/90">
                  <Check className="w-4 h-4 text-[#F0D030] flex-shrink-0" strokeWidth={3} aria-hidden="true" />
                  {promise}
                </li>
              ))}
            </ul>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <BrandMark className="w-full max-w-md mx-auto lg:max-w-none" />
          </motion.div>
        </div>
      </div>

      {/* Proof bar sits on the spectrum, closing the hero like the logo's underline */}
      <div className="relative z-10 border-t border-white/15">
        <div className="container-xl">
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {STATS.map((stat, i) => (
              <div
                key={stat.label}
                className={`py-6 lg:py-7 ${i % 2 === 1 ? 'pl-6 border-l border-white/15' : ''} ${i > 1 ? 'border-t lg:border-t-0 border-white/15' : ''} ${i > 0 ? 'lg:pl-8 lg:border-l lg:border-white/15' : ''}`}
              >
                <div className="font-heading font-800 text-3xl lg:text-4xl text-white leading-none">{stat.value}</div>
                <div className="text-sm text-white/75 mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="spectrum-strip relative z-10" style={{ height: 6 }} />

      {showOffer && <FreeWebsiteModal onClose={() => setShowOffer(false)} />}
    </section>
  );
}
