<?php
// ─────────────────────────────────────────────────────────────────────────────
// SINGLE SOURCE OF TRUTH for server-side pricing.
// Shared by BOTH payment integrations (paypal/ and payoneer/) so a price can
// never differ between gateways. Mirrors PRICING_PLANS / PRICING_ADDONS in
// src/data/siteData.js — KEEP IN SYNC with siteData.js when prices change.
//
// Never web-served directly (leading-underscore files are denied in .htaccess,
// and it holds no secrets — only the public price list). Included server-side.
// ─────────────────────────────────────────────────────────────────────────────

$GLOBALS['NOVELIO_PLANS'] = [
    // id      => [name, monthly, yearly-per-month]
    'free'   => ['name' => 'Free',              'monthly' => 0,   'yearly' => 0],
    'launch' => ['name' => 'Start My Growth',   'monthly' => 249, 'yearly' => 208],
    'growth' => ['name' => 'Grow My Leads',     'monthly' => 499, 'yearly' => 416],
    'scale'  => ['name' => 'Scale My Business', 'monthly' => 999, 'yearly' => 833],
];

$GLOBALS['NOVELIO_ADDONS'] = [
    'extra-pages'   => ['name' => 'Extra website pages (5)',                  'price' => 39],
    'landing-page'  => ['name' => 'Additional landing page',                  'price' => 49],
    'email-credits' => ['name' => 'Extra email-validation credits (10k)',     'price' => 19],
    'ad-management' => ['name' => 'Ad-spend management',                      'price' => 199],
    'extra-content' => ['name' => 'Additional content (4 articles) / month',  'price' => 99],
];
