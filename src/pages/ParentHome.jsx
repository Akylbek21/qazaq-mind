// =============================================
// FILE: src/pages/ParentHome.jsx
// =============================================
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function ParentHome() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto max-w-5xl p-6">
        <h1 className="text-3xl font-extrabold tracking-tight">Сәлеметсіз бе, {user?.fullName || "ата-ана"}!</h1>
        <p className="text-slate-600 mt-1">Жетістіктер мен диагностика бойынша бөлімдер.</p>

        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <Card to="/thinkhub" title="Think Hub (ата-анаға)" desc="Баламен бірге рефлексия/жоспарлау." />
          <Card to="/historical-quiz" title="Tarikh Quiz" desc="Үйде бірге өтуге болатын викториналар." />
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
