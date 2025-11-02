// src/api/client.js
import http from "@/lib/http";

/**
 * normalizePath:
 *  - абсолютные URL (http://, https://, //) не трогаем
 *  - гарантируем один ведущий слэш
 *  - если baseURL заканчивается на '/api', снимаем ведущий '/api' у path
 *  - схлопываем повторные слэши в середине пути
 */
export function normalizePath(p) {
  let s = String(p ?? "");
  if (/^(https?:)?\/\//i.test(s)) return s; // абсолютный URL — возвращаем как есть

  if (!s.startsWith("/")) s = `/${s}`;
  const base = String(http.defaults.baseURL || "");

  if (/\/api\/?$/i.test(base)) {
    s = s.replace(/^\/api(\/|$)/i, "/");
  }

  // Не затрагиваем схему вида 'http://', но схлопываем лишние слэши дальше по пути
  s = s.replace(/([^:])\/{2,}/g, "$1/");
  return s;
}

/** Вспомогательное слияние config с безопасным объединением заголовков */
function mergeCfg(cfg, extra) {
  const headers = { ...(cfg?.headers || {}), ...(extra?.headers || {}) };
  return { ...cfg, ...extra, headers };
}

/** Добавляет заголовок, чтобы перехватчик 401 не редиректил на /login */
export function skipAuth(config) {
  return mergeCfg(config, { headers: { "X-Skip-Auth-Redirect": "1" } });
}

/* ----------------------------- JSON helpers ----------------------------- */
// ВАЖНО: для GET/DELETE можно передавать query-параметры через config.params

export async function getJSON(path, config = {}) {
  const { data } = await http.get(normalizePath(path), config);
  return data;
}

export async function delJSON(path, config = {}) {
  const { data } = await http.delete(normalizePath(path), config);
  return data;
}

export async function postJSON(path, body, config = {}) {
  const { data } = await http.post(normalizePath(path), body, config);
  return data;
}

export async function putJSON(path, body, config = {}) {
  const { data } = await http.put(normalizePath(path), body, config);
  return data;
}

export async function patchJSON(path, body, config = {}) {
  const { data } = await http.patch(normalizePath(path), body, config);
  return data;
}

/* --------------------------- Forms / Uploads ---------------------------- */
// НЕ ставим Content-Type вручную — axios добавит boundary сам
export async function postForm(path, formData, config = {}) {
  const { data } = await http.post(normalizePath(path), formData, config);
  return data;
}

/* ----------------------------- Downloads -------------------------------- */
export async function downloadBlob(path, config = {}) {
  const cfg = mergeCfg({ responseType: "blob" }, config);
  const res = await http.get(normalizePath(path), cfg);
  const cd = res.headers?.["content-disposition"] || "";
  const m = cd.match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i);
  const filename = m ? decodeURIComponent(m[1]) : "download.bin";
  const contentType = res.headers?.["content-type"] || "application/octet-stream";
  return { blob: res.data, filename, contentType };
}

const api = {
  normalizePath,
  skipAuth,
  getJSON,
  delJSON,
  postJSON,
  putJSON,
  patchJSON,
  postForm,
  downloadBlob,
};

export default api;
