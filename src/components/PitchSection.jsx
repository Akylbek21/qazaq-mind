// src/components/PitchSection.jsx
import React from "react";
import { motion } from "framer-motion";
import AnimatedSection from "./AnimatedSection";

const DEFAULT_IMAGE = "/iq-eq-sq-pq.jpeg";

const PitchSection = ({ imageUrl }) => {
  const imgSrc = imageUrl || DEFAULT_IMAGE;

  return (
    <AnimatedSection className="bg-transparent">
      <div className="container mx-auto max-w-5xl px-4 text-center">

        {/* ТАҚЫРЫП — ЖОҒАРЫДА */}
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mx-auto text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900"
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#1F7A8C] via-[#1aa6b5] to-[#0ea5a5]">
            Платформа туралы
          </span>
        </motion.h2>
        <div className="mx-auto mt-3 h-[3px] w-24 rounded-full bg-gradient-to-r from-[#1F7A8C] to-[#FFD580]" />

        {/* СУРЕТ */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative mx-auto mt-8 overflow-hidden rounded-3xl ring-1 ring-slate-900/10 shadow-2xl bg-gradient-to-br from-slate-50 to-slate-100"
        >
          <img
            src={imgSrc}
            alt="IQ, EQ, SQ, PQ визуал"
            loading="lazy"
            onError={(e) => { e.currentTarget.src = DEFAULT_IMAGE; }}
            className="w-full h-auto object-cover"
          />
          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/20" />
        </motion.div>

        {/* ҚЫСҚА ЖАЗУ */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut", delay: 0.05 }}
          className="mt-6 text-2xl md:text-3xl font-extrabold tracking-tight"
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#1F7A8C] via-[#1aa6b5] to-[#0ea5a5]">
            IQ + EQ + SQ + PQ — толық адам
          </span>
        </motion.p>
      </div>
    </AnimatedSection>
  );
};

export default PitchSection;
