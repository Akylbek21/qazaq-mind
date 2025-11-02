// =============================================
// FILE: src/components/Header.jsx  (обновление)
// Показываем «Тіркелу» если не авторизован, иначе — роль и выход
// =============================================
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const Header = () => {
  const { user, username, role, isAuthenticated, logout, getLocalizedRoleName } = useAuth();
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
          {!isAuthenticated ? (
            <Link className="px-4 py-2 rounded-xl bg-slate-900 text-white font-medium" to="/register">Тіркелу</Link>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">{user?.username || username}</span>
              <span className="text-sm px-3 py-1 rounded-full bg-slate-100 border border-slate-200">{getLocalizedRoleName(user?.role || role)}</span>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-amber-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-amber-700">{user?.score ?? 0} ұпай</span>
              </div>
              <button onClick={onLogout} className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50">Шығу</button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;