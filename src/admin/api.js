// ─────────────────────────────────────────────────────────────────────────────
// Admin panel API client.
//
// Talks only to our own PHP endpoints under /api/admin. The GitHub token and the
// database credentials live server-side; nothing secret is ever held here.
//
// Auth is a plain session cookie (HttpOnly, so this file cannot read it) plus a
// CSRF token that the server hands back at login and expects on every mutation.
// The token is kept in memory only — putting it in localStorage would hand it to
// any XSS on the marketing site.
// ─────────────────────────────────────────────────────────────────────────────

const BASE = '/api/admin';

let csrf = null;

/** Raised for every non-2xx response, carrying the server's own wording. */
export class ApiError extends Error {
  constructor(message, { status, code } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

// Something outside the request (the provider) needs to react to a dropped
// session, so a 401 is broadcast rather than handled here.
const sessionLostHandlers = new Set();
export function onSessionLost(fn) {
  sessionLostHandlers.add(fn);
  return () => sessionLostHandlers.delete(fn);
}

async function request(endpoint, { method = 'GET', body, params, raw = false } = {}) {
  const url = new URL(`${BASE}/${endpoint}`, window.location.origin);
  for (const [k, v] of Object.entries(params || {})) {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
  }

  const headers = {};
  if (body !== undefined && !(body instanceof FormData)) headers['Content-Type'] = 'application/json';
  if (csrf && method !== 'GET') headers['X-Admin-Token'] = csrf;

  let res;
  try {
    res = await fetch(url, {
      method,
      headers,
      credentials: 'same-origin',
      body: body instanceof FormData ? body : (body !== undefined ? JSON.stringify(body) : undefined),
    });
  } catch {
    throw new ApiError('Could not reach the server. Check your connection and try again.', { code: 'offline' });
  }

  if (raw) {
    if (!res.ok) throw new ApiError('That download failed.', { status: res.status });
    return res;
  }

  // A crashed PHP process or an Apache error page is not JSON; say something
  // useful instead of throwing a raw parse error at the client.
  let data;
  const text = await res.text();
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new ApiError('The server returned an unexpected response. Please try again.', { status: res.status });
  }

  if (!res.ok) {
    if (res.status === 401 || data.code === 'csrf') {
      csrf = null;
      sessionLostHandlers.forEach((fn) => fn());
    }
    throw new ApiError(data.error || 'Something went wrong.', { status: res.status, code: data.code });
  }

  return data;
}

// ── Session ──────────────────────────────────────────────────────────────────

export const auth = {
  /** Restore an existing session on page load. Returns null when signed out. */
  async me() {
    const data = await request('login.php');
    csrf = data.csrf || null;
    return data.user ? { ...data.user, caps: data.caps || [] } : null;
  },

  async login(email, password) {
    const data = await request('login.php', { method: 'POST', body: { email, password } });
    csrf = data.csrf;
    return { ...data.user, caps: data.caps || [] };
  },

  async logout() {
    try {
      await request('logout.php', { method: 'POST' });
    } finally {
      csrf = null;
    }
  },
};

// ── Content ──────────────────────────────────────────────────────────────────

export const content = {
  /** One file — the draft version when there is one, otherwise what's published. */
  get: (path) => request('content.php', { params: { path } }),

  /** Directory listing with drafts merged in, so unpublished posts still appear. */
  list: (dir) => request('content.php', { params: { dir } }),

  /** Everything waiting to be published. */
  pending: () => request('content.php', { params: { pending: 1 } }),

  /**
   * Save a draft. Cheap and instant — no commit, no deploy.
   * Pass the base_sha the editor loaded so the server can spot a mid-edit publish.
   */
  save: (path, payload, baseSha) =>
    request('content.php', { method: 'POST', body: { path, payload, base_sha: baseSha } }),

  remove: (path) => request('content.php', { method: 'DELETE', params: { path } }),
};

// ── Publish ──────────────────────────────────────────────────────────────────

export const publish = {
  /** Commit every pending draft as ONE commit and start the deploy. */
  run: (message, force = false) => request('publish.php', { method: 'POST', body: { message, force } }),

  /** State of the most recent publish, for polling the progress bar. */
  status: () => request('publish.php'),
};

// ── Media ────────────────────────────────────────────────────────────────────

export const media = {
  list: () => request('media.php'),

  /** Commits the image immediately — the editor needs a URL back right away. */
  async upload(file, name) {
    const form = new FormData();
    form.append('file', file);
    if (name) form.append('name', name);
    // Multipart bypasses the JSON body, so the server reads CSRF from this field.
    if (csrf) form.append('csrf', csrf);
    return request('media.php', { method: 'POST', body: form });
  },
};

// ── Leads / team / audit ─────────────────────────────────────────────────────

export const leads = {
  list: (type, params) => request('leads.php', { params: { type, ...params } }),
  setStatus: (type, id, status) => request('leads.php', { method: 'POST', body: { type, id, status } }),
  exportUrl: (type, params) => {
    const url = new URL(`${BASE}/leads.php`, window.location.origin);
    url.searchParams.set('type', type);
    url.searchParams.set('export', 'csv');
    for (const [k, v] of Object.entries(params || {})) if (v) url.searchParams.set(k, v);
    return url.toString();
  },
};

export const users = {
  list: () => request('users.php'),
  create: (data) => request('users.php', { method: 'POST', body: data }),
  update: (data) => request('users.php', { method: 'POST', body: data }),
  remove: (id) => request('users.php', { method: 'DELETE', params: { id } }),
};

export const audit = {
  list: (params) => request('audit.php', { params }),
};
