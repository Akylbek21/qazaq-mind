// src/pages/TeacherConsole.jsx
import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { fetchResources } from "@/api/resources";
import DetailedInsightDashboard from "@/components/DetailedInsightDashboard";

const safeUrl = (u) => (/^https?:\/\//i.test(String(u || "")) ? String(u) : "");

export default function TeacherConsole() {

  const [resQuery, setResQuery] = React.useState("");
  const [resources, setResources] = React.useState([]);
  const [resLoading, setResLoading] = React.useState(false);
  const [resErr, setResErr] = React.useState("");

  const loadResources = async (q = "") => {
    setResLoading(true); setResErr("");
    try {
      const list = await fetchResources(q.trim());
      setResources(list);
    } catch (e) {
      setResErr(e?.message || "Ресурстарды жүктеу мүмкін емес.");
      setResources([]);
    } finally {
      setResLoading(false);
    }
  };

  React.useEffect(() => { loadResources("*"); }, []);
  const onResSearch = () => loadResources(resQuery);
  const onResKey = (e) => { if (e.key === "Enter") onResSearch(); };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="text-3xl md:text-4xl font-extrabold text-slate-900 text-center mb-2"
      >
        Ақылды көмекші — Teacher Console
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center text-lg text-[#7c3aed] font-semibold mb-8"
      >
        Аналитика • Ресурстар • Басқару
      </motion.p>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8"
      >
        <DetailedInsightDashboard />
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8 rounded-2xl border border-slate-200/70 bg-white/90 backdrop-blur-xl p-6 shadow-[0_10px_30px_rgba(16,37,66,0.08)]"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-extrabold text-slate-900">Мұғалім ресурстары</h3>
          {resLoading && (
            <div className="flex items-center gap-2 text-slate-600">
              <div className="animate-spin h-4 w-4 border-2 border-[#7c3aed] border-t-transparent rounded-full"></div>
              <span className="text-sm">Жүктелуде…</span>
            </div>
          )}
        </div>
        
        <div className="flex gap-3 mb-6">
          <input
            value={resQuery}
            onChange={(e) => setResQuery(e.target.value)}
            onKeyDown={onResKey}
            placeholder="Іздеу: classroom, steam, methodology…"
            className="flex-1 rounded-xl border-2 border-slate-200 px-4 py-3 outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20 transition-all duration-300"
          />
          <button
            onClick={onResSearch}
            disabled={resLoading}
            className="group/btn relative px-6 py-3 rounded-xl bg-gradient-to-r from-[#7c3aed] via-[#8b5cf6] to-[#a78bfa] text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              Іздеу
              <span className="group-hover/btn:translate-x-1 transition-transform duration-300">→</span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#a78bfa] via-[#8b5cf6] to-[#7c3aed] opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
          </button>
        </div>

        {resErr && !resLoading && (
          <div className="mb-4 text-sm text-rose-600 bg-rose-50 rounded-xl p-3">{resErr}</div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {resources.map((r, idx) => {
            const href = safeUrl(r.url);
            return (
              <motion.a
                key={r.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + idx * 0.05 }}
                href={href || undefined}
                target="_blank"
                rel="noreferrer noopener"
                className={`group block rounded-xl border-2 border-slate-200 bg-white p-5 hover:border-[#7c3aed]/50 hover:bg-gradient-to-br hover:from-[#7c3aed]/5 hover:to-[#a78bfa]/5 hover:shadow-lg transition-all duration-300 ${
                  href ? "cursor-pointer" : "pointer-events-none opacity-60"
                }`}
                title={r.url}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#a78bfa] flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
                    📚
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-900 group-hover:text-[#7c3aed] transition-colors">
                      {r.title}
                    </div>
                    {r.description && (
                      <div className="mt-2 text-sm text-slate-600 leading-relaxed">{r.description}</div>
                    )}
                    {r.tags && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(Array.isArray(r.tags) ? r.tags : String(r.tags).split(","))
                          .filter(Boolean)
                          .map((t) => (
                            <span
                              key={t}
                              className="text-xs px-3 py-1 rounded-full bg-[#7c3aed]/10 border border-[#7c3aed]/30 text-[#7c3aed] font-medium"
                            >
                              #{t.trim()}
                            </span>
                          ))}
                      </div>
                    )}
                  </div>
                  {href && (
                    <div className="text-[#7c3aed] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      ↗
                    </div>
                  )}
                </div>
              </motion.a>
            );
          })}
          {!resLoading && !resErr && resources.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full text-center py-12"
            >
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-slate-500 font-medium">Нәтиже жоқ</p>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Кнопка возврата на главную */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
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
