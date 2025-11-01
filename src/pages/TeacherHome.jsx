// =============================================
// FILE: src/pages/TeacherHome.jsx
// =============================================
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";


export default function TeacherHome() {
const { user } = useAuth();
return (
<div className="min-h-screen bg-slate-50">
<div className="container mx-auto max-w-5xl p-6">
<h1 className="text-3xl font-extrabold tracking-tight">Қош келдіңіз, {user?.fullName || "мұғалім"}!</h1>
<p className="text-slate-600 mt-1">Сізге қолжетімді бөлімдер:</p>


<div className="grid md:grid-cols-2 gap-4 mt-6">
<Card to="/teacher-console" title="Teacher Console" desc="Оқушылар белсенділігі, тапсырмалар мен пікірлер." />
<Card to="/historical-quiz" title="Tarikh Quiz" desc="Викториналарды көрсету/талдау." />
<Card to="/thinkhub" title="Think Hub" desc="Сыныптағы рефлексия және талқылау." />
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