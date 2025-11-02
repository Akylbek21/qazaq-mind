import React from 'react';
import { motion } from 'framer-motion';

export const ArticleCard = ({ article, isActive, onClick }) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`rounded-xl border p-4 cursor-pointer transition-all ${
        isActive
          ? 'border-amber-500 bg-amber-50/50 shadow-md'
          : 'border-slate-200 hover:border-slate-300 hover:shadow'
      }`}
      onClick={onClick}
    >
      <h3 className="font-semibold text-slate-900 mb-2">{article.title}</h3>
      <div className="text-sm text-slate-600">{article.excerpt}</div>
      <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {article.readTime} мин
        </div>
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {article.difficulty}
        </div>
      </div>
    </motion.div>
  );
};

export const QuizCard = ({ question, selected, onSelect }) => {
  return (
    <div className="mt-4 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="font-medium text-slate-900 mb-4">{question.q}</div>
      <div className="grid gap-3">
        {question.options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(idx)}
            className={`p-4 text-left rounded-xl border transition-all ${
              selected === idx
                ? 'border-amber-500 bg-amber-50/50 shadow'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                selected === idx
                  ? 'bg-amber-500 text-white'
                  : 'border border-slate-300 text-slate-500'
              }`}>
                {String.fromCharCode(65 + idx)}
              </div>
              <span className={selected === idx ? 'text-slate-900' : 'text-slate-700'}>
                {option}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export const QuizNavigation = ({ onPrev, onNext, canNext, isLast }) => {
  return (
    <div className="mt-6 flex gap-3">
      <button
        onClick={onPrev}
        className="px-6 py-2 rounded-xl border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
      >
        Артқа
      </button>
      <button
        onClick={onNext}
        disabled={!canNext}
        className={`px-6 py-2 rounded-xl font-semibold transition-all ${
          canNext
            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:opacity-90'
            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
        }`}
      >
        {isLast ? 'Нәтижені көру' : 'Келесі'}
      </button>
    </div>
  );
};

export const QuizResults = ({ score, total, answers, questions, onRestart }) => {
  const percentage = Math.round((score / total) * 100);
  
  return (
    <div className="mt-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="text-center">
          <div className="text-6xl font-bold text-amber-500 mb-2">{percentage}%</div>
          <div className="text-slate-600">
            {score} дұрыс жауап {total} сұрақтан
          </div>
          <div className="mt-4 text-sm">
            {percentage >= 80 ? (
              <span className="text-emerald-600">Керемет! Үлгілік нәтиже көрсеттіңіз.</span>
            ) : percentage >= 60 ? (
              <span className="text-amber-600">Жақсы! Білімді жетілдіру қажет.</span>
            ) : (
              <span className="text-rose-600">Қайта оқып, тағы байқап көріңіз.</span>
            )}
          </div>
        </div>

        <div className="mt-8 grid gap-4">
          {questions.map((q, idx) => {
            const answer = answers[idx];
            const isCorrect = q.correct === answer;
            
            return (
              <div
                key={idx}
                className={`rounded-xl border p-4 ${
                  isCorrect 
                    ? 'border-emerald-200 bg-emerald-50/60' 
                    : 'border-rose-200 bg-rose-50/60'
                }`}
              >
                <div className="font-medium text-slate-900">{q.q}</div>
                <div className="mt-2 text-sm grid gap-1">
                  <div className={isCorrect ? 'text-emerald-700' : 'text-rose-700'}>
                    Сіздің жауабыңыз: {q.options[answer]}
                  </div>
                  {!isCorrect && (
                    <div className="text-emerald-700">
                      Дұрыс жауап: {q.options[q.correct]}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex gap-3">
          <button
            onClick={onRestart}
            className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold hover:opacity-90 transition-opacity"
          >
            Қайта өту
          </button>
        </div>
      </div>
    </div>
  );
};