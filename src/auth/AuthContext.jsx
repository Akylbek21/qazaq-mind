import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { jwtDecode } from "jwt-decode";
import http, { setAuthToken } from "../lib/http";

const AuthCtx = createContext(null);

const LS = {
  token: "qm_token",
  role: "qm_role",
  username: "qm_username",
};

// Роли храним в UPPERCASE, чтобы сравнение всегда было стабильным.
const normalizeRole = (r) => (r || "").toString().trim().toUpperCase();

function extractClaims(token, fallback = {}) {
  try {
    const p = jwtDecode(token) || {};
    const username = p.username || p.user || p.sub || fallback.username || null;

    let role =
      (Array.isArray(p.roles) && p.roles[0]) ||
      (Array.isArray(p.authorities) && p.authorities[0]) ||
      p.role ||
      fallback.role ||
      null;

    return { username, role: role ? normalizeRole(role) : null, payload: p };
  } catch {
    return {
      username: fallback.username || null,
      role: fallback.role ? normalizeRole(fallback.role) : null,
      payload: null,
    };
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [username, setUsername] = useState(null);

  // Инициализация из localStorage
  useEffect(() => {
    const t = localStorage.getItem(LS.token);
    const r = localStorage.getItem(LS.role);
    const u = localStorage.getItem(LS.username);
    if (t) {
      setToken(t);
      setAuthToken(t);
    }
    if (r) setRole(r);
    if (u) setUsername(u);
  }, []);

  // Единая установка состояния после успешной аутентификации
  const handleAuth = (t, possibleRole, possibleUsername) => {
    const { role: r, username: u } = extractClaims(t, {
      role: possibleRole,
      username: possibleUsername,
    });

    setToken(t);
    setRole(r);
    setUsername(u);

    localStorage.setItem(LS.token, t);
    if (r) localStorage.setItem(LS.role, r);
    if (u) localStorage.setItem(LS.username, u);

    setAuthToken(t);
  };

  // Регистрация → POST /api/auth/register
  // Если бэк вернет token, залогиним сразу; если нет — просто вернем data
  const register = async ({ username, password, role = "STUDENT" }) => {
    const { data } = await http.post(
      "/auth/register",
      { username, password, role },
      { headers: { "X-Skip-Auth-Redirect": "1" } }
    );
    const token = data?.token;
    if (token) handleAuth(token, data?.role ?? role, username);
    return data;
  };

  // Логин → POST /api/auth/login (ожидаем token в ответе)
  const login = async ({ username, password }) => {
    const { data } = await http.post(
      "/auth/login",
      { username, password },
      { headers: { "X-Skip-Auth-Redirect": "1" } }
    );
    const token = data?.token || data?.accessToken || data?.jwt || data?.id_token;
    if (!token) throw new Error("Токен не получен");
    handleAuth(token, data?.role, username);
  };

  const logout = () => {
    localStorage.removeItem(LS.token);
    localStorage.removeItem(LS.role);
    localStorage.removeItem(LS.username);
    setToken(null);
    setRole(null);
    setUsername(null);
    setAuthToken(null);
  };

  const value = useMemo(
    () => ({
      token,
      role,        // всегда UPPERCASE
      username,
      isAuthenticated: !!token,
      hasRole: (r) => normalizeRole(r) === role,
      register,
      login,
      logout,
      http,
    }),
    [token, role, username]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
