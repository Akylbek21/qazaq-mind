// src/pages/LifeCharge.jsx
import React from "react";
import { motion } from "framer-motion";

/* ========================== PERSIST ========================== */
const LS_KEY = "lifecharge_state_v2"; // v2 — жаңартылған күй

const todayStr = () => new Date().toISOString().slice(0, 10);

const DEFAULT_ROUTINE = [
  { time: "07:00", icon: "🌞", title: "Ояну және жеңіл жаттығу", goal: "Күнді сергек бастау, денені ояту" },
  { time: "07:30", icon: "🍎", title: "Таңғы ас", goal: "Энергия мен ми белсенділігін арттыру" },
  { time: "08:00–13:00", icon: "🎓", title: "Сабақ уақыты", goal: "Оқу, зейін және ойлау қабілетін дамыту" },
  { time: "13:00", icon: "🍲", title: "Түскі ас", goal: "Күш пен көңіл-күйді қалпына келтіру" },
  { time: "14:00–16:00", icon: "📚", title: "Үй тапсырмасы / кітап оқу", goal: "Жауапкершілік пен IQ дамыту" },
  { time: "16:00–17:00", icon: "🏃", title: "Серуен / спорт / қозғалыс", goal: "Дене белсенділігі мен PQ дамыту" },
  { time: "17:30", icon: "🍏", title: "Тіскебасар / су ішу", goal: "Энергия мен су балансын сақтау" },
  { time: "18:30", icon: "🍽️", title: "Кешкі ас", goal: "Асқорыту жүйесін реттеу" },
  { time: "19:00–20:00", icon: "💬", title: "Отбасылық уақыт / диалог", goal: "EQ және сөйлеу дағдысын дамыту" },
  { time: "20:00–20:30", icon: "⏸️", title: "Экран уақыты (лимитті)", goal: "Саналы цифрлық мәдениет қалыптастыру" },
  { time: "20:30–21:00", icon: "🧘", title: "Рефлексия және тынығу", goal: "SQ – ішкі тыныштық, ой жинақтау" },
  { time: "21:30", icon: "😴", title: "Ұйқы", goal: "Дене мен миды қалпына келтіру" },
];

const HARM_CATEGORIES = [
  {
    title: "🍟 Фастфуд өнімдері",
    rows: [
      { item: "Бургер, хот-дог, донер, пицца", harm: "Май мен тұз көп, асқорыту жүйесін бұзады" },
      { item: "Картоп фри, наггетс", harm: "Қуырылған май — бауырға салмақ түсіреді" },
      { item: "Лаваш, майонез қосылған сэндвичтер", harm: "Артық калория, семіздік қаупі" },
    ],
    quote: "Фастфуд – жылдам, бірақ денсаулығыңа баяу зиян тигізеді.",
  },
  {
    title: "🍭 Тәттілер мен өңделген қант өнімдері",
    rows: [
      { item: "Кәмпит, шоколад батончиктері", harm: "Қант өте жоғары, тіс жегісін тудырады" },
      { item: "Газдалған сусындар", harm: "Қант пен фосфор — сүйек пен бауырға зиян" },
      { item: "Десерттер, торттар, кекстер", harm: "Қысқа энергия, тез шаршатады" },
    ],
    quote: "Тәтті – миға қуаныш, бірақ денеге шаршау әкеледі.",
  },
  {
    title: "🍫 Дайын өнімдер мен чипстер",
    rows: [
      { item: "Чипсы, сухарики", harm: "Тұзы мен майы көп, жүйкені тітіркендіреді" },
      { item: "Инстант лапша", harm: "Консервант пен дәм күшейткіш (E621) көп" },
      { item: "Попкорн (майлы, тұзды)", harm: "Өңделген май — холестерин көтереді" },
    ],
    quote: "Қораптағы дәм – шынайы энергия емес.",
  },
  {
    title: "🍹 Тәтті сусындар мен энергетиктер",
    rows: [
      { item: "Энергетикалық сусындар", harm: "Жүрекке, жүйке жүйесіне қауіпті" },
      { item: "Тәтті шайлар, дайын шырындар", harm: "Қант көп, шөлді баспайды" },
      { item: "Қапталған сүт коктейльдері", harm: "Қант пен бояғыш көп" },
    ],
    quote: "Энергия бөтелкеден емес — ұйқы мен пайдалы астан келеді.",
  },
  {
    title: "🧂 Өңделген ет пен тұзды тағамдар",
    rows: [
      { item: "Шұжық, сосиска, колбаса", harm: "Нитраттар мен консерванттар бар" },
      { item: "Тұздалған балық, ет өнімдері", harm: "Қан қысымын көтереді" },
      { item: "Тұзды ірімшік, тұздықтар", harm: "Су балансын бұзады" },
    ],
    quote: "Тұз – аз болса дәрі, көп болса у.",
  },
  {
    title: "🧁 Қамырлы, ақ ұннан жасалған тағамдар",
    rows: [
      { item: "Ақ нан, бәліш, самса", harm: "Талшық аз, тез ашықтырады" },
      { item: "Дүкендегі пісірілген өнімдер", harm: "Қант пен май көп" },
      { item: "Круассан, пончик", harm: "Қуат аз, калория көп" },
    ],
    quote: "Ақ ұн – энергия емес, жалған тоқтық сезімі.",
  },
];

