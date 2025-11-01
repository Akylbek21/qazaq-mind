// =============================================
// FILE: src/pages/StudentHome.jsx
// Домашняя страница ученика: ссылки на доступные модули
// =============================================
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function StudentHome() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto max-w-5xl p-6">
        <h1 className="text-3xl font-extrabold tracking-tight">Сәлем, {user?.fullName || "оқушы"}!</h1>
        <p className="text-slate-600 mt-1">Төмендегі модульдер саған ашық.</p>

        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <Card to="/realtalk" title="Real Talk Time" desc="Жүрекке жылы сөздер. Ата-анаңмен, ұстазбен қарым-қатынас." />
          <Card to="/intellect-up" title="Intellect Up" desc="IQ мини-тапсырмалар, логика, жылдамдық." />
          <Card to="/historical-quiz" title="Tarikh Quiz" desc="Қазақ тарихы және мәдениеті викториналары." />
          <Card to="/thinkhub" title="Think Hub" desc="Рефлексия, күнделік, ой карталары." />
        </div>
      </div>
    </div>
  );
}

function Card({ to, title, desc }) {
  return (
    <Link to={to} className="block p-5 rounded-2xl bg-white shadow hover:shadow-lg transition">
      <div className="text-lg font-bold">{title}</div>
      <div className="text-slate-600 text-sm mt-1">{desc}</div>
    </Link>
  );
}

