// src/App.jsx
import React from "react";
import { AnimatePresence } from "framer-motion";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";

import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import PitchSection from "./components/PitchSection";
import ProductsSection from "./components/ProductsSection";
import QuizModal from "./components/QuizModal";
import HistoricalQuizSection from "./components/HistoricalQuizSection";
import TeacherInsightSection from "./components/TeacherInsightSection";
import MissionSection from "./components/MissionSection";
import ScenariosSection from "./components/ScenariosSection";
import FinalCtaSection from "./components/FinalCtaSection";
import Footer from "./components/Footer";
import ParentsSection from "./components/ParentsSection";

import RealTalkTime from "./pages/RealTalkTime";
import IntellectUp from "./pages/IntellectUp";
import TeacherConsole from "./pages/TeacherConsole";
import AtaLink from "./pages/AtaLink";
import ThinkHub from "./pages/ThinkHub";
import LifeCharge from "./pages/LifeCharge";
import HistoricalQuiz from "./pages/HistoricalQuiz";

// Егер әмбебап викторина бетін қостыңыз (мен берген код):
// src/pages/LitQuiz.jsx
import LitQuiz from "./pages/LitQuiz";

/* -------------------- Scroll to top on route change -------------------- */
function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

/* -------------------- 404 (Not Found) -------------------- */
function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900">
        Бет табылмады
      </h1>
      <p className="mt-3 text-slate-600">
        Сілтеме дұрыс емес сияқты. Басты бетке оралыңыз.
      </p>
      <div className="mt-6 flex gap-3">
        <button className="btn btn-primary" onClick={() => navigate("/")}>
          ⟵ Басты бет
        </button>
        <button className="btn btn-tertiary" onClick={() => navigate(-1)}>
          Алдыңғы бет
        </button>
      </div>
    </div>
  );
}

/* -------------------- Лэндинг (Home) -------------------- */
function Home() {
  const [activeModule, setActiveModule] = React.useState(null);
  const navigate = useNavigate();

  const handleModuleClick = (module) => {
    if (module?.type === "iq") {
      navigate("/intellectup");
      return;
    }
    setActiveModule(module);
  };

  const handleCloseModal = () => setActiveModule(null);

  return (
    <div className="bg-white font-sans">
      <Header />
      <main>
        <HeroSection />
        <PitchSection />
        <ProductsSection onModuleClick={handleModuleClick} />
        <HistoricalQuizSection />
        <TeacherInsightSection />
        <ParentsSection />
        <MissionSection />
        <ScenariosSection />
        <FinalCtaSection />
      </main>
      <Footer />
      <AnimatePresence>
        {activeModule && (
          <QuizModal module={activeModule} onClose={handleCloseModal} />
        )}
      </AnimatePresence>
    </div>
  );
}

/* -------------------- Маршруттар -------------------- */
export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Home */}
        <Route path="/" element={<Home />} />

        {/* Modules */}
        <Route path="/intellectup" element={<IntellectUp />} />
        <Route path="/realtalktime" element={<RealTalkTime />} />
        <Route path="/lifecharge" element={<LifeCharge />} />

        {/* Admin / Tools */}
        <Route path="/console" element={<TeacherConsole />} />
        <Route path="/atalink" element={<AtaLink />} />
        <Route path="/thinkhub" element={<ThinkHub />} />

        {/* Quizzes */}
        <Route path="/historical-quiz" element={<HistoricalQuiz />} />
        {/* Әмбебап әдеби викторина: /quiz/jusan, /quiz/ushkan-uya, т.б. */}
        <Route path="/quiz/:slug" element={<LitQuiz />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
