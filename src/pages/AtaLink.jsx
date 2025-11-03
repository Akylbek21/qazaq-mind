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

const QUIZ_KEY = "atalink_quiz_stats_v1";
const TAB_KEY  = "atalink_active_tab_v1";
const ART_KEY  = "atalink_active_article_v1";
function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || "null") ?? fallback; }
  catch { return fallback; }
}

function save(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

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
function mdToHtml(md = "") {
  let html = String(md || "");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\n/g, "<br/>");
  return html;
}

const QUICK_TIPS = [{
  title: "1) Сүйіспеншілік пен қолдау",
  bullets: [
    "«Сен маған маңыздысың», «Саған сенемін» деп күн сайын айту.",
    "Іс-әрекетпен көрсету: уақыт бөлу, бірге ойнау.",
    "Баланы емес, әрекетін талқылау: «Бұл ісің дұрыс болмады».",
  ],
}];

const VIDEO_URLS = [
  "https://www.youtube.com/watch?v=BcusHhHa3DE",
  "https://www.youtube.com/watch?v=Ph4V60tlf4o",
  "https://www.youtube.com/watch?v=4sXBoarWHbA",
  "https://www.youtube.com/watch?v=iC1X6dGuARY",
];

const LAWS = [];

const LOCAL_QUIZ = [];

