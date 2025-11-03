
import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import {
  fetchIQTests,
  fetchIQTestQuestions,
  submitIQAnswer,
  fetchIQTestSummary,
} from "../api/quiz";
import { Link, useInRouterContext } from "react-router-dom";

/* ---------- Безопасная ссылка ---------- */
function SmartLink({ to, className = "", children, ...rest }) {
  const inRouter = useInRouterContext ? useInRouterContext() : false;
  return inRouter ? (
    <Link to={to} className={className} {...rest}>{children}</Link>
  ) : (
    <a href={to} className={className} {...rest}>{children}</a>
  );
}

const Pill = ({ children, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 transform hover:-translate-y-0.5 ${
      active ? "bg-gradient-to-r from-[#1F7A8C] to-[#0ea5a5] text-white border-transparent shadow-lg"
             : "bg-white text-slate-700 border border-slate-300 hover:border-slate-400 hover:bg-slate-50 hover:shadow"
    }`}
  >
    {children}
  </button>
);

const Card = ({ title, value, suffix = "", loading = false }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-all duration-200">
    <div className="text-sm text-slate-600">{title}</div>
    <div className="mt-1 text-2xl font-bold text-slate-900">
      {loading ? (
        <div className="animate-pulse h-8 w-16 bg-slate-200 rounded"></div>
      ) : (
        <>{value}{suffix}</>
      )}
    </div>
  </div>
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
    imageUrl: q.imageUrl || q.image || null,
    domain: q.domain || null,
    correctLetter: q.correct || null,
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
  const [tests, setTests] = useState([]);              
  const [activeTestId, setActiveTestId] = useState(null);
  const [iqBank, setIQBank] = useState([]);            
  const [iqTimeLimit, setIqTimeLimit] = useState(60);
  const [iqLoading, setIqLoading] = useState(false);
  const [iqError, setIqError] = useState("");

  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});          
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

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
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6"
          >
            <div className="rounded-2xl border border-slate-200/70 bg-white/90 backdrop-blur-xl p-8 shadow-[0_10px_30px_rgba(16,37,66,0.08)]">
              <div className="flex flex-col items-center gap-6">
                {iqLoading && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <div className="animate-spin h-5 w-5 border-2 border-[#1F7A8C] border-t-transparent rounded-full"></div>
                    <span>Жүктелуде…</span>
                  </div>
                )}
                {iqError && (
                  <div className="w-full max-w-md">
                    <div className="text-sm text-rose-600 bg-rose-50 rounded-xl p-4 mb-3">{iqError}</div>
                    <button 
                      onClick={loadIQ} 
                      className="w-full rounded-xl px-4 py-2 border-2 border-rose-300 text-rose-700 font-semibold hover:bg-rose-50 transition-all duration-300"
                    >
                      Қайталап көру
                    </button>
                  </div>
                )}

                {!iqLoading && !iqError && tests.length > 0 && (
                  <div className="w-full max-w-md">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Тест таңдау</label>
                    <select
                      value={activeTestId ?? tests[0]?.id ?? ""}
                      onChange={(e) => setActiveTestId(Number(e.target.value))}
                      className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 outline-none focus:border-[#1F7A8C] focus:ring-2 focus:ring-[#1F7A8C]/20 transition-all duration-300 bg-white"
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
                    className="group/btn relative inline-flex items-center justify-center rounded-xl px-8 py-4 bg-gradient-to-r from-[#1F7A8C] via-[#1aa6b5] to-[#0ea5a5] text-white font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      🚀 Бастау
                      <span className="group-hover/btn:translate-x-1 transition-transform duration-300">→</span>
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0ea5a5] via-[#1aa6b5] to-[#1F7A8C] opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                  </button>
                )}

                {!iqLoading && !iqError && tests.length === 0 && (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-3">📚</div>
                    <p className="text-slate-500 font-medium">Тесттер жоқ</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Progress + Timer */}
        {started && !finished && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 rounded-2xl border border-slate-200/70 bg-white/90 backdrop-blur-xl p-6 shadow-[0_10px_30px_rgba(16,37,66,0.08)]"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-slate-700">Сұрақ {step} / {questions.length}</span>
            </div>
            <div className="w-full h-3 bg-slate-200/70 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.3 }}
                className="h-3 rounded-full bg-gradient-to-r from-[#1F7A8C] via-[#1aa6b5] to-[#0ea5a5]"
              />
            </div>
          </motion.div>
        )}

        {/* Question */}
        {started && !finished && step > 0 && questions.length > 0 && (
          <motion.div 
            key={step} 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-6 rounded-2xl border border-slate-200/70 bg-white/90 backdrop-blur-xl p-6 shadow-[0_10px_30px_rgba(16,37,66,0.08)]"
          >
            <h2 className="text-xl font-bold text-slate-900 leading-relaxed mb-6">{questions[step - 1].q}</h2>

            {questions[step - 1].imageUrl && (
              <div className="mt-4 mb-6 flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1F7A8C]/20 to-[#0ea5a5]/20 rounded-xl blur-xl" />
                  <img
                    src={questions[step - 1].imageUrl}
                    alt={questions[step - 1].q?.slice(0, 120) ?? "question image"}
                    className="relative max-h-64 w-auto rounded-xl object-contain border-2 border-slate-200 shadow-lg"
                  />
                </div>
              </div>
            )}

            <div className="mt-4 grid gap-3">
              {questions[step - 1].options.map((opt, i) => {
                const checked = answers[step - 1] === opt;
                return (
                  <motion.button
                    key={`${questions[step - 1].id}-${i}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => selectOption(step - 1, opt)}
                    className={`group text-left rounded-xl border-2 px-5 py-4 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#1F7A8C]/40 ${
                      checked 
                        ? "border-[#1F7A8C] bg-gradient-to-r from-[#1F7A8C]/10 to-[#0ea5a5]/10 shadow-md" 
                        : "border-slate-200 hover:border-[#1F7A8C]/50 hover:bg-slate-50"
                    }`}
                    aria-pressed={checked}
                  >
                    <div className="flex items-center gap-4">
                      <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all duration-300
                        ${checked ? "bg-gradient-to-r from-[#1F7A8C] to-[#0ea5a5] text-white shadow-lg scale-110" : "bg-slate-200 text-slate-700 group-hover:bg-slate-300"}`}>
                        {i + 1}
                      </span>
                      <span className="flex-1 text-slate-800 font-medium">{opt}</span>
                      {checked && (
                        <motion.span 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-[#1F7A8C] text-xl"
                        >
                          ✓
                        </motion.span>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <div className="mt-6 flex justify-between items-center gap-4">
              <button
                onClick={prev}
                disabled={step === 1}
                className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 border-2 border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ⟵ Артқа
              </button>

              <div className="text-slate-500 text-xs sm:text-sm hidden sm:block text-center">
                Кеңес: 1–4 пернелерімен таңдауға болады
              </div>

              <button
                onClick={next}
                disabled={!Object.prototype.hasOwnProperty.call(answers, step - 1)}
                className="group/btn relative inline-flex items-center justify-center rounded-xl px-6 py-2.5 bg-gradient-to-r from-[#1F7A8C] via-[#1aa6b5] to-[#0ea5a5] text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {step < questions.length ? "Келесі" : "Аяқтау"}
                  <span className="group-hover/btn:translate-x-1 transition-transform duration-300">→</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#0ea5a5] via-[#1aa6b5] to-[#1F7A8C] opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Result */}
        {finished && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="mt-10 rounded-2xl border border-slate-200/70 bg-white/90 backdrop-blur-xl p-8 shadow-[0_10px_30px_rgba(16,37,66,0.08)]"
          >
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-3xl font-extrabold text-slate-900 mb-2">Нәтиже</h3>
            </div>

            {iqSubmitting && (
              <div className="flex items-center justify-center gap-2 text-slate-600 mb-4">
                <div className="animate-spin h-5 w-5 border-2 border-[#1F7A8C] border-t-transparent rounded-full"></div>
                <span>Серверден тексеру…</span>
              </div>
            )}
            {iqSubmitErr && (
              <div className="mb-4 text-rose-600 bg-rose-50 rounded-xl p-4 text-sm">{iqSubmitErr}</div>
            )}

            {!iqSubmitting && (
              <div className="text-center mb-8">
                <div className="inline-block bg-gradient-to-r from-[#1F7A8C] to-[#0ea5a5] rounded-2xl px-8 py-4 shadow-lg">
                  <p className="text-white text-sm font-medium mb-1">Ұпай</p>
                  <p className="text-white text-4xl font-extrabold">
                    {scoreFromServer} / {totalFromServer}
                  </p>
                </div>
              </div>
            )}

            <div className="mt-8 grid sm:grid-cols-3 gap-4">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-xl border-2 border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <p className="text-slate-600 text-sm font-medium mb-2">Соңғы нәтиже</p>
                <p className="text-2xl font-bold text-slate-900">{localScore} / {questions.length}</p>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-xl border-2 border-[#1F7A8C]/30 bg-gradient-to-br from-[#1F7A8C]/5 to-[#0ea5a5]/5 p-5 shadow-sm"
              >
                <p className="text-[#1F7A8C] text-sm font-bold mb-2">Ең үздік</p>
                <p className="text-2xl font-bold text-[#1F7A8C]">{Math.max(stats.best ?? 0, localScore)} / {questions.length}</p>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-xl border-2 border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <p className="text-slate-600 text-sm font-medium mb-2">Талпыныс саны</p>
                <p className="text-2xl font-bold text-slate-900">{stats.attempts ?? 1}</p>
              </motion.div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3 justify-center">
              <button 
                onClick={start} 
                className="group/btn relative inline-flex items-center justify-center rounded-xl px-6 py-3 bg-gradient-to-r from-[#1F7A8C] via-[#1aa6b5] to-[#0ea5a5] text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  🔄 Қайта өту
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#0ea5a5] via-[#1aa6b5] to-[#1F7A8C] opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
              </button>
              <button 
                onClick={restart} 
                className="inline-flex items-center justify-center rounded-xl px-6 py-3 border-2 border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-300"
              >
                Басты экран
              </button>
            </div>
          </motion.div>
        )}
      </>
    );
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <motion.h1 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="text-3xl md:text-4xl font-extrabold text-slate-900 text-center mb-2"
      >
        IntellectUp — Danalyq Challenge (IQ)
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ delay: 0.2 }}
        className="text-center text-lg text-[#1F7A8C] font-semibold mb-8"
      >
        Логика • Жылдамдық • Ойлау
      </motion.p>

      <div className="mt-8">{renderIQ()}</div>

      <div className="mt-8 flex flex-wrap gap-3 justify-center">
        <SmartLink 
          to="/realtalk" 
          className="group/btn relative inline-flex items-center justify-center rounded-xl px-6 py-3 bg-gradient-to-r from-[#1F7A8C] via-[#1aa6b5] to-[#0ea5a5] text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 overflow-hidden"
        >
          <span className="relative z-10 flex items-center gap-2">
            RealTalkTime (EQ)
            <span className="group-hover/btn:translate-x-1 transition-transform duration-300">→</span>
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-[#0ea5a5] via-[#1aa6b5] to-[#1F7A8C] opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
        </SmartLink>
        <SmartLink 
          to="/" 
          className="inline-flex items-center justify-center rounded-xl px-6 py-3 border-2 border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-300"
        >
          Басты бетке оралу
        </SmartLink>
      </div>
    </div>
  );
}
