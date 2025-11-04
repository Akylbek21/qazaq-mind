// src/components/ProductsSection.jsx
import React from "react";
import {motion, useInView} from "framer-motion";
import {Link, useNavigate} from "react-router-dom";
import {useAuth} from "../auth/AuthContext";
import {
    BrainIcon,
    HeartIcon,
    SpiritIcon,
    BodyIcon,
    TeacherIcon,
} from "./Icons";

const ProductsSection = ({onModuleClick}) => {
    const MODULE_ROUTES = {
        iq: "/intellect-up",
        eq: "/realtalk",
        teacher: "/teacher-console",
        atalink: "/atalink",
        sq: "/thinkhub",
        pq: "/lifecharge",
    };

    const {role} = useAuth();

    // Разрешённые модули по ролям
    const allowedByRole = (r) => {
        const R = String(r || "").toUpperCase();
        if (R === "TEACHER") return (t) => true;
        if (R === "PARENT") return (t) => t === "atalink";
        if (R === "STUDENT") return (t) => ["sq", "eq", "iq", "pq"].includes(t);
        // по умолчанию — показываем все как доступные
        return (t) => true;
    };

    const isAllowed = allowedByRole(role);

    const products = [
        {
            type: "iq",
            title: "Danalyq Challenge (IQ)",
            description:
                "IntellectUp – «Ақылды ойдың иесі бол!»\n" +
                "Ұраны: «Ойыңды шыңда, ақылыңды ұшта!»\n" +
                "Мақсаты: Оқушылардың сыни және шығармашылық ойлауын дамыту, логикалық және аналитикалық қабілеттерін жетілдіру",
            Icon: BrainIcon,
            color: "text-blue-500",
            interactive: true,
            cta: "Тапсырманы орындау",
            initialQuestion:
                "Егер 5 машина 5 минутта 5 бөлшек жасаса, 100 машина 100 бөлшекті қанша минутта жасайды?",
        },
        {
            type: "eq",
            title: "SelfTalk (EQ)",
            description:
                "RealTalkTime – «Шынайы сөйлесу уақыты»\n" +
                "Ұраны: «Телефонды қой, шынайы сөйлес» \n" +
                "Мақсаты: Оқушылардың эмоциялық интеллектісін дамыту, өз сезімін түсіну және басқару дағдыларын қалыптастыру",
            Icon: HeartIcon,
            color: "text-red-500",
            interactive: true,
            cta: "Жаттығуды бастау",
            initialQuestion:
                "Соңғы рет қашан біреуге көмектесіп, одан ләззат алдыңыз? Сол кездегі сезімдеріңізді сипаттаңыз.",
        },
        {
            type: "sq",
            title: "Abai Insight (SQ)",
            description:
                "ThinkHubBala – «Ой орталығы, хаб»\n" +
                "Ұраны: «Даналық – осында!»\n" +
                "Мақсаты: Абайдың рухани мұрасы арқылы адамгершілік, рухани және мәдени сана қалыптастыру",
            Icon: SpiritIcon,
            color: "text-yellow-500",
            interactive: true,
            cta: "Оқуды бастау",
            initialQuestion:
                "Абайдың 'Адамның жақсысы - ісімен жақсы' деген сөзін бүгінгі күн тұрғысынан қалай түсінесіз?",
        },
        {
            type: "pq",
            title: "Digital Detox (PQ)",
            description:
                "LifeCharge – «Өміріңе энергия қос!»\n" +
                "Ұраны: «Экранды өшір, өмірді қос!»\n" +
                "Мақсаты: Оқушылардың денсаулығын қорғау, цифрлық тәуелділікті азайту және өмірлік белсенділікті арттыру",
            Icon: BodyIcon,
            color: "text-green-500",
            interactive: true,
            cta: "Detox-ты бастау",
        },
        {
            type: "teacher",
            title: "Ақылды көмекші",
            description:
                "Teacher console – «Ақылды көмекші»\n" +
                "Ұраны: «Білімді басқар, уақытты үнемде!»\n" +
                "Мақсаты: Мұғалімдерге арналған цифрлық және әдістемелік қолдау платформасы",
            Icon: TeacherIcon,
            color: "text-purple-500",
            interactive: true,   // ✅
            cta: "Консольге кіру",
        },
        {
            type: "atalink",
            title: "AtaLink",
            description:
                "AtaLink – «Ата–анамен байланыс көпірі»\n" +
                "Ұраны: «Бала – ортақ жауапкершілік»\n" +
                "Мақсаты: Ата–ана мен мектеп арасындағы өзара сенімді ашық және тұрақты серіктестікті нығайту",
            Icon: TeacherIcon,
            color: "text-amber-500",
            interactive: true,    // ✅
            cta: "Ашу",
        },
    ];

    const navigate = useNavigate();
    const ref = React.useRef(null);
    const isInView = useInView(ref, {once: true, amount: 0.2});

    const containerVariants = {hidden: {}, visible: {transition: {staggerChildren: 0.08}}};
    const itemVariants = {
        hidden: {y: 18, opacity: 0},
        visible: {y: 0, opacity: 1, transition: {duration: 0.5, ease: "easeOut"}},
    };

    const handleCardClick = (p) => {
        const route = MODULE_ROUTES[p.type];
        if (p.interactive && route) return navigate(route);
        if (p.interactive) onModuleClick?.(p);
    };

    return (
        <section ref={ref} id="products" className="py-16 md:py-24 px-6 lg:px-8 section-bg-ornament">
            <div className="container mx-auto max-w-6xl">
                <div className="text-center">
                    <motion.h2
                        initial={{opacity: 0, y: 12}}
                        animate={isInView ? {opacity: 1, y: 0} : {}}
                        transition={{duration: 0.5}}
                        className="text-3xl md:text-5xl font-extrabold tracking-tight"
                    >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#1F7A8C] via-[#1aa6b5] to-[#0ea5a5]">
              Платформа модульдері
            </span>
                    </motion.h2>
                    <div
                        className="mx-auto mt-4 h-[3px] w-24 rounded-full bg-gradient-to-r from-[#1F7A8C] to-[#FFD580]"/>
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
                >
                    {products.map((p) => {
                        const route = MODULE_ROUTES[p.type];
                        const allowed = Boolean(p.interactive && isAllowed(p.type));
                        return (
                            <motion.div
                                key={p.type}
                                variants={itemVariants}
                                role={allowed ? "button" : "group"}
                                tabIndex={allowed ? 0 : -1}
                                aria-label={p.title}
                                aria-disabled={!allowed}
                                onClick={() => allowed && handleCardClick(p)}
                                onKeyDown={(e) => e.key === "Enter" && allowed && handleCardClick(p)}
                                className={`group relative text-left rounded-2xl border border-slate-200/70 bg-white/80 backdrop-blur-xl p-6 md:p-7 
                            shadow-[0_10px_30px_rgba(16,37,66,0.06)] transition-all duration-300 ${
                                    allowed
                                        ? "hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(16,37,66,0.12)] focus:outline-none focus:ring-2 focus:ring-teal-500/60 cursor-pointer"
                                        : "cursor-not-allowed opacity-50"
                                }`}
                            >
                                <span
                                    className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition bg-[conic-gradient(from_180deg_at_50%_50%,#1F7A8C33_0%,#FFD58033_50%,#1F7A8C33_100%)]"/>

                                <div className="relative flex items-center mb-3">
                                    <p.Icon className={`w-10 h-10 mr-4 ${p.color}`}/>
                                    <h3 className="text-xl font-bold text-slate-900 leading-tight">{p.title}</h3>
                                </div>

                                <p className="relative text-slate-600">{p.description}</p>

                                {p.interactive && (
                                    <div
                                        className="relative mt-4 inline-flex items-center text-sm font-semibold text-teal-700">
                                        {allowed ? (
                                            route ? (
                                                <Link to={route} onClick={(e) => e.stopPropagation()}
                                                      className="inline-flex items-center">
                                                    {p.cta || "Тапсырманы орындау"}
                                                    <svg
                                                        className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5"
                                                        viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                                        strokeWidth="2">
                                                        <path strokeLinecap="round" strokeLinejoin="round"
                                                              d="M9 5l7 7-7 7"/>
                                                    </svg>
                                                </Link>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onModuleClick?.(p);
                                                    }}
                                                    className="inline-flex items-center"
                                                >
                                                    {p.cta || "Тапсырманы орындау"}
                                                    <svg
                                                        className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5"
                                                        viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                                        strokeWidth="2">
                                                        <path strokeLinecap="round" strokeLinejoin="round"
                                                              d="M9 5l7 7-7 7"/>
                                                    </svg>
                                                </button>
                                            )
                                        ) : (
                                            <span className="inline-flex items-center text-slate-400">
                        {p.cta || "Тапсырманы орындау"}
                      </span>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
};

export default ProductsSection;
