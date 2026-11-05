import { HOMEPAGE } from '../../data/siteData';
import { spectrumAt, SPECTRUM } from '../shared/spectrum';

const CYCLE = HOMEPAGE.growthCycle.steps;

// "A customer does not buy in one step — they move through a journey."
// Each step walks further along the logo's spectrum, so the journey reads as one
// unbroken line from the first touch to the referral.
const colourFor = (i) => spectrumAt(Math.round((i / Math.max(CYCLE.length - 1, 1)) * (SPECTRUM.length - 1)));

export default function GrowthCycle() {
  return (
    <section className="on-dark section-pad bg-[#0D246A] text-white">
      <div className="container-xl">
        <div className="grid lg:grid-cols-[1fr_1.4fr] gap-6 lg:gap-16 items-end mb-12">
          <h2 className="text-4xl sm:text-5xl font-heading font-800 text-white leading-[1.05]">
            The Full Customer Growth Cycle
          </h2>
          <p className="text-white/85 text-base sm:text-lg leading-relaxed">
            A customer does not buy in one step; they move through a journey. If one step is weak,
            your business loses money.
          </p>
        </div>

        <ol className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 list-none p-0 m-0">
          {CYCLE.map((step, i) => {
            const colour = colourFor(i);
            return (
              <li key={step} className="rounded-2xl p-4 lg:p-5 min-h-[112px] flex flex-col justify-between" style={{ background: colour.fill, color: colour.fg }}>
                <span className="font-heading font-700 text-sm">{String(i + 1).padStart(2, '0')}</span>
                <span className="font-heading font-700 text-lg leading-tight">{step}</span>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
