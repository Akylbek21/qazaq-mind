// src/lib/http.js
import axios from "axios";

// Один источник правды
const envBase = (import.meta.env.VITE_QAZAQMIND_SERVICE || "").replace(/\/$/, "");
// В dev удобно ходить через Vite proxy: baseURL="/api" -> proxy -> http://85.202.193.138:8087
const API_BASE = envBase || "/api";

if (import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.log("[HTTP] baseURL =", API_BASE);
}

const http = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  withCredentials: true, // на случай cookie-сессий
});

// Bearer из localStorage
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("qm_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // JSON по умолчанию для не-GET
  const m = (config.method || "get").toLowerCase();
  if (m !== "get" && !config.headers["Content-Type"]) {
    config.headers["Content-Type"] = "application/json";
  }
  return config;
});

// 401 -> logout; человеко-понятные сетевые ошибки
http.interceptors.response.use(
  (r) => r,
  async (err) => {
    const status = err?.response?.status;

    if (status === 401) {
      localStorage.removeItem("qm_token");
      localStorage.removeItem("qm_role");
      localStorage.removeItem("qm_username");
      // не зацикливаем редирект, если уже на /login
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
