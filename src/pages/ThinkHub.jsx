// src/pages/ThinkHub.jsx
import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  fetchSQBooks,
  fetchSQBookQuestions,
  submitSQAnswer,
  fetchSQSummary,
  fromIndex,
} from "@/api/sq";

/* ---------- мини-утиль ---------- */
const Progress = ({ value }) => (
  <div className="w-full bg-slate-200/70 rounded-full h-2.5 overflow-hidden">
    <div
      className="h-2.5 rounded-full bg-gradient-to-r from-[#1F7A8C] via-[#1aa6b5] to-[#0ea5a5]"
      style={{ width: `${value}%` }}
    />
  </div>
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
  const [answers, setAnswers] = React.useState({}); // qId -> 'A'|'B'|'C'|'D'
  const [results, setResults] = React.useState({}); // qId -> {correct:boolean}
  const [submitting, setSubmitting] = React.useState(false);

  // Итог от сервера
  const [summary, setSummary] = React.useState(null);
  const [summaryErr, setSummaryErr] = React.useState("");

  // Загрузка книг
  const loadBooks = async () => {
    setLoadingBooks(true);
    setBooksErr("");
    try {
      const list = await fetchSQBooks();
      setBooks(Array.isArray(list) ? list : []);
    } catch (e) {
      setBooksErr(e?.message || "Кітаптар тізімі жүктелмеді.");
    } finally {
      setLoadingBooks(false);
    }
  };
  React.useEffect(() => {
    loadBooks();
  }, []);

  // Начать тест по книге
  const startBook = async (b) => {
    // сбрасываем состояния
    setBook(b);
    setPhase("quiz");
    setStep(0);
    setAnswers({});
    setResults({});
    setSummary(null);
    setSummaryErr("");

    setLoadingQs(true);
    setQsErr("");
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

  // Сохранение ответа (без отправки на сервер)
  const onChoose = async (qIndex, choiceIndex) => {
    if (!questions[qIndex]) return;
    const q = questions[qIndex];
    const letter = fromIndex(choiceIndex); // A/B/C/D
    if (!letter) return;

    // локально фиксируем выбор
    setAnswers((prev) => ({ ...prev, [q.id]: letter }));
  };

  // Горячие клавиши: 1..4 — выбор, Enter — далее
  React.useEffect(() => {
    if (phase !== "quiz") return;
    const handler = (e) => {
      if (!questions[step]) return;
      if (e.key >= "1" && e.key <= "4") {
        const idx = Number(e.key) - 1;
        if (questions[step]?.options?.[idx] != null) onChoose(step, idx);
      } else if (e.key === "Enter") {
        // если выбран ответ — перейти к следующему
        const qid = questions[step]?.id;
        if (qid && answers[qid]) {
          if (step < questions.length - 1) setStep((s) => s + 1);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, step, questions, answers]);

  // Завершение: вытягиваем summary
  const finish = async () => {
    if (!book) return;
    setSummary(null);
    setSummaryErr("");
      setSubmitting(true);
    
    try {
        // Отправляем все ответы на сервер
        for (const qId in answers) {
          const res = await submitSQAnswer({ 
            questionId: qId, 
            chosen: answers[qId] 
          });
          setResults(prev => ({
            ...prev,
            [qId]: { correct: !!res?.correct }
          }));
        }

        // Получаем итоговый результат
      const s = await fetchSQSummary(book.id);
      // Используем только данные с сервера, без fallback
      const total = Number(s?.total) || 0;
      const correct = Number(s?.correct) || 0;
      const points = Number(s?.points) || 0;
      setSummary({ total, correct, points });
        setPhase("result");
    } catch (e) {
      setSummaryErr(e?.message || "Қорытындыны алу мүмкін болмады.");
      } finally {
        setSubmitting(false);
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
      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl md:text-4xl font-extrabold text-slate-900"
      >
        Abai Insight (SQ)
      </motion.h1>
      <p className="mt-2 text-slate-600">
        ThinkHubBala – «Ой орталығы, хаб»
        Абайдың рухани мұрасы арқылы адамгершілік, рухани және мәдени сана қалыптастыру
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
            {booksErr && (
              <span className="text-sm text-rose-600">{booksErr}</span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((b, idx) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative rounded-2xl border border-slate-200/70 bg-white/90 backdrop-blur-xl p-6 shadow-[0_10px_30px_rgba(16,37,66,0.08)] hover:shadow-[0_16px_40px_rgba(16,37,66,0.15)] transition-all duration-300 overflow-hidden"
              >
                {/* Декоративный градиент при hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#1F7A8C]/5 via-transparent to-[#0ea5a5]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative">
                  {/* Обложка книги */}
                  <div className="mb-4 flex justify-center">
                    {b.imageUrl ? (
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#1F7A8C]/20 to-[#0ea5a5]/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                        <img 
                          src={b.imageUrl} 
                          alt={b.title} 
                          className="relative w-full max-w-[200px] h-[280px] rounded-xl object-cover border-2 border-slate-200 shadow-lg group-hover:shadow-2xl transition-all duration-300 group-hover:scale-105" 
                        />
                      </div>
                    ) : (
                      <div className="w-full max-w-[200px] h-[280px] rounded-xl bg-gradient-to-br from-amber-100 via-orange-100 to-amber-200 flex items-center justify-center text-6xl shadow-lg group-hover:shadow-2xl transition-all duration-300 group-hover:scale-105 border-2 border-amber-200">
                        📘
                      </div>
                    )}
                  </div>

                  {/* Информация о книге */}
                  <div className="text-center mb-5">
                    <h3 className="text-xl font-extrabold text-slate-900 mb-2 leading-tight group-hover:text-[#1F7A8C] transition-colors duration-300">
                      {b.title}
                    </h3>
                    <p className="text-sm text-slate-600 font-medium">{b.author}</p>
                  </div>

                  {/* Кнопки */}
                  <div className="flex flex-col gap-3">
                    {b.bookUrl && (
                      <a
                        href={b.bookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/btn relative rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white px-6 py-3 text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden text-center"
                      >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          <span>📖 Кітапты оқу</span>
                          <span className="group-hover/btn:translate-x-1 transition-transform duration-300">↗</span>
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-600 via-orange-500 to-amber-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                      </a>
                    )}
                    <button
                      onClick={() => startBook(b)}
                      className="group/btn relative rounded-xl bg-gradient-to-r from-[#1F7A8C] via-[#1aa6b5] to-[#0ea5a5] text-white px-6 py-3 text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        <span>Тестті бастау</span>
                        <span className="group-hover/btn:translate-x-1 transition-transform duration-300">→</span>
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-[#0ea5a5] via-[#1aa6b5] to-[#1F7A8C] opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                    </button>
                  </div>
                </div>

                {/* Декоративные точки */}
                <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[#1F7A8C]/20 group-hover:bg-[#1F7A8C]/40 transition-colors duration-300" />
                <div className="absolute top-4 right-8 w-1.5 h-1.5 rounded-full bg-[#0ea5a5]/20 group-hover:bg-[#0ea5a5]/40 transition-colors duration-300" />
              </motion.div>
            ))}
            {!loadingBooks && !booksErr && books.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-12 text-center"
              >
                <div className="text-6xl mb-4">📚</div>
                <p className="text-lg font-semibold text-slate-700 mb-2">Кітаптар жоқ</p>
                <p className="text-sm text-slate-500">Кітаптар тізімі бос</p>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* ТЕСТ */}
      {phase === "quiz" && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white/80 p-5 shadow">
          <div className="flex items-start gap-3">
            {book?.imageUrl ? (
              <img src={book.imageUrl} alt={book?.title} className="w-12 h-12 rounded-xl object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center text-xl">
                📖
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="text-xl font-bold text-slate-900">{book?.title}</h3>
              <p className="text-xs text-slate-500">{book?.author}</p>
            </div>
            <div className="flex gap-2">
              {book?.bookUrl && (
                <a
                  href={book.bookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border-2 border-amber-500 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-gradient-to-r hover:from-amber-100 hover:to-orange-100 transition-all duration-300 flex items-center gap-2"
                >
                  <span>📖</span>
                  <span>Кітапты оқу</span>
                </a>
              )}
              <button
                onClick={restart}
                className="rounded-xl border-2 border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all duration-300"
              >
                Кітаптарға оралу
              </button>
            </div>
          </div>

          {loadingQs && (
            <p className="mt-4 text-sm text-slate-500">Сұрақтар жүктелуде…</p>
          )}
          {qsErr && <div className="mt-4 text-sm text-rose-600">{qsErr}</div>}

          {!loadingQs && !qsErr && total > 0 && current && (
            <>
              <div className="mt-4">
                <Progress value={progress} />
                <div className="mt-2 flex justify-between text-xs text-slate-500">
                  <span>
                    Сұрақ {step + 1} / {total}
                  </span>
                  {submitting && <span>Жіберілуде…</span>}
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-lg font-bold text-slate-900">
                  {current.prompt}
                </h4>
                {current.imageUrl ? (
                  <div className="mt-3 flex justify-center">
                    <img src={current.imageUrl} alt={current.prompt?.slice(0,120) || 'question image'} className="max-h-48 w-auto rounded-lg object-contain border border-slate-200" />
                  </div>
                ) : null}
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {current.options.map((opt, i) => {
                    const letter = fromIndex(i);
                    const chosen = answers[current.id] === letter;
                    
                    return (
                      <button
                        key={`${current.id}-${letter}`}
                        onClick={() => onChoose(step, i)}
                        className={`text-left rounded-xl border-2 p-4 transition ${
                          chosen
                            ? "border-sky-600 bg-sky-50"
                            : "border-slate-200 hover:border-sky-300 hover:bg-sky-50/40"
                        }`}
                        disabled={submitting}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`mt-0.5 h-2.5 w-2.5 rounded-full ${
                              chosen ? "bg-sky-600" : "bg-slate-300"
                            }`}
                          />
                          <span className="text-slate-800">
                            <b>{letter})</b> {opt}
                          </span>
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
                  className={`rounded-xl px-4 py-2 font-semibold border ${
                    step === 0
                      ? "text-slate-400 border-slate-200 cursor-not-allowed"
                      : "border-slate-300"
                  }`}
                >
                  ⟵ Артқа
                </button>
                {step < total - 1 ? (
                  <button
                    onClick={() => setStep((s) => Math.min(total - 1, s + 1))}
                    disabled={!answers[current.id]}
                    className={`rounded-xl px-4 py-2 font-semibold ${
                      !answers[current.id]
                        ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                        : "bg-sky-600 text-white"
                    }`}
                  >
                    Келесі ⟶
                  </button>
                ) : (
                  <button
                    onClick={finish}
                    disabled={Object.keys(answers).length < total}
                    className={`rounded-xl px-4 py-2 font-semibold ${
                      Object.keys(answers).length < total
                        ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                        : "bg-emerald-600 text-white"
                    }`}
                  >
                      {submitting ? "Жауаптар тексерілуде..." : "Тапсыру ✓"}
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
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-xl">
              🎉
            </div>
            <div className="min-w-0">
              <h3 className="text-xl font-bold text-slate-900">
                Нәтиже — {book?.title}
              </h3>
              <p className="text-xs text-slate-500">{book?.author}</p>
            </div>
            <button
              onClick={restart}
              className="ml-auto rounded-xl border px-3 py-2 text-sm font-semibold"
            >
              Кітаптарға оралу
            </button>
          </div>

          {!summary && !summaryErr && (
            <p className="mt-3 text-sm text-slate-500">Қорытынды жүктелуде…</p>
          )}
          {summaryErr && (
            <p className="mt-3 text-sm text-rose-600">{summaryErr}</p>
          )}

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
            </>
          )}
        </div>
      )}

      {/* Кнопка возврата на главную */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 flex justify-center"
      >
        <Link 
          to="/" 
          className="inline-flex items-center justify-center rounded-xl px-6 py-3 border-2 border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-300"
        >
          Басты бетке оралу
        </Link>
      </motion.div>
    </div>
  );
}