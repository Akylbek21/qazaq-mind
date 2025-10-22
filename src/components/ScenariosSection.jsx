import React from 'react';
import AnimatedSection from './AnimatedSection';

const ScenariosSection = () => {
  const [activeTab, setActiveTab] = React.useState('student');

  const tabs = {
    student: {
      label: "Оқушы",
      content: [
        "Онбординг: қысқа скрининг (IQ/EQ/SQ/PQ).",
        "Апталық баланс картасы және мақсат.",
        "Күндік ұсыныс: Danalyq Challenge + SelfTalk (5 мин) + Abai Insight (1 параграф) + 3×10 жаттығу.",
        "Апталық рефлексия, жетістік белгілері (бедждер)."
      ]
    },
    teacher: {
      label: "Мұғалім",
      content: [
        "Сабақ пен сынып бойынша эмоциялық климат картасы.",
        "ЖИ-генерациялаған жоспардың нобайы; мұғалім өңдейді.",
        "«Жылы сөздің күші» сияқты SQ-сабақ шаблондары.",
        "Бағалау, кері байланыс, ата-анаға 1 беттік авто-репорт."
      ]
    },
    director: {
      label: "Директор",
      content: [
        "Қағазбастылық: жоспар/есеп автоматтандырылған.",
        "Мектеп деңгейіндегі прогресс, тәуекел топтар.",
        "Ресурстық шешімдер қабылдауға көмек."
      ]
    }
  };

  return (
    <AnimatedSection>
      <div className="container mx-auto">
        {/* Центруем заголовок надёжно */}
        <div className="w-full flex justify-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-12 section-title text-center">
            Негізгі сценарийлер
          </h2>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="flex border-b border-slate-200 mb-8">
            {Object.keys(tabs).map((key) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex-1 py-3 text-lg font-semibold transition-colors ${
                  activeTab === key
                    ? 'text-teal-600 border-b-2 border-teal-600'
                    : 'text-slate-500'
                }`}
              >
                {tabs[key].label}
              </button>
            ))}
          </div>

          <ul className="space-y-4 list-disc list-inside text-lg text-slate-700">
            {tabs[activeTab].content.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </AnimatedSection>
  );
};

export default ScenariosSection;
