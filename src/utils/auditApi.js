// Client for the free SEO audit endpoints.
//
// The split into two calls is deliberate and lives on the server side too: the
// HTML checks come back in a few seconds so the visitor sees a score almost
// immediately, and Google's PageSpeed result — which can take half a minute
// because Google loads the page in a real browser — fills in its card afterwards.

const BASE = '/api/audit';

// Stamped when this module loads, which is when the page carrying the form was
// rendered. The server rejects submissions completed impossibly fast after this;
// together with the hidden honeypot field it stands in for a CSRF token on a
// form that has no session behind it.
const PAGE_LOADED_AT = Date.now();

class AuditError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
  }
}

async function post(path, body) {
  let res;
  try {
    res = await fetch(`${BASE}/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ t: PAGE_LOADED_AT, page: window.location.pathname, ...body }),
    });
  } catch {
    throw new AuditError('We could not reach the audit service. Check your connection and try again.', 'network');
  }

  const raw = await res.text();

  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    // Not JSON. The overwhelmingly likely cause is that PHP never ran and the
    // SPA's own index.html came back instead — the endpoint is missing on the
    // server, or this is `npm run dev` with no API behind it. The visitor does
    // not need to know that; whoever is looking at the console does, because
    // the symptom on screen looks identical to a genuine audit failure.
    if (/^\s*<(!doctype|html)/i.test(raw)) {
      console.error(
        `[audit] ${BASE}/${path} returned HTML, not JSON — PHP did not run.\n` +
        'In local development, start the API with `npm run dev:api`. ' +
        'On a server, check that public/api/audit/ actually deployed.'
      );
    } else {
      console.error(`[audit] ${BASE}/${path} returned an unreadable response:`, raw.slice(0, 300));
    }
    throw new AuditError('Something went wrong running the audit. Please try again in a moment.', 'bad_response');
  }

  if (!res.ok || data?.error) {
    // The server writes these messages for the visitor on purpose — they explain
    // what is actually wrong with the site being audited — so pass them through
    // rather than replacing them with something generic.
    throw new AuditError(data?.error || 'Something went wrong running the audit.', data?.code);
  }

  return data;
}

export function runAudit(url) {
  return post('run.php', { url });
}

export function fetchSpeed(token) {
  return post('speed.php', { token });
}

export function unlockReport({ token, email, name, company, phone, consent }) {
  return post('unlock.php', { token, email, name, company, phone, consent });
}

export { AuditError };