// Ойын үшін — пайдалы / зиянды тізім
const FOOD_GAME_POOL = {
  healthy: [
    { name: "🍎 Алма", tip: "Табиғи талшық пен витамин." },
    { name: "🥕 Сәбіз", tip: "Көзге пайдалы бета-каротин." },
    { name: "🥦 Брокколи", tip: "Минерал мен талшық." },
    { name: "🍚 Қарақұмық", tip: "Баяу көмірсу, ұзақ энергия." },
    { name: "🐟 Балық", tip: "Омега-3, ми жұмысына жақсы." },
    { name: "🥛 Қымыз/айран", tip: "Асқорытуға пайдалы." },
    { name: "🍊 Апельсин", tip: "C дәрумені көп." },
  ],
  junk: [
    { name: "🍟 Фри", tip: "Қуырылған май көп." },
    { name: "🥤 Газдалған сусын", tip: "Қант жоғары, шөліңді баспайды." },
    { name: "🍰 Торт", tip: "Қант + май = артық калория." },
    { name: "🍫 Батончик", tip: "Жылдам қант, кейін шаршау." },
    { name: "🍕 Пицца (майлы)", tip: "Қаныққан май мен тұз." },
    { name: "🍜 Доширак", tip: "E621 және консерванттар." },
  ],
};

const SPEAK_UP = [
  "Бүгін мен неге ризамын?",
  "Менің күнімнің ең жақсы сәті не болды?",
  "Ертең мен нені жақсартамын?",
];

const defaultState = {
  date: todayStr(),

  // Focus timer
  focusMinutes: 25,
  breakMinutes: 5,
  timerMode: "focus", // 'focus' | 'break'
  timerRunning: false,
  timerLeftSec: 25 * 60,
  sessionsDoneToday: 0,
  sessionsDoneTotal: 0,

  // Water tracker
  waterTarget: 8,
  waterCups: 0,

  // Sleep / DND
  bedtime: "21:30",
  wakeTime: "07:00",
  eveningDnd: true,

  // Checklist
  checklist: {
    morningNoPhone: false,
    eveningNoPhone: false,
    walk: false,
    stretch: false,
  },

  // NEW: Жаттығу бейнелері
  exercises: [], // {id, title, kind: 'youtube'|'file', url}

  // NEW: Smart routine
  routine: DEFAULT_ROUTINE,
  routineDone: {}, // {index: boolean}

  // NEW: Food game
  gameBest: 0,
};

