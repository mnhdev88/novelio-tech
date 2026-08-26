<?php
// ─────────────────────────────────────────────────────────────────────────────
// Admin panel credentials — TEMPLATE.
//
// Copy this to `novelio-admin-credentials.php` and upload it ONE level ABOVE
// public_html (same place as novelio-paypal-credentials.php). It must NOT live
// inside public_html: the deploy is an FTPS mirror of dist/, so anything in the
// web root that isn't in dist/ is deleted on the next deploy — and anything in
// the web root is publicly reachable.
//
// See ADMIN-SETUP.md for the full walkthrough.
// ─────────────────────────────────────────────────────────────────────────────

// No database. The panel stores its data as files in `novelio-admin-data/`,
// created automatically next to this file — above the web root, so the FTPS
// deploy (which mirrors dist/ and deletes anything else under public_html)
// cannot wipe it and nobody can fetch it over HTTP. Back it up by copying that
// folder.

// ── GitHub (fine-grained PAT, Contents: Read and write, THIS REPO ONLY) ──────
// The panel commits content/*.json through this token. It never reaches the
// browser — PHP is the only thing that ever sees it.
define('ADMIN_GH_OWNER',  'mnhdev88');
define('ADMIN_GH_REPO',   'novelio-tech');
define('ADMIN_GH_BRANCH', 'main');
define('ADMIN_GH_TOKEN',  'github_pat_REPLACE_ME');

// ── One-time install key ─────────────────────────────────────────────────────
// Required by install.php to create the tables and the first admin account.
// Change it to any long random string; install.php refuses to run without it.
define('ADMIN_INSTALL_KEY', 'change-me-to-a-long-random-string');

// ── Optional ─────────────────────────────────────────────────────────────────
// Where "new lead" notifications go. Defaults to the PayPal notify address.
define('ADMIN_NOTIFY_EMAIL', 'ajay@noveliotech.com');
