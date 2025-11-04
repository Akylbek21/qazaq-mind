// src/components/DetailedInsightDashboard.jsx
// Расширенная версия дашборда для Teacher Console
import React from "react";
import { getStudentInsights } from "../api/dashboard";
import { motion } from "framer-motion";
import { useAuth } from "../auth/AuthContext";

/* ---------- Утилиты ---------- */
const toNumber = (v, def = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
};
const fmtPct = (v) => `${Math.max(0, Math.min(100, Math.round(toNumber(v, 0) * 10) / 10))}%`;

const PERSONALITY_NAMES = {
  ABAY: "Абай",
  BAUYRZHAN: "Бауыржан",
  TOMIRIS: "Томирис",
  AKHMET: "Ахмет",
  ALIKHAN: "Әлихан",
};

export default function DetailedInsightDashboard() {
  const { role, username } = useAuth();
  const [students, setStudents] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [sortBy, setSortBy] = React.useState("score"); // score | iq | eq | sq | pq
  const [filterActive, setFilterActive] = React.useState(false);
  const [page, setPage] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalElements, setTotalElements] = React.useState(0);
  const [pageSize] = React.useState(20);

  const load = React.useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const response = await getStudentInsights(page, pageSize);
      setStudents(response?.content || []);
      setTotalPages(response?.totalPages || 1);
      setTotalElements(response?.totalElements || 0);
    } catch (e) {
      console.error("Қате:", e);
      const status = e?.response?.status;
      const serverMessage = e?.response?.data?.message || e?.response?.data?.error;
      
      if (status === 400) {
        setError(null);
      } else {
        let errorMessage = e?.message || "Қате орын алды";
        
        if (status === 401) {
          errorMessage = "Рұқсат жоқ (401): Сіз жүйеге кіруіңіз керек";
        } else if (status === 403) {
          errorMessage = "Қол жетімсіз (403): Сізде бұл ақпаратты көруге рұқсат жоқ. Тек мұғалімдерге қолжетімді.";
        } else if (serverMessage) {
          errorMessage = serverMessage;
        }
        
        setError(errorMessage);
      }
      setStudents([]);
      setTotalPages(1);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  React.useEffect(() => {
    load();
  }, [load]);

  const filteredStudents = React.useMemo(() => {
    let list = [...students];
    
    // Фильтр активных (хоть одна активность)
    if (filterActive) {
      list = list.filter(s => {
        const i = s.insight || {};
        return i.iq?.hasActivity || i.eq?.hasActivity || i.sq?.hasActivity || i.pq?.hasActivity || i.historical?.hasActivity;
      });
    }

    // Сортировка
    list.sort((a, b) => {
      if (sortBy === "score") return (b.score || 0) - (a.score || 0);
      if (sortBy === "iq") return (b.insight?.iq?.accuracy || 0) - (a.insight?.iq?.accuracy || 0);
      if (sortBy === "eq") return (b.insight?.eq?.avgSentiment || 0) - (a.insight?.eq?.avgSentiment || 0);
      if (sortBy === "sq") return (b.insight?.sq?.accuracy || 0) - (a.insight?.sq?.accuracy || 0);
      if (sortBy === "pq") return (b.insight?.pq?.completionRate || 0) - (a.insight?.pq?.completionRate || 0);
      return 0;
    });

    return list;
  }, [students, sortBy, filterActive]);

  const stats = React.useMemo(() => {
    if (!students.length) return { totalScore: 0, avgIQ: 0, avgEQ: 0, avgSQ: 0, avgPQ: 0 };
    
    const total = students.length;
    const totalScore = students.reduce((sum, s) => sum + (s.score || 0), 0);
    const avgIQ = students.reduce((sum, s) => sum + (s.insight?.iq?.accuracy || 0), 0) / total;
    const avgEQ = students.reduce((sum, s) => sum + ((s.insight?.eq?.avgSentiment || 0) * 100), 0) / total;
    const avgSQ = students.reduce((sum, s) => sum + (s.insight?.sq?.accuracy || 0), 0) / total;
    const avgPQ = students.reduce((sum, s) => sum + (s.insight?.pq?.completionRate || 0), 0) / total;

    return { totalScore, avgIQ, avgEQ, avgSQ, avgPQ };
  }, [students]);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-slate-400 animate-pulse">Жүктеліп жатыр...</div>
      </div>
    );
  }

  const roleNames = {
    TEACHER: "Мұғалім",
    STUDENT: "Оқушы",
    PARENT: "Ата-ана",
  };
  const roleName = roleNames[role] || role || "—";
  const isTeacher = role === "TEACHER";

  if (error) {
    const is400Error = error.includes("400") || error.includes("Нашар сұраным");
    
    return (
      <div className="space-y-4">
        {!isTeacher && (
          <div className="rounded-xl border border-yellow-500/40 bg-yellow-500/10 text-yellow-200 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-yellow-300 text-lg">⚠️</span>
              <div>
                <div className="font-semibold">Рұқсат шектелген</div>
                <div className="text-sm mt-1">
                  Бұл бөлім тек <strong>Мұғалімдерге</strong> арналған.
                </div>
              </div>
            </div>
          </div>
        )}
        
        {!is400Error && (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 text-red-200 px-4 py-3">
            {error}
          </div>
        )}
      </div>
    );
  }

  if (!students.length || (stats.totalScore === 0 && stats.avgIQ === 0 && stats.avgEQ === 0 && stats.avgSQ === 0 && stats.avgPQ === 0)) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Статистика класса */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Жалпы ұпай" value={stats.totalScore} icon="🏆" />
        <StatCard label="Орт. IQ" value={fmtPct(stats.avgIQ)} icon="🧠" />
        <StatCard label="Орт. EQ" value={fmtPct(stats.avgEQ)} icon="❤️" />
        <StatCard label="Орт. SQ" value={fmtPct(stats.avgSQ)} icon="👥" />
        <StatCard label="Орт. PQ" value={fmtPct(stats.avgPQ)} icon="💪" />
      </div>

      {/* Управление */}
      <div className="flex flex-wrap items-center gap-4 bg-white rounded-xl border-2 border-slate-200 p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-700">Сұрыптау:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-white border-2 border-slate-300 text-slate-800 text-sm font-medium hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400/20 transition-all"
          >
            <option value="score">Ұпай бойынша</option>
            <option value="iq">IQ бойынша</option>
            <option value="eq">EQ бойынша</option>
            <option value="sq">SQ бойынша</option>
            <option value="pq">PQ бойынша</option>
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-700 font-medium cursor-pointer">
          <input
            type="checkbox"
            checked={filterActive}
            onChange={(e) => setFilterActive(e.target.checked)}
            className="w-4 h-4 rounded border-2 border-slate-300 text-slate-600 focus:ring-2 focus:ring-slate-400/20"
          />
          Тек белсенділер
        </label>
        <div className="ml-auto text-sm font-semibold text-slate-600">
          Барлығы: <span className="text-slate-900">{totalElements}</span> оқушы (<span className="text-slate-900">{page + 1}</span> / <span className="text-slate-900">{totalPages}</span>)
        </div>
      </div>

      {/* Таблица студентов */}
      <div className="overflow-x-auto rounded-xl border-2 border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200">
            <tr>
              <th className="px-4 py-3 text-slate-800 font-bold">Оқушы</th>
              <th className="px-4 py-3 text-slate-800 font-bold text-center">Ұпай</th>
              <th className="px-4 py-3 text-slate-800 font-bold text-center">IQ</th>
              <th className="px-4 py-3 text-slate-800 font-bold text-center">EQ</th>
              <th className="px-4 py-3 text-slate-800 font-bold text-center">SQ</th>
              <th className="px-4 py-3 text-slate-800 font-bold text-center">PQ</th>
              <th className="px-4 py-3 text-slate-800 font-bold text-center">Тарих</th>
              <th className="px-4 py-3 text-slate-800 font-bold">Статус</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student, idx) => (
              <StudentRow key={student.userId} student={student} idx={idx} />
            ))}
          </tbody>
        </table>
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border-2 border-slate-200">
          <div className="text-4xl mb-3">🔍</div>
          <div className="text-slate-600 font-medium">Оқушылар табылмады</div>
        </div>
      )}

      {/* Пагинация */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0 || loading}
            className="px-5 py-2.5 rounded-lg bg-white border-2 border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 hover:border-slate-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm shadow-sm"
          >
            ⟵ Артқа
          </button>
          <div className="px-5 py-2.5 text-slate-700 text-sm font-bold bg-slate-100 rounded-lg">
            {page + 1} / {totalPages}
          </div>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1 || loading}
            className="px-5 py-2.5 rounded-lg bg-white border-2 border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 hover:border-slate-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm shadow-sm"
          >
            Келесі ⟶
          </button>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon }) {
  // Определяем цвет по иконке
  let bgColor = "bg-gradient-to-br from-slate-50 to-slate-100";
  let borderColor = "border-slate-200";
  let textColor = "text-slate-700";
  let valueColor = "text-slate-900";
  
  if (icon === "🏆") {
    bgColor = "bg-gradient-to-br from-amber-400 to-orange-500";
    borderColor = "border-amber-500";
    textColor = "text-white";
    valueColor = "text-white";
  } else if (icon === "🧠") {
    bgColor = "bg-gradient-to-br from-pink-400 to-rose-500";
    borderColor = "border-pink-500";
    textColor = "text-white";
    valueColor = "text-white";
  } else if (icon === "❤️") {
    bgColor = "bg-gradient-to-br from-red-400 to-rose-600";
    borderColor = "border-red-500";
    textColor = "text-white";
    valueColor = "text-white";
  } else if (icon === "👥") {
    bgColor = "bg-gradient-to-br from-blue-400 to-indigo-500";
    borderColor = "border-blue-500";
    textColor = "text-white";
    valueColor = "text-white";
  } else if (icon === "💪") {
    bgColor = "bg-gradient-to-br from-yellow-400 to-amber-500";
    borderColor = "border-yellow-500";
    textColor = "text-white";
    valueColor = "text-white";
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`${bgColor} rounded-xl p-4 border-2 ${borderColor} shadow-lg`}
    >
      <div className="flex items-center gap-3">
        <div className="text-3xl">{icon}</div>
        <div>
          <div className={`text-xs font-semibold ${textColor} opacity-90`}>{label}</div>
          <div className={`text-2xl font-bold ${valueColor}`}>{value}</div>
        </div>
      </div>
    </motion.div>
  );
}

