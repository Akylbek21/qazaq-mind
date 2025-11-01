// src/pages/AtaLink.jsx
import React from "react";
import { motion } from "framer-motion";

/* ===================== PERSIST KEYS ===================== */
const QUIZ_KEY = "atalink_quiz_stats_v1";
const TAB_KEY  = "atalink_active_tab_v1";

/* ===================== HELPERS ===================== */
function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || "null") ?? fallback; }
  catch { return fallback; }
}
function save(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

/* YouTube → embed */
function toYouTubeEmbed(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
    }
    if (u.hostname === "youtu.be") {
      const id = u.pathname.slice(1);
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
  } catch {}
  return null;
}

/* ===================== DATA ===================== */
/* Кеңестер (қысқаша ТОП-10) */
const QUICK_TIPS = [
  {
    title: "1) Сүйіспеншілік пен қолдау",
    bullets: [
      "«Сен маған маңыздысың», «Саған сенемін» деп күн сайын айту.",
      "Іс-әрекетпен көрсету: уақыт бөлу, бірге ойнау.",
      "Баланы емес, әрекетін талқылау: «Бұл ісің дұрыс болмады».",
    ],
  },
  {
    title: "2) Тәртіп пен талап",
    bullets: [
      "Тұрақты режим: ұйқы/оқу/демалыс уақыты.",
      "Тыйымның себебін түсіндіру.",
      "«Жоқ» — сирек, орнымен.",
    ],
  },
  {
    title: "3) Тыңдай білу",
    bullets: [
      "Бөліп жібермей, соңына дейін тыңдау.",
      "Алдымен пікірін сыйлау, кейін түсіндіру.",
      "Күнде 10–15 мин тек сөйлесу (экрансыз).",
    ],
  },
  {
    title: "4) Үлгі болу",
    bullets: [
      "Бала — сіздің әрекеттіңізді көшіреді.",
      "Сыпайылық пен сабырды алдымен өзіңіз көрсетіңіз.",
      "Қиын сәттердегі мінез — ең үлкен сабақ.",
    ],
  },
  {
    title: "5) Ойлау және жауапкершілік",
    bullets: [
      "Кішкентай міндеттер: бөлме, сөмке.",
      "Таңдау беру: «Қай киімді киесің?».",
      "Қателікті бірге талқылау — үйрену мүмкіндігі.",
    ],
  },
  {
    title: "6) Салыстырмау",
    bullets: [
      "Басқамен салыстыру — сенімсіздік тудырады.",
      "Өз прогресімен салыстыру: «Кеше жақсы істедің…».",
    ],
  },
  {
    title: "7) Оқу мен еңбек маңызы",
    bullets: [
      "Оқу — өмірге дайындық.",
      "Жетістікке бірге қуанайық.",
      "Қиындықта қолдау: «Қолыңнан келеді».",
    ],
  },
  {
    title: "8) Бірге уақыт",
    bullets: [
      "Апталық отбасылық кеш: ойын/серуен/фильм.",
      "Экранды шетке қою — ең үлкен сыйлық.",
    ],
  },
  {
    title: "9) Эмоцияны басқару",
    bullets: [
      "Ашуды басқарудың үлгісі.",
      "Эмоцияны тану: «Қазір ренжулі екенсің…».",
    ],
  },
  {
    title: "10) Сенім мен махаббат",
    bullets: [
      "Қорықпай сырын айта алатын орта.",
      "Сенім бар жерде түсіністік те бар.",
    ],
  },
];

/* Тест (10 сұрақ) */
const QUIZ = [
  {
    q: "1. Бала тәрбиесіндегі ең басты нәрсе не?",
    options: ["A) Тәртіп пен жазалау", "B) Сүйіспеншілік пен түсіністік", "C) Үнемі бақылау"],
    correct: 1,
  },
  {
    q: "2. Бала қателік жасаса, ата-ананың дұрыс әрекеті?",
    options: ["A) Бірден ұрысу", "B) Қателігін түсіндіру және сабырмен сөйлесу", "C) Елемеу"],
    correct: 1,
  },
  {
    q: "3. Бала өз ойын айтқанда, ата-ана не істеуі керек?",
    options: ["A) Бірден түзету", "B) Тыңдап, пікірін сыйлау", "C) «Үлкендер жақсы біледі» деу"],
    correct: 1,
  },
  {
    q: "4. Балаға сенім арту нені білдіреді?",
    options: ["A) Барлығын еркіне беру", "B) Бақылаусыз қалдыру", "C) Қабілетіне, сөзіне, шешіміне сену"],
    correct: 2,
  },
  {
    q: "5. Тәртіп қалыптастыруда не маңызды?",
    options: ["A) Қатал жазалау", "B) Тұрақты ережелер мен үлгі болу", "C) Тек мектепке жүктеу"],
    correct: 1,
  },
  {
    q: "6. Мадақтау не береді?",
    options: ["A) Тек қуаныш", "B) Өзіндік сенімді арттырады", "C) Еш әсері жоқ"],
    correct: 1,
  },
  {
    q: "7. Жауапкершілікті қалай үйретуге болады?",
    options: ["A) Бәрін өзіңіз жасау", "B) Кішкентай тапсырмалар беру", "C) Тек ұрысу"],
    correct: 1,
  },
  {
    q: "8. Бала ашуланғанда не істеу керек?",
    options: ["A) Айқайлау", "B) Ашу басылғанша күту", "C) Себебін сабырмен сұрау"],
    correct: 2,
  },
  {
    q: "9. Ең тиімді тәрбие тәсілі?",
    options: ["A) Өз ісіңізбен үлгі болу", "B) Қатты талап қою", "C) Мұғалімге тапсыру"],
    correct: 0,
  },
  {
    q: "10. Салыстыру салдары қандай болуы мүмкін?",
    options: ["A) Мотивация артады", "B) Сенімсіздік пен реніш тудырады", "C) Еш әсер етпейді"],
    correct: 1,
  },
];

/* Видеолар */
const VIDEO_URLS = [
  "https://www.youtube.com/watch?v=BcusHhHa3DE",
  "https://www.youtube.com/watch?v=Ph4V60tlf4o",
  "https://www.youtube.com/watch?v=4sXBoarWHbA",
  "https://www.youtube.com/watch?v=iC1X6dGuARY",
];

/* Заңнама (қысқаша карточкалар) */
const LAWS = [
  {
    title: "ӘҚБтК 127-бап — Тәрбиелеу/білім беру міндеттерін орындамау",
    points: [
      "Міндеттерді орындамау — 10 АЕК айыппұл.",
      "Қайталау (1 жыл ішінде) — 15 АЕК немесе 5 тәулікке дейін қамақ.",
      "Елеулі салдар туғызса — 20 АЕК немесе 10 тәулікке дейін.",
    ],
  },
  {
    title: "ӘҚБтК 73-бап — Отбасы-тұрмыстық қатынастардағы құқыққа қарсы әрекеттер",
    points: [
      "Былапыт сөйлеу, қорлау, заттарды бүлдіру — ескерту/20 сағ. қоғамдық жұмыс/5 тәулікке дейін.",
      "Қайталау — 40 сағ. не 10 тәулікке дейін.",
      "Кей санаттарға — 5 АЕК айыппұл.",
    ],
  },
  {
    title: "ӘҚБтК 127-2-бап — Буллинг/кибербуллинг",
    points: [
      "Ескерту немесе 10 АЕК айыппұл.",
      "Қайталау — 30 АЕК.",
      "12–16 жаста жасалса — ата-анасына ескерту не 10 АЕК.",
    ],
  },
  {
    title: "ӘҚБтК 132-бап — Кәмелетке толмағандардың түнгі уақытта ойын-сауық мекемелерінде болуы",
    points: [
      "22:00–06:00 аралығы, заңды өкілсіз — 10–50 АЕК (тіркелімге қарай).",
      "Қайталау — қызметті тоқтата тұрып, 20–100 АЕК.",
    ],
  },
  {
    title: "ӘҚБтК 133-бап — 18 жасқа толмағандардың темекі өнімдерін сатуы",
    points: [
      "Жеке — 15 АЕК, шағын — 25 АЕК, орта — 40 АЕК, ірі — 100 АЕК.",
      "Қайталау — 30/50/80/200 АЕК.",
    ],
  },
];

