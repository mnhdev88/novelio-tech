// Dual-currency checkout maths.
//
// MUST MIRROR rzp_compute_charge() in public/api/razorpay/_lib.php and
// compute_charge() in public/api/paypal/_lib.php. If these diverge the gateway
// rejects the order on an amount mismatch — which is the intended failure, but a
// confusing one, so keep the two in step.
//
// Everything here works in MINOR UNITS (paise / cents) as integers, exactly like
// the server, so the GST split can't drift by a rounding unit between the number
// the buyer reads and the number that gets charged.

// Optional-chained so the module also imports cleanly under plain Node, where
// there is no import.meta.env — that is what lets scripts/test-pricing-parity.mjs
// diff this file against the PHP without a bundler.
export const GST_PERCENT = Number(import.meta.env?.VITE_GST_PERCENT || 18);

export const CURRENCIES = {
  USD: { code: 'USD', symbol: '$', locale: 'en-US' },
  INR: { code: 'INR', symbol: '₹', locale: 'en-IN' },
};

/** GST applies to INR (Novelio India) only; USD is billed by the US entity. */
export const gstPercentFor = (currency) => (currency === 'INR' ? GST_PERCENT : 0);

export const toMinor = (amount) => Math.round(Number(amount || 0) * 100);

/** Minor units → a grouped display string, e.g. 1557600 + INR → "15,576". */
export function formatMinor(minor, currency, { decimals = false } = {}) {
  const c = CURRENCIES[currency] || CURRENCIES.USD;
  const value = (Number(minor) || 0) / 100;
  return c.symbol + value.toLocaleString(c.locale, {
    minimumFractionDigits: decimals ? 2 : 0,
    maximumFractionDigits: decimals || value % 1 !== 0 ? 2 : 0,
  });
}

/** Format a whole-unit price (what the plan table stores) for display. */
export function formatAmount(amount, currency) {
  return formatMinor(toMinor(amount), currency);
}

/**
 * Per-currency price lookup on a plan from content/pricing.json.
 * USD lives in the original fields; INR in the parallel *INR fields.
 */
export function planPrices(plan, currency) {
  if (currency === 'INR') {
    return {
      monthly: plan.priceMonthlyINR ?? 0,
      yearly: plan.priceYearlyINR ?? 0,
      yearlyTotal: plan.priceYearlyTotalINR ?? null,
      termTotal: plan.termTotalINR ?? null,
    };
  }
  return {
    monthly: plan.priceMonthly ?? 0,
    yearly: plan.priceYearly ?? 0,
    yearlyTotal: plan.priceYearlyTotal ?? null,
    termTotal: plan.termTotal ?? null,
  };
}

export const addonPrice = (addon, currency) =>
  (currency === 'INR' ? addon.priceINR : addon.price) ?? 0;

/**
 * The whole order summary for a plan selection, in minor units.
 * `planDue` is the plan portion collected today, `recurring` is what follows.
 */
export function computeCharge({ plan, billing, addonIds = [], addons = [], currency = 'USD' }) {
  const price = planPrices(plan, currency);
  const isYearly = billing === 'yearly';
  const upfrontMonths = plan.upfrontMonths ?? 1;
  const isTermPlan = Boolean(price.termTotal);

  const addonMinor = addonIds.reduce((sum, id) => {
    const a = addons.find((x) => x.id === id);
    return sum + (a ? toMinor(addonPrice(a, currency)) : 0);
  }, 0);

  // Plan portion due today. Add-ons are always a single month on top and are
  // never multiplied into a yearly or upfront total.
  const yearlyTotalMinor = price.yearlyTotal !== null
    ? toMinor(price.yearlyTotal)
    : toMinor(price.yearly) * 12;
  const planDueMinor = isYearly ? yearlyTotalMinor : toMinor(price.monthly) * upfrontMonths;

  const subtotalMinor = planDueMinor + addonMinor;
  const gstPercent = gstPercentFor(currency);
  const gstMinor = Math.round((subtotalMinor * gstPercent) / 100);

  return {
    currency,
    isYearly,
    isTermPlan,
    upfrontMonths,
    monthlyMinor: toMinor(price.monthly) + addonMinor,
    planDueMinor,
    addonMinor,
    yearlyTotalMinor,
    termTotalMinor: price.termTotal !== null ? toMinor(price.termTotal) : 0,
    subtotalMinor,
    gstPercent,
    gstMinor,
    totalMinor: subtotalMinor + gstMinor,
    price,
  };
}
