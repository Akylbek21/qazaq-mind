import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import {
  fetchIQTests,
  fetchIQTestQuestions,
  submitIQAnswer,
  fetchIQTestSummary,
} from "../api/quiz";

/* ---------- Безопасная ссылка ---------- */
function SmartLink({ to, className = "", children, ...rest }) {
  let InRouter = null;
  try { InRouter = require("react-router-dom").useInRouterContext; } catch (_) {}
  const inRouter = InRouter?.() ?? false;
  if (!inRouter) return <a href={to} className={className} {...rest}>{children}</a>;
  const { Link } = require("react-router-dom");
  return <Link to={to} className={className} {...rest}>{children}</Link>;
}

const Pill = ({ children, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-xl text-sm font-semibold border transition ${
      active ? "bg-slate-900 text-white border-slate-900"
             : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
    }`}
  >
    {children}
  </button>
);

const LS_KEY = "intellect_up_stats_pure_api";
const loadStats = () => { try { return JSON.parse(localStorage.getItem(LS_KEY) || "{}"); } catch { return {}; } };
const saveStats = (v) => localStorage.setItem(LS_KEY, JSON.stringify(v));

/* ====== Нормализация ответа сервера /api/iq/tests/{id}/questions ====== */
function normalizeIQFromServer(q) {
  const options = [q.optionA, q.optionB, q.optionC, q.optionD].filter(Boolean);
  return {
    id: q.id,
    q: q.prompt ?? "",
    options, // порядок строго A,B,C,D
  };
}
const letterByIndex = (i) => ["A","B","C","D"][i] ?? null;
const letterFromChoice = (normalizedQuestion, chosenText) => {
  if (!normalizedQuestion || !Array.isArray(normalizedQuestion.options)) return null;
  const idx = normalizedQuestion.options.findIndex((v) => v === chosenText);
  return idx >= 0 ? letterByIndex(idx) : null;
};

export default function IntellectUp() {
  /* ======================= IQ ======================= */
  const [tests, setTests] = useState([]);              // список доступных тестов
  const [activeTestId, setActiveTestId] = useState(null);

  const [iqBank, setIQBank] = useState([]);            // нормализованные вопросы текущего теста
  const [iqTimeLimit, setIqTimeLimit] = useState(60);
  const [iqLoading, setIqLoading] = useState(false);
  const [iqError, setIqError] = useState("");

  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});          // { questionIndex: optionText }
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);

  const [stats, setStats] = useState(() => loadStats());
  const [questions, setQuestions] = useState([]);
  const iqStartTs = useRef(null);

  // Результат от сервера
  const [iqSubmitting, setIqSubmitting] = useState(false);
  const [iqSubmitErr, setIqSubmitErr] = useState("");
  const [iqServerRes, setIqServerRes] = useState(null); // {score,total,details}

  // 1) Загрузка списка тестов
  const loadIQ = useCallback(async () => {
    setIqLoading(true); setIqError(""); setIqServerRes(null);
    try {
      const list = await fetchIQTests();
      setTests(Array.isArray(list) ? list : []);
      setIqTimeLimit(60); // при необходимости можно присылать лимит с бэка
      if (!activeTestId && Array.isArray(list) && list.length > 0) {
        setActiveTestId(list[0].id);
      }
    } catch (e) {
      setIqError(e?.message || "Қате: тесттер тізімі жүктелмеді.");
    } finally {
      setIqLoading(false);
    }
  }, [activeTestId]);
  useEffect(() => { loadIQ(); }, [loadIQ]);

  // 2) Старт: грузим вопросы выбранного теста
  const start = async () => {
    setIqSubmitErr(""); setIqServerRes(null);
    const testId = activeTestId ?? tests[0]?.id;
    if (!testId) { setIqError("Тесттер жоқ."); return; }
    try {
      setIqLoading(true);
      const rawQs = await fetchIQTestQuestions(testId);
      const normalized = (Array.isArray(rawQs) ? rawQs : []).map(normalizeIQFromServer);
      setIQBank(normalized);
      setQuestions(normalized);
      setStarted(true);
      setStep(1);
      setTimeLeft(iqTimeLimit);
      setAnswers({});
      setFinished(false);
      iqStartTs.current = Date.now();
      setActiveTestId(testId);
    } catch (e) {
      setIqError(e?.message || "Сұрақтарды жүктеу қатесі.");
    } finally {
      setIqLoading(false);
    }
  };

  const restart = () => {
    setStarted(false);
    setStep(0);
    setAnswers({});
    setFinished(false);
    setTimeLeft(iqTimeLimit);
    setIqSubmitErr("");
    setIqServerRes(null);
    iqStartTs.current = null;
  };

  // 3) Таймер
  useEffect(() => {
    if (!started || finished) return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(id); setFinished(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [started, finished]);

  // 4) Управление с клавиатуры
  const handleKey = useCallback((e) => {
    if (!started || finished || step === 0) return;
    const currentIdx = step - 1;
    const opts = questions[currentIdx]?.options || [];
    if (e.key >= "1" && e.key <= "4") {
      const i = Number(e.key) - 1;
      if (opts[i]) setAnswers((prev) => ({ ...prev, [currentIdx]: opts[i] }));
    }
    if (e.key === "Enter") {
      if (Object.prototype.hasOwnProperty.call(answers, currentIdx)) {
        if (step < questions.length) setStep((s) => s + 1);
        else setFinished(true);
      }
    }
  }, [answers, finished, questions, started, step]);
  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  // 5) Локальный подсчёт (fallback)
  const localScore = useMemo(() => 0, []); // сервер — источник истины

  const selectOption = (qIndex, value) => setAnswers((prev) => ({ ...prev, [qIndex]: value }));
  const next = () => (step < questions.length ? setStep(step + 1) : setFinished(true));
  const prev = () => (step > 1 ? setStep(step - 1) : null);
  const progressPct = step === 0 || !questions.length ? 0 : Math.round(((step - 1) / questions.length) * 100);
  const timeColor = timeLeft > 30 ? "text-emerald-600" : timeLeft > 15 ? "text-amber-600" : "text-rose-600";

  // 6) На завершении — отправляем ответы и берём summary
  useEffect(() => {
    if (!finished || !activeTestId) return;

    // локальная статистика
    const attempts = (stats.attempts || 0) + 1;
    const best = Math.max(stats.best || 0, localScore);
    const newStats = { attempts, best, last: localScore, lastAt: Date.now() };
    setStats(newStats); saveStats(newStats);

    (async () => {
      setIqSubmitting(true); setIqSubmitErr("");
      try {
        // Отправляем каждый ответ (letter A/B/C/D)
        const sendables = questions.map((q, idx) => {
          const chosen = answers[idx] ?? null;
          const letter = letterFromChoice(q, chosen);
          return letter ? submitIQAnswer({ questionId: q.id, chosen: letter }) : null;
        }).filter(Boolean);
        await Promise.allSettled(sendables);

        // Забираем сводку
        const s = await fetchIQTestSummary(activeTestId);
        setIqServerRes({
          score: Number(s?.correct ?? 0),
          total: Number(s?.total ?? questions.length),
          details: s,
          message: "Server summary",
        });
      } catch (e) {
        setIqSubmitErr(e?.message || "Сервер нәтижесін алу мүмкін болмады.");
        setIqServerRes(null);
      } finally {
        setIqSubmitting(false);
      }
    })();
  }, [finished, activeTestId]); // eslint-disable-line

  /* ======================= Render ======================= */
  const renderIQ = () => {
    const totalFromServer = typeof iqServerRes?.total === "number" ? iqServerRes.total : questions.length;
    const scoreFromServer = typeof iqServerRes?.score === "number" ? iqServerRes.score : localScore;

    return (
      <>
        
       

        {/* Intro */}
        {!started && !finished && step === 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6 text-center">
            <div className="mt-2 flex flex-col items-center gap-3">
              {iqLoading && <div className="text-sm text-slate-500">Жүктелуде…</div>}
              {iqError && (
                <>
                  <div className="text-sm text-rose-600">{iqError}</div>
                  <button onClick={loadIQ} className="rounded-xl px-4 py-2 border font-semibold">Қайталап көру</button>
                </>
              )}

              {/* Выбор теста */}
              {!iqLoading && !iqError && tests.length > 0 && (
                <div className="w-full max-w-xs text-left">
                  <label className="block text-sm text-slate-600 mb-1">Тест таңдау</label>
                  <select
                    value={activeTestId ?? tests[0]?.id ?? ""}
                    onChange={(e) => setActiveTestId(Number(e.target.value))}
                    className="w-full rounded-xl border px-3 py-2"
                  >
                    {tests.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {!iqLoading && !iqError && (
                <button
                  onClick={start}
                  disabled={!tests.length}
                  className="inline-flex items-center justify-center rounded-xl px-5 py-3 bg-[#1F7A8C] text-white font-semibold shadow hover:opacity-95 disabled:opacity-40"
                >
                  Бастау
                </button>
              )}

              {!iqLoading && !iqError && tests.length === 0 && (
                <div className="text-sm text-slate-500">Тесттер жоқ.</div>
              )}
            </div>
          </motion.div>
        )}

        {/* Progress + Timer */}
        {started && !finished && (
          <div className="mt-8">
            <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
              <span>Сұрақ {step}/{questions.length}</span>
              <span className={`font-semibold ${timeColor}`}>Қалған уақыт: {timeLeft} с</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-[#1F7A8C] to-[#1aa6b5] transition-all" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        )}

        {/* Question */}
        {started && !finished && step > 0 && questions.length > 0 && (
          <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="mt-6 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur p-5 shadow">
            <h2 className="text-xl font-semibold text-slate-900">{questions[step - 1].q}</h2>

            <div className="mt-4 grid gap-3">
              {questions[step - 1].options.map((opt, i) => {
                const checked = answers[step - 1] === opt;
                return (
                  <button
                    key={`${questions[step - 1].id}-${i}`}
                    onClick={() => selectOption(step - 1, opt)}
                    className={`text-left rounded-xl border px-4 py-3 transition focus:outline-none focus:ring-2 focus:ring-sky-400 ${
                      checked ? "border-[#1F7A8C] bg-[#1F7A8C]/10" : "border-slate-200 hover:bg-slate-50"
                    }`}
                    aria-pressed={checked}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold
                        ${checked ? "bg-[#1F7A8C] text-white" : "bg-slate-200 text-slate-700"}`}>
                        {i + 1}
                      </span>
                      <span>{opt}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 flex justify-between items-center">
              <button
                onClick={prev}
                disabled={step === 1}
                className="inline-flex items-center justify-center rounded-xl px-4 py-2 border border-slate-300 font-medium text-slate-700 disabled:opacity-40"
              >
                ⟵ Артқа
              </button>

              <div className="text-slate-500 text-sm hidden sm:block">1–4 пернелерімен таңдауға болады</div>

              <button
                onClick={next}
                disabled={!Object.prototype.hasOwnProperty.call(answers, step - 1)}
                className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 bg-slate-900 text-white font-medium disabled:opacity-40"
              >
                {step < questions.length ? "Келесі ⟶" : "Аяқтау"}
              </button>
            </div>
          </motion.div>
        )}

        {/* Result */}
        {finished && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="mt-10 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur p-6 shadow">
            <h3 className="text-2xl font-bold text-slate-900">Нәтиже</h3>

            {iqSubmitting && <p className="mt-2 text-slate-600 text-sm">Серверден тексеру…</p>}
            {iqSubmitErr && <p className="mt-2 text-rose-600 text-sm">{iqSubmitErr}</p>}

            <p className="mt-2 text-slate-700">
              Ұпай: <span className="font-semibold">{scoreFromServer} / {totalFromServer}</span>
              {iqServerRes?.message ? <span className="ml-2 text-slate-500 text-sm">({iqServerRes.message})</span> : null}
            </p>

            {/* При желании можно отрисовать детали из iqServerRes.details */}

            <div className="mt-6 grid sm:grid-cols-3 gap-3 text-sm">
              <div className="rounded-xl border p-4">
                <p className="text-slate-500">Соңғы ұпай (локал)</p>
                <p className="mt-1 font-semibold">{localScore} / {questions.length}</p>
              </div>
              <div className="rounded-xl border p-4">
                <p className="text-slate-500">Ең үздік нәтиже</p>
                <p className="mt-1 font-semibold">{Math.max(stats.best ?? 0, localScore)} / {questions.length}</p>
              </div>
              <div className="rounded-xl border p-4">
                <p className="text-slate-500">Талпыныс саны</p>
                <p className="mt-1 font-semibold">{stats.attempts ?? 1}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={start} className="inline-flex items-center justify-center rounded-xl px-5 py-3 bg-slate-900 text-white font-semibold">
                Қайта өту
              </button>
              <button onClick={restart} className="inline-flex items-center justify-center rounded-xl px-5 py-3 border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50">
                Басты экран
              </button>
            </div>
          </motion.div>
        )}
      </>
    );
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10">
      <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="text-3xl md:text-4xl font-extrabold text-slate-900 text-center">
        IntellectUp — Danalyq Challenge (IQ)
      </motion.h1>
      

      <div className="mt-8">{renderIQ()}</div>

      <div className="mt-8 flex flex-wrap gap-3 justify-center">
        <SmartLink to="/realtalk" className="inline-flex items-center justify-center rounded-xl px-5 py-3 bg-[#1aa6b5] text-white font-semibold shadow hover:opacity-95">
          RealTalkTime (EQ)
        </SmartLink>
        <SmartLink to="/" className="inline-flex items-center justify-center rounded-xl px-5 py-3 border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50">
          Басты бетке
        </SmartLink>
      </div>
    </div>
  );
}
