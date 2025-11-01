// =============================================
// FILE: src/auth/AuthContext.jsx
// Контекст аутентификации: хранит пользователя, роль и методы login/logout
// =============================================
import React, { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("qm_user");
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  });

  const login = (payload) => {
    setUser(payload);
    localStorage.setItem("qm_user", JSON.stringify(payload));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("qm_user");
  };

  const value = useMemo(() => ({ user, login, logout }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
