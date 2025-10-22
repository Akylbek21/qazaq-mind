# Qazaq Mind (React + Vite)

Бұл — сіз берген үлкен React файлын бірнеше компонентке бөліп, Vite жобасы ретінде дайындалған нұсқа.

## Орнату
```bash
npm install
npm run dev
```

Егер `@vitejs/plugin-react` қателігі шықса — бұл жоба Tailwind-ті CDN арқылы пайдаланады және плагинді талап етпейді. Біздің `vite.config.js` — минималды.

## Құпия кілттер
- Gemini API шақырулары үшін `src/components/QuizModal.jsx`, `ChatModal.jsx`, `GeminiInsightSection.jsx` файлдарындағы `apiKey` айнымалысын қорғалған жерден беріңіз.
- Немесе backend proxy пайдаланыңыз.

## Құрылым
- `src/components/*` — барлық секциялар мен модалдар.
- Tailwind — CDN (`index.html`) арқылы.
