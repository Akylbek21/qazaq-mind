import React from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ===================== ДЕРЕК: ТАПСЫРМАЛАР ===================== */
// Икон/түстер тек визуалға; қалағаныңша өзгерте бер
const TASKS = [
  {
    id: "to-mom",
    icon: "🩵",
    title: "Анама жылы сөз",
    goal: "Мейірім мен ризашылықты сөзбен жеткізу.",
    prompts: [
      "Анашым, сенің маған үйреткен ең құнды сабағың…",
      "Мен анамды не үшін жақсы көремін?",
      "Сенің сөзің анаңа не сыйлай алады деп ойлайсың?"
    ],
    color: "from-pink-100 to-blue-100",
  },
  {
    id: "to-dad",
    icon: "💙",
    title: "Әкеме айтқым келген сөз",
    goal: "Ер адамға деген сенім мен құрмет сезімін нығайту.",
    prompts: [
      "Әке, мен сені мақтан етем, себебі…",
      "Мен саған айтқым келетін, бірақ айта алмай жүрген сөзім…",
      "Сенің сөзіңді естігенде әкең не сезінеді деп ойлайсың?"
    ],
    color: "from-blue-100 to-sky-100",
  },
  {
    id: "to-teacher",
    icon: "💚",
    title: "Ұстазыма рахмет",
    goal: "Алғыс айту мәдениеті мен эмоциялық сауат.",
    prompts: [
      "Менің ұстазымнан үйренген ең маңызды 3 нәрсе…",
      "Ұстазым менің өмірімде не өзгертті?",
      "Алғысым қандай түспен бейнеленеді?"
    ],
    color: "from-emerald-100 to-emerald-50",
  },
  {
    id: "self-listen",
    icon: "🧡",
    title: "Мен өзімді тыңдаймын",
    goal: "Өзін-өзі тану және ішкі рефлексия.",
    prompts: [
      "Қазір мен не сезіп тұрмын?",
      "Көңіл-күйім қандай иіс, түс немесе дыбыс?",
      "Өзіме қандай жақсы сөз айта аламын?"
    ],
    color: "from-orange-100 to-amber-100",
  },
  {
    id: "to-friend",
    icon: "💛",
    title: "Досыма жылы сөз",
    goal: "Әлеуметтік байланыстар мен эмпатия.",
    prompts: [
      "Мен сенімен дос болғаныма қуаныштымын, өйткені…",
      "Сенің қандай қасиетің маған үлгі болады?",
      "Егер сен ренжіп тұрсаң, мен не айтар едім?"
    ],
    color: "from-yellow-100 to-lime-100",
  },
  {
    id: "to-nature",
    icon: "💜",
    title: "Мен табиғатқа айтам",
    goal: "Табиғатпен эмоционалды байланыс.",
    prompts: [
      "Табиғат ана, мен сенен кешірім сұраймын, себебі…",
      "Мен сенің әсемдігіңді сезген сәтім…",
      "Табиғатқа қандай жақсылық жасай аламын?"
    ],
    color: "from-purple-100 to-fuchsia-100",
  },
  {
    id: "to-future",
    icon: "❤️",
    title: "Болашағыма хат",
    goal: "Мақсат қалыптастыру және позитивті болашақ көру.",
    prompts: [
      "Болашақтағы мен, сен неге қол жеткіздің?",
      "Саған қазірден не айтқым келеді?",
      "Бүгінгі арманым ертеңгі өміріммен қалай байланысады?"
    ],
    color: "from-rose-100 to-rose-50",
  },
  {
    id: "to-society",
    icon: "🤍",
    title: "Қоғамға үндеу",
    goal: "Азаматтық сана және әлеуметтік жауапкершілік.",
    prompts: [
      "Менің қоғамым қандай болғанын қалаймын?",
      "Егер әлемді өзгерткім келсе, неден бастар едім?",
      "Менің сөзім адамдарға қандай үміт сыйлай алады?"
    ],
    color: "from-slate-100 to-slate-50",
  },
  {
    id: "color-of-feeling",
    icon: "💫",
    title: "Менің сезімімнің түсі",
    goal: "Эмоцияны визуализациялау және шығармашылық сөйлеу.",
    prompts: [
      "Бүгінгі көңіл-күйімнің түсі…",
      "Қай кезде ол түс өзгереді?",
      "Ол түс сөйлесе, маған не айтар еді?"
    ],
    color: "from-cyan-100 to-sky-100",
  },
  {
    id: "thanks-marathon",
    icon: "🕊️",
    title: "“Рахмет” марафоны",
    goal: "Күнделікті позитивті қарым-қатынас.",
    prompts: [
      "Бүгін мен кімге, не үшін алғыс айттым?",
      "Апта соңында: алғыс айтқанда өзімді қалай сезіндім?"
    ],
    color: "from-teal-100 to-teal-50",
  },
  {
    id: "wins-and-mistakes",
    icon: "💬",
    title: "Қателіктерім мен жетістіктеріме сөз",
    goal: "Өзін кінәламай, дамуға бағыттау.",
    prompts: [
      "Биылғы ең үлкен жетістігім…",
      "Ең үлкен сабағым/қателігім және одан не үйрендім?",
      "Өзімді қалай кешірем?"
    ],
    color: "from-indigo-100 to-indigo-50",
  },
  {
    id: "small-happiness",
    icon: "🌱",
    title: "Менің кішкентай бақыттарым",
    goal: "Рақмет айту және позитивті ойлау.",
    prompts: [
      "Мені бүгін не қуантты?",
      "Мен үшін бақыт деген не?",
      "Бақытты күн қандай?"
    ],
    color: "from-green-100 to-emerald-50",
  },
  {
    id: "one-word",
    icon: "🔮",
    title: "Егер әлемге бір сөз айта алсам…",
    goal: "Өмірге көзқарас пен мағынаны ашу.",
    prompts: ["Мен әлемге бір ғана сөз айта алсам, ол сөз…"],
    color: "from-violet-100 to-violet-50",
  },

  // ==== Қосымша “Бала сезіне алатын” сериясы ====
  {
    id: "name-feelings",
    icon: "🧩",
    title: "Эмоцияны атау және сипаттау",
    goal: "Эмоцияны сөзбен анықтап, түсіну.",
    prompts: [
      "Күнделікті өмірден бір жағдай жаз: сол кезде қандай сезім болды?",
      "Эмоцияны 3 сөзбен сипатта (мыс: қуаныш, жылы, еркіндік)."
    ],
    color: "from-amber-100 to-orange-100",
  },
  {
    id: "feelings-map",
    icon: "🗺️",
    title: "Сезім картасын толтыру",
    goal: "Сезім деңгейін және денедегі орнын сезіну.",
    prompts: [
      "Бүгінгі ең күшті 3 сезіміңді белгіле.",
      "Әр сезім денеде қай жерде сезіледі?",
      "Неге солай сезіндің?"
    ],
    color: "from-lime-100 to-lime-50",
  },
  {
    id: "daily-essay",
    icon: "📝",
    title: "«Менің күнделікті сезімім» эссесі",
    goal: "Өзін-өзі түсіну және сөйлеу дағдысы.",
    prompts: [
      "Бүгін қалай сезіндің? 5–7 сөйлем жаз.",
      "Себебі қандай? Саған қалай әсер етті?"
    ],
    color: "from-zinc-100 to-zinc-50",
  },
  {
    id: "thought-vs-feeling",
    icon: "🔍",
    title: "Сезім мен ой — айырмашылығын тап",
    goal: "Ой мен сезімді ажырату.",
    prompts: [
      "Қайсысы сезім, қайсысы ой? — «Мен бүгін шаршадым.» / «Меніңше, сабақ қиын.» / «Мен қорықтым.» / «Келесі жолы жақсы істеймін деп ойлаймын.»"
    ],
    color: "from-yellow-100 to-rose-100",
  },
  {
    id: "dialog-with-feeling",
    icon: "💭",
    title: "Сезіммен диалог",
    goal: "Эмоцияларды қабылдау және өңдеу.",
    prompts: [
      "«Қорқыныш» немесе «Реніш» сезіміне хат жаз.",
      "Онымен қалай жұмыс істейсің және қалай жеңесің?"
    ],
    color: "from-sky-100 to-cyan-100",
  },
  {
    id: "feeling-colors",
    icon: "🎨",
    title: "Сезім түстері",
    goal: "Эмоцияны визуализациялау.",
    prompts: [
      "Негізгі сезімдерге (қуаныш, қайғы, ашу, қорқыныш, таңданыс) түс таңдап, суретте немесе сипатта.",
      "Қай түс көңіл-күйіңді қалай өзгертеді?"
    ],
    color: "from-fuchsia-100 to-pink-100",
  },
  {
    id: "feeling-reasons",
    icon: "🧠",
    title: "Сезімнің себебі",
    goal: "Сезімді себептерімен байланыстыру.",
    prompts: [
      "Күнделікті бірнеше жағдай жаз: «Мен қалай реакция жасадым?»",
      "Сосын «Неге осылай сезіндім?» деп талда."
    ],
    color: "from-stone-100 to-stone-50",
  },
  {
    id: "relax-breath",
    icon: "🫁",
    title: "Релаксация және тыныс",
    goal: "Сезімдерді бақылау, тыныс әдiстері.",
    prompts: [
      "Терең дем ал — баяу шығар. Жаттығудан кейінгі сезіміңді жаз.",
      "Алғашқы сезіммен салыстыр."
    ],
    color: "from-teal-100 to-emerald-100",
  },
];

