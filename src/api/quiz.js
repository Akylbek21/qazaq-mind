// src/api/quiz.js
import { getJSON, postJSON } from "./client";

/** Маршруты IQ-сервиса */
export const API = {
  TESTS: "/api/iq/tests",
  TEST_QUESTIONS: (id) => `/api/iq/tests/${id}/questions`,
  ANSWER: "/api/iq/answer",
  TEST_SUMMARY: (id) => `/api/iq/tests/${id}/summary`,
};

/** Валидаторы */
const ensureId = (name, v) => {
  if (v == null || v === "" || Number.isNaN(Number(v))) {
    throw new TypeError(`${name}: обязателен и должен быть числом/строкой ID`);
  }
  return v;
};
const toLetter = (value) => {
  const c = String(value ?? "").trim().toUpperCase();
  if (!["A", "B", "C", "D"].includes(c)) {
    throw new TypeError("chosen должен быть A/B/C/D");
  }
  return c;
};

/** Список тестов */
export function fetchIQTests(opts = {}) {
  return getJSON(API.TESTS, opts);
}

/** Вопросы теста */
export function fetchIQTestQuestions(testId, opts = {}) {
  return getJSON(API.TEST_QUESTIONS(ensureId("fetchIQTestQuestions.testId", testId)), opts);
}

/** Один ответ */
export function submitIQAnswer({ questionId, chosen }, opts = {}) {
  const qid = ensureId("submitIQAnswer.questionId", questionId);
  const letter = toLetter(chosen);
  return postJSON(API.ANSWER, { questionId: qid, chosen: letter }, opts);
}

/** Батч ответов (параллельно) */
export function submitIQAnswerBatch(answers = [], opts = {}) {
  const jobs = (answers || []).map((a) => {
    try {
      const qid = ensureId("submitIQAnswerBatch[].questionId", a?.questionId);
      const letter = toLetter(a?.chosen);
      return postJSON(API.ANSWER, { questionId: qid, chosen: letter }, opts);
    } catch {
      return null;
    }
  }).filter(Boolean);
  return Promise.allSettled(jobs);
}

/** Итог по тесту */
export function fetchIQTestSummary(testId, opts = {}) {
  return getJSON(API.TEST_SUMMARY(ensureId("fetchIQTestSummary.testId", testId)), opts);
}

const quizApi = {
  fetchIQTests,
  fetchIQTestQuestions,
  submitIQAnswer,
  submitIQAnswerBatch,
  fetchIQTestSummary,
};

export default quizApi;
