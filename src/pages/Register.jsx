import React, { useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const ROLES = [
  { value: "student", label: "Оқушы (student)" },
  { value: "teacher", label: "Мұғалім (teacher)" },
  { value: "parent",  label: "Ата-ана (parent)" },
];

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const fromPath = location.state?.from?.pathname;
  const reason = searchParams.get("reason");
  const isOnRegister = location.pathname === "/register";

  // Form refs: батырма басылғанда бірінші өріске фокус
  const nameRef = useRef(null);

  const [role, setRole] = useState("student");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [school, setSchool] = useState("");
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const targetAfterLogin = useMemo(() => {
    if (fromPath) return fromPath;
    if (role === "teacher") return "/teacher";
    if (role === "parent")  return "/parent";
    return "/student";
  }, [fromPath, role]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!fullName.trim()) return setError("Аты-жөніңізді жазыңыз");
    if (!phone.trim())    return setError("Телефон номеріңізді жазыңыз");
    if (!agree)           return setError("Ережелермен келісіңіз");
    try {
      setBusy(true);
      const payload = {
        id: crypto.randomUUID(),
        role, fullName, phone, school: school || null,
        createdAt: new Date().toISOString(),
      };
      login(payload);
      navigate(targetAfterLogin, { replace: true });
    } finally {
      setBusy(false);
    }
  };

  const handleRegisterClick = (e) => {
    if (isOnRegister) {
      // Форманы көрсету/фокус
      e.preventDefault();
      document.getElementById("register-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => nameRef.current?.focus(), 250);
    }
    // Егер басқа бетте болса — Link өзі /register?reason=auth-қа апарады
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-1">Тіркеу</h1>
        <p className="text-slate-600 mb-4">Рөлді таңдаңыз және негізгі ақпаратты толтырыңыз.</p>

       

        <form id="register-form" onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Рөлі</label>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map((r) => (
                <button
                  type="button"
                  key={r.value}
                  onClick={() => setRole(r.value)}
                  className={`px-3 py-2 rounded-xl border text-sm font-medium transition hover:shadow ${
                    role === r.value ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-slate-50"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Аты-жөні</label>
            <input
              ref={nameRef}
              type="text"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300"
              placeholder="Аты-жөніңіз"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Телефон</label>
              <input
                type="tel"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300"
                placeholder="8xxx…"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Мектеп (қалауыңызша)</label>
              <input
                type="text"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300"
                placeholder="№XX мектеп, сыныбыңыз"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
              />
            </div>
          </div>

          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" className="mt-1" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
            <span>
              Мен <b>пайдалану ережелерімен</b> және <b>деректерді өңдеумен</b> келісемін.
            </span>
          </label>

          {error && <div className="text-red-600 text-sm">{error}</div>}

          <button
            type="submit"
            disabled={busy}
            className="w-full py-3 rounded-xl bg-slate-900 text-white font-semibold hover:opacity-95 transition disabled:opacity-60"
          >
            {busy ? "Тіркелу…" : "Тіркелу"}
          </button>
        </form>
      </div>
    </div>
  );
}
