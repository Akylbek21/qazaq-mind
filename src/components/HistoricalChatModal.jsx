// src/components/HistoricalChatModal.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sendChatMessage, fetchChatHistory } from '../api/historical';

const HistoricalChatModal = ({ personality, onClose }) => {
  const [messages, setMessages] = React.useState([]);
  const [userInput, setUserInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [loadingHistory, setLoadingHistory] = React.useState(true);
  const [page, setPage] = React.useState(0);
  const [hasMore, setHasMore] = React.useState(false);
  const messagesEndRef = React.useRef(null);
  const messagesContainerRef = React.useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Загружаем историю при открытии
  React.useEffect(() => {
    if (personality) {
      loadHistory();
    }
  }, [personality]);

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await fetchChatHistory(page, 20);
      const historyItems = response?.content || [];
      
      // Преобразуем историю в формат сообщений (новые внизу)
      const formattedMessages = historyItems
        .flatMap(item => [
          {
            type: 'user',
            content: item.userMessage,
            timestamp: item.createdAt
          },
          {
            type: 'ai',
            content: item.personalityResponse,
            timestamp: item.createdAt
          }
        ]);
      
      setMessages(formattedMessages);
      setHasMore(!response?.last);
      setPage(response?.number || 0);
    } catch (e) {
      console.error('Историяны жүктеу қатесі:', e);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const userMessageText = userInput.trim();
    setUserInput('');
    
    // Добавляем сообщение пользователя сразу
    const tempUserMessage = {
      type: 'user',
      content: userMessageText,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMessage]);
    setIsLoading(true);

    try {
      const response = await sendChatMessage(userMessageText);
      
      // Добавляем ответ ИИ
      const aiMessage = {
        type: 'ai',
        content: response.personalityResponse || "Кешіріңіз, жауап алу мүмкін болмады.",
        timestamp: response.createdAt
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Прокручиваем вниз после получения ответа
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Хабарлама жіберу қатесі:', error);
      setMessages(prev => [...prev, {
        type: 'ai',
        content: "Техникалық ақауларға байланысты жауап беру мүмкін болмады.",
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreHistory = async () => {
    if (hasMore && !loadingHistory) {
      setLoadingHistory(true);
      try {
        const nextPage = page + 1;
        const response = await fetchChatHistory(nextPage, 20);
        const historyItems = response?.content || [];
        
        if (historyItems.length > 0) {
          const formattedMessages = historyItems
            .flatMap(item => [
              {
                type: 'user',
                content: item.userMessage,
                timestamp: item.createdAt
              },
              {
                type: 'ai',
                content: item.personalityResponse,
                timestamp: item.createdAt
              }
            ]);
          
          setMessages(prev => [...formattedMessages, ...prev]);
          setHasMore(!response?.last);
          setPage(nextPage);
        }
      } catch (e) {
        console.error('Көбірек тарихыны жүктеу қатесі:', e);
      } finally {
        setLoadingHistory(false);
      }
    }
  };

  return (
    <AnimatePresence>
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
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[85vh] flex flex-col p-6 relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Заголовок */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <img
                src={personality.image}
                alt={personality.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-slate-200"
                onError={(e) => {
                  e.currentTarget.src = "https://placehold.co/400x400/cccccc/ffffff?text=Image+Not+Found";
                }}
              />
              <div>
                <h2 className="text-xl font-bold text-slate-800">{personality.name}</h2>
                <p className="text-sm text-slate-500">Сізбен диалогта</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors"
            >
              <span className="text-slate-600 text-xl">×</span>
            </button>
          </div>

          {/* Сообщения */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto pr-2 space-y-4 mb-4"
          >
            {loadingHistory && messages.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-slate-400 animate-pulse">Тарихы жүктелуде...</div>
              </div>
            ) : (
              <>
                {hasMore && (
                  <div className="flex justify-center">
                    <button
                      onClick={loadMoreHistory}
                      disabled={loadingHistory}
                      className="text-xs text-slate-500 hover:text-slate-700 px-3 py-1 rounded-full border border-slate-300 hover:bg-slate-50 transition-all"
                    >
                      {loadingHistory ? "Жүктелуде..." : "Көбірек көрсету"}
                    </button>
                  </div>
                )}
                <AnimatePresence>
                  {messages.map((msg, index) => (
                    <motion.div
                      key={`${msg.timestamp}-${index}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`flex items-end gap-2 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.type === 'ai' && (
                        <img
                          src={personality.image}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                          alt={personality.name}
                          onError={(e) => {
                            e.currentTarget.src = "https://placehold.co/400x400/cccccc/ffffff?text=Image+Not+Found";
                          }}
                        />
                      )}
                      <div
                        className={`max-w-[75%] md:max-w-[65%] p-4 rounded-2xl ${
                          msg.type === 'user'
                            ? 'bg-gradient-to-br from-[#1F7A8C] to-[#0ea5a5] text-white rounded-br-none'
                            : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200'
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        {msg.timestamp && (
                          <p className={`text-xs mt-2 ${
                            msg.type === 'user' ? 'text-white/70' : 'text-slate-500'
                          }`}>
                            {new Date(msg.timestamp).toLocaleTimeString('kk-KZ', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {isLoading && (
                  <div className="flex items-end gap-2 justify-start">
                    <img
                      src={personality.image}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200"
                      alt={personality.name}
                    />
                    <div className="max-w-[65%] p-4 rounded-2xl bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Поле ввода */}
          <form onSubmit={handleSendMessage} className="flex items-center gap-2 border-t border-slate-200 pt-4">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder={`${personality.name.split(' ')[0]}мен сөйлесу...`}
              className="flex-1 p-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1F7A8C] focus:border-[#1F7A8C] focus:outline-none transition-all"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !userInput.trim()}
              className={`p-3 rounded-xl transition-all ${
                isLoading || !userInput.trim()
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#1F7A8C] to-[#0ea5a5] text-white hover:shadow-lg hover:scale-105'
              }`}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default HistoricalChatModal;

