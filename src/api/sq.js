// src/api/sq.js
import { getJSON, postJSON } from "./client";

export const API = {
  BOOKS: "/api/sq/books",
  BOOK_QUESTIONS: (bookId) => `/api/sq/books/${bookId}/questions`,
  ANSWER: "/api/sq/answer",
  SUMMARY: (bookId) => `/api/sq/books/${bookId}/summary`,
};

// A/B/C/D
const LETTERS = ["A", "B", "C", "D"];
export const toLetter = (x) => {
  const c = String(x ?? "").trim().toUpperCase();
  if (!LETTERS.includes(c)) throw new TypeError("chosen должен быть A/B/C/D");
  return c;
};
export const fromIndex = (i) => LETTERS[i] ?? "A";

export async function fetchSQBooks(opts = {}) {
  return getJSON(API.BOOKS, opts);
}

export async function fetchSQBookQuestions(bookId, opts = {}) {
  if (!bookId) throw new TypeError("fetchSQBookQuestions: bookId обязателен");
  const list = await getJSON(API.BOOK_QUESTIONS(bookId), opts);
  // Нормализуем: options[] + correctLetter (если сервер прислал)
  return (Array.isArray(list) ? list : []).map((q) => ({
    id: q.id,
    book: q.book,
    prompt: q.prompt,
    options: [q.optionA, q.optionB, q.optionC, q.optionD].filter((v) => v != null),
    correctLetter: q.correct || null, // только для отображения, не для проверки
  }));
}

export async function submitSQAnswer({ questionId, chosen }, opts = {}) {
  if (!questionId) throw new TypeError("submitSQAnswer: questionId обязателен");
  const letter = toLetter(chosen);
  return postJSON(API.ANSWER, { questionId, chosen: letter }, opts);
}

export async function fetchSQBookSummary(bookId, opts = {}) {
  if (!bookId) throw new TypeError("fetchSQBookSummary: bookId обязателен");
  return getJSON(API.SUMMARY(bookId), opts);
}

const sqApi = {
  fetchSQBooks,
  fetchSQBookQuestions,
  submitSQAnswer,
  fetchSQBookSummary,
  toLetter,
  fromIndex,
};
export default sqApi;
