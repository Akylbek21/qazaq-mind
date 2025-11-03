// src/components/PitchSection.jsx
import React from "react";
import { motion } from "framer-motion";
import AnimatedSection from "./AnimatedSection";

const DEFAULT_IMAGE = "/iq-eq-sq-pq.jpeg";

const PitchSection = ({ imageUrl }) => {
  const imgSrc = imageUrl || DEFAULT_IMAGE;

  return (
    <AnimatedSection className="bg-gradient-to-b from-slate-50 via-white to-slate-50 py-20 md:py-28">
      <div className="container mx-auto max-w-6xl px-4 md:px-6">

        {/* ЗАГОЛОВОК */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <motion.h2
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#1F7A8C] via-[#1aa6b5] to-[#0ea5a5] drop-shadow-sm">
              Платформа туралы
            </span>
          </motion.h2>
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: "100px" }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mx-auto h-1 rounded-full bg-gradient-to-r from-[#1F7A8C] via-[#FFD580] to-[#0ea5a5]"
          />
        </motion.div>

        {/* ИЗОБРАЖЕНИЕ */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative mx-auto max-w-4xl mb-12 md:mb-16"
        >
          {/* Декоративный градиентный фон */}
          <div className="absolute -inset-4 md:-inset-8 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-emerald-500/20 rounded-3xl blur-2xl opacity-50" />
          
          {/* Карточка с изображением */}
          <div className="relative rounded-3xl border-2 border-slate-200/70 bg-white/90 backdrop-blur-xl overflow-hidden shadow-[0_20px_60px_rgba(16,37,66,0.15)]">
            <img
              src={imgSrc}
              alt="IQ, EQ, SQ, PQ визуал"
              loading="lazy"
              onError={(e) => { e.currentTarget.src = DEFAULT_IMAGE; }}
              className="w-full h-auto object-cover"
            />
            {/* Декоративная рамка */}
            <div className="absolute inset-0 pointer-events-none ring-2 ring-inset ring-white/60" />
            {/* Градиентный оверлей внизу */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white/80 to-transparent pointer-events-none" />
          </div>
          
          {/* Декоративные элементы */}
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-400/30 to-purple-400/30 rounded-full blur-xl opacity-50"
          />
          <motion.div
            animate={{ rotate: [360, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-emerald-400/30 to-pink-400/30 rounded-full blur-xl opacity-50"
          />
        </motion.div>

        {/* ЗАГОЛОВОК ВНИЗУ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <motion.p
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-2xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#1F7A8C] via-[#1aa6b5] to-[#0ea5a5] inline-block">
              IQ + EQ + SQ + PQ
            </span>
            <br />
            <span className="text-xl md:text-3xl lg:text-4xl text-slate-700">
              — толық адам
            </span>
          </motion.p>
          
          {/* Декоративные линии */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex justify-center items-center gap-4 mt-8"
          >
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#1F7A8C]" />
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#1F7A8C] to-[#0ea5a5]" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#0ea5a5]" />
          </motion.div>
        </motion.div>
      </div>
    </AnimatedSection>
  );
};

export default PitchSection;
