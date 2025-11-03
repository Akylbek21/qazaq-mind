// src/api/pq.js
import { getJSON, postJSON } from "./client";

export const API = {
  TASKS: "/api/pq/tasks",
  ANSWER: "/api/pq/answer",
  SUMMARY: "/api/pq/summary",

  // Toggle endpoint: POST /api/pq/toggle/{{taskId}}?day={{today}}
  TOGGLE_TASK: (id, day) => {
    const path = `/api/pq/toggle/${id}`;
    return day ? `${path}?day=${encodeURIComponent(day)}` : path;
  },
};

const ensureId = (name, v) => {
  if (v == null || v === "" || Number.isNaN(Number(v))) {
    throw new TypeError(`${name}: обязателен и должен быть числом/строкой ID`);
  }
  return v;
};

// ==== существовавшие ранее функции ====
/**
 * Загрузить список PQ задач с сервера.
 * @param {{fallback?: boolean, withSource?: boolean}} opts
 * @returns {Promise<Array|{items: Array, source: string}>}
 */
export async function fetchPQTasks(opts = {}) {
  try {
    const list = await getJSON(API.TASKS, opts);
    const items = Array.isArray(list) ? list : [];
    
    // Если запрошен withSource, возвращаем объект с items и source
    if (opts?.withSource) {
      return { items, source: 'server' };
    }
    
    return items;
  } catch (e) {
    // Если есть fallback и произошла ошибка, возвращаем пустой результат
    if (opts?.fallback) {
      if (opts?.withSource) {
        return { items: [], source: 'fallback' };
      }
      return [];
    }
    throw e;
  }
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
 * @param {{taskId: number|string, day?: string}} payload - day в формате YYYY-MM-DD (по умолчанию сегодня)
 * @returns {Promise<{id: number, user: object, task: object, day: string, completed: boolean}>}
 */
export async function togglePQTask({ taskId, day }, opts = {}) {
  const id = ensureId("togglePQTask.taskId", taskId);
  
  // Если day не передан, используем сегодняшнюю дату
  const today = day || new Date().toISOString().split('T')[0];
  
  // POST /api/pq/toggle/{{taskId}}?day={{today}}
  const path = API.TOGGLE_TASK(id, today);
  
  // По API toggle обычно не требует body, но если нужно - можно передать пустой объект
  const res = await postJSON(path, {}, opts);
  
  // Логируем для отладки
  console.log("[pq.js] togglePQTask raw response:", res, "type:", Array.isArray(res) ? "array" : typeof res);
  
  // API может вернуть массив с одним объектом или просто объект
  // Обрабатываем оба случая
  const result = Array.isArray(res) ? res[0] : res;
  
  console.log("[pq.js] togglePQTask processed result:", result, "completed:", result?.completed);
  
  // Возвращаем весь объект ответа (содержит id, user, task, day, completed)
  return result;
}

// оставляем удобный default (если он использовался)
export default { fetchPQTasks, submitPQAnswer, fetchPQSummary, togglePQTask };
