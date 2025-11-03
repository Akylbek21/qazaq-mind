// src/pages/HistoricalQuiz.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ChatModal from "../components/ChatModal";
import Coin from "../components/Coin";

/* ===== Тұлғалар ===== */
const personalities = {
  ABAY: {
    name: "Абай Құнанбайұлы",
    image: encodeURI("/Абай Құнанбайұлы.jpg"),
    system_prompt_bio: "Ұлы ақын, ойшыл. Даналыққа, парасатқа, еңбек пен білімге үндейді.",
  },
  BAUYRZHAN: {
    name: "Бауыржан Момышұлы",
    image: encodeURI("/Бауыржан Момышұлы.jpg"),
    system_prompt_bio: "Әскери қолбасшы, батыр. Тәртіп, намыс, төзімділік құндылықтарын дәріптейді.",
  },
  TOMIRIS: {
    name: "Томирис патшайым",
    image: encodeURI("/Томирис.jpg"),
    system_prompt_bio: "Массагет патшайымы. Еркіндік пен әділдік жолындағы күрестің символы.",
  },
  AKHMET: {
    name: "Ахмет Байтұрсынұлы",
    image: encodeURI("/Ахмет Байтұрсынұлы.jpg"),
    system_prompt_bio: "Ұлт ұстазы, тілші, ағартушы. Қазақ тіл білімінің негізін қалаушылардың бірі.",
  },
  ALIKHAN: {
    name: "Әлихан Бөкейхан",
    image: encodeURI("/Әлихан Бөкейхан.jpg"),
    system_prompt_bio: "Алаш қозғалысының жетекшісі, саяси қайраткер. Стратегиялық ойлау мен жауапкершілікті алдыңғы орынға қояды.",
  },
};

/* ===== API Клиент ===== */
import { fetchTests, fetchQuestions, submitAnswer, fetchResult } from '../api/historical';

export default function HistoricalQuiz() {
  const navigate = useNavigate();

  const [quizState, setQuizState] = React.useState("start");
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
  const [testId, setTestId] = React.useState(null);
  const [questions, setQuestions] = React.useState([]);
  const [result, setResult] = React.useState(null);
  const [chatPersonality, setChatPersonality] = React.useState(null);

  React.useEffect(() => {
    // Загружаем список тестов при монтировании
    fetchTests().then(data => {
      if (data && data.length > 0) {
        setTestId(data[0].id);
      }
    });
  }, []);

  React.useEffect(() => {
    // Загружаем вопросы когда получен testId
    if (testId) {
      fetchQuestions(testId).then(data => {
        if (data) {
          setQuestions(data);
        }
      });
    }
  }, [testId]);

  const handleStart = () => setQuizState("quiz");

  const handleAnswer = async (option) => {
    const currentQuestion = questions[currentQuestionIndex];
    await submitAnswer(currentQuestion.id, option);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((i) => i + 1);
    } else {
      const resultData = await fetchResult(testId);
      setResult(resultData);
      setQuizState("result");
    }
  };

  const handleRestart = () => {
    setQuizState("start");
    setCurrentQuestionIndex(0);
    setResult(null);
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
                {question.prompt}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'A', text: question.optionA },
                  { key: 'B', text: question.optionB },
                  { key: 'C', text: question.optionC },
                  { key: 'D', text: question.optionD },
                  { key: 'E', text: question.optionE }
                ].map((opt) => (
                  <motion.button
                    key={opt.key}
                    onClick={() => handleAnswer(opt.key)}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="group text-left rounded-xl border-2 border-slate-200/70 bg-white p-4 hover:border-teal-500/70 hover:bg-teal-50/60 transition-all"
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

          {quizState === "result" && result && (
            <motion.div key="result" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <div className="text-center">
                <h3 className="text-sm md:text-base tracking-wide uppercase text-teal-600 mb-2">
                  Сіздің тұлғаңыз
                </h3>
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#1F7A8C] to-[#0ea5a5]">
                    {personalities[result.personality].name}
                  </span>
                </h2>
                <img
                  src={personalities[result.personality].image}
                  alt={personalities[result.personality].name}
                  className="w-40 h-40 md:w-48 md:h-48 rounded-full mx-auto mb-6 shadow-xl border-4 border-white object-cover"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://placehold.co/400x400/cccccc/ffffff?text=Image+Not+Found";
                  }}
                />
                <p className="text-base md:text-lg text-slate-700 max-w-2xl mx-auto mb-4">
                  {result.description}
                </p>
                <div className="mb-6">
                  <p className="font-semibold text-slate-800 mb-2">Күшті жақтарыңыз:</p>
                  <p className="text-slate-700">{result.strengths}</p>
                  <p className="font-semibold text-slate-800 mt-4 mb-2">Қазіргі заманда:</p>
                  <p className="text-slate-700">{result.modernRole}</p>
                  <div className="mt-4">
                   
                    <p className="text-sm text-slate-600">
                      Барлық сұрақтар саны: {result.totalQuestions}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button onClick={handleRestart} className="btn btn-tertiary">
                    Тестті қайта өту
                  </button>
                  <button 
                    onClick={() => setChatPersonality(personalities[result.personality])} 
                    className="btn btn-primary"
                  >
                    ✨ {personalities[result.personality].name.split(" ")[0]}мен сөйлесу
                  </button>
                </div>
              </div>
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
