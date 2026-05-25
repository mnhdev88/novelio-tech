# SEO Action Plan — Novelio Technologies LLC
**Generated:** May 18, 2026  
**Based on:** FULL-AUDIT-REPORT.md (5-agent parallel audit)  
**Overall Score:** 42 / 100 → Target: 72 / 100 after Sprint 1

---

## Priority Legend

| Priority | Definition | Fix Within |
|---|---|---|
| 🔴 Critical | Blocks indexing or causes active revenue loss | This week |
| 🟠 High | Significantly impacts rankings or conversions | Within 2 weeks |
| 🟡 Medium | Clear optimization opportunity | Within 4 weeks |
| 🟢 Low | Polish / nice-to-have | Backlog |

---

## 🔴 CRITICAL — Do First (Estimated score impact: +18 points)

---

### C-1: Fix SPA 404 — Add Hosting Redirect Rule
**Files:** Hosting config (new file)  
**Effort:** 10 minutes  
**Why:** 30 of 31 sitemap URLs return HTTP 404. Googlebot, every AI crawler, and every social media scraper sees a dead site. This single fix is a prerequisite for everything else.

**If on Netlify** — create `public/_redirects`:
```
/* /index.html 200
```

**If on Vercel** — create `vercel.json` in project root:
```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

**If on Apache** — create `public/.htaccess`:
```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

---

### C-2: Add Prerendering for Static HTML at Build Time
**Files:** [vite.config.js](vite.config.js)  
**Effort:** 2-4 hours  
**Why:** Even after C-1, the HTML body served to crawlers is an empty `<div id="root">`. All page-level SEO (H1, meta description, canonical, schema) is invisible without JavaScript execution. Prerendering generates static HTML at build time.

```bash
npm install vite-plugin-prerender --save-dev
```

Update [vite.config.js](vite.config.js):
```js
import prerender from 'vite-plugin-prerender'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    prerender({
      staticDir: path.join(__dirname, 'dist'),
      routes: [
        '/', '/about', '/services', '/contact', '/blog',
        '/services/website-seo', '/services/google-business',
        '/services/lead-generation', '/services/automation',
        '/services/branding', '/services/tech-ops',
        '/services/email-marketing', '/services/email-validator',
        '/blog/seo-trends-2025', '/blog/high-converting-landing-page',
        '/blog/google-ads-small-business', '/blog/social-media-algorithm-2025',
        '/blog/wordpress-vs-react', '/blog/email-marketing-best-practices',
      ],
    }),
  ],
  build: { /* keep existing rollupOptions */ }
})
```

---

### C-3: Connect Contact Form to Real Backend
**File:** [src/pages/ContactPage.jsx](src/pages/ContactPage.jsx) — line 67  
**Effort:** 1-2 hours  
**Why:** The current `await new Promise((r) => setTimeout(r, 1500))` is a simulation. Every lead submitted via the form is silently dropped. This is an active revenue leak.

Replace the `handleSubmit` simulation with a real endpoint. Formspree is the fastest:
```js
const handleSubmit = async (e) => {
  e.preventDefault();
  const errs = validate();
  if (Object.keys(errs).length) { setErrors(errs); return; }
  setSubmitting(true);
  try {
    const res = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) { setSuccess(true); setForm({ name:'',email:'',phone:'',company:'',service:'',budget:'',source:'',message:'' }); }
    else { setErrors({ message: 'Submission failed. Please call us directly.' }); }
  } catch { setErrors({ message: 'Network error. Please try again.' }); }
  setSubmitting(false);
};
```

Sign up at formspree.io (free tier: 50 submissions/month), get your form ID, replace `YOUR_FORM_ID`.

---

### C-4: Remove Deprecated HowTo Schema from index.html
**File:** [index.html](index.html) — lines 142-170  
**Effort:** 5 minutes  
**Why:** Google removed HowTo rich results in September 2023. This block produces zero benefit and serves as noise. Remove it and replace with `WebSite` schema (see H-5 below).

Delete the entire `<!-- Schema: HowTo -->` script block.

