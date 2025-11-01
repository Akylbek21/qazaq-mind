// src/api/client.js
import http from "@/lib/http";

// Нормализуем путь: один ведущий слэш, без двойного /api
function normalizePath(p) {
  let s = String(p || "");
  if (!s.startsWith("/")) s = `/${s}`;
  const base = String(http.defaults.baseURL || "");
  // если base оканчивается на /api — уберём /api в начале пути
  if (/\/api\/?$/i.test(base)) s = s.replace(/^\/api(\/|$)/i, "/");
  // прибираем повторные слэши (кроме схемы http://)
  s = s.replace(/([^:])\/{2,}/g, "$1/");
  return s;
}

export async function getJSON(path, config = {}) {
  const { data } = await http.get(normalizePath(path), config);
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
export async function delJSON(path, config = {}) {
  const { data } = await http.delete(normalizePath(path), config);
  return data;
}

export default { getJSON, postJSON, putJSON, delJSON };
