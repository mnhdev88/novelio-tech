// Content for the /compare/:slug pages (Novelio vs the alternatives).
// Honest, generic comparisons derived from Novelio's own positioning — no real
// competitor brand names are used. Rendered by src/pages/ComparePage.jsx.

export const COMPARISONS = [
  {
    slug: 'traditional-agency',
    competitor: 'a Traditional Agency',
    title: 'Novelio vs a Traditional Marketing Agency',
    metaDescription:
      'Novelio vs a traditional marketing agency — diagnose-first audits, full-spectrum growth, transparent pricing, and your website included with the plan.',
    eyebrow: 'Compare',
    h1Lead: 'Novelio vs a',
    h1Highlight: 'Traditional Agency',
    intro:
      'Most agencies sell you a retainer, hand over deliverables, and report on activity. Novelio diagnoses your whole digital presence first, then builds and runs the growth systems that actually move revenue — and earns your business every month instead of locking you in.',
    matrix: [
      { factor: 'Starting point', novelio: { ok: true, text: 'Free 30-min growth audit before any proposal' }, them: { ok: false, text: 'Sales pitch, then a fixed retainer proposal' } },
      { factor: 'Scope', novelio: { ok: true, text: 'Full-spectrum: web, SEO, local, leads, automation, branding, ops' }, them: { ok: false, text: 'Usually billed per channel or per deliverable' } },
      { factor: 'What you pay for', novelio: { ok: true, text: 'Outcomes and growth systems' }, them: { ok: false, text: 'Hours, activity reports, and deliverables' } },
      { factor: 'Upfront cost', novelio: { ok: true, text: 'Website, SSL and hosting included free with the monthly plan' }, them: { ok: false, text: '$1,500–$3,000+ website project billed before any marketing starts' } },
      { factor: 'Pricing', novelio: { ok: true, text: 'Transparent, fixed-scope monthly plans' }, them: { ok: false, text: 'Opaque retainers with variable add-ons' } },
      { factor: 'Accountability', novelio: { ok: true, text: 'Monthly KPI reviews tied to revenue' }, them: { ok: false, text: 'Vanity dashboards, slow to reach the team' } },
    ],
    themGood: {
      title: 'When a traditional agency makes sense',
      points: [
        'You need a very large, single-channel ad budget managed at enterprise scale.',
        'You already have an internal marketing lead to coordinate multiple vendors.',
        'You require a household-name agency brand for investor or board optics.',
      ],
    },
    novelioGood: {
      title: 'When Novelio is the better fit',
      points: [
        'You run a small business and want one accountable partner, not five vendors.',
        'You want to see the gaps in a free audit before spending a dollar.',
        'You value transparent monthly pricing with no heavy upfront project cost.',
        'You care about revenue results, not activity reports.',
      ],
    },
    faqs: [
      { q: 'Is Novelio cheaper than a traditional agency?', a: 'Often, yes — but the bigger difference is what you pay for. Instead of an open-ended retainer billed against hours, you get transparent, fixed-scope packages tied to outcomes, so there are no surprise add-ons.' },
      { q: 'Do I have to sign a long contract?', a: 'Growth plans run on a 12-month term — because your website, SSL, hosting and growth setup are included free with the plan instead of being billed as a $1,500–$3,000 upfront project. After the term, the plan is month to month and full website ownership transfers to you.' },
      { q: 'Can Novelio replace my current agency?', a: 'In most cases, yes. Because we cover web, SEO, local, lead generation, automation, branding, and operations under one roof, we can consolidate what several single-channel vendors do today.' },
    ],
  },
  {
    slug: 'freelancer',
    competitor: 'a Freelancer',
    title: 'Novelio vs Hiring a Freelancer',
    metaDescription:
      'Novelio vs hiring a freelancer — a full growth team across web, SEO, and automation, with accountability and no single point of failure.',
    eyebrow: 'Compare',
    h1Lead: 'Novelio vs',
    h1Highlight: 'a Freelancer',
    intro:
      'A great freelancer can be excellent at one thing — but your growth depends on web, SEO, lead capture, and follow-up working together. Novelio gives you a coordinated team across all of it, with backup, accountability, and systems that keep running when one person is on vacation.',
    matrix: [
      { factor: 'Skill coverage', novelio: { ok: true, text: 'A team across design, dev, SEO, ads, and automation' }, them: { ok: false, text: 'Strong in one or two skills, gaps in the rest' } },
      { factor: 'Reliability', novelio: { ok: true, text: 'No single point of failure — work continues regardless' }, them: { ok: false, text: 'Illness, vacation, or churn stalls everything' } },
      { factor: 'Capacity', novelio: { ok: true, text: 'Scales up for launches and busy seasons' }, them: { ok: false, text: 'Limited by one person’s available hours' } },
      { factor: 'Strategy', novelio: { ok: true, text: 'Diagnose-first audit and a documented growth plan' }, them: { ok: false, text: 'Usually executes the task you hand them' } },
      { factor: 'Accountability', novelio: { ok: true, text: 'Monthly KPI reviews and transparent reporting' }, them: { ok: false, text: 'Varies widely, hard to enforce' } },
      { factor: 'Continuity', novelio: { ok: true, text: 'Your assets, accounts, and docs stay with you' }, them: { ok: false, text: 'Knowledge can walk out the door' } },
    ],
    themGood: {
      title: 'When a freelancer makes sense',
      points: [
        'You have a single, well-defined task — one logo, one landing page, one fix.',
        'You already have a strategy and just need a pair of hands to execute it.',
        'Your budget is very small and the work is genuinely one-off.',
      ],
    },
    novelioGood: {
      title: 'When Novelio is the better fit',
      points: [
        'You need several skills working together, not just one deliverable.',
        'You can’t afford for your marketing to stall if one person disappears.',
        'You want a documented strategy, not just task execution.',
        'You want ongoing growth, with someone accountable for the numbers.',
      ],
    },
    faqs: [
      { q: 'Is a freelancer cheaper than Novelio?', a: 'A single freelancer may have a lower hourly rate, but you often need several to cover web, SEO, ads, and automation — and coordinating them yourself costs time and creates gaps. Novelio bundles the full team into one transparent package.' },
      { q: 'What happens if my freelancer disappears?', a: 'That risk is exactly why teams choose Novelio. With us there is no single point of failure: your accounts, assets, and documentation stay with you, and work continues even if any one person is unavailable.' },
      { q: 'Can Novelio work alongside a freelancer I already trust?', a: 'Yes. We’re happy to coordinate with a freelancer you rely on and fill the gaps around them, or take over the pieces that need a fuller team.' },
    ],
  },
  {
    slug: 'diy-website-builders',
    competitor: 'DIY Website Builders',
    title: 'Novelio vs DIY Website Builders',
    metaDescription:
      'Novelio vs DIY website builders — a conversion-built site and a full growth system instead of a template you set up and maintain alone.',
    eyebrow: 'Compare',
    h1Lead: 'Novelio vs',
    h1Highlight: 'DIY Website Builders',
    intro:
      'Drag-and-drop builders are great for getting something online fast. But a template you maintain alone rarely ranks, loads fast, or turns visitors into customers. Novelio builds a fast, conversion-focused site around your buyer journey — and connects it to the SEO, leads, and follow-up that actually grow revenue.',
    matrix: [
      { factor: 'Design', novelio: { ok: true, text: 'Custom, conversion-focused, built around your buyers' }, them: { ok: false, text: 'Generic template shared by thousands of sites' } },
      { factor: 'Performance', novelio: { ok: true, text: 'Fast, mobile-first, Core Web Vitals optimized' }, them: { ok: false, text: 'Often heavy and slow out of the box' } },
      { factor: 'SEO', novelio: { ok: true, text: 'Technical SEO and content strategy included' }, them: { ok: false, text: 'Basic settings; you do the work yourself' } },
      { factor: 'Lead systems', novelio: { ok: true, text: 'Forms, funnels, and automated follow-up connected' }, them: { ok: false, text: 'A contact form, and the rest is on you' } },
      { factor: 'Your time', novelio: { ok: true, text: 'We build and maintain it for you' }, them: { ok: false, text: 'Hours of DIY setup and ongoing upkeep' } },
      { factor: 'Growth support', novelio: { ok: true, text: 'An ongoing partner for the whole funnel' }, them: { ok: false, text: 'Software only — no strategy or help' } },
    ],
    themGood: {
      title: 'When a DIY builder makes sense',
      points: [
        'You need a simple placeholder or hobby page online today.',
        'You genuinely enjoy building and maintaining the site yourself.',
        'You have no budget and the site isn’t central to revenue yet.',
      ],
    },
    novelioGood: {
      title: 'When Novelio is the better fit',
      points: [
        'Your website is meant to generate leads and revenue, not just exist.',
        'You’d rather run your business than wrestle with templates and plugins.',
        'You want the site to rank and load fast, not just look okay.',
        'You want the website wired into SEO, leads, and follow-up from day one.',
      ],
    },
    faqs: [
      { q: 'Can’t I just build it myself for less?', a: 'You can — and for a hobby page that’s fine. But a revenue-generating site needs conversion design, real SEO, speed, and lead follow-up. Most owners find the DIY time cost and lost leads far outweigh what they saved on software.' },
      { q: 'Do I own the website Novelio builds?', a: 'Yes. You own your site, domain, accounts, and assets outright. We build it for you and can hand over full control or maintain it for you — your choice.' },
      { q: 'Can Novelio improve a site I already built on a DIY builder?', a: 'Often, yes. We start with a free audit and tell you honestly whether it’s better to optimize what you have or rebuild it on a faster, more conversion-friendly foundation.' },
    ],
  },
];
