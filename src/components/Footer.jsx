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
      <p className="text-slate-300 text-sm md:text-base mb-2">&copy; {new Date().getFullYear()} Барлық құқықтар қорғалған.</p>
      <div className="flex gap-4 mt-2">
        <a href="https://t.me/" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform"><svg width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#38bdf8"/><path d="M7 12.5l4.2 1.7c.3.1.6.1.8-.2l4.2-5.2c.2-.2-.1-.5-.4-.4l-8.2 2.7c-.4.1-.4.7 0 .8z" fill="#fff"/></svg></a>
        <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform"><svg width="24" height="24" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#facc15"/><circle cx="12" cy="12" r="5" fill="#fff"/><circle cx="18" cy="6" r="1.2" fill="#f59e0b"/></svg></a>
        <a href="mailto:info@qazaqmind.kz" className="hover:scale-110 transition-transform"><svg width="24" height="24" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#1e293b"/><path d="M6 8l6 5 6-5" stroke="#38bdf8" strokeWidth="1.5"/><rect x="6" y="8" width="12" height="8" rx="2" stroke="#38bdf8" strokeWidth="1.5"/></svg></a>
      </div>
    </div>
  </footer>
);

export default Footer;
