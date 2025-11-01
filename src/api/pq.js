// src/api/pq.js
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
    const text = await res.text().catch(() => "");
    const err = new Error(`${res.status} ${res.statusText}${text ? ` — ${text.slice(0, 200)}` : ""}`);
    err.status = res.status;
    throw err;
  }

  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}

const PQ_FALLBACK_TASKS = [
  { id: 1, title: "Таңғы 30 мин — телефон жоқ", description: "No phone for first 30m", daily: true, code: "MORNING_NO_PHONE_30M" },
  { id: 2, title: "Ұйқыға 30 мин қалғанда — телефон жоқ", description: "No phone 30m before sleep", daily: true, code: "EVENING_NO_PHONE_30M" },
  { id: 3, title: "15 мин жаяу жүру", description: "Walk 15 minutes", daily: true, code: "WALK_15M" },
  { id: 4, title: "5 мин созылу", description: "Stretch 5 minutes", daily: true, code: "STRETCH_5M" },
];

function parseToggleResponse(res) {
  const row = Array.isArray(res) ? res[0] : res;
  return row && typeof row?.completed === "boolean" ? row.completed : true;
}

export async function fetchPQTasks({ fallback = true } = {}) {
  try {
    const list = await request("/api/pq/tasks");
    return Array.isArray(list) ? list : [];
  } catch (e) {
    if (fallback && (e.status === 0 || e.status === 401 || e.status === 403 || e.status === 404)) {
      return PQ_FALLBACK_TASKS;
    }
    throw e;
  }
}

export async function togglePQTask(taskId, day) {
  const path = `/api/pq/toggle/${taskId}?day=${encodeURIComponent(day)}`;
  try {
    const res = await request(path, { method: "POST", body: {} });
    return parseToggleResponse(res);
  } catch (_) {
    const res2 = await request(path, { method: "GET" });
    return parseToggleResponse(res2);
  }
}

const pqApi = { fetchPQTasks, togglePQTask };
export default pqApi;
