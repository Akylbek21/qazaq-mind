import React from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ===================== ДЕРЕК: ҚЫСҚА ИНСАЙТТАР ===================== */
/* Абай (қоғам игілігі) тақырыптары. Дәйексөздер — қысқаша, public domain. */
const INSIGHTS = [
  {
    id: "adil-raqym",
    title: "Әділет пен рақым",
    quote: "«Адам баласын заман өсіреді, кімде-кім жаман болса, оның өзінен болса керек.» — Абай",
    idea: "Әділет — өзіңе де, өзгеге де бір өлшем. Рақым — қатыгездікті жұмсартатын қуат.",
    questions: [
      "Бүгін бір шешімімде әділет сақталды ма?",
      "Кімге кішкентай рақым жасай аламын?",
    ],
    practice: "Кемінде бір адамға жылы сөз айт; бір ісіңде әділдікке нақты қадам жаса.",
    tags: ["әділет", "рақым", "құндылық"],
  },
  {
    id: "enbek",
    title: "Еңбек — ырыс кілті",
    quote: "«Еңбек қылмай ер оңбас.»",
    idea: "Тұрақты еңбек — қабілетіңді ұштайды, ерік-жігерді бекітеді.",
    questions: [
      "Қай әрекетім нақты құндылық қосты?",
      "Күндік ең маңызды бір еңбегім қандай?",
    ],
    practice: "Бүгінгі «бір үлкен ісіңді» 25 минуттық терең жұмысқа арна.",
    tags: ["еңбек", "тәртіп"],
  },
  {
    id: "bilim",
    title: "Білім — шырақ",
    quote: "«Ғылым таппай мақтанба.»",
    idea: "Білім — сыртқы бедел үшін емес, ішкі кемелдік үшін.",
    questions: [
      "Соңғы үйренген жаңа ұғымым қандай?",
      "Оны қай жерде қолдана аламын?",
    ],
    practice: "10–15 минут жаңа білімге арна: мақала/бейне, қысқа конспект жаз.",
    tags: ["білім", "өсу"],
  },
  {
    id: "ozin-tanu",
    title: "Өзін-өзі тану",
    quote: "«Егер есті кісілердің қатарында болғың келсе, күнде өзіңнен есеп ал.»",
    idea: "Рефлексия — сана айнасы. Жақсартудың бастауы — шынайы есеп.",
    questions: ["Бүгін неге ризамын?", "Нені дұрыстай аламын?"],
    practice: "Кешкі 3 сөйлемдік есеп: жетістік, сабақ, ертеңгі ниет.",
    tags: ["рефлексия", "тәрбие"],
  },
  {
    id: "maqsat",
    title: "Мақсат пен ниет",
    quote: "«Ниетіңе қарай ісің оң болар.»",
    idea: "Ниет дұрыс болса, күш-қуат жинақталады, алаң азаяды.",
    questions: [
      "Менің ниетім кімге пайда әкеледі?",
      "Мақсатымды бір сөйлеммен айта аламын ба?",
    ],
    practice: "Мақсатыңды 1 сөйлемге қысқартып, бүгінгі бір қадамды белгіле.",
    tags: ["мақсат", "ниет"],
  },
  {
    id: "uaqyt",
    title: "Уақыт құны",
    quote: "«Қаттырақ жүріп, уақытты босқа өткізбе.»",
    idea: "Уақыт — қайтып келмейтін капитал. Оны бағалау — өзіңді бағалау.",
    questions: ["Мен бүгін немен уақыт жоғалттым?", "Қалай азайтам?"],
    practice: "Қазіргі сәтте бір алаңдатқышты өшір (пуш/лента).",
    tags: ["уақыт", "қауіпсіз-цифр"],
  },
  {
    id: "dos",
    title: "Дос таңдау",
    quote: "«Жаман дос – көлеңке: бастан күн айналмай қоймайды.»",
    idea: "Орта — мінез бен әдетті қалыптастырады.",
    questions: ["Кіммен араласуым маған күш береді?", "Кімді шектеймін?"],
    practice: "Қуат беретін бір адамға хабарласып, қысқа әңгіме құру.",
    tags: ["қоғам", "қарым-қатынас"],
  },
  {
    id: "saber",
    title: "Сабыр мен ұстам",
    quote: "«Сабыр түбі – сары алтын.»",
    idea: "Сабыр — эмоцияны басқару, ұстам — әрекетті басқару.",
    questions: ["Қай жерде асығыстық жасадым?", "Қадамымды қалай баяулатам?"],
    practice: "3 рет терең дем: 4-4-6 тынысымен шешім қабылда.",
    tags: ["сабыр", "EQ"],
  },
  {
    id: "sheteldineti",
    title: "Өзгені түсіну",
    quote: "«Адам баласын сүй, бауырым деп.»",
    idea: "Эмпатия — адамды адамға жақындатар көпір.",
    questions: ["Бүгін біреуді шынайы тыңдадым ба?", "Қандай сезім көрдім?"],
    practice: "Бір адамды 2 минут үзбей тыңдап, айтқанын қысқаша қайтала.",
    tags: ["эмпатия", "құндылық"],
  },
  {
    id: "tazalyk",
    title: "Ой тазалығы",
    quote: "«Ары бар адамның ұяты бар.»",
    idea: "Ұят сезімі — ішкі навигатор. Оны тыңдау — тұтастық.",
    questions: ["Бүгін қандай таңдауда арыма сай әрекет еттім?"],
    practice: "Бір ұсақ, бірақ адал қадам жаса (қате болса мойында).",
    tags: ["ар", "этика"],
  },
  {
    id: "tartip",
    title: "Тәртіп — ерік жаттығуы",
    quote: "«Талап, еңбек, терең ой, қанағат, рақым — ойлап қой.»",
    idea: "Бес қағида — өмірлік бағдаршам.",
    questions: ["Қайсысы маған қазір ең қажет?", "Бір апта қалай жаттықтырам?"],
    practice: "Бүгін 10 минут «терең ойға» уақыт белгіле.",
    tags: ["тәртіп", "бес-қағида"],
  },
  {
    id: "razymyn",
    title: "Қанағат және ризашылық",
    quote: "«Қанағат — қарын тойғызар.»",
    idea: "Ризашылық — жетіспеушіліктен молшылық санасына көшу.",
    questions: ["Бүгін нені бағаладым?", "Қандай молшылық барын байқадым?"],
    practice: "3 нәрсеге алғыс жаз.",
    tags: ["қанағат", "ризашылық"],
  },
];

