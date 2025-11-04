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

  const load = React.useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const response = await getStudentInsights({ page: 0, size: 100 });
      setStudents(response?.content || []);
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
    } finally {
      setLoading(false);
    }
  }, []);

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
      if (sortBy === "pq") return (b.insight?.pq?.percentage || 0) - (a.insight?.pq?.percentage || 0);
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
    const avgPQ = students.reduce((sum, s) => sum + (s.insight?.pq?.percentage || 0), 0) / total;

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
        <StatCard label="Жалпы балл" value={stats.totalScore} icon="🏆" />
        <StatCard label="Орт. IQ" value={fmtPct(stats.avgIQ)} icon="🧠" />
        <StatCard label="Орт. EQ" value={fmtPct(stats.avgEQ)} icon="❤️" />
        <StatCard label="Орт. SQ" value={fmtPct(stats.avgSQ)} icon="👥" />
        <StatCard label="Орт. PQ" value={fmtPct(stats.avgPQ)} icon="💪" />
      </div>

      {/* Управление */}
      <div className="flex flex-wrap items-center gap-4 bg-white/5 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">Сұрыптау:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 rounded-md bg-white/10 border border-white/20 text-slate-200 text-sm"
          >
            <option value="score">Балл бойынша</option>
            <option value="iq">IQ бойынша</option>
            <option value="eq">EQ бойынша</option>
            <option value="sq">SQ бойынша</option>
            <option value="pq">PQ бойынша</option>
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={filterActive}
            onChange={(e) => setFilterActive(e.target.checked)}
            className="w-4 h-4 rounded border-white/20"
          />
          Тек белсенділер
        </label>
        <div className="ml-auto text-sm text-slate-400">
          Барлығы: {filteredStudents.length}
        </div>
      </div>

      {/* Таблица студентов */}
      <div className="overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="px-4 py-3 text-slate-300 font-semibold">Оқушы</th>
              <th className="px-4 py-3 text-slate-300 font-semibold text-center">Балл</th>
              <th className="px-4 py-3 text-slate-300 font-semibold text-center">IQ</th>
              <th className="px-4 py-3 text-slate-300 font-semibold text-center">EQ</th>
              <th className="px-4 py-3 text-slate-300 font-semibold text-center">SQ</th>
              <th className="px-4 py-3 text-slate-300 font-semibold text-center">PQ</th>
              <th className="px-4 py-3 text-slate-300 font-semibold text-center">Тарих</th>
              <th className="px-4 py-3 text-slate-300 font-semibold">Статус</th>
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
        <div className="text-center py-12 text-slate-400">
          <div className="text-4xl mb-3">🔍</div>
          <div>Оқушылар табылмады</div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/5 rounded-lg p-4 border border-white/10"
    >
      <div className="flex items-center gap-3">
        <div className="text-3xl">{icon}</div>
        <div>
          <div className="text-xs text-slate-400">{label}</div>
          <div className="text-xl font-bold text-slate-100">{value}</div>
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
      className="border-b border-white/5 hover:bg-white/5 transition"
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center text-sm font-bold text-slate-900">
            {username?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div>
            <div className="text-slate-200 font-medium">{username}</div>
            <div className="text-xs text-slate-500">ID: {student.userId}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-yellow-500/20 text-yellow-300 font-bold text-sm">
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
          value={pq.percentage}
          label={`${pq.tasks || 0}`}
          active={pq.hasActivity}
        />
      </td>
      <td className="px-4 py-3 text-center">
        {hist.hasActivity ? (
          <div className="text-xs">
            <div className="text-slate-300">{hist.attemptsCount || 0} рет</div>
            {hist.dominantPersonality && (
              <div className="text-slate-500">{PERSONALITY_NAMES[hist.dominantPersonality]}</div>
            )}
          </div>
        ) : (
          <span className="text-slate-600">—</span>
        )}
      </td>
      <td className="px-4 py-3">
        {hasActivity ? (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 text-green-300 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
            Белсенді
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-500/20 text-slate-400 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
            Белсенді емес
          </span>
        )}
      </td>
    </motion.tr>
  );
}

function ProgressBadge({ value = 0, label = "", active = false }) {
  if (!active) {
    return <span className="text-slate-600">—</span>;
  }

  const v = toNumber(value, 0);
  const color =
    v >= 75 ? "text-green-400"
    : v >= 50 ? "text-yellow-400"
    : v >= 25 ? "text-orange-400"
    : "text-red-400";

  return (
    <div className="text-sm">
      <div className={`font-bold ${color}`}>{fmtPct(v)}</div>
      {label && <div className="text-xs text-slate-500">{label}</div>}
    </div>
  );
}

