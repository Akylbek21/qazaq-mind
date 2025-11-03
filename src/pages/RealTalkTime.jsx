import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchEQRandomCard, submitEQAnswer } from "@/api/eq";

const TASKS = [];
const STORAGE_KEY = "realtalktime_answers_v1";
function loadAll() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; } }
function saveOne(id, text) {
  const all = loadAll();
  all[id] = { text, updatedAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export default function RealTalkTime() {
  const [card, setCard] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState("");
  const [answer, setAnswer] = React.useState("");
  const [audioUrl, setAudioUrl] = React.useState("");
  const [submitState, setSubmitState] = React.useState({ ok: false, msg: "" });

  const [active, setActive] = React.useState(null);
  const [draft, setDraft] = React.useState("");
  const [savedMap, setSavedMap] = React.useState(() => loadAll());
  const [query, setQuery] = React.useState("");

  const loadCard = async () => {
    setLoading(true); setErr(""); setSubmitState({ ok: false, msg: "" });
    try {
      const c = await fetchEQRandomCard();
      setCard(c);
      const prev = loadAll()?.[`card:${c.id}`]?.text || "";
      setAnswer(prev);
    } catch (e) {
      setErr(e?.message || "Карточканы жүктеу мүмкін болмады.");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { loadCard(); }, []);

  const onSaveServerDraft = () => {
    if (!card) return;
    saveOne(`card:${card.id}`, answer);
    setSubmitState({ ok: true, msg: "Сақталды" });
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
      setSubmitState({ ok: true, msg: "Жіберілді" });
    } catch (e) {
      setSubmitState({ ok: false, msg: e?.message || "Жіберу сәтсіз." });
    }
  };

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
      <motion.h1 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.45 }}
        className="text-3xl md:text-4xl font-extrabold text-slate-900 text-center mb-2"
      >
        SeLFtALK (EQ)
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ delay: 0.2 }}
        className="text-center text-lg text-[#1F7A8C] font-semibold mb-6"
      >
        СӨЙЛЕ • СЕЗІН • БӨЛІС
      </motion.p>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8 rounded-2xl border border-slate-200/70 bg-white/90 backdrop-blur-xl p-6 shadow-[0_10px_30px_rgba(16,37,66,0.08)]"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="text-xl font-bold text-slate-900">EQ-карточка</h2>
          <button 
            onClick={loadCard} 
            disabled={loading}
            className="group relative rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-40 transition-all duration-300 hover:scale-105"
          >
            {loading ? "Жүктелуде…" : "🔄 Жаңа"}
          </button>
        </div>

        {err && <p className="mt-3 text-sm text-rose-600">{err}</p>}

        {card && !err && (
          <>
            <div className="mb-6">
              <p className="text-lg text-slate-800 leading-relaxed font-medium">{card.text}</p>
              {Array.isArray(card.tags) && card.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {card.tags.map((t) => (
                    <span 
                      key={t} 
                      className="rounded-full border border-[#1F7A8C]/30 px-3 py-1 text-xs text-[#1F7A8C] bg-[#1F7A8C]/5 font-medium"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-slate-700 mb-2 block">Жауабың</label>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  rows={6}
                  className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 outline-none focus:border-[#1F7A8C] focus:ring-2 focus:ring-[#1F7A8C]/20 transition-all duration-300 resize-none"
                  placeholder="Осы жерге жазыңыз…"
                />
              </div>
              
              <input
                value={audioUrl}
                onChange={(e) => setAudioUrl(e.target.value)}
                placeholder="Audio URL (міндетті емес)"
                className="w-full rounded-xl border-2 border-slate-200 px-4 py-2 outline-none focus:border-[#1F7A8C] focus:ring-2 focus:ring-[#1F7A8C]/20 transition-all duration-300"
              />
              
              <div className="flex gap-3">
                <button 
                  onClick={onSaveServerDraft}
                  className="group/btn flex-1 rounded-xl border-2 border-slate-300 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-300"
                >
                  💾 Сақтау
                </button>
                <button 
                  onClick={onSubmitServer}
                  className="group/btn flex-1 rounded-xl bg-gradient-to-r from-[#1F7A8C] via-[#1aa6b5] to-[#0ea5a5] text-white font-bold px-4 py-3 hover:shadow-lg hover:scale-105 transition-all duration-300 overflow-hidden relative"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Жіберу
                    <span className="group-hover/btn:translate-x-1 transition-transform duration-300">→</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0ea5a5] via-[#1aa6b5] to-[#1F7A8C] opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                </button>
              </div>
              
              {submitState.msg && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-sm font-medium ${submitState.ok ? "text-emerald-700" : "text-rose-700"}`}
                >
                  {submitState.msg}
                </motion.p>
              )}
            </div>
          </>
        )}
      </motion.div>

      {TASKS && TASKS.length > 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-10 flex justify-center"
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Іздеу..."
            className="w-full md:w-2/3 rounded-xl border-2 border-slate-200 px-4 py-3 outline-none focus:border-[#1F7A8C] focus:ring-2 focus:ring-[#1F7A8C]/20 transition-all duration-300"
          />
        </motion.div>
      )}

      {TASKS && TASKS.length > 0 && (
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((t, idx) => {
          const saved = savedMap?.[t.id]?.text?.trim();
          return (
            <motion.button
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + idx * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              onClick={() => openTask(t)}
              className="group relative text-left rounded-2xl border border-slate-200/70 bg-white/90 backdrop-blur-xl p-6 shadow-[0_10px_30px_rgba(16,37,66,0.08)] hover:shadow-[0_16px_40px_rgba(16,37,66,0.15)] transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#1F7A8C]/5 via-transparent to-[#0ea5a5]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative">
                <div className={`rounded-xl bg-gradient-to-r ${t.color} p-3 w-14 h-14 flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {t.icon}
                </div>
                <h3 className="mt-4 text-lg font-extrabold text-slate-900 group-hover:text-[#1F7A8C] transition-colors duration-300">{t.title}</h3>
                <p className="mt-2 text-sm text-slate-600 font-medium">{t.goal}</p>
                <ul className="mt-4 text-sm text-slate-700 space-y-1.5">
                  {t.prompts.slice(0, 2).map((p, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[#1F7A8C] mt-0.5">•</span>
                      <span className="line-clamp-2">{p}</span>
                    </li>
                  ))}
                </ul>
                {saved && (
                  <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full">
                    <span>✓</span>
                    <span>Сақталған</span>
                  </div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
      )}

      <AnimatePresence>
        {active && (
          <motion.div
            key={active.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center p-4"
            onClick={closeTask}
          >
            <motion.div
              initial={{ y: 30, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 30, opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative max-h-[90vh] w-full md:w-[720px] rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/70 p-6 shadow-2xl overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-4 mb-6">
                <div className={`rounded-xl bg-gradient-to-r ${active.color} p-4 w-16 h-16 flex items-center justify-center text-2xl shadow-lg`}>
                  {active.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-extrabold text-slate-900">{active.title}</h3>
                  <p className="text-slate-600 text-sm font-medium mt-1">{active.goal}</p>
                </div>
                <button 
                  onClick={closeTask}
                  className="rounded-xl p-2 hover:bg-slate-100 transition-colors duration-200"
                >
                  ✕
                </button>
              </div>

              <div className="mb-6 space-y-2 bg-slate-50 rounded-xl p-4">
                {active.prompts.map((p, i) => (
                  <p key={i} className="text-slate-700 text-sm leading-relaxed flex items-start gap-2">
                    <span className="text-[#1F7A8C] font-bold mt-0.5">•</span>
                    <span>{p}</span>
                  </p>
                ))}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-bold text-slate-700 mb-2 block">Жауабың</label>
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    rows={6}
                    className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 outline-none focus:border-[#1F7A8C] focus:ring-2 focus:ring-[#1F7A8C]/20 transition-all duration-300 resize-none"
                    placeholder="Осы жерге жазыңыз…"
                  />
                </div>
                
                <div className="flex gap-3">
                  <button 
                    onClick={onSaveLocalTask}
                    className="group/btn flex-1 rounded-xl bg-gradient-to-r from-[#1F7A8C] via-[#1aa6b5] to-[#0ea5a5] text-white font-bold px-4 py-3 hover:shadow-lg hover:scale-105 transition-all duration-300 overflow-hidden relative"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      💾 Сақтау
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0ea5a5] via-[#1aa6b5] to-[#1F7A8C] opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                  </button>
                  <button 
                    onClick={closeTask}
                    className="flex-1 rounded-xl border-2 border-slate-300 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-300"
                  >
                    Жабу
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
