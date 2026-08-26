// ─────────────────────────────────────────────────────────────────────────────
// Admin panel session + publish state.
//
// Deliberately separate from src/portal/AuthContext.jsx: that one is the demo
// customer portal backed by localStorage, this one is real server-side auth.
// Sharing them would mean a demo signup could reach the CMS.
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import * as api from './api';

const AdminContext = createContext(null);

// How often to re-check a running deploy. The build takes 3-5 minutes, so this
// is slow on purpose — it only has to feel alive, not be precise.
const POLL_MS = 8000;

export function AdminProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);      // restoring the session
  const [pending, setPending] = useState([]);        // unpublished drafts
  const [deploy, setDeploy] = useState(null);        // most recent publish
  const pollRef = useRef(null);

  // ── Session ───────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    api.auth.me()
      .then((u) => { if (!cancelled) setUser(u); })
      // A failure here means signed-out or server-down; either way the login
      // screen is the right destination and it will surface the real error.
      .catch(() => { if (!cancelled) setUser(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // The server can drop a session at any time (expiry, disabled account). When
  // it does, fall back to the login screen instead of leaving a dead panel up.
  useEffect(() => api.onSessionLost(() => setUser(null)), []);

  const login = useCallback(async (email, password) => {
    const u = await api.auth.login(email, password);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    await api.auth.logout();
    setUser(null);
    setPending([]);
    setDeploy(null);
  }, []);

  const can = useCallback((cap) => !!user?.caps?.includes(cap), [user]);

  // ── Pending changes ───────────────────────────────────────────────────────
  const refreshPending = useCallback(async () => {
    if (!user) return;
    try {
      const { pending: rows } = await api.content.pending();
      setPending(rows || []);
    } catch {
      // The badge is informational; a hiccup here must not interrupt editing.
    }
  }, [user]);

  // Neither refresher setStates synchronously (both await first), so the
  // cascading-render the rule guards against cannot happen here.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { refreshPending(); }, [refreshPending]);

  // ── Deploy progress ───────────────────────────────────────────────────────
  const refreshDeploy = useCallback(async () => {
    if (!user) return null;
    try {
      const { publish } = await api.publish.status();
      setDeploy(publish);
      return publish;
    } catch {
      return null;
    }
  }, [user]);

  // Poll only while a build is actually running, and stop the moment it settles
  // — an idle panel should not be hitting the server (or GitHub) every 8s.
  useEffect(() => {
    const running = deploy && (deploy.status === 'building' || deploy.status === 'committed');
    if (!running) {
      clearInterval(pollRef.current);
      return undefined;
    }
    pollRef.current = setInterval(refreshDeploy, POLL_MS);
    return () => clearInterval(pollRef.current);
  }, [deploy, refreshDeploy]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { refreshDeploy(); }, [refreshDeploy]);

  /** `paths` publishes only those files and leaves the rest pending. */
  const publishAll = useCallback(async (message, force = false, paths = null) => {
    const res = await api.publish.run(message, force, paths);
    // A subset publish leaves the other drafts alone, so drop only what went out.
    setPending((rows) => (paths ? rows.filter((r) => !paths.includes(r.path)) : []));
    // Seed the bar from the response so it appears immediately, before the first poll.
    setDeploy({
      status: 'building',
      commit_sha: res.commit_sha,
      message: message || 'Content update',
      paths: JSON.stringify(res.paths),
      created_at: new Date().toISOString(),
    });
    return res;
  }, []);

  return (
    <AdminContext.Provider value={{
      user, loading, login, logout, can,
      pending, refreshPending,
      deploy, refreshDeploy, publishAll,
    }}>
      {children}
    </AdminContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within <AdminProvider>');
  return ctx;
}

/** Route guard. `cap` additionally requires a capability (see A_CAPS in _lib.php). */
export function RequireAdmin({ children, cap }) {
  const { user, loading } = useAdmin();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#F8FAFC]">
        <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-[#1B3172] animate-spin" />
      </div>
    );
  }

  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/admin/login?next=${next}`} replace />;
  }

  // Landing on a page your role can't open should explain itself, not bounce
  // silently to somewhere you didn't ask for.
  if (cap && !user.caps?.includes(cap)) {
    return (
      <div className="p-8">
        <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-2xl p-6 text-center">
          <h2 className="font-heading font-800 text-[#1B3172] text-lg mb-1">Not available on your account</h2>
          <p className="text-sm text-[#64748b]">
            This section is limited to admins. Ask an admin to change your role if you need access.
          </p>
        </div>
      </div>
    );
  }

  return children;
}
