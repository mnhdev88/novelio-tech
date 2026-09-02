// ─────────────────────────────────────────────────────────────────────────────
// Site content loader.
//
// The data itself lives in /content/*.json so the admin panel can rewrite it
// (commit -> GitHub Action -> build + prerender -> deploy). This module only
// loads that JSON and rehydrates the few values JSON can't hold — currently
// just lucide icon components.
//
// Every export below keeps the exact name and shape it had when this file was
// hand-authored, so no consuming component needed to change. Do NOT hand-edit
// content here; edit /content/*.json (or use /admin).
// ─────────────────────────────────────────────────────────────────────────────

import {
  HeartPulse, ShoppingCart, Landmark, Hotel,
  Laptop, Factory, ShoppingBag, Wrench, Briefcase, Truck,
  Flower2, UtensilsCrossed, Car, PawPrint,
  Globe, Users, Phone, Repeat, Eye, ShieldCheck, MousePointerClick,
  Compass, Layers, Map, FormInput, Search, Star, ChartLine, Zap, Rocket,
  BarChart2, Target,
} from 'lucide-react';

import companyJson from '../../content/settings.json';
import statsJson from '../../content/stats.json';
import servicesJson from '../../content/services.json';
import industriesJson from '../../content/industries.json';
import testimonialsJson from '../../content/testimonials.json';
import teamJson from '../../content/team.json';
import processJson from '../../content/process.json';
import pricingJson from '../../content/pricing.json';
import navigationJson from '../../content/navigation.json';
import homepageJson from '../../content/homepage.json';
import blogIndex from '../../content/blog/index.json';

// Industry cards render `<industry.icon />` directly, so the stored icon *name*
// has to become a component again here. Adding an industry in the panel means
// picking from these keys — anything unknown falls back rather than crashing
// the page it appears on.
const INDUSTRY_ICONS = {
  HeartPulse, ShoppingCart, Landmark, Hotel,
  Laptop, Factory, ShoppingBag, Wrench, Briefcase, Truck,
  Flower2, UtensilsCrossed, Car, PawPrint,
};

export const COMPANY = companyJson;

// The phone is stored the way it should be displayed ("+1 (908) 639-5666"),
// which is not a valid `tel:` target. Every call link uses this instead of
// re-deriving it with a slightly different regex each time.
export const PHONE_TEL = `tel:${companyJson.phone.replace(/[^\d+]/g, '')}`;
export const STATS = statsJson;
export const SERVICES = servicesJson;
export const TESTIMONIALS = testimonialsJson;
export const TEAM = teamJson;
export const PROCESS_STEPS = processJson;

// Header links, the services dropdown flag, and the footer's legal row. Editing
// these in the panel is what lets the client reorder or rename menu items.
export const NAVIGATION = navigationJson;

// Homepage section copy. The panel edits the text; the icon set is fixed here
// because each one is a real component the sections render directly.
const HOME_ICONS = {
  Globe, Users, Phone, Repeat, Eye, ShieldCheck, MousePointerClick,
  Compass, Layers, Map, FormInput, Search, Star, ChartLine, Zap, Rocket,
  BarChart2, Target,
};

const withIcons = (rows) => rows.map((row) => ({ ...row, icon: HOME_ICONS[row.icon] || Star }));

export const HOMEPAGE = {
  ...homepageJson,
  growthSystem: { areas: withIcons(homepageJson.growthSystem.areas) },
  growthFramework: {
    pillars: withIcons(homepageJson.growthFramework.pillars),
    covers: withIcons(homepageJson.growthFramework.covers),
  },
  whyChooseUs: {
    pillars: withIcons(homepageJson.whyChooseUs.pillars),
    metrics: homepageJson.whyChooseUs.metrics,          // no icons
  },
};

export const INDUSTRIES = industriesJson.map((industry) => ({
  ...industry,
  icon: INDUSTRY_ICONS[industry.icon] || Briefcase,
}));

export const PRICING_PLANS = pricingJson.plans;
export const PRICING_COMPARISON = pricingJson.comparison;
export const PRICING_ADDONS = pricingJson.addons;
export const PRICING_FAQ = pricingJson.faq;

// ── Blog ─────────────────────────────────────────────────────────────────────
// One file per post; blog/index.json owns ordering and publish state so the
// panel can reorder or unpublish without rewriting post bodies.
//
// Scheduling is resolved at BUILD time, not in the browser: a scheduled post
// goes live on the next rebuild after its date (the deploy workflow runs daily),
// which keeps the prerendered HTML and the client-side list in agreement.
const POST_FILES = import.meta.glob('../../content/blog/*.json', { eager: true, import: 'default' });

const postBySlug = {};
for (const [filePath, post] of Object.entries(POST_FILES)) {
  if (filePath.endsWith('/index.json')) continue;
  postBySlug[post.slug] = post;
}

const BUILD_NOW = new Date();
const isLive = (entry) => {
  if (entry.status === 'draft') return false;
  if (entry.status === 'scheduled') return !!entry.publishAt && new Date(entry.publishAt) <= BUILD_NOW;
  return true;
};

export const BLOG_POSTS = blogIndex
  .filter((entry) => isLive(entry) && postBySlug[entry.slug])
  .map((entry) => postBySlug[entry.slug]);
