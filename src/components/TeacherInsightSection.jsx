import React from "react";
import { motion } from "framer-motion";
import AnimatedSection from "./AnimatedSection";

const TeacherInsightSection = () => {
  const insights = [
    {
      student: "Азат Арманұлы",
      analysis:
        "Логикалық тапсырмаларда қиналады, бірақ тарихи тұлғалармен диалогта белсенділік танытты.",
      suggestion:
        "Оның тарихқа қызығушылығын пайдаланып, келесі сабақта пікірталас ұйымдастырыңыз.",
      color: "from-blue-500/15 to-blue-500/0",
      dot: "bg-blue-500",
    },
    {
      student: "Раяна Бекжанқызы",
      analysis:
        "Соңғы екі күнде SelfTalk модулінде сенімсіздік пен уайымға толы жауаптар қалдырған.",
      suggestion:
        "Сабақтан кейін жеке сөйлесіп, көңіл-күйін сұрап, қолдау көрсетіңіз.",
      color: "from-rose-500/15 to-rose-500/0",
      dot: "bg-rose-500",
    },
    {
      student: "Қуаныш Ержанұлы",
      analysis:
        "Danalyq Challenge-де үнемі жоғары нәтиже көрсетіп, қосымша қиын тапсырмалар сұрайды.",
      suggestion:
        "Оған олимпиадалық есептер жинағын немесе күрделірек тақырыпты зерттеуді ұсыныңыз.",
      color: "from-emerald-500/15 to-emerald-500/0",
      dot: "bg-emerald-500",
    },
  ];

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12 } },
  };

  const item = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <AnimatedSection className="section-bg-ornament">
      <div className="container mx-auto">
        {/* Title */}
        <div className="text-center mb-10">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-5xl font-extrabold tracking-tight"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#1F7A8C] via-[#1aa6b5] to-[#0ea5a5]">
              Эмпатия күші
            </span>
          </motion.h2>
          <p className="mt-3 text-slate-600 max-w-3xl mx-auto">
            Qazaq Mind мұғалімді алмастырмайды — оның әсерін күшейтеді: деректер
            мен рефлексия арқылы әр оқушыға шынайы қолдау.
          </p>
          <div className="mx-auto mt-5 h-[3px] w-24 rounded-full bg-gradient-to-r from-[#1F7A8C] to-[#FFD580]" />
        </div>

        {/* Cards */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {insights.map((i, idx) => (
            <motion.div
              key={idx}
              variants={item}
              whileHover={{ y: -4 }}
              className="group relative rounded-2xl bg-white/90 backdrop-blur-xl border border-slate-200/70 p-6 shadow-[0_10px_30px_rgba(16,37,66,0.06)]"
            >
              {/* subtle gradient glow */}
              <div
                className={`pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-b ${i.color}`}
              />
              <div className="relative">
                <div className="flex items-center gap-2 mb-4">
                  <span className={`h-2.5 w-2.5 rounded-full ${i.dot}`} />
                  <h3 className="text-lg font-bold text-slate-900">
                    {i.student}
                  </h3>
                </div>

                <div className="space-y-3 text-slate-700">
                  <p>
                    <span className="font-semibold text-slate-800">Талдау: </span>
                    {i.analysis}
                  </p>
                  <div className="rounded-xl border border-teal-200 bg-teal-50/80 p-3">
                    <p className="text-teal-800">
                      <span className="font-semibold">Ұсыныс: </span>
                      {i.suggestion}
                    </p>
                  </div>
                </div>

                {/* CTA */}
                {/*<div className="mt-5">*/}
                {/*  <button*/}
                {/*    className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5*/}
                {/*               bg-gradient-to-r from-[#1F7A8C] to-[#0ea5a5] text-white font-semibold*/}
                {/*               shadow-[0_6px_18px_rgba(31,122,140,.25)] hover:shadow-[0_10px_26px_rgba(31,122,140,.32)]*/}
                {/*               transition-transform duration-200 active:scale-[.98]"*/}
                {/*  >*/}
                {/*    Қолдау жоспарын құру*/}
                {/*    <svg*/}
                {/*      className="h-4 w-4 opacity-90"*/}
                {/*      viewBox="0 0 24 24"*/}
                {/*      fill="none"*/}
                {/*      stroke="currentColor"*/}
                {/*      strokeWidth="2"*/}
                {/*      strokeLinecap="round"*/}
                {/*      strokeLinejoin="round"*/}
                {/*    >*/}
                {/*      <path d="M5 12h14" />*/}
                {/*      <path d="M12 5l7 7-7 7" />*/}
                {/*    </svg>*/}
                {/*  </button>*/}
                {/*</div>*/}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </AnimatedSection>
  );
};

export default TeacherInsightSection;
