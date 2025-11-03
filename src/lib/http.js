// src/lib/http.js
import axios from "axios";

/* ---------------------------- База и хелперы ---------------------------- */

// Обрезаем хвостовые слэши
const trim = (s) => (s || "").replace(/\/+$/, "");

// Timeout для всех запросов (0 = без таймаута)
const DEFAULT_TIMEOUT = 0; // Timeout жоқ (шексіз күту)

// Источники baseURL, в порядке приоритета
// В dev режиме используем относительный путь (через Vite proxy)
// В production - через nginx proxy (/api) или прямой URL из env
const getBaseURL = () => {
  if (import.meta.env.DEV) {
    return "/api"; // Dev: через Vite proxy (избегаем CORS)
  }
  
  // Production: проверяем переменные окружения
  const envService = import.meta.env.VITE_QAZAQMIND_SERVICE?.trim();
  const envApiUrl = import.meta.env.VITE_QM_API_URL?.trim();
  
  // Если явно указан относительный путь (начинается с /), используем его
  if (envService?.startsWith("/")) {
    return envService;
  }
  if (envApiUrl?.startsWith("/")) {
    return envApiUrl;
  }
  
  // В production через nginx всегда используем /api (игнорируем прямые http:// URLs)
  // Если нужно использовать прямой URL, явно установите VITE_QAZAQMIND_SERVICE=/api
  return "/api";
};

const rawBase = getBaseURL();
export const API_BASE = trim(rawBase);

// Логируем всегда для отладки
// eslint-disable-next-line no-console
console.info("[HTTP] baseURL =", API_BASE);
// eslint-disable-next-line no-console
console.info("[HTTP] mode =", import.meta.env.DEV ? "DEV" : "PRODUCTION");
// eslint-disable-next-line no-console
console.info("[HTTP] env.VITE_QAZAQMIND_SERVICE =", import.meta.env.VITE_QAZAQMIND_SERVICE || "не установлено");
// eslint-disable-next-line no-console
console.info("[HTTP] timeout =", DEFAULT_TIMEOUT === 0 ? "DISABLED (шексіз күту)" : DEFAULT_TIMEOUT);

// Токен из известных мест
export function getAuthToken() {
  return (
    localStorage.getItem("qm_token") ||
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("access_token") ||
    null
  );
}

// Опционально: вручную задать/сбросить Bearer в дефолтные заголовки axios
export function setAuthToken(token) {
  if (token) {
    http.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete http.defaults.headers.common.Authorization;
  }
}

/* ------------------------------- Инстансы ------------------------------- */

const commonHeaders = {
  Accept: "application/json",
  "X-Client": "qazaq-mind-web",
  "X-App-Version": import.meta.env.VITE_APP_VERSION || "dev",
};

const http = axios.create({
  baseURL: API_BASE,
  timeout: DEFAULT_TIMEOUT,
  withCredentials: true, // полезно, если используете cookie-сессии
  headers: { ...commonHeaders },
});

// Публичный клиент без авторизации (для открытых эндпоинтов)
export const httpPublic = axios.create({
  baseURL: API_BASE,
  timeout: DEFAULT_TIMEOUT,
  withCredentials: true,
  headers: { ...commonHeaders },
});

/* ---------------------------- Перехватчики ------------------------------ */

// request: Bearer + корректный Content-Type (не трогаем FormData)
http.interceptors.request.use((config) => {
  config.headers = config.headers ?? {};

  if (!config.headers.Authorization) {
    const t = getAuthToken();
    if (t) config.headers.Authorization = `Bearer ${t}`;
  }

  const method = (config.method || "get").toLowerCase();
  const isFormData =
    typeof FormData !== "undefined" &&
    (config.data instanceof FormData || config.data?.__isFormData === true);

  if (method !== "get" && !isFormData && !config.headers["Content-Type"]) {
    config.headers["Content-Type"] = "application/json";
  }
  return config;
});

let redirecting = false;

http.interceptors.response.use(
  (r) => r,
  (err) => {
    const status = err?.response?.status;
    const cfg = err?.config || {};
    const headers = cfg.headers || {};
    const skip =
      headers["X-Skip-Auth-Redirect"] === "1" ||
      headers["x-skip-auth-redirect"] === "1";

    // Дружелюбные тексты для сетевых/таймаут-ошибок
    if (!err.response) {
      if (err.code === "ECONNABORTED") {
        err.message = `Таймаут запроса. Проверьте API_BASE: ${API_BASE}`;
      } else {
        err.message = `Сервер недоступен. Проверьте API_BASE: ${API_BASE}`;
      }
    }

    // 401 → чистим дефолтный Authorization и уводим на /login?expired=1 (если не skip)
    if (status === 401 && !skip && typeof window !== "undefined") {
      localStorage.removeItem("qm_token");
      localStorage.removeItem("qm_role");
      localStorage.removeItem("qm_username");
      delete http.defaults.headers.common.Authorization;

      if (!redirecting && !location.pathname.startsWith("/login")) {
        redirecting = true;
        window.location.assign("/login?expired=1");
      }
    }

    // Пробрасываем message от бэка, если он есть
    err.message = err?.response?.data?.message || err.message;
    return Promise.reject(err);
  }
);

export default http;
