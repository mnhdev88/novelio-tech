import { motion } from 'framer-motion';
import { Globe, MapPin, Inbox, Puzzle } from 'lucide-react';

const PAIN_POINTS = [
  {
    icon: Globe,
    headline: 'Your website looks outdated or doesn\'t convert visitors',
    sub: 'Customers judge credibility in 3 seconds — an old site loses them forever.',
    color: 'from-rose-500 to-pink-600',
    stat: '3 sec',
    statLabel: 'to lose a visitor',
  },
  {
    icon: MapPin,
    headline: 'Your Google listing isn\'t optimized — you\'re invisible in local search',
    sub: '76% of people who search locally visit a business within 24 hours.',
    color: 'from-orange-500 to-amber-500',
    stat: '76%',
    statLabel: 'visit within 24 hrs',
  },
  {
    icon: Inbox,
    headline: 'You have no system to capture or follow up with leads',
    sub: 'Without automation, leads go cold and revenue walks out the door.',
    color: 'from-violet-500 to-purple-600',
    stat: '80%',
    statLabel: 'of leads go cold',
  },
  {
    icon: Puzzle,
    headline: 'Your tools don\'t talk to each other — you\'re doing double work',
    sub: 'Disconnected software costs the average SMB 10+ hours per week.',
    color: 'from-cyan-500 to-blue-600',
    stat: '10+hrs',
    statLabel: 'wasted per week',
  },
];

export default function ProblemStatement() {
  return (
    <section className="section-pad bg-dark relative overflow-hidden">
      <div className="orb orb-purple w-[500px] h-[500px] -top-48 -left-48 opacity-6" />
      <div className="orb orb-blue w-[400px] h-[400px] -bottom-32 -right-32 opacity-6" />

      {/* Warning-stripe top accent */}
      <div className="absolute top-0 left-0 right-0 h-0.5"
        style={{ background: 'linear-gradient(to right, transparent, #F97316, #FACC15, #EC4899, transparent)' }} />

      <div className="container-xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="section-label mx-auto mb-4" style={{ background: 'rgba(249,115,22,0.12)', borderColor: 'rgba(249,115,22,0.28)', color: '#F97316' }}>
            Sound Familiar?
          </div>
          <h2 className="text-4xl lg:text-5xl font-heading font-700 text-[#1B3172] mb-4 max-w-3xl mx-auto leading-tight">
            Most Small Businesses Are Losing Customers Online{' '}
            <span className="gradient-text">Without Knowing It</span>
          </h2>
          <p className="text-[#475569] text-lg max-w-xl mx-auto">
            If any of these sound familiar, your digital presence is working against you:
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {PAIN_POINTS.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
                className="rounded-2xl p-6 flex gap-4 relative overflow-hidden"
                style={{
                  background: 'rgba(255,255,255,0.88)',
                  border: '1px solid rgba(29,78,216,0.1)',
                  boxShadow: '0 4px 20px rgba(27,49,114,0.07)',
                  backdropFilter: 'blur(16px)',
                }}
              >
                {/* Left color accent bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${p.color} rounded-l-2xl`} />

                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center flex-shrink-0 ml-2`}
                  style={{ boxShadow: '0 4px 16px rgba(107,63,160,0.25)' }}>
                  <Icon className="w-5 h-5 text-white" />
                </div>

                <div className="flex-1">
                  <p className="text-[#1B3172] font-heading font-600 text-[15px] leading-snug mb-1.5">{p.headline}</p>
                  <p className="text-[#64748b] text-sm leading-relaxed">{p.sub}</p>
                </div>

                {/* Stat badge */}
                <div className="flex-shrink-0 text-right">
                  <div className={`text-lg font-heading font-800 bg-gradient-to-r ${p.color} bg-clip-text text-transparent`}>{p.stat}</div>
                  <div className="text-[#64748b] text-[10px] leading-tight">{p.statLabel}</div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bridge to solution */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium"
            style={{
              background: 'rgba(255,255,255,0.9)',
              border: '1px solid rgba(107,63,160,0.2)',
              boxShadow: '0 4px 16px rgba(107,63,160,0.1)',
              backdropFilter: 'blur(12px)',
            }}>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[#475569]">We identify and fix all of these in your</span>
            <span className="gradient-text font-700">Free 30-Min Growth Audit</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
