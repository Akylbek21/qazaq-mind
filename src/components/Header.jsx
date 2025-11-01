// =============================================
// FILE: src/components/Header.jsx  (обновление)
// Показываем «Тіркелу» если не авторизован, иначе — роль и выход
// =============================================
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <header className="sticky top-0 left-0 right-0 z-30 backdrop-blur bg-white/70 border-b border-slate-200">
      <div className="container mx-auto flex justify-between items-center px-4 py-3">
        <Link to="/" className="text-xl font-extrabold tracking-tight">Qazaq Mind</Link>
        <nav className="flex items-center gap-3">
          {!user ? (
            <Link className="px-4 py-2 rounded-xl bg-slate-900 text-white font-medium" to="/register">Тіркелу</Link>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-sm px-3 py-1 rounded-full bg-slate-100 border border-slate-200">{user.role}</span>
              <button onClick={onLogout} className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50">Шығу</button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;