import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Eye, ShieldCheck, MousePointerClick, ArrowRight,
  Search, Compass, Layers, Map as MapIcon,
  FormInput, LineChart, Zap, Star, Rocket,
} from 'lucide-react';

// "An SMB needs three things to grow: visibility, trust, and conversion."
const PILLARS = [
  {
    icon: Eye,
    title: 'Visibility',
    desc: 'Customers can find you on Google, Maps and social media — instead of your business depending only on referrals and personal contacts.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: ShieldCheck,
    title: 'Trust',
    desc: 'A proper website with reviews, case studies, your process and your team makes prospects feel you are serious and reliable — before they ever call.',
    color: 'from-violet-600 to-blue-600',
  },
  {
    icon: MousePointerClick,
    title: 'Conversion',
    desc: 'Every visitor gets a clear next step — forms, call buttons, WhatsApp, booking links — connected to a CRM and follow-up system so leads turn into sales.',
    color: 'from-amber-500 to-orange-500',
  },
];

// What growth-focused website development must cover.
const COVERS = [
  { icon: Compass, title: 'Brand positioning', desc: 'Who you are, what you do, and why customers should trust you.' },
  { icon: Layers, title: 'Service presentation', desc: 'Clear service pages with benefits, not just features.' },
  { icon: MapIcon, title: 'Customer journey', desc: 'A visitor should know what to do next on every page.' },
  { icon: FormInput, title: 'Lead generation', desc: 'Forms, WhatsApp, call buttons, booking links, and quote requests.' },
  { icon: Search, title: 'SEO foundation', desc: 'Titles, descriptions, keywords, internal linking, speed, and mobile readiness.' },
  { icon: Star, title: 'Trust elements', desc: 'Reviews, testimonials, certifications, case studies, team, and business details.' },
  { icon: MousePointerClick, title: 'Conversion system', desc: 'Strong CTAs, landing pages, thank-you pages, tracking, and follow-up connection.' },
  { icon: LineChart, title: 'Analytics & tracking', desc: 'Google Analytics, Meta Pixel, Google Search Console, and event tracking.' },
  { icon: Zap, title: 'Automation support', desc: 'CRM, email auto-reply, WhatsApp follow-up, and lead notifications.' },
  { icon: Rocket, title: 'Business scalability', desc: 'Room to add blogs, ads, landing pages, calculators, downloads, and customer portals.' },
];

export default function GrowthFramework() {
  return (
    <section className="section-pad bg-white relative overflow-hidden">
      <div className="dot-grid absolute inset-0 opacity-30" />
      <div className="container-xl relative z-10">
        <div className="text-center mb-14">
          <div className="section-label mx-auto mb-4">The Growth Framework</div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-800 text-[#1B3172] leading-tight">
            A Small Business Needs Three Things to Grow:{' '}
            <span className="gradient-text">Visibility, Trust & Conversion</span>
          </h2>
          <p className="text-[#64748b] text-base sm:text-lg mt-5 max-w-3xl mx-auto leading-relaxed">
            A normal website is only a brochure. A growth website is part of your sales funnel —
            it attracts, educates, builds trust, and converts visitors into leads. Here is how we
            make your website support all three.
          </p>
        </div>

        {/* Three pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {PILLARS.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="rounded-2xl bg-[#f8faff] border border-slate-200 p-7 hover:shadow-[0_8px_32px_rgba(27,49,114,0.12)] hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${p.color} flex items-center justify-center mb-5`}>
                <p.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-[#1B3172] font-heading font-700 text-xl mb-2">{p.title}</h3>
              <p className="text-[#64748b] text-sm leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* What website development covers */}
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="section-label mx-auto mb-4">Beyond a Brochure</div>
            <h3 className="text-2xl sm:text-3xl font-heading font-800 text-[#1B3172]">
              What a Growth Website <span className="gradient-text">Must Cover</span>
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {COVERS.map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: (i % 5) * 0.06 }}
                viewport={{ once: true }}
                className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-brand-purple/40 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-9 h-9 rounded-xl bg-[#EEF2FF] flex items-center justify-center mb-3">
                  <c.icon className="w-[18px] h-[18px] text-[#1B3172]" />
                </div>
                <h4 className="text-[#1B3172] font-heading font-700 text-sm mb-1.5 leading-snug">{c.title}</h4>
                <p className="text-[#64748b] text-xs leading-relaxed">{c.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-[#64748b] text-sm max-w-2xl mx-auto mb-6 leading-relaxed">
              A normal website is only a brochure. A growth website attracts, educates, builds trust,
              and converts visitors into leads — and it is included free with every Novelio growth plan.
            </p>
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#1B3172] hover:bg-[#0d1f5c] text-white text-sm font-semibold transition-all"
            >
              See Growth Plans — Website Included Free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
