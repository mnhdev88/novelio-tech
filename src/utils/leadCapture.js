// Mirror public form submissions into our own database so they show up in the
// admin panel's Leads inbox.
//
// This runs ALONGSIDE the existing Formspree / CRM calls, never instead of them:
// if the capture endpoint is down, misconfigured, or the panel was never
// installed on this server, the enquiry must still reach the team the way it
// always has. So every failure here is swallowed on purpose — a lead that gets
// delivered but not logged is a minor loss; a lead lost because a logging call
// threw is not acceptable.

const ENDPOINT = '/api/admin/capture.php';

// Stamped when this module loads, which is when the page carrying the form was
// rendered. The server rejects submissions completed impossibly fast after this,
// which is one of the three things standing in for a CSRF token on a public form
// (the others being a honeypot field and a per-IP rate limit).
const PAGE_LOADED_AT = Date.now();

export async function captureLead(type, fields) {
  try {
    await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        page: window.location.pathname,
        t: PAGE_LOADED_AT,
        ...fields,
      }),
    });
  } catch {
    // Intentionally silent — see the note above.
  }
}