---

### C-5: Fix Blog Article Author Type (Organization → Person)
**File:** [src/data/siteData.js](src/data/siteData.js) — all 6 blog post schema blocks  
**Effort:** 30 minutes  
**Why:** All blog posts use `"author": { "@type": "Organization" }`. Google's E-E-A-T framework requires `Person` authorship for articles. This suppresses authority signals across the entire blog.

Replace in all 6 blog post `schema` entries:
```js
// REMOVE:
author: { '@type': 'Organization', name: 'Noveliotech' },

// REPLACE WITH:
author: {
  '@type': 'Person',
  name: 'Novelio Technologies Editorial Team',
  url: 'https://www.noveliotech.com/about',
},
```

---

### C-6: Fix www Inconsistency in All Blog Schemas
**File:** [src/data/siteData.js](src/data/siteData.js) — all 6 blog post schema blocks  
**Effort:** 20 minutes  
**Why:** All blog schemas use `https://noveliotech.com/...` (no www). The canonical domain is `https://www.noveliotech.com`. Entity reconciliation fails when schema URLs don't match canonical.

Find and replace all occurrences of `https://noveliotech.com` with `https://www.noveliotech.com` in the blog schema section of `siteData.js`.

Also fix the publisher logo path: `https://noveliotech.com/assets/logo.png` → `https://www.noveliotech.com/logo.png`

---

## 🟠 HIGH — Do Within 2 Weeks (Estimated score impact: +12 points)

---

### H-1: Create llms.txt for AI Search Access
**File:** `public/llms.txt` (new file)  
**Effort:** 1-2 hours  
**Why:** All major AI crawlers (Claude, GPTBot, Perplexity) either don't execute JS or see 404s. The `llms.txt` file gives them a machine-readable summary of the site even without JavaScript. High citation signal value for Anthropic Claude and GPT-based systems.

Copy the recommended content from FULL-AUDIT-REPORT.md Section 6 into `public/llms.txt`.

---

### H-2: Update sitemap.xml — Remove Noindex Pages, Fix Dates
**File:** [public/sitemap.xml](public/sitemap.xml)  
**Effort:** 30 minutes  
**Actions:**
1. Delete all 4 legal page URL blocks (lines 124-148): `/privacy`, `/terms`, `/refund-policy`, `/disclaimer` — they have `noindex` and must not be in the sitemap
2. Update all `lastmod` dates to today's date (2026-05-18) for pages with recent content
3. Update `blog/high-converting-landing-page` lastmod to `2026-05-16`
4. Change all blog post `changefreq` from `yearly` to `monthly`
5. Add `lastmod` for blog posts reflecting actual publication dates

---

### H-3: Align index.html OG and Meta Tags
**File:** [index.html](index.html) — lines 29-47  
**Effort:** 15 minutes  
**Why:** OG title differs from page title. Social media crawlers that don't execute JS display wrong title when page is shared on LinkedIn, Slack, Facebook.

Make these all identical:
```html
<title>Business Growth Partner for Small Businesses | Novelio Technologies</title>
<meta name="description" content="Novelio is your dedicated business growth partner. We analyze your website, Google listing, leads, automation, and branding — then build and execute a tailored growth plan. Free audit for small businesses." />
<meta property="og:title" content="Business Growth Partner for Small Businesses | Novelio Technologies" />
<meta property="og:description" content="Novelio is your dedicated business growth partner. We analyze your website, Google listing, leads, automation, and branding — then build and execute a tailored growth plan. Free audit for small businesses." />
```

---

### H-4: Add Preconnect Hints for Analytics Domains
**File:** [index.html](index.html) — add before analytics scripts  
**Effort:** 5 minutes

```html
<link rel="preconnect" href="https://www.googletagmanager.com" />
<link rel="preconnect" href="https://www.google-analytics.com" />
<link rel="preconnect" href="https://www.clarity.ms" />
```

---

