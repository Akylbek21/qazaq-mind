import React from "react";
import { motion, useInView } from "framer-motion";
import { BrainIcon, HeartIcon, SpiritIcon, BodyIcon, TeacherIcon, AdminIcon } from "./Icons";

const ProductsSection = ({ onModuleClick }) => {
  const products = [
    {
      type: "iq",
      title: "Danalyq Challenge (IQ)",
      description: "Логикалық квиздер, бейімделетін деңгей, күнделікті челлендждер.",
      Icon: BrainIcon,
      color: "text-blue-500",
      interactive: true,
      initialQuestion:
        "Егер 5 машина 5 минутта 5 бөлшек жасаса, 100 машина 100 бөлшекті қанша минутта жасайды?",
    },
    {
      type: "eq",
      title: "SelfTalk (EQ)",
      description:
        "Эмоциялық күйге бейімделген кеңесші: рефлексия, тыныс жаттығулары, микро-коучинг.",
      Icon: HeartIcon,
      color: "text-red-500",
      interactive: true,
      initialQuestion:
        "Соңғы рет қашан біреуге көмектесіп, одан ләззат алдыңыз? Сол кездегі сезімдеріңізді сипаттаңыз.",
    },
    {
      type: "sq",
      title: "Abai Insight (SQ)",
      description:
        "Абай ілімімен «ойлану сәттері»: күнге/аптаға арналған қысқа трактаттар, сұрақтар.",
      Icon: SpiritIcon,
      color: "text-yellow-500",
      interactive: true,
      initialQuestion:
        "Абайдың 'Адамның жақсысы - ісімен жақсы' деген сөзін бүгінгі күн тұрғысынан қалай түсінесіз?",
    },
    {
      type: "pq",
      title: "Digital Detox (PQ)",
      description:
        "Дене жаттығулары, экран уқыты лимиті, ұйқы-гидратация еске салғыштары.",
      Icon: BodyIcon,
      color: "text-green-500",
      interactive: false,
    },
    {
      type: "teacher",
      title: "Teacher Console",
      description:
        "Журнал, бағалау, рефлексия, топтық динамика, ата-анаға қысқа есеп.",
      Icon: TeacherIcon,
      color: "text-purple-500",
      interactive: false,
    },
    {
      type: "admin",
      title: "Admin Dashboard",
      description:
        "Мектеп деңгейіндегі метрикалар, қағазбастылықты автоматтандыру.",
      Icon: AdminIcon,
      color: "text-indigo-500",
      interactive: false,
    },
  ];

  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
  const itemVariants = {
    hidden: { y: 18, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <section ref={ref} id="products" className="py-16 md:py-24 px-6 lg:px-8 section-bg-ornament">
      <div className="container mx-auto max-w-6xl">
        {/* Современный заголовок по центру */}
        <div className="text-center">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-5xl font-extrabold tracking-tight"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#1F7A8C] via-[#1aa6b5] to-[#0ea5a5]">
              Платформа модульдері
            </span>
          </motion.h2>
          <div className="mx-auto mt-4 h-[3px] w-24 rounded-full bg-gradient-to-r from-[#1F7A8C] to-[#FFD580]" />
        </div>

        {/* Карточки модулей */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
        >
          {products.map((p, i) => (
            <motion.button
              type="button"
              key={i}
              variants={itemVariants}
              onClick={() => p.interactive && onModuleClick?.(p)}
              className={`group relative text-left rounded-2xl border border-slate-200/70 bg-white/80 backdrop-blur-xl p-6 md:p-7 
                          shadow-[0_10px_30px_rgba(16,37,66,0.06)] transition-all duration-300 hover:-translate-y-1 
                          hover:shadow-[0_16px_40px_rgba(16,37,66,0.12)] focus:outline-none focus:ring-2 focus:ring-teal-500/60
                          ${p.interactive ? "" : "cursor-default"}`}
            >
              {/* Светящийся обводочный штрих при ховере */}
              <span
                className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition
                           bg-[conic-gradient(from_180deg_at_50%_50%,#1F7A8C33_0%,#FFD58033_50%,#1F7A8C33_100%)]"
              />

              <div className="relative flex items-center mb-3">
                <p.Icon className={`w-10 h-10 mr-4 ${p.color}`} />
                <h3 className="text-xl font-bold text-slate-900 leading-tight">{p.title}</h3>
              </div>

              <p className="relative text-slate-600">{p.description}</p>

              {/* CTA для интерактивных */}
              {p.interactive && (
                <div className="relative mt-4 inline-flex items-center text-sm font-semibold text-teal-700">
                  Тапсырманы орындау
                  <svg
                    className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </motion.button>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ProductsSection;
