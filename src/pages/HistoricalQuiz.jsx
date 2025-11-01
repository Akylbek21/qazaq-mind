// src/pages/HistoricalQuiz.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ChatModal from "../components/ChatModal";

/* ===== Тұлғалар ===== */
const personalities = {
  abai: {
    name: "Абай Құнанбайұлы",
    description:
      "Сен ойшыл, сабырлы, рухани терең тұлғасың. Әділет, білім мен еңбек құндылықтарын жоғары қоясың.",
    image: encodeURI("/Абай Құнанбайұлы.jpg"),
    system_prompt_bio:
      "Ұлы ақын, ойшыл. Даналыққа, парасатқа, еңбек пен білімге үндейді.",
  },
  bauyrzhan: {
    name: "Бауыржан Момышұлы",
    description:
      "Ержүрек, жауапкершілігі жоғары, әділеттілікті сүйесің. Қиында батыл шешім қабылдап, қорғайсың.",
    image: encodeURI("/Бауыржан Момышұлы.jpg"),
    system_prompt_bio:
      "Әскери қолбасшы, батыр. Тәртіп, намыс, төзімділік құндылықтарын дәріптейді.",
  },
  tomyris: {
    name: "Томирис патшайым",
    description:
      "Әділет пен тәуелсіздікті бәрінен жоғары қоясың. Әлсізді қорғайсың, еркіндік пен теңдік — өмір мәні.",
    image: encodeURI("/Томирис.jpg"),
    system_prompt_bio:
      "Массагет патшайымы. Еркіндік пен әділдік жолындағы күрестің символы.",
  },
  ahmet: {
    name: "Ахмет Байтұрсынұлы",
    description:
      "Ағартушылық пен білім — сенің жолың. Сөздің күші мен тілдің қасиетін қорғайсың.",
    image: encodeURI("/Ахмет Байтұрсынұлы.jpg"),
    system_prompt_bio:
      "Ұлт ұстазы, тілші, ағартушы. Қазақ тіл білімінің негізін қалаушылардың бірі.",
  },
  alikhan: {
    name: "Әлихан Бөкейхан",
    description:
      "Халықтың қамын ойлайтын көшбасшысың. Бірлікке, әділ қоғамға, демократияға ұмтыласың.",
    image: encodeURI("/Әлихан Бөкейхан.jpg"),
    system_prompt_bio:
      "Алаш қозғалысының жетекшісі, саяси қайраткер. Стратегиялық ойлау мен жауапкершілікті алдыңғы орынға қояды.",
  },
};

/* ===== Сұрақтар ===== */
const questions = [
  {
    text: "1. Қиын жағдай туындағанда сен не істейсің?",
    options: [
      { text: "A) Сабыр сақтап, терең ойланамын (Абай Құнанбайұлы)", weights: { abai: 3 } },
      { text: "B) Тактиканы өзгертіп, нақты шешім қабылдаймын (Бауыржан Момышұлы)", weights: { bauyrzhan: 3 } },
      { text: "C) Елдің мүддесін қорғаймын, күреске шығамын (Томирис патшайым)", weights: { tomyris: 3 } },
      { text: "D) Адамдарды біліммен, сөзбен оятамын (Ахмет Байтұрсынұлы)", weights: { ahmet: 3 } },
      { text: "E) Ұлтты біріктіру жолында идея іздеймін (Әлихан Бөкейхан)", weights: { alikhan: 3 } },
    ],
  },
  {
    text: "2. Саған ең маңызды құндылық қайсысы?",
    options: [
      { text: "A) Ақыл мен парасат (Абай)", weights: { abai: 3 } },
      { text: "B) Ерлік пен намыс (Бауыржан)", weights: { bauyrzhan: 3 } },
      { text: "C) Тәуелсіздік пен азаттық (Томирис)", weights: { tomyris: 3 } },
      { text: "D) Білім мен ағарту (Ахмет)", weights: { ahmet: 3 } },
      { text: "E) Бірлік пен ел басқару (Әлихан)", weights: { alikhan: 3 } },
    ],
  },
  {
    text: "3. Досың қиындыққа тап болса, сен...",
    options: [
      { text: "A) Оны сабырға шақырып, ақыл беремін (Абай)", weights: { abai: 3 } },
      { text: "B) Бірге күресемін, қорғаймын (Бауыржан)", weights: { bauyrzhan: 3 } },
      { text: "C) Оның намысын қорғау үшін алға шығамын (Томирис)", weights: { tomyris: 3 } },
      { text: "D) Түсіндіріп, бағыт көрсетемін (Ахмет)", weights: { ahmet: 3 } },
      { text: "E) Қиындықты жүйелі түрде шешуге көмектесемін (Әлихан)", weights: { alikhan: 3 } },
    ],
  },
  {
    text: "4. Егер сенде үлкен мүмкіндік болса, сен не істер едің?",
    options: [
      { text: "A) Халықты рухани байытуға атсалысамын (Абай)", weights: { abai: 3 } },
      { text: "B) Елдің қорғанысын күшейтер едім (Бауыржан)", weights: { bauyrzhan: 3 } },
      { text: "C) Әйелдің, ананың мәртебесін көтерер едім (Томирис)", weights: { tomyris: 3 } },
      { text: "D) Қазақ тілін дамытуға, білім таратуға жұмыс жасар едім (Ахмет)", weights: { ahmet: 3 } },
      { text: "E) Әділ қоғам орнатуға күш саламын (Әлихан)", weights: { alikhan: 3 } },
    ],
  },
  {
    text: "5. Қандай сипат өзіңе тән деп ойлайсың?",
    options: [
      { text: "A) Терең ойлы, парасатты (Абай)", weights: { abai: 3 } },
      { text: "B) Батыл, табанды (Бауыржан)", weights: { bauyrzhan: 3 } },
      { text: "C) Ер мінезді, намысты (Томирис)", weights: { tomyris: 3 } },
      { text: "D) Сөзге шешен, ұстаздық қабілеті бар (Ахмет)", weights: { ahmet: 3 } },
      { text: "E) Көшбасшы, ұйымдастырушы (Әлихан)", weights: { alikhan: 3 } },
    ],
  },
];

