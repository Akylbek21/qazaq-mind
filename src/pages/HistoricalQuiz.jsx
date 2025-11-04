// src/pages/HistoricalQuiz.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ChatModal from "../components/ChatModal";
import Coin from "../components/Coin";

/* ===== Тұлғалар ===== */
const personalities = {
  A: {
    key: "ABAY",
    name: "Абай Құнанбайұлы",
    image: encodeURI("/Абай Құнанбайұлы.jpg"),
    system_prompt_bio: "Ұлы ақын, ойшыл. Даналыққа, парасатқа, еңбек пен білімге үндейді.",
    description: "Көп жауаптарың А болса → сен Абай Құнанбайұлына ұқсайсың — ойшыл, сабырлы, рухани терең тұлғасың. Абай сияқты сен адам мінезін, қоғамдағы әділеттілікті, білім мен еңбектің құндылығын жоғары қоясың.",
    mainValue: "Сен үшін ішкі тыныштық пен адамгершілік басты орында.",
    strengths: "Күшті жағың: сабыр, даналық, талғам.",
    modernRole: "Қазіргі заманда сен: мотивация беретін ойшыл, медиа мен білім саласында бағыт көрсетуші болар едің.",
  },
  B: {
    key: "BAUYRZHAN",
    name: "Бауыржан Момышұлы",
    image: encodeURI("/Бауыржан Момышұлы.jpg"),
    system_prompt_bio: "Әскери қолбасшы, батыр. Тәртіп, намыс, төзімділік құндылықтарын дәріптейді.",
    description: "B көп болса → сен Бауыржан Момышұлына ұқсайсың — ержүрек, жауапкершілігі жоғары және әділеттілікті сүйетін тұлғасың. Бауыржан сияқты сен батыл шешім қабылдап, еліңді, жақындарыңды қорғауға дайынсың.",
    mainValue: "Қиындық саған сын емес, шыңдалу мүмкіндігі.",
    strengths: "Күшті жағың: тәртіп, төзімділік, намыс.",
    modernRole: "Қазіргі заманда сен: қоғамды алға жетелейтін әскери, спорттық немесе көшбасшылық бағыттағы тұлға болар едің.",
  },
  C: {
    key: "TOMIRIS",
    name: "Томирис патшайым",
    image: encodeURI("/Томирис.jpg"),
    system_prompt_bio: "Массагет патшайымы. Еркіндік пен әділдік жолындағы күрестің символы.",
    description: "C көп болса → сен Томирис патшайымға ұқсайсың — әділет пен тәуелсіздікті бәрінен жоғары қоясың. Томирис секілді сен әділдік үшін соңына дейін күресуге дайынсың, әлсізді қорғайсың.",
    mainValue: "Сен үшін еркіндік пен теңдік — өмір мәні.",
    strengths: "Күшті жағың: батылдық, шешімділік, рух күші.",
    modernRole: "Қазіргі заманда сен: қоғамдағы теңдік, әйел құқығы мен ұлттық рухты қорғаушы тұлға болар едің.",
  },
  D: {
    key: "AKHMET",
    name: "Ахмет Байтұрсынұлы",
    image: encodeURI("/Ахмет Байтұрсынұлы.jpg"),
    system_prompt_bio: "Ұлт ұстазы, тілші, ағартушы. Қазақ тіл білімінің негізін қалаушылардың бірі.",
    description: "D көп болса → сен Ахмет Байтұрсынұлына ұқсайсың — ағартушылық пен білім сенің жолың. Ахмет сияқты сен айналаңдағы адамдарды үйретіп, білім арқылы қоғамды оятқың келеді.",
    mainValue: "Сен үшін сөздің күші мен ұлттың тілі - қасиетті.",
    strengths: "Күшті жағың: ұстаздық, зияткерлік, тіл сезімі.",
    modernRole: "Қазіргі заманда сен: педагог, журналист немесе мәдениет қайраткері ретінде ұлттың санасын жаңғыртар едің.",
  },
  E: {
    key: "ALIKHAN",
    name: "Әлихан Бөкейханұлы",
    image: encodeURI("/Әлихан Бөкейхан.jpg"),
    system_prompt_bio: "Алаш қозғалысының жетекшісі, саяси қайраткер. Стратегиялық ойлау мен жауапкершілікті алдыңғы орынға қояды.",
    description: "E көп болса → сен Әлихан Бөкейханұлына ұқсайсың — халықтың қамын ойлайтын көшбасшысың. Әлихан секілді сен әділдікке, демократияға, халықтың бірлігіне сенесің.",
    mainValue: "Сен стратегиялық ойлайсың және командамен жұмыс істеуге бейімсің.",
    strengths: "Күшті жағың: көшбасшылық, талдау, жауапкершілік.",
    modernRole: "Қазіргі заманда сен: саясаткер, қоғам белсендісі немесе ірі жобалардың жетекшісі болар едің.",
  },
};

/* ===== API Клиент ===== */
import { fetchTests, fetchQuestions, submitAnswer } from '../api/historical';

