import { useEffect, useState } from 'react';
import SEO from '../components/SEO';
import ApplyModal from '../components/ApplyModal';
import { motion } from 'framer-motion';
import { MapPin, Mail, Phone, Globe, Building2, Users, Zap, Star, TrendingUp, DollarSign, Heart, Globe2, Flame, Sparkles } from 'lucide-react';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay },
  viewport: { once: true },
});

// ── Data ──────────────────────────────────────────────────────────────────────

const presenceCards = [
  { icon: Building2, label: 'US Headquarters', detail: 'Dover, DE & regional teams across 9 states' },
  { icon: Users,     label: 'India Operations Hub', detail: 'Gurgaon, Delhi NCR — delivery & growth' },
  { icon: Globe2,    label: 'Who We Serve', detail: 'Small businesses & entrepreneurs across the US' },
  { icon: Zap,       label: 'What We Do', detail: 'AI tools, websites, local SEO & digital growth' },
];

const usJobs = [
  {
    title: 'Sales Coordinator',
    openings: 1,
    tags: [{ label: '🇺🇸 United States', style: 'bg-blue-50 text-blue-700' }, { label: 'Hybrid', style: 'bg-amber-50 text-amber-700' }, { label: '1 Opening', style: 'bg-orange-50 text-orange-600' }],
    locations: 'Dover, DE | Texas | Florida | North Carolina | Tennessee | Idaho | South Dakota | Iowa | Colorado | Utah | Montana',
    desc: 'You will coordinate between our sales team, clients, and delivery teams — keeping deals moving, follow-ups on track, and every small business owner we work with feeling taken care of. This role sits at the centre of our US operations and reports directly to the US team lead.',
    pills: ['CRM Management', 'Client Communication', 'Sales Support', '1–3 Years Experience', 'Full-Time', 'Salary + Incentive'],
    accentColor: 'border-l-orange-500',
    btnStyle: 'bg-orange-500 hover:bg-orange-600 text-white',
    subject: 'Application: Sales Coordinator – US',
  },
  {
    title: 'Sales Executive',
    openingLabel: '(3 Openings)',
    openings: 3,
    tags: [{ label: '🇺🇸 United States', style: 'bg-blue-50 text-blue-700' }, { label: 'Hybrid', style: 'bg-amber-50 text-amber-700' }, { label: '3 Openings', style: 'bg-purple-50 text-purple-700' }],
    locations: 'Dover, DE | Texas | Florida | North Carolina | Tennessee | Idaho | South Dakota | Iowa | Colorado | Utah | Montana',
    desc: 'Work directly with small business owners and entrepreneurs — understand their growth challenges, present our digital solutions, and close deals. This is a hybrid field + phone role. You will build your own book of business with full support from a senior sales mentor.',
    pills: ['B2B Sales', 'Small Business Market', 'Digital Products', '2–4 Years Experience', 'Salary + Commission', 'Full-Time'],
    accentColor: 'border-l-[#1B3172]',
    btnStyle: 'bg-[#1B3172] hover:bg-[#0d1f5c] text-white',
    subject: 'Application: Sales Executive – US',
  },
];

