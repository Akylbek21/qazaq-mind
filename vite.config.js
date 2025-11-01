// vite.config.js
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  // Бэкенд-таргет: из env или дефолт. Убираем хвостовые слэши.
  const rawTarget = env.VITE_QAZAQMIND_SERVICE || "http://85.202.193.138:8087";
  const API_TARGET = (/^https?:\/\//.test(rawTarget) ? rawTarget : `http://${rawTarget}`).replace(/\/+$/, "");

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    server: {
      host: true,
      port: 5173,
      open: true,
      strictPort: true,
      // В dev проксируем /api -> на ваш backend
      proxy: {
        "/api": {
          target: API_TARGET,
          changeOrigin: true,
          secure: false,
          ws: true,
          /**
           * Устраняем редкий кейс, когда путь получается /api/api/...
           * Пример: "/api/api/v1/quiz/iq" -> "/api/v1/quiz/iq"
           */
          rewrite: (p) => p.replace(/^\/api\/(?=api\/)/, "/"),
        },
      },
      // На всякий случай, если прямые запросы придут на dev-сервер
      cors: true,
    },
    preview: {
      host: true,
      port: 4173,
      open: true,
    },
    build: {
      outDir: "dist",
      sourcemap: true,
      chunkSizeWarningLimit: 1000,
    },
  };
});
