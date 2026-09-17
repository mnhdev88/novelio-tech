import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronDown, ChevronUp, Search, Gauge, FileText, MapPin, ShieldCheck, ArrowRight,
} from 'lucide-react';
import SEO from '../components/SEO';
import AuditRunner from '../components/audit/AuditRunner';
import { CALENDLY_LINK } from '../data/siteData';

// What the tool checks, in the visitor's language rather than ours. This section
// is also the page's substance for search: it is what makes /free-seo-audit a
// page about SEO auditing rather than a bare form.
const CHECK_GROUPS = [
  {
    Icon: ShieldCheck,
    title: 'Technical foundation',
    body: 'Whether Google is allowed to index the page at all, HTTPS and redirects, robots.txt, your XML sitemap, structured data, security headers and how fast your server answers.',
  },
  {
    Icon: FileText,
    title: 'On-page and content',
    body: 'Title and meta description length, heading structure, canonical tags, image alt text, social sharing previews, how much content the page carries and whether it delivers what the title promises.',
  },
  {
    Icon: Gauge,
    title: 'Speed, measured by Google',
    body: 'We run your page through Google PageSpeed Insights and report the same Core Web Vitals Google uses as ranking signals — including real visitor data where Chrome has collected enough of it.',
  },
  {
    Icon: MapPin,
    title: 'Local search signals',
    body: 'Tap-to-call links, whether your address is visible and consistent, LocalBusiness schema and map presence — the signals that decide whether you show up in the map pack.',
  },
];

