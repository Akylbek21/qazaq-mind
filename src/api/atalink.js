// src/api/atalink.js
import { getJSON, postJSON } from "./client";
import MOCK_ARTICLES from "../data/atalinkArticles";

export const API = {
  ARTICLES: "/api/atalink/articles",
  ARTICLE:  (id) => `/api/atalink/articles/${id}`,
  QUESTIONS:(id) => `/api/atalink/articles/${id}/questions`,
  ANSWER:   "/api/atalink/answer",
  SUMMARY:  (id) => `/api/atalink/articles/${id}/summary`,
};

const ensureId = (name, v) => {
  if (v == null || v === "" || Number.isNaN(Number(v))) {
    throw new TypeError(`${name}: обязателен и должен быть числом/строкой ID`);
  }
  return v;
};

const LETTERS = ["A","B","C","D"];
const toLetterByIndex = (i) => LETTERS[i] ?? null;
const toLetter = (v) => {
  const c = String(v ?? "").trim().toUpperCase();
  if (!LETTERS.includes(c)) throw new TypeError("chosen должен быть A/B/C/D");
  return c;
};

export async function fetchAtaArticles(opts = {}) {
  try {
    const list = await getJSON(API.ARTICLES, opts);
    if (Array.isArray(list) && list.length > 0) return list;
    // fallthrough to mock in dev if empty
  } catch (e) {
    // если ошибка и мы в режиме разработки — вернуть мок
    if (import.meta.env && import.meta.env.DEV) {
      return MOCK_ARTICLES;
    }
    throw e;
  }
  // когда сервер вернул пустой массив — в dev используем локальный мок, иначе возвращаем []
  return import.meta.env && import.meta.env.DEV ? MOCK_ARTICLES : [];
}

export async function fetchAtaArticle(articleId, opts = {}) {
  const id = ensureId("fetchAtaArticle.articleId", articleId);
  return getJSON(API.ARTICLE(id), opts);
}

export async function fetchAtaArticleQuestions(articleId, opts = {}) {
  const id = ensureId("fetchAtaArticleQuestions.articleId", articleId);
  const raw = await getJSON(API.QUESTIONS(id), opts);
  return (Array.isArray(raw) ? raw : []).map((q) => ({
    id: q.id,
    prompt: q.prompt ?? "",
    options: [q.optionA, q.optionB, q.optionC, q.optionD].filter(Boolean),
    correctLetter: q.correct ?? null, // обычно бэк не должен отдавать, но у тебя есть — игнорим при подсчёте
    article: q.article,
  }));
}

export async function submitAtaAnswer({ questionId, chosen }, opts = {}) {
  const qid = ensureId("submitAtaAnswer.questionId", questionId);
  const letter = toLetter(chosen);
  return postJSON(API.ANSWER, { questionId: qid, chosen: letter }, opts);
}

export async function fetchAtaArticleSummary(articleId, opts = {}) {
  const id = ensureId("fetchAtaArticleSummary.articleId", articleId);
  return getJSON(API.SUMMARY(id), opts);
}

export const _utils = { toLetterByIndex, toLetter, LETTERS };

export default {
  fetchAtaArticles,
  fetchAtaArticle,
  fetchAtaArticleQuestions,
  submitAtaAnswer,
  fetchAtaArticleSummary,
  _utils,
};
