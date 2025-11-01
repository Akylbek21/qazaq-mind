// src/auth/AuthContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { jwtDecode } from "jwt-decode";
import http from "../lib/http";

const AuthCtx = createContext(null);

const normalizeRole = (r) => (r || "").toString().trim().toLowerCase();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [username, setUsername] = useState(null);

  useEffect(() => {
    const t = localStorage.getItem("qm_token");
    const r = localStorage.getItem("qm_role");
    const u = localStorage.getItem("qm_username");
    if (t) setToken(t);
    if (r) setRole(r);
    if (u) setUsername(u);
  }, []);

  const handleAuth = (t, r, u) => {
    try {
      jwtDecode(t); // валидация JWT (опционально)
    } catch {
      /* ignore */
    }
    const rr = normalizeRole(r);
    localStorage.setItem("qm_token", t);
    if (rr) localStorage.setItem("qm_role", rr);
    if (u) localStorage.setItem("qm_username", u);
    setToken(t);
    setRole(rr || null);
    setUsername(u || null);
  };

  // Регистрация (сервер возвращает token? — логиним сразу)
  const register = async ({ username, password, role = "STUDENT" }) => {
    const body = { username, password, role };
    const { data } = await http.post("/auth/register", body, {
      headers: { "X-Skip-Auth-Redirect": "1" }, // не редиректить на 401
    });
    if (data?.token) {
      handleAuth(data.token, data.role ?? role, username);
    }
    return data;
  };

  const login = async ({ username, password }) => {
    const { data } = await http.post(
      "/auth/login",
      { username, password },
      { headers: { "X-Skip-Auth-Redirect": "1" } }
    );
    if (!data?.token) throw new Error("Токен не получен");
    handleAuth(data.token, data.role, username);
  };

  const logout = () => {
    localStorage.removeItem("qm_token");
    localStorage.removeItem("qm_role");
    localStorage.removeItem("qm_username");
    setToken(null);
    setRole(null);
    setUsername(null);
  };

  const isAuthenticated = !!token;

  const value = useMemo(
    () => ({ token, role, username, isAuthenticated, login, register, logout }),
    [token, role, username, isAuthenticated]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
