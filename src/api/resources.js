// src/api/resources.js
import { getJSON } from "./client";

/**
 * Ресурстарды алу (іздеумен немесе барлығы)
 * GET /api/resources
 * GET /api/resources?q=search_query
 */
export async function fetchResources(query = "") {
  const q = String(query || "").trim();
  
  // Егер query бар болса, іздеу
  if (q && q !== "*") {
    return getJSON(`/resources?q=${encodeURIComponent(q)}`);
  }
  
  // Жоқ болса немесе "*" болса, барлығын алу
  return getJSON("/resources");
}
