// src/App.jsx
import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { Routes, Route, useNavigate } from 'react-router-dom';

import Header from './components/Header';
import HeroSection from './components/HeroSection';
import PitchSection from './components/PitchSection';
import ProductsSection from './components/ProductsSection';
import QuizModal from './components/QuizModal';
import HistoricalQuizSection from './components/HistoricalQuizSection';
import TeacherInsightSection from './components/TeacherInsightSection';
import MissionSection from './components/MissionSection';
import ScenariosSection from './components/ScenariosSection';
import FinalCtaSection from './components/FinalCtaSection';
import Footer from './components/Footer';
import ParentsSection from "./components/ParentsSection";
import RealTalkTime from './pages/RealTalkTime';
import IntellectUp from './pages/IntellectUp';
import TeacherConsole from './pages/TeacherConsole';   // ✅
import AtaLink from './pages/AtaLink';                 // ✅
import ThinkHub from "./pages/ThinkHub"; // 👈
import LifeCharge from "./pages/LifeCharge";
import HistoricalQuiz from "./pages/HistoricalQuiz";
/* -------------------- Лэндинг (Home) -------------------- */
function Home() {
  const [activeModule, setActiveModule] = React.useState(null);
  const navigate = useNavigate();

  const handleModuleClick = (module) => {
    if (module?.type === 'iq') {
      navigate('/intellectup');
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
        {activeModule && <QuizModal module={activeModule} onClose={handleCloseModal} />}
      </AnimatePresence>
    </div>
  );
}

/* -------------------- Маршруттар -------------------- */
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/intellectup" element={<IntellectUp />} />
      <Route path="/realtalktime" element={<RealTalkTime />} /> {/* 👈 қосылды */}
      <Route path="/console" element={<TeacherConsole />} />   {/* ✅ */}
      <Route path="/atalink" element={<AtaLink />} />          {/* ✅ */}
      <Route path="/thinkhub" element={<ThinkHub />} />   {/* 👈 Abai Insight */}
      <Route path="/lifecharge" element={<LifeCharge />} />
      <Route path="/historical-quiz" element={<HistoricalQuiz />} />
    </Routes>
  );
}
