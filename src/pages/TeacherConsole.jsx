// src/pages/TeacherConsole.jsx
import React from "react";
import { motion } from "framer-motion";
import { fetchResources } from "@/api/resources";
import DetailedInsightDashboard from "@/components/DetailedInsightDashboard";
import AuthDebug from "@/components/AuthDebug";

const safeUrl = (u) => (/^https?:\/\//i.test(String(u || "")) ? String(u) : "");

export default function TeacherConsole() {

  /* -------- Ресурстар (server) -------- */
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
    <>
      <AuthDebug />
      <div className="container mx-auto max-w-6xl px-4 py-10">
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-extrabold text-slate-900"
        >
          Ақылды көмекші — <span className="text-[#7c3aed]">Teacher Console</span>
        </motion.h1>
        <p className="mt-2 text-slate-600">
          Оқушылар аналитикасы және мұғалім ресурстары.
        </p>

      {/* Оқушылар аналитикасы */}
      <div className="mt-8">
        <DetailedInsightDashboard />
      </div>

      {/* Мұғалім ресурстары */}
      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-4">
        <h3 className="font-bold text-slate-900">Мұғалім ресурстары</h3>
        <div className="mt-3 flex gap-2">
          <input
            value={resQuery}
            onChange={(e) => setResQuery(e.target.value)}
            onKeyDown={onResKey}
            placeholder="іздеу: classroom, steam, methodology…"
            className="flex-1 rounded-xl border border-slate-300 px-3 py-2"
          />
          <button
            onClick={onResSearch}
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold"
          >
            Іздеу
          </button>
        </div>

        {resLoading && <div className="mt-3 text-sm text-slate-500">Жүктелуде…</div>}
        {resErr && !resLoading && <div className="mt-3 text-sm text-rose-600">{resErr}</div>}

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {resources.map((r) => {
            const href = safeUrl(r.url);
            return (
              <a
                key={r.id}
                href={href || undefined}
                target="_blank"
                rel="noreferrer noopener"
                className={`block rounded-xl border border-slate-200 p-4 hover:bg-slate-50 ${
                  href ? "" : "pointer-events-none opacity-60"
                }`}
                title={r.url}
              >
                <div className="font-semibold text-slate-900">{r.title}</div>
                {r.description && (
                  <div className="mt-1 text-sm text-slate-700">{r.description}</div>
                )}
                {r.tags && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(Array.isArray(r.tags) ? r.tags : String(r.tags).split(","))
                      .filter(Boolean)
                      .map((t) => (
                        <span
                          key={t}
                          className="text-xs px-2 py-1 rounded-lg bg-slate-100 border border-slate-200"
                        >
                          #{t.trim()}
                        </span>
                      ))}
                  </div>
                )}
              </a>
            );
          })}
          {!resLoading && resources.length === 0 && (
            <div className="text-sm text-slate-500">Нәтиже жоқ.</div>
          )}
        </div>
      </div>
      </div>
    </>
  );
}
