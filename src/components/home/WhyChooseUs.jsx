import { motion } from 'framer-motion';
import { BarChart2, Users, Eye, Target, ArrowUp } from 'lucide-react';

const pillars = [
  { icon: BarChart2, title: 'Diagnose First',       desc: 'We run a free audit before we propose a single solution. No guessing, no upselling. You see the gaps before we talk about fixes.',            color: 'from-purple-600 to-blue-600',   bar: 100 },
  { icon: Users,     title: 'Full-Spectrum View',   desc: 'Website, Google listing, leads, automation, branding, hosting, and operations — we look at all of it, not just the part we sell.',           color: 'from-pink-600 to-orange-500',  bar: 100 },
  { icon: Eye,       title: 'Accountable Partner',  desc: 'Monthly reviews, clear KPIs, and transparent reporting. You always know what your investment is doing — and we stand behind the numbers.',    color: 'from-cyan-500 to-blue-600',    bar: 100 },
  { icon: Target,    title: 'No Heavy Upfront Cost', desc: 'Your website, SSL, hosting and lead capture are included free with one transparent monthly growth plan — no $3,000 project invoice, no hidden fees.',   color: 'from-emerald-500 to-cyan-600', bar: 100 },
];

const metrics = [
  { label: 'Organic Traffic',  pct: 85,  color: 'from-[#6B3FA0] to-[#0EA5E9]', val: '+85%' },
  { label: 'Conversions',      pct: 72,  color: 'from-[#EC4899] to-[#F97316]', val: '+72%' },
  { label: 'Revenue Growth',   pct: 93,  color: 'from-[#22C55E] to-[#0EA5E9]', val: '+93%' },
  { label: 'ROI',              pct: 96,  color: 'from-[#F59E0B] to-[#F97316]', val: '+340%' },
];

