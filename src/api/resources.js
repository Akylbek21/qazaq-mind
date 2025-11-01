// src/api/resources.js
const API_BASE = (import.meta?.env?.VITE_QAZAQMIND_SERVICE || "").replace(/\/+$/, "");
const apiUrl = (p) => (/^https?:\/\//.test(p) ? p : `${API_BASE}${p}`);

const getToken = () =>
  localStorage.getItem("access_token") ||
  sessionStorage.getItem("access_token") ||
  null;

async function request(path, { method = "GET", body, headers, ...rest } = {}) {
  const h = {
    Accept: "application/json",
    ...(body ? { "Content-Type": "application/json" } : {}),
    ...(headers || {}),
  };
  const t = getToken();
  if (t) h.Authorization = `Bearer ${t}`;

  const res = await fetch(apiUrl(path), {
    method,
    headers: h,
    credentials: "include",
    mode: "cors",
    body: body ? JSON.stringify(body) : undefined,
    ...rest,
  });

  if (!res.ok) {
    // тыныш отырайық — UI бос тізіммен жұмыс істейді
    const msg = await res.text().catch(() => "");
    const err = new Error(`${res.status} ${res.statusText}${msg ? ` — ${msg.slice(0, 160)}` : ""}`);
    err.status = res.status;
    throw err;
  }

  return res.json();
}

export async function fetchResources(q = "") {
  try {
    const path = q ? `/api/resources?q=${encodeURIComponent(q)}` : `/api/resources`;
    const list = await request(path);
    return Array.isArray(list) ? list : [];
  } catch (_) {
    return []; // fallback: бос
  }
}

export default { fetchResources };
