import { ArrowRight } from 'lucide-react';
import { HOMEPAGE } from '../../data/siteData';

const CYCLE = HOMEPAGE.growthCycle.steps;

// "A customer does not buy in one step — they move through a journey."

export default function GrowthCycle() {
  return (
    <section className="section-pad-sm bg-[#f8faff]">
      <div className="container-xl">
        <div className="max-w-4xl mx-auto rounded-2xl bg-[#1B3172] text-white p-8 sm:p-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-heading font-800 mb-3 text-white">
            The Full Customer Growth Cycle
          </h2>
          <p className="text-white/70 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            A customer does not buy in one step — they move through a journey. If one step is weak,
            your business loses money.
          </p>

          <div className="flex flex-wrap justify-center gap-2.5 mt-8">
            {CYCLE.map((step, i) => (
              <div key={step} className="flex items-center gap-2.5">
                <span className="rounded-full bg-white/10 border border-white/15 px-3.5 py-1.5 text-xs sm:text-sm">
                  {step}
                </span>
                {i < CYCLE.length - 1 && (
                  <ArrowRight className="w-3.5 h-3.5 text-white/30 shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
