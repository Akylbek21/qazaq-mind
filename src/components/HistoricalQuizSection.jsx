import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedSection from "./AnimatedSection";
import ChatModal from "./ChatModal";

const HistoricalQuizSection = () => {
  const personalities = {
    abai: {
      name: "Абай Кунанбаев",
      description:
        "Сіз даналыққа, терең ойға және өзін-өзі тануға ұмтыласыз. Шешім қабылдамас бұрын мәнін түсінуге тырысасыз, білім мен парасатты жоғары бағалайсыз.",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/8/82/Abai_Kunanbaev_1896.jpg",
      system_prompt_bio: "казахский поэт, философ...",
    },
    satpayev: {
      name: "Каныш Сатпаев",
      description:
        "Сіздің күшті қасиетіңіз – жүйелі ойлау, талдау және болашақты болжау. Әр істі ғылыми тұрғыдан зерттейсіз.",
      image:
        "https://e-history.kz/storage/tmp/resize/000/017/632/870_0_191993213.jpg",
      system_prompt_bio: "советский и казахский учёный-геолог...",
    },
    momyshuly: {
      name: "Бауыржан Момышулы",
      description:
        "Тәртіп, стратегия және батыл шешімдер – сіздің кредоңыз. Қиында жауапкершілікті алып, жоспармен әрекет етесіз.",
      image:
        "https://i.pinimg.com/originals/1a/0b/b7/1a0bb753c1264c7e6c986c52a537f09f.jpg",
      system_prompt_bio: "легендарный казахский полководец...",
    },
    dospanova: {
      name: "Хиуаз Доспанова",
      description:
        "Еш қиындық сізді тоқтатпайды. Мақсатқа табандылықпен жетесіз, жаңашылдыққа ұмтыласыз.",
      image:
        "https://e-history.kz/storage/tmp/resize/000/025/327/870_0_191993213.jpg",
      system_prompt_bio: "единственная казахская лётчица...",
    },
    khans: {
      name: "Керей мен Жәнібек",
      description:
        "Адамдарды біріктіресіз, дипломатияңыз мықты. Командада ортақ мақсатқа жұмылдырасыз.",
      image: "https://orda.kz/wp-content/uploads/2022/10/kerej-i-zhanibek.jpg",
      system_prompt_bio: "основатели и первые ханы...",
    },
    tomyris: {
      name: "Томирис",
      description:
        "Дағдарыста күшейесіз. Өз мүддеңізді қорғауда батылсыз, халқыңыз үшін тауды қопарасыз.",
      image:
        "https://i.pinimg.com/originals/9f/c7/2b/9fc72b8d0a0680196720e7a2b0c9f13d.jpg",
      system_prompt_bio: "легендарная царица массагетов...",
    },
  };

  const questions = [
    {
      text: "Сіз қиын мәселені қалай шешкенді жөн көресіз?",
      options: [
        {
          text: "Барлық деректерді зерттеп, талдау жасаймын.",
          weights: { satpayev: 3, abai: 1 },
        },
        {
          text: "Тәжірибелі адамдардан ақыл сұрап, ой елегінен өткіземін.",
          weights: { abai: 3, khans: 1 },
        },
        {
          text: "Уақыт жоғалтпай, тез әрі нақты шешім қабылдаймын.",
          weights: { momyshuly: 3, tomyris: 1 },
        },
        {
          text: "Команда жинап, міндеттерді бөліп, бірге шешемін.",
          weights: { khans: 3, satpayev: 1 },
        },
      ],
    },
    {
      text: "Сіз үшін өмірдегі ең маңызды құндылық не?",
      options: [
        {
          text: "Білім мен өзін-өзі үнемі жетілдіру.",
          weights: { abai: 3, satpayev: 2 },
        },
        {
          text: "Отанға және өз ісіне деген адалдық.",
          weights: { momyshuly: 3, dospanova: 1 },
        },
        {
          text: "Ел мен халықтың бірлігі мен игілігі.",
          weights: { khans: 3, tomyris: 1 },
        },
        {
          text: "Алға қойған мақсатқа жетудегі табандылық.",
          weights: { dospanova: 3, satpayev: 1 },
        },
      ],
    },
    {
      text: "Күтпеген қиындыққа тап болғанда, бірінші реакцияңыз?",
      options: [
        {
          text: "Салқынқандылық сақтап, талдаймын.",
          weights: { satpayev: 2, momyshuly: 2, abai: 1 },
        },
        {
          text: "Ең тиімді қорғаныс/шабуыл жоспарын ойластырамын.",
          weights: { tomyris: 3, momyshuly: 2 },
        },
        {
          text: "Бұл жағдайдан қандай сабақ алуға болатынын ойлаймын.",
          weights: { abai: 3, dospanova: 1 },
        },
        {
          text: "Серіктестеріммен бірігіп, талқылаймын.",
          weights: { khans: 3, satpayev: 1 },
        },
      ],
    },
    {
      text: "Жаңа жобаны бастағанда не маңызды?",
      options: [
        { text: "Нақты, қадамдық жоспар.", weights: { momyshuly: 3, satpayev: 2 } },
        { text: "Қоғамға пайдасы.", weights: { satpayev: 3, abai: 1 } },
        { text: "Жаңашыл болуы.", weights: { dospanova: 3, khans: 1 } },
        { text: "Команданың рухы.", weights: { khans: 3, tomyris: 1 } },
      ],
    },
    {
      text: "Сізді не шабыттандырады?",
      options: [
        { text: "Әділетсіздікпен күресу.", weights: { tomyris: 3, momyshuly: 1 } },
        { text: "Жаңа білімді игеру.", weights: { satpayev: 3, abai: 2 } },
        {
          text: "Басқаларға үлгі болу.",
          weights: { momyshuly: 2, dospanova: 2, khans: 1 },
        },
        { text: "Өмірдің мәні туралы ойлану.", weights: { abai: 3 } },
      ],
    },
  ];

  const [quizState, setQuizState] = React.useState("start");
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
  const [scores, setScores] = React.useState(
    Object.keys(personalities).reduce((acc, key) => ({ ...acc, [key]: 0 }), {})
  );
  const [resultKey, setResultKey] = React.useState(null);
  const [chatPersonality, setChatPersonality] = React.useState(null);

  const handleStart = () => setQuizState("quiz");

  const handleAnswer = (weights) => {
    const newScores = { ...scores };
    for (const key in weights) newScores[key] += weights[key];
    setScores(newScores);
    if (currentQuestionIndex < questions.length - 1)
      setCurrentQuestionIndex((i) => i + 1);
    else {
      calculateResult(newScores);
      setQuizState("result");
    }
  };

  const calculateResult = (finalScores) => {
    const result = Object.keys(finalScores).reduce((a, b) =>
      finalScores[a] > finalScores[b] ? a : b
    );
    setResultKey(result);
  };

  const handleRestart = () => {
    setQuizState("start");
    setCurrentQuestionIndex(0);
    setScores(
      Object.keys(personalities).reduce((acc, key) => ({ ...acc, [key]: 0 }), {})
    );
    setResultKey(null);
  };

  const renderContent = () => {
    if (quizState === "result" && resultKey) {
      const resultPersonality = personalities[resultKey];
      return (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.18 } } }}
          className="text-center"
        >
          <motion.h3
            variants={{
              hidden: { y: 18, opacity: 0 },
              visible: { y: 0, opacity: 1 },
            }}
            className="text-sm md:text-base tracking-wide uppercase text-teal-600 mb-2"
          >
            Сіздің тұлғаңыз
          </motion.h3>
          <motion.h2
            variants={{
              hidden: { y: 18, opacity: 0 },
              visible: { y: 0, opacity: 1 },
            }}
            className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#1F7A8C] to-[#0ea5a5]">
              {resultPersonality.name}
            </span>
          </motion.h2>
          <motion.img
            src={resultPersonality.image}
            alt={resultPersonality.name}
            variants={{ hidden: { scale: 0.9, opacity: 0 }, visible: { scale: 1, opacity: 1 } }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-40 h-40 md:w-48 md:h-48 rounded-full mx-auto mb-6 shadow-xl border-4 border-white object-cover animated-photo"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "https://placehold.co/400x400/cccccc/ffffff?text=Image+Not+Found";
            }}
          />
          <motion.p
            variants={{
              hidden: { y: 18, opacity: 0 },
              visible: { y: 0, opacity: 1 },
            }}
            className="text-base md:text-lg text-slate-700 max-w-2xl mx-auto mb-8"
          >
            {resultPersonality.description}
          </motion.p>
          <motion.div
            variants={{
              hidden: { y: 18, opacity: 0 },
              visible: { y: 0, opacity: 1 },
            }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <button onClick={handleRestart} className="btn btn-tertiary">
              Тестті қайта өту
            </button>
            <button
              onClick={() => setChatPersonality(resultPersonality)}
              className="btn btn-primary"
            >
              ✨ {resultPersonality.name.split(" ")[0]}мен сөйлесу
            </button>
          </motion.div>
        </motion.div>
      );
    }

    if (quizState === "quiz") {
      const question = questions[currentQuestionIndex];
      const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
      return (
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full"
        >
          {/* прогресс — современная линейка */}
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
            {question.options.map((option, index) => (
              <motion.button
                key={index}
                onClick={() => handleAnswer(option.weights)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="group text-left rounded-xl border-2 border-slate-200/70 bg-white p-4
                           hover:border-teal-500/70 hover:bg-teal-50/60 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 h-2.5 w-2.5 rounded-full bg-teal-500/70 group-hover:bg-teal-600" />
                  <span className="text-slate-700 group-hover:text-slate-900">
                    {option.text}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      );
    }

    // стартовый экран
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#1F7A8C] to-[#0ea5a5]">
            Сіз Қазақстанның қай тарихи тұлғасына ұқсайсыз?
          </span>
        </h2>
        <p className="max-w-2xl mx-auto text-lg text-slate-600 mb-8">
          Бірнеше сұраққа жауап беріп, қай тарихи тұлғаның рухы сізге жақын екенін анықтаңыз.
        </p>
        <motion.button onClick={handleStart} className="btn btn-primary btn-xl">
          Тестті бастау
        </motion.button>
      </motion.div>
    );
  };

  return (
    <>
      <AnimatedSection className="section-bg-ornament">
        <div className="container mx-auto max-w-4xl">
          {/* заголовок секции */}
          <div className="text-center mb-8">
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-5xl font-extrabold tracking-tight"
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#1F7A8C] via-[#1aa6b5] to-[#0ea5a5]">
                Тарихи тұлға тесті
              </span>
            </motion.h2>
            <div className="mx-auto mt-4 h-[3px] w-24 rounded-full bg-gradient-to-r from-[#1F7A8C] to-[#FFD580]" />
          </div>

          <div className="rounded-2xl p-6 md:p-10 bg-white/80 backdrop-blur-xl border border-slate-200/70 shadow-[0_10px_30px_rgba(16,37,66,0.06)]">
            <AnimatePresence mode="wait">
              <motion.div
                key={quizState + currentQuestionIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="w-full"
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </AnimatedSection>

      <AnimatePresence>
        {chatPersonality && (
          <ChatModal
            personality={chatPersonality}
            onClose={() => setChatPersonality(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default HistoricalQuizSection;
