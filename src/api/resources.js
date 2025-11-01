// src/api/resources.js
import { getJSON } from "./client";

// Нормализуем разные форматы ответа (массив или {data:[...]})
function normalize(payload) {
  const arr = Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : [];
  return arr.map((r) => ({
    id: r.id ?? r.uuid ?? r._id ?? Math.random().toString(36).slice(2),
    title: r.title || r.name || "Untitled",
    url: r.url || r.link || "",
    description: r.description || r.desc || "",
    // сервер иногда шлёт "tags" строкой — приведём к массиву
    tags: Array.isArray(r.tags) ? r.tags : String(r.tags || "").split(/[,\s]+/).filter(Boolean),
  }));
}

export async function fetchResources(q = "") {
  const qv = q && q.trim() ? q.trim() : "*";

  // Попытка №1: /api/resources?q=<значение или '*'>
  try {
    const res1 = await getJSON(`/api/resources?q=${encodeURIComponent(qv)}`);
    return normalize(res1);
  } catch (e1) {
    // Попытка №2: без q (на случай, если сервер как раз ждёт пустой параметр)
    try {
      const res2 = await getJSON(`/api/resources`);
      return normalize(res2);
    } catch (e2) {
      // Попытка №3: с пустым q
      try {
        const res3 = await getJSON(`/api/resources?q=`);
        return normalize(res3);
      } catch {
        // Всё упало — пробрасываем исходную ошибку (чтобы в UI показался текст)
        throw e1;
      }
    }
  }
}

export default { fetchResources };
