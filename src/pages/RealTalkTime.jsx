import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchEQRandomCard, submitEQAnswer } from "@/api/eq";

/* ===================== ЛОКАЛЬНЫЕ ЗАДАНИЯ (оставляем как раньше) ===================== */
const TASKS = [/* ... твой массив как есть ... */];

/* ===================== ЛОКАЛЬНОЕ ХРАНЕНИЕ ЧЕРНОВИКОВ ===================== */
const STORAGE_KEY = "realtalktime_answers_v1";
function loadAll() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; } }
function saveOne(id, text) {
  const all = loadAll();
  all[id] = { text, updatedAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export default function RealTalkTime() {
  /* ---------- Серверная карточка ---------- */
  const [card, setCard] = React.useState(null);          // {id, text, tags[]}
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState("");
  const [answer, setAnswer] = React.useState("");
  const [audioUrl, setAudioUrl] = React.useState("");
  const [submitState, setSubmitState] = React.useState({ ok: false, msg: "" });

  /* ---------- Локальная галерея ---------- */
  const [active, setActive] = React.useState(null); // активное локальное задание
  const [draft, setDraft] = React.useState("");
  const [savedMap, setSavedMap] = React.useState(() => loadAll());
  const [query, setQuery] = React.useState("");

  const loadCard = async () => {
    setLoading(true); setErr(""); setSubmitState({ ok: false, msg: "" });
    try {
      const c = await fetchEQRandomCard();
      setCard(c);
      // если уже что-то писали по этой карточке — подставим
      const prev = loadAll()?.[`card:${c.id}`]?.text || "";
      setAnswer(prev);
    } catch (e) {
      setErr(e?.message || "Карточканы жүктеу мүмкін болмады.");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { loadCard(); }, []); // грузим при входе

  const onSaveServerDraft = () => {
    if (!card) return;
    saveOne(`card:${card.id}`, answer);
    setSubmitState({ ok: true, msg: "Черновик сақталды (жергілікті)." });
  };

  const onSubmitServer = async () => {
    if (!card) return;
    setSubmitState({ ok: false, msg: "" });
    try {
      await submitEQAnswer({
        cardId: card.id,
        text: answer.trim(),
        audioUrl: audioUrl.trim() || null,
      });
      setSubmitState({ ok: true, msg: "Жауап серверге жіберілді. Рақмет!" });
      // можно сразу загрузить новую карточку
      // await loadCard();
    } catch (e) {
      setSubmitState({ ok: false, msg: e?.message || "Жіберу сәтсіз." });
    }
  };

  /* ---------- Локальные задания: модалка ---------- */
  const openTask = (t) => { setDraft(savedMap?.[t.id]?.text || ""); setActive(t); };
  const closeTask = () => setActive(null);
  const onSaveLocalTask = () => {
    if (!active) return;
    saveOne(active.id, draft);
    setSavedMap(loadAll());
  };

  const filtered = TASKS.filter(
    (t) => t.title.toLowerCase().includes(query.toLowerCase()) ||
      t.prompts.some((p) => p.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
        className="text-3xl md:text-4xl font-extrabold text-slate-900 text-center">
        SeLFtALK (EQ) — <span className="text-[#1F7A8C]">«СӨЙЛЕ, СЕЗІН, БӨЛІС»</span>
      </motion.h1>
      <p className="mt-2 text-center text-slate-600">
        Жоғарыда — <b>серверлік EQ-карточка</b> (рандом). Төменде — сенің <b>галереяң</b> (жергілікті сақталады).
      </p>

      {/* ---------- Блок: Серверная карточка ---------- */}
      <div className="mt-8 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur p-5 shadow">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-slate-900">EQ-карточка (сервер)</h2>
          <div className="flex gap-2">
            <button onClick={loadCard} disabled={loading}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-40">
              {loading ? "Жүктелуде…" : "Жаңа карточка"}
            </button>
          </div>
        </div>

        {err && <p className="mt-3 text-sm text-rose-600">{err}</p>}

        {card && !err && (
          <>
            <div className="mt-4">
              <p className="text-slate-700 leading-relaxed">{card.text}</p>
              {Array.isArray(card.tags) && card.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {card.tags.map((t) => (
                    <span key={t} className="rounded-full border px-3 py-1 text-xs text-slate-600 bg-slate-50">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4">
              <label className="text-sm font-semibold text-slate-700">Жауабың:</label>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={6}
                className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500/60"
                placeholder="Осы жерге жазыңыз…"
              />
              <div className="mt-2 grid gap-2 md:grid-cols-2">
                <input
                  value={audioUrl}
                  onChange={(e) => setAudioUrl(e.target.value)}
                  placeholder="Опционально: Audio URL (мысалы, CDN/Cloud)"
                  className="rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500/60"
                />
                <div className="flex gap-2">
                  <button onClick={onSaveServerDraft}
                    className="rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50">
                    Сақтау (локал)
                  </button>
                  <button onClick={onSubmitServer}
                    className="rounded-xl bg-[#1aa6b5] text-white font-semibold px-4 py-2 hover:opacity-95">
                    Жіберу (сервер)
                  </button>
                </div>
              </div>
              {submitState.msg && (
                <p className={`mt-2 text-sm ${submitState.ok ? "text-emerald-700" : "text-rose-700"}`}>
                  {submitState.msg}
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* ---------- Поиск по локальным заданиям ---------- */}
      <div className="mt-10 flex justify-center">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Іздеу: «ана», «қоғам», «тыныс»…"
          className="w-full md:w-2/3 rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500/60"
        />
      </div>

      {/* ---------- Галерея локальных заданий (как было) ---------- */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((t) => {
          const saved = savedMap?.[t.id]?.text?.trim();
          return (
            <button
              key={t.id}
              onClick={() => openTask(t)}
              className="text-left rounded-2xl border border-slate-200 bg-white/80 backdrop-blur p-5 shadow hover:-translate-y-0.5 hover:shadow-lg transition group"
            >
              <div className={`rounded-xl bg-gradient-to-r ${t.color} p-3 w-12 h-12 flex items-center justify-center text-xl`}>
                {t.icon}
              </div>
              <h3 className="mt-3 text-lg font-bold text-slate-900">{t.title}</h3>
              <p className="text-sm text-slate-500">{t.goal}</p>
              <ul className="mt-3 text-sm text-slate-600 list-disc pl-5 space-y-1">
                {t.prompts.slice(0, 2).map((p) => (
                  <li key={p} className="line-clamp-2">{p}</li>
                ))}
              </ul>
              {saved && (
                <div className="mt-3 inline-flex items-center text-xs font-medium text-teal-700">
                  ✓ Жауап сақталған
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* ---------- Модалка локального задания ---------- */}
      <AnimatePresence>
        {active && (
          <motion.div
            key={active.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-end md:items-center justify-center p-4"
            onClick={closeTask}
          >
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              transition={{ type: "spring", stiffness: 180, damping: 20 }}
              className="relative max-h-[90vh] w-full md:w-[720px] rounded-2xl bg-white p-6 shadow-xl overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-3">
                <div className={`rounded-xl bg-gradient-to-r ${active.color} p-3 w-12 h-12 flex items-center justify-center text-xl`}>
                  {active.icon}
                </div>
                <div className="min-w-0">
                  <h3 className="text-xl font-bold text-slate-900">{active.title}</h3>
                  <p className="text-slate-600 text-sm">{active.goal}</p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {active.prompts.map((p, i) => (
                  <p key={i} className="text-slate-700 text-sm leading-relaxed">• {p}</p>
                ))}
              </div>

              <div className="mt-4">
                <label className="text-sm font-semibold text-slate-700">Жауабың:</label>
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={6}
                  className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500/60"
                  placeholder="Осы жерге жазыңыз…"
                />
                <div className="mt-2 flex flex-wrap gap-3">
                  <button onClick={onSaveLocalTask}
                    className="rounded-xl bg-[#1aa6b5] text-white font-semibold px-4 py-2 hover:opacity-95">
                    Сақтау
                  </button>
                  <button onClick={closeTask}
                    className="rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50">
                    Жабу
                  </button>
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-500">
                Кеңес: дауыстық жауап жазғың келсе, телефон диктовкасын қолдан (не енгіз де, Submit (сервер) жоғарыда).
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