export default function AtaLink() {
  const [tab, setTab] = React.useState(() => load(TAB_KEY, "tips"));
  React.useEffect(() => save(TAB_KEY, tab), [tab]);

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  const [articles, setArticles] = React.useState([]);
  const [articleId, setArticleId] = React.useState(() => load(ART_KEY, null));
  const [article, setArticle] = React.useState(null);
  const [artLoading, setArtLoading] = React.useState(false);
  const [artErr, setArtErr] = React.useState("");

  const [srvQuestions, setSrvQuestions] = React.useState([]);
  const [srvLoading, setSrvLoading] = React.useState(false);
  const [srvErr, setSrvErr] = React.useState("");

  const [quizStep, setQuizStep] = React.useState(0);
  const [answers, setAnswers] = React.useState({});
  const [quizStats, setQuizStats] = React.useState(() =>
    load(QUIZ_KEY, { attempts: 0, best: 0, last: 0 })
  );

  const isServerMode = srvQuestions.length > 0 || articleId != null;
  const total = isServerMode ? srvQuestions.length : LOCAL_QUIZ.length;

  const scoreLocal = Object.entries(answers).reduce((a, [i, v]) =>
    a + (LOCAL_QUIZ[+i]?.correct === v ? 1 : 0), 0);

  const [srvSubmitting, setSrvSubmitting] = React.useState(false);
  const [srvSummary, setSrvSummary] = React.useState(null);
  const [srvSubmitErr, setSrvSubmitErr] = React.useState("");

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
  }, []);

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
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="text-3xl md:text-4xl font-extrabold text-slate-900 text-center mb-2"
        >
          AtaLink
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center text-lg text-[#f59e0b] font-semibold mb-8"
        >
          Кеңестер • Тесттер • Видеолар • Заңнама
        </motion.p>

      {/* Tabs */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 flex flex-wrap gap-3 justify-center"
      >
        {[
          ["tips",   "Кеңестер"],
          ["quiz",   "Тест"],
          ["videos", "Видеолар"],
          ["laws",   "Заңнама"],
        ].map(([key, label]) => (
          <button 
            key={key} 
            onClick={() => setTab(key)}
            className={`px-5 py-2.5 rounded-xl border-2 text-sm font-bold transition-all duration-300 ${
              tab === key 
                ? "bg-gradient-to-r from-[#f59e0b] to-[#f97316] text-white border-[#f59e0b] shadow-lg scale-105" 
                : "border-slate-300 hover:border-[#f59e0b]/50 hover:bg-amber-50"
            }`}
          >
            {label}
          </button>
        ))}
      </motion.div>

      {/* TAB: TIPS */}
      {tab === "tips" && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <div className="rounded-2xl border border-slate-200/70 bg-white/90 backdrop-blur-xl p-6 shadow-[0_10px_30px_rgba(16,37,66,0.08)]">
            <h3 className="text-2xl font-extrabold text-slate-900 mb-6">Ата-аналарға арналған кеңестер</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {QUICK_TIPS.map((t, idx) => (
                <motion.div 
                  key={t.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + idx * 0.1 }}
                  className="rounded-xl border-2 border-amber-200/50 bg-gradient-to-br from-amber-50/50 to-orange-50/50 p-5 hover:border-amber-300 hover:shadow-lg transition-all duration-300"
                >
                  <div className="font-bold text-lg text-slate-900 mb-3">{t.title}</div>
                  <ul className="space-y-2 text-sm text-slate-700">
                    {t.bullets.map((b, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-600 mt-0.5">•</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB: QUIZ */}
      {tab === "quiz" && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 rounded-2xl border border-slate-200/70 bg-white/90 backdrop-blur-xl p-6 shadow-[0_10px_30px_rgba(16,37,66,0.08)]"
        >
          <h3 className="text-2xl font-extrabold text-slate-900 mb-6">Тест</h3>

          {/* Выбор статьи */}
          <div className="grid gap-4 md:grid-cols-2 mb-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Мақала таңдау</label>
              <select
                value={articleId ?? ""}
                onChange={(e) => { const v = e.target.value ? Number(e.target.value) : null; setArticleId(v); save(ART_KEY, v); setQuizStep(0); setAnswers({}); setSrvSummary(null); }}
                className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 outline-none focus:border-[#f59e0b] focus:ring-2 focus:ring-[#f59e0b]/20 transition-all duration-300"
              >
                <option value="">— Таңдаңыз —</option>
                {articles.map((a) => (
                  <option key={a.id} value={a.id}>{a.title}</option>
                ))}
              </select>
              {artLoading && (
                <div className="mt-2 flex items-center gap-2 text-slate-600 text-sm">
                  <div className="animate-spin h-4 w-4 border-2 border-[#f59e0b] border-t-transparent rounded-full"></div>
                  <span>Жүктелуде…</span>
                </div>
              )}
              {artErr && <div className="mt-2 text-sm text-rose-600 bg-rose-50 rounded-lg p-2">{artErr}</div>}
            </div>

            {/* Короткая сводка статьи */}
            <div className="rounded-xl border-2 border-amber-200/50 bg-gradient-to-br from-amber-50/50 to-orange-50/50 p-4">
              <div className="text-xs font-bold text-slate-500 mb-2">ҚЫСҚАША</div>
              <div className="text-slate-900 font-bold text-lg">{article?.title || "—"}</div>
              {article?.summary && <div className="mt-2 text-sm text-slate-700">{article.summary}</div>}
            </div>
          </div>

          {/* Контент статьи */}
          {article?.contentMarkdown && (
            <div className="mb-6 rounded-xl border-2 border-slate-200 bg-white p-5">
              <div className="text-sm font-bold text-slate-600 mb-3">МАЗМҰНЫ</div>
              <div
                className="prose prose-sm max-w-none text-slate-800 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: mdToHtml(article.contentMarkdown) }}
              />
            </div>
          )}

          {/* Intro */}
          {quizStep === 0 && (
            <div className="space-y-6">
              {isServerMode ? (
                <div className="text-slate-700 text-center py-4">
                  Мақаланы таңдағаннан кейін тестті бастаңыз
                </div>
              ) : (
                <div className="text-amber-700 bg-amber-50 rounded-xl p-4 text-center">
                  Сервер қолжетімсіз — локалдық тестке ауыстық
                </div>
              )}
              
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="rounded-xl border-2 border-slate-200 bg-white p-4 text-center">
                  <div className="text-xs text-slate-500 mb-1">Соңғы ұпай</div>
                  <div className="text-2xl font-bold text-slate-900">{quizStats.last ?? 0} / {LOCAL_QUIZ.length}</div>
                </div>
                <div className="rounded-xl border-2 border-amber-200 bg-gradient-to-br from-amber-50/50 to-orange-50/50 p-4 text-center">
                  <div className="text-xs text-amber-600 font-bold mb-1">Ең үздік</div>
                  <div className="text-2xl font-bold text-amber-600">{quizStats.best ?? 0} / {LOCAL_QUIZ.length}</div>
                </div>
                <div className="rounded-xl border-2 border-slate-200 bg-white p-4 text-center">
                  <div className="text-xs text-slate-500 mb-1">Талпыныс саны</div>
                  <div className="text-2xl font-bold text-slate-900">{quizStats.attempts ?? 0}</div>
                </div>
              </div>
              
              <div className="flex justify-center">
                <button
                  onClick={quizStart}
                  disabled={isServerMode && (!articleId || srvLoading || srvQuestions.length === 0)}
                  className="group/btn relative px-8 py-4 rounded-xl bg-gradient-to-r from-[#f59e0b] via-[#f97316] to-[#f59e0b] text-white font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    🚀 Тесті бастау
                    <span className="group-hover/btn:translate-x-1 transition-transform duration-300">→</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#f97316] via-[#f59e0b] to-[#f97316] opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                </button>
              </div>
              
              {srvErr && <div className="text-sm text-rose-600 bg-rose-50 rounded-xl p-3">{srvErr}</div>}
            </div>
          )}

          {/* Вопросы */}
          {quizStep > 0 && quizStep <= total && (
            <motion.div 
              key={quizStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-700">Сұрақ {quizStep} / {total}</div>
                <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(quizStep / total) * 100}%` }}
                    className="h-2 bg-gradient-to-r from-[#f59e0b] to-[#f97316]"
                  />
                </div>
              </div>
              
              <div className="text-xl font-bold text-slate-900 leading-relaxed">
                {isServerMode ? (srvQuestions[quizStep - 1]?.prompt || "") : (LOCAL_QUIZ[quizStep - 1].q)}
              </div>
              
              <div className="grid gap-3">
                {(isServerMode ? (srvQuestions[quizStep - 1]?.options || []) : LOCAL_QUIZ[quizStep - 1].options).map((opt, i) => {
                  const checked = answers[quizStep - 1] === i;
                  return (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => quizPick(quizStep - 1, i)}
                      className={`group text-left rounded-xl border-2 px-5 py-4 transition-all duration-300 ${
                        checked 
                          ? "border-[#f59e0b] bg-gradient-to-r from-amber-50 to-orange-50 shadow-md" 
                          : "border-slate-200 hover:border-[#f59e0b]/50 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${
                          checked 
                            ? "bg-gradient-to-r from-[#f59e0b] to-[#f97316] text-white shadow-lg scale-110" 
                            : "bg-slate-200 text-slate-700 group-hover:bg-slate-300"
                        }`}>
                          {i + 1}
                        </span>
                        <span className="flex-1 text-slate-800 font-medium">{opt}</span>
                        {checked && (
                          <motion.span 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-[#f59e0b] text-xl"
                          >
                            ✓
                          </motion.span>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              <div className="flex justify-between items-center gap-4">
                <button
                  onClick={() => setQuizStep((s) => Math.max(1, s - 1))}
                  disabled={quizStep === 1}
                  className="px-5 py-2.5 rounded-xl border-2 border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ⟵ Артқа
                </button>
                <button
                  onClick={quizNext}
                  disabled={!(quizStep - 1 in answers)}
                  className="group/btn relative px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#f59e0b] via-[#f97316] to-[#f59e0b] text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {quizStep < total ? "Келесі" : "Нәтижені көру"}
                    <span className="group-hover/btn:translate-x-1 transition-transform duration-300">→</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#f97316] via-[#f59e0b] to-[#f97316] opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Результат */}
          {quizStep === total + 1 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <div className="text-center">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-3xl font-extrabold text-slate-900 mb-4">Нәтиже</h3>
              </div>

              {isServerMode ? (
                <>
                  {srvSubmitting && (
                    <div className="flex items-center justify-center gap-2 text-slate-600">
                      <div className="animate-spin h-5 w-5 border-2 border-[#f59e0b] border-t-transparent rounded-full"></div>
                      <span>Серверден тексеру…</span>
                    </div>
                  )}
                  {srvSubmitErr && <div className="text-sm text-rose-600 bg-rose-50 rounded-xl p-3">{srvSubmitErr}</div>}
                  {!srvSubmitting && (
                    <div className="text-center">
                      <div className="inline-block bg-gradient-to-r from-[#f59e0b] to-[#f97316] rounded-2xl px-8 py-4 shadow-lg">
                        <p className="text-white text-sm font-medium mb-1">Ұпай</p>
                        <p className="text-white text-4xl font-extrabold">
                          {srvSummary?.correct ?? 0} / {srvSummary?.total ?? total}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="text-center">
                    <div className="inline-block bg-gradient-to-r from-[#f59e0b] to-[#f97316] rounded-2xl px-8 py-4 shadow-lg">
                      <p className="text-white text-sm font-medium mb-1">Ұпай</p>
                      <p className="text-white text-4xl font-extrabold">
                        {scoreLocal} / {LOCAL_QUIZ.length}
                      </p>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border-2 border-amber-200">
                    <p className="text-slate-800 font-semibold text-center">
                      {scoreLocal <= 4
                        ? "Базалық түсініктер қалыптасқан. Кеңестерді қарап шығыңыз."
                        : scoreLocal <= 8
                        ? "Жақсы! Тыңдау мен сенімге мән беріңіз."
                        : "Керемет! Үлгілік тәрбие — осы қарқынмен жалғастырыңыз."}
                    </p>
                  </div>
                </>
              )}

              {/* Review для локального */}
              {!isServerMode && (
                <div className="space-y-3">
                  {LOCAL_QUIZ.map((qq, idx) => {
                    const your = answers[idx];
                    const ok = your === qq.correct;
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`rounded-xl border-2 p-4 ${
                          ok 
                            ? "border-emerald-300 bg-gradient-to-br from-emerald-50 to-green-50" 
                            : "border-rose-300 bg-gradient-to-br from-rose-50 to-red-50"
                        }`}
                      >
                        <div className="font-bold text-slate-900 mb-2">{qq.q}</div>
                        <div className="text-sm space-y-1">
                          <div>
                            Таңдалған: <b className={ok ? "text-emerald-700" : "text-rose-700"}>
                              {your != null ? qq.options[your] : "—"}
                            </b>
                          </div>
                          <div>
                            Дұрыс: <b className="text-emerald-700">{qq.options[qq.correct]}</b>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              <div className="flex gap-3 justify-center">
                <button 
                  onClick={quizStart} 
                  className="group/btn relative px-6 py-3 rounded-xl bg-gradient-to-r from-[#f59e0b] via-[#f97316] to-[#f59e0b] text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    🔄 Қайта өту
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#f97316] via-[#f59e0b] to-[#f97316] opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                </button>
                <button 
                  onClick={quizRestart} 
                  className="px-6 py-3 rounded-xl border-2 border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-300"
                >
                  Басты экран
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* TAB: VIDEOS */}
      {tab === "videos" && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 rounded-2xl border border-slate-200/70 bg-white/90 backdrop-blur-xl p-6 shadow-[0_10px_30px_rgba(16,37,66,0.08)]"
        >
          <h3 className="text-2xl font-extrabold text-slate-900 mb-6">Бала тәрбиесі туралы видеолар</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {embeds.map((src, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="rounded-xl overflow-hidden border-2 border-slate-200 bg-black/5 aspect-video shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <iframe
                  title={`video-${i}`}
                  src={src}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </motion.div>
            ))}
          </div>
          <div className="mt-4 text-xs text-slate-500 bg-slate-50 rounded-lg px-4 py-2 text-center">
            💡 Ескерту: Видеолар YouTube платформасынан ендірілді
          </div>
        </motion.div>
      )}

      {/* TAB: LAWS */}
      {tab === "laws" && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 space-y-6"
        >
          <div className="rounded-2xl border border-slate-200/70 bg-white/90 backdrop-blur-xl p-6 shadow-[0_10px_30px_rgba(16,37,66,0.08)]">
            <h3 className="text-2xl font-extrabold text-slate-900 mb-4">Ата-ана міндеттері туралы заңнамалар</h3>
            <p className="text-sm text-slate-600 mb-6 bg-slate-50 rounded-xl px-4 py-3">
              💡 Бұл бөлім ақпараттық сипатта. Нақты жағдайға қатысты ресми дереккөздер мен маманға жүгініңіз.
            </p>

            <div className="space-y-3">
              {LAWS.map((l, idx) => (
                <motion.details
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + idx * 0.05 }}
                  className="group rounded-xl border-2 border-slate-200 bg-white p-4 hover:border-amber-300 hover:shadow-md transition-all duration-300"
                >
                  <summary className="cursor-pointer font-bold text-slate-900 text-lg list-none flex items-center justify-between">
                    <span>{l.title}</span>
                    <span className="text-amber-600 text-xl group-open:rotate-180 transition-transform duration-300">▼</span>
                  </summary>
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <ul className="space-y-2 text-sm text-slate-700">
                      {l.points.map((p, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-amber-600 mt-0.5">•</span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.details>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200/50 bg-gradient-to-br from-amber-50/50 to-orange-50/50 p-5">
            <h4 className="font-bold text-slate-900 mb-2">Ескерту</h4>
            <p className="text-sm text-slate-700">
              Айыппұл мөлшерлері АЕК-ке (айлық есептік көрсеткіш) байланған. АЕК жыл сайын өзгеруі мүмкін.
            </p>
          </div>
        </motion.div>
      )}
      </div>
    </motion.div>
  );
}
