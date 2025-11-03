import React from "react";
import { motion } from "framer-motion";

function Icon({ type = "star", className = "w-3.5 h-3.5" }) {
  if (type === "bolt") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <path d="M13 2 3 14h6l-2 8 10-12h-6l2-8Z" fill="#A16207" />
      </svg>
    );
  }
  if (type === "trophy") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <path d="M7 4h10v3a5 5 0 0 0 5 5h-2a5 5 0 0 1-3-1.05A7 7 0 0 1 12 12a7 7 0 0 1-5-1.05A5 5 0 0 1 4 12H2a5 5 0 0 0 5-5V4Z" fill="#A16207"/>
        <rect x="9" y="13" width="6" height="3" rx="1" fill="#A16207"/>
        <rect x="8" y="17" width="8" height="2.2" rx="1" fill="#A16207"/>
      </svg>
    );
  }
  // star (default)
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="m12 3.5 2.4 4.86 5.36.78-3.88 3.78.92 5.35L12 16.9l-4.8 2.37.92-5.35L4.24 9.14l5.36-.78L12 3.5Z"
        fill="#A16207"
      />
    </svg>
  );
}

export default function Coin({
  value,
  size = "default",
  icon = "star", // 'star' | 'bolt' | 'trophy'
  unitLabel = "ұпай",
}) {
  const sizeClasses = {
    small: { box: "w-5 h-5", inset: "inset-[1.5px]", text: "text-[10px]", shine: "-inset-0.5" },
    default: { box: "w-7 h-7", inset: "inset-[2px]", text: "text-xs", shine: "-inset-1" },
    large: { box: "w-9 h-9", inset: "inset-[2.5px]", text: "text-sm", shine: "-inset-1.5" },
  };
  const sz = sizeClasses[size] || sizeClasses.default;

  return (
    <div className="inline-flex items-center gap-1.5">
      <motion.div
        className={`relative ${sz.box}`}
        initial={{ rotate: 0 }}
        whileHover={{ rotate: 360, scale: 1.08 }}
        transition={{ duration: 0.6 }}
      >
        {/* Рама монеты */}
        <div className="absolute inset-0 rounded-full shadow-md bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500" />
        {/* Внутренний диск */}
        <div className={`absolute ${sz.inset} rounded-full flex items-center justify-center bg-gradient-to-br from-amber-200 to-amber-300`}>
          <Icon type={icon} />
        </div>
        {/* Блик-”shine” (мягкая анимация пробегающего света) */}
        <motion.div
          className={`pointer-events-none absolute ${sz.shine} rounded-full`}
          initial={{ rotate: -25, x: "-120%" }}
          whileHover={{ x: "120%" }}
          transition={{ duration: 1.1, ease: "easeInOut" }}
          style={{
            background:
              "linear-gradient(120deg, rgba(255,255,255,0) 20%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0) 80%)",
          }}
        />
        {/* Тонкое внутреннее кольцо (тиснение) */}
        <div className="absolute inset-[20%] rounded-full ring-1 ring-amber-400/70" />
      </motion.div>

      <span className={`font-medium ${sz.text}`}>
        {value} {unitLabel}
      </span>
    </div>
  );
}
