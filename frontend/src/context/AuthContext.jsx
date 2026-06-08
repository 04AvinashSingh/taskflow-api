// ═══════════════════════════════════════════
// AuthContext — JWT storage & user state
// ═══════════════════════════════════════════

import { createContext, useContext, useState, useCallback, useMemo } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('taskflow_token'));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('taskflow_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback((newToken, userData) => {
    localStorage.setItem('taskflow_token', newToken);
    localStorage.setItem('taskflow_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('taskflow_token');
    localStorage.removeItem('taskflow_user');
    setToken(null);
    setUser(null);
  }, []);

  const isAuthenticated = !!token;
  const isAdmin = user?.role === 'ADMIN';

  const value = useMemo(
    () => ({ token, user, isAuthenticated, isAdmin, login, logout }),
    [token, user, isAuthenticated, isAdmin, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
