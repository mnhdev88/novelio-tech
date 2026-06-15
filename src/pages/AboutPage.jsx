import SEO from '../components/SEO';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Award, Heart, Lightbulb, Shield, Users, Target, ArrowRight } from 'lucide-react';
import { STATS } from '../data/siteData';
import CTABanner from '../components/home/CTABanner';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay },
  viewport: { once: true },
});

const milestones = [
  { year: '2014', title: 'Founded', desc: 'Novelio Technologies was founded with a vision to make enterprise-level digital marketing accessible to every business.' },
  { year: '2016', title: 'First 100 Clients', desc: 'Crossed the milestone of 100 satisfied clients across SEO, PPC, and web development services.' },
  { year: '2018', title: 'Google Partner', desc: 'Achieved Google Partner certification, recognizing our PPC expertise and client performance standards.' },
  { year: '2020', title: 'Global Expansion', desc: 'Expanded service delivery to clients across North America, UK, Middle East, and South Asia.' },
  { year: '2022', title: 'KPO Division Launch', desc: 'Launched our Knowledge Process Outsourcing division, adding research and data services to our portfolio.' },
  { year: '2024', title: '500+ Projects', desc: 'Delivered over 500 projects and counting. 200+ active clients. 50+ specialist team members.' },
];

// The 9-stage business growth framework we consult and deliver against.
const FRAMEWORK = [
  { stage: '01', module: 'Website', purpose: 'Trust and digital presence' },
  { stage: '02', module: 'SEO + Google Business Profile', purpose: 'Visibility and inquiry generation' },
  { stage: '03', module: 'Lead Capture + CRM', purpose: 'Track every inquiry' },
  { stage: '04', module: 'Sales Conversion System', purpose: 'Turn leads into customers' },
  { stage: '05', module: 'Delivery + SOP System', purpose: 'Deliver consistently' },
  { stage: '06', module: 'Invoicing + Payment Reminders', purpose: 'Protect cash flow' },
  { stage: '07', module: 'Customer Retention System', purpose: 'Repeat business' },
  { stage: '08', module: 'Reviews + Referrals', purpose: 'Trust and new leads' },
  { stage: '09', module: 'Dashboard + Automation', purpose: 'Scale with control' },
];

const values = [
  { icon: Shield, title: 'Integrity', desc: 'We operate with complete transparency. What we promise, we deliver.' },
  { icon: Lightbulb, title: 'Innovation', desc: 'Staying ahead of algorithms and trends to give our clients a competitive edge.' },
  { icon: Target, title: 'Results', desc: 'Every strategy is designed around measurable outcomes that impact your bottom line.' },
  { icon: Users, title: 'Collaboration', desc: 'We work as an extension of your team, not as an external vendor.' },
  { icon: Heart, title: 'Client-First', desc: 'Your success is our success. Your goals define our priorities.' },
  { icon: Award, title: 'Excellence', desc: 'We hold ourselves to the highest standards in every deliverable.' },
];

