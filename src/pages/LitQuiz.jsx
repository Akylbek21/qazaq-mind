// src/pages/LitQuiz.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { LIT_QUIZZES } from "../data/litQuizzes";

export default function LitQuiz() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const data = LIT_QUIZZES[slug];

  const [state, setState] = React.useState("start");
  const [idx, setIdx] = React.useState(0);
  const [score, setScore] = React.useState(0);

  if (!data) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-10">
        <p className="text-slate-700">Викторина табылмады.</p>
        <button className="btn btn-tertiary mt-4" onClick={() => navigate(-1)}>⟵ Артқа</button>
      </div>
    );
  }

  const q = data.questions[idx];
  const progress = ((idx + 1) / data.questions.length) * 100;

  const choose = (opt) => {
    if (opt.correct) setScore((s) => s + 1);
    if (idx < data.questions.length - 1) setIdx((i) => i + 1);
    else setState("result");
  };

  const restart = () => {
    setState("start"); setIdx(0); setScore(0);
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-10">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-5xl font-extrabold tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#1F7A8C] via-[#1aa6b5] to-[#0ea5a5]">
            {data.title}
          </span>
        </motion.h1>
        <div className="mx-auto mt-3 h-[3px] w-24 rounded-full bg-gradient-to-r from-[#1F7A8C] to-[#FFD580]" />
      </div>

      <div className="rounded-2xl p-6 md:p-10 bg-white/80 backdrop-blur-xl border border-slate-200/70 shadow-[0_10px_30px_rgba(16,37,66,0.06)]">
        <AnimatePresence mode="wait">
          {state === "start" && (
            <motion.div key="start" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="text-center">
              <p className="max-w-2xl mx-auto text-slate-600 text-lg mb-8">{data.intro}</p>
              <button className="btn btn-primary btn-xl" onClick={() => setState("quiz")}>Бастау</button>
              <div className="mt-6"><button onClick={() => navigate(-1)} className="btn btn-tertiary">⟵ Артқа</button></div>
            </motion.div>
          )}

          {state === "quiz" && (
            <motion.div key="quiz" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              {/* Progress */}
              <div className="mb-6">
                <div className="w-full bg-slate-200/70 rounded-full h-2.5 overflow-hidden">
                  <motion.div className="h-2.5 rounded-full bg-gradient-to-r from-[#1F7A8C] via-[#1aa6b5] to-[#0ea5a5]"
                    style={{ width: `${progress}%` }} initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.45, ease: "easeOut" }} />
                </div>
                <div className="mt-2 text-right text-xs text-slate-500">{idx + 1} / {data.questions.length}</div>
              </div>

              <h3 className="text-2xl md:text-3xl font-bold text-center text-slate-900 mb-6">{q.text}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {q.options.map((opt, i) => (
                  <motion.button key={i} onClick={() => choose(opt)} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}
                    className="group text-left rounded-xl border-2 border-slate-200/70 bg-white p-4 hover:border-teal-500/70 hover:bg-teal-50/60 transition-all">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 h-2.5 w-2.5 rounded-full bg-teal-500/70 group-hover:bg-teal-600" />
                      <span className="text-slate-700 group-hover:text-slate-900">{opt.text}</span>
                    </div>
                  </motion.button>
                ))}
              </div>

              {q.explain && (
                <div className="mt-5 text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-xl p-3">
                  Түсіндірме: {q.explain}
                </div>
              )}
            </motion.div>
          )}

          {state === "result" && (
            <motion.div key="result" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
                  Нәтиже: {score} / {data.questions.length}
                </h2>
                <p className="mt-3 text-slate-600">Керемет! Қаласаңыз, қайта байқап көріңіз.</p>
                <div className="mt-6 flex gap-3 justify-center">
                  <button className="btn btn-tertiary" onClick={restart}>Қайта өту</button>
                  <button className="btn btn-primary" onClick={() => navigate(-1)}>Басты бет</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