const indiaJobs = [
  {
    title: 'Sales Executive — US Market',
    openings: 2,
    tags: [{ label: '🇮🇳 India', style: 'bg-green-50 text-green-700' }, { label: 'Night Shift', style: 'bg-pink-50 text-pink-700' }, { label: '2 Openings', style: 'bg-purple-50 text-purple-700' }],
    location: 'Gurgaon, Delhi NCR | Work from Office',
    desc: 'Sell digital growth solutions — websites, AI tools, local SEO — to small business owners and entrepreneurs in the US. Build your pipeline, manage relationships, and close with direct support from a senior sales mentor who has built and scaled teams from scratch.',
    pills: ['International Sales', '2–3 Years Experience', 'Strong Spoken English', 'Night Shift (US EST/PST)', 'Salary + Incentive'],
    subject: 'Application: Sales Executive – India',
    btnLabel: 'Apply Now →',
    btnStyle: 'bg-[#1B3172] hover:bg-[#0d1f5c] text-white',
  },
  {
    title: 'Call Setter — US Market',
    openings: 1,
    tags: [{ label: '🇮🇳 India', style: 'bg-green-50 text-green-700' }, { label: 'Night Shift', style: 'bg-pink-50 text-pink-700' }, { label: '1 Opening', style: 'bg-purple-50 text-purple-700' }],
    location: 'Gurgaon, Delhi NCR | Work from Office',
    desc: 'You are the first voice a US small business owner hears. Reach out to business owners, introduce what we do, qualify their interest, and book appointments for the sales team. Full training provided. This is not a scripted call-centre role — you will be coached to have real conversations. Clear growth path to Sales Executive within 6–12 months.',
    pills: ['Outbound Calling', '0–2 Years Experience', 'Freshers Welcome', 'Night Shift', 'Salary + Appointment Incentive'],
    subject: 'Application: Call Setter – India',
    btnLabel: 'Apply Now →',
    btnStyle: 'bg-[#1B3172] hover:bg-[#0d1f5c] text-white',
  },
  {
    title: 'SEO Team Lead',
    openings: 1,
    tags: [{ label: '🇮🇳 India', style: 'bg-green-50 text-green-700' }, { label: 'Day Shift', style: 'bg-amber-50 text-amber-700' }, { label: '1 Opening', style: 'bg-orange-50 text-orange-600' }],
    location: 'Gurgaon, Delhi NCR | Work from Office / Hybrid',
    desc: 'Lead our SEO function for US-based local business clients. You will own keyword strategy, on-page and off-page execution, Google Business Profile optimisation, and monthly reporting. You will also guide and review the work of our SEO interns.',
    pills: ['3+ Years SEO Experience', 'Local SEO — US Market', 'Google Search Console', 'Ahrefs / SEMrush', 'Team Handling Experience', 'Content Strategy'],
    applyNote: true,
    applyNoteTitle: '⚠ How to Apply — Please Read Before Sending',
    applyNotePoints: [
      'Your responsibilities in your current or last role.',
      'The exact SEO tasks you personally executed.',
      'Live URLs of websites you have actively worked on in the last 12 months — with the specific results achieved. Applications without live URLs will not be reviewed.',
    ],
    applyNoteFooter: 'CV is optional.',
    subject: 'SEO Team Lead Application – Work Profile',
    btnLabel: 'Send Work Profile →',
    btnStyle: 'bg-orange-500 hover:bg-orange-600 text-white',
    footerNote: 'Send your work profile to: ajay@noveliotech.com',
  },
  {
    title: 'SEO Intern',
    openingLabel: '(2 Openings)',
    openings: 2,
    tags: [{ label: '🇮🇳 India', style: 'bg-green-50 text-green-700' }, { label: 'Day Shift', style: 'bg-amber-50 text-amber-700' }, { label: '2 Openings', style: 'bg-purple-50 text-purple-700' }],
    location: 'Gurgaon, Delhi NCR | Work from Office',
    desc: 'Learn SEO by doing real SEO. You will work on live US client websites under the guidance of our SEO Team Lead — keyword research, on-page fixes, GMB updates, content briefs, and rank tracking. If you have touched even one live website and seen results move, we want to hear from you.',
    pills: ['0–1 Year Experience', 'Basic SEO Knowledge', 'Google Search Console', 'Eager to Learn', 'Stipend + Incentive'],
    applyNote: true,
    applyNoteTitle: '⚠ How to Apply — Please Read Before Sending',
    applyNotePoints: [
      'What you have done in SEO so far — your exact responsibilities.',
      'Tools you have used (e.g. Ahrefs, GSC, SEMrush).',
      'At least one live URL you have worked on and what changed after your work. Even personal projects or college websites count — just show us the work and the result.',
    ],
    applyNoteFooter: 'CV is optional.',
    subject: 'SEO Intern Application – Work Profile',
    btnLabel: 'Send Work Profile →',
    btnStyle: 'bg-[#1B3172] hover:bg-[#0d1f5c] text-white',
    footerNote: 'Send your work profile to: ajay@noveliotech.com',
  },
];

const freelanceJobs = [
  {
    title: 'Video & Image Creator',
    openings: 1,
    tags: [
      { label: '🌐 Remote / Worldwide', style: 'bg-blue-50 text-blue-700' },
      { label: 'Freelance / Project-Based', style: 'bg-pink-50 text-pink-700' },
      { label: '1 Opening', style: 'bg-orange-50 text-orange-600' },
    ],
    location: 'Remote / Hybrid | Project-wise / Part-time Association',
    desc: 'Turn our products and services into clean, professional, easy-to-understand content. You will create short reels, explainer videos, product demos, and social creatives for our CRM, websites, apps, and AI tools — content that looks polished but stays simple enough for any small business owner to get. You will work with the content and business team to shape the message, and you are encouraged to suggest ideas, not just execute them.',
    pills: ['Video Editing', 'Reels & Shorts', 'Canva / Photoshop / Illustrator', 'CapCut / Premiere Pro / DaVinci', 'Basic Motion Graphics', 'Thumbnail Design', 'AI Video & Image Tools'],
    accentColor: 'border-l-purple-500',
    applyNote: true,
    applyNoteTitle: '⚠ How to Apply — Please Share With Your Application',
    applyNotePoints: [
      'Your portfolio / sample work — reels, explainer videos, or product demos.',
      'Social media creatives you have already made (posts, carousels, thumbnails, banners).',
      'The tools you use (e.g. Premiere Pro, CapCut, DaVinci, Canva, Photoshop, AI video/image tools).',
    ],
    applyNoteFooter: 'A CV is optional — your work samples matter most. Experience creating content for software, SaaS, CRM, or digital-marketing brands is a plus.',
    subject: 'Application: Video & Image Creator – Freelance',
    btnLabel: 'Send Portfolio →',
    btnStyle: 'bg-[#1B3172] hover:bg-[#0d1f5c] text-white',
    footerNote: 'Send your portfolio to: ajay@noveliotech.com',
  },
];

// ── Live data from the CRM ────────────────────────────────────────────────────
// Jobs are managed in the CRM (crm.noveliotech.com → Careers). The hardcoded
// arrays above are only the fallback when the API is unreachable.

const CRM_JOBS_URL = 'https://crm.noveliotech.com/api/public/careers';

const SHIFT_STYLES = {
  'Hybrid': 'bg-amber-50 text-amber-700',
  'Night Shift': 'bg-pink-50 text-pink-700',
  'Day Shift': 'bg-amber-50 text-amber-700',
};

const REGION_TAGS = {
  us:    [{ label: '🇺🇸 United States', style: 'bg-blue-50 text-blue-700' }],
  india: [{ label: '🇮🇳 India', style: 'bg-green-50 text-green-700' }],
  freelance: [
    { label: '🌐 Remote / Worldwide', style: 'bg-blue-50 text-blue-700' },
    { label: 'Freelance / Project-Based', style: 'bg-pink-50 text-pink-700' },
  ],
};