export default function AboutPage() {
  return (
    <main className="pt-20">
      <SEO
        title="About Us — Your Dedicated Business Growth Partner"
        description="Novelio Technologies LLC is a dedicated business growth partner serving 200+ small businesses worldwide. Learn our story, team, and values."
        canonical="/about"
      />
      {/* Hero */}
      <section className="section-pad relative overflow-hidden bg-dark">
        <div className="orb orb-purple w-[500px] h-[500px] -top-48 -left-48 opacity-15" />
        <div className="orb orb-cyan w-[400px] h-[400px] -bottom-48 -right-48 opacity-10" />
        <div className="dot-grid absolute inset-0 opacity-40" />
        <div className="container-xl relative z-10 text-center">
          <motion.div {...fadeUp(0)}>
            <div className="section-label mx-auto mb-4">About Us</div>
            <h1 className="text-5xl lg:text-7xl font-heading font-800 text-[#1B3172] mb-6 leading-tight">
              Building Digital <span className="gradient-text">Success Stories</span>
            </h1>
            <p className="text-[#475569] text-xl max-w-3xl mx-auto leading-relaxed">
              We're more than a digital marketing agency. We're strategic partners committed to building sustainable digital growth for businesses that want to lead their markets.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section-pad bg-[#EEF2FF] relative overflow-hidden">
        <div className="container-xl">
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                label: 'Our Mission',
                title: 'Democratize Digital Success',
                desc: 'To make enterprise-level digital marketing expertise accessible to businesses of every size, empowering them to compete and win online through data-driven strategies, transparency, and genuine partnership.',
                color: 'from-purple-600 to-blue-600',
                emoji: '🎯',
              },
              {
                label: 'Our Vision',
                title: 'The Most Trusted Digital Partner',
                desc: 'To become the most trusted digital growth partner globally — known not just for results, but for the integrity, innovation, and client-obsession that drives every campaign we run.',
                color: 'from-pink-600 to-orange-500',
                emoji: '🚀',
              },
            ].map((item, i) => (
              <motion.div key={i} {...fadeUp(i * 0.15)} className="glass-card gradient-border rounded-3xl p-8">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-2xl mb-5 shadow-glow`}>
                  {item.emoji}
                </div>
                <div className="section-label mb-3">{item.label}</div>
                <h3 className="text-[#1B3172] font-heading font-700 text-2xl mb-4">{item.title}</h3>
                <p className="text-[#475569] leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section-pad-sm bg-dark relative overflow-hidden">
        <div className="orb orb-blue w-96 h-96 top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 opacity-10" />
        <div className="container-xl relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map((s, i) => (
              <motion.div key={i} {...fadeUp(i * 0.1)} className="glass-card gradient-border rounded-2xl p-8 text-center">
                <div className="stat-number">{s.number}{s.suffix}</div>
                <div className="stat-label">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Timeline */}
      <section className="section-pad bg-[#EEF2FF] relative overflow-hidden">
        <div className="line-grid absolute inset-0 opacity-30" />
        <div className="container-xl relative z-10">
          <motion.div {...fadeUp()} className="text-center mb-16">
            <div className="section-label mx-auto mb-4">Our Journey</div>
            <h2 className="text-4xl lg:text-5xl font-heading font-700 text-[#1B3172] mb-4">
              A Decade of <span className="gradient-text">Digital Excellence</span>
            </h2>
          </motion.div>

          <div className="relative max-w-3xl mx-auto">
            {/* Vertical line */}
            <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-brand-purple via-brand-blue to-brand-cyan-bright opacity-40" />
            <div className="space-y-8">
              {milestones.map((m, i) => (
                <motion.div key={i} {...fadeUp(i * 0.1)} className="pl-20 relative">
                  <div className="absolute left-5 top-3 w-7 h-7 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow text-xs font-800 text-white">
                    ✦
                  </div>
                  <div className="glass-card gradient-border rounded-2xl p-6">
                    <span className="gradient-text font-heading font-800 text-2xl">{m.year}</span>
                    <h4 className="text-[#1B3172] font-heading font-700 text-xl mt-1 mb-2">{m.title}</h4>
                    <p className="text-[#64748b] text-sm leading-relaxed">{m.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="section-pad bg-dark relative overflow-hidden">
        <div className="orb orb-pink w-96 h-96 -top-48 right-0 opacity-10" />
        <div className="container-xl relative z-10">
          <motion.div {...fadeUp()} className="text-center mb-16">
            <div className="section-label mx-auto mb-4">What We Stand For</div>
            <h2 className="text-4xl lg:text-5xl font-heading font-700 text-[#1B3172] mb-4">
              Our Core <span className="gradient-text">Values</span>
            </h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <motion.div key={i} {...fadeUp(i * 0.08)}
                  className="glass-card gradient-border rounded-2xl p-6 group hover:-translate-y-2 hover:shadow-glow transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-gradient-primary mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="text-[#1B3172] font-heading font-700 text-lg mb-2">{v.title}</h4>
                  <p className="text-[#64748b] text-sm leading-relaxed">{v.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Growth Methodology */}
      <section className="section-pad bg-white relative overflow-hidden">
        <div className="dot-grid absolute inset-0 opacity-30" />
        <div className="container-xl relative z-10 max-w-4xl">
          <motion.div {...fadeUp()} className="text-center mb-14">
            <div className="section-label mx-auto mb-4">How We Grow a Business</div>
            <h2 className="text-4xl lg:text-5xl font-heading font-700 text-[#1B3172] mb-4">
              Our 9-Stage <span className="gradient-text">Growth Framework</span>
            </h2>
            <p className="text-[#475569] text-lg max-w-2xl mx-auto leading-relaxed">
              We are growth consultants, not just a web shop. A website creates presence — but real
              growth comes from a complete system: traffic → lead capture → follow-up → conversion →
              delivery → reviews → repeat sales.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FRAMEWORK.map((f, i) => (
              <motion.div key={f.stage} {...fadeUp(i * 0.05)}
                className="rounded-2xl border border-slate-200 bg-[#f8faff] p-5 hover:border-brand-purple/40 hover:-translate-y-1 transition-all duration-300">
                <span className="gradient-text font-heading font-800 text-2xl">{f.stage}</span>
                <h4 className="text-[#1B3172] font-heading font-700 text-base mt-2 mb-1 leading-snug">{f.module}</h4>
                <p className="text-[#64748b] text-sm">{f.purpose}</p>
              </motion.div>
            ))}
          </div>
          <motion.div {...fadeUp(0.2)} className="text-center mt-10">
            <Link to="/pricing" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#1B3172] hover:bg-[#0d1f5c] text-white text-sm font-semibold transition-all">
              See How Our Plans Cover Every Stage
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      <CTABanner />
    </main>
  );
}