### H-5: Replace HowTo Schema with WebSite + SearchAction
**File:** [index.html](index.html)  
**Effort:** 15 minutes  
**Why:** After removing HowTo (C-4), add WebSite schema with SearchAction to enable sitelinks search box potential and establish the site entity anchor for cross-schema entity linking.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://www.noveliotech.com/#website",
  "url": "https://www.noveliotech.com",
  "name": "Novelio Technologies",
  "publisher": { "@id": "https://www.noveliotech.com/#organization" },
  "potentialAction": {
    "@type": "SearchAction",
    "target": { "@type": "EntryPoint", "urlTemplate": "https://www.noveliotech.com/blog?search={search_term_string}" },
    "query-input": "required name=search_term_string"
  }
}
</script>
```

---

### H-6: Upgrade LocalBusiness Schema in index.html
**File:** [index.html](index.html) — replace existing LocalBusiness block  
**Effort:** 20 minutes  
**Changes:** Add `@id`, `ImageObject` for logo/image, `foundingDate`, `openingHoursSpecification`, complete `sameAs` including YouTube/Twitter/Instagram.

Full corrected block provided in FULL-AUDIT-REPORT.md Section 4 "Corrected LocalBusiness Schema."

---

### H-7: Add BreadcrumbList Schema to Service Detail Pages
**File:** [src/pages/services/ServiceDetailPage.jsx](src/pages/services/ServiceDetailPage.jsx)  
**Effort:** 1 hour  
**Why:** Breadcrumb UI already exists in the JSX (lines 99-105). Adding schema is a configuration-only change that unlocks SERP breadcrumb rich results for all 8 service pages.

Update the `serviceSchema` object to an `@graph` containing both `Service` and `BreadcrumbList`. See FULL-AUDIT-REPORT.md Section 4 "Fix 5" for the complete corrected object.

---

### H-8: Add Service-Specific FAQ to 5 Affected Service Pages
**File:** [src/pages/services/ServiceDetailPage.jsx](src/pages/services/ServiceDetailPage.jsx)  
**Effort:** 2-3 hours  
**Why:** 5 of 8 service pages use the identical `DEFAULT_FAQ` content. Duplicate FAQ blocks are a thin-content signal. Each service needs at least 3 unique questions relevant to that service.

Add entries to `SERVICE_FAQS` for:
- `'google-business'`
- `'lead-generation'`
- `'email-marketing'`
- `'email-validator'`
- `'branding'`

---

### H-9: Fix areaServed Inconsistency in Service Schema
**File:** [src/pages/services/ServiceDetailPage.jsx](src/pages/services/ServiceDetailPage.jsx) — line 77  
**Effort:** 5 minutes

```js
// CHANGE FROM:
areaServed: { '@type': 'Place', name: 'Worldwide' },
// TO:
areaServed: { '@type': 'Country', name: 'United States' },
```

---

### H-10: Move FAQPage Schema to FAQSection Component
**File:** [index.html](index.html) + `src/components/home/FAQSection.jsx`  
**Effort:** 1 hour  
**Why:** The FAQPage block in `index.html` is served on every URL (including service and blog pages where the FAQ content doesn't exist). Move it into the `FAQSection.jsx` component via the `SEO.jsx` `schema` prop so it only renders on pages where it belongs.

Remove `<!-- Schema: FAQPage -->` block from `index.html`. Add `schema` prop to the `SEO` call inside `FAQSection.jsx` or `HomePage.jsx`.

---

## 🟡 MEDIUM — Do Within 4 Weeks (Estimated score impact: +8 points)

---

### M-1: Create /free-growth-audit Landing Page
**Effort:** 3-5 days  
**Why:** The primary conversion offer has no standalone URL. Competitors dominate "free digital marketing audit" SERP with dedicated landing pages. This page can also be linked from every blog post CTA.

Minimum content:
- H1: "Free 30-Minute Growth Audit for Small Businesses"
- What the audit covers (5-7 bullet points)
- What you receive (written action plan)
- Calendly booking embed OR working form
- Phone number with business hours
- 3 testimonials from audit recipients

---

### M-2: Add Calendly / Calendar Booking Widget
**Effort:** 2-4 hours  
**Why:** All 7 primary CTAs route to `tel:`. 40-60% of research happens outside business hours. Self-serve booking via Calendly or Cal.com creates an always-on conversion path.

Create a "Free Growth Audit — 30 min" event type in Calendly. Embed as a co-equal CTA in:
- Hero section (alongside phone CTA)
- CTABanner component
- Service detail pages
- Blog post CTAs

---

### M-3: Add Schema to Missing Pages
**Files:** [src/pages/BlogPage.jsx](src/pages/BlogPage.jsx), [src/pages/ServicesPage.jsx](src/pages/ServicesPage.jsx)  
**Effort:** 1-2 hours  

**BlogPage.jsx:** Add `CollectionPage` schema to `SEO` component
**ServicesPage.jsx:** Add `ItemList` schema mapping the `SERVICES` array to `SEO` component

See FULL-AUDIT-REPORT.md Section 4 "Fix 7" and "Fix 8" for complete schema blocks.

---

### M-4: Add @id to All @graph Nodes in Blog Schemas
**File:** [src/data/siteData.js](src/data/siteData.js)  
**Effort:** 1-2 hours  
**Why:** Without `@id` on each `@graph` node, Google cannot resolve relationships between the Article and FAQPage entities. Apply the corrected schema template from FULL-AUDIT-REPORT.md Section 4 "Fix 6" to all 6 blog posts.

---

### M-5: Fix Blog Post Slug Date Mismatch
**File:** [src/data/siteData.js](src/data/siteData.js)  
**Effort:** 30 minutes + hosting redirect  
**Why:** Slug `seo-trends-2025` contains a post titled "10 SEO Trends That Will Dominate in 2026" — the year mismatch signals dated content to SERP users.

1. Add new slug `seo-trends-2026` in `siteData.js`
2. Update `App.jsx` route if necessary
3. Add 301 redirect: `/blog/seo-trends-2025` → `/blog/seo-trends-2026` in hosting config

---

### M-6: Create a Branded 1200×630 OG Social Image
**Files:** [src/components/SEO.jsx](src/components/SEO.jsx) + [index.html](index.html)  
**Effort:** 2-4 hours (design)  
**Why:** The current OG image is `logo.png` — a logo renders poorly as a social share card.

1. Design `og-image.png` (1200×630px) with company name, tagline, and visual
2. Place in `/public/og-image.png`
3. Update `DEFAULT_IMAGE` in `SEO.jsx`: `const DEFAULT_IMAGE = \`${BASE_URL}/og-image.png\``
4. Update `og:image` in `index.html` to `/og-image.png`

