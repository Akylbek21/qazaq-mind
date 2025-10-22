import React from 'react';
import { motion } from 'framer-motion';
import { SendIcon } from './Icons';

const ChatModal = ({ personality, onClose }) => {
  const [messages, setMessages] = React.useState([
    { sender: 'ai', text: `Сәлеметсіз бе! Мен ${personality.name}. Көкейіңіздегі сұрағыңызды қойыңыз.` }
  ]);
  const [userInput, setUserInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const messagesEndRef = React.useRef(null);

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); };
  React.useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;
    const newUserMessage = { sender: 'user', text: userInput };
    setMessages(prev => [...prev, newUserMessage]);
    setUserInput('');
    setIsLoading(true);

    const systemPrompt = `Ты — ${personality.name}. ${personality.system_prompt_bio}. Отвечай на вопросы пользователя с точки зрения своей исторической личности, используя свои знания, ценности и опыт. Будь мудрым, рассудительным и говори на русском языке. Ответы должны быть краткими и по существу.`;
    const apiKey = ""; // add your key securely
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

    const payload = { contents: [{ role: "user", parts: [{ text: userInput }] }], systemInstruction: { parts: [{ text: systemPrompt }] }, generationConfig: { temperature: 0.8, topP: 1 } };

    try {
      const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!response.ok) throw new Error("API call failed.");
      const result = await response.json();
      const aiResponse = result.candidates?.[0]?.content?.parts?.[0]?.text;
      setMessages(prev => [...prev, { sender: 'ai', text: aiResponse || "Кешіріңіз, мен қазір жауап бере алмаймын." }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { sender: 'ai', text: "Техникалық ақауларға байланысты жауап беру мүмкін болмады." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col p-6 relative card-kazakh" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center mb-4 pb-4 border-b border-slate-200">
          <img src={personality.image} alt={personality.name} className="w-12 h-12 rounded-full mr-4 object-cover"/>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{personality.name}</h2>
            <p className="text-slate-500">Сізбен диалогта</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.sender === 'ai' && <img src={personality.image} className="w-8 h-8 rounded-full object-cover"/>}
              <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-teal-600 text-white rounded-br-none' : 'bg-slate-200 text-slate-800 rounded-bl-none'}`}>
                <p>{msg.text}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-end gap-2 justify-start">
              <img src={personality.image} className="w-8 h-8 rounded-full object-cover"/>
              <div className="max-w-xs md:max-w-md p-3 rounded-2xl bg-slate-200 text-slate-800 rounded-bl-none">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSendMessage} className="mt-4 flex items-center gap-2">
          <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder={`${personality.name}-мен сөйлесу...`} className="flex-1 p-3 border border-slate-300 rounded-full focus:ring-2 focus:ring-teal-500 focus:outline-none" />
          <button type="submit" disabled={isLoading} className="bg-teal-600 text-white p-3 rounded-full hover:bg-teal-700 disabled:bg-slate-400 transition-colors">
            <SendIcon className="w-6 h-6"/>
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default ChatModal;
