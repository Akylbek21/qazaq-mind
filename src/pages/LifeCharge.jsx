// src/pages/LifeCharge.jsx
import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
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
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="text-3xl md:text-4xl font-extrabold text-slate-900 text-center mb-2"
      >
        LifeCharge — Digital Detox (PQ)
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center text-lg text-emerald-600 font-semibold mb-8"
      >
        Фокус • Су • Ұйқы • Детокс
      </motion.p>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Focus TIMER */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-emerald-200/70 bg-white/90 backdrop-blur-xl p-6 shadow-[0_10px_30px_rgba(16,37,66,0.08)]"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Focus Timer</h2>
              <div className="mt-1 text-sm font-medium text-emerald-600">
                {st.timerMode === "focus" ? "⏱ Терең жұмыс уақыты" : "☕ Үзіліс уақыты"}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500">Бүгінгі</div>
              <div className="text-lg font-bold text-emerald-600">{st.sessionsDoneToday}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => switchMode("focus")}
              className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all duration-300 ${
                st.timerMode === "focus" 
                  ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white border-emerald-600 shadow-lg" 
                  : "border-slate-300 hover:border-emerald-300"
              }`}
            >
              Focus
            </button>
            <button
              onClick={() => switchMode("break")}
              className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all duration-300 ${
                st.timerMode === "break" 
                  ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white border-emerald-600 shadow-lg" 
                  : "border-slate-300 hover:border-emerald-300"
              }`}
            >
              Break
            </button>
          </div>

          <div className="mt-6 text-center mb-6">
            <motion.div 
              key={st.timerLeftSec}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className="text-6xl md:text-7xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent"
            >
              {fmt(st.timerLeftSec)}
            </motion.div>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={startPause}
                className="group/btn relative px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-400 text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {st.timerRunning ? "⏸ Пауза" : "▶ Бастау"}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
              </button>
              <button
                onClick={resetTimer}
                className="px-5 py-3 rounded-xl border-2 border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-300"
              >
                🔄 Қалпына
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold text-slate-700 mb-2 block">Focus уақыты (мин)</label>
              <select
                value={st.focusMinutes}
                onChange={(e) => setFocusMinutes(Number(e.target.value))}
                className="w-full rounded-xl border-2 border-slate-200 px-3 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300"
              >
                {[20, 25, 30, 45, 60].map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-bold text-slate-700 mb-2 block">Break уақыты (мин)</label>
              <select
                value={st.breakMinutes}
                onChange={(e) => setBreakMinutes(Number(e.target.value))}
                className="w-full rounded-xl border-2 border-slate-200 px-3 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300"
              >
                {[3, 5, 10, 15].map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* WATER */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-sky-200/70 bg-white/90 backdrop-blur-xl p-6 shadow-[0_10px_30px_rgba(16,37,66,0.08)]"
        >
          <h2 className="text-xl font-extrabold text-slate-900 mb-2">Су трекері</h2>
          <p className="text-sm text-slate-600 mb-6">Күніңіздегі таза су мөлшері — мақсатқа жақындаңыз.</p>

          <div className="flex items-center justify-between gap-4 mb-6">
            <button
              onClick={() => setField({ waterCups: Math.max(0, st.waterCups - 1) })}
              className="px-4 py-2 rounded-xl border-2 border-slate-300 font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-300"
            >
              − 1
            </button>
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-extrabold tabular-nums bg-gradient-to-r from-sky-600 to-sky-400 bg-clip-text text-transparent">
                {st.waterCups}
              </div>
              <div className="text-sm text-slate-500 mt-1">стақан</div>
            </div>
            <button
              onClick={() => setField({ waterCups: Math.min(99, st.waterCups + 1) })}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-sky-500 text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              + 1
            </button>
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-slate-700">Мақсат: {st.waterTarget} стақан</span>
              <span className="text-sm font-bold text-sky-600">
                {Math.min(100, Math.round((st.waterCups / Math.max(1, st.waterTarget)) * 100))}%
              </span>
            </div>
            <input
              type="range"
              min={4}
              max={16}
              value={st.waterTarget}
              onChange={(e) => setField({ waterTarget: Number(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
              style={{
                background: `linear-gradient(to right, rgb(2 132 199) 0%, rgb(2 132 199) ${((st.waterTarget - 4) / 12) * 100}%, rgb(226 232 240) ${((st.waterTarget - 4) / 12) * 100}%, rgb(226 232 240) 100%)`
              }}
            />
          </div>
          
          <div className="mt-4 h-3 bg-slate-200/70 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, Math.round((st.waterCups / Math.max(1, st.waterTarget)) * 100))}%` }}
              transition={{ duration: 0.3 }}
              className="h-3 rounded-full bg-gradient-to-r from-sky-600 via-sky-500 to-sky-400"
            />
          </div>
        </motion.div>

        {/* SLEEP / DND */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl border border-indigo-200/70 bg-white/90 backdrop-blur-xl p-6 shadow-[0_10px_30px_rgba(16,37,66,0.08)]"
        >
          <h2 className="text-xl font-extrabold text-slate-900 mb-2">Ұйқы және DND жоспары</h2>
          <p className="text-sm text-slate-600 mb-6">
            Ұйқыға дейін және ұйқыдан кейін телефонсыз уақыт белгілеңіз.
          </p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-sm font-bold text-slate-700 mb-2 block">🌙 Ұйқы уақыты</label>
              <input
                type="time"
                value={st.bedtime}
                onChange={(e) => setField({ bedtime: e.target.value })}
                className="w-full rounded-xl border-2 border-slate-200 px-4 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
              />
              <div className="mt-2 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg px-3 py-1.5">
                Ұйқыға дейін: <b>{Math.floor(minutesUntil(st.bedtime) / 60)} сағ {minutesUntil(st.bedtime) % 60} мин</b>
              </div>
            </div>
            <div>
              <label className="text-sm font-bold text-slate-700 mb-2 block">☀ Ояну уақыты</label>
              <input
                type="time"
                value={st.wakeTime}
                onChange={(e) => setField({ wakeTime: e.target.value })}
                className="w-full rounded-xl border-2 border-slate-200 px-4 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
              />
              <div className="mt-2 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg px-3 py-1.5">
                Оянуға: <b>{Math.floor(minutesUntil(st.wakeTime) / 60)} сағ {minutesUntil(st.wakeTime) % 60} мин</b>
              </div>
            </div>
          </div>

          <label className="mt-4 inline-flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={st.eveningDnd}
              onChange={() => setField({ eveningDnd: !st.eveningDnd })}
              className="mt-1 w-5 h-5 rounded border-2 border-indigo-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
            />
            <span className="text-sm text-slate-700 font-medium group-hover:text-indigo-600 transition-colors">
              Ұйқыға 30 мин қалғанда «телефон ұстамаймын» (жоспар)
            </span>
          </label>

          <div className="mt-4 text-xs text-slate-500 bg-slate-50 rounded-lg px-4 py-2">
            💡 Ескерту: Бұл тек жоспар/ескерту құралы. Құралдың жүйелік параметрлерін өзгертпейді.
          </div>
        </motion.div>

        {/* SERVER PQ (with local fallback) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-2xl border border-amber-200/70 bg-white/90 backdrop-blur-xl p-6 shadow-[0_10px_30px_rgba(16,37,66,0.08)]"
        >
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-xl font-extrabold text-slate-900">Күндік Detox-чеклист</h2>
            <button
              onClick={loadPq}
              className="ml-auto rounded-xl border-2 border-slate-300 px-3 py-1.5 text-sm font-semibold hover:bg-slate-50 hover:border-slate-400 transition-all duration-300"
            >
              🔄 Қайта жүктеу
            </button>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            Тізім бекэндтен келеді. Белгі қою — бірден серверге жазылады (күн: {todayStr()}).
          </p>
          {pqErr && (
            <div className="mb-4 text-sm text-rose-600 bg-rose-50 rounded-xl p-3">{pqErr}</div>
          )}
          {pqLoading && (
            <div className="flex items-center gap-2 text-slate-600 mb-4">
              <div className="animate-spin h-4 w-4 border-2 border-amber-500 border-t-transparent rounded-full"></div>
              <span className="text-sm">Жүктелуде…</span>
            </div>
          )}

          {!pqLoading && pqTasks.length > 0 ? (
            <>
              <div className="space-y-3">
                {pqTasks.map((t, idx) => (
                  <motion.label 
                    key={t.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-start gap-3 p-3 rounded-xl border-2 border-slate-200 hover:border-amber-300 hover:bg-amber-50/50 transition-all duration-300 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={!!pqDoneMap[t.id]}
                      onChange={() => togglePq(t.id)}
                      className="mt-1 w-5 h-5 rounded border-2 border-amber-300 text-amber-600 focus:ring-2 focus:ring-amber-500/20 cursor-pointer"
                    />
                    <span className={`flex-1 ${pqDoneMap[t.id] ? 'line-through text-slate-500' : 'text-slate-800'} group-hover:text-amber-700 transition-colors`}>
                      <b className="font-semibold">{t.title}</b>
                      {t.description && (
                        <span className="text-slate-500 ml-1">— {t.description}</span>
                      )}
                    </span>
                    {pqDoneMap[t.id] && (
                      <span className="text-amber-600 text-xl">✓</span>
                    )}
                  </motion.label>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between bg-amber-50 rounded-xl px-4 py-3">
                <span className="text-sm font-semibold text-slate-700">Орындағандар:</span>
                <span className="text-lg font-bold text-amber-600">
                  {Object.values(pqDoneMap).filter(Boolean).length} / {pqTasks.length}
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="text-sm font-medium text-slate-700 mb-4 bg-slate-50 rounded-lg px-4 py-2">
                {pqSource === "fallback"
                  ? "⚠️ Сервер қолжетімсіз — локалдық чеклист:"
                  : "📋 Локалдық чеклист:"}
              </div>
              <div className="space-y-3">
                {[
                  ["morningNoPhone", "🌅 Таңғы 30 мин — телефон жоқ"],
                  ["eveningNoPhone", "🌙 Ұйқыға 30 мин қалғанда — телефон жоқ"],
                  ["walk", "🚶 15 мин жаяу жүру"],
                  ["stretch", "🧘 5 мин созылу"],
                ].map(([key, label], idx) => (
                  <motion.label 
                    key={key}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-xl border-2 border-slate-200 hover:border-amber-300 hover:bg-amber-50/50 transition-all duration-300 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={!!st.checklist[key]}
                      onChange={() => toggleChecklistLocal(key)}
                      className="w-5 h-5 rounded border-2 border-amber-300 text-amber-600 focus:ring-2 focus:ring-amber-500/20 cursor-pointer"
                    />
                    <span className={`flex-1 ${st.checklist[key] ? 'line-through text-slate-500' : 'text-slate-800'} group-hover:text-amber-700 transition-colors`}>
                      {label}
                    </span>
                    {st.checklist[key] && (
                      <span className="text-amber-600 text-xl">✓</span>
                    )}
                  </motion.label>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between bg-amber-50 rounded-xl px-4 py-3">
                <span className="text-sm font-semibold text-slate-700">Орындағандар:</span>
                <span className="text-lg font-bold text-amber-600">
                  {Object.values(st.checklist).filter(Boolean).length} / {Object.keys(st.checklist).length}
                </span>
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
                className="mt-4 w-full px-4 py-2 rounded-xl border-2 border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-300"
              >
                Чеклистті тазалау
              </button>
            </>
          )}
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-8 text-xs text-slate-500 bg-slate-50 rounded-xl px-4 py-3"
      >
        💡 Күн ауысқанда — сессия, су және чеклист автоматты түрде нөлденеді.
        Барлық дерек тек осы құрылғыда сақталады ({LS_KEY}).
      </motion.div>

      {/* Кнопка возврата на главную */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
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
