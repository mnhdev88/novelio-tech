// ─────────────────────────────────────────────────────────────────────────────
// Demo portal data layer — localStorage only. NO backend, NO real auth, NO real
// payments. This exists so the full customer/admin experience can be demoed and
// clicked through. Every function here maps cleanly to a future real backend:
//   signup/login        → Supabase Auth / Clerk
//   createSubscription  → Stripe Checkout + webhook
//   cancel/changePlan   → Stripe Customer Portal
//   deliverables/admin  → Postgres tables + admin API
// Passwords are stored in plain text on purpose — this is a throwaway demo store.
// ─────────────────────────────────────────────────────────────────────────────

import { PRICING_PLANS, PRICING_ADDONS } from '../data/siteData';

const LS_KEY = 'novelio_portal_v1';

// Deterministic ids (no Math.random / Date.now at module load) ------------------
let _seq = 1;
const uid = (prefix) => `${prefix}_${Date.now().toString(36)}_${_seq++}`;

// Default deliverable checklist generated for each paid plan --------------------
const DELIVERABLE_TEMPLATES = {
  launch: ['Website design & build', 'Hosting + SSL setup', 'On-page SEO basics', 'Google Business Profile setup', 'Lead-capture form'],
  growth: ['Website design & build', 'Local + on-page SEO', 'Monthly content (1 article)', 'GBP management', 'Lead funnel + automation', 'Reporting dashboard'],
  scale:  ['Everything in Growth', 'Technical SEO + link building', 'Paid ads setup', 'Branding refresh', 'Dedicated growth manager onboarding'],
  free:   ['1-page starter site', 'Growth audit (30 min)', 'GBP checkup'],
};

function deliverablesFor(planId) {
  const titles = DELIVERABLE_TEMPLATES[planId] || DELIVERABLE_TEMPLATES.growth;
  return titles.map((title) => ({ id: uid('d'), title, status: 'pending' })); // pending | in_progress | delivered
}

// ── Seed data: an admin + a few demo customers so the panels look alive ────────
function seed() {
  const planById = Object.fromEntries(PRICING_PLANS.map((p) => [p.id, p]));
  const mkSub = (userId, planId, billing, addonIds, status) => {
    const plan = planById[planId];
    const base = billing === 'yearly' ? plan.priceYearly : plan.priceMonthly;
    const addonTotal = (addonIds || []).reduce((s, id) => s + (PRICING_ADDONS.find((a) => a.id === id)?.price || 0), 0);
    return {
      id: uid('sub'), userId, planId, billing,
      addonIds: addonIds || [],
      monthlyTotal: base + addonTotal,
      status, // active | cancelled
      createdAt: '2026-05-20',
      nextRenewal: billing === 'yearly' ? '2027-05-20' : '2026-07-20',
      deliverables: deliverablesFor(planId),
    };
  };

  const users = [
    { id: 'u_admin', name: 'Novelio Admin', email: 'admin@noveliotech.com', password: 'admin123', role: 'admin', createdAt: '2026-01-01' },
    { id: 'u_demo',  name: 'Demo Customer',  email: 'demo@noveliotech.com',  password: 'demo123',  role: 'customer', createdAt: '2026-05-20' },
    { id: 'u_mike',  name: 'Mike Reynolds',  email: 'mike@plumbingco.com',   password: 'demo123',  role: 'customer', createdAt: '2026-05-22' },
    { id: 'u_sara',  name: 'Sara Tran',      email: 'sara@glowsalon.com',    password: 'demo123',  role: 'customer', createdAt: '2026-06-01' },
  ];

  const subscriptions = [
    mkSub('u_demo', 'growth', 'monthly', ['extra-content'], 'active'),
    mkSub('u_mike', 'scale',  'yearly',  ['ad-management'], 'active'),
    mkSub('u_sara', 'launch', 'monthly', [], 'active'),
  ];
  // advance some deliverables so the demo shows progress
  subscriptions[0].deliverables.forEach((d, i) => { if (i < 2) d.status = 'delivered'; else if (i === 2) d.status = 'in_progress'; });
  subscriptions[1].deliverables.forEach((d, i) => { if (i < 3) d.status = 'delivered'; });

  const invoices = subscriptions.flatMap((sub) => ([
    { id: uid('inv'), userId: sub.userId, subscriptionId: sub.id, amount: sub.monthlyTotal, date: '2026-05-20', status: 'paid' },
    { id: uid('inv'), userId: sub.userId, subscriptionId: sub.id, amount: sub.monthlyTotal, date: '2026-06-20', status: 'paid' },
  ]));

  return { users, subscriptions, invoices, session: null };
}

// ── Persistence ────────────────────────────────────────────────────────────────
function read() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* corrupt / unavailable — reseed */ }
  const fresh = seed();
  write(fresh);
  return fresh;
}

function write(db) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(db)); } catch { /* ignore */ }
  return db;
}

