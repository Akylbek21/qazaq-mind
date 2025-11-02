// src/pages/AtaLink.jsx
import React from "react";
import { motion } from "framer-motion";
import {
  fetchAtaArticles,
  fetchAtaArticle,
  fetchAtaArticleQuestions,
  submitAtaAnswer,
  fetchAtaArticleSummary,
  _utils as ATA,
} from "../api/atalink";

/* ===================== PERSIST KEYS ===================== */
const QUIZ_KEY = "atalink_quiz_stats_v1";
const TAB_KEY  = "atalink_active_tab_v1";
const ART_KEY  = "atalink_active_article_v1";

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
/* очень простой markdown→html (только **bold** и переносы) */
function mdToHtml(md = "") {
  let html = String(md || "");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\n/g, "<br/>");
  return html;
}

/* ===================== DATA (локальные секции остаются) ===================== */
const QUICK_TIPS = [ /* ... как у тебя было ... */ {
  title: "1) Сүйіспеншілік пен қолдау",
  bullets: [
    "«Сен маған маңыздысың», «Саған сенемін» деп күн сайын айту.",
    "Іс-әрекетпен көрсету: уақыт бөлу, бірге ойнау.",
    "Баланы емес, әрекетін талқылау: «Бұл ісің дұрыс болмады».",
  ],
}, /* остальные элементы без изменений */ ];

const VIDEO_URLS = [
  "https://www.youtube.com/watch?v=BcusHhHa3DE",
  "https://www.youtube.com/watch?v=Ph4V60tlf4o",
  "https://www.youtube.com/watch?v=4sXBoarWHbA",
  "https://www.youtube.com/watch?v=iC1X6dGuARY",
];

const LAWS = [ /* твои карточки законов — без изменений */ ];

/* Локальный QUIZ — теперь только как fallback, если API недоступен */
const LOCAL_QUIZ = [ /* твои 10 вопросов как было */ ];

