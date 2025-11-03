// src/api/dashboard.js
import { getJSON } from "./client";

/**
 * Получить данные dashboard текущего пользователя
 * GET /api/dashboard
 * Доступно для: STUDENT, TEACHER, PARENT
 * @returns {Promise<Object>} - объект с iq, eq, sq, pq, aiAdvice, aiAnalysis
 */
export async function getDashboard() {
  return getJSON("/dashboard");
}

/**
 * Получить insights всех студентов (для учителей)
 * GET /api/insight/students?page=0&size=20
 * Доступно для: TEACHER
 * @returns {Promise<Object>} - объект с content, totalElements, totalPages, size, number
 */
export async function getStudentInsights(page = 0, size = 20) {
  return getJSON(`/insight/students?page=${page}&size=${size}`);
}
