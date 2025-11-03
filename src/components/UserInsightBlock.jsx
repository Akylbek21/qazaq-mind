// src/components/UserInsightBlock.jsx
import React from "react";
import { getDashboard } from "../api/dashboard";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../auth/AuthContext";

/* ---------- Утилиты ---------- */
const toNumber = (v, def = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
};
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const clamp100 = (v) => Math.max(0, Math.min(100, v));
const fmtPct = (v) => `${clamp100(Math.round(toNumber(v, 0) * 10) / 10)}%`;


const initialInsight = {
  strengths: [],
  weaknesses: [],
  recommendations: [],
  aiAdvice: null,
  iq: { total: 0, correct: 0, percentage: 0, wrongByDomain: {}, hasActivity: false },
  eq: { responses: 0, sentimentAvg: 0, percentage: 0, hasActivity: false },
  sq: { total: 0, correct: 0, percentage: 0, points: 0, hasActivity: false },
  pq: { tasks: 0, completion7d: 0, percentage: 0, hasActivity: false },
};

export default function UserInsightBlock() {
  const { username } = useAuth();
  const [insight, setInsight] = React.useState(initialInsight);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  const load = React.useCallback(async () => {
    setError("");
    setLoading(true);
    console.log("🔄 Loading dashboard data...");
    const startTime = Date.now();
    try {
      const data = await getDashboard();
      const elapsed = Date.now() - startTime;
      console.log(`✅ Dashboard data loaded in ${elapsed}ms`, data);
      
      if (!data) {
        setInsight(initialInsight);
        return;
      }

      const aiAnalysis = data?.aiAnalysis || {};

      // Маппинг полей: поддержка старого и нового API формата
      const strengths = Array.isArray(data.strengths) 
        ? data.strengths 
        : Array.isArray(aiAnalysis.kustyZhak) 
          ? aiAnalysis.kustyZhak 
          : [];
      
      const weaknesses = Array.isArray(data.weaknesses)
        ? data.weaknesses
        : Array.isArray(aiAnalysis.alsizZhak)
          ? aiAnalysis.alsizZhak
          : [];
      
      const recommendations = Array.isArray(data.recommendations)
        ? data.recommendations
        : aiAnalysis.usynys
          ? [aiAnalysis.usynys]
          : [];

      setInsight({
        strengths,
        weaknesses,
        recommendations,
        aiAdvice: data?.aiAdvice || null,
        iq: {
          total: toNumber(data?.iq?.total, 0),
          correct: toNumber(data?.iq?.correct, 0),
          percentage: toNumber(data?.iq?.percentage, 0),
          wrongByDomain: data?.iq?.wrongByDomain || {},
          hasActivity: (data?.iq?.total > 0),
        },
        eq: {
          responses: toNumber(data?.eq?.responses, 0),
          sentimentAvg: toNumber(data?.eq?.sentimentAvg, 0),
          percentage: toNumber(data?.eq?.percentage, 0),
          hasActivity: (data?.eq?.responses > 0),
        },
        sq: {
          total: toNumber(data?.sq?.total, 0),
          correct: toNumber(data?.sq?.correct, 0),
          percentage: toNumber(data?.sq?.percentage, 0),
          points: toNumber(data?.sq?.points, 0),
          hasActivity: (data?.sq?.total > 0),
        },
        pq: {
          tasks: toNumber(data?.pq?.tasks, 0),
          completion7d: toNumber(data?.pq?.completion7d, 0),
          percentage: toNumber(data?.pq?.percentage, 0),
          hasActivity: (data?.pq?.tasks > 0),
        },
      });
    } catch (e) {
      const elapsed = Date.now() - startTime;
      console.error(`❌ Dashboard load failed after ${elapsed}ms:`, e);
      const status = e?.response?.status;
      const serverMessage = e?.response?.data?.message || e?.response?.data?.error;
      
      let errorMessage = e?.message || "Қате орын алды";
      
      if (status === 400) {
        errorMessage = `Нашар сұраным (400): ${serverMessage || "Сервер сұранымды қабылдамады. Жүйеге кіруіңіз керек."}`;
      } else if (status === 401) {
        errorMessage = "Рұқсат жоқ (401): Сіз жүйеге кіруіңіз керек";
      } else if (status === 403) {
        errorMessage = "Қол жетімсіз (403): Сізде бұл ақпаратты көруге рұқсат жоқ.";
      } else if (serverMessage) {
        errorMessage = serverMessage;
      }
      
      setError(errorMessage);
      setInsight(initialInsight);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      if (!alive) return;
      await load();
    })();
    return () => {
      alive = false;
    };
  }, [load]);

  const overall = React.useMemo(() => {
    const arr = [
      insight.iq.percentage,
      insight.eq.percentage,
      insight.sq.percentage,
      insight.pq.percentage,
    ]
      .map((n) => toNumber(n, 0))
      .filter((n) => n > 0);
    if (!arr.length) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }, [insight]);

  const weakest = React.useMemo(() => {
    const items = [
      { key: "IQ", value: toNumber(insight.iq.percentage, 0), label: "Intellect Up" },
      { key: "EQ", value: toNumber(insight.eq.percentage, 0), label: "Real Talk" },
      { key: "SQ", value: toNumber(insight.sq.percentage, 0), label: "Think Hub" },
      { key: "PQ", value: toNumber(insight.pq.percentage, 0), label: "Life Charge" },
    ];
    return items.sort((a, b) => a.value - b.value)[0];
  }, [insight]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-12 mb-12 max-w-6xl mx-auto px-6 py-8 rounded-2xl border border-slate-200/70 bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_rgba(16,37,66,0.08)]"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-yellow-400 to-yellow-300 flex items-center justify-center text-2xl font-extrabold shadow-lg">
            {loading ? <div className="animate-spin h-6 w-6 border-2 border-slate-700 border-t-transparent rounded-full"></div> : "📊"}
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-slate-900">Менің статистикам</h3>
            {username && (
              <p className="text-sm text-slate-600 mt-1 font-medium">
                @{username}
              </p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={load}
          className="px-4 py-2 rounded-xl border-2 border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
          title="Қайта жүктеу"
        >
          🔄 Қайта жүктеу
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border-2 border-red-300 bg-red-50 text-red-700 px-4 py-3 font-medium">
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-6">
          <div className="animate-pulse h-32 bg-slate-200 rounded-xl" />
          <div className="animate-pulse grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-slate-200 h-32 rounded-xl" />
            ))}
          </div>
        </div>
      ) : !insight.iq.hasActivity && !insight.eq.hasActivity && !insight.sq.hasActivity && !insight.pq.hasActivity ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📭</div>
          <div className="text-xl font-bold text-slate-700 mb-2">Деректер табылмады</div>
          <p className="text-slate-600">Тапсырмаларды орындаңыз</p>
        </div>
      ) : (
        <>

          {/* Общий индекс прогресса */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl border-2 border-indigo-200/50 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 p-6 shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🎯</span>
                  <div>
                    <div className="text-slate-900 font-bold text-lg">Жалпы прогресс</div>
                    <div className="text-slate-600 text-xs mt-0.5 font-medium">Орташа мән</div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-5">
                <ProgressRing size={95} stroke={11} percentage={overall} label={fmtPct(overall)} lightMode />
                <div className="text-sm text-slate-700 leading-relaxed space-y-2">
                  <div className="flex items-start gap-1.5">
                    <span className="text-indigo-600 mt-0.5 font-bold">•</span>
                    <span>IQ/EQ/SQ/PQ көрсеткіштерінің орташа мәні</span>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                    <span className="text-slate-600 text-xs font-medium">Мақсат:</span>
                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-300">
                      {fmtPct(75)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            <NextActionCard weakest={weakest} />

            <DomainHeat wrongByDomain={insight.iq.wrongByDomain} />
          </div>

          {/* Кольцевые бейджи по осям */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mb-8">
            <MetricCard
              label="IQ"
              sub={`${insight.iq.correct}/${insight.iq.total}`}
              percentage={insight.iq.percentage}
              color="blue"
            />
            <MetricCard
              label="EQ"
              sub={`Жауап: ${insight.eq.responses}`}
              percentage={insight.eq.percentage}
              color="pink"
            />
            <MetricCard
              label="SQ"
              sub={`${insight.sq.correct}/${insight.sq.total}`}
              percentage={insight.sq.percentage}
              color="purple"
            />
            <MetricCard
              label="PQ"
              sub={`Тапсырма: ${insight.pq.tasks}`}
              percentage={insight.pq.percentage}
              color="green"
            />
          </div>

          {/* Сильные/слабые/рекомендации */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
            <Card title="Күшті жақтары" color="yellow" items={insight.strengths} />
            <Card title="Әлсіз жақтары" color="pink" items={insight.weaknesses} />
            <Card title="Ұсынымдар" color="green" items={insight.recommendations} />
          </div>

          {/* --- AI Кеңестері --- */}
          {insight.aiAdvice && (
            <AIAdviceCard aiAdvice={insight.aiAdvice} />
          )}
        </>
      )}
    </motion.div>
  );
}

/* ---------- Вспомогательные компоненты ---------- */

const Card = React.memo(function Card({ title, color = "yellow", items = [] }) {
  const colorMap = {
    yellow: { 
      dotBg: "bg-gradient-to-br from-yellow-100 to-yellow-200", 
      dotText: "text-yellow-700", 
      title: "text-yellow-700",
      border: "border-yellow-300",
      bg: "bg-gradient-to-br from-yellow-50/50 to-orange-50/50",
      icon: "✓",
      emoji: "💪"
    },
    pink: { 
      dotBg: "bg-gradient-to-br from-pink-100 to-rose-200", 
      dotText: "text-pink-700", 
      title: "text-pink-700",
      border: "border-pink-300",
      bg: "bg-gradient-to-br from-pink-50/50 to-rose-50/50",
      icon: "!",
      emoji: "⚠️"
    },
    green: { 
      dotBg: "bg-gradient-to-br from-green-100 to-emerald-200", 
      dotText: "text-green-700", 
      title: "text-green-700",
      border: "border-green-300",
      bg: "bg-gradient-to-br from-green-50/50 to-emerald-50/50",
      icon: "→",
      emoji: "💡"
    },
  };
  const c = colorMap[color] || colorMap.yellow;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-xl border-2 ${c.border} ${c.bg} p-5 min-h-[160px] hover:shadow-lg transition-all duration-300 shadow-md`}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-12 h-12 rounded-xl ${c.dotBg} flex items-center justify-center text-2xl shadow-md`}>
          {c.emoji}
        </div>
        <div className={`${c.title} font-bold text-lg`}>{title}</div>
      </div>
      {items?.length ? (
        <ul className="space-y-2.5 text-slate-700 leading-relaxed">
          {items.map((s, i) => (
            <motion.li 
              key={`${title}-${i}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-2.5"
            >
              <span className={`${c.dotText} font-bold mt-0.5 text-sm`}>{c.icon}</span>
              <span className="flex-1 text-sm font-medium">{s}</span>
            </motion.li>
          ))}
        </ul>
      ) : (
        <div className="text-slate-500 text-sm italic flex items-center gap-2">
          <span>📭</span>
          <span>Анықталмады</span>
        </div>
      )}
    </motion.div>
  );
});

const MetricCard = React.memo(function MetricCard({ label, sub, percentage, color, extra }) {
  const getIcon = (label) => {
    const icons = {
      'IQ': '🧠',
      'EQ': '❤️',
      'SQ': '👥',
      'PQ': '💪',
      'Тарих': '📚'
    };
    return icons[label] || '📊';
  };

  const colorMap = {
    blue: {
      border: 'border-blue-300',
      bg: 'bg-gradient-to-br from-blue-50/50 to-indigo-50/50',
      text: 'text-blue-700',
      ring: 'text-blue-600'
    },
    pink: {
      border: 'border-pink-300',
      bg: 'bg-gradient-to-br from-pink-50/50 to-rose-50/50',
      text: 'text-pink-700',
      ring: 'text-pink-600'
    },
    purple: {
      border: 'border-purple-300',
      bg: 'bg-gradient-to-br from-purple-50/50 to-violet-50/50',
      text: 'text-purple-700',
      ring: 'text-purple-600'
    },
    green: {
      border: 'border-green-300',
      bg: 'bg-gradient-to-br from-green-50/50 to-emerald-50/50',
      text: 'text-green-700',
      ring: 'text-green-600'
    },
  };

  const c = colorMap[color] || colorMap.blue;

  const getStatusColor = (pct) => {
    if (pct >= 75) return 'text-emerald-700';
    if (pct >= 50) return 'text-amber-700';
    if (pct >= 25) return 'text-orange-700';
    return 'text-red-700';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className={`rounded-xl border-2 ${c.border} ${c.bg} p-5 shadow-lg hover:shadow-xl transition-all`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getIcon(label)}</span>
          <span className={`${c.text} font-bold text-base`}>{label}</span>
        </div>
        <span className="text-slate-600 text-xs bg-white border border-slate-300 px-2 py-1 rounded-full font-medium">{sub}</span>
      </div>
      <div className="flex items-center gap-4">
        <ProgressRing size={75} stroke={9} percentage={percentage} label={fmtPct(percentage)} lightMode ringColor={c.ring} />
        <div className="flex-1 space-y-2">
          <LinearTrack value={percentage} lightMode />
          <div className={`text-xs font-bold ${getStatusColor(percentage)}`}>
            {percentage >= 75 ? '🔥 Өте жақсы!' : 
             percentage >= 50 ? '👍 Жақсы!' : 
             percentage >= 25 ? '📈 Жақсаруда' : 
             '💪 Тырысу керек'}
          </div>
          {extra}
        </div>
      </div>
    </motion.div>
  );
});

/** Кольцевой прогресс с анимацией */
function ProgressRing({ size = 96, stroke = 10, percentage = 0, label = "", lightMode = false, ringColor = "text-indigo-600" }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = clamp100(percentage);
  const offset = c - (pct / 100) * c;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="block">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          className={lightMode ? "text-slate-200" : "opacity-20"}
          stroke="currentColor"
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          strokeLinecap="round"
          stroke="currentColor"
          fill="none"
          initial={{ strokeDasharray: c, strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          style={{ rotate: -90, transformOrigin: "50% 50%" }}
          className={lightMode ? ringColor : "text-slate-100"}
        />
      </svg>
      <div className={`absolute inset-0 grid place-items-center text-[13px] font-bold ${lightMode ? "text-slate-800" : "text-slate-100"}`}>
        {label}
      </div>
    </div>
  );
}

/** Линейный прогресс (микро-трек) */
function LinearTrack({ value = 0, lightMode = false }) {
  const pct = clamp100(value);
  const getGradient = (pct) => {
    if (pct >= 75) return 'bg-gradient-to-r from-emerald-500 to-emerald-600';
    if (pct >= 50) return 'bg-gradient-to-r from-amber-500 to-amber-600';
    if (pct >= 25) return 'bg-gradient-to-r from-orange-500 to-orange-600';
    return 'bg-gradient-to-r from-red-500 to-red-600';
  };
  
  return (
    <div className={`w-full h-2 rounded-full ${lightMode ? "bg-slate-200" : "bg-white/10"} overflow-hidden`}>
      <motion.div
        className={`h-full ${lightMode ? getGradient(pct) : "bg-white/80"}`}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
  );
}

/** Рекомендованное следующее действие на основе самого слабого показателя */
function NextActionCard({ weakest }) {
  const map = {
    IQ: {
      title: "Келесі қадам: IQ",
      emoji: "🧠",
      tips: ["Күн сайын 10 минут логикалық есептер", "Олимпиададан 3 тапсырма"],
      color: "from-blue-500/10 to-indigo-600/10",
      border: "border-blue-500/30"
    },
    EQ: {
      title: "Келесі қадам: EQ",
      emoji: "❤️",
      tips: ["Күнделікке 3 эмоцияны жаз", "1 эмпатиялық әңгіме жүргіз"],
      color: "from-pink-500/10 to-rose-600/10",
      border: "border-pink-500/30"
    },
    SQ: { 
      title: "Келесі қадам: SQ", 
      emoji: "👥",
      tips: ["Топтық тапсырма", "Қысқа дебат: 5 минут"],
      color: "from-purple-500/10 to-violet-600/10",
      border: "border-purple-500/30"
    },
    PQ: { 
      title: "Келесі қадам: PQ", 
      emoji: "💪",
      tips: ["20 минут серуен/йога", "Планка 3×30с"],
      color: "from-green-500/10 to-emerald-600/10",
      border: "border-green-500/30"
    },
  };

  const cfg = map[weakest?.key] || { 
    title: "Келесі қадам", 
    emoji: "🎯",
    tips: [],
    color: "from-slate-50/50 to-slate-100/50",
    border: "border-slate-300"
  };

  const borderMap = {
    IQ: "border-blue-300",
    EQ: "border-pink-300",
    SQ: "border-purple-300",
    PQ: "border-green-300",
  };
  const bgMap = {
    IQ: "bg-gradient-to-br from-blue-50/50 to-indigo-50/50",
    EQ: "bg-gradient-to-br from-pink-50/50 to-rose-50/50",
    SQ: "bg-gradient-to-br from-purple-50/50 to-violet-50/50",
    PQ: "bg-gradient-to-br from-green-50/50 to-emerald-50/50",
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border-2 ${borderMap[weakest?.key] || "border-slate-300"} ${bgMap[weakest?.key] || cfg.color} p-5 shadow-lg`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{cfg.emoji}</span>
          <div>
            <div className="text-slate-900 font-bold text-base">{cfg.title}</div>
            <div className="text-slate-600 text-xs mt-0.5 font-medium">
              Қазіргі деңгей: {fmtPct(weakest?.value || 0)}
            </div>
          </div>
        </div>
        <div className="bg-amber-100 border border-amber-300 rounded-lg px-3 py-1.5">
          <span className="text-amber-700 text-xs font-bold">⚡ Басым</span>
        </div>
      </div>
      <ul className="space-y-2.5 text-sm text-slate-700">
        {cfg.tips.map((t, i) => (
          <motion.li 
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-start gap-2.5 bg-white/80 border border-slate-200 rounded-lg p-2.5 hover:bg-white hover:shadow-sm transition"
          >
            <span className="text-emerald-600 font-bold mt-0.5">✓</span>
            <span className="flex-1 font-medium">{t}</span>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}

/** Мини heatmap: какие домены IQ дают больше ошибок */
function DomainHeat({ wrongByDomain = {} }) {
  const entries = Object.entries(wrongByDomain || {}).sort((a, b) => b[1] - a[1]);
  
  if (!entries.length) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-xl border-2 border-slate-300 bg-gradient-to-br from-slate-50/50 to-slate-100/50 p-5 text-sm text-slate-600 shadow-lg"
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">✨</span>
          <span className="font-medium">Домендер бойынша қате табылмады</span>
        </div>
      </motion.div>
    );
  }
  
  const max = Math.max(...entries.map(([, v]) => Number(v) || 0));
  
  const getDomainIcon = (domain) => {
    const icons = {
      'pattern': '🔢',
      'verbal': '📝',
      'math': '➗',
      'spatial': '🎯',
      'logic': '🧩'
    };
    return icons[domain.toLowerCase()] || '📊';
  };

  const getBarColor = (pct) => {
    if (pct >= 75) return 'bg-gradient-to-r from-red-500 to-red-600';
    if (pct >= 50) return 'bg-gradient-to-r from-orange-500 to-orange-600';
    if (pct >= 25) return 'bg-gradient-to-r from-yellow-500 to-yellow-600';
    return 'bg-gradient-to-r from-green-500 to-green-600';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border-2 border-slate-300 bg-white/80 backdrop-blur-sm p-5 shadow-lg"
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">📊</span>
        <div>
          <div className="text-slate-900 font-bold text-base">IQ қателері бойынша домендер</div>
          <div className="text-slate-600 text-xs mt-0.5 font-medium">Назар аудару керек салалар</div>
        </div>
      </div>
      <div className="space-y-3.5">
        {entries.map(([k, v], idx) => {
          const pct = max ? (Number(v) / max) * 100 : 0;
          return (
            <motion.div 
              key={k}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="flex justify-between items-center text-xs text-slate-700 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">{getDomainIcon(k)}</span>
                  <span className="font-bold capitalize">{k}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-600 font-medium">{v} қате</span>
                  <span className="bg-red-100 text-red-700 border border-red-300 px-2 py-0.5 rounded-full text-xs font-bold">
                    {Math.round(pct)}%
                  </span>
                </div>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden shadow-inner">
                <motion.div
                  className={`h-full ${getBarColor(pct)} shadow-sm`}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: idx * 0.1 }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

/** Селектор студентов */
function StudentSelector({ students = [], currentStudent, onSelect }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-white/5 to-white/10 rounded-xl p-5 border border-white/15 shadow-lg"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="text-slate-100 font-bold text-base flex items-center gap-2">
          <span className="text-2xl">👥</span>
          <span>Оқушыларды таңдау</span>
        </div>
        <span className="text-xs text-slate-400 bg-white/10 px-2.5 py-1 rounded-full">
          {students.length} оқушы
        </span>
      </div>
      <div className="flex flex-wrap gap-2.5 max-h-[140px] overflow-y-auto custom-scrollbar">
        {students.map((s, idx) => {
          const isActive = currentStudent?.userId === s.userId;
          return (
            <motion.button
              key={s.userId}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(s)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-gradient-to-r from-yellow-500 to-orange-400 text-slate-900 shadow-xl scale-105"
                  : "bg-white/10 text-slate-300 hover:bg-white/20 border border-white/10"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                  isActive ? "bg-slate-900/20 text-slate-900" : "bg-white/20 text-slate-100"
                }`}>
                  {s.username?.charAt(0)?.toUpperCase()}
                </div>
                <span>{s.username}</span>
                {s.score > 0 && (
                  <span className={`text-xs px-2 py-0.5 rounded-lg font-bold ${
                    isActive ? "bg-slate-900/20 text-slate-900" : "bg-white/20 text-yellow-300"
                  }`}>
                    {s.score}
                  </span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

/** AI Кеңестері карточкасы */
function AIAdviceCard({ aiAdvice }) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  
  if (!aiAdvice) return null;

  // Парсинг AI advice по разделам
  const sections = aiAdvice.split(/\n\n(?=[A-Z]{2}:)/);
  const parsedSections = sections.map(section => {
    const lines = section.trim().split('\n');
    const title = lines[0].replace(':', '');
    const items = lines.slice(1)
      .filter(line => line.trim().startsWith('-'))
      .map(line => line.trim().replace(/^-\s*/, ''));
    
    return { title, items };
  }).filter(s => s.items.length > 0);

  const sectionIcons = {
    'IQ': '🧠',
    'EQ': '❤️',
    'SQ': '👥',
    'PQ': '💪',
  };

  const sectionColors = {
    'IQ': {
      border: 'border-blue-300',
      from: 'from-blue-50/50',
      to: 'to-indigo-50/50'
    },
    'EQ': {
      border: 'border-pink-300',
      from: 'from-pink-50/50',
      to: 'to-rose-50/50'
    },
    'SQ': {
      border: 'border-purple-300',
      from: 'from-purple-50/50',
      to: 'to-violet-50/50'
    },
    'PQ': {
      border: 'border-green-300',
      from: 'from-green-50/50',
      to: 'to-emerald-50/50'
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <div 
        className="rounded-2xl border-2 border-indigo-300 bg-gradient-to-br from-indigo-50/50 via-purple-50/50 to-pink-50/50 p-6 shadow-xl cursor-pointer hover:shadow-2xl transition-all"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 border border-indigo-200 flex items-center justify-center shadow-lg">
              <span className="text-2xl">🤖</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">AI Жеке Кеңестер</h3>
              <p className="text-xs text-slate-600 mt-0.5 font-medium">Жасанды интеллект ұсынымдары</p>
            </div>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="text-slate-600 text-2xl"
          >
            ▼
          </motion.div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 mt-4 pt-4 border-t border-slate-200"
            >
              {parsedSections.map((section, idx) => {
                const secColor = sectionColors[section.title] || { border: 'border-slate-300', from: 'from-slate-50/50', to: 'to-slate-100/50' };
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`rounded-xl border-2 ${secColor.border} bg-gradient-to-br ${secColor.from} ${secColor.to} p-4`}
                  >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{sectionIcons[section.title] || '📚'}</span>
                    <h4 className="text-base font-bold text-slate-900">{section.title} дамыту жоспары</h4>
                  </div>
                  <ul className="space-y-2.5">
                    {section.items.map((item, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (idx * 0.1) + (i * 0.05) }}
                        className="flex items-start gap-2.5 text-sm text-slate-700 bg-white/80 border border-slate-200 rounded-lg p-2.5 font-medium"
                      >
                        <span className="text-emerald-600 font-bold mt-0.5 flex-shrink-0">✓</span>
                        <span className="flex-1">{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                  </motion.div>
                );
              })}

              {/* Мотивациялық хабар */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: parsedSections.length * 0.1 }}
                className="rounded-xl border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 p-4 text-center"
              >
                <p className="text-sm text-slate-800 font-bold">
                  🌟 Сізге алда үлкен жетістіктер күтіп тұр! Тек қана өзіңізге сеніңіз және әр қадамыңызды мақсатқа бағыттаңыз! 💪
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {!isExpanded && (
          <p className="text-sm text-slate-600 italic font-medium">
            👆 Толық кеңестерді көру үшін басыңыз
          </p>
        )}
      </div>
    </motion.div>
  );
}

/** Карточка текущего студента */
function StudentCard({ student }) {
  if (!student) return null;
  
  const { username, firstName, lastName, score, userId, role } = student;
  const fullName = [firstName, lastName].filter(Boolean).join(" ") || username;
  
  // Маппинг ролей на казахский язык
  const roleNames = {
    TEACHER: "Мұғалім",
    STUDENT: "Оқушы",
    PARENT: "Ата-ана",
  };
  const normalizedRole = (role || "").toString().trim().toUpperCase();
  const roleName = roleNames[normalizedRole] || normalizedRole || "—";
  
  const getRoleColor = (role) => {
    const colors = {
      TEACHER: "bg-blue-500/20 text-blue-300 border-blue-500/40",
      STUDENT: "bg-purple-500/20 text-purple-300 border-purple-500/40",
      PARENT: "bg-green-500/20 text-green-300 border-green-500/40",
    };
    return colors[role] || "bg-slate-500/20 text-slate-300 border-slate-500/40";
  };

  const getScoreLevel = (score) => {
    if (score >= 1000) return { emoji: "🏆", text: "Чемпион", color: "text-yellow-400" };
    if (score >= 500) return { emoji: "⭐", text: "Эксперт", color: "text-blue-400" };
    if (score >= 250) return { emoji: "🌟", text: "Жақсы", color: "text-green-400" };
    return { emoji: "🎯", text: "Бастауыш", color: "text-slate-400" };
  };

  const level = getScoreLevel(score);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className="mb-6 bg-gradient-to-r from-blue-900/30 via-purple-900/30 to-indigo-900/30 rounded-2xl p-6 border border-white/15 shadow-2xl backdrop-blur-sm"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-400 flex items-center justify-center text-3xl font-bold text-slate-900 shadow-xl">
              {username?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
              <span className="text-xs">✓</span>
            </div>
          </div>
          <div>
            <h4 className="text-xl font-bold text-slate-100 mb-1">{fullName}</h4>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-sm text-slate-400">@{username}</span>
              {role && (
                <>
                  <span className="text-xs text-slate-600">•</span>
                  <span className={`text-xs px-2.5 py-1 rounded-lg ${getRoleColor(normalizedRole)} border font-medium`}>
                    {roleName}
                  </span>
                </>
              )}
            </div>
            <p className="text-xs text-slate-500 bg-slate-800/50 px-2 py-1 rounded inline-block">
              ID: {userId}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="flex items-center gap-1.5 justify-end mb-1">
              <span className="text-xs text-slate-400">Деңгей:</span>
              <span className={`text-xs font-bold ${level.color}`}>{level.text}</span>
            </div>
            <div className="text-xs text-slate-400 mb-2">Жалпы ұпай</div>
            <div className={`text-4xl font-extrabold ${level.color} drop-shadow-lg`}>
              {score.toLocaleString()}
            </div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400/20 to-orange-400/20 border border-yellow-500/30 flex items-center justify-center shadow-lg">
            <span className="text-3xl">{level.emoji}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