function StudentRow({ student, idx }) {
  const { username, score, insight } = student;
  const iq = insight?.iq || {};
  const eq = insight?.eq || {};
  const sq = insight?.sq || {};
  const pq = insight?.pq || {};
  const hist = insight?.historical || {};

  const hasActivity = iq.hasActivity || eq.hasActivity || sq.hasActivity || pq.hasActivity || hist.hasActivity;

  return (
    <motion.tr
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: idx * 0.03 }}
      className="border-b border-slate-200 hover:bg-slate-50 transition-colors"
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-sm font-bold text-white shadow-md">
            {username?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div>
            <div className="text-slate-900 font-semibold">{username}</div>
            <div className="text-xs text-slate-500">ID: {student.userId}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold text-sm shadow-md">
          {score || 0}
        </span>
      </td>
      <td className="px-4 py-3 text-center">
        <ProgressBadge
          value={iq.accuracy}
          label={`${iq.correct || 0}/${iq.total || 0}`}
          active={iq.hasActivity}
        />
      </td>
      <td className="px-4 py-3 text-center">
        <ProgressBadge
          value={eq.avgSentiment * 100}
          label={`${eq.totalResponses || 0}`}
          active={eq.hasActivity}
        />
      </td>
      <td className="px-4 py-3 text-center">
        <ProgressBadge
          value={sq.accuracy}
          label={`${sq.correct || 0}/${sq.total || 0}`}
          active={sq.hasActivity}
        />
      </td>
      <td className="px-4 py-3 text-center">
        <ProgressBadge
          value={pq.completionRate}
          label={`${pq.completed || 0}`}
          active={pq.hasActivity}
        />
      </td>
      <td className="px-4 py-3 text-center">
        {hist.hasActivity ? (
          <div className="text-xs">
            <div className="text-slate-900 font-semibold">{hist.attemptsCount || 0} рет</div>
            {hist.dominantPersonality && (
              <div className="text-slate-600 mt-0.5">{PERSONALITY_NAMES[hist.dominantPersonality]}</div>
            )}
          </div>
        ) : (
          <span className="text-slate-400">—</span>
        )}
      </td>
      <td className="px-4 py-3">
        {hasActivity ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xs font-semibold shadow-sm">
            <span className="w-2 h-2 rounded-full bg-white"></span>
            Белсенді
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-200 text-slate-600 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            Белсенді емес
          </span>
        )}
      </td>
    </motion.tr>
  );
}

function ProgressBadge({ value = 0, label = "", active = false }) {
  if (!active) {
    return <span className="text-slate-400">—</span>;
  }

  const v = toNumber(value, 0);
  let colorClass = "text-green-600";
  let bgClass = "bg-green-50";
  let borderClass = "border-green-300";
  
  if (v >= 75) {
    colorClass = "text-emerald-600";
    bgClass = "bg-emerald-50";
    borderClass = "border-emerald-300";
  } else if (v >= 50) {
    colorClass = "text-amber-600";
    bgClass = "bg-amber-50";
    borderClass = "border-amber-300";
  } else if (v >= 25) {
    colorClass = "text-orange-600";
    bgClass = "bg-orange-50";
    borderClass = "border-orange-300";
  } else {
    colorClass = "text-red-600";
    bgClass = "bg-red-50";
    borderClass = "border-red-300";
  }

  return (
    <div className={`inline-block px-3 py-1.5 rounded-lg border-2 ${borderClass} ${bgClass}`}>
      <div className={`text-sm font-bold ${colorClass}`}>{fmtPct(v)}</div>
      {label && <div className="text-xs text-slate-600 mt-0.5">{label}</div>}
    </div>
  );
}

