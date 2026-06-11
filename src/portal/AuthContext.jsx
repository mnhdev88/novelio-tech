import { createContext, useContext, useState, useCallback } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import * as store from './store';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => store.getCurrentUser());

  const signup = useCallback((data) => {
    const res = store.signup(data);
    if (res.user) setUser(res.user);
    return res;
  }, []);

  const login = useCallback((data) => {
    const res = store.login(data);
    if (res.user) setUser(res.user);
    return res;
  }, []);

  const logout = useCallback(() => {
    store.logout();
    setUser(null);
  }, []);

  // Lets pages refresh the cached user after a mutation (rare).
  const refresh = useCallback(() => setUser(store.getCurrentUser()), []);

  return (
    <AuthContext.Provider value={{ user, signup, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}

// Route guard. `adminOnly` restricts to the team back-office.
export function ProtectedRoute({ children, adminOnly = false }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }
  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}
