import React from "react";
import { motion } from "framer-motion";

/* ========================== PERSIST ========================== */
const LS_KEY = "lifecharge_state_v1";

const todayStr = () => new Date().toISOString().slice(0, 10);

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
  bedtime: "22:30",
  wakeTime: "06:30",
  eveningDnd: true, // «Ұйқыдан бұрын телефон ұстамаймын» режимін жоспарлау

  // Checklist (күндегісі)
  checklist: {
    morningNoPhone: false, // таңғы 30 мин телефон ұстамау
    eveningNoPhone: false, // ұйқыға 30 мин қалғанда телефон ұстамау
    walk: false,           // 15 мин жаяу жүру
    stretch: false,        // 5 мин созылу
  },
};

function loadState() {
  try {
    const raw = JSON.parse(localStorage.getItem(LS_KEY) || "null");
    if (!raw) return defaultState;
    // Күн ауысса — күндік метрикаларды нөлдеу
    if (raw.date !== todayStr()) {
      return {
        ...raw,
        date: todayStr(),
        timerMode: "focus",
        timerRunning: false,
        timerLeftSec: (raw.focusMinutes || 25) * 60,
        sessionsDoneToday: 0,
        waterCups: 0,
        checklist: { morningNoPhone: false, eveningNoPhone: false, walk: false, stretch: false },
      };
    }
    return { ...defaultState, ...raw };
  } catch {
    return defaultState;
  }
}

function saveState(next) {
  localStorage.setItem(LS_KEY, JSON.stringify(next));
}