const FAQS = [
  {
    q: 'Is this really free?',
    a: 'Yes. There is no trial, no card and no call booked before you see anything. You run the audit and your score and the three biggest problems appear straight away. If you want the full summary, you give us an email address and phone number and we send it over.',
  },
  {
    q: 'What do you do with my email address and phone number?',
    a: 'We email your report to the address you give, and we use the details to follow up about this audit. You are not added to a newsletter or a marketing list, and we do not sell or share them. If you would rather not hear from us, say so in your reply and that is the end of it.',
  },
  {
    q: 'How long does it take?',
    a: 'The page checks take a few seconds. The speed section takes another 20–40 because Google loads your page in a real browser to measure it, so the whole audit is usually done inside a minute. The emailed summary arrives within a minute of you submitting the form.',
  },
  {
    q: 'Does it check my whole site or just one page?',
    a: 'One page — whichever URL you enter. Most people start with their homepage. Site-wide problems like a missing sitemap or a broken robots.txt are caught from any page, but page-level findings apply only to the page you audited. Run it again on a service page to compare.',
  },
  {
    q: 'Will this fix my rankings?',
    a: 'It tells you what is wrong and how to fix each thing. Technical and on-page problems are the part of SEO that is genuinely fixable in an afternoon; rankings also depend on content depth and authority, which take longer. The audit is honest about which is which.',
  },
  {
    q: 'Do I have to talk to someone to get the fixes?',
    a: 'The emailed summary names every problem we found and what your score is. The fix for each one is what we go through on a call, which takes about half an hour and costs nothing — it is faster than reading thirty pages, and you can hand what you learn to your own developer afterwards. The three problems shown on this page come with their fixes written out, no email needed.',
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass-card gradient-border rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-5 text-left gap-4">
        <span className="text-[#1B3172] font-medium text-[15px]">{q}</span>
        {open
          ? <ChevronUp className="w-5 h-5 text-brand-purple flex-shrink-0" aria-hidden="true" />
          : <ChevronDown className="w-5 h-5 text-[#64748b] flex-shrink-0" aria-hidden="true" />}
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-slate-200 pt-4">
          <p className="text-[#475569] text-sm leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function FreeAuditPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: 'Free SEO Audit Tool',
        url: 'https://www.noveliotech.com/free-seo-audit',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Any',
        description:
          'Free SEO audit tool that checks a website for technical, on-page, content, speed and local search problems, and explains how to fix each one.',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        provider: { '@type': 'Organization', name: 'Novelio Technologies LLC', url: 'https://www.noveliotech.com' },
      },
      {
        '@type': 'FAQPage',
        mainEntity: FAQS.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ],
  };

  return (
    <main className="pt-20">
      <SEO
        title="Free SEO Audit Tool — Check Your Website in 60 Seconds"
        description="Run a free SEO audit of any website. See your score, the technical and on-page problems holding it back, Google's own speed data, and exactly how to fix each one."
        canonical="/free-seo-audit"
        keywords={['free SEO audit', 'SEO audit tool', 'website SEO checker', 'free website audit', 'SEO analysis tool']}
        schema={schema}
      />

      {/* ── Hero + the tool itself ───────────────────────────────────── */}
      <section className="section-pad">
        <div className="max-w-5xl mx-auto px-5">
          <motion.div
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="text-center mb-9"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-purple/20 bg-brand-purple/5 mb-5">
              <Search className="w-3.5 h-3.5 text-brand-purple" aria-hidden="true" />
              <span className="text-[12.5px] font-600 text-brand-purple">Free tool — no signup</span>
            </div>

            <h1 className="font-heading font-800 text-[#1B3172] text-[32px] sm:text-[42px] lg:text-[48px] leading-[1.12] mb-4">
              Find out what is holding
              <span className="gradient-text-rainbow"> your website back</span>
            </h1>

            <p className="text-[16px] sm:text-[17px] text-[#475569] max-w-2xl mx-auto leading-relaxed">
              We check the things Google actually measures — then tell you, in plain English, what is
              wrong and how to fix it. You see your score before we ask for anything.
            </p>
          </motion.div>

          <AuditRunner />
        </div>
      </section>

      {/* ── What gets checked ────────────────────────────────────────── */}
      <section className="section-pad bg-gradient-to-b from-transparent to-brand-purple/[0.03]">
        <div className="max-w-5xl mx-auto px-5">
          <h2 className="font-heading font-700 text-[#1B3172] text-[26px] sm:text-[32px] text-center mb-3">
            What the audit actually checks
          </h2>
          <p className="text-[15.5px] text-[#64748b] text-center max-w-2xl mx-auto mb-10">
            Around thirty checks across five areas, each one scored and explained. Nothing invented to
            pad the report — if a check does not apply to your page, we leave it out.
          </p>

          <div className="grid sm:grid-cols-2 gap-5">
            {CHECK_GROUPS.map(({ Icon, title, body }) => (
              <div key={title} className="glass-card gradient-border rounded-xl p-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-white" aria-hidden="true" />
                </div>
                <h3 className="font-heading font-700 text-[#1B3172] text-[17px] mb-2">{title}</h3>
                <p className="text-[14.5px] text-[#475569] leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────── */}
      <section className="section-pad">
        <div className="max-w-3xl mx-auto px-5">
          <h2 className="font-heading font-700 text-[#1B3172] text-[26px] sm:text-[32px] text-center mb-10">
            Questions people ask first
          </h2>
          <div className="space-y-3">
            {FAQS.map((f) => <FAQItem key={f.q} {...f} />)}
          </div>
        </div>
      </section>

      {/* ── Closing CTA ──────────────────────────────────────────────── */}
      <section className="section-pad-sm pb-16">
        <div className="max-w-3xl mx-auto px-5">
          <div className="glass-card gradient-border rounded-2xl p-7 sm:p-9 text-center">
            <h2 className="font-heading font-700 text-[#1B3172] text-[22px] sm:text-[26px] mb-3">
              Rather have someone look at the whole site?
            </h2>
            <p className="text-[15px] text-[#475569] max-w-xl mx-auto mb-6 leading-relaxed">
              The tool covers one page automatically. A 30-minute call covers everything it cannot see —
              your Google listing, where your leads actually come from, and what your competitors are
              doing that you are not.
            </p>
            <a {...CALENDLY_LINK} className="btn-primary">
              Book a free Growth Audit <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
