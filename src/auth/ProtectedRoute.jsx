import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

const ProtectedRoute = ({ children, allow = [] }) => {
  const { isAuthenticated, role } = useAuth();
  const loc = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  }

  // normalize allow list to uppercase
  const allowUp = Array.isArray(allow) ? allow.map((a) => String(a || "").toUpperCase()) : [];

  // Если allow пуст — разрешаем всем авторизованным
  if (!allowUp.length) return children;

  // TEACHER всегда имеет полный доступ
  if (String(role || "").toUpperCase() === "TEACHER") return children;

  // Иначе проверяем, есть ли роль пользователя в списке allow
  if (allowUp.includes(String(role || "").toUpperCase())) return children;

  // Нет доступа
  return <div className="min-h-screen flex items-center justify-center text-rose-600">Нет доступа</div>;
};

export default ProtectedRoute;