export default function HistoricalQuiz() {
  const navigate = useNavigate();

  const [quizState, setQuizState] = React.useState("start");
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
  const [testId, setTestId] = React.useState(null);
  const [questions, setQuestions] = React.useState([]);
  const [answers, setAnswers] = React.useState([]); // Сохраняем все ответы
  const [result, setResult] = React.useState(null);
  const [chatPersonality, setChatPersonality] = React.useState(null);
  const [showNotConnectedMessage, setShowNotConnectedMessage] = React.useState(false);

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

  const handleStart = () => {
    setQuizState("quiz");
    setAnswers([]); // Сбрасываем ответы при новом старте
  };

  const calculateResult = (answers) => {
    // Подсчитываем количество каждого ответа
    const counts = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    answers.forEach(answer => {
      if (counts.hasOwnProperty(answer)) {
        counts[answer]++;
      }
    });

    // Находим букву с максимальным количеством
    let maxCount = 0;
    let maxLetter = 'A';
    Object.keys(counts).forEach(letter => {
      if (counts[letter] > maxCount) {
        maxCount = counts[letter];
        maxLetter = letter;
      }
    });

    // Возвращаем данные персонажа
    const personality = personalities[maxLetter];
    return {
      personality: personality.key,
      letter: maxLetter,
      counts,
      totalQuestions: answers.length,
      ...personality
    };
  };

  const handleAnswer = async (option) => {
    const currentQuestion = questions[currentQuestionIndex];
    
    // Сохраняем ответ
    const newAnswers = [...answers, option];
    setAnswers(newAnswers);
    
    // Отправляем на сервер
    await submitAnswer(currentQuestion.id, option);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((i) => i + 1);
    } else {
      // Вычисляем результат на фронте
      const calculatedResult = calculateResult(newAnswers);
      setResult(calculatedResult);
      setQuizState("result");
    }
  };

  const handleRestart = () => {
    setQuizState("start");
    setCurrentQuestionIndex(0);
    setAnswers([]);
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
                <button onClick={() => navigate("/")} className="btn btn-tertiary">
                  ⟵ Басты бетке оралу
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
            <motion.div 
              key="result" 
              initial={{ opacity: 0, y: 8 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -8 }}
              className="space-y-6"
            >
              {/* Заголовок */}
              <div className="text-center">
                <motion.h3 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-sm md:text-base tracking-wide uppercase text-teal-600 mb-2 font-semibold"
                >
                  Сіздің тұлғаңыз
                </motion.h3>
                <motion.h2 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4"
                >
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#1F7A8C] via-[#1aa6b5] to-[#0ea5a5]">
                    {result.name}
                  </span>
                </motion.h2>
              </div>

              {/* Изображение */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="flex justify-center"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#1F7A8C]/20 to-[#0ea5a5]/20 rounded-full blur-2xl"></div>
                  <img
                    src={result.image}
                    alt={result.name}
                    className="relative w-40 h-40 md:w-48 md:h-48 rounded-full mx-auto shadow-2xl border-4 border-white object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://placehold.co/400x400/cccccc/ffffff?text=Image+Not+Found";
                    }}
                  />
                </div>
              </motion.div>

              {/* Описание */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-6"
              >
                {/* Основное описание */}
                <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-6 border border-teal-100">
                  <p className="text-base md:text-lg text-slate-800 leading-relaxed">
                    {result.description}
                  </p>
                </div>

                {/* Главная ценность */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
                  <p className="text-base md:text-lg text-slate-800 font-medium italic">
                    {result.mainValue}
                  </p>
                </div>

                {/* Күшті жақтарыңыз */}
                <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 shadow-sm">
                  <h4 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <span className="text-2xl">💪</span>
                    Күшті жақтарыңыз
                  </h4>
                  <p className="text-base text-slate-700 leading-relaxed">
                    {result.strengths}
                  </p>
                </div>

                {/* Қазіргі заманда */}
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-100">
                  <h4 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <span className="text-2xl">🚀</span>
                    Қазіргі заманда
                  </h4>
                  <p className="text-base text-slate-700 leading-relaxed">
                    {result.modernRole}
                  </p>
                </div>
              </motion.div>

              {/* Кнопки */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-3 justify-center pt-4"
              >
                <button 
                  onClick={handleRestart} 
                  className="btn btn-tertiary"
                >
                  🔄 Тестті қайта өту
                </button>
                <button 
                  onClick={() => {
                    setShowNotConnectedMessage(true);
                    setTimeout(() => setShowNotConnectedMessage(false), 3000);
                  }} 
                  className="btn btn-primary"
                >
                  ✨ {result.name.split(" ")[0]}мен сөйлесу
                </button>
                <button 
                  onClick={() => navigate("/")} 
                  className="btn btn-tertiary"
                >
                  ⟵ Басты бетке оралу
                </button>
              </motion.div>
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

      {/* Not Connected Message */}
      <AnimatePresence>
        {showNotConnectedMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="bg-white rounded-xl shadow-2xl border-2 border-amber-400 px-6 py-4 max-w-md mx-4">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <span className="text-2xl">⚠️</span>
                </div>
                <div className="flex-1">
                  <p className="text-slate-800 font-semibold text-base">
                    Бұл функция әлі қосылмады
                  </p>
                  <p className="text-slate-600 text-sm mt-1">
                    Келесі нұсқаларда қолжетімді болады
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
