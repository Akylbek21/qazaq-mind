// src/pages/StudentInsights.jsx
import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { getStudentInsights } from "../api/dashboard";

const toNumber = (v, def = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
};

const fmtPct = (v) => `${Math.max(0, Math.min(100, Math.round(toNumber(v, 0) * 10) / 10))}%`;

export default function StudentInsights() {
  const [students, setStudents] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalElements, setTotalElements] = React.useState(0);

  React.useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const response = await getStudentInsights(page, 20);
        if (ignore) return;
        setStudents(response?.content || []);
        setTotalPages(response?.totalPages || 1);
        setTotalElements(response?.totalElements || 0);
      } catch (e) {
        if (ignore) return;
        setError(e?.message || "Оқушыларды жүктеу мүмкін болмады.");
        setStudents([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [page]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto max-w-7xl px-4 py-8 md:py-10">
        {/* Заголовок */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-2 text-center">
            Оқушыларды талдау
          </h1>
          <p className="text-center text-lg text-slate-600 mb-6">
            Барлық оқушылардың IQ, EQ, SQ, PQ көрсеткіштері
          </p>
          <div className="flex justify-center mb-6">
            <Link 
              to="/" 
              className="inline-flex items-center justify-center rounded-xl px-6 py-3 border-2 border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-300"
            >
              ⟵ Басты бетке оралу
            </Link>
          </div>
        </motion.div>

        {/* Загрузка */}
        {loading && (
          <div className="flex items-center justify-center gap-3 py-12">
            <div className="animate-spin h-8 w-8 border-4 border-[#1F7A8C] border-t-transparent rounded-full"></div>
            <span className="text-slate-600 font-medium">Жүктелуде…</span>
          </div>
        )}

        {/* Ошибка */}
        {error && (
          <div className="bg-rose-50 border-2 border-rose-200 rounded-xl p-4 text-center mb-6">
            <p className="text-rose-700 font-medium">{error}</p>
          </div>
        )}

        {/* Список студентов */}
        {!loading && !error && (
          <>
            <div className="mb-4 text-sm text-slate-600 text-center">
              Барлығы: <span className="font-bold">{totalElements}</span> оқушы
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {students.map((student, idx) => (
                <StudentCard key={student.userId || idx} student={student} />
              ))}
            </div>

            {/* Пагинация */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-4 py-2 rounded-xl border-2 border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  ⟵ Артқа
                </button>
                <div className="px-4 py-2 text-slate-700 font-medium">
                  {page + 1} / {totalPages}
                </div>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="px-4 py-2 rounded-xl border-2 border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Келесі ⟶
                </button>
              </div>
            )}

            {students.length === 0 && (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">📊</div>
                <p className="text-slate-500 font-medium">Оқушылар табылмады</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function StudentCard({ student }) {
  const insight = student.insight || {};
  const iq = insight.iq || {};
  const eq = insight.eq || {};
  const sq = insight.sq || {};
  const pq = insight.pq || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-lg hover:shadow-xl transition-all duration-300"
    >
      {/* Заголовок карточки */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-slate-900">
            {student.username || `Оқушы #${student.userId}`}
          </h3>
          <div className="px-3 py-1 rounded-full bg-gradient-to-r from-[#1F7A8C] to-[#0ea5a5] text-white text-sm font-bold">
            {student.score || 0} ұпай
          </div>
        </div>
        {(student.firstName || student.lastName) && (
          <p className="text-sm text-slate-600">
            {student.firstName} {student.lastName}
          </p>
        )}
      </div>

      {/* Кольцевые метрики */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <MetricCard 
          label="IQ" 
          value={iq.accuracy || 0} 
          hasActivity={iq.hasActivity}
          total={iq.total || 0}
          correct={iq.correct || 0}
        />
        <MetricCard 
          label="EQ" 
          value={eq.avgSentiment ? Math.round(eq.avgSentiment * 100) : 0}
          hasActivity={eq.hasActivity}
          total={eq.totalResponses || 0}
        />
        <MetricCard 
          label="SQ" 
          value={sq.accuracy || 0}
          hasActivity={sq.hasActivity}
          total={sq.total || 0}
          correct={sq.correct || 0}
        />
        <MetricCard 
          label="PQ" 
          value={pq.completionRate ? Math.round(pq.completionRate * 100) : 0}
          hasActivity={pq.hasActivity}
          total={pq.completed || 0}
        />
      </div>

      {/* Сильные стороны */}
      {insight.strengths && insight.strengths.length > 0 && (
        <div className="mb-3">
          <div className="text-xs font-bold text-emerald-600 mb-1">Күшті жақтары:</div>
          <div className="flex flex-wrap gap-1">
            {insight.strengths.map((s, i) => (
              <span key={i} className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Слабые стороны */}
      {insight.weaknesses && insight.weaknesses.length > 0 && (
        <div className="mb-3">
          <div className="text-xs font-bold text-rose-600 mb-1">Әлсіз жақтары:</div>
          <div className="flex flex-wrap gap-1">
            {insight.weaknesses.map((w, i) => (
              <span key={i} className="text-xs px-2 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                {w}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* AI Анализ */}
      {insight.aiAnalysis && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          {insight.aiAnalysis.usynys && (
            <div className="mb-2">
              <div className="text-xs font-bold text-slate-600 mb-1">Ұсыныс:</div>
              <p className="text-xs text-slate-700 leading-relaxed">{insight.aiAnalysis.usynys}</p>
            </div>
          )}
          {insight.aiAnalysis.kustyZhak && insight.aiAnalysis.kustyZhak.length > 0 && (
            <div className="mb-2">
              <div className="text-xs font-bold text-emerald-600 mb-1">Күшті жақтары (AI):</div>
              <div className="flex flex-wrap gap-1">
                {insight.aiAnalysis.kustyZhak.map((k, i) => (
                  <span key={i} className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {k}
                  </span>
                ))}
              </div>
            </div>
          )}
          {insight.aiAnalysis.alsizZhak && insight.aiAnalysis.alsizZhak.length > 0 && (
            <div>
              <div className="text-xs font-bold text-rose-600 mb-1">Әлсіз жақтары (AI):</div>
              <div className="flex flex-wrap gap-1">
                {insight.aiAnalysis.alsizZhak.map((a, i) => (
                  <span key={i} className="text-xs px-2 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

function MetricCard({ label, value, hasActivity, total, correct }) {
  const color = hasActivity ? "from-[#1F7A8C] to-[#0ea5a5]" : "from-slate-300 to-slate-400";
  
  return (
    <div className="text-center">
      <div className="text-xs font-bold text-slate-600 mb-1">{label}</div>
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r ${color} text-white text-sm font-bold`}>
        {hasActivity ? `${Math.round(value)}%` : "—"}
      </div>
      {hasActivity && total && (
        <div className="text-xs text-slate-500 mt-1">
          {correct !== undefined ? `${correct}/${total}` : `${total}`}
        </div>
      )}
    </div>
  );
}