export default function WhyChooseUs() {
  return (
    <section className="section-pad bg-dark relative overflow-hidden">
      <div className="orb orb-cyan w-[500px] h-[500px] -bottom-64 -left-64 opacity-8" />
      <div className="orb orb-purple w-[400px] h-[400px] -top-32 -right-32 opacity-6" />

      {/* Diagonal line grid */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none" preserveAspectRatio="none">
        <defs>
          <pattern id="diag" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M0 40 L40 0" stroke="#6B3FA0" strokeWidth="0.8" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#diag)" />
      </svg>

      <div className="container-xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left — pillars */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <div className="section-label mb-4">The Novelio Difference</div>
            <h2 className="text-4xl lg:text-5xl font-heading font-700 text-[#1B3172] mb-6 leading-tight">
              We Don't Sell Services. <span className="gradient-text">We Build Growth Systems.</span>
            </h2>
            <p className="text-[#475569] text-lg leading-relaxed mb-10">
              Unlike agencies that hand you a deliverable and disappear, Novelio acts as your ongoing growth partner. We look at every touchpoint your customers experience — and take responsibility for results, not just deliverables.
            </p>

            <div className="space-y-5">
              {pillars.map((p, i) => {
                const Icon = p.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -24 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ x: 4 }}
                    className="flex gap-4 p-4 rounded-2xl group transition-all duration-300 cursor-default"
                    style={{
                      background: 'rgba(255,255,255,0.6)',
                      border: '1px solid rgba(29,78,216,0.1)',
                      backdropFilter: 'blur(12px)',
                      boxShadow: '0 2px 12px rgba(27,49,114,0.05)',
                    }}
                  >
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center flex-shrink-0
                      group-hover:scale-110 transition-transform duration-300`}
                      style={{ boxShadow: '0 4px 16px rgba(107,63,160,0.3)' }}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <h4 className="text-[#1B3172] font-heading font-600 text-base">{p.title}</h4>
                        <span className="text-xs font-700 gradient-text ml-2 flex-shrink-0">{p.bar}%</span>
                      </div>
                      <p className="text-[#64748b] text-sm leading-relaxed mb-2">{p.desc}</p>
                      {/* Mini progress bar */}
                      <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full w-full origin-left bg-gradient-to-r ${p.color} rounded-full`}
                          initial={{ scaleX: 0 }}
                          whileInView={{ scaleX: p.bar / 100 }}
                          transition={{ duration: 1.1, delay: 0.3 + i * 0.1, ease: 'easeOut' }}
                          viewport={{ once: true }}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Right — dashboard visual */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Main dashboard card */}
            <div className="rounded-3xl p-6 relative overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.92)',
                border: '1px solid rgba(29,78,216,0.13)',
                boxShadow: '0 20px 64px rgba(27,49,114,0.14)',
                backdropFilter: 'blur(20px)',
              }}>

              {/* Window chrome */}
              <div className="flex items-center gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <div className="flex-1 ml-3 h-6 rounded-lg bg-slate-100 flex items-center px-3">
                  <span className="text-xs text-[#64748b]">analytics.noveliotech.com</span>
                </div>
              </div>

              {/* Mini sparkline SVG */}
              <div className="mb-5 rounded-xl overflow-hidden"
                style={{ background: 'linear-gradient(135deg, rgba(107,63,160,0.06) 0%, rgba(29,78,216,0.06) 100%)', border: '1px solid rgba(107,63,160,0.1)' }}>
                <svg viewBox="0 0 280 80" className="w-full" fill="none">
                  <defs>
                    <linearGradient id="sgfill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6B3FA0" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#6B3FA0" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,70 L20,60 L50,55 L80,48 L110,40 L140,32 L170,22 L200,15 L230,10 L260,8 L280,6 L280,80 L0,80 Z"
                    fill="url(#sgfill)" />
                  <path d="M0,70 L20,60 L50,55 L80,48 L110,40 L140,32 L170,22 L200,15 L230,10 L260,8 L280,6"
                    stroke="#6B3FA0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <animate attributeName="stroke-dasharray" from="0,1000" to="1000,0" dur="2s" begin="0.5s" fill="freeze" />
                  </path>
                  {/* Endpoint dot */}
                  <circle cx="280" cy="6" r="5" fill="#6B3FA0">
                    <animate attributeName="r" values="4;7;4" dur="2s" begin="2.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="1;0.5;1" dur="2s" begin="2.5s" repeatCount="indefinite" />
                  </circle>
                </svg>
              </div>

              {/* Metric bars */}
              <div className="space-y-4">
                {metrics.map((m, i) => (
                  <div key={m.label} className="flex items-center gap-3">
                    <span className="text-xs text-[#64748b] w-24 flex-shrink-0">{m.label}</span>
                    <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full bg-gradient-to-r ${m.color} rounded-full relative`}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${m.pct}%` }}
                        transition={{ duration: 1.2, delay: 0.4 + i * 0.12, ease: 'easeOut' }}
                        viewport={{ once: true }}
                      >
                        {/* Glow tip */}
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white blur-[2px]" />
                      </motion.div>
                    </div>
                    <motion.span
                      className="text-xs font-700 text-emerald-600 w-12 text-right flex-shrink-0"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 0.4, delay: 1.2 + i * 0.1 }}
                      viewport={{ once: true }}
                    >
                      {m.val}
                    </motion.span>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-[#64748b]">Average client results after 6 months</span>
                <span className="text-xs font-600 text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Illustrative
                </span>
              </div>
            </div>

            {/* Floating rating badge */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-6 -right-6 rounded-2xl px-5 py-3"
              style={{
                background: 'rgba(255,255,255,0.96)',
                border: '1px solid rgba(107,63,160,0.2)',
                boxShadow: '0 8px 32px rgba(107,63,160,0.2)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <div className="text-xl font-heading font-800 gradient-text">4.9 / 5</div>
              <div className="text-xs text-[#64748b]">Client Rating</div>
            </motion.div>

            {/* Floating notification */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 1.2 }}
              viewport={{ once: true }}
              animate={{ y: [0, 6, 0] }}
              className="absolute -bottom-6 -left-6 rounded-2xl px-4 py-3 flex items-center gap-3"
              style={{
                background: 'rgba(255,255,255,0.96)',
                border: '1px solid rgba(34,197,94,0.25)',
                boxShadow: '0 8px 24px rgba(34,197,94,0.15)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                <ArrowUp className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-[#1B3172] text-xs font-700">New Lead Converted</div>
                <div className="text-[#64748b] text-[11px]">2 minutes ago</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
