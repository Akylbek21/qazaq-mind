import React from 'react';
import AnimatedSection from './AnimatedSection';

const MissionSection = () => (
  <AnimatedSection className="bg-slate-800 text-white">
    <div className="container mx-auto text-center">
      <h2 className="text-3xl md:text-4xl font-bold mb-6 section-title text-white">Біздің миссия</h2>
      <div className="max-w-4xl mx-auto bg-white/5 p-8 rounded-xl backdrop-blur-sm border border-white/10">
        <blockquote className="text-2xl md:text-4xl font-bold text-amber-300 italic">«ЖИ мұғалімнің орнын емес, қағазын бассын!»</blockquote>
        <p className="mt-6 text-lg text-slate-300">Жоспар, талдау, есеп – ЖИ-де; құндылық, эмпатия, мотивация – мұғалімде. Біз Абайдың «толық адам» тұжырымдамасына сай 4 интеллектті теңгерімдеуді мақсат етеміз.</p>
      </div>
    </div>
  </AnimatedSection>
);

export default MissionSection;
