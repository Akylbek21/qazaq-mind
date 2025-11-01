import React from "react";
import { useAuth } from "./AuthContext";

const RoleGuard = ({ allow = [], children }) => {
  const { role } = useAuth();
  if (allow.length === 0) return children;
  return allow.includes(role) ? children : <div>Нет доступа</div>;
};

export default RoleGuard;
