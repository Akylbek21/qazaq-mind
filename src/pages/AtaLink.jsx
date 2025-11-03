// src/pages/AtaLink.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  fetchAtaArticles,
  fetchAtaArticle,
  fetchAtaArticleQuestions,
  submitAtaAnswer,
  fetchAtaArticleSummary,
  _utils as ATA,
} from "../api/atalink";

const QUIZ_KEY = "atalink_quiz_stats_v1";
const ART_KEY  = "atalink_active_article_v1";
function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || "null") ?? fallback; }
  catch { return fallback; }
}

function save(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

function mdToHtml(md = "") {
  let html = String(md || "");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\n/g, "<br/>");
  return html;
}

const CATEGORY_LABELS = {
  communication: "Байланыс",
  motivation: "Мотивация",
  emotions: "Эмоциялар",
  discipline: "Тәртіп",
};

function getCategoryLabel(category) {
  return CATEGORY_LABELS[category] || category;
}

// Локальные данные удалены - все данные с бэкенда

export default function AtaLink() {
  // Убраны вкладки - показываем только тест

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

  const total = srvQuestions.length;

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

    // Серверный подсчёт: отправляем ответы + снимаем summary
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

  const handleArticleSelect = (id) => {
    setArticleId(id);
    save(ART_KEY, id);
    setQuizStep(0);
    setAnswers({});
    setSrvSummary(null);
  };

  const currentQuestion = srvQuestions[quizStep - 1];
  const questionOptions = currentQuestion 
    ? currentQuestion.options.map((text, idx) => ({
        letter: ATA.LETTERS[idx] || String.fromCharCode(65 + idx), // A, B, C, D
        text: text || "",
      })).filter(opt => opt.text)
    : [];

  const resultPercentage = srvSummary ? Math.round((srvSummary.correct / srvSummary.total) * 100) : 0;

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-b from-slate-50 to-white"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
    >
      <div className="container mx-auto max-w-6xl px-4 py-8 md:py-10">
        {/* Заголовок */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-2">
            AtaLink
          </h1>
          <p className="text-lg text-[#f59e0b] font-semibold mb-6">
            Ата-аналарға арналған кеңес пен тесттер
          </p>
          <Link 
            to="/" 
            className="inline-flex items-center justify-center rounded-xl px-6 py-3 border-2 border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-300"
          >
            ⟵ Басты бетке оралу
          </Link>
        </motion.div>

        <>
          {/* Выбор статьи - карточки */}
          {quizStep === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Мақала таңдаңыз</h2>
              
              {artLoading && (
                <div className="flex items-center justify-center gap-3 py-12">
                  <div className="animate-spin h-8 w-8 border-4 border-[#f59e0b] border-t-transparent rounded-full"></div>
                  <span className="text-slate-600 font-medium">Мақалалар жүктелуде…</span>
                </div>
              )}

              {artErr && (
                <div className="bg-rose-50 border-2 border-rose-200 rounded-xl p-4 text-center">
                  <p className="text-rose-700 font-medium">{artErr}</p>
                </div>
              )}

              {!artLoading && !artErr && articles.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                  {articles.map((art) => (
                    <motion.button
                      key={art.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleArticleSelect(art.id)}
                      className={`text-left rounded-2xl border-2 p-5 transition-all duration-300 ${
                        articleId === art.id
                          ? "border-[#f59e0b] bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg"
                          : "border-slate-200 bg-white hover:border-[#f59e0b]/50 hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {art.imageUrl && (
                          <img 
                            src={art.imageUrl} 
                            alt={art.title}
                            className="w-20 h-20 rounded-xl object-cover border-2 border-slate-200 flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-1 rounded-md text-xs font-bold bg-[#f59e0b]/10 text-[#f59e0b]">
                              {getCategoryLabel(art.category)}
                            </span>
                          </div>
                          <h3 className="font-bold text-lg text-slate-900 mb-2 line-clamp-2">
                            {art.title}
                          </h3>
                          {art.summary && (
                            <p className="text-sm text-slate-600 line-clamp-2">
                              {art.summary}
                            </p>
                          )}
                        </div>
                        {articleId === art.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex-shrink-0"
                          >
                            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#f59e0b] to-[#f97316] flex items-center justify-center">
                              <span className="text-white text-xs font-bold">✓</span>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Выбранная статья и тест */}
          {articleId && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border border-slate-200/70 bg-white/90 backdrop-blur-xl p-6 md:p-8 shadow-[0_10px_30px_rgba(16,37,66,0.08)]"
          >

            {/* Информация о выбранной статье */}
            {article && (
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  {article.imageUrl && (
                    <img 
                      src={article.imageUrl} 
                      alt={article.title}
                      className="w-16 h-16 rounded-xl object-cover border-2 border-slate-200"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-1 rounded-md text-xs font-bold bg-[#f59e0b]/10 text-[#f59e0b]">
                        {getCategoryLabel(article.category)}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">{article.title}</h2>
                    {article.summary && (
                      <p className="text-sm text-slate-600 mt-1">{article.summary}</p>
                    )}
                  </div>
                </div>

                {/* Контент статьи */}
                {article.contentMarkdown && (
                  <div className="rounded-xl border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5 mb-6">
                    <div className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wide">Мазмұны</div>
                    <div
                      className="text-slate-800 leading-relaxed space-y-3"
                      dangerouslySetInnerHTML={{ __html: mdToHtml(article.contentMarkdown) }}
                    />
                  </div>
                )}

                {/* Видео */}
                {article.videoUrl && (
                  <div className="mb-6">
                    <div className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wide">Видео</div>
                    <div className="rounded-xl border-2 border-slate-200 bg-slate-50 p-4">
                      <a 
                        href={article.videoUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-[#f59e0b] font-semibold hover:text-[#f97316] transition-colors"
                      >
                        <span>📺</span>
                        <span>Видеоны көру</span>
                        <span>↗</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Кнопка начала теста */}
            {quizStep === 0 && (
              <div className="space-y-6">
                {srvLoading && (
                  <div className="flex items-center justify-center gap-3 py-8">
                    <div className="animate-spin h-6 w-6 border-3 border-[#f59e0b] border-t-transparent rounded-full"></div>
                    <span className="text-slate-600 font-medium">Сұрақтар жүктелуде…</span>
                  </div>
                )}
                
                {srvErr && (
                  <div className="bg-rose-50 border-2 border-rose-200 rounded-xl p-4 text-center">
                    <p className="text-rose-700 font-medium">{srvErr}</p>
                  </div>
                )}

                {!srvLoading && !srvErr && srvQuestions.length > 0 && (
                  <div className="text-center space-y-4">
                    <div className="inline-block bg-gradient-to-r from-[#f59e0b]/10 to-[#f97316]/10 rounded-xl px-6 py-3 border-2 border-[#f59e0b]/20">
                      <p className="text-slate-700 font-medium">
                        <span className="font-bold text-[#f59e0b]">{srvQuestions.length}</span> сұрақ дайын
                      </p>
                    </div>
                    <button
                      onClick={quizStart}
                      className="group/btn relative px-8 py-4 rounded-xl bg-gradient-to-r from-[#f59e0b] via-[#f97316] to-[#f59e0b] text-white font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        🚀 Тесті бастау
                        <span className="group-hover/btn:translate-x-1 transition-transform duration-300">→</span>
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-[#f97316] via-[#f59e0b] to-[#f97316] opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Вопросы */}
            {quizStep > 0 && quizStep <= total && currentQuestion && (
              <motion.div 
                key={quizStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Прогресс */}
                <div className="flex items-center justify-between mb-6">
                  <div className="text-sm font-semibold text-slate-700">
                    Сұрақ <span className="text-[#f59e0b] font-bold">{quizStep}</span> / {total}
                  </div>
                  <div className="flex-1 max-w-xs mx-4 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(quizStep / total) * 100}%` }}
                      transition={{ duration: 0.3 }}
                      className="h-2 bg-gradient-to-r from-[#f59e0b] to-[#f97316]"
                    />
                  </div>
                  <div className="text-xs text-slate-500">
                    {Math.round((quizStep / total) * 100)}%
                  </div>
                </div>
                
                {/* Вопрос */}
                <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl border-2 border-slate-200 p-6 mb-6">
                  <h3 className="text-xl md:text-2xl font-bold text-slate-900 leading-relaxed">
                    {currentQuestion.prompt || ""}
                  </h3>
                </div>
                
                {/* Изображение вопроса */}
                {currentQuestion.imageUrl && (
                  <div className="mb-6 flex justify-center">
                    <img 
                      src={currentQuestion.imageUrl} 
                      alt={currentQuestion.prompt?.slice(0, 120) || 'question image'} 
                      className="max-h-80 w-auto rounded-xl object-contain border-2 border-slate-200 shadow-lg"
                    />
                  </div>
                )}
                
                {/* Варианты ответов */}
                <div className="grid gap-3 mb-6">
                  {questionOptions.map((opt, idx) => {
                    const letterIndex = ATA.LETTERS.indexOf(opt.letter);
                    const checked = answers[quizStep - 1] === letterIndex;
                    return (
                      <motion.button
                        key={opt.letter}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => quizPick(quizStep - 1, letterIndex)}
                        className={`group text-left rounded-xl border-2 px-5 py-4 transition-all duration-300 ${
                          checked 
                            ? "border-[#f59e0b] bg-gradient-to-r from-amber-50 to-orange-50 shadow-md ring-2 ring-[#f59e0b]/20" 
                            : "border-slate-200 hover:border-[#f59e0b]/50 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <span className={`inline-flex h-10 w-10 items-center justify-center rounded-lg text-base font-bold transition-all duration-300 ${
                            checked 
                              ? "bg-gradient-to-r from-[#f59e0b] to-[#f97316] text-white shadow-lg scale-110" 
                              : "bg-slate-200 text-slate-700 group-hover:bg-slate-300"
                          }`}>
                            {opt.letter}
                          </span>
                          <span className="flex-1 text-slate-800 font-medium text-base">{opt.text}</span>
                          {checked && (
                            <motion.span 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="text-[#f59e0b] text-2xl"
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
                <Link 
                  to="/" 
                  className="px-6 py-3 rounded-xl border-2 border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-300 inline-flex items-center justify-center"
                >
                  Басты бетке оралу
                </Link>
              </div>
            </motion.div>
          )}
        </motion.div>
        )}
        </>
      </div>
    </motion.div>
  );
}