/* ========================== HELPERS ========================== */
const fmt = (sec) => {
  const m = Math.floor(sec / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(sec % 60)
    .toString()
    .padStart(2, "0");
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
  // егер бүгін өткен болса — ертеңге есептейміз
  if (diff < 0) diff += 24 * 60;
  return diff;
};

/* ========================== PAGE ========================== */
export default function LifeCharge() {
  const [st, setSt] = React.useState(loadState);

  // persist on change
  React.useEffect(() => saveState(st), [st]);

  // timer interval
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

  // helpers to update
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
      timerLeftSec:
        (p.timerMode === "focus" ? p.focusMinutes : p.breakMinutes) * 60,
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

  /* ===== UI ===== */
  const untilBed = minutesUntil(st.bedtime);
  const untilWake = minutesUntil(st.wakeTime);

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl md:text-4xl font-extrabold text-slate-900"
      >
        LifeCharge — <span className="text-emerald-600">Digital Detox (PQ)</span>
      </motion.h1>
      <p className="mt-2 text-slate-600">
        Фокус-таймер, су трекері, ұйқы/DND жоспарлау және күндік Detox-чеклист.
        Барлығы құрылғыңызда локалды түрде сақталады.
      </p>

      {/* GRID */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Focus TIMER */}
        <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-slate-900">Focus Timer</h2>
          <div className="mt-2 text-sm text-slate-600">
            {st.timerMode === "focus"
              ? "Терең жұмыс уақыты"
              : "Үзіліс уақыты"}
          </div>

          <div className="mt-4 flex items-center gap-4">
            <button
              onClick={() => switchMode("focus")}
              className={`px-3 py-2 rounded-xl text-sm font-semibold border ${
                st.timerMode === "focus"
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "border-slate-300"
              }`}
            >
              Focus
            </button>
            <button
              onClick={() => switchMode("break")}
              className={`px-3 py-2 rounded-xl text-sm font-semibold border ${
                st.timerMode === "break"
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "border-slate-300"
              }`}
            >
              Break
            </button>
            <div className="ml-auto text-sm text-slate-600">
              Бүгінгі сессия: <b>{st.sessionsDoneToday}</b>
            </div>
          </div>

          <div className="mt-6 text-center">
            <div className="text-5xl font-bold tracking-tight">{fmt(st.timerLeftSec)}</div>
            <div className="mt-4 flex justify-center gap-3">
              <button
                onClick={startPause}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold"
              >
                {st.timerRunning ? "Пауза" : "Бастау"}
              </button>
              <button
                onClick={resetTimer}
                className="px-4 py-2 rounded-xl border border-slate-300 font-semibold"
              >
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
          <p className="mt-1 text-sm text-slate-600">
            Күніңіздегі таза су мөлшері — мақсатқа жақындаңыз.
          </p>

          <div className="mt-4 flex items-center gap-4">
            <button
              onClick={() => setField({ waterCups: Math.max(0, st.waterCups - 1) })}
              className="px-3 py-2 rounded-xl border border-slate-300 font-semibold"
            >
              − 1 стақан
            </button>
            <div className="text-4xl font-bold tabular-nums">{st.waterCups}</div>
            <button
              onClick={() => setField({ waterCups: Math.min(99, st.waterCups + 1) })}
              className="px-3 py-2 rounded-xl bg-sky-600 text-white font-semibold"
            >
              + 1 стақан
            </button>

            <div className="ml-auto text-sm text-slate-600">
              Мақсат: <b>{st.waterTarget}</b>
            </div>
          </div>

          <div className="mt-4">
            <input
              type="range"
              min={4}
              max={16}
              value={st.waterTarget}
              onChange={(e) => setField({ waterTarget: Number(e.target.value) })}
              className="w-full"
            />
          </div>

          <div className="mt-2 text-sm text-slate-600">
            Прогресс: {Math.min(100, Math.round((st.waterCups / Math.max(1, st.waterTarget)) * 100))}%
          </div>
        </div>

        {/* SLEEP / DND */}
        <div className="rounded-2xl border border-indigo-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-slate-900">Ұйқы және DND жоспары</h2>
          <p className="mt-1 text-sm text-slate-600">
            Ұйқыға дейін және ұйқыдан кейін телефонсыз уақыт белгілеңіз.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-600">Ұйқы уақыты</label>
              <input
                type="time"
                value={st.bedtime}
                onChange={(e) => setField({ bedtime: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
              />
              <div className="mt-1 text-xs text-slate-500">
                Ұйқыға дейін: <b>{Math.floor(untilBed / 60)} сағ {untilBed % 60} мин</b>
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-600">Ояну уақыты</label>
              <input
                type="time"
                value={st.wakeTime}
                onChange={(e) => setField({ wakeTime: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
              />
              <div className="mt-1 text-xs text-slate-500">
                Оянуға: <b>{Math.floor(untilWake / 60)} сағ {untilWake % 60} мин</b>
              </div>
            </div>
          </div>

          <label className="mt-4 inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={st.eveningDnd}
              onChange={() => setField({ eveningDnd: !st.eveningDnd })}
            />
            <span className="text-sm text-slate-700">
              Ұйқыға 30 мин қалғанда «телефон ұстамаймын» (жоспар)
            </span>
          </label>

          <div className="mt-3 text-xs text-slate-500">
            Ескерту: Бұл тек жоспар/ескерту құралы. Құрылғы параметрлерін өзгертпейді.
          </div>
        </div>

        {/* CHECKLIST */}
        <div className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-slate-900">Күндік Detox-чеклист</h2>
          <p className="mt-1 text-sm text-slate-600">
            Қарапайым да тұрақты әдеттер.
          </p>

          <div className="mt-4 space-y-3">
            {[
              ["morningNoPhone", "Таңғы 30 мин — телефон жоқ"],
              ["eveningNoPhone", "Ұйқыға 30 мин қалғанда — телефон жоқ"],
              ["walk", "15 мин жаяу жүру"],
              ["stretch", "5 мин созылу"],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={!!st.checklist[key]}
                  onChange={() => toggleChecklist(key)}
                />
                <span className="text-slate-800">{label}</span>
              </label>
            ))}
          </div>

          <div className="mt-4 text-sm text-slate-600">
            Орындағандар:{" "}
            <b>
              {Object.values(st.checklist).filter(Boolean).length} /{" "}
              {Object.keys(st.checklist).length}
            </b>
          </div>

          <button
            onClick={() =>
              setSt((p) => ({
                ...p,
                checklist: {
                  morningNoPhone: false,
                  eveningNoPhone: false,
                  walk: false,
                  stretch: false,
                },
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
        Күн ауысқанда — сессия, су және чеклист автоматты түрде нөлденеді. Барлық
        дерек тек осы құрылғыда сақталады ({LS_KEY}).
      </div>
    </div>
  );
}
