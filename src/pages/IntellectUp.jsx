// src/pages/IntellectUp.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { motion } from "framer-motion";

/* ===================== Деректер: мини IQ-челендж ===================== */
/* Қостым қысқа түсіндірмелерді (exp) және әр сұрақтың id-сын */
const BASE_QUESTIONS = [
  {
    id: "prog",
    q: "Сандар қатары: 2, 4, 8, 16, ... Келесі сан?",
    options: ["18", "24", "32", "64"],
    correct: "32",
    exp: "Әр қадамда 2-ге көбейту: 2→4→8→16→32.",
  },
  {
    id: "price",
    q: "Ана 4 кітап сатып алды. Әр кітап 1500 тг. Барлығы?",
    options: ["4500", "6000", "7500", "9000"],
    correct: "6000",
    exp: "4 × 1500 = 6000 тг.",
  },
  {
    id: "logic",
    q: "Логика: Барлық мұғалімдер – ментор. Айжан – мұғалім. Қорытынды?",
    options: ["Айжан – ментор", "Айжан – оқушы", "Айжан – ата-ана", "Қорытындысыз"],
    correct: "Айжан – ментор",
    exp: "Барлық A — B. Айжан — A → Айжан — B.",
  },
  {
    id: "time",
    q: "Уақыт: сабақ 45 мин. 3 сабақ пен 1 үзіліс (10 мин) неше минут?",
    options: ["135", "145", "155", "175"],
    correct: "145",
    exp: "3 × 45 = 135, үстіне 10 мин үзіліс → 145 мин.",
  },
  {
    id: "geometry",
    q: "Фигура: төртбұрыштың бұрыштарының қосындысы?",
    options: ["180°", "270°", "360°", "540°"],
    correct: "360°",
    exp: "Көпбұрыш формуласы: (n−2)×180°. n=4 → 360°.",
  },
];

/* ===================== Qalam Start (1–4) — деректер ===================== */
const QALAM_START_MCQ = [
  {
    q: "Балалар не себепті далада ойнап жүр?",
    options: [
      "Өйткені оларды мұғалім шақырды",
      "Себебі қыс мезгілі, ауа райы жылы және қар жауған",
      "Өйткені жазғы демалыс уақыты",
      "Себебі олар спорт залында жаттығып жүр",
    ],
    correctIndex: 1,
  },
  {
    q: "Суретте жылдың қыс мезгілі бейнеленгенін қалай анықтауға болады?",
    options: [
      "Себебі ағаштарда гүлдер көп",
      "Себебі балалар жеңіл көйлек киіп алған",
      "Себебі қар бар, балалар қолғап пен күрте киген",
      "Себебі күн сәулесі қатты түсіп тұр",
    ],
    correctIndex: 2,
  },
  {
    q: "Егер ауа-райы өзгеріп, қар ерісе, не болады деп ойлайсың?",
    options: [
      "Балалар шомылуға кетеді",
      "Балалар қармен ойнай алмай қалады",
      "Балалар шанамен сырғанайды",
      "Балалар қардан аққала жасайды",
    ],
    correctIndex: 1,
  },
  {
    q: "Балалар неліктен жылы киінді деп ойлайсың?",
    options: [
      "Өйткені қыс мезгілі, суықтан қорғану үшін",
      "Өйткені мектеп формасы сондай",
      "Өйткені олар би сабағына бара жатыр",
      "Өйткені ата-анасы солай айтты",
    ],
    correctIndex: 0,
  },
  {
    q: "Егер сен сол суреттегі бала болсаң, не істер едің?",
    options: [
      "Үйде кітап оқып отырамын",
      "Достарыммен бірге қар атысып ойнаймын",
      "Телефон ойынын ашамын",
      "Дүкенге барамын",
    ],
    correctIndex: 1,
  },
];

/* ===================== Көмекші утилиттер ===================== */
const LS_KEY = "intellect_up_stats_v1";

function loadStats() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "{}");
  } catch {
    return {};
  }
}
function saveStats(v) {
  localStorage.setItem(LS_KEY, JSON.stringify(v));
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* Варианттарды араластырамыз, бірақ дұрыс жауапты қадағалаймыз */
function withShuffledOptions(q) {
  const shuffled = shuffle(q.options);
  const correctIndex = shuffled.indexOf(q.correct);
  return { ...q, options: shuffled, correct: shuffled[correctIndex] };
}

/* ---------- Безопасная ссылка: Router жоқ болса <a> ---------- */
function SmartLink({ to, className = "", children, ...rest }) {
  let InRouter = null;
  try {
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

/* ---------- Көмекші UI ---------- */
const Pill = ({ children, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-xl text-sm font-semibold border transition ${
      active
        ? "bg-slate-900 text-white border-slate-900"
        : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
    }`}
  >
    {children}
  </button>
);

/* ===================== Негізгі компонент ===================== */
export default function IntellectUp() {
  const [tab, setTab] = useState("iq"); // 'iq' | 'start' | 'progress'

  /* ================= IQ state ================= */
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0); // 0 = intro; 1..N = сұрақтар
  const [answers, setAnswers] = useState({}); // { [qIndex]: "таңдалған опция" }
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [stats, setStats] = useState(() => loadStats());
  const [questions, setQuestions] = useState(() =>
    BASE_QUESTIONS.map(withShuffledOptions)
  );

  /* Перезапуск при старте: жаңа ретпен араластыру */
  const start = () => {
    setQuestions(BASE_QUESTIONS.map(withShuffledOptions));
    setStarted(true);
    setStep(1);
    setTimeLeft(60);
    setAnswers({});
    setFinished(false);
  };

  const restart = () => {
    setStarted(false);
    setStep(0);
    setAnswers({});
    setFinished(false);
    setTimeLeft(60);
  };

  /* ---------- Таймер ---------- */
  useEffect(() => {
    if (!started || finished || tab !== "iq") return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(id);
          setFinished(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [started, finished, tab]);

  /* ---------- Хоткеи: 1..4 таңдау, Enter – Келесі ---------- */
  const handleKey = useCallback(
    (e) => {
      if (tab !== "iq" || !started || finished || step === 0) return;
      const currentIdx = step - 1;
      const opts = questions[currentIdx]?.options || [];
      if (e.key >= "1" && e.key <= "4") {
        const i = Number(e.key) - 1;
        if (opts[i]) {
          setAnswers((prev) => ({ ...prev, [currentIdx]: opts[i] }));
        }
      }
      if (e.key === "Enter") {
        if (answers.hasOwnProperty(currentIdx)) {
          if (step < questions.length) setStep((s) => s + 1);
          else setFinished(true);
        }
      }
    },
    [answers, finished, questions, started, step, tab]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  /* ---------- Скоры және деңгей мәтіні ---------- */
  const score = useMemo(
    () =>
      Object.entries(answers).reduce((acc, [i, val]) => {
        const idx = Number(i);
        return acc + (questions[idx].correct === val ? 1 : 0);
      }, 0),
    [answers, questions]
  );

  const levelText = useMemo(() => {
    if (score <= 2) return "Бастапқы деңгей — логикалық негіздерді шыңдау қажет.";
    if (score === 3 || score === 4) return "Орта деңгей — тұрақты жаттығумен тез өсесіз.";
    return "Жоғары деңгей — күрделі тапсырмаларға дайынсыз!";
  }, [score]);

  /* ---------- Келесі/Артқа ---------- */
  const selectOption = (qIndex, value) => {
    setAnswers((prev) => ({ ...prev, [qIndex]: value }));
  };

  const next = () => {
    if (step < questions.length) setStep(step + 1);
    else setFinished(true);
  };

  const prev = () => {
    if (step > 1) setStep(step - 1);
  };

  /* ---------- Прогресс ---------- */
  const progressPct = step === 0 ? 0 : Math.round(((step - 1) / questions.length) * 100);

  /* ---------- Статистиканы сақтау (best score, attempts) ---------- */
  useEffect(() => {
    if (!finished) return;
    const attempts = (stats.attempts || 0) + 1;
    const best = Math.max(stats.best || 0, score);
    const newStats = { attempts, best, last: score, lastAt: Date.now() };
    setStats(newStats);
    saveStats(newStats);
  }, [finished]); // eslint-disable-line

  /* ---------- Таймер түсі ---------- */
  const timeColor =
    timeLeft > 30 ? "text-emerald-600" : timeLeft > 15 ? "text-amber-600" : "text-rose-600";

  /* ================= Qalam Start (1–4) state ================= */
  const [s1Idx, setS1Idx] = useState(0); // MCQ step
  const [s1Ans, setS1Ans] = useState({}); // { idx: optionIndex }
  const [s1Done, setS1Done] = useState(false);

  const s1Score = useMemo(
    () =>
      Object.entries(s1Ans).reduce((acc, [i, val]) => {
        const idx = Number(i);
        return acc + (val === QALAM_START_MCQ[idx].correctIndex ? 1 : 0);
      }, 0),
    [s1Ans]
  );

  const [write23, setWrite23] = useState("");
  const [write23Feedback, setWrite23Feedback] = useState([]);

  const runWrite23Check = () => {
    const tips = [];
    const sentences = write23
      .split(/(?<=[.!?…])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (sentences.length < 2) tips.push("Кемінде 2 сөйлем жаз.");
    if (sentences.length > 3) tips.push("3 сөйлемнен асырма.");
    sentences.forEach((s, i) => {
      if (!/^[A-ZА-ЯӘІҢҒҮҰҚӨҺ]/.test(s)) tips.push(`${i + 1}-сөйлем бас әріптен басталсын.`);
      if (!/[.!?…]$/.test(s)) tips.push(`${i + 1}-сөйлем соңына нүкте/сұрақ/леп белгісі қой.`);
    });
    if (!/(себебі|сондықтан|өйткені)/i.test(write23))
      tips.push("Себеп–салдар байланысын көрсететін сөз қос: “себебі/сондықтан/өйткені”.");
    setWrite23Feedback(tips.length ? tips : ["Жарайсың! Негізгі талаптар сақталған."]);
  };

  // 2-БАҒЫТ: Әңгіме аяқтау (Абай)
  const [abayText, setAbayText] = useState("");
  const [abayFb, setAbayFb] = useState([]);

  const runAbayCheck = () => {
    const tips = [];
    const t = abayText.trim();
    if (t.split(/\s+/).length < 30) tips.push("Кемінде 30 сөз шамасында жазыңыз.");
    if (!/(басы|әуелі|алдымен|біріншіден)/i.test(t)) tips.push("“Басы/әуелі/алдымен/біріншіден” сияқты бастау беріңіз.");
    if (!/(негізгі|екіншіден|мысалы|дәлел)/i.test(t)) tips.push("Негізгі бөлікке мысал/дәлел қосыңыз.");
    if (!/(қорытынды|соңында|түйіндей|демек)/i.test(t)) tips.push("Қорытынды сөйлем қосыңыз.");
    if (!/(талап|еңбек|терең ой|қанағат|рақым)/i.test(t))
      tips.push("Абайдың бес асыл ісінен кемінде біреуін атаңыз (талап/еңбек/терең ой/қанағат/рақым).");
    setAbayFb(tips.length ? tips : ["Керемет! Б–О–С сақталған, идея айқын."]);
  };

  // 3-БАҒЫТ: Дыбыспен айту (үлгілік өзіндік белгілеу)
  const [soundChoice, setSoundChoice] = useState(null); // 0: 🐍, 1: 🐀, 2: 🥕
  const soundCorrect = soundChoice === 2; // "сәбіз" — 'с' дыбысы

  // 4-БАҒЫТ: Грамматикалық көмек
  const [fix1, setFix1] = useState("");
  const [fix2, setFix2] = useState("");
  const [fixFb, setFixFb] = useState([]);

  const runFixCheck = () => {
    const ok1 =
      /^Мен\s+далада\s+ойнадым[.!?…]?$/.test(fix1.trim());
    const alt2 =
      /^Мысық(тар)?\s+доп(пен)?\s+көп\s+ойнады[.!?…]?$/.test(fix2.trim());
    const strict2 = /^Мысықтар\s+көп\s+доп\s+ойнады[.!?…]?$/.test(fix2.trim());
    const tips = [];
    if (!ok1) tips.push("1-сөйлем үшін дұрыс нұсқа: “Мен далада ойнадым.”");
    if (!(alt2 || strict2)) tips.push("2-сөйлем үшін дұрыс нұсқа: “Мысықтар көп доп ойнады.” немесе “Мысықтар доппен көп ойнады.”");
    if (!tips.length) tips.push("Жарайсың! Сөйлемдер дұрыс түзетілді.");
    setFixFb(tips);
  };

  /* ================= Qalam Progress (5–8) state ================= */
  // 1-БАҒЫТ: Мәтін құрастыру (Момышұлы)
  const [mIntro, setMIntro] = useState("");
  const [mBody, setMBody] = useState("");
  const [mConc, setMConc] = useState("");
  const [mRubric, setMRubric] = useState(null);

  const runMCheck = () => {
    let score = 0;
    if (mIntro.trim().length >= 20) score++;
    if (mBody.trim().length >= 40) score++;
    if (mConc.trim().length >= 15) score++;
    if (/(мысал|дәйек|дерек|тактика|тәртіп|ерлік)/i.test(mBody)) score++;
    setMRubric(score); // 0..4
  };

  // 2-БАҒЫТ: Аргумент жазу (телефон)
  const [argOpinion, setArgOpinion] = useState("иә"); // "иә" | "жоқ"
  const [arg1, setArg1] = useState("");
  const [arg2, setArg2] = useState("");
  const [argCounter, setArgCounter] = useState("");
  const [argScore, setArgScore] = useState(null);

  const runArgCheck = () => {
    let sc = 0;
    if (argOpinion) sc++;
    if (arg1.trim().length >= 15) sc++;
    if (arg2.trim().length >= 15) sc++;
    if (argCounter.trim().length >= 15) sc++;
    if (/(мысал|дерек|статистика|өлшем|нақты)/i.test(arg1 + " " + arg2)) sc++;
    setArgScore(sc); // 0..5
  };

  // 3-БАҒЫТ: Сөйлем байланысын талдау
  const baseText = [
    "Таңертең күн ашық болды.",
    "Мен мектепке асықтым.",
    "Жолда досымды кездестірдім.",
    "Біз бірге бардық.",
  ];
  const [linkKinds, setLinkKinds] = useState(["", "", "", ""]); // per sentence labels
  const [linkFb, setLinkFb] = useState(null);

  const runLinkCheck = () => {
    // Күтілетін: 1 — уақыт/жағдай, 2 — себеп, 3 — салдар (себеп-салдар 2–3), 4 — қорытынды/нәтиже
    const expect = ["уақыт", "себеп", "салдар", "қорытынды"];
    const ok = linkKinds.every((v, i) => v === expect[i]);
    setLinkFb(ok ? "Дұрыс: 2–3 сөйлемдері себеп–салдар, 4 — қорытынды." : "Байланысты қайта ойла. 2 — себеп, 3 — салдар деп белгілеуге тырыс.");
  };

  // 4-БАҒЫТ: Рефлексия
  const [refStrong, setRefStrong] = useState("");
  const [refImprove, setRefImprove] = useState("");
  const [refMood, setRefMood] = useState("");
  const [refDone, setRefDone] = useState(false);

  /* ===================== Рендерлер ===================== */

  const renderIQ = () => (
    <>
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
          <div className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur px-4 py-3 shadow">
            <div className="text-left">
              <p className="text-sm text-slate-600">
                Қысқа нұсқаулық: 1–4 пернелерімен жауап таңдаңыз, <b>Enter</b> — келесі.
              </p>
              <p className="text-sm text-slate-600">Жауапты түзету үшін артқа қайтуға болады.</p>
            </div>
          </div>
          <br />
          <button
            onClick={start}
            className="mt-4 inline-flex items-center justify-center rounded-xl px-5 py-3 bg-[#1F7A8C] text-white font-semibold shadow hover:opacity-95"
          >
            Тапсырманы бастау
          </button>

          {stats?.attempts ? (
            <div className="mt-6 grid sm:grid-cols-3 gap-3 text-sm">
              <div className="rounded-xl border p-4">
                <p className="text-slate-500">Соңғы ұпай</p>
                <p className="mt-1 font-semibold">
                  {stats.last ?? 0} / {BASE_QUESTIONS.length}
                </p>
              </div>
              <div className="rounded-xl border p-4">
                <p className="text-slate-500">Ең үздік нәтиже</p>
                <p className="mt-1 font-semibold">
                  {stats.best ?? 0} / {BASE_QUESTIONS.length}
                </p>
              </div>
              <div className="rounded-xl border p-4">
                <p className="text-slate-500">Талпыныс саны</p>
                <p className="mt-1 font-semibold">{stats.attempts ?? 0}</p>
              </div>
            </div>
          ) : null}
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
            {questions[step - 1].q}
          </h2>

          <div className="mt-4 grid gap-3">
            {questions[step - 1].options.map((opt, i) => {
              const checked = answers[step - 1] === opt;
              return (
                <button
                  key={opt}
                  onClick={() => selectOption(step - 1, opt)}
                  className={`text-left rounded-xl border px-4 py-3 transition focus:outline-none focus:ring-2 focus:ring-sky-400 ${
                    checked
                      ? "border-[#1F7A8C] bg-[#1F7A8C]/10"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                  aria-pressed={checked}
                  aria-label={`Вариант ${i + 1}: ${opt}`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold
                      ${checked ? "bg-[#1F7A8C] text-white" : "bg-slate-200 text-slate-700"}`}
                    >
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

            <div className="text-slate-500 text-sm hidden sm:block">Жауапты белгілеңіз (1–4)</div>

            <button
              onClick={next}
              disabled={!answers.hasOwnProperty(step - 1)}
              className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 bg-slate-900 text-white font-medium disabled:opacity-40"
            >
              {step < questions.length ? "Келесі ⟶" : "Нәтижені көру"}
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
              {score} / {questions.length}
            </span>
          </p>
          <p className="mt-1 text-slate-600">{levelText}</p>

          {/* Обзор жауаптар */}
          <div className="mt-6">
            <h4 className="font-semibold text-slate-900">Жауаптарды талдау</h4>
            <div className="mt-3 grid gap-3">
              {questions.map((q, idx) => {
                const chosen = answers[idx];
                const correct = q.correct;
                const ok = chosen === correct;
                return (
                  <div
                    key={q.id}
                    className={`rounded-xl border p-4 ${
                      ok ? "border-emerald-200 bg-emerald-50/50" : "border-rose-200 bg-rose-50/40"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 text-sm font-semibold text-slate-500">
                        {idx + 1}.
                      </span>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{q.q}</p>
                        <p className="mt-1 text-sm">
                          Таңдалған:{" "}
                          <b className={ok ? "text-emerald-700" : "text-rose-700"}>
                            {chosen ?? "—"}
                          </b>{" "}
                          | Дұрыс: <b className="text-emerald-700">{correct}</b>
                        </p>
                        {q.exp && (
                          <p className="mt-1 text-sm text-slate-600">Түсіндірме: {q.exp}</p>
                        )}
                      </div>
                      <span
                        className={`ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold
                        ${ok ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}
                      >
                        {ok ? "Дұрыс" : "Бұрыс"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Кеңестер */}
          <div className="mt-6 grid sm:grid-cols-3 gap-3">
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

          {/* Actions */}
          <div className="mt-6 flex flex-wrap gap-3">
            <SmartLink
              to="/realtalktime"
              className="inline-flex items-center justify-center rounded-xl px-5 py-3 bg-[#1aa6b5] text-white font-semibold shadow hover:opacity-95"
            >
              Келесі: RealTalkTime (EQ)
            </SmartLink>
            <button
              onClick={start}
              className="inline-flex items-center justify-center rounded-xl px-5 py-3 bg-slate-900 text-white font-semibold"
            >
              Тағы бір рет өту
            </button>
            <button
              onClick={restart}
              className="inline-flex items-center justify-center rounded-xl px-5 py-3 border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Басты экран
            </button>
            <SmartLink
              to="/"
              className="inline-flex items-center justify-center rounded-xl px-5 py-3 border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Басты бетке
            </SmartLink>
          </div>

          {/* Статистика */}
          <div className="mt-6 grid sm:grid-cols-3 gap-3 text-sm">
            <div className="rounded-xl border p-4">
              <p className="text-slate-500">Соңғы ұпай</p>
              <p className="mt-1 font-semibold">
                {score} / {questions.length}
              </p>
            </div>
            <div className="rounded-xl border p-4">
              <p className="text-slate-500">Ең үздік нәтиже</p>
              <p className="mt-1 font-semibold">
                {stats.best ?? score} / {questions.length}
              </p>
            </div>
            <div className="rounded-xl border p-4">
              <p className="text-slate-500">Талпыныс саны</p>
              <p className="mt-1 font-semibold">{stats.attempts ?? 1}</p>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );

  const renderStart = () => (
    <>
      <motion.h2
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl md:text-3xl font-extrabold text-slate-900"
      >
        Qalam Start (1–4 сынып)
      </motion.h2>
      <p className="mt-1 text-slate-600">Сурет бойынша сөйлем, әңгіме аяқтау, дыбыс, грамматика.</p>

      {/* 1-БАҒЫТ: Сурет бойынша сөйлем (MCQ) */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white/80 p-5 shadow">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900">1-БАҒЫТ: Сурет бойынша сөйлем (MCQ)</h3>
          {!s1Done ? (
            <span className="text-sm text-slate-500">Қыс мезгілі контексті</span>
          ) : (
            <span className="text-sm font-semibold text-emerald-600">
              Ұпай: {s1Score} / {QALAM_START_MCQ.length}
            </span>
          )}
        </div>

        {!s1Done && (
          <>
            <div className="mt-4">
              <p className="font-medium text-slate-900">
                {s1Idx + 1}. {QALAM_START_MCQ[s1Idx].q}
              </p>
              <div className="mt-3 grid gap-2">
                {QALAM_START_MCQ[s1Idx].options.map((opt, i) => {
                  const checked = s1Ans[s1Idx] === i;
                  return (
                    <button
                      key={i}
                      onClick={() => setS1Ans((p) => ({ ...p, [s1Idx]: i }))}
                      className={`text-left rounded-xl border px-4 py-3 transition ${
                        checked ? "border-sky-600 bg-sky-50" : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 flex justify-between">
                <button
                  onClick={() => setS1Idx((i) => Math.max(0, i - 1))}
                  disabled={s1Idx === 0}
                  className="rounded-xl border px-4 py-2 text-sm font-semibold disabled:opacity-40"
                >
                  ⟵ Артқа
                </button>
                {s1Idx < QALAM_START_MCQ.length - 1 ? (
                  <button
                    onClick={() => setS1Idx((i) => Math.min(QALAM_START_MCQ.length - 1, i + 1))}
                    disabled={s1Ans[s1Idx] == null}
                    className="rounded-xl bg-slate-900 text-white px-4 py-2 text-sm font-semibold disabled:opacity-40"
                  >
                    Келесі ⟶
                  </button>
                ) : (
                  <button
                    onClick={() => setS1Done(true)}
                    disabled={Object.keys(s1Ans).length !== QALAM_START_MCQ.length}
                    className="rounded-xl bg-emerald-600 text-white px-4 py-2 text-sm font-semibold disabled:opacity-40"
                  >
                    Тапсыру ✓
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        {s1Done && (
          <div className="mt-4">
            <div className="grid gap-3">
              {QALAM_START_MCQ.map((q, idx) => {
                const ok = s1Ans[idx] === q.correctIndex;
                return (
                  <div
                    key={idx}
                    className={`rounded-xl border p-3 ${
                      ok ? "border-emerald-200 bg-emerald-50/60" : "border-rose-200 bg-rose-50/60"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-sm text-slate-500">{idx + 1}.</span>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{q.q}</p>
                        <p className="mt-1 text-sm">
                          Таңдалған:{" "}
                          <b className={ok ? "text-emerald-700" : "text-rose-700"}>
                            {q.options[s1Ans[idx]] ?? "—"}
                          </b>{" "}
                          | Дұрыс: <b className="text-emerald-700">{q.options[q.correctIndex]}</b>
                        </p>
                      </div>
                      <span
                        className={`ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                          ok ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {ok ? "Дұрыс" : "Бұрыс"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  setS1Idx(0);
                  setS1Ans({});
                  setS1Done(false);
                }}
                className="rounded-xl border px-4 py-2 text-sm font-semibold"
              >
                Қайта өту
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2: Өз сөзіңмен 2–3 сөйлем құра */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white/80 p-5 shadow">
        <h3 className="text-xl font-bold text-slate-900">2-БАҒЫТ: Өз сөзіңмен 2–3 сөйлем құра</h3>
        <p className="mt-1 text-slate-600">
          Қысқы сурет туралы 2–3 сөйлем жазыңыз. Себеп–салдар байланысын қосуға тырысыңыз.
        </p>
        <textarea
          className="mt-3 w-full rounded-xl border border-slate-300 p-3"
          rows={4}
          placeholder="Мысалы: Балалар аулада ойнап жүр. Өйткені қар жауды, сондықтан олар шанамен сырғанады."
          value={write23}
          onChange={(e) => setWrite23(e.target.value)}
        />
        <div className="mt-3 flex gap-2">
          <button onClick={runWrite23Check} className="rounded-xl bg-slate-900 text-white px-4 py-2 text-sm font-semibold">
            Тексеру
          </button>
          {write23Feedback.length > 0 && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-2 text-sm">
              {write23Feedback.map((t, i) => (
                <div key={i}>• {t}</div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3: Әңгіме аяқтау (Абай) */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white/80 p-5 shadow">
        <h3 className="text-xl font-bold text-slate-900">📖 2-БАҒЫТ: Әңгімені аяқта! (Абай)</h3>
        <p className="mt-1 text-slate-600">
          Тақырып: Абайдың «Ғылым таппай мақтанба» өлеңі. Мәтінді өз ойыңмен жалғастыр: адам қандай қасиеттер арқылы жетістікке жете алады?
        </p>
        <textarea
          className="mt-3 w-full rounded-xl border border-slate-300 p-3"
          rows={6}
          placeholder="Басы–Орта–Соңы құрылымын сақтап жазыңыз. Мысалы, талап, еңбек, қанағат..."
          value={abayText}
          onChange={(e) => setAbayText(e.target.value)}
        />
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <button onClick={runAbayCheck} className="rounded-xl bg-slate-900 text-white px-4 py-2 text-sm font-semibold">
            Талдау (ЖИ стилі)
          </button>
          {abayFb.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm">
              {abayFb.map((t, i) => (
                <div key={i}>• {t}</div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4: Дыбыспен айту */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white/80 p-5 shadow">
        <h3 className="text-xl font-bold text-slate-900">🔊 3-БАҒЫТ: Дыбыспен айту — “С”</h3>
        <p className="mt-1 text-slate-600">Тезайтқыш: <b>Саматтың сөмкесіне сатушы сәбіз салды.</b></p>
        <p className="mt-2 text-slate-700">Сурет арқылы дыбысты табыңыз: қайсында “С” дыбысы бар сөз?</p>
        <div className="mt-3 flex gap-2">
          {["🐍", "🐀", "🥕"].map((em, i) => (
            <button
              key={i}
              onClick={() => setSoundChoice(i)}
              className={`rounded-xl border px-4 py-2 text-2xl ${soundChoice === i ? "border-sky-600 bg-sky-50" : "border-slate-200"}`}
            >
              {em}
            </button>
          ))}
        </div>
        {soundChoice != null && (
          <div
            className={`mt-3 inline-block rounded-xl px-3 py-1 text-sm font-semibold ${
              soundCorrect ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
            }`}
          >
            {soundCorrect ? "Дұрыс! “Сәбіз” сөзінде “С” дыбысы бар." : "Қайта байқап көр! Тұспалда: “Сәбіз”."}
          </div>
        )}
        <div className="mt-3 rounded-xl border border-slate-200 p-3 text-sm text-slate-600">
          Кеңес: дыбысты анық айту үшін тіл ұшын төменірек ұстап, ауаны “ссс” деп сызылтып шығарыңыз.
        </div>
      </div>

      {/* 5: Грамматикалық көмек */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white/80 p-5 shadow">
        <h3 className="text-xl font-bold text-slate-900">✍️ 4-БАҒЫТ: Грамматикалық көмек</h3>
        <p className="mt-1 text-slate-600">Қате сөйлемдерді түзетіп жазыңыз:</p>
        <div className="mt-3 grid gap-3">
          <div>
            <div className="text-sm text-slate-500">Қате: Мен ойнадым далада.</div>
            <input
              className="mt-1 w-full rounded-xl border border-slate-300 p-2"
              placeholder="Дұрыс нұсқаны жазыңыз"
              value={fix1}
              onChange={(e) => setFix1(e.target.value)}
            />
          </div>
          <div>
            <div className="text-sm text-slate-500">Қате: Мысықтар көп ойнады доп.</div>
            <input
              className="mt-1 w-full rounded-xl border border-slate-300 p-2"
              placeholder="Дұрыс нұсқаны жазыңыз"
              value={fix2}
              onChange={(e) => setFix2(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <button onClick={runFixCheck} className="rounded-xl bg-slate-900 text-white px-4 py-2 text-sm font-semibold">
            Тексеру
          </button>
          {fixFb.length > 0 && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-2 text-sm">
              {fixFb.map((t, i) => (
                <div key={i}>• {t}</div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-3 text-sm text-slate-600">
          Қолдануға болатын ЖИ: ChatGPT / GrammarlyGO (балалар режимі), TextHelp Read&Write (дыбыстық кері байланыс).
        </div>
      </div>
    </>
  );

  const renderProgress = () => (
    <>
      <motion.h2
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl md:text-3xl font-extrabold text-slate-900"
      >
        Qalam Progress (5–8 сынып)
      </motion.h2>
      <p className="mt-1 text-slate-600">Мәтін құрастыру, аргумент, байланыс, рефлексия.</p>

      {/* 1: Мәтін құрастыру (Б.Момышұлы) */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white/80 p-5 shadow">
        <h3 className="text-xl font-bold text-slate-900">✍️ 1-БАҒЫТ: Мәтін құрастыру (Б.Момышұлы)</h3>
        <div className="grid gap-3 mt-3">
          <textarea
            className="w-full rounded-xl border border-slate-300 p-3"
            rows={3}
            placeholder="Кіріспе: ерлік ұғымын қысқаша түсіндіріңіз..."
            value={mIntro}
            onChange={(e) => setMIntro(e.target.value)}
          />
          <textarea
            className="w-full rounded-xl border border-slate-300 p-3"
            rows={5}
            placeholder="Негізгі бөлім: 2 дәлел/мысал, дерек/дәйек..."
            value={mBody}
            onChange={(e) => setMBody(e.target.value)}
          />
          <textarea
            className="w-full rounded-xl border border-slate-300 p-3"
            rows={3}
            placeholder="Қорытынды: қысқа түйін, жеке ұстаным..."
            value={mConc}
            onChange={(e) => setMConc(e.target.value)}
          />
        </div>
        <div className="mt-3 flex gap-2 items-center">
          <button onClick={runMCheck} className="rounded-xl bg-slate-900 text-white px-4 py-2 text-sm font-semibold">
            Рубрика (0–4)
          </button>
          {mRubric != null && (
            <span className="rounded-xl bg-emerald-100 text-emerald-700 px-3 py-1 text-sm font-semibold">
              Ұпай: {mRubric} / 4
            </span>
          )}
        </div>
        <div className="mt-3 text-sm text-slate-600">
          Кеңес: “біріншіден/екіншіден”, “мысалы/дәйек”, “демек/түйіндей келе” коннекторларын қолданыңыз.
        </div>
      </div>

      {/* 2: Аргумент жазу */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white/80 p-5 shadow">
        <h3 className="text-xl font-bold text-slate-900">💬 2-БАҒЫТ: Аргумент жазу — Телефон</h3>
        <div className="mt-2 text-sm text-slate-600">
          Тақырып: «Телефон оқу процесіне кедергі келтіреді ме?» — Пікір (иә/жоқ), кемі 2 аргумент, бір қарсы пікірге жауап.
        </div>
        <div className="mt-3 flex flex-wrap gap-3 items-center">
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="opinion"
              checked={argOpinion === "иә"}
              onChange={() => setArgOpinion("иә")}
            />{" "}
            Иә, кедергі келтіреді
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="opinion"
              checked={argOpinion === "жоқ"}
              onChange={() => setArgOpinion("жоқ")}
            />{" "}
            Жоқ, келтірмейді
          </label>
        </div>
        <div className="mt-3 grid gap-3">
          <input
            className="w-full rounded-xl border border-slate-300 p-2"
            placeholder="Дәлел 1 (нақты мысал/дерекпен)"
            value={arg1}
            onChange={(e) => setArg1(e.target.value)}
          />
          <input
            className="w-full rounded-xl border border-slate-300 p-2"
            placeholder="Дәлел 2 (нақты мысал/дерекпен)"
            value={arg2}
            onChange={(e) => setArg2(e.target.value)}
          />
          <textarea
            className="w-full rounded-xl border border-slate-300 p-3"
            rows={3}
            placeholder="Қарсы пікірге жауап (Иә, бірақ... / Дегенмен ...)"
            value={argCounter}
            onChange={(e) => setArgCounter(e.target.value)}
          />
        </div>
        <div className="mt-3 flex gap-2 items-center">
          <button onClick={runArgCheck} className="rounded-xl bg-slate-900 text-white px-4 py-2 text-sm font-semibold">
            Тексеру (0–5)
          </button>
          {argScore != null && (
            <span className="rounded-xl bg-emerald-100 text-emerald-700 px-3 py-1 text-sm font-semibold">
              Ұпай: {argScore} / 5
            </span>
          )}
        </div>
        <div className="mt-3 text-sm text-slate-600">
          Сұрақтаушы ЖИ стилі: “Бұл дәлел нақты ма?”, “Мысал/көрсеткіш қоса аласың ба?”, “Қарсы пікірге ең мықты жауап қайсы?”.
        </div>
      </div>

      {/* 3: Сөйлем байланысын талдау */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white/80 p-5 shadow">
        <h3 className="text-xl font-bold text-slate-900">🔗 3-БАҒЫТ: Сөйлем байланысын талдау</h3>
        <div className="mt-3 grid gap-2">
          {baseText.map((t, idx) => (
            <div key={idx} className="rounded-xl border border-slate-200 p-3">
              <div className="text-sm text-slate-500 mb-1">{idx + 1}.</div>
              <div className="font-medium text-slate-900">{t}</div>
              <div className="mt-2 flex flex-wrap gap-2 text-sm">
                {["уақыт", "себеп", "салдар", "қорытынды"].map((lab) => (
                  <button
                    key={lab}
                    onClick={() =>
                      setLinkKinds((arr) => {
                        const next = arr.slice();
                        next[idx] = lab;
                        return next;
                      })
                    }
                    className={`rounded-lg border px-3 py-1 ${
                      linkKinds[idx] === lab ? "bg-sky-600 text-white border-sky-600" : "border-slate-300"
                    }`}
                  >
                    {lab}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-2 items-center">
          <button onClick={runLinkCheck} className="rounded-xl bg-slate-900 text-white px-4 py-2 text-sm font-semibold">
            Тексеру
          </button>
          {linkFb && (
            <span
              className={`rounded-xl px-3 py-1 text-sm font-semibold ${
                /Дұрыс/.test(linkFb) ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
              }`}
            >
              {linkFb}
            </span>
          )}
        </div>
      </div>

      {/* 4: Рефлексия */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white/80 p-5 shadow">
        <h3 className="text-xl font-bold text-slate-900">🪞 4-БАҒЫТ: Рефлексия</h3>
        <div className="mt-3 grid gap-3">
          <input
            className="w-full rounded-xl border border-slate-300 p-2"
            placeholder="Менің мәтінімнің күшті жағы…"
            value={refStrong}
            onChange={(e) => setRefStrong(e.target.value)}
          />
          <input
            className="w-full rounded-xl border border-slate-300 p-2"
            placeholder="Жетілдіруім керек тұс…"
            value={refImprove}
            onChange={(e) => setRefImprove(e.target.value)}
          />
          <input
            className="w-full rounded-xl border border-slate-300 p-2"
            placeholder="Жазудағы эмоциям…"
            value={refMood}
            onChange={(e) => setRefMood(e.target.value)}
          />
        </div>
        <div className="mt-3 flex gap-2 items-center">
          <button
            onClick={() => setRefDone(true)}
            className="rounded-xl bg-slate-900 text-white px-4 py-2 text-sm font-semibold"
          >
            Белгілеу
          </button>
          {refDone && (
            <span className="rounded-xl bg-emerald-100 text-emerald-700 px-3 py-1 text-sm font-semibold">
              Рефлексия сақталды (жергілікті күйде)
            </span>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10">
      {/* Header */}
      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl md:text-4xl font-extrabold text-slate-900 text-center"
      >
        IntellectUp & Qalam Suite
      </motion.h1>
      <p className="mt-2 text-center text-slate-600">
        IQ мини-челендж + бастауыш/орта буын жазылым және ойлау дағдылары.
      </p>

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <Pill active={tab === "iq"} onClick={() => setTab("iq")}>IQ Challenge</Pill>
        <Pill active={tab === "start"} onClick={() => setTab("start")}>Qalam Start (1–4)</Pill>
        <Pill active={tab === "progress"} onClick={() => setTab("progress")}>Qalam Progress (5–8)</Pill>
      </div>

      {/* Content */}
      <div className="mt-8">
        {tab === "iq" && renderIQ()}
        {tab === "start" && renderStart()}
        {tab === "progress" && renderProgress()}
      </div>

      {/* Footer nav */}
      <div className="mt-8 flex flex-wrap gap-3 justify-center">
        <SmartLink
          to="/realtalktime"
          className="inline-flex items-center justify-center rounded-xl px-5 py-3 bg-[#1aa6b5] text-white font-semibold shadow hover:opacity-95"
        >
          RealTalkTime (EQ)
        </SmartLink>
        <SmartLink
          to="/"
          className="inline-flex items-center justify-center rounded-xl px-5 py-3 border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50"
        >
          Басты бетке
        </SmartLink>
      </div>
    </div>
  );
}
