// src/components/HistoricalQuizSection.jsx
import React from "react";
import { motion } from "framer-motion";
import AnimatedSection from "./AnimatedSection";
import { useNavigate } from "react-router-dom";

export default function HistoricalQuizSection() {
  const navigate = useNavigate();
  return (
    <AnimatedSection className="section-bg-ornament">
      <div className="container mx-auto max-w-4xl text-center">
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
        <p className="max-w-2xl mx-auto text-lg text-slate-600 mt-6">
          Бірнеше сұраққа жауап беріп, қай тарихи тұлғаның рухы сізге жақын екенін анықтаңыз.
        </p>
        <button onClick={() => navigate("/historical-quiz")} className="btn btn-primary btn-xl mt-6">
          Тестті бастау
        </button>
      </div>
    </AnimatedSection>
  );
}
