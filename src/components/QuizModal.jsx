import React from 'react';
import { motion } from 'framer-motion';

const QuizModal = ({ module, onClose }) => {
  const [question, setQuestion] = React.useState(module.initialQuestion);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const getPromptForModule = (type) => {
    switch (type) {
      case 'iq':
        return "Создай короткую логическую задачу или математическую загадку на русском языке для старшеклассника. Вопрос должен быть уникальным и интересным. Представь только текст вопроса.";
      case 'eq':
        return "Сформулируй один открытый, рефлексивный вопрос на русском языке для старшеклассника, который поможет ему проанализировать свои эмоции или поведение в определенной ситуации. Представь только текст вопроса.";
      case 'sq':
        return "Основываясь на философии и мудрости Абая Кунанбаева, создай один глубокий вопрос на русском языке, который побуждает к размышлению о ценностях. Представь только текст вопроса.";
      default:
        return "";
    }
  };

  const generateNewQuestion = async () => {
    setIsLoading(true);
    setError('');
    const prompt = getPromptForModule(module.type);
    if (!prompt) {
      setError("Модуль түрі дұрыс емес.");
      setIsLoading(false);
      return;
    }

    const apiKey = ""; // add your key in runtime env or .env
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.9, topP: 1, maxOutputTokens: 200 }
    };

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(`API call failed with status: ${response.status}`);
      const result = await response.json();
      const candidate = result.candidates?.[0];
      if (candidate && candidate.content?.parts?.[0]?.text) {
        setQuestion(candidate.content.parts[0].text);
      } else {
        throw new Error("Жасанды интеллекттен жауап алу мүмкін болмады.");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Сұрақты генерациялау кезінде қате пайда болды.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 relative card-kazakh"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start mb-6">
          {module.Icon && <module.Icon className={`w-12 h-12 mr-4 ${module.color}`} />}
          <div>
            <h2 className="text-3xl font-bold text-slate-800">{module.title}</h2>
            <p className="text-slate-500">Интерактивті тапсырма</p>
          </div>
        </div>

        <div className="min-h-[150px] bg-slate-50 rounded-lg p-6 mb-6 flex items-center justify-center border border-slate-200">
          {isLoading ? <div className="loader"></div> : 
            error ? <p className="text-red-500 text-center">{error}</p> :
            <p className="text-lg text-slate-700 text-center italic">"{question}"</p>
          }
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <motion.button onClick={generateNewQuestion} disabled={isLoading} className="btn btn-primary w-full">
            {isLoading ? 'Генерация...' : 'Жаңа сұрақ жасау (Gemini)'}
          </motion.button>
          <motion.button onClick={onClose} className="btn btn-terтиary w-full sm:w-auto">
            Жабу
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default QuizModal;
