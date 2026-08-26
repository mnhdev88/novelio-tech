<?php
// ─────────────────────────────────────────────────────────────────────────────
// GENERATED FILE — DO NOT EDIT BY HAND.
// Written by scripts/gen-derived.mjs from content/pricing.json on every build.
// Edit prices in the admin panel (or content/pricing.json); this file follows.
//
// SINGLE SOURCE OF TRUTH for server-side pricing. Shared by BOTH payment
// integrations (paypal/ and payoneer/) so a price can never differ between
// gateways, and so the amount charged can never be set by the browser.
//
// Never web-served directly (leading-underscore files are denied in .htaccess,
// and it holds no secrets — only the public price list). Included server-side.
//
// Plan fields:
//   monthly        per-month price on the monthly option
//   yearly         per-month equivalent of the yearly price (display only)
//   yearly_total   flat one-payment price for 12 months. When present it is the
//                  authoritative yearly charge — do NOT compute monthly * 12.
//   upfront_months months collected at checkout on the monthly option; the
//                  remaining (12 - upfront_months) are billed later.
// ─────────────────────────────────────────────────────────────────────────────

$GLOBALS['NOVELIO_PLANS'] = [
    'free'   => ['name' => 'Free',              'monthly' => 0,   'yearly' => 0],
    'launch' => ['name' => 'Start My Growth',   'monthly' => 150, 'yearly' => 117, 'yearly_total' => 1400, 'upfront_months' => 3],
    'growth' => ['name' => 'Grow My Leads',     'monthly' => 300, 'yearly' => 242, 'yearly_total' => 2900, 'upfront_months' => 3],
    'scale'  => ['name' => 'Scale My Business', 'monthly' => 999, 'yearly' => 833],
];

$GLOBALS['NOVELIO_ADDONS'] = [
    'extra-pages'   => ['name' => 'Extra website pages (5)',                  'price' => 39],
    'landing-page'  => ['name' => 'Additional landing page',                  'price' => 49],
    'email-credits' => ['name' => 'Extra email-validation credits (10k)',     'price' => 19],
    'ad-management' => ['name' => 'Ad-spend management',                      'price' => 199],
    'extra-content' => ['name' => 'Additional content (4 articles) / month',  'price' => 99],
];
