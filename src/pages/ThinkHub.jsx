// src/pages/ThinkHub.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchSQBooks,
  fetchSQBookQuestions,
  submitSQAnswer,
  fetchSQBookSummary,
  fromIndex,
} from "@/api/sq";

/* ---------- мини-утиль ---------- */
const Progress = ({ value }) => (
  <div className="w-full bg-slate-200/70 rounded-full h-2.5 overflow-hidden">
    <div className="h-2.5 rounded-full bg-gradient-to-r from-[#1F7A8C] via-[#1aa6b5] to-[#0ea5a5]" style={{ width: `${value}%` }} />
  </div>
);

const Badge = ({ ok }) => (
  <span className={`ml-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${ok ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
    {ok ? "Дұрыс" : "Бұрыс"}
  </span>
);

export default function ThinkHub() {
  // Состояния каталога книг
  const [books, setBooks] = React.useState([]);
  const [loadingBooks, setLoadingBooks] = React.useState(false);
  const [booksErr, setBooksErr] = React.useState("");

  // Текущая книга и вопросы
  const [book, setBook] = React.useState(null);
  const [questions, setQuestions] = React.useState([]);
  const [loadingQs, setLoadingQs] = React.useState(false);
  const [qsErr, setQsErr] = React.useState("");

  // Прохождение теста
  const [phase, setPhase] = React.useState("catalog"); // catalog | quiz | result
  const [step, setStep] = React.useState(0);
  const [answers, setAnswers] = React.useState({});     // qId -> 'A'|'B'|'C'|'D'
  const [results, setResults] = React.useState({});     // qId -> {correct:boolean}
  const [submitting, setSubmitting] = React.useState(false);

  // Итог от сервера
  const [summary, setSummary] = React.useState(null);
  const [summaryErr, setSummaryErr] = React.useState("");

  // Загрузка книг
  const loadBooks = async () => {
    setLoadingBooks(true); setBooksErr("");
    try {
      const list = await fetchSQBooks();
      setBooks(Array.isArray(list) ? list : []);
    } catch (e) {
      setBooksErr(e?.message || "Кітаптар тізімі жүктелмеді.");
    } finally {
      setLoadingBooks(false);
    }
  };
  React.useEffect(() => { loadBooks(); }, []);

  // Начать тест по книге
  const startBook = async (b) => {
    setBook(b);
    setPhase("quiz");
    setStep(0);
    setAnswers({});
    setResults({});
    setSummary(null);
    setSummaryErr("");

    setLoadingQs(true); setQsErr("");
    try {
      const qs = await fetchSQBookQuestions(b.id);
      setQuestions(qs);
    } catch (e) {
      setQsErr(e?.message || "Сұрақтар жүктелмеді.");
      setPhase("catalog");
      setBook(null);
    } finally {
      setLoadingQs(false);
    }
  };

  // Отправка ответа (сразу при выборе)
  const onChoose = async (qIndex, choiceIndex) => {
    if (!questions[qIndex]) return;
    const q = questions[qIndex];
    const letter = fromIndex(choiceIndex); // A/B/C/D

    // локально фиксируем выбор
    setAnswers((prev) => ({ ...prev, [q.id]: letter }));

    setSubmitting(true);
    try {
      const res = await submitSQAnswer({ questionId: q.id, chosen: letter });
      const correct = !!res?.correct; // сервер – источник истины
      setResults((prev) => ({ ...prev, [q.id]: { correct } }));
    } catch (e) {
      // Если ошибка сети/403 и т.п. — покажем как неправильный и дадим повторить выбор
      setResults((prev) => ({ ...prev, [q.id]: { correct: false, error: e?.message } }));
    } finally {
      setSubmitting(false);
    }
  };

  // Завершение: вытягиваем summary
  const finish = async () => {
    if (!book) return;
    setPhase("result");
    setSummary(null); setSummaryErr("");
    try {
      const s = await fetchSQBookSummary(book.id);
      setSummary(s);
    } catch (e) {
      setSummaryErr(e?.message || "Қорытындыны алу мүмкін болмады.");
    }
  };

  const restart = () => {
    setBook(null);
    setQuestions([]);
    setPhase("catalog");
    setStep(0);
    setAnswers({});
    setResults({});
    setSummary(null);
    setSummaryErr("");
  };

  /* --------------------- Рендер --------------------- */
  const current = questions[step];
  const total = questions.length;
  const progress = total ? Math.round(((step + 1) / total) * 100) : 0;

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="text-3xl md:text-4xl font-extrabold text-slate-900">
        Abai Insight (SQ) — <span className="text-[#f59e0b]">Server-based Quiz</span>
      </motion.h1>
      <p className="mt-2 text-slate-600">
        Барлық сұрақтар мен тексеру — <b>серверден</b>. Таңдаған жауабыңыз әр сұрақта бірден жіберіледі.
      </p>

      {/* КАТАЛОГ КНИГ */}
      {phase === "catalog" && (
        <div className="mt-6">
          <div className="mb-3 flex items-center gap-2">
            <button
              onClick={loadBooks}
              disabled={loadingBooks}
              className="rounded-xl border px-3 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-40"
            >
              {loadingBooks ? "Жүктелуде…" : "Қайта жүктеу"}
            </button>
            {booksErr && <span className="text-sm text-rose-600">{booksErr}</span>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((b) => (
              <div key={b.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-amber-100 to-orange-100 flex items-center justify-center text-xl">📘</div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-slate-900">{b.title}</h3>
                    <p className="text-xs text-slate-500">{b.author}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => startBook(b)}
                    className="rounded-xl bg-sky-600 text-white px-4 py-2 text-sm font-semibold"
                  >
                    Тестті бастау
                  </button>
                </div>
              </div>
            ))}
            {!loadingBooks && !booksErr && books.length === 0 && (
              <div className="rounded-xl border p-4 text-slate-500">Кітаптар жоқ.</div>
            )}
          </div>
        </div>
      )}

      {/* ТЕСТ */}
      {phase === "quiz" && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white/80 p-5 shadow">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center text-xl">📖</div>
            <div className="min-w-0">
              <h3 className="text-xl font-bold text-slate-900">{book?.title}</h3>
              <p className="text-xs text-slate-500">{book?.author}</p>
            </div>
            <button onClick={restart} className="ml-auto rounded-xl border px-3 py-2 text-sm font-semibold">Кітаптарға оралу</button>
          </div>

          {loadingQs && <p className="mt-4 text-sm text-slate-500">Сұрақтар жүктелуде…</p>}
          {qsErr && (
            <div className="mt-4 text-sm text-rose-600">{qsErr}</div>
          )}

          {!loadingQs && !qsErr && total > 0 && current && (
            <>
              <div className="mt-4">
                <Progress value={progress} />
                <div className="mt-2 flex justify-between text-xs text-slate-500">
                  <span>Сұрақ {step + 1} / {total}</span>
                  {submitting && <span>Жіберілуде…</span>}
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-lg font-bold text-slate-900">{current.prompt}</h4>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {current.options.map((opt, i) => {
                    const letter = fromIndex(i);
                    const chosen = answers[current.id] === letter;
                    const res = results[current.id];
                    const judged = !!res;
                    const ok = res?.correct === true && chosen;
                    const wrong = judged && chosen && !res.correct;

                    return (
                      <button
                        key={`${current.id}-${letter}`}
                        onClick={() => onChoose(step, i)}
                        className={`text-left rounded-xl border-2 p-4 transition ${
                          chosen ? "border-sky-600 bg-sky-50" : "border-slate-200 hover:border-sky-300 hover:bg-sky-50/40"
                        } ${wrong ? "border-rose-300 bg-rose-50/50" : ""} ${ok ? "border-emerald-300 bg-emerald-50/60" : ""}`}
                        disabled={submitting}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 h-2.5 w-2.5 rounded-full ${chosen ? "bg-sky-600" : "bg-slate-300"}`} />
                          <span className="text-slate-800"><b>{letter})</b> {opt}</span>
                          {judged && chosen && <Badge ok={!!res.correct} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <button
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  disabled={step === 0}
                  className={`rounded-xl px-4 py-2 font-semibold border ${step === 0 ? "text-slate-400 border-slate-200 cursor-not-allowed" : "border-slate-300"}`}
                >
                  ⟵ Артқа
                </button>
                {step < total - 1 ? (
                  <button
                    onClick={() => setStep((s) => Math.min(total - 1, s + 1))}
                    disabled={!answers[current.id]}
                    className={`rounded-xl px-4 py-2 font-semibold ${!answers[current.id] ? "bg-slate-200 text-slate-500 cursor-not-allowed" : "bg-sky-600 text-white"}`}
                  >
                    Келесі ⟶
                  </button>
                ) : (
                  <button
                    onClick={finish}
                    disabled={Object.keys(answers).length < total}
                    className={`rounded-xl px-4 py-2 font-semibold ${
                      Object.keys(answers).length < total ? "bg-slate-200 text-slate-500 cursor-not-allowed" : "bg-emerald-600 text-white"
                    }`}
                  >
                    Тапсыру ✓
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* РЕЗУЛЬТАТ */}
      {phase === "result" && (
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-xl">🎉</div>
            <div className="min-w-0">
              <h3 className="text-xl font-bold text-slate-900">Нәтиже — {book?.title}</h3>
              <p className="text-xs text-slate-500">{book?.author}</p>
            </div>
            <button onClick={restart} className="ml-auto rounded-xl border px-3 py-2 text-sm font-semibold">Кітаптарға оралу</button>
          </div>

          {!summary && !summaryErr && <p className="mt-3 text-sm text-slate-500">Қорытынды жүктелуде…</p>}
          {summaryErr && <p className="mt-3 text-sm text-rose-600">{summaryErr}</p>}

          {summary && (
            <>
              <div className="mt-4 grid sm:grid-cols-3 gap-3 text-sm">
                <div className="rounded-xl border p-4">
                  <p className="text-slate-500">Жалпы сұрақ</p>
                  <p className="mt-1 font-semibold">{summary.total}</p>
                </div>
                <div className="rounded-xl border p-4">
                  <p className="text-slate-500">Дұрысы</p>
                  <p className="mt-1 font-semibold">{summary.correct}</p>
                </div>
                <div className="rounded-xl border p-4">
                  <p className="text-slate-500">Ұпай</p>
                  <p className="mt-1 font-semibold">{summary.points}</p>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-semibold text-slate-900">Таңдалған жауаптар</h4>
                <div className="mt-3 grid gap-3">
                  {questions.map((q, idx) => {
                    const chosen = answers[q.id];
                    const res = results[q.id];
                    return (
                      <div key={q.id} className="rounded-xl border p-4">
                        <div className="flex items-start gap-2">
                          <span className="mt-0.5 text-sm font-semibold text-slate-500">{idx + 1}.</span>
                          <div className="flex-1">
                            <p className="font-medium text-slate-900">{q.prompt} {res ? <Badge ok={!!res.correct} /> : null}</p>
                            <p className="mt-1 text-sm">
                              Таңдалған: <b>{chosen ?? "—"}</b>
                              {q.correctLetter ? <> | Дұрыс: <b className="text-emerald-700">{q.correctLetter}</b></> : null}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
