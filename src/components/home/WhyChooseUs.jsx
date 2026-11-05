import { motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { HOMEPAGE } from '../../data/siteData';
import { spectrumAt } from '../shared/spectrum';

const pillars = HOMEPAGE.whyChooseUs.pillars;
const metrics = HOMEPAGE.whyChooseUs.metrics;

// Colours for the pillar icons: red, green, blue, violet, spaced across the spectrum.
const PILLAR_STEPS = [0, 4, 6, 8];

export default function WhyChooseUs() {
  return (
    <section className="section-pad bg-[#FBFAF6] overflow-hidden">
      <div className="container-xl">
        <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">

          {/* Left — pillars */}
          <div>
            <div className="section-label">The Novelio Difference</div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-800 mb-6 leading-[1.05]">
              We Don&apos;t Sell Services. <span className="gradient-text">We Build Growth Systems.</span>
            </h2>
            <p className="text-[#3F4A6B] text-lg leading-relaxed mb-8">
              Unlike agencies that hand you a deliverable and disappear, Novelio acts as your ongoing growth partner. We look at every touchpoint your customers experience, and take responsibility for results, not just deliverables.
            </p>

            <div>
              {pillars.map((p, i) => {
                const Icon = p.icon;
                const colour = spectrumAt(PILLAR_STEPS[i % PILLAR_STEPS.length]);
                return (
                  <div key={p.title} className="flex gap-4 py-5 border-t border-[#0D246A]/15">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: colour.fill, color: colour.fg }}
                    >
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-heading font-700 text-lg mb-1">{p.title}</h4>
                      <p className="text-[#3F4A6B] text-[15px] leading-relaxed">{p.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right — dashboard visual */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
            className="relative pt-6"
          >
            <div className="rounded-3xl p-6 pb-14 lg:p-8 lg:pb-14 bg-[#0D246A] text-white">
              {/* Window chrome */}
              <div className="flex items-center gap-2 mb-7">
                <div className="w-3 h-3 rounded-full bg-[#E02A2A]" />
                <div className="w-3 h-3 rounded-full bg-[#F0D030]" />
                <div className="w-3 h-3 rounded-full bg-[#0A924E]" />
                <div className="flex-1 ml-3 h-7 rounded-lg bg-white/10 flex items-center px-3 min-w-0">
                  <span className="text-xs text-white/80 truncate">analytics.noveliotech.com</span>
                </div>
              </div>

              <svg viewBox="0 0 280 80" className="w-full mb-7" fill="none" aria-hidden="true">
                <defs>
                  <linearGradient id="sgfill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F0D030" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#F0D030" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="sgline" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#E02A2A" />
                    <stop offset="45%" stopColor="#F0D030" />
                    <stop offset="100%" stopColor="#1391C4" />
                  </linearGradient>
                </defs>
                <path d="M0,70 L20,60 L50,55 L80,48 L110,40 L140,32 L170,22 L200,15 L230,10 L260,8 L276,6 L276,80 L0,80 Z" fill="url(#sgfill)" />
                <motion.path
                  d="M0,70 L20,60 L50,55 L80,48 L110,40 L140,32 L170,22 L200,15 L230,10 L260,8 L276,6"
                  stroke="url(#sgline)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  transition={{ duration: 1.4, ease: 'easeOut' }}
                  viewport={{ once: true }}
                />
                <circle cx="276" cy="6" r="4" fill="#ffffff" />
              </svg>

              {/* Metric bars */}
              <div className="space-y-4">
                {metrics.map((m, i) => (
                  <div key={m.label} className="flex items-center gap-3">
                    <span className="text-sm text-white/85 w-28 flex-shrink-0">{m.label}</span>
                    <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full w-full origin-left rounded-full"
                        style={{ background: spectrumAt(PILLAR_STEPS[i % PILLAR_STEPS.length] === 8 ? 3 : PILLAR_STEPS[i % PILLAR_STEPS.length]).fill }}
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: m.pct / 100 }}
                        transition={{ duration: 1, delay: 0.2 + i * 0.1, ease: 'easeOut' }}
                        viewport={{ once: true }}
                      />
                    </div>
                    <span className="font-heading text-base font-700 text-white w-14 text-right flex-shrink-0">
                      {m.val}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-7 pt-5 border-t border-white/15 flex flex-wrap items-center justify-between gap-3">
                <span className="text-sm text-white/85">Average client results after 6 months</span>
                <span className="text-xs font-600 text-[#0D246A] bg-white px-3 py-1 rounded-full">
                  Illustrative
                </span>
              </div>
            </div>

            {/* Rating badge */}
            <div className="absolute top-0 right-4 lg:-right-4 rounded-2xl px-5 py-3 bg-[#F0D030] text-[#0D246A] rotate-2">
              <div className="text-2xl font-heading font-800 leading-none">4.9 / 5</div>
              <div className="text-xs font-500 mt-1">Client Rating</div>
            </div>

            {/* Notification */}
            <div className="absolute -bottom-5 left-4 lg:-left-4 rounded-2xl px-4 py-3 flex items-center gap-3 bg-white border border-[#0D246A]/15 shadow-[0_10px_30px_rgba(8,22,72,0.18)]">
              <div className="w-8 h-8 rounded-xl bg-[#0A8547] flex items-center justify-center flex-shrink-0">
                <ArrowUp className="w-4 h-4 text-white" aria-hidden="true" />
              </div>
              <div>
                <div className="text-[#0D246A] text-xs font-700">New Lead Converted</div>
                <div className="text-[#5C6685] text-[11px]">2 minutes ago</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