---

### M-7: Remove Unused Dependencies
**File:** [package.json](package.json)  
**Effort:** 1-2 hours (test after removal)

1. Remove `react-hook-form` — not used anywhere in the codebase
2. Audit whether `gsap` and `aos` are actively used; if not, remove both

```bash
npm uninstall react-hook-form aos gsap @gsap/react
```

---

### M-8: Add Certification Badges with Verification Links
**File:** [src/pages/AboutPage.jsx](src/pages/AboutPage.jsx) — lines 205-209  
**Effort:** 2-4 hours  
**Why:** Currently rendered as plain text. Unlinked, unverified certification claims are actively flagged by Google's Quality Rater Guidelines.

Replace the text array with an array of objects containing `name`, `href` (verification URL), and optionally a badge image. If any certification is lapsed, remove it rather than display an unverifiable claim.

---

### M-9: Expand FAQ Schema Answers to 134-167 Words
**File:** [index.html](index.html) — FAQPage schema block  
**Effort:** 2 hours  
**Why:** All 6 FAQ answers average 52 words. The research-backed optimal citability window for Google AI Overviews is 134-167 words per answer. Short answers don't get cited.

Expand each answer to be a self-contained, fully useful passage. See example expansion in FULL-AUDIT-REPORT.md Section 6.

---

### M-10: Add apple-touch-icon and Remove Unused react-hook-form
**File:** [index.html](index.html)  
**Effort:** 30 minutes

