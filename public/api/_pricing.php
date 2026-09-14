<?php
// ─────────────────────────────────────────────────────────────────────────────
// GENERATED FILE — DO NOT EDIT BY HAND.
// Written by scripts/gen-derived.mjs from content/pricing.json on every build.
// Edit prices in the admin panel (or content/pricing.json); this file follows.
//
// SINGLE SOURCE OF TRUTH for server-side pricing. Shared by BOTH payment
// integrations (paypal/ and razorpay/) so a price can never differ between
// gateways, and so the amount charged can never be set by the browser.
//
// Never web-served directly (leading-underscore files are denied in .htaccess,
// and it holds no secrets — only the public price list). Included server-side.
//
// Plan fields (top level = USD, the currency PayPal has always charged):
//   monthly        per-month price on the monthly option
//   yearly         per-month equivalent of the yearly price (display only)
//   yearly_total   flat one-payment price for 12 months. When present it is the
//                  authoritative yearly charge — do NOT compute monthly * 12.
//   upfront_months months collected at checkout on the monthly option; the
//                  remaining (12 - upfront_months) are billed later.
//   inr            the same three price fields in rupees, EX-GST. Razorpay adds
//                  GST on top at checkout; PayPal never reads this.
// ⚠ INR PRICES ARE UNCONFIRMED PLACEHOLDERS.
//   PLACEHOLDER INR PRICES — seeded from the USD figures at ₹88/$ and rounded to ₹100. Confirm every value in Admin → Pricing (or here) and set confirmed:true BEFORE switching Razorpay to live keys. GST is added on top at checkout, so these are ex-GST.
//   While inrPricing.confirmed is false in content/pricing.json, the Razorpay
//   endpoints REFUSE every INR charge (USD is unaffected). Set it to true once
//   the numbers are right.
//
// ─────────────────────────────────────────────────────────────────────────────

$GLOBALS['NOVELIO_PLANS'] = [
    'free'   => ['name' => 'Free',              'monthly' => 0,   'yearly' => 0, 'inr' => ['monthly' => 0, 'yearly' => 0]],
    'launch' => ['name' => 'Start My Growth',   'monthly' => 150, 'yearly' => 117, 'yearly_total' => 1400, 'upfront_months' => 3, 'inr' => ['monthly' => 13200, 'yearly' => 10267, 'yearly_total' => 123200]],
    'growth' => ['name' => 'Grow My Leads',     'monthly' => 300, 'yearly' => 242, 'yearly_total' => 2900, 'upfront_months' => 3, 'inr' => ['monthly' => 26400, 'yearly' => 21267, 'yearly_total' => 255200]],
    'scale'  => ['name' => 'Scale My Business', 'monthly' => 999, 'yearly' => 833, 'inr' => ['monthly' => 87900, 'yearly' => 73300]],
];

$GLOBALS['NOVELIO_ADDONS'] = [
    'extra-pages'   => ['name' => 'Extra website pages (5)',                  'price' => 39,  'price_inr' => 3400],
    'landing-page'  => ['name' => 'Additional landing page',                  'price' => 49,  'price_inr' => 4300],
    'email-credits' => ['name' => 'Extra email-validation credits (10k)',     'price' => 19,  'price_inr' => 1700],
    'ad-management' => ['name' => 'Ad-spend management',                      'price' => 199, 'price_inr' => 17500],
    'extra-content' => ['name' => 'Additional content (4 articles) / month',  'price' => 99,  'price_inr' => 8700],
];

// False until a human has confirmed the rupee figures above. Razorpay checks it
// before accepting an INR charge.
$GLOBALS['NOVELIO_INR_CONFIRMED'] = false;
