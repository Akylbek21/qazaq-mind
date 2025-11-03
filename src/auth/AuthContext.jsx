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
const ROLE_NAMES = {
  TEACHER: "Мұғалім",
  STUDENT: "Оқушы",
  PARENT: "Ата-ана",
};

const normalizeRole = (r) => (r || "").toString().trim().toUpperCase();

const getLocalizedRoleName = (role) => {
  const normalizedRole = normalizeRole(role);
  return ROLE_NAMES[normalizedRole] || normalizedRole || "—";
};

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
  const [user, setUser] = useState(null); // полный профиль (username, role, score и т.д.)

  // Загрузить профиль пользователя с API (если есть токен)
  const fetchProfile = async () => {
    try {
      const { data } = await http.get("/user/profile");
      if (data) {
        const u = data.username || data.user || data.name || null;
        const r = data.role ? String(data.role).toUpperCase() : null;
        
        // Сохраняем текущий score если сервер не вернул его (но обычно сервер всегда возвращает)
        const currentScore = user?.score;
        const newUser = {
          ...data,
          // Используем score с сервера, если он есть, иначе сохраняем текущий
          score: data.score !== undefined && data.score !== null ? data.score : (currentScore !== undefined ? currentScore : null)
        };
        
        setUser(newUser);
        if (u) setUsername(u);
        if (r) setRole(r);

        if (u) localStorage.setItem(LS.username, u);
        if (r) localStorage.setItem(LS.role, r);
      }
      return data;
    } catch (err) {
      // игнорируем ошибки здесь — авторизация всё равно работает
      return null;
    }
  };

  // Инициализация из localStorage
  useEffect(() => {
    const t = localStorage.getItem(LS.token);
    const r = localStorage.getItem(LS.role);
    const u = localStorage.getItem(LS.username);
    if (t) {
      setToken(t);
      setAuthToken(t);
      // Попробуем подгрузить профиль
      fetchProfile().catch(() => {});
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
    // оптимистично установим профиль (дальше обновим с сервера)
    // Не сбрасываем score - он будет обновлен с сервера через fetchProfile
    setUser((prev) => ({ 
      username: u || null, 
      role: r || null, 
      score: prev?.score ?? null 
    }));

    localStorage.setItem(LS.token, t);
    if (r) localStorage.setItem(LS.role, r);
    if (u) localStorage.setItem(LS.username, u);

    setAuthToken(t);
    // Попробуем загрузить актуальный профиль сразу
    fetchProfile().catch(() => {});
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
    setUser(null);
    setAuthToken(null);
  };

  const value = useMemo(
    () => ({
      token,
      role,        // всегда UPPERCASE
      username,
      user,
      isAuthenticated: !!token,
      hasRole: (r) => normalizeRole(r) === role,
      getLocalizedRoleName,
      register,
      login,
      logout,
      fetchProfile, // Экспорт для обновления профиля
      http,
    }),
    [token, role, username, user]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);