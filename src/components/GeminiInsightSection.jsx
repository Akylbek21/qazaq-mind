import React from 'react';
import AnimatedSection from './AnimatedSection';
import { motion } from 'framer-motion';

const GeminiInsightSection = () => {
  const [insight, setInsight] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const generateInsight = async () => {
    setIsLoading(true); setError(''); setInsight('');
    const apiKey = ""; // Add your key safely on runtime
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
    const prompt = "Действуй как философ, глубоко понимающий творчество Абая Кунанбаева. Создай короткую мысль дня (2-3 предложения) на русском языке, основанную на принципах Абая о 'толық адам'.";

    const payload = { contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.8, topP: 1, maxOutputTokens: 150 } };

    try {
      let response; let delay = 1000;
      for (let i = 0; i < 5; i++) {
        response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (response.ok) break;
        if (response.status === 429 || response.status >= 500) { await new Promise(r => setTimeout(r, delay)); delay *= 2; } else { throw new Error(`API call failed with status: ${response.status}`); }
      }
      if (!response || !response.ok) throw new Error('API call failed after retries.');
      const result = await response.json();
      const candidate = result.candidates?.[0];
      if (candidate && candidate.content?.parts?.[0]?.text) setInsight(candidate.content.parts[0].text);
      else throw new Error('Не удалось получить осмысленный ответ от ИИ.');
    } catch (err) {
      console.error(err); setError(err.message || 'Произошла ошибка при генерации.');
    } finally { setIsLoading(false); }
  };

  return (
    <AnimatedSection className="section-bg-ornament">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6 section-title">✨ Abai Insight-ты Gemini-мен байқап көріңіз</h2>
        <p className="max-w-3xl mx-auto text-lg text-slate-600 leading-relaxed mb-8">Абайдың даналығына негізделген біздің ЖИ көмекшіміз сізге ойлануға арналған бірегей ой тудыра алады. Шабыт алу үшін батырманы басыңыз.</p>
        <motion.button onClick={generateInsight} disabled={isLoading} className="btn btn-primary">{isLoading ? 'Генерация...' : 'Күннің ойын жасау'}</motion.button>
        <div className="mt-8 min-h-[120px] max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-md flex items-center justify-center card-kazakh">
          {isLoading && <div className="loader"></div>}
          {error && <p className="text-red-500 font-semibold">{error}</p>}
          {insight && <p className="text-lg text-slate-700 italic">"{insight}"</p>}
          {!isLoading && !error && !insight && <p className="text-slate-400">Күннің ойы осында пайда болады...</p>}
        </div>
      </div>
    </AnimatedSection>
  );
};

export default GeminiInsightSection;
