// src/api/sq.js
import { getJSON, postJSON } from "./client";

export const API = {
  BOOKS: "/api/sq/books",
  BOOK_QUESTIONS: (bookId) => `/api/sq/books/${bookId}/questions`,
  ANSWER: "/api/sq/answer",
  SUMMARY: (bookId) => `/api/sq/books/${bookId}/summary`,
};

const LETTERS = ["A", "B", "C", "D"];

export const fromIndex = (i) =>
  typeof i === "number" && i >= 0 && i < LETTERS.length ? LETTERS[i] : null;

export const toIndex = (letter) => {
  const idx = LETTERS.indexOf(String(letter ?? "").trim().toUpperCase());
  return idx >= 0 ? idx : -1;
};

export const toLetter = (value) => {
  const c = String(value ?? "").trim().toUpperCase();
  if (!LETTERS.includes(c)) throw new TypeError("chosen должен быть A/B/C/D");
  return c;
};

const ensureId = (name, v) => {
  if (v == null || v === "" || Number.isNaN(Number(v))) {
    throw new TypeError(`${name}: обязателен и должен быть числом/строкой ID`);
  }
  return v;
};

export async function fetchSQBooks(opts = {}) {
  const list = await getJSON(API.BOOKS, opts);
  return Array.isArray(list) ? list : [];
}

export async function fetchSQBookQuestions(bookId, opts = {}) {
  const id = ensureId("fetchSQBookQuestions.bookId", bookId);
  const list = await getJSON(API.BOOK_QUESTIONS(id), opts);
  return (Array.isArray(list) ? list : []).map((q) => ({
    id: q.id,
    book: q.book,
    prompt: q.prompt,
    options: [q.optionA, q.optionB, q.optionC, q.optionD].filter((v) => v != null),
    correctLetter: q.correct || null,
  }));
}

export async function submitSQAnswer({ questionId, chosen }, opts = {}) {
  const qid = ensureId("submitSQAnswer.questionId", questionId);
  const letter = toLetter(chosen);
  return postJSON(API.ANSWER, { questionId: qid, chosen: letter }, opts);
}

export async function fetchSQSummary(bookId, opts = {}) {
  const id = ensureId("fetchSQSummary.bookId", bookId);
  return getJSON(API.SUMMARY(id), opts);
}

// алиас для старых импортов
export { fetchSQSummary as fetchSQBookSummary };

export default {
  fetchSQBooks,
  fetchSQBookQuestions,
  submitSQAnswer,
  fetchSQSummary,
  fromIndex,
  toIndex,
  toLetter,
};