export default function HistoricalQuiz() {
  const navigate = useNavigate();

  const [quizState, setQuizState] = React.useState("start");
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
  const [scores, setScores] = React.useState(
    Object.keys(personalities).reduce((acc, k) => ({ ...acc, [k]: 0 }), {})
  );
  const [resultKey, setResultKey] = React.useState(null);
  const [chatPersonality, setChatPersonality] = React.useState(null);

  const handleStart = () => setQuizState("quiz");

  const handleAnswer = (weights) => {
    const next = { ...scores };
    for (const k in weights) next[k] += weights[k];
    setScores(next);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((i) => i + 1);
    } else {
      const best = Object.keys(next).reduce((a, b) => (next[a] > next[b] ? a : b));
      setResultKey(best);
      setQuizState("result");
    }
  };

  const handleRestart = () => {
    setQuizState("start");
    setCurrentQuestionIndex(0);
    setScores(Object.keys(personalities).reduce((acc, k) => ({ ...acc, [k]: 0 }), {}));
    setResultKey(null);
  };

  const question = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-10">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-5xl font-extrabold tracking-tight"
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#1F7A8C] via-[#1aa6b5] to-[#0ea5a5]">
            Тарихи тұлға тесті
          </span>
        </motion.h1>
        <div className="mx-auto mt-4 h-[3px] w-24 rounded-full bg-gradient-to-r from-[#1F7A8C] to-[#FFD580]" />
      </div>

      <div className="rounded-2xl p-6 md:p-10 bg-white/80 backdrop-blur-xl border border-slate-200/70 shadow-[0_10px_30px_rgba(16,37,66,0.06)]">
        <AnimatePresence mode="wait">
          {quizState === "start" && (
            <motion.div
              key="start"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="text-center"
            >
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
                Сіз Қазақстанның қай тарихи тұлғасына ұқсайсыз?
              </h2>
              <p className="max-w-2xl mx-auto text-lg text-slate-600 mb-8">
                Бірнеше сұраққа жауап беріп, қай тарихи тұлғаның рухы сізге жақын екенін анықтаңыз.
              </p>
              <button onClick={handleStart} className="btn btn-primary btn-xl">
                Тестті бастау
              </button>
              <div className="mt-6">
                <button onClick={() => navigate(-1)} className="btn btn-terтіary">
                  ⟵ Басты бетке
                </button>
              </div>
            </motion.div>
          )}

          {quizState === "quiz" && (
            <motion.div key="quiz" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              {/* Progress */}
              <div className="mb-6">
                <div className="w-full bg-slate-200/70 rounded-full h-2.5 overflow-hidden">
                  <motion.div
                    className="h-2.5 rounded-full bg-gradient-to-r from-[#1F7A8C] via-[#1aa6b5] to-[#0ea5a5]"
                    style={{ width: `${progress}%` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                  />
                </div>
                <div className="mt-2 text-right text-xs text-slate-500">
                  {currentQuestionIndex + 1} / {questions.length}
                </div>
              </div>

              <h3 className="text-2xl md:text-3xl font-bold text-center text-slate-900 mb-6">
                {question.text}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {question.options.map((opt, i) => (
                  <motion.button
                    key={i}
                    onClick={() => handleAnswer(opt.weights)}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="group text-left rounded-xl border-2 border-slate-200/70 bg-white p-4 hover:border-teal-500/70 hover:bg-teал-50/60 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 h-2.5 w-2.5 rounded-full bg-teal-500/70 group-hover:bg-teal-600" />
                      <span className="text-slate-700 group-hover:text-slate-900">{opt.text}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {quizState === "result" && resultKey && (
            <motion.div key="result" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              {(() => {
                const p = personalities[resultKey];
                return (
                  <div className="text-center">
                    <h3 className="text-sm md:text-base tracking-wide uppercase text-teal-600 mb-2">
                      Сіздің тұлғаңыз
                    </h3>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#1F7A8C] to-[#0ea5a5]">
                        {p.name}
                      </span>
                    </h2>
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-40 h-40 md:w-48 md:h-48 rounded-full mx-auto mb-6 shadow-xl border-4 border-white object-cover"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://placehold.co/400x400/cccccc/ffffff?text=Image+Not+Found";
                      }}
                    />
                    <p className="text-base md:text-lg text-slate-700 max-w-2xl mx-auto mb-8">
                      {p.description}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <button onClick={handleRestart} className="btn btn-tertiary">
                        Тестті қайта өту
                      </button>
                      <button onClick={() => setChatPersonality(p)} className="btn btn-primary">
                        ✨ {p.name.split(" ")[0]}мен сөйлесу
                      </button>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Chat */}
      <AnimatePresence>
        {chatPersonality && (
          <ChatModal personality={chatPersonality} onClose={() => setChatPersonality(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
