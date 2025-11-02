// =============================================
// FILE: src/pages/ParentHome.jsx
// =============================================
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function ParentHome() {
  const { user, role } = useAuth();

  const allowedByRole = (r) => {
    const R = String(r || "").toUpperCase();
    if (R === "TEACHER") return (t) => true;
    if (R === "PARENT") return (t) => t === "atalink";
    if (R === "STUDENT") return (t) => ["sq", "eq", "iq", "pq"].includes(t);
    return (t) => true;
  };
  const isAllowed = allowedByRole(role);

  const cards = [
    { to: "/thinkhub", title: "Think Hub (ата-анаға)", desc: "Баламен бірге рефлексия/жоспарлау.", type: "sq" },
    { to: "/historical-quiz", title: "Tarikh Quiz", desc: "Үйде бірге өтуге болатын викториналар.", type: "historical" },
    { to: "/atalink", title: "AtaLink", desc: "Ата-аналарға арналған бөлім.", type: "atalink" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto max-w-5xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Сәлеметсіз бе, {user?.fullName || "ата-ана"}!</h1>
            <p className="text-slate-600 mt-1">Жетістіктер мен диагностика бойынша бөлімдер.</p>
          </div>
          <div className="flex items-center gap-2 bg-amber-100 px-4 py-2 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-amber-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-semibold text-amber-700">0 ұпай</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mt-6">
          {cards.map((c) => (
            <Card key={c.to} {...c} allowed={isAllowed(c.type)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Card({ to, title, desc, allowed = true }) {
  if (!allowed) {
    return (
      <div className="block p-5 rounded-2xl bg-white shadow opacity-50 cursor-not-allowed">
        <div className="text-lg font-bold">{title}</div>
        <div className="text-slate-600 text-sm mt-1">{desc}</div>
      </div>
    );
  }
  return (
    <Link to={to} className="block p-5 rounded-2xl bg-white shadow hover:shadow-lg transition">
      <div className="text-lg font-bold">{title}</div>
      <div className="text-slate-600 text-sm mt-1">{desc}</div>
    </Link>
  );
}
