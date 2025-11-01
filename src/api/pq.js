// src/api/pq.js
import { getJSON, postJSON } from "./client";

export const API = {
  TASKS: "/api/pq/tasks",
  ANSWER: "/api/pq/answer",
  SUMMARY: "/api/pq/summary",

  // возможные варианты для "toggle"
  TOGGLE_TASK: (id) => `/api/pq/tasks/${id}/toggle`,
  TASK_STATUS: (id) => `/api/pq/tasks/${id}/status`,
  TOGGLE_FALLBACK: "/api/pq/toggle",
};

const ensureId = (name, v) => {
  if (v == null || v === "" || Number.isNaN(Number(v))) {
    throw new TypeError(`${name}: обязателен и должен быть числом/строкой ID`);
  }
  return v;
};

// ==== существовавшие ранее функции (оставь как были) ====
export async function fetchPQTasks(opts = {}) {
  const list = await getJSON(API.TASKS, opts);
  return Array.isArray(list) ? list : [];
}

export async function submitPQAnswer({ taskId, chosen }, opts = {}) {
  if (!taskId) throw new TypeError("submitPQAnswer: taskId обязателен");
  if (chosen == null) throw new TypeError("submitPQAnswer: chosen обязателен");
  return postJSON(API.ANSWER, { taskId, chosen }, opts);
}

export async function fetchPQSummary(opts = {}) {
  return getJSON(API.SUMMARY, opts);
}

// ==== НОВОЕ: togglePQTask ====
/**
 * Переключить/установить состояние задачи PQ.
 * @param {{taskId: number|string, done?: boolean, status?: 'OPEN'|'DONE'}} payload
 */
export async function togglePQTask({ taskId, done = undefined, status = undefined }, opts = {}) {
  const id = ensureId("togglePQTask.taskId", taskId);
  // нормализуем вход
  const normalized = {
    done: typeof done === "boolean" ? done : undefined,
    status: status || (typeof done === "boolean" ? (done ? "DONE" : "OPEN") : undefined),
  };

  const candidates = [
    // самый частый вариант: POST /tasks/{id}/toggle { done: boolean }
    { path: API.TOGGLE_TASK(id), body: { done: normalized.done } },

    // иногда: POST /tasks/{id}/status { status: 'OPEN'|'DONE' }
    { path: API.TASK_STATUS(id), body: { status: normalized.status } },

    // универсальный фолбэк: POST /toggle { taskId, done }
    { path: API.TOGGLE_FALLBACK, body: { taskId: id, done: normalized.done } },
  ];

  let lastErr;
  for (const c of candidates) {
    try {
      // пропускаем варианты, где тело пустое/бессмысленное
      if (c.body && Object.values(c.body).every((v) => v === undefined)) continue;
      const res = await postJSON(c.path, c.body, opts);
      return res;
    } catch (e) {
      lastErr = e;
      // пробуем следующий маршрут
    }
  }
  throw lastErr || new Error("togglePQTask: ни один из вариантов маршрута не сработал");
}

// оставляем удобный default (если он использовался)
export default { fetchPQTasks, submitPQAnswer, fetchPQSummary, togglePQTask };
