import React from 'react';
import AnimatedSection from './AnimatedSection';

const RoadmapSection = () => (
  <AnimatedSection className="section-bg-ornament">
    <div className="container mx-auto">
      {/* Центруем заголовок надёжно */}
      <div className="w-full flex justify-center">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-12 section-title text-center">
          Даму жоспары
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <div className="p-8 rounded-xl border-l-4 border-teal-500 card-kazakh">
          <h3 className="text-2xl font-bold text-teal-600 mb-4">MVP (0–3 ай)</h3>
          <ul className="space-y-2 list-disc list-inside text-slate-600">
            <li>Скрининг-тест, баланс индикаторы</li>
            <li>Danalyq Challenge v1, SelfTalk v1</li>
            <li>Abai Insight микромәтіндер</li>
            <li>Teacher Console (базалық)</li>
          </ul>
        </div>
        <div className="p-8 rounded-xl border-l-4 border-amber-400 card-kazakh">
          <h3 className="text-2xl font-bold text-amber-500 mb-4">V1 (3–6 ай)</h3>
          <ul className="space-y-2 list-disc list-inside text-slate-600">
            <li>Адаптивті траектория</li>
            <li>Эмпатия тренажері</li>
            <li>Топтық рух механикасы</li>
            <li>Admin Dashboard, ата-ана кабинеті</li>
          </ul>
        </div>
      </div>
    </div>
  </AnimatedSection>
);

export default RoadmapSection;
