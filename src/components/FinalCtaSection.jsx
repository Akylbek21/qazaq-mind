import React from 'react';

const FinalCtaSection = () => (
  <section id="contact" className="py-24 text-center bg-gradient-to-br from-[#1F7A8C] to-[#102542] text-white relative overflow-hidden">
    <div className="absolute inset-0 opacity-10 hero-pattern"></div>
    <div className="container mx-auto relative">
      <h2 className="text-3xl md:text-4xl font-bold mb-4">Жоба манифесі</h2>
      <p className="max-w-2xl mx-auto text-lg text-slate-200 mb-8">
        ЖИ логикамен жұмыс істейді. Мұғалім – жүрекпен.
        Біз технологияны емес, теңгерімді жүйені ұсынамыз.
      </p>
      <div className="max-w-3xl mx-auto bg-white/10 p-6 rounded-xl backdrop-blur-sm">
        <p className="text-lg italic text-slate-200">
          «Жоқ, олай болмайды. ЖИ келгенімен, Абай айтқан толық адам ұғымы жоғалмайды. Біз оның шешімін таптық: Qazaq Mind – адамның жанын алға қоятын цифрлық серік».
        </p>
        <p className="mt-4 font-bold text-xl text-amber-300">- Директор сөзі</p>
      </div>
    </div>
  </section>
);

export default FinalCtaSection;