function loadState() {
  try {
    const raw = JSON.parse(localStorage.getItem(LS_KEY) || "null");
    if (!raw) return defaultState;
    // Күн ауысса — күндік метрикаларды нөлдеу
    if (raw.date !== todayStr()) {
      return {
        ...defaultState,
        ...raw,
        date: todayStr(),
        timerMode: "focus",
        timerRunning: false,
        timerLeftSec: (raw.focusMinutes || 25) * 60,
        sessionsDoneToday: 0,
        waterCups: 0,
        checklist: { morningNoPhone: false, eveningNoPhone: false, walk: false, stretch: false },
        routineDone: {},
      };
    }
    // v1→v2 миграция ( болмауы мүмкін, бірақ қорғалайық )
    return { ...defaultState, ...raw, routine: raw.routine || DEFAULT_ROUTINE };
  } catch {
    return defaultState;
  }
}

function saveState(next) {
  localStorage.setItem(LS_KEY, JSON.stringify(next));
}

/* ========================== HELPERS ========================== */
const fmt = (sec) => {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

const parseTime = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
};

const minutesUntil = (hhmm) => {
  const target = parseTime(hhmm).getTime();
  const now = Date.now();
  let diff = Math.floor((target - now) / 60000);
  if (diff < 0) diff += 24 * 60;
  return diff;
};

// YouTube URL → embed src
function toYouTubeEmbed(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
    }
    if (u.hostname === "youtu.be") {
      const id = u.pathname.slice(1);
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
  } catch {}
  return null;
}