/* ===================== САҚТАУ ===================== */
const NOTES_KEY = "thinkhub_notes_v1";
const DONE_KEY  = "thinkhub_done_v1";

const load = (k, def) => {
  try { return JSON.parse(localStorage.getItem(k) || JSON.stringify(def)); }
  catch { return def; }
};
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));

/* ===================== КОМПОНЕНТ ===================== */
export default function ThinkHub() {
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(null); // insight object
  const [notes, setNotes] = React.useState(() => load(NOTES_KEY, {}));
  const [done, setDone]   = React.useState(() => load(DONE_KEY, {}));
  const [tag, setTag]     = React.useState("барлығы");

  const tags = React.useMemo(() => {
    const all = new Set(["барлығы"]);
    INSIGHTS.forEach(i => i.tags.forEach(t => all.add(t)));
    return [...all];
  }, []);

  const todayIndex = new Date().getDate() % INSIGHTS.length;
  const today = INSIGHTS[todayIndex];

  const filtered = INSIGHTS.filter(i => {
    const q = query.trim().toLowerCase();
    const hitText = !q || [i.title, i.quote, i.idea, ...i.questions, i.practice].join(" ").toLowerCase().includes(q);
    const hitTag  = tag === "барлығы" || i.tags.includes(tag);
    return hitText && hitTag;
  });

  const open = (i) => setActive(i);
  const close = () => setActive(null);

  const toggleDone = (id) => {
    setDone(prev => {
      const next = { ...prev, [id]: !prev[id] };
      save(DONE_KEY, next);
      return next;
    });
  };

  const saveNote = (id, text) => {
    setNotes(prev => {
      const next = { ...prev, [id]: text };
      save(NOTES_KEY, next);
      return next;
    });
  };

  const exportJSON = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      notes, done,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `abai-insight-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl md:text-4xl font-extrabold text-slate-900"
      >
        Abai Insight (SQ) — <span className="text-[#f59e0b]">ThinkHub</span>
      </motion.h1>
      <p className="mt-2 text-slate-600">
        Қысқа трактаттар, сұрақтар және күнделікті «практика». Жауаптар жергілікті түрде сақталады.
      </p>

      {/* Today */}
      <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/70 flex items-center justify-center">🌞</div>
          <div className="flex-1">
            <div className="font-bold text-amber-900">Бүгінгі ой:</div>
            <div className="mt-1 text-amber-900/90">{today.quote}</div>
            <button
              className="mt-2 rounded-xl bg-amber-500 text-white px-3 py-2 text-sm font-semibold"
              onClick={() => open(today)}
            >
              Оқуды бастау
            </button>
          </div>
          <button
            onClick={exportJSON}
            className="ml-auto rounded-xl border border-amber-300 px-3 py-2 text-sm font-semibold"
          >
            JSON экспорт
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Іздеу: әділет, еңбек, білім…"
          className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-amber-500/60"
        />
        <select
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          className="rounded-xl border border-slate-300 px-4 py-3"
        >
          {tags.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <div className="flex items-center text-sm text-slate-600">
          Таңдаулы инсайттар: <b className="ml-1">{Object.values(done).filter(Boolean).length}</b> / {INSIGHTS.length}
        </div>
      </div>

      {/* Grid */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(i => (
          <button
            key={i.id}
            onClick={() => open(i)}
            className={`text-left rounded-2xl border border-slate-200 bg-white p-5 shadow hover:-translate-y-0.5 hover:shadow-lg transition group`}
          >
            <div className="rounded-xl bg-gradient-to-r from-amber-100 to-orange-100 p-3 w-12 h-12 flex items-center justify-center">✨</div>
            <h3 className="mt-3 text-lg font-bold text-slate-900">{i.title}</h3>
            <p className="text-sm text-slate-500 line-clamp-2">{i.quote}</p>
            {done[i.id] && (
              <div className="mt-2 text-emerald-700 text-xs font-medium">✓ Орындалды/оқылды</div>
            )}
          </button>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {active && (
          <motion.div
            key={active.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-end md:items-center justify-center p-4"
            onClick={close}
          >
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="relative max-h-[90vh] w-full md:w-[760px] rounded-2xl bg-white p-6 shadow-xl overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-xl">📖</div>
                <div className="min-w-0">
                  <h3 className="text-xl font-bold text-slate-900">{active.title}</h3>
                  <p className="text-slate-600 text-sm">{active.tags.join(" • ")}</p>
                </div>
                <button
                  onClick={() => toggleDone(active.id)}
                  className={`ml-auto rounded-xl px-3 py-2 text-sm font-semibold ${
                    done[active.id] ? "bg-emerald-600 text-white" : "border border-slate-300"
                  }`}
                >
                  {done[active.id] ? "Белгіленді ✓" : "Белгілеу"}
                </button>
              </div>

              <blockquote className="mt-4 p-4 rounded-xl bg-slate-50 text-slate-800 text-sm">
                {active.quote}
              </blockquote>

              <div className="mt-3 text-slate-800">{active.idea}</div>

              <div className="mt-4 space-y-2">
                {active.questions.map((q, idx) => (
                  <p key={idx} className="text-slate-700 text-sm">• {q}</p>
                ))}
              </div>

              <div className="mt-3 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3">
                <b>Практика:</b> {active.practice}
              </div>

              <div className="mt-4">
                <label className="text-sm font-semibold text-slate-700">Жеке жазбаң:</label>
                <textarea
                  rows={6}
                  value={notes[active.id] || ""}
                  onChange={(e) => saveNote(active.id, e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-500/60"
                  placeholder="Ойыңды осында жаз…"
                />
              </div>

              <div className="mt-3 flex justify-end">
                <button onClick={close} className="rounded-xl border border-slate-300 px-4 py-2 font-semibold">
                  Жабу
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
