<?php
// ─────────────────────────────────────────────────────────────────────────────
// Free SEO Audit — credentials TEMPLATE. Do NOT put the real key in this file
// (it ships publicly). Copy its contents into a file named:
//
//     novelio-audit-credentials.php
//
// and upload THAT one level ABOVE public_html (your Hostinger home directory),
// so it is never web-accessible and never wiped by the FTPS mirror deploy.
// See SEO-AUDIT-SETUP.md for step-by-step instructions.
//
// For LOCAL development only, you may instead save it next to this file as
// `credentials.local.php` (already gitignored).
// ─────────────────────────────────────────────────────────────────────────────

// Google PageSpeed Insights API key.
// Google Cloud Console -> APIs & Services -> Credentials -> Create API key, then
// enable "PageSpeed Insights API" on the same project. No billing required.
//
// RESTRICT THE KEY: on the key's page set "API restrictions" to PageSpeed
// Insights API only. The key is used server-side here, so an IP restriction set
// to this server's address is the tightest option; an unrestricted key that ever
// leaks can be used by anyone until you rotate it.
//
// Without this the audit still runs — the Speed section is simply hidden.
define('AUDIT_PSI_KEY', 'PASTE_YOUR_GOOGLE_API_KEY_HERE');

// Optional overrides:
// How long an audit of the same URL is reused before re-crawling (seconds).
// Also what keeps a refresh-happy visitor from burning the PSI quota.
// define('AUDIT_CACHE_TTL', 86400);
// Audits one IP address may start per hour.
// define('AUDIT_RATE_PER_HOUR', 10);
// Where a completed audit's lead notification is sent.
// define('AUDIT_NOTIFY_EMAIL', 'ajay@noveliotech.com');