Create a 180×180px `apple-touch-icon.png` and add:
```html
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
```

---

## 🟢 LOW — Backlog (Nice to have)

| ID | Action | File | Effort |
|---|---|---|---|
| L-1 | Add IndexNow key file for Bing/Yandex instant submission | `public/` | 30 min |
| L-2 | Add `twitter:creator` to SEO.jsx Twitter Card output | [src/components/SEO.jsx](src/components/SEO.jsx) | 10 min |
| L-3 | Add `openingHoursSpecification` to LocalBusiness schema | [index.html](index.html) | 20 min |
| L-4 | Add `noscript` fallback in body with company info | [index.html](index.html) | 30 min |
| L-5 | Add AI-specific robots.txt directives (allow GPTBot/ClaudeBot, block CCBot/Bytespider) | [public/robots.txt](public/robots.txt) | 30 min |
| L-6 | Add `Speakable` schema to FAQ section | FAQ component | 1 hour |
| L-7 | Fix geographic positioning inconsistency (schema says US-only; FAQ says worldwide) | [index.html](index.html) + [src/components/home/FAQSection.jsx](src/components/home/FAQSection.jsx) | 30 min |

---

## Content Roadmap (Longer-Term)

### Within 30 Days
- [ ] Create 2-3 case study pages at `/case-studies/:slug` on the main domain (not prodatahub.com)
- [ ] Add working contact form endpoint (C-3 above)
- [ ] Claim and complete Clutch.co profile — this is the fastest way to appear on page 1 for "digital marketing agency for small business" (via the Clutch listing, not the homepage)
- [ ] Link "5-Star Google Reviews" trust bar text to the actual Google Business Profile

### Within 60 Days
- [ ] Create `/free-growth-audit` dedicated landing page (M-1 above)
- [ ] Publish "What Is a Business Growth Partner?" blog post targeting definitional search intent
- [ ] Add a `/pricing` or `/packages` page with 3-tier structure — reduces pre-call friction for comparison shoppers
- [ ] Replace letter-avatar testimonials with real headshots and Google review links
- [ ] Implement Calendly booking as co-equal CTA (M-2 above)

### Within 90 Days
- [ ] Expand all 8 service pages to 1,200+ words (add process details, deliverables tables, service-specific testimonials)
- [ ] Resume blog publishing at 2 posts/month — prioritize long-tail queries where first-party data exists
- [ ] Build industry-specific landing pages at `/industries/:sector` — route already exists in App.jsx
- [ ] Replace initials-only team section with real photos and verified LinkedIn profiles
- [ ] Register and optimize on DesignRush and UpCity in addition to Clutch

---

## Sprint 1 Checklist (This Week)

Quick-win implementation order for maximum score uplift per hour spent:

- [ ] **C-1** (10 min): Add `_redirects` or `vercel.json` for SPA fallback
- [ ] **C-4** (5 min): Remove deprecated HowTo schema from `index.html`
- [ ] **H-3** (15 min): Align OG and meta tags in `index.html`
- [ ] **H-4** (5 min): Add preconnect hints for analytics
- [ ] **C-5** (30 min): Fix blog author type from Organization to Person in `siteData.js`
- [ ] **C-6** (20 min): Fix www inconsistency in all blog schemas
- [ ] **H-5** (15 min): Add WebSite + SearchAction schema to `index.html`
- [ ] **H-6** (20 min): Upgrade LocalBusiness schema (add @id, sameAs, openingHours, foundingDate)
- [ ] **H-9** (5 min): Fix service schema areaServed from Worldwide to United States
- [ ] **H-1** (2 hr): Create `public/llms.txt`
- [ ] **C-3** (2 hr): Connect contact form to Formspree or EmailJS
- [ ] **C-2** (4 hr): Add Vite prerendering

**Estimated Sprint 1 time:** 10-12 hours  
**Estimated score improvement:** +18-22 points (score ~60-64 after Sprint 1)

---

*Full technical details for each item are in [FULL-AUDIT-REPORT.md](FULL-AUDIT-REPORT.md).*
