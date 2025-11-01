// src/pages/LifeCharge.jsx
import React from "react";
import { motion } from "framer-motion";
import { fetchPQTasks, togglePQTask } from "../api/pq";

/* ========================== PERSIST ========================== */
const LS_KEY = "lifecharge_state_v1";

// Локальная дата YYYY-MM-DD (без UTC-сдвига)
const todayStr = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
};

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
  eveningDnd: true,
  // Local fallback checklist (тек сервер құлаған кезде көрсетіледі)
  checklist: { morningNoPhone: false, eveningNoPhone: false, walk: false, stretch: false },
};

function loadState() {
  try {
    const raw = JSON.parse(localStorage.getItem(LS_KEY) || "null");
    if (!raw) return defaultState;
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
const saveState = (next) => localStorage.setItem(LS_KEY, JSON.stringify(next));

/* ========================== HELPERS ========================== */
const fmt = (sec) =>
  `${Math.floor(sec / 60).toString().padStart(2, "0")}:${Math.floor(sec % 60)
    .toString()
    .padStart(2, "0")}`;

const parseTime = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
};
const minutesUntil = (hhmm) => {
  const target = parseTime(hhmm).getTime();
  let diff = Math.floor((target - Date.now()) / 60000);
  if (diff < 0) diff += 24 * 60;
  return diff;
};

/* ========================== PAGE ========================== */
export default function LifeCharge() {
  const [st, setSt] = React.useState(loadState);
  React.useEffect(() => saveState(st), [st]);

  // ===== Timer engine
  React.useEffect(() => {
    if (!st.timerRunning) return;
    const id = setInterval(() => {
      setSt((p) => {
        const left = p.timerLeftSec - 1;
        if (left > 0) return { ...p, timerLeftSec: left };
        if (p.timerMode === "focus") {
          const nextBreak = Math.max(1, p.breakMinutes) * 60;
          return {
            ...p,
            timerMode: "break",
            timerRunning: false,
            timerLeftSec: nextBreak,
            sessionsDoneToday: p.sessionsDoneToday + 1,
            sessionsDoneTotal: p.sessionsDoneTotal + 1,
          };
        } else {
          const nextFocus = Math.max(1, p.focusMinutes) * 60;
          return { ...p, timerMode: "focus", timerRunning: false, timerLeftSec: nextFocus };
        }
      });
    }, 1000);
    return () => clearInterval(id);
  }, [st.timerRunning]);

  // ===== Short setters
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
  const toggleChecklistLocal = (key) =>
    setSt((p) => ({ ...p, checklist: { ...p.checklist, [key]: !p.checklist[key] } }));

  // ===== PQ (server daily tasks)
  const [pqTasks, setPqTasks] = React.useState([]);
  const [pqDoneMap, setPqDoneMap] = React.useState({});
  const [pqLoading, setPqLoading] = React.useState(false);
  const [pqErr, setPqErr] = React.useState("");
  const [pqSource, setPqSource] = React.useState(/** 'server' | 'fallback' */ null);

  const humanize = (e) => {
    const msg = e?.message || "";
    if (msg.includes("401")) return "401 Unauthorized — жүйеге кіріңіз (JWT/куки).";
    if (msg.includes("403")) return "403 Forbidden — қолжетімсіз (рөл/доступ) немесе куки/JWT жіберілмеді.";
    return msg || "Сервер қатесі.";
  };

  const loadPq = async () => {
    setPqLoading(true);
    setPqErr("");
    try {
      const { items, source } = await fetchPQTasks({ fallback: true, withSource: true });
      setPqSource(source);

      if (source === "server") {
        setPqTasks(Array.isArray(items) ? items : []);
        const init = {};
        (items || []).forEach((t) => {
          // поддержим и 'completed', и возможные альтернативы 'done'
          init[t.id] = !!(t.completed ?? t.done ?? false);
        });
        setPqDoneMap(init);
      } else {
        // Для "fallback" показываем именно локальную карточку, а не псевдо-серверный список
        setPqTasks([]);
        setPqDoneMap({});
      }
    } catch (e) {
      setPqErr(humanize(e));
      setPqTasks([]);
      setPqDoneMap({});
      setPqSource(null);
    } finally {
      setPqLoading(false);
    }
  };
  React.useEffect(() => {
    loadPq();
  }, []);

  const togglePq = async (taskId) => {
    // Оптимистично переключаем
    setPqDoneMap((m) => ({ ...m, [taskId]: !m[taskId] }));
    const prev = !!pqDoneMap[taskId];
    try {
      const completed = await togglePQTask(taskId, todayStr(), prev);
      setPqDoneMap((m) => ({ ...m, [taskId]: !!completed }));
    } catch (e) {
      // откат
      setPqDoneMap((m) => ({ ...m, [taskId]: prev }));
      setPqErr(humanize(e));
    }
  };

  // ===== Derived
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
        Фокус-таймер, су трекері, ұйқы/DND және серверлік Detox-чеклист. Дерек құрылғыда сақталады.
      </p>

      {/* GRID */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Focus TIMER */}
        <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-slate-900">Focus Timer</h2>
          <div className="mt-2 text-sm text-slate-600">
            {st.timerMode === "focus" ? "Терең жұмыс уақыты" : "Үзіліс уақыты"}
          </div>

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
                  <option key={m} value={m}>
                    {m}
                  </option>
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
                  <option key={m} value={m}>
                    {m}
                  </option>
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
            Прогресс:{" "}
            {Math.min(100, Math.round((st.waterCups / Math.max(1, st.waterTarget)) * 100))}%
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
                Ұйқыға дейін:{" "}
                <b>
                  {Math.floor(minutesUntil(st.bedtime) / 60)} сағ {minutesUntil(st.bedtime) % 60} мин
                </b>
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
                Оянуға:{" "}
                <b>
                  {Math.floor(minutesUntil(st.wakeTime) / 60)} сағ {minutesUntil(st.wakeTime) % 60} мин
                </b>
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
            Ескерту: Бұл тек жоспар/ескерту құралы. Құралдың жүйелік параметрлерін өзгертпейді.
          </div>
        </div>

        {/* SERVER PQ (with local fallback) */}
        <div className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-slate-900">Күндік Detox-чеклист (сервер)</h2>
            <button
              onClick={loadPq}
              className="ml-auto rounded-xl border border-slate-300 px-3 py-1 text-sm font-semibold"
            >
              Қайта жүктеу
            </button>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Тізім бекэндтен келеді. Белгі қою — бірден серверге жазылады (күн: {todayStr()}).
          </p>
          {pqErr && <div className="mt-3 text-sm text-rose-600">{pqErr}</div>}
          {pqLoading && <div className="mt-3 text-sm text-slate-500">Жүктелуде…</div>}

          {!pqLoading && pqTasks.length > 0 ? (
            <>
              <div className="mt-4 space-y-3">
                {pqTasks.map((t) => (
                  <label key={t.id} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={!!pqDoneMap[t.id]}
                      onChange={() => togglePq(t.id)}
                    />
                    <span className="text-slate-800">
                      <b>{t.title}</b>
                      {t.description ? (
                        <span className="text-slate-500"> — {t.description}</span>
                      ) : null}
                    </span>
                  </label>
                ))}
              </div>
              <div className="mt-4 text-sm text-slate-600">
                Орындағандар:{" "}
                <b>
                  {Object.values(pqDoneMap).filter(Boolean).length} / {pqTasks.length}
                </b>
              </div>
            </>
          ) : (
            <>
              <div className="mt-4 text-xs text-slate-500">
                {pqSource === "fallback"
                  ? "Сервер қолжетімсіз — локалдық чеклист:"
                  : "Локалдық чеклист:"}
              </div>
              <div className="mt-2 space-y-3">
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
                      onChange={() => toggleChecklistLocal(key)}
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
            </>
          )}
        </div>
      </div>

      {/* FOOT NOTE */}
      <div className="mt-8 text-xs text-slate-500">
        Күн ауысқанда — сессия, су және чеклист автоматты түрде нөлденеді.
        Барлық дерек тек осы құрылғыда сақталады ({LS_KEY}).
      </div>
    </div>
  );
}
