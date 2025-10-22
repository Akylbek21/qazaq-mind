import React from "react";
import { motion } from "framer-motion";
import AnimatedSection from "./AnimatedSection";

const PitchSection = () => (
  <AnimatedSection className="bg-transparent">
    <div className="container mx-auto text-center max-w-5xl">
      {/* Современный заголовок с мягким градиентом и акцентной чертой */}
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

      {/* Тонкая линия-акцент */}
      <div className="mx-auto mt-4 h-[3px] w-24 rounded-full bg-gradient-to-r from-[#1F7A8C] to-[#FFD580]" />

      {/* «Стеклянная» карточка c современными тенями */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.1, ease: "easeOut" }}
        className="relative mx-auto mt-8 rounded-2xl border border-white/20 bg-white/70 backdrop-blur-xl p-6 md:p-8 shadow-[0_10px_30px_rgba(16,37,66,0.08)]"
      >
        {/* Декоративный градиентный блик */}
        <div className="pointer-events-none absolute -top-12 right-8 h-24 w-24 rounded-full bg-gradient-to-tr from-[#FFD580]/60 to-[#1F7A8C]/50 blur-2xl opacity-60" />

        <p className="text-lg md:text-xl leading-relaxed text-slate-700">
          <span className="font-semibold text-slate-900">Qazaq Mind</span> – мұғалімдер мен
          оқушыларға арналған мобильді платформа. ЖИ әр оқушының{" "}
          <span className="font-medium">IQ, EQ, SQ, PQ</span> балансын талдап, жеке даму
          траекториясын ұсынады. Мұғалімнің рөлі «білім берушіден» – менторға
          көтеріледі: эмоциялық байланыс, құндылық, топтық рух. ЖИ қағазбастылықты
          қысқартады, мұғалім – жүрекпен жұмыс істейді.
        </p>

        {/* Маленькие бейджи-факты для «современного» вайба */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
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
      </motion.div>
    </div>
  </AnimatedSection>
);

export default PitchSection;
