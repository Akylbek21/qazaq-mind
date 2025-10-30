import React from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";

const HeroSection = () => {
  // Параллакс
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-30, 30], [5, -5]), { stiffness: 120, damping: 14 });
  const ry = useSpring(useTransform(mx, [-30, 30], [-5, 5]), { stiffness: 120, damping: 14 });

  const onMouseMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - (r.left + r.width / 2);
    const py = e.clientY - (r.top + r.height / 2);
    mx.set(Math.max(-30, Math.min(30, px / 10)));
    my.set(Math.max(-30, Math.min(30, py / 10)));
  };

  // Фон-сетка
  const gridSVG = encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'>
       <path d='M0 31.5H32M31.5 0V32' stroke='rgba(255,255,255,0.08)' stroke-width='1'/>
     </svg>`
  );

  return (
    <section
      onMouseMove={onMouseMove}
      className="relative min-h-[92vh] md:min-h-screen flex items-center justify-center overflow-hidden text-white bg-[#0b1321]"
    >
      {/* Aurora фон */}
      <motion.div
        aria-hidden
        className="absolute -inset-[20%] rounded-[40px] blur-3xl opacity-40"
        style={{
          background:
            "radial-gradient(60% 60% at 20% 30%, rgba(99,102,241,0.9), transparent 60%),\
             radial-gradient(50% 50% at 80% 20%, rgba(16,185,129,0.8), transparent 60%),\
             radial-gradient(40% 40% at 60% 80%, rgba(251,191,36,0.8), transparent 60%)",
        }}
        initial={{ scale: 1, rotate: 0, x: 0, y: 0 }}
        animate={{ scale: [1, 1.05, 1], rotate: [0, 8, 0], x: [0, 20, 0], y: [0, -10, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Сетка + виньетка */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,${gridSVG}")`,
          backgroundSize: "32px 32px",
          maskImage:
            "radial-gradient(ellipse at center, rgba(0,0,0,0.8) 30%, rgba(0,0,0,0.4) 60%, transparent 85%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, rgba(0,0,0,0.8) 30%, rgba(0,0,0,0.4) 60%, transparent 85%)",
        }}
      />

      {/* Контент */}
      <motion.div
        className="relative z-10 px-6 text-center max-w-5xl"
        style={{ rotateX: rx, rotateY: ry }}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
       {/* 🔵 ТОЛЬКО КРУГЛАЯ ЭМБЛЕМА — БОЛЬШЕ РАЗМЕР */}
<motion.div
  className="relative mx-auto w-40 md:w-64 lg:w-80 aspect-square
             rounded-full overflow-hidden mb-8
             ring-4 ring-cyan-300/70
             shadow-[0_20px_60px_rgba(56,189,248,0.35)]"
  animate={{ y: [0, -4, 0] }}
  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
>
  <img
    src="/qazaq-mind-badge.png"   /* файл из /public */
    alt="Qazaq Mind эмблемасы"
    className="w-full h-full object-cover select-none pointer-events-none"
    loading="eager"
    decoding="async"
  />
</motion.div>


        {/* Заголовок */}
        <motion.h1
          className="relative text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.05]
                     bg-clip-text text-transparent drop-shadow-[0_10px_30px_rgba(0,0,0,0.35)] px-2"
          style={{
            backgroundImage:
              "linear-gradient(90deg, #ffffff 0%, #c7f9ff 25%, #a7f3d0 50%, #fef3c7 75%, #ffffff 100%)",
            backgroundSize: "220% 100%",
          }}
          initial={{ backgroundPositionX: "0%" }}
          animate={{ backgroundPositionX: ["0%", "100%", "0%"] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        >
          Qazaq Mind
        </motion.h1>

        <motion.p
          className="text-base md:text-2xl font-light mt-6 md:mt-8 mb-8 md:mb-10 mx-auto max-w-3xl text-slate-100/90"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6 }}
        >
          Көпинтеллектті жеке даму платформасы
        </motion.p>
      </motion.div>

      {/* Скролл индикаторы */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10"
        initial={{ opacity: 0, y: 0 }}
        animate={{ opacity: 0.9, y: [0, 6, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="h-9 w-5 rounded-full border-2 border-white/70 flex items-start justify-center p-1">
          <div className="h-2 w-1 rounded-full bg-white/80" />
        </div>
      </motion.div>

      <div className="pointer-events-none absolute inset-0 [box-shadow:inset_0_0_120px_rgba(0,0,0,0.55)]" />
    </section>
  );
};

export default HeroSection;
