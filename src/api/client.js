// src/api/client.js
// ЕДИНАЯ точка входа для всех запросов

const BASE = (import.meta?.env?.VITE_QAZAQMIND_SERVICE || "").replace(/\/+$/, ""); // "" => будем ходить на /api/*
const cut = (s, n = 180) => (s && s.length > n ? `${s.slice(0, n)}…` : s || "");

const buildUrl = (path) => (/^https?:\/\//.test(path) ? path : `${BASE}${path}`);

export const getToken = () =>
  localStorage.getItem("access_token") ||
  sessionStorage.getItem("access_token") ||
  null;

const authHeaders = () => {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
};

export function debugAuth() {
  // Удобный лог: видно, куда бьем и есть ли токен
  // Если BASE пустой — ждём vite proxy на /api
  console.info(
    "[api-client] BASE =",
    BASE || "(proxy:/api)",
    "| token?",
    !!getToken()
  );
}

export async function getJSON(path) {
  const r = await fetch(buildUrl(path), {
    method: "GET",
    headers: { Accept: "application/json", ...authHeaders() },
    credentials: "include", // на случай куки-сессии
    mode: "cors",
  });
  if (!r.ok) {
    let txt = "";
    try { txt = await r.text(); } catch {}
    throw new Error(`${r.status} ${r.statusText}${txt ? " — " + cut(txt) : ""}`);
  }
  return r.json();
}

export async function postJSON(path, body = {}) {
  const r = await fetch(buildUrl(path), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...authHeaders(),
    },
    credentials: "include",
    mode: "cors",
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    let txt = "";
    try { txt = await r.text(); } catch {}
    throw new Error(`${r.status} ${r.statusText}${txt ? " — " + cut(txt) : ""}`);
  }
  return r.json();
}