/* ===================== КӨМЕКШІ: ЖЕРГІЛІКТІ САҚТАУ ===================== */
const STORAGE_KEY = "realtalktime_answers_v1";
function loadAll() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); }
  catch { return {}; }
}
function saveOne(id, text) {
  const all = loadAll();
  all[id] = { text, updatedAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

/* ===================== UI КОМПОНЕНТ ===================== */
export default function RealTalkTime() {
  const [active, setActive] = React.useState(null); // task object or null
  const [draft, setDraft] = React.useState("");
  const [savedMap, setSavedMap] = React.useState(() => loadAll());
  const [query, setQuery] = React.useState("");

  const openTask = (t) => {
    const prev = savedMap?.[t.id]?.text || "";
    setDraft(prev);
    setActive(t);
  };
  const closeTask = () => setActive(null);

  const onSave = () => {
    if (!active) return;
    saveOne(active.id, draft);
    setSavedMap(loadAll());
  };

  const filtered = TASKS.filter(
    (t) =>
      t.title.toLowerCase().includes(query.toLowerCase()) ||
      t.prompts.some((p) => p.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="text-3xl md:text-4xl font-extrabold text-slate-900 text-center"
      >
        SeLFtALK (EQ) —{" "}
        <span className="text-[#1F7A8C]">«СӨЙЛЕ, СЕЗІН, БӨЛІС»</span>
      </motion.h1>
      <p className="mt-2 text-center text-slate-600">
        Сезімге негізделген сөйлету тапсырмалары. Карточканы ашып, сұрақтарға жауап жаз.
        Жауаптар құрылғыңда <strong>жергілікті түрде сақталады</strong>.
      </p>

      {/* Search */}
      <div className="mt-6 flex justify-center">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Іздеу: «ана», «қоғам», «тыныс»…"
          className="w-full md:w-2/3 rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500/60"
        />
      </div>

      {/* Grid */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((t) => {
          const saved = savedMap?.[t.id]?.text?.trim();
          return (
            <button
              key={t.id}
              onClick={() => openTask(t)}
              className={`text-left rounded-2xl border border-slate-200 bg-white/80 backdrop-blur p-5 shadow hover:-translate-y-0.5 hover:shadow-lg transition group`}
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

      {/* Drawer / Modal */}
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
                <label className="text-sm font-semibold text-slate-700">
                  Жауабың:
                </label>
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={6}
                  className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500/60"
                  placeholder="Осы жерге жазыңыз…"
                />
                <div className="mt-2 flex flex-wrap gap-3">
                  <button
                    onClick={onSave}
                    className="rounded-xl bg-[#1aa6b5] text-white font-semibold px-4 py-2 hover:opacity-95"
                  >
                    Сақтау
                  </button>
                  <button
                    onClick={closeTask}
                    className="rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Жабу
                  </button>
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-500">
                Кеңес: дауыстық жауап жазғың келсе, телефон диктовкасын қолдан.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
