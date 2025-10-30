// src/components/PitchSection.jsx
import React from "react";
import { motion } from "framer-motion";
import AnimatedSection from "./AnimatedSection";

const DEFAULT_IMAGE = "/img/pitch-hero.jpg"; // public/img ішіндегі файл

const PitchSection = ({ imageUrl }) => {
  const imgSrc = imageUrl || DEFAULT_IMAGE;

  return (
    <AnimatedSection className="bg-transparent">
      <div className="container mx-auto max-w-6xl px-4 text-center">
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

        <div className="mx-auto mt-4 h-[3px] w-24 rounded-full bg-gradient-to-r from-[#1F7A8C] to-[#FFD580]" />

        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1, ease: "easeOut" }}
          className="relative mx-auto mt-8 overflow-hidden rounded-3xl border border-white/20 bg-white/70 p-0 shadow-[0_10px_30px_rgba(16,37,66,0.08)] backdrop-blur-xl"
        >
          <div className="pointer-events-none absolute -top-20 -right-12 h-56 w-56 rounded-full bg-gradient-to-tr from-[#FFD580]/60 to-[#1F7A8C]/50 blur-3xl opacity-70" />
          <div className="pointer-events-none absolute -bottom-24 -left-10 h-64 w-64 rounded-full bg-gradient-to-tr from-cyan-200/40 to-transparent blur-3xl opacity-70" />

          <div className="grid md:grid-cols-2 gap-6 md:gap-10 p-6 md:p-10 text-left">
            <div className="order-2 md:order-1">
              <p className="text-lg md:text-xl leading-relaxed text-slate-700">
                <span className="font-semibold text-slate-900">Qazaq Mind</span> – мұғалімдер мен
                оқушыларға арналған мобильді платформа. ЖИ әр оқушының{" "}
                <span className="font-medium">IQ·EQ·SQ·PQ</span> теңгерімін талдап, жеке даму траекториясын ұсынады.
                Мұғалімнің рөлі <span className="font-semibold">білім берушіден менторға</span> ауысып, эмоциялық байланыс,
                құндылық және топтық рухты күшейтеді. ЖИ қағазбастылықты қысқартады, педагог жүрекпен жұмыс істейді.
              </p>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl border border-slate-200/70 bg-white/70 p-4">
                  <p className="text-sm text-slate-500">Адаптивті ұсыныстар</p>
                  <p className="mt-1 font-semibold text-slate-800">Жеке траектория</p>
                </div>
                <div className="rounded-xl border border-slate-200/70 bg-white/70 p-4">
                  <p className="text-sm text-slate-500">4 интеллект картасы</p>
                  <p className="mt-1 font-semibold text-slate-800">IQ • EQ • SQ • PQ</p>
                </div>
                <div className="rounded-xl border border-slate-200/70 bg-white/70 p-4">
                  <p className="text-sm text-slate-500">Мұғалімге көмек</p>
                  <p className="mt-1 font-semibold text-slate-800">Қағазбастылық ↓</p>
                </div>
              </div>
            </div>

            <figure className="order-1 md:order-2">
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.05 }}
                className="relative aspect-[5/4] w-full overflow-hidden rounded-2xl ring-1 ring-slate-900/10 shadow-2xl bg-gradient-to-br from-slate-50 to-slate-100"
              >
                <motion.img
                  src={imgSrc}
                  alt="Ментор мен оқушы"
                  loading="lazy"
                  onError={(e) => { e.currentTarget.src = DEFAULT_IMAGE; }}
                  className="h-full w-full object-cover"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 120, damping: 14 }}
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
                <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/20" />
              </motion.div>
              <figcaption className="mt-3 text-center text-sm text-slate-500">«Ұстаз — ментор» сәті</figcaption>
            </figure>
          </div>
        </motion.section>
      </div>
    </AnimatedSection>
  );
};

export default PitchSection;
