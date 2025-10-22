import React from 'react';
import { AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import PitchSection from './components/PitchSection';
import ProductsSection from './components/ProductsSection';
import QuizModal from './components/QuizModal';
import HistoricalQuizSection from './components/HistoricalQuizSection';
import TeacherInsightSection from './components/TeacherInsightSection';
import GeminiInsightSection from './components/GeminiInsightSection';
import MissionSection from './components/MissionSection';
import ScenariosSection from './components/ScenariosSection';
import RoadmapSection from './components/RoadmapSection';
import FinalCtaSection from './components/FinalCtaSection';
import Footer from './components/Footer';
import ParentsSection from "./components/ParentsSection";
export default function App() {
  const [activeModule, setActiveModule] = React.useState(null);
  const handleModuleClick = (module) => setActiveModule(module);
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
        <GeminiInsightSection />
        <MissionSection />
        <ScenariosSection />
        <RoadmapSection />
        <FinalCtaSection />
      </main>
      <Footer />
      <AnimatePresence>
        {activeModule && <QuizModal module={activeModule} onClose={handleCloseModal} />}
      </AnimatePresence>
    </div>
  );
}