// ── Auth ────────────────────────────────────────────────────────────────────────
export function getCurrentUser() {
  const db = read();
  if (!db.session) return null;
  return db.users.find((u) => u.id === db.session) || null;
}

export function signup({ name, email, password }) {
  const db = read();
  const exists = db.users.some((u) => u.email.toLowerCase() === email.toLowerCase());
  if (exists) return { error: 'An account with this email already exists. Try signing in.' };
  const user = { id: uid('u'), name, email, password, role: 'customer', createdAt: '2026-06-11' };
  db.users.push(user);
  db.session = user.id;
  write(db);
  return { user };
}

export function login({ email, password }) {
  const db = read();
  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user || user.password !== password) return { error: 'Invalid email or password.' };
  db.session = user.id;
  write(db);
  return { user };
}

export function logout() {
  const db = read();
  db.session = null;
  write(db);
}

// ── Subscriptions ────────────────────────────────────────────────────────────────
export function getMySubscription(userId) {
  const db = read();
  return db.subscriptions.find((s) => s.userId === userId && s.status === 'active')
    || db.subscriptions.find((s) => s.userId === userId)
    || null;
}

export function getMyInvoices(userId) {
  return read().invoices.filter((i) => i.userId === userId).sort((a, b) => (a.date < b.date ? 1 : -1));
}

// Demo "checkout" — no real charge. Creates an active subscription + first invoice.
export function createSubscription({ userId, planId, billing, addonIds }) {
  const db = read();
  const plan = PRICING_PLANS.find((p) => p.id === planId);
  if (!plan) return { error: 'Unknown plan.' };
  // Replace any existing active sub for this user (upgrade/downgrade)
  db.subscriptions.forEach((s) => { if (s.userId === userId && s.status === 'active') s.status = 'cancelled'; });
  const base = billing === 'yearly' ? plan.priceYearly : plan.priceMonthly;
  const addonTotal = (addonIds || []).reduce((s, id) => s + (PRICING_ADDONS.find((a) => a.id === id)?.price || 0), 0);
  const sub = {
    id: uid('sub'), userId, planId, billing,
    addonIds: addonIds || [],
    monthlyTotal: base + addonTotal,
    status: 'active',
    createdAt: '2026-06-11',
    nextRenewal: billing === 'yearly' ? '2027-06-11' : '2026-07-11',
    deliverables: deliverablesFor(planId),
  };
  db.subscriptions.push(sub);
  if (base + addonTotal > 0) {
    db.invoices.push({ id: uid('inv'), userId, subscriptionId: sub.id, amount: base + addonTotal, date: '2026-06-11', status: 'paid' });
  }
  write(db);
  return { subscription: sub };
}

export function cancelSubscription(subId) {
  const db = read();
  const sub = db.subscriptions.find((s) => s.id === subId);
  if (sub) sub.status = 'cancelled';
  write(db);
  return sub;
}

export function changeBilling(subId, billing) {
  const db = read();
  const sub = db.subscriptions.find((s) => s.id === subId);
  if (sub) {
    const plan = PRICING_PLANS.find((p) => p.id === sub.planId);
    const base = billing === 'yearly' ? plan.priceYearly : plan.priceMonthly;
    const addonTotal = sub.addonIds.reduce((s2, id) => s2 + (PRICING_ADDONS.find((a) => a.id === id)?.price || 0), 0);
    sub.billing = billing;
    sub.monthlyTotal = base + addonTotal;
    sub.nextRenewal = billing === 'yearly' ? '2027-06-11' : '2026-07-11';
  }
  write(db);
  return sub;
}

// ── Admin ─────────────────────────────────────────────────────────────────────────
export function getAllCustomers() {
  const db = read();
  return db.users
    .filter((u) => u.role === 'customer')
    .map((u) => ({
      ...u,
      subscription: db.subscriptions.find((s) => s.userId === u.id && s.status === 'active')
        || db.subscriptions.find((s) => s.userId === u.id) || null,
    }));
}

export function adminStats() {
  const db = read();
  const active = db.subscriptions.filter((s) => s.status === 'active');
  const mrr = active.reduce((sum, s) => sum + (s.billing === 'yearly' ? s.monthlyTotal : s.monthlyTotal), 0);
  return {
    customers: db.users.filter((u) => u.role === 'customer').length,
    activeSubs: active.length,
    mrr,
    paidInvoices: db.invoices.filter((i) => i.status === 'paid').length,
  };
}

const NEXT_STATUS = { pending: 'in_progress', in_progress: 'delivered', delivered: 'pending' };
export function cycleDeliverable(subId, deliverableId) {
  const db = read();
  const sub = db.subscriptions.find((s) => s.id === subId);
  const d = sub?.deliverables.find((x) => x.id === deliverableId);
  if (d) d.status = NEXT_STATUS[d.status] || 'pending';
  write(db);
  return sub;
}

// Test helper / "reset demo" button
export function resetDemo() {
  write(seed());
}
