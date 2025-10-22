import React from "react";
import { motion } from "framer-motion";
import AnimatedSection from "./AnimatedSection";

const ParentsSection = () => {
  const bars = [
    { label: "IQ", color: "from-sky-500 to-cyan-400", value: 85, delay: 0.15 },
    { label: "EQ", color: "from-rose-500 to-orange-400", value: 60, delay: 0.3 },
    { label: "SQ", color: "from-amber-400 to-yellow-300", value: 75, delay: 0.45 },
    { label: "PQ", color: "from-emerald-500 to-lime-400", value: 90, delay: 0.6 },
  ];

  return (
    <AnimatedSection className="section-bg-ornament" id="parents">
      <div className="container mx-auto">
        {/* Title */}
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-5xl font-extrabold tracking-tight"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#1F7A8C] via-[#1aa6b5] to-[#0ea5a5]">
              Ата-аналар кабинеті
            </span>
          </motion.h2>
          <p className="mt-3 max-w-3xl mx-auto text-lg text-slate-600">
            Балаңыздың дамуына белсенді қатысыңыз. Платформа ата-аналарға баланың оқу
            үдерісін түсінуге және үйде қолдау көрсетуге арналған құралдар ұсынады.
          </p>
          <div className="mx-auto mt-6 h-[3px] w-24 rounded-full bg-gradient-to-r from-[#1F7A8C] to-[#FFD580]" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {/* Progress card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-2 relative rounded-2xl bg-white/80 backdrop-blur-xl border border-slate-200/70
                       shadow-[0_14px_38px_rgba(16,37,66,0.08)] p-8 overflow-hidden"
          >
            {/* subtle corner glow */}
            <span className="pointer-events-none absolute -top-20 -left-16 h-52 w-52 rounded-full blur-3xl opacity-20 bg-cyan-300" />
            <span className="pointer-events-none absolute -bottom-24 -right-16 h-56 w-56 rounded-full blur-3xl opacity-20 bg-amber-200" />

            <div className="relative">
              <h3 className="text-2xl font-bold text-slate-900">Аружанның даму картасы</h3>
              <p className="text-slate-600 mb-6">Соңғы 30 күндегі интеллект түрлері бойынша үлгерім.</p>

              <div className="space-y-5">
                {bars.map((b, i) => (
                  <div key={b.label} className="grid grid-cols-[64px_1fr] items-center gap-3">
                    <span className="text-sm md:text-base font-semibold text-slate-800">{b.label}</span>
                    <div className="w-full h-4 md:h-5 rounded-full bg-slate-200 overflow-hidden relative">
                      {/* track shine */}
                      <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,.25)_0%,transparent_30%,transparent_70%,rgba(255,255,255,.25)_100%)]" />
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${b.value}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.1, delay: b.delay, ease: "easeOut" }}
                        className={`h-full rounded-full bg-gradient-to-r ${b.color} relative`}
                      >
                        <motion.span
                          initial={{ opacity: 0, x: -8 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.4, delay: b.delay + 0.4 }}
                          className="absolute right-1 -top-7 text-xs font-bold text-slate-700"
                        >
                          {b.value}%
                        </motion.span>
                      </motion.div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* AI tip card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative rounded-2xl border border-teal-200/70 bg-gradient-to-b from-teal-50/90 to-white/90
                       backdrop-blur-xl shadow-[0_14px_38px_rgba(31,122,140,0.10)] p-8"
          >
            <div className="mb-4 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-teal-500" />
              <h3 className="text-2xl font-bold text-teal-900">ЖИ кеңесі</h3>
            </div>
            <p className="text-teal-800/90">
              Аружанның эмоционалдық интеллекті (EQ) төмендеуде. Оның сезімдері туралы ашық
              сөйлесуге тырысыңыз. Мысалы, «Бүгін сені не қуантты, не нәрсе көңіліңе тиді?» деп сұраңыз.
            </p>

            <div className="mt-6">
              <a
                href="#contact"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5
                           bg-gradient-to-r from-[#1F7A8C] to-[#0ea5a5] text-white font-semibold
                           shadow-[0_6px_18px_rgba(31,122,140,.25)] hover:shadow-[0_10px_26px_rgba(31,122,140,.32)]
                           transition-transform duration-200 active:scale-[.98]"
              >
                Мұғаліммен хабарласу
                <svg
                  className="h-4 w-4 opacity-90"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>

            {/* corner glow */}
            <span className="pointer-events-none absolute -top-10 right-6 h-24 w-24 rounded-full blur-2xl opacity-40 bg-teal-200" />
          </motion.div>
        </div>
      </div>
    </AnimatedSection>
  );
};

export default ParentsSection;
