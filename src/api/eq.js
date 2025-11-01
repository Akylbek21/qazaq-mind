// src/api/eq.js
import { getJSON, postJSON } from "./client";

export const API = {
  RANDOM_CARD: "/api/eq/card/random",
  SUBMIT: "/api/eq/submit",
};

const toTags = (t) =>
  Array.isArray(t) ? t :
  (typeof t === "string" ? t.split(",").map(s => s.trim()).filter(Boolean) : []);

export async function fetchEQRandomCard(opts = {}) {
  const raw = await getJSON(API.RANDOM_CARD, opts);
  return {
    id: raw?.id,
    text: raw?.text ?? "",
    tags: toTags(raw?.tags),
  };
}

export async function submitEQAnswer({ cardId, text, audioUrl = null }, opts = {}) {
  if (!cardId) throw new TypeError("submitEQAnswer: cardId обязателен");
  if (!text || !text.trim()) throw new TypeError("submitEQAnswer: text обязателен");
  return postJSON(API.SUBMIT, { cardId, text, audioUrl }, opts);
}
