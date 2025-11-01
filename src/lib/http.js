// src/lib/http.js
import axios from "axios";

// Аккуратно обрезаем все хвостовые слэши
const trim = (s) => (s || "").replace(/\/+$/, "");

// Один источник правды
const envBase = trim(import.meta.env.VITE_QAZAQMIND_SERVICE);
// В dev удобно ходить через Vite proxy: baseURL="/api" -> proxy -> http://85.202.193.138:8087
const API_BASE = envBase || "/api";

if (import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.log("[HTTP] baseURL =", API_BASE);
}

const http = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  withCredentials: true, // если используете cookie-сессии — полезно
});

// Достаём Bearer из нескольких источников
const pickToken = () =>
  localStorage.getItem("qm_token") ||
  localStorage.getItem("access_token") ||
  sessionStorage.getItem("access_token") ||
  null;

http.interceptors.request.use((config) => {
  const token = pickToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // JSON по умолчанию для не-GET
  const m = (config.method || "get").toLowerCase();
  if (m !== "get" && !config.headers["Content-Type"]) {
    config.headers["Content-Type"] = "application/json";
  }
  return config;
});

// 401 -> logout (если не попросили пропустить редирект); человеко-понятные сетевые ошибки
http.interceptors.response.use(
  (r) => r,
  async (err) => {
    const status = err?.response?.status;

    // Если явно попросили пропустить редирект (см. config.headers['X-Skip-Auth-Redirect'])
    const skipAuthRedirect =
      err?.config?.headers && err.config.headers["X-Skip-Auth-Redirect"];

    if (status === 401 && !skipAuthRedirect) {
      localStorage.removeItem("qm_token");
      localStorage.removeItem("qm_role");
      localStorage.removeItem("qm_username");
      if (!location.pathname.startsWith("/login")) {
        location.href = "/login?expired=1";
      }
      throw err;
    }

    if (!err.response || err.code === "ERR_NETWORK") {
      err.message = `Сервер недоступен. Проверь API_BASE: ${API_BASE}`;
    }
    throw err;
  }
);

export default http;