/* ===================== MAIN ===================== */
export default function AtaLink() {
  /* -------- tabs -------- */
  const [tab, setTab] = React.useState(() => load(TAB_KEY, "tips"));
  React.useEffect(() => save(TAB_KEY, tab), [tab]);

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  /* -------- server articles -------- */
  const [articles, setArticles] = React.useState([]);
  const [articleId, setArticleId] = React.useState(() => load(ART_KEY, null));
  const [article, setArticle] = React.useState(null);
  const [artLoading, setArtLoading] = React.useState(false);
  const [artErr, setArtErr] = React.useState("");

  /* -------- server quiz -------- */
  const [srvQuestions, setSrvQuestions] = React.useState([]); // [{id,prompt,options}]
  const [srvLoading, setSrvLoading] = React.useState(false);
  const [srvErr, setSrvErr] = React.useState("");

  const [quizStep, setQuizStep] = React.useState(0); // 0=intro, 1..N, done=N+1
  const [answers, setAnswers] = React.useState({});  // index -> optionIndex
  const [quizStats, setQuizStats] = React.useState(() =>
    load(QUIZ_KEY, { attempts: 0, best: 0, last: 0 })
  );

  const isServerMode = srvQuestions.length > 0 || articleId != null;
  const total = isServerMode ? srvQuestions.length : LOCAL_QUIZ.length;

  const scoreLocal = Object.entries(answers).reduce((a, [i, v]) =>
    a + (LOCAL_QUIZ[+i]?.correct === v ? 1 : 0), 0);

  /* Итоги сервера */
  const [srvSubmitting, setSrvSubmitting] = React.useState(false);
  const [srvSummary, setSrvSummary] = React.useState(null); // {total, correct}
  const [srvSubmitErr, setSrvSubmitErr] = React.useState("");

  /* -------- load articles on mount -------- */
  React.useEffect(() => {
    let ignore = false;
    (async () => {
      setArtLoading(true); setArtErr("");
      try {
        const list = await fetchAtaArticles();
        if (ignore) return;
        setArticles(list);
        // выбрать активную: сохранённую или первую
        const nextId = articleId ?? list[0]?.id ?? null;
        setArticleId(nextId);
        if (nextId) save(ART_KEY, nextId);
      } catch (e) {
        if (ignore) return;
        setArtErr(e?.message || "Мақалалар жүктелмеді (құқық/желіні тексеріңіз).");
      } finally {
        if (!ignore) setArtLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, []); // один раз

  /* -------- load selected article & questions -------- */
  React.useEffect(() => {
    let ignore = false;
    if (!articleId) { setArticle(null); setSrvQuestions([]); return; }

    (async () => {
      setSrvErr(""); setSrvSummary(null);
      try {
        const art = await fetchAtaArticle(articleId);
        if (ignore) return;
        setArticle(art);
      } catch (e) {
        if (ignore) return;
        setArticle(null);
        setSrvErr(e?.message || "Мақала алынбады.");
      }

      try {
        setSrvLoading(true);
        const qs = await fetchAtaArticleQuestions(articleId);
        if (ignore) return;
        setSrvQuestions(qs);
      } catch (e) {
        if (ignore) return;
        setSrvQuestions([]);
        setSrvErr(e?.message || "Сұрақтар жүктелмеді.");
      } finally {
        if (!ignore) setSrvLoading(false);
      }
    })();

    return () => { ignore = true; };
  }, [articleId]);

  /* -------- quiz helpers -------- */
  const quizStart = () => { setQuizStep(1); setAnswers({}); setSrvSummary(null); setSrvSubmitErr(""); };
  const quizPick  = (idx, optIdx) => setAnswers(p => ({ ...p, [idx]: optIdx }));
  const quizNext  = () => {
    if (quizStep < total) setQuizStep(quizStep + 1);
    else finishQuiz();
  };
  const quizRestart = () => { setQuizStep(0); setAnswers({}); setSrvSummary(null); setSrvSubmitErr(""); };

  async function finishQuiz() {
    setQuizStep(total + 1);

    // локальная статистика (для локального теста)
    if (!isServerMode) {
      const attempts = (quizStats.attempts || 0) + 1;
      const best = Math.max(quizStats.best || 0, scoreLocal);
      const next = { attempts, best, last: scoreLocal, lastAt: Date.now() };
      setQuizStats(next); save(QUIZ_KEY, next);
      return;
    }

    // серверный подсчёт: отправляем ответы + снимаем summary
    if (!articleId || srvQuestions.length === 0) return;

    setSrvSubmitting(true); setSrvSubmitErr(""); setSrvSummary(null);
    try {
      // отправка каждого ответа
      const jobs = srvQuestions.map((q, i) => {
        const choiceIdx = answers[i];
        const letter = ATA.toLetterByIndex(choiceIdx);
        if (!letter) return null;
        return submitAtaAnswer({ questionId: q.id, chosen: letter });
      }).filter(Boolean);

      await Promise.allSettled(jobs);
      const sum = await fetchAtaArticleSummary(articleId);
      setSrvSummary({ total: Number(sum?.total ?? srvQuestions.length), correct: Number(sum?.correct ?? 0) });
    } catch (e) {
      setSrvSubmitErr(e?.message || "Серверлік қорытындыны алу мүмкін болмады.");
      setSrvSummary(null);
    } finally {
      setSrvSubmitting(false);
    }
  }

  /* -------- videos embeds -------- */
  const embeds = VIDEO_URLS.map(toYouTubeEmbed).filter(Boolean);

  return (
    <motion.div 
      className="min-h-screen bg-slate-50"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
    >
      <div className="container mx-auto max-w-6xl px-4 py-10">
        <motion.div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold">
            <span className="bg-gradient-to-r from-[#f59e0b] to-[#f97316] bg-clip-text text-transparent">
              AtaLink
            </span>
          </h1>
          <p className="mt-4 text-slate-600">
            Ата-анамен байланыс платформасы: кеңестер, тесттер, видео материалдар және заң ақпараты
          </p>
        </motion.div>
      <p className="mt-2 text-slate-600">
        Мақалалар мен тесттер енді серверден жүктеледі. Қажет болса — локалдық режимге автоматты түрде ауысады.
      </p>

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap gap-2">
        {[
          ["tips",   "Кеңестер"],
          ["quiz",   "Тест (мақала)"],
          ["videos", "Видеолар"],
          ["laws",   "Заңнама"],
        ].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-3 py-2 rounded-xl border text-sm font-semibold ${
              tab === key ? "bg-amber-500 text-white border-amber-500" : "border-slate-300"
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* ============== TAB: TIPS ============== */}
      {tab === "tips" && (
        <div className="mt-6 grid gap-4">
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
          </div>
        </div>
      )}

      {/* ============== TAB: QUIZ (SERVER-FIRST) ============== */}
      {tab === "quiz" && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="font-bold text-slate-900">Тест: мақаланы таңдаңыз да, сұрақтарға жауап беріңіз</h3>

          {/* Выбор статьи */}
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div>
              <label className="block text-sm text-slate-600 mb-1">Мақала</label>
              <select
                value={articleId ?? ""}
                onChange={(e) => { const v = e.target.value ? Number(e.target.value) : null; setArticleId(v); save(ART_KEY, v); setQuizStep(0); setAnswers({}); setSrvSummary(null); }}
                className="w-full rounded-xl border px-3 py-2"
              >
                <option value="">— таңдалмаған —</option>
                {articles.map((a) => (
                  <option key={a.id} value={a.id}>{a.title}</option>
                ))}
              </select>
              {artLoading && <div className="mt-1 text-sm text-slate-500">Мақалалар жүктелуде…</div>}
              {artErr && <div className="mt-1 text-sm text-rose-600">{artErr}</div>}
            </div>

            {/* Короткая сводка статьи */}
            <div className="rounded-xl border border-slate-200 p-3">
              <div className="text-sm text-slate-600">Қысқаша</div>
              <div className="mt-1 text-slate-900 font-medium">{article?.title || "—"}</div>
              {article?.summary && <div className="mt-1 text-sm text-slate-700">{article.summary}</div>}
            </div>
          </div>

          {/* Контент статьи (markdown) */}
          {article?.contentMarkdown && (
            <div className="mt-4 rounded-xl border border-slate-200 p-3 bg-white">
              <div className="text-sm text-slate-600 mb-1">Мазмұны</div>
              <div
                className="prose prose-sm max-w-none text-slate-800"
                dangerouslySetInnerHTML={{ __html: mdToHtml(article.contentMarkdown) }}
              />
            </div>
          )}

          {/* Intro */}
          {quizStep === 0 && (
            <div className="mt-4">
              <div className="text-slate-600 text-sm">
                {isServerMode
                  ? "Мақаланы таңдағаннан кейін «Тесті бастау» батырмасын басыңыз."
                  : "Сервер қолжетімсіз — локалдық тестке ауыстық."}
              </div>
              <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-600">
                <div className="rounded-xl border p-3">Соңғы ұпай: <b>{quizStats.last ?? 0}</b> / {LOCAL_QUIZ.length}</div>
                <div className="rounded-xl border p-3">Ең үздік нәтиже: <b>{quizStats.best ?? 0}</b> / {LOCAL_QUIZ.length}</div>
                <div className="rounded-xl border p-3">Талпыныс саны: <b>{quizStats.attempts ?? 0}</b></div>
              </div>
              <button
                onClick={quizStart}
                disabled={isServerMode && (!articleId || srvLoading || srvQuestions.length === 0)}
                className="mt-3 px-4 py-2 rounded-xl bg-amber-500 text-white font-semibold disabled:opacity-40"
              >
                Тесті бастау
              </button>
              {srvErr && <div className="mt-2 text-sm text-rose-600">{srvErr}</div>}
            </div>
          )}

          {/* Вопросы */}
          {quizStep > 0 && quizStep <= total && (
            <div className="mt-4">
              <div className="text-sm text-slate-600">Сұрақ {quizStep}/{total}</div>
              <div className="mt-2 font-semibold text-slate-900">
                {isServerMode ? (srvQuestions[quizStep - 1]?.prompt || "") : (LOCAL_QUIZ[quizStep - 1].q)}
              </div>
              <div className="mt-3 grid gap-2">
                {(isServerMode ? (srvQuestions[quizStep - 1]?.options || []) : LOCAL_QUIZ[quizStep - 1].options).map((opt, i) => {
                  const checked = answers[quizStep - 1] === i;
                  return (
                    <button
                      key={i}
                      onClick={() => quizPick(quizStep - 1, i)}
                      className={`text-left rounded-xl border px-4 py-3 transition ${
                        checked ? "border-amber-500 bg-amber-50" : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {isServerMode ? opt : opt}
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
                  {quizStep < total ? "Келесі" : "Нәтижені көру"}
                </button>
              </div>
            </div>
          )}

          {/* Результат */}
          {quizStep === total + 1 && (
            <div className="mt-4">
              {isServerMode ? (
                <>
                  {srvSubmitting && <div className="text-sm text-slate-600">Серверден тексеру…</div>}
                  {srvSubmitErr && <div className="text-sm text-rose-600">{srvSubmitErr}</div>}
                  <div className="text-xl font-bold text-slate-900">
                    Нәтиже: {srvSummary?.correct ?? 0} / {srvSummary?.total ?? total}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-xl font-bold text-slate-900">
                    Нәтиже: {scoreLocal} / {LOCAL_QUIZ.length}
                  </div>
                  <p className="mt-1 text-slate-700">
                    {scoreLocal <= 4
                      ? "Базалық түсініктер қалыптасқан. Кеңестерді қарап шығыңыз."
                      : scoreLocal <= 8
                      ? "Жақсы! Тыңдау мен сенімге мән беріңіз."
                      : "Керемет! Үлгілік тәрбие — осы қарқынмен жалғастырыңыз."}
                  </p>
                </>
              )}

              {/* Review для локального (для сервера ответа «правильный» бэк хранит сам) */}
              {!isServerMode && (
                <div className="mt-4 grid gap-3">
                  {LOCAL_QUIZ.map((qq, idx) => {
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
              )}

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
            {embeds.map((src, i) => (
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
    </motion.div>
  );
}