function apiJobToCard(job) {
  const tags = [...(REGION_TAGS[job.region] || REGION_TAGS.india)];
  if (job.shift) tags.push({ label: job.shift, style: SHIFT_STYLES[job.shift] || 'bg-amber-50 text-amber-700' });
  tags.push({
    label: `${job.openings} Opening${job.openings === 1 ? '' : 's'}`,
    style: job.openings > 1 ? 'bg-purple-50 text-purple-700' : 'bg-orange-50 text-orange-600',
  });
  return {
    id: job.id,
    region: job.region,
    title: job.title,
    openings: job.openings,
    openingLabel: job.openings > 1 ? `(${job.openings} Openings)` : undefined,
    tags,
    accentColor: job.region === 'freelance' ? 'border-l-purple-500' : undefined,
    locations: job.job_location,
    desc: job.description,
    pills: job.pills || [],
    applyNote: !!job.apply_note_title,
    applyNoteTitle: job.apply_note_title,
    applyNotePoints: job.apply_note_points,
    applyNoteFooter: job.apply_note_footer,
    footerNote: job.footer_note,
    btnLabel: job.btn_label || undefined,
    subject: `Application: ${job.title}`,
  };
}

const whyCards = [
  { icon: Star,       title: 'Real Mentorship',      text: 'Senior leaders who teach, not just manage. You will understand the why behind every task — not just get told what to do.' },
  { icon: TrendingUp, title: 'Fast Growth Path',      text: 'Performers move up quickly here. No waiting 3 years for a title change that means nothing.' },
  { icon: DollarSign, title: 'Earn What You Deliver', text: 'Competitive fixed salary with performance incentives that actually make a meaningful difference every month.' },
  { icon: Heart,      title: 'Culture First',         text: 'We track learning and accountability — not just numbers. Good humans do better work here, and we know it.' },
  { icon: Globe2,     title: 'Global Exposure',       text: 'Work with US clients directly. Understand a market, a culture, and a pace of business that sharpens your skills fast.' },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function JobCard({ job, isIndia = false, delay = 0, onApply }) {
  const accent = isIndia ? 'border-l-green-600' : (job.accentColor || 'border-l-[#1B3172]');
  return (
    <motion.div
      {...fadeUp(delay)}
      className={`glass-card gradient-border rounded-2xl p-6 border-l-4 ${accent} hover:-translate-y-1 hover:shadow-lg transition-all duration-300`}
    >
      {/* Top */}
      <div className="mb-3">
        <div className="flex flex-wrap items-baseline gap-2 mb-2">
          <h3 className="font-heading font-700 text-[#1B3172] text-lg leading-tight">{job.title}</h3>
          {job.openingLabel && (
            <span className="text-[#64748b] text-sm font-normal">{job.openingLabel}</span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {job.tags.map((t, i) => (
            <span key={i} className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-600 ${t.style}`}>{t.label}</span>
          ))}
        </div>
      </div>

      {/* Location */}
      <div className="flex items-start gap-1.5 text-xs text-[#64748b] mb-3">
        <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#64748b]" />
        <span className="leading-relaxed">{job.locations || job.location}</span>
      </div>

      {/* Desc */}
      <p className="text-sm text-[#475569] leading-relaxed mb-4">{job.desc}</p>

      {/* Pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {job.pills.map((p, i) => (
          <span key={i} className="text-xs px-3 py-1 rounded-full border border-[rgba(29,78,216,0.13)] text-[#64748b] bg-[#f8faff]">{p}</span>
        ))}
      </div>

      {/* Apply Note Box */}
      {job.applyNote && (
        <div className="bg-orange-50 border border-orange-200 border-l-4 border-l-orange-500 rounded-xl p-4 mb-4">
          <p className="text-xs font-700 text-orange-600 mb-2">{job.applyNoteTitle}</p>
          {job.applyNotePoints ? (
            <>
              <ol className="space-y-1.5 mb-2">
                {job.applyNotePoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-orange-800 leading-relaxed">
                    <span className="shrink-0 w-4 h-4 rounded-full bg-orange-200 text-orange-700 font-700 flex items-center justify-center text-[10px] mt-0.5">{i + 1}</span>
                    {point}
                  </li>
                ))}
              </ol>
              {job.applyNoteFooter && (
                <p className="text-xs text-orange-700 font-600 italic">{job.applyNoteFooter}</p>
              )}
            </>
          ) : (
            <p className="text-xs text-orange-800 leading-relaxed">{job.applyNoteText}</p>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between flex-wrap gap-3 pt-4 border-t border-[rgba(29,78,216,0.08)]">
        {job.footerNote
          ? <span className="text-xs text-[#64748b] italic">{job.footerNote}</span>
          : <span />
        }
        <button
          type="button"
          onClick={() => onApply(job)}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-600 transition-all duration-200 cursor-pointer ${job.btnStyle || 'bg-[#1B3172] hover:bg-[#0d1f5c] text-white'}`}
        >
          {job.btnLabel || 'Apply Now →'}
        </button>
      </div>
    </motion.div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CareersPage() {
  const [activeJob, setActiveJob] = useState(null);
  const [liveJobs, setLiveJobs] = useState(null);

  useEffect(() => {
    fetch(CRM_JOBS_URL)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        if (Array.isArray(d.jobs) && d.jobs.length) setLiveJobs(d.jobs.map(apiJobToCard));
      })
      .catch(() => {}); // keep the hardcoded fallback
  }, []);

  const usRoles = liveJobs ? liveJobs.filter((j) => j.region === 'us') : usJobs;
  const indiaRoles = liveJobs ? liveJobs.filter((j) => j.region === 'india') : indiaJobs;
  const liveFreelance = liveJobs ? liveJobs.filter((j) => j.region === 'freelance') : [];
  const freelanceRoles = liveFreelance.length ? liveFreelance : freelanceJobs;
  const usOpenings = usRoles.reduce((n, j) => n + (j.openings || 1), 0);
  const indiaOpenings = indiaRoles.reduce((n, j) => n + (j.openings || 1), 0);
  const freelanceOpenings = freelanceRoles.reduce((n, j) => n + (j.openings || 1), 0);
  const totalOpenings = usOpenings + indiaOpenings + freelanceOpenings;

  return (
    <main className="pt-20">
      <SEO
        title="Careers — Join Novelio Technologies"
        description="We're hiring across the US, India, and remote. Sales, SEO, content/video, and operations roles at a fast-growing AI-powered digital agency."
        canonical="/careers"
      />

      {/* ── Hero ── */}
      <section className="section-pad relative overflow-hidden bg-dark">
        <div className="orb orb-purple w-[500px] h-[500px] -top-48 -left-48 opacity-15" />
        <div className="orb orb-cyan w-[400px] h-[400px] -bottom-48 -right-48 opacity-10" />
        <div className="dot-grid absolute inset-0 opacity-40" />
        <div className="container-xl relative z-10 text-center">
          <motion.div {...fadeUp(0)}>
            <div className="section-label mx-auto mb-4 inline-flex items-center gap-1.5"><Flame className="w-4 h-4" /> We Are Hiring — {totalOpenings} Open Position{totalOpenings === 1 ? '' : 's'}</div>
          </motion.div>
          <motion.h1 {...fadeUp(0.1)} className="text-5xl lg:text-7xl font-heading font-800 text-[#1B3172] mb-6 leading-tight">
            Grow Your Career at<br /><span className="gradient-text">Novelio Technologies</span>
          </motion.h1>
          <motion.p {...fadeUp(0.2)} className="text-[#475569] text-xl max-w-2xl mx-auto leading-relaxed mb-12">
            We help small businesses and entrepreneurs across the US grow faster with AI-powered digital tools. Join a team where your work creates real, visible impact — fast.
          </motion.p>
          <motion.div {...fadeUp(0.3)} className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {[
              { num: String(totalOpenings), label: 'Open Positions' },
              { num: 'US + India', label: 'Team Locations' },
              { num: '1–15',   label: 'Person Businesses We Serve' },
              { num: 'Fast',   label: 'Growth Stage Company' },
            ].map((s, i) => (
              <div key={i} className="glass-card gradient-border rounded-2xl p-5 text-center">
                <div className="font-heading font-800 text-[#1B3172] text-2xl">{s.num}</div>
                <div className="text-[#64748b] text-xs mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Presence Strip ── */}
      <section className="bg-white border-b border-[rgba(29,78,216,0.08)] py-8">
        <div className="container-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {presenceCards.map((c, i) => {
              const Icon = c.icon;
              return (
                <motion.div key={i} {...fadeUp(i * 0.08)} className="flex items-start gap-3 p-4 rounded-xl border border-[rgba(29,78,216,0.1)] bg-[#f8faff]">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-[#1B3172]" />
                  </div>
                  <div>
                    <p className="text-sm font-600 text-[#1B3172]">{c.label}</p>
                    <p className="text-xs text-[#64748b] leading-snug mt-0.5">{c.detail}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── US Roles ── */}
      <section className="section-pad bg-[#EEF2FF] relative overflow-hidden" id="us-roles">
        <div className="line-grid absolute inset-0 opacity-30" />
        <div className="container-xl relative z-10">
          <motion.div {...fadeUp()} className="mb-8">
            <p className="text-xs font-700 tracking-widest uppercase text-[#64748b] mb-1">United States</p>
            <h2 className="font-heading font-700 text-[#1B3172] text-3xl flex items-center gap-3">
              US Based Roles
              <span className="inline-flex items-center px-3 py-0.5 rounded-full bg-orange-50 text-orange-600 text-sm font-600">{usOpenings} Opening{usOpenings === 1 ? '' : 's'}</span>
            </h2>
          </motion.div>
          <div className="flex flex-col gap-5">
            {usRoles.map((job, i) => <JobCard key={job.id || i} job={job} delay={i * 0.1} onApply={setActiveJob} />)}
            {usRoles.length === 0 && (
              <p className="text-sm text-[#64748b]">No US openings right now — check back soon.</p>
            )}
          </div>
        </div>
      </section>

      {/* ── India Roles ── */}
      <section className="section-pad bg-dark relative overflow-hidden" id="india-roles">
        <div className="orb orb-blue w-96 h-96 top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 opacity-10" />
        <div className="container-xl relative z-10">
          <motion.div {...fadeUp()} className="mb-6">
            <p className="text-xs font-700 tracking-widest uppercase text-[#64748b] mb-1">India Operations Hub — Gurgaon, Delhi NCR</p>
            <h2 className="font-heading font-700 text-[#1B3172] text-3xl flex items-center gap-3">
              India Based Roles
              <span className="inline-flex items-center px-3 py-0.5 rounded-full bg-orange-50 text-orange-600 text-sm font-600">{indiaOpenings} Opening{indiaOpenings === 1 ? '' : 's'}</span>
            </h2>
          </motion.div>

          {/* India Banner */}
          <motion.div {...fadeUp(0.1)} className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 border-l-4 border-l-green-600 rounded-2xl p-6 mb-6">
            <h3 className="font-heading font-700 text-green-900 text-base mb-2 flex items-center gap-1.5"><Sparkles className="w-4 h-4 flex-shrink-0" /> Why Our India Team Powers Our US Clients' Success</h3>
            <p className="text-sm text-green-800 leading-relaxed">
              Our Gurgaon hub is not a back-office — it is the engine. India gives us world-class technical expertise, deep digital knowledge, and an execution speed that delivers outstanding quality for our US clients. This is where strategy gets built, SEO campaigns get executed, and AI-powered growth systems get deployed. If you are sharp, hungry, and want real mentorship — this is the team to be on.
            </p>
          </motion.div>

          <div className="flex flex-col gap-5">
            {indiaRoles.map((job, i) => <JobCard key={job.id || i} job={job} isIndia delay={i * 0.1} onApply={setActiveJob} />)}
            {indiaRoles.length === 0 && (
              <p className="text-sm text-[#64748b]">No India openings right now — check back soon.</p>
            )}
          </div>
        </div>
      </section>

      {/* ── Freelance / Remote Roles ── */}
      <section className="section-pad bg-white relative overflow-hidden" id="freelance-roles">
        <div className="dot-grid absolute inset-0 opacity-20" />
        <div className="container-xl relative z-10">
          <motion.div {...fadeUp()} className="mb-8">
            <p className="text-xs font-700 tracking-widest uppercase text-[#64748b] mb-1">Remote · Worldwide</p>
            <h2 className="font-heading font-700 text-[#1B3172] text-3xl flex items-center gap-3">
              Freelance &amp; Project-Based Roles
              <span className="inline-flex items-center px-3 py-0.5 rounded-full bg-orange-50 text-orange-600 text-sm font-600">{freelanceOpenings} Opening{freelanceOpenings === 1 ? '' : 's'}</span>
            </h2>
            <p className="text-[#475569] text-sm mt-3 max-w-2xl leading-relaxed">
              Work with us on a project or part-time basis from anywhere. Ideal for creative professionals who want flexible, high-impact work with a fast-growing, US-focused tech brand.
            </p>
          </motion.div>
          <div className="flex flex-col gap-5">
            {freelanceRoles.map((job, i) => <JobCard key={job.id || i} job={job} delay={i * 0.1} onApply={setActiveJob} />)}
            {freelanceRoles.length === 0 && (
              <p className="text-sm text-[#64748b]">No freelance openings right now — check back soon.</p>
            )}
          </div>
        </div>
      </section>

      {/* ── Why Join ── */}
      <section className="section-pad bg-[#EEF2FF] relative overflow-hidden">
        <div className="line-grid absolute inset-0 opacity-30" />
        <div className="container-xl relative z-10">
          <motion.div {...fadeUp()} className="text-center mb-12">
            <div className="section-label mx-auto mb-4">Life at Novelio</div>
            <h2 className="text-4xl lg:text-5xl font-heading font-700 text-[#1B3172] mb-4">
              Why People Join — <span className="gradient-text">And Stay</span>
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {whyCards.map((c, i) => {
              const Icon = c.icon;
              return (
                <motion.div key={i} {...fadeUp(i * 0.08)}
                  className="glass-card gradient-border rounded-2xl p-6 group hover:-translate-y-2 hover:shadow-glow transition-all duration-300">
                  <div className="w-11 h-11 rounded-xl bg-gradient-primary mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="text-[#1B3172] font-heading font-700 text-base mb-2">{c.title}</h4>
                  <p className="text-[#64748b] text-sm leading-relaxed">{c.text}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="section-pad-sm bg-dark">
        <div className="container-xl text-center">
          <motion.div {...fadeUp()}>
            <h3 className="text-2xl font-heading font-700 text-[#1B3172] mb-3">Ready to apply?</h3>
            <p className="text-[#64748b] mb-6 text-sm">Drop us a line and we'll get back to you within 48 hours.</p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-[#475569]">
              <a href="mailto:ajay@noveliotech.com" className="flex items-center gap-2 glass-card gradient-border px-5 py-3 rounded-xl hover:text-[#1B3172] transition-colors">
                <Mail className="w-4 h-4" /> ajay@noveliotech.com
              </a>
              <a href="https://wa.me/15733270153" className="flex items-center gap-2 glass-card gradient-border px-5 py-3 rounded-xl hover:text-[#1B3172] transition-colors">
                <Phone className="w-4 h-4" /> +1 (573) 327-0153
              </a>
              <a href="https://www.noveliotech.com" target="_blank" rel="noreferrer" className="flex items-center gap-2 glass-card gradient-border px-5 py-3 rounded-xl hover:text-[#1B3172] transition-colors">
                <Globe className="w-4 h-4" /> noveliotech.com
              </a>
            </div>
          </motion.div>
        </div>
      </section>
      {activeJob && (
        <ApplyModal job={activeJob} onClose={() => setActiveJob(null)} />
      )}
    </main>
  );
}
