import { SERVICES } from '../../data/siteData';
import { Code2, MapPin, TrendingUp, Zap, Palette, Settings, Mail, CheckSquare } from 'lucide-react';

const ICON_MAP = { Code2, MapPin, TrendingUp, Zap, Palette, Settings, Mail, CheckSquare };
const items = [...SERVICES, ...SERVICES, ...SERVICES];
const itemsRev = [...SERVICES, ...SERVICES, ...SERVICES].reverse();

function Track({ data, reverse = false }) {
  return (
    <div className="overflow-hidden relative">
      {/* edge fade left */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-32 z-10"
        style={{ background: 'linear-gradient(to right, #EEF2FF, transparent)' }} />
      {/* edge fade right */}
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-32 z-10"
        style={{ background: 'linear-gradient(to left, #EEF2FF, transparent)' }} />

      <div className={`flex gap-4 py-2 ${reverse ? 'animate-marquee-reverse' : 'animate-marquee'}`}
        style={{ width: 'max-content' }}>
        {data.map((s, i) => {
          const Icon = ICON_MAP[s.icon] || Code2;
          return (
            <div key={i}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl flex-shrink-0 group cursor-default"
              style={{
                background: 'rgba(255,255,255,0.75)',
                border: '1px solid rgba(29,78,216,0.12)',
                boxShadow: '0 2px 12px rgba(27,49,114,0.06)',
                backdropFilter: 'blur(12px)',
              }}>
              <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center flex-shrink-0 shadow-sm`}
                style={{ boxShadow: '0 0 12px rgba(107,63,160,0.25)' }}>
                <Icon className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-[#334155] font-heading font-600 text-xs whitespace-nowrap">{s.title}</span>
              <span className="text-[#C7D2FE] text-sm ml-0.5">✦</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ServicesMarquee() {
  return (
    <div className="py-4 bg-[#EEF2FF] border-y border-slate-200/80 space-y-2 overflow-hidden">
      <Track data={items} />
      <Track data={itemsRev} reverse />
    </div>
  );
}
