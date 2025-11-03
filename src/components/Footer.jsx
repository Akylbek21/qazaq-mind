import React from 'react';

const Footer = () => (
  <footer className="relative bg-gradient-to-tr from-[#0b182b] via-[#1e293b] to-[#0ea5e9] text-slate-200 py-10 px-6 mt-12 shadow-inner overflow-hidden">
    {/* Декоративные круги */}
    <div className="absolute -top-16 -left-16 w-56 h-56 bg-gradient-to-br from-[#38bdf8]/30 to-[#facc15]/20 rounded-full blur-2xl opacity-40 z-0" />
    <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-gradient-to-tr from-[#facc15]/30 to-[#0ea5e9]/20 rounded-full blur-2xl opacity-40 z-0" />
    <div className="container mx-auto relative z-10 flex flex-col items-center gap-4">
      <div className="flex items-center gap-3 mb-2">
        <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#38bdf8"/><path d="M12 7v5l3 2" stroke="#facc15" strokeWidth="1.5" strokeLinecap="round"/></svg>
        <span className="text-xl font-bold tracking-wide bg-gradient-to-r from-yellow-300 via-sky-400 to-yellow-400 bg-clip-text text-transparent drop-shadow">Qazaq Mind</span>
      </div>
      <p className="text-slate-300 text-sm md:text-base mb-2">&copy; {new Date().getFullYear()} Qazaq Mind</p>
    </div>
  </footer>
);

export default Footer;
