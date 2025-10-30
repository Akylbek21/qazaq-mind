// src/pages/IntellectUp.jsx
import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

/* ---------- Мини IQ-челендж сұрақтары ---------- */
const QUESTIONS = [
  {
    q: "Сандар қатары: 2, 4, 8, 16, ... Келесі сан?",
    options: ["18", "24", "32", "64"],
    correct: "32",
  },
  {
    q: "Ана 4 кітап сатып алды. Әр кітап 1500 тг. Барлығы?",
    options: ["4500", "6000", "7500", "9000"],
    correct: "6000",
  },
  {
    q: "Логика: Барлық мұғалімдер – ментор. Айжан – мұғалім. Қорытынды?",
    options: ["Айжан – ментор", "Айжан – оқушы", "Айжан – ата-ана", "Қорытындысыз"],
    correct: "Айжан – ментор",
  },
  {
    q: "Уақыт: сабақ 45 мин. 3 сабақ пен 1 үзіліс (10 мин) неше минут?",
    options: ["135", "145", "155", "175"],
    correct: "145",
  },
  {
    q: "Фигура: төртбұрыштың бұрыштарының қосындысы?",
    options: ["180°", "270°", "360°", "540°"],
    correct: "360°",
  },
];

/* ---------- Безопасная ссылка: Router жоқ болса <a> ---------- */
function SmartLink({ to, className = "", children, ...rest }) {
  // react-router-dom қосылмаған болса да жұмыс істейді
  let InRouter = null;
  try {
    // динамикалық импортсыз қауіпсіз тексеріс
    InRouter = require("react-router-dom").useInRouterContext;
  } catch (_) {}
  const inRouter = InRouter?.() ?? false;

  if (!inRouter) {
    return (
      <a href={to} className={className} {...rest}>
        {children}
      </a>
    );
  }
  const { Link } = require("react-router-dom");
  return (
    <Link to={to} className={className} {...rest}>
      {children}
    </Link>
  );
}

