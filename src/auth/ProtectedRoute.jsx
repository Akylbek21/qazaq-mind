import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute({ children, allow = ["student","teacher","parent"] }) {
  const { user } = useAuth();
  const location = useLocation();

  // 1) Тіркелмеген — осы бетте ескерту және "Тіркелу" батырмасы
  if (!user) {
    return <AuthGate from={location} />;
  }

  // 2) Рөл сәйкес емес — өз үйіне жібереміз
  if (allow && !allow.includes(user?.role)) {
    const fallback = user.role === "teacher" ? "/teacher" : user.role === "parent" ? "/parent" : "/student";
    window.location.replace(fallback);
    return null;
  }

  return children;
}

// Экран-«шлагбаум»: батырма регистрацияға апарады
function AuthGate({ from }) {
  const navigate = useNavigate();

  const goRegister = () => {
    navigate("/register?reason=auth", { state: { from } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-6 md:p-8">
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">Тіркеу қажет</h2>
        <p className="text-slate-600 mb-4">Модульге кіру үшін алдымен тіркеліңіз.</p>

        <div className="rounded-xl border border-amber-300 bg-amber-50 text-amber-800 px-3 py-2 mb-5">
          Модульге кіру үшін алдымен тіркеліңіз.
        </div>

        <button
          onClick={goRegister}
          className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold hover:opacity-95 transition"
        >
          Тіркелу
        </button>
      </div>
    </div>
  );
}