/* ========================== PAGE ========================== */
export default function LifeCharge() {
  const [st, setSt] = React.useState(loadState);
  React.useEffect(() => saveState(st), [st]);

  /* -------- Timer -------- */
  React.useEffect(() => {
    if (!st.timerRunning) return;
    const id = setInterval(() => {
      setSt((prev) => {
        const left = prev.timerLeftSec - 1;
        if (left > 0) return { ...prev, timerLeftSec: left };
        // complete
        if (prev.timerMode === "focus") {
          const nextBreak = Math.max(1, prev.breakMinutes) * 60;
          return {
            ...prev,
            timerMode: "break",
            timerRunning: false,
            timerLeftSec: nextBreak,
            sessionsDoneToday: prev.sessionsDoneToday + 1,
            sessionsDoneTotal: prev.sessionsDoneTotal + 1,
          };
        } else {
          const nextFocus = Math.max(1, prev.focusMinutes) * 60;
          return {
            ...prev,
            timerMode: "focus",
            timerRunning: false,
            timerLeftSec: nextFocus,
          };
        }
      });
    }, 1000);
    return () => clearInterval(id);
  }, [st.timerRunning]);

  /* -------- Short setters -------- */
  const setField = (patch) => setSt((p) => ({ ...p, ...patch }));
  const setFocusMinutes = (min) =>
    setSt((p) => ({
      ...p,
      focusMinutes: min,
      ...(p.timerMode === "focus" && !p.timerRunning ? { timerLeftSec: min * 60 } : {}),
    }));
  const setBreakMinutes = (min) =>
    setSt((p) => ({
      ...p,
      breakMinutes: min,
      ...(p.timerMode === "break" && !p.timerRunning ? { timerLeftSec: min * 60 } : {}),
    }));
  const startPause = () => setSt((p) => ({ ...p, timerRunning: !p.timerRunning }));
  const resetTimer = () =>
    setSt((p) => ({
      ...p,
      timerRunning: false,
      timerLeftSec: (p.timerMode === "focus" ? p.focusMinutes : p.breakMinutes) * 60,
    }));
  const switchMode = (mode) =>
    setSt((p) => ({
      ...p,
      timerMode: mode,
      timerRunning: false,
      timerLeftSec: (mode === "focus" ? p.focusMinutes : p.breakMinutes) * 60,
    }));
  const toggleChecklist = (key) =>
    setSt((p) => ({ ...p, checklist: { ...p.checklist, [key]: !p.checklist[key] } }));

  const untilBed = minutesUntil(st.bedtime);
  const untilWake = minutesUntil(st.wakeTime);

  /* ================== NEW: «Бірге жаттығамыз» ================== */
  const [ytInput, setYtInput] = React.useState("");
  const [fileErr, setFileErr] = React.useState("");

  const addYouTube = () => {
    const embed = toYouTubeEmbed(ytInput.trim());
    if (!embed) return alert("YouTube сілтемесін дұрыс енгізіңіз.");
    const rec = {
      id: Date.now() + "-yt",
      title: "Таңғы жаттығу (YouTube)",
      kind: "youtube",
      url: embed,
    };
    setSt((p) => ({ ...p, exercises: [rec, ...p.exercises] }));
    setYtInput("");
  };

  const onPickFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("video/")) {
      setFileErr("Видео форматы қажет (mp4/webm т.б.).");
      return;
    }
    setFileErr("");
    const blobUrl = URL.createObjectURL(f);
    const rec = {
      id: Date.now() + "-file",
      title: f.name,
      kind: "file",
      url: blobUrl,
    };
    setSt((p) => ({ ...p, exercises: [rec, ...p.exercises] }));
    e.target.value = "";
  };

  const removeExercise = (id) => {
    setSt((p) => ({ ...p, exercises: p.exercises.filter((x) => x.id !== id) }));
  };

  /* ================== NEW: SMART ROUTINE ================== */
  const toggleRoutineDone = (idx) =>
    setSt((p) => ({ ...p, routineDone: { ...p.routineDone, [idx]: !p.routineDone[idx] } }));

  /* ================== NEW: “Тағамды тап!” ойыны ================== */
  const [gameScore, setGameScore] = React.useState(0);
  const [gameRound, setGameRound] = React.useState(1);
  const [gameOpts, setGameOpts] = React.useState([]);
  const [gameMsg, setGameMsg] = React.useState("");

  const nextGame = React.useCallback(() => {
    const H = FOOD_GAME_POOL.healthy[Math.floor(Math.random() * FOOD_GAME_POOL.healthy.length)];
    const J = FOOD_GAME_POOL.junk[Math.floor(Math.random() * FOOD_GAME_POOL.junk.length)];
    const mixed = Math.random() < 0.5 ? [H, J] : [J, H];
    setGameOpts(mixed);
    setGameMsg("");
  }, []);

  React.useEffect(() => {
    nextGame();
  }, [nextGame]);

  const pickFood = (idx) => {
    const chosen = gameOpts[idx];
    const isHealthy = FOOD_GAME_POOL.healthy.some((x) => x.name === chosen.name);
    if (isHealthy) {
      const newScore = gameScore + 1;
      setGameScore(newScore);
      setGameMsg(`Тамаша! ${chosen.name} — дұрыс таңдау. ${chosen.tip || ""}`);
      setSt((p) => ({ ...p, gameBest: Math.max(p.gameBest || 0, newScore) }));
    } else {
      setGameMsg(`${chosen.name} — жиі таңдамауға тырыс. ${chosen.tip || ""}`);
    }
    setGameRound((r) => r + 1);
    setTimeout(() => nextGame(), 750);
  };

  const resetGame = () => {
    setGameScore(0);
    setGameRound(1);
    setGameMsg("");
    nextGame();
  };

  /* ============================= UI ============================= */
  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-4xl font-extrabold text-slate-900">
        LifeCharge — <span className="text-emerald-600">Smart Routine & Digital Detox</span>
      </motion.h1>
      <p className="mt-2 text-slate-600">
        Таңғы жаттығулар, SMART ROUTINE кестесі, пайдалы тамақ таңдауы, және цифрлық әдеттер. Барлық дерек құрылғыда (localStorage).
      </p>

      {/* ================= «Бірге жаттығамыз» ================= */}
      <div className="mt-8 rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
        <h2 className="font-bold text-slate-900 text-xl">1) «Бірге жаттығамыз» — таңғы жаттығулар</h2>
        <p className="mt-1 text-sm text-slate-600">YouTube сілтеме қосыңыз немесе бейнефайлды жүктеп, бірлесіп таңертең жаттығамыз.</p>

        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
          <input
            value={ytInput}
            onChange={(e) => setYtInput(e.target.value)}
            placeholder="YouTube сілтемесін енгізіңіз (https://youtu.be/... немесе youtube.com/watch?v=...)"
            className="rounded-xl border border-slate-300 px-3 py-2"
          />
          <button onClick={addYouTube} className="rounded-xl bg-emerald-600 text-white px-4 py-2 font-semibold">
            + YouTube қосу
          </button>
        </div>

        <div className="mt-3">
          <label className="inline-block">
            <span className="rounded-xl border border-slate-300 px-4 py-2 inline-flex items-center gap-2 cursor-pointer">
              ⬆️ Видео файл жүктеу
              <input type="file" accept="video/*" className="hidden" onChange={onPickFile} />
            </span>
          </label>
          {fileErr && <div className="mt-2 text-sm text-rose-600">{fileErr}</div>}
        </div>

        {st.exercises.length === 0 ? (
          <div className="mt-4 text-sm text-slate-500">Плейлист бос. Жоғарыдан видео қосыңыз.</div>
        ) : (
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {st.exercises.map((v) => (
              <div key={v.id} className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-slate-900 truncate">{v.title}</div>
                  <button onClick={() => removeExercise(v.id)} className="text-sm text-rose-600 hover:underline">
                    Өшіру
                  </button>
                </div>
                <div className="mt-3 aspect-video rounded-lg overflow-hidden bg-black/5 flex items-center justify-center">
                  {v.kind === "youtube" ? (
                    <iframe
                      title={v.title}
                      src={v.url}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video src={v.url} controls className="w-full h-full" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================= SMART ROUTINE ================= */}
      <div className="mt-8 rounded-2xl border border-sky-200 bg-white p-5 shadow-sm">
        <h2 className="font-bold text-slate-900 text-xl">2) SMART ROUTINE — Оқушының теңгерімді күн тәртібі</h2>
        <p className="mt-1 text-sm text-slate-600">IQ–EQ–PQ–SQ тепе-теңдігіне сүйенген күн кестесі. Орындағанын белгілеңіз.</p>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="text-slate-500">
                <th className="py-2 pr-4">Уақыт</th>
                <th className="py-2 pr-4">Белсенділік</th>
                <th className="py-2 pr-4">Мақсаты</th>
                <th className="py-2 pr-4">✓</th>
              </tr>
            </thead>
            <tbody>
              {st.routine.map((r, idx) => (
                <tr key={idx} className="border-t">
                  <td className="py-2 pr-4 whitespace-nowrap font-medium">{r.time}</td>
                  <td className="py-2 pr-4">
                    <span className="mr-2">{r.icon}</span>
                    <span className="font-semibold text-slate-900">{r.title}</span>
                  </td>
                  <td className="py-2 pr-4 text-slate-700">{r.goal}</td>
                  <td className="py-2 pr-4">
                    <input type="checkbox" checked={!!st.routineDone[idx]} onChange={() => toggleRoutineDone(idx)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 p-3">
            <div className="text-sm font-semibold text-slate-900">SpeakUp — күн сайынғы диалог</div>
            <ul className="mt-2 list-disc pl-5 text-sm text-slate-700 space-y-1">
              {SPEAK_UP.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-slate-200 p-3">
            <div className="text-sm font-semibold text-slate-900">Тепе-теңдік формуласы</div>
            <div className="mt-2 text-sm text-slate-700 space-y-1">
              <div>🧠 IQ – оқу мен ойлау</div>
              <div>❤️ EQ – эмоция мен қарым-қатынас</div>
              <div>💪 PQ – қозғалыс пен денсаулық</div>
              <div>🕊️ SQ – тыныштық пен ойлану</div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= “Тағамды тап!” ойыны ================= */}
      <div className="mt-8 rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
        <h2 className="font-bold text-slate-900 text-xl">3) 🎮 “Тағамды тап!” — пайдалысын таңда</h2>
        <div className="mt-1 text-sm text-slate-600">Екі тағамның ішінен пайдалысын таңдаңыз. Ұпай жинаңыз!</div>

        <div className="mt-4 flex items-center gap-3 text-sm">
          <div>Раунд: <b>{gameRound}</b></div>
          <div>Ұпай: <b>{gameScore}</b></div>
          <div className="ml-auto">Ең үздік нәтиже: <b>{st.gameBest || 0}</b></div>
          <button onClick={resetGame} className="ml-2 rounded-xl border border-slate-300 px-3 py-1 font-semibold">Қайта бастау</button>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {gameOpts.map((f, i) => (
            <button
              key={i}
              onClick={() => pickFood(i)}
              className="rounded-2xl border border-slate-200 p-5 text-center hover:bg-emerald-50 transition"
            >
              <div className="text-3xl">{f.name.split(" ")[0]}</div>
              <div className="mt-2 text-lg font-semibold">{f.name.split(" ").slice(1).join(" ")}</div>
            </button>
          ))}
        </div>

        {gameMsg && (
          <div className="mt-3 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2 text-sm text-emerald-700">
            {gameMsg}
          </div>
        )}
      </div>

      {/* ================= Зиянды тағамдар тізімі ================= */}
      <div className="mt-8 rounded-2xl border border-rose-200 bg-white p-5 shadow-sm">
        <h2 className="font-bold text-slate-900 text-xl">4) Зиянды тағамдар тізімі (оқушыларға)</h2>
        <p className="mt-1 text-sm text-slate-600">Категорияны ашып, мысалдар мен зиянын оқып шығыңыз.</p>

        <div className="mt-4 space-y-3">
          {HARM_CATEGORIES.map((cat, idx) => (
            <details key={idx} className="rounded-xl border border-slate-200 p-3">
              <summary className="cursor-pointer font-semibold text-slate-900">{cat.title}</summary>
              <div className="mt-3 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="text-slate-500">
                      <th className="py-2 pr-4">Тағам түрі</th>
                      <th className="py-2 pr-4">Зияны</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cat.rows.map((r, i) => (
                      <tr key={i} className="border-t">
                        <td className="py-2 pr-4">{r.item}</td>
                        <td className="py-2 pr-4 text-slate-700">{r.harm}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-2 text-sm text-slate-600">💬 {cat.quote}</div>
            </details>
          ))}
        </div>
      </div>

      {/* ================= Focus TIMER ================= */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-slate-900">Focus Timer</h2>
          <div className="mt-2 text-sm text-slate-600">{st.timerMode === "focus" ? "Терең жұмыс уақыты" : "Үзіліс уақыты"}</div>

          <div className="mt-4 flex items-center gap-4">
            <button
              onClick={() => switchMode("focus")}
              className={`px-3 py-2 rounded-xl text-sm font-semibold border ${
                st.timerMode === "focus" ? "bg-emerald-600 text-white border-emerald-600" : "border-slate-300"
              }`}
            >
              Focus
            </button>
            <button
              onClick={() => switchMode("break")}
              className={`px-3 py-2 rounded-xl text-sm font-semibold border ${
                st.timerMode === "break" ? "bg-emerald-600 text-white border-emerald-600" : "border-slate-300"
              }`}
            >
              Break
            </button>
            <div className="ml-auto text-sm text-slate-600">Бүгінгі сессия: <b>{st.sessionsDoneToday}</b></div>
          </div>

          <div className="mt-6 text-center">
            <div className="text-5xl font-bold tracking-tight">{fmt(st.timerLeftSec)}</div>
            <div className="mt-4 flex justify-center gap-3">
              <button onClick={startPause} className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold">
                {st.timerRunning ? "Пауза" : "Бастау"}
              </button>
              <button onClick={resetTimer} className="px-4 py-2 rounded-xl border border-slate-300 font-semibold">
                Қалпына келтіру
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-slate-600">Focus уақыты (мин)</label>
              <select
                value={st.focusMinutes}
                onChange={(e) => setFocusMinutes(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
              >
                {[20, 25, 30, 45, 60].map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-600">Break уақыты (мин)</label>
              <select
                value={st.breakMinutes}
                onChange={(e) => setBreakMinutes(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
              >
                {[3, 5, 10, 15].map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* WATER */}
        <div className="rounded-2xl border border-sky-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-slate-900">Су трекері</h2>
          <p className="mt-1 text-sm text-slate-600">Күніңіздегі таза су мөлшері — мақсатқа жақындаңыз.</p>

          <div className="mt-4 flex items-center gap-4">
            <button onClick={() => setField({ waterCups: Math.max(0, st.waterCups - 1) })} className="px-3 py-2 rounded-xl border border-slate-300 font-semibold">
              − 1 стақан
            </button>
            <div className="text-4xl font-bold tabular-nums">{st.waterCups}</div>
            <button onClick={() => setField({ waterCups: Math.min(99, st.waterCups + 1) })} className="px-3 py-2 rounded-xl bg-sky-600 text-white font-semibold">
              + 1 стақан
            </button>
            <div className="ml-auto text-sm text-slate-600">Мақсат: <b>{st.waterTarget}</b></div>
          </div>

          <div className="mt-4">
            <input type="range" min={4} max={16} value={st.waterTarget} onChange={(e) => setField({ waterTarget: Number(e.target.value) })} className="w-full" />
          </div>

          <div className="mt-2 text-sm text-slate-600">
            Прогресс: {Math.min(100, Math.round((st.waterCups / Math.max(1, st.waterTarget)) * 100))}%
          </div>
        </div>

        {/* SLEEP / DND */}
        <div className="rounded-2xl border border-indigo-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-slate-900">Ұйқы және DND жоспары</h2>
          <p className="mt-1 text-sm text-slate-600">Ұйқыға дейін және ұйқыдан кейін телефонсыз уақыт белгілеңіз.</p>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-600">Ұйқы уақыты</label>
              <input type="time" value={st.bedtime} onChange={(e) => setField({ bedtime: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" />
              <div className="mt-1 text-xs text-slate-500">
                Ұйқыға дейін: <b>{Math.floor(untilBed / 60)} сағ {untilBed % 60} мин</b>
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-600">Ояну уақыты</label>
              <input type="time" value={st.wakeTime} onChange={(e) => setField({ wakeTime: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" />
              <div className="mt-1 text-xs text-slate-500">
                Оянуға: <b>{Math.floor(untilWake / 60)} сағ {untilWake % 60} мин</b>
              </div>
            </div>
          </div>

          <label className="mt-4 inline-flex items-center gap-2">
            <input type="checkbox" checked={st.eveningDnd} onChange={() => setField({ eveningDnd: !st.eveningDnd })} />
            <span className="text-sm text-slate-700">Ұйқыға 30 мин қалғанда «телефон ұстамаймын» (жоспар)</span>
          </label>

          <div className="mt-3 text-xs text-slate-500">Ескерту: Бұл тек жоспар/ескерту құралы. Құрылғы параметрлерін өзгертпейді.</div>
        </div>

        {/* CHECKLIST */}
        <div className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-slate-900">Күндік Detox-чеклист</h2>
          <p className="mt-1 text-sm text-slate-600">Қарапайым да тұрақты әдеттер.</p>

          <div className="mt-4 space-y-3">
            {[
              ["morningNoPhone", "Таңғы 30 мин — телефон жоқ"],
              ["eveningNoPhone", "Ұйқыға 30 мин қалғанда — телефон жоқ"],
              ["walk", "15 мин жаяу жүру"],
              ["stretch", "5 мин созылу"],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center gap-3">
                <input type="checkbox" checked={!!st.checklist[key]} onChange={() => toggleChecklist(key)} />
                <span className="text-slate-800">{label}</span>
              </label>
            ))}
          </div>

          <div className="mt-4 text-sm text-slate-600">
            Орындағандар: <b>{Object.values(st.checklist).filter(Boolean).length} / {Object.keys(st.checklist).length}</b>
          </div>

          <button
            onClick={() =>
              setSt((p) => ({
                ...p,
                checklist: { morningNoPhone: false, eveningNoPhone: false, walk: false, stretch: false },
              }))
            }
            className="mt-3 px-4 py-2 rounded-xl border border-slate-300 font-semibold"
          >
            Чеклистті тазалау
          </button>
        </div>
      </div>

      {/* FOOT NOTE */}
      <div className="mt-8 text-xs text-slate-500">
        Күн ауысқанда — сессия, су, чеклист және Routine белгілеулері автоматты түрде нөлденеді. Барлық дерек тек осы құрылғыда ({LS_KEY}) сақталады.
      </div>
    </div>
  );
}
