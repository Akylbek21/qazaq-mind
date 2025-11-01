// src/pages/Login.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../auth/AuthContext";

const EyeIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M2.036 12.322a1.012 1.012 0 0 1 0-.644C3.423 7.51 7.355 5 12 5c4.645 0 8.577 2.51 9.964 6.678.07.214.07.43 0 .644C20.577 16.49 16.645 19 12 19c-4.645 0-8.577-2.51-9.964-6.678Z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);

const EyeOffIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M3.98 8.223C5.83 6.084 8.708 5 12 5c4.645 0 8.577 2.51 9.964 6.678.07.214.07.43 0 .644-.457 1.38-1.186 2.62-2.134 3.667M6.94 6.94 3 3m0 0 18 18M3 3l4.243 4.243M9 9a3 3 0 0 0 4.243 4.243" />
  </svg>
);

const Login = () => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const { login } = useAuth();

  const nav = useNavigate();
  const loc = useLocation();
  const [params] = useSearchParams();
  const from = loc.state?.from || "/";
  const isExpired = params.get("expired") === "1";

  useEffect(() => {
    if (isExpired) setErr("Сессия истекла. Войти снова.");
  }, [isExpired]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await login(form);
      nav(from, { replace: true });
    } catch (e) {
      setErr(e?.message || "Ошибка входа. Проверьте логин и пароль.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-teal-50 to-cyan-50">
      {/* декоративное свечение */}
      <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-10 h-72 w-72 rounded-full bg-teal-300/30 blur-3xl" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          {/* Карточка */}
          <div className="rounded-3xl border border-white/60 bg-white/70 p-8 shadow-2xl backdrop-blur-xl">
            {/* Заголовок */}
            <div className="mb-6 text-center">
              <h1 className="bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">
                Qazaq Mind
              </h1>
              <p className="mt-1 text-sm text-slate-600">Кіру / Вход</p>
            </div>

            {/* Ошибки */}
            {err && (
              <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                {err}
              </div>
            )}

            {/* Форма */}
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Логин
                </label>
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-900 outline-none ring-0 transition focus:border-teal-400 focus:bg-white focus:shadow-[0_0_0_4px_rgba(13,148,136,0.08)]"
                  placeholder="username"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  autoComplete="username"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Пароль
                </label>
                <div className="relative">
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 pr-12 text-slate-900 outline-none transition focus:border-teal-400 focus:bg-white focus:shadow-[0_0_0_4px_rgba(13,148,136,0.08)]"
                    placeholder="password"
                    type={showPass ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((s) => !s)}
                    className="absolute inset-y-0 right-3 my-auto inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                    aria-label={showPass ? "Скрыть пароль" : "Показать пароль"}
                  >
                    {showPass ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group relative mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-5 py-3 font-semibold text-white shadow-lg transition hover:from-teal-500 hover:to-cyan-500 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25 fill-transparent" />
                      <path d="M4 12a8 8 0 0 1 8-8" className="opacity-75" fill="currentColor" />
                    </svg>
                    Кіру...
                  </>
                ) : (
                  "Войти"
                )}
              </button>
            </form>

            {/* Низ карточки */}
            <div className="mt-5 flex items-center justify-between text-sm text-slate-600">
              <Link to="/register" className="rounded-lg px-2 py-1 text-teal-700 hover:bg-teal-50">
                Нет аккаунта? Регистрация
              </Link>
              <span className="text-slate-400">•</span>
              <a
                href="#"
                className="pointer-events-none cursor-not-allowed rounded-lg px-2 py-1 text-slate-400"
                title="Скоро"
              >
                Забыли пароль?
              </a>
            </div>
          </div>

          {/* Подпись */}
          <div className="mt-6 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} Qazaq Mind · Human-centric learning
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