export default function IntellectUp() {
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0); // 0 = intro; 1..N = сұрақтар
  const [answers, setAnswers] = useState({});
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); // 60 сек. таймер

  /* ---------- Таймер ---------- */
  useEffect(() => {
    if (!started || finished) return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          // уақыт бітті -> тестті аяқтау
          clearInterval(id);
          setFinished(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [started, finished]);

  const score = useMemo(
    () =>
      Object.entries(answers).reduce((acc, [i, val]) => {
        const idx = Number(i);
        return acc + (QUESTIONS[idx].correct === val ? 1 : 0);
      }, 0),
    [answers]
  );

  const levelText = useMemo(() => {
    if (score <= 2) return "Бастапқы деңгей — логикалық негіздерді шыңдау қажет.";
    if (score === 3 || score === 4) return "Орта деңгей — тұрақты жаттығумен тез өсесіз.";
    return "Жоғары деңгей — күрделі тапсырмаларға дайынсыз!";
  }, [score]);

  const start = () => {
    setStarted(true);
    setStep(1);
    setTimeLeft(60);
    setAnswers({});
    setFinished(false);
  };

  const selectOption = (idx, value) => {
    setAnswers((prev) => ({ ...prev, [idx]: value }));
  };

  const next = () => {
    if (step < QUESTIONS.length) setStep(step + 1);
    else setFinished(true);
  };

  const restart = () => {
    setStarted(false);
    setStep(0);
    setAnswers({});
    setFinished(false);
    setTimeLeft(60);
  };

  const progressPct =
    step === 0 ? 0 : Math.round(((step - 1) / QUESTIONS.length) * 100);

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      {/* Header */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="text-3xl md:text-4xl font-extrabold text-slate-900 text-center"
      >
        IntellectUp — <span className="text-[#1F7A8C]">Ақылды ойды шыңда!</span>
      </motion.h1>
      <p className="mt-2 text-center text-slate-600">
        60 секундтық мини-челендж: 5 сұраққа жауап беріп, IQ ұпайыңызды біліңіз.
      </p>

      {/* Intro */}
      {!started && !finished && step === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 text-center"
        >
          <button
            onClick={start}
            className="mt-4 inline-flex items-center justify-center rounded-xl px-5 py-3 bg-[#1F7A8C] text-white font-semibold shadow hover:opacity-95"
          >
            Тапсырманы бастау
          </button>
        </motion.div>
      )}

      {/* Progress + Timer */}
      {started && !finished && (
        <div className="mt-8">
          <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
            <span>
              Сұрақ {step}/{QUESTIONS.length}
            </span>
            <span>Қалған уақыт: {timeLeft} c</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-2 bg-gradient-to-r from-[#1F7A8C] to-[#1aa6b5] transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Questions */}
      {started && !finished && step > 0 && (
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur p-5 shadow"
        >
          <h2 className="text-xl font-semibold text-slate-900">
            {QUESTIONS[step - 1].q}
          </h2>

          <div className="mt-4 grid gap-3">
            {QUESTIONS[step - 1].options.map((opt) => {
              const checked = answers[step - 1] === opt;
              return (
                <button
                  key={opt}
                  onClick={() => selectOption(step - 1, opt)}
                  className={`text-left rounded-xl border px-4 py-3 transition ${
                    checked
                      ? "border-[#1F7A8C] bg-[#1F7A8C]/10"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex justify-between items-center">
            <div className="text-slate-500 text-sm">Жауапты белгілеңіз</div>
            <button
              onClick={next}
              disabled={!answers.hasOwnProperty(step - 1)}
              className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 bg-slate-900 text-white font-medium disabled:opacity-40"
            >
              {step < QUESTIONS.length ? "Келесі" : "Нәтижені көру"}
            </button>
          </div>
        </motion.div>
      )}

      {/* Result */}
      {finished && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-10 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur p-6 shadow"
        >
          <h3 className="text-2xl font-bold text-slate-900">Нәтиже</h3>
          <p className="mt-2 text-slate-700">
            IQ ұпайыңыз:{" "}
            <span className="font-semibold">
              {score} / {QUESTIONS.length}
            </span>
          </p>
          <p className="mt-1 text-slate-600">{levelText}</p>

          <div className="mt-5 grid sm:grid-cols-3 gap-3">
            <div className="rounded-xl border p-4">
              <p className="text-sm text-slate-500">Адаптивті ұсыныс</p>
              <p className="mt-1 font-semibold">
                {score <= 2
                  ? "Негізгі логика жаттығулары (күніне 10–15 мин)"
                  : score <= 4
                  ? "Орташа деңгейге арналған күрделірек есептер"
                  : "Олимпиадалық типтегі тапсырмалар"}
              </p>
            </div>
            <div className="rounded-xl border p-4">
              <p className="text-sm text-slate-500">Келесі қадам</p>
              <p className="mt-1 font-semibold">RealTalkTime (EQ)</p>
            </div>
            <div className="rounded-xl border p-4">
              <p className="text-sm text-slate-500">Қысқа кеңес</p>
              <p className="mt-1 font-semibold">Қате жауаптарды талдап шығыңыз</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <SmartLink
              to="/realtalktime"
              className="inline-flex items-center justify-center rounded-xl px-5 py-3 bg-[#1aa6b5] text-white font-semibold shadow hover:opacity-95"
            >
              Келесі: RealTalkTime (EQ)
            </SmartLink>
            <button
              onClick={restart}
              className="inline-flex items-center justify-center rounded-xl px-5 py-3 border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Қайта бастау
            </button>
            <SmartLink
              to="/"
              className="inline-flex items-center justify-center rounded-xl px-5 py-3 border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Басты бетке
            </SmartLink>
          </div>
        </motion.div>
      )}
    </div>
  );
}