/* ===================== MAIN ===================== */
export default function AtaLink() {
  /* Tabs: tips | quiz | videos | laws */
  const [tab, setTab] = React.useState(() => load(TAB_KEY, "tips"));
  React.useEffect(() => save(TAB_KEY, tab), [tab]);

  /* Quiz state */
  const [quizStep, setQuizStep] = React.useState(0); // 0=intro, 1..N, done=N+1
  const [answers, setAnswers] = React.useState({});
  const [quizStats, setQuizStats] = React.useState(() => load(QUIZ_KEY, { attempts: 0, best: 0, last: 0 }));

  const quizLen = QUIZ.length;
  const score = Object.entries(answers).reduce((a, [i, v]) => a + (QUIZ[+i].correct === v ? 1 : 0), 0);

  const quizStart = () => { setQuizStep(1); setAnswers({}); };
  const quizPick  = (idx, optIdx) => setAnswers(p => ({ ...p, [idx]: optIdx }));
  const quizNext  = () => {
    if (quizStep < quizLen) setQuizStep(quizStep + 1);
    else {
      setQuizStep(quizLen + 1);
      const attempts = (quizStats.attempts || 0) + 1;
      const best = Math.max(quizStats.best || 0, score);
      const next = { attempts, best, last: score, lastAt: Date.now() };
      setQuizStats(next);
      save(QUIZ_KEY, next);
    }
  };
  const quizRestart = () => { setQuizStep(0); setAnswers({}); };

  /* Videos embeds */
  const embeds = VIDEO_URLS.map(toYouTubeEmbed).filter(Boolean);

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl md:text-4xl font-extrabold text-slate-900"
      >
        AtaLink — <span className="text-[#f59e0b]">Ата-анамен байланыс (кеңес/тест/видео/заң)</span>
      </motion.h1>
      <p className="mt-2 text-slate-600">
        Хабарлама блогы алынды. Бұл бетте — кеңестер, тест, видеолар және құқықтық анықтама. Барлығы құрылғыңызда локалды сақталады.
      </p>

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap gap-2">
        {[
          ["tips",   "Кеңестер"],
          ["quiz",   "Тест"],
          ["videos", "Видеолар"],
          ["laws",   "Заңнама"],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-3 py-2 rounded-xl border text-sm font-semibold ${
              tab === key ? "bg-amber-500 text-white border-amber-500" : "border-slate-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ============== TAB: TIPS ============== */}
      {tab === "tips" && (
        <div className="mt-6 grid gap-4">
          {/* Quick top-10 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="font-bold text-slate-900">Ата-аналарға арналған кеңестер (ТОП-10)</h3>
            <div className="mt-3 grid md:grid-cols-2 gap-3">
              {QUICK_TIPS.map((t) => (
                <div key={t.title} className="rounded-xl border border-slate-200 p-3">
                  <div className="font-semibold text-slate-900">{t.title}</div>
                  <ul className="mt-2 list-disc pl-5 text-sm text-slate-700 space-y-1">
                    {t.bullets.map((b, i) => <li key={i}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-3 text-sm text-slate-600">
              Есіңізде болсын: баланы емес, іс-әрекетті талқылаңыз. Сенім мен тұрақты режим — тәрбиенің негізі.
            </div>
          </div>

          {/* Long article in details */}
          <details className="rounded-2xl border border-slate-200 bg-white p-4">
            <summary className="cursor-pointer font-bold text-slate-900">
              Кеңейтілген нұсқа (30 бағыт) — ашу/жабу
            </summary>
            <div className="mt-3 text-sm text-slate-800 space-y-3">
              <p>
                Төменде бала тәрбиесіне қатысты кеңейтілген ұсыныстар берілген:
                махаббат пен қолдау, құрмет, үлгі, өзін-өзі бағалау, тәртіп пен шектеулер,
                жауапкершілік, оқуға қызығу, эмоциялық қолдау, белсенді тыңдау, таңдау,
                қателіктерді кешіру, жеке уақыт, өмірлік дағдылар, этика, қызығушылықтар,
                уақыт менеджменті, еркіндік-жауапкершілік тепе-теңдігі, отбасылық уақыт,
                дұрыс тамақтану мен денсаулық, шығармашылық, әлеуметтік дағдылар, эмоциялық
                интеллект, әділдік, мәдениет пен дәстүр, қауіпсіздік, жанжалдан сақтану, ең соңында — балаға уақыт бөлу.
              </p>
              <p className="text-slate-600">
                Бұл мәтінді қажет болса бөлек бетке шығарып, PDF ретінде басып шығаруға да болады.
              </p>
            </div>
          </details>
        </div>
      )}

      {/* ============== TAB: QUIZ ============== */}
      {tab === "quiz" && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="font-bold text-slate-900">Тест: “Бала тәрбиесіндегі ата-ананың рөлі”</h3>

          {quizStep === 0 && (
            <div className="mt-3">
              <p className="text-slate-600 text-sm">
                Дұрыс деп есептеген бір жауапты таңдаңыз. Соңында ұпайыңыз бен кеңес шығады.
              </p>
              <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-600">
                <div className="rounded-xl border p-3">Соңғы ұпай: <b>{quizStats.last ?? 0}</b> / {QUIZ.length}</div>
                <div className="rounded-xl border p-3">Ең үздік нәтиже: <b>{quizStats.best ?? 0}</b> / {QUIZ.length}</div>
                <div className="rounded-xl border p-3">Талпыныс саны: <b>{quizStats.attempts ?? 0}</b></div>
              </div>
              <button onClick={quizStart} className="mt-3 px-4 py-2 rounded-xl bg-amber-500 text-white font-semibold">
                Тесті бастау
              </button>
            </div>
          )}

          {quizStep > 0 && quizStep <= QUIZ.length && (
            <div className="mt-4">
              <div className="text-sm text-slate-600">Сұрақ {quizStep}/{QUIZ.length}</div>
              <div className="mt-2 font-semibold text-slate-900">{QUIZ[quizStep - 1].q}</div>
              <div className="mt-3 grid gap-2">
                {QUIZ[quizStep - 1].options.map((opt, i) => {
                  const checked = answers[quizStep - 1] === i;
                  return (
                    <button
                      key={i}
                      onClick={() => quizPick(quizStep - 1, i)}
                      className={`text-left rounded-xl border px-4 py-3 transition ${
                        checked ? "border-amber-500 bg-amber-50" : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => setQuizStep((s) => Math.max(1, s - 1))}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-semibold"
                >
                  Артқа
                </button>
                <button
                  onClick={quizNext}
                  disabled={!(quizStep - 1 in answers)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold disabled:opacity-40"
                >
                  {quizStep < QUIZ.length ? "Келесі" : "Нәтижені көру"}
                </button>
              </div>
            </div>
          )}

          {quizStep === QUIZ.length + 1 && (
            <div className="mt-4">
              <div className="text-xl font-bold text-slate-900">Нәтиже: {score} / {QUIZ.length}</div>
              <p className="mt-1 text-slate-700">
                {score <= 4
                  ? "Базалық түсініктер қалыптасқан. Кеңестер бетін қарап шығу пайдалы."
                  : score <= 8
                  ? "Жақсы! Қолдауды жүйелі жалғастырыңыз, тыңдау мен сенімге мән беріңіз."
                  : "Керемет! Үлгі түріндегі тәрбие қалыптасқан — осы қарқынмен жалғастырыңыз."}
              </p>

              {/* Review */}
              <div className="mt-4 grid gap-3">
                {QUIZ.map((qq, idx) => {
                  const your = answers[idx];
                  const ok = your === qq.correct;
                  return (
                    <div key={idx} className={`rounded-xl border p-3 ${ok ? "border-emerald-200 bg-emerald-50/60" : "border-rose-200 bg-rose-50/60"}`}>
                      <div className="font-medium text-slate-900">{qq.q}</div>
                      <div className="mt-1 text-sm">
                        Таңдалған: <b className={ok ? "text-emerald-700" : "text-rose-700"}>
                          {your != null ? qq.options[your] : "—"}
                        </b>{" "}
                        | Дұрыс: <b className="text-emerald-700">{qq.options[qq.correct]}</b>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 flex gap-3">
                <button onClick={quizStart} className="px-4 py-2 rounded-xl bg-amber-500 text-white font-semibold">Қайта өту</button>
                <button onClick={quizRestart} className="px-4 py-2 rounded-xl border border-slate-300 font-semibold">Басты экран</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============== TAB: VIDEOS ============== */}
      {tab === "videos" && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="font-bold text-slate-900">Бала тәрбиесі туралы видеолар</h3>
          <div className="mt-3 grid md:grid-cols-2 gap-4">
            {VIDEO_URLS.map(toYouTubeEmbed).filter(Boolean).map((src, i) => (
              <div key={i} className="rounded-xl overflow-hidden border border-slate-200 bg-black/5 aspect-video">
                <iframe
                  title={`video-${i}`}
                  src={src}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-slate-500">Ескерту: Видеолар YouTube платформасынан ендірілді.</div>
        </div>
      )}

      {/* ============== TAB: LAWS ============== */}
      {tab === "laws" && (
        <div className="mt-6 grid gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="font-bold text-slate-900">Ата-ана міндеттері туралы заңнамалар (қысқаша)</h3>
            <p className="mt-1 text-sm text-slate-600">
              Бұл бөлім ақпараттық сипатта. Нақты жағдайға қатысты ресми дереккөздер мен маманға жүгініңіз.
            </p>

            <div className="mt-3 space-y-3">
              {LAWS.map((l, idx) => (
                <details key={idx} className="rounded-xl border border-slate-200 p-3">
                  <summary className="cursor-pointer font-semibold text-slate-900">{l.title}</summary>
                  <ul className="mt-2 list-disc pl-5 text-sm text-slate-700 space-y-1">
                    {l.points.map((p, i) => <li key={i}>{p}</li>)}
                  </ul>
                </details>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <h4 className="font-semibold text-slate-900">Ескерту</h4>
            <p className="mt-1 text-sm text-slate-600">
              Айыппұл мөлшерлері АЕК-ке (айлық есептік көрсеткіш) байланған. АЕК жыл сайын өзгеруі мүмкін.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
