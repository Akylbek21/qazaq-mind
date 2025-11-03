import React from "react";

function Icon({ type = "coin", className = "w-3.5 h-3.5" }) {
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
  if (type === "star") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <path
          d="m12 3.5 2.4 4.86 5.36.78-3.88 3.78.92 5.35L12 16.9l-4.8 2.37.92-5.35L4.24 9.14l5.36-.78L12 3.5Z"
          fill="#A16207"
        />
      </svg>
    );
  }
  // coin (default) - простая иконка монеты
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="#F59E0B"/>
    </svg>
  );
}

export default function Coin({
  value,
  size = "default",
  icon = "coin", // 'coin' | 'star' | 'bolt' | 'trophy'
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
      <div className={`${sz.box} flex items-center justify-center`}>
        <Icon type={icon} />
      </div>

      <span className={`font-medium ${sz.text}`}>
        {value} {unitLabel}
      </span>
    </div>
  );
}
