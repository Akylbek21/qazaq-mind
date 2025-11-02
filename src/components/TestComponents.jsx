import React from 'react';
import { motion } from 'framer-motion';

export const TestQuestion = ({ question, selectedAnswer, onAnswerSelect, timeLeft }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
    >
      {/* Таймер */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600">Қалған уақыт:</span>
          <span className={`font-bold ${timeLeft < 10 ? 'text-red-500' : 'text-slate-900'}`}>
            {timeLeft} сек
          </span>
        </div>
        <div className="mt-2 h-2 w-full bg-slate-100 rounded-full">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ${
              timeLeft < 10 ? 'bg-red-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${(timeLeft / 60) * 100}%` }}
          />
        </div>
      </div>

      {/* Вопрос */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-900">{question.q}</h3>
        {question.imageUrl && (
          <img
            src={question.imageUrl}
            alt="Тапсырма суреті"
            className="mt-4 rounded-xl border border-slate-200 max-h-[300px] object-contain mx-auto"
          />
        )}
      </div>

      {/* Варианты ответов */}
      <div className="grid gap-3">
        {question.options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => onAnswerSelect(idx)}
            className={`p-4 text-left rounded-xl border transition-all duration-200 ${
              selectedAnswer === idx
                ? 'border-[#1F7A8C] bg-[#1F7A8C]/5 shadow-md'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`flex items-center justify-center w-6 h-6 rounded-full border ${
                selectedAnswer === idx
                  ? 'border-[#1F7A8C] bg-[#1F7A8C] text-white'
                  : 'border-slate-300 text-slate-500'
              }`}>
                {String.fromCharCode(65 + idx)}
              </div>
              <span className={selectedAnswer === idx ? 'text-slate-900' : 'text-slate-700'}>
                {option}
              </span>
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );
};

export const TestResults = ({ score, total, details, onRestart }) => {
  const percentage = Math.round((score / total) * 100);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
    >
      <div className="text-center mb-6">
        <div className="text-6xl font-bold mb-2 bg-gradient-to-r from-[#1F7A8C] to-[#0ea5a5] bg-clip-text text-transparent">
          {percentage}%
        </div>
        <div className="text-slate-600">
          {score} дұрыс жауап {total} сұрақтан
        </div>
      </div>

      {details && (
        <div className="mt-6 border-t pt-6">
          <h3 className="font-bold text-slate-900 mb-4">Толық талдау:</h3>
          <div className="space-y-4">
            {details.map((d, i) => (
              <div
                key={i}
                className={`rounded-xl border p-4 ${
                  d.correct
                    ? 'border-emerald-200 bg-emerald-50'
                    : 'border-rose-200 bg-rose-50'
                }`}
              >
                <div className="font-medium text-slate-900">{d.question}</div>
                <div className="mt-2 text-sm">
                  <span className={d.correct ? 'text-emerald-600' : 'text-rose-600'}>
                    Сіздің жауабыңыз: {d.yourAnswer}
                  </span>
                  {!d.correct && (
                    <span className="text-emerald-600 ml-3">
                      Дұрыс жауап: {d.correctAnswer}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={onRestart}
        className="mt-6 w-full px-4 py-3 rounded-xl bg-gradient-to-r from-[#1F7A8C] to-[#0ea5a5] text-white font-semibold hover:opacity-90 transition-opacity"
      >
        Қайта бастау
      </button>
    </motion.div>
  );
};