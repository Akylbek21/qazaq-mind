// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    host: true,       // жергілікті желіден да қолжетімді
    port: 5173,       // сен қойған порт
    open: true,       // автоматты ашу
  },
  preview: {
    host: true,
    port: 5173,       // қаласаң 4173 деп бөлек қылуға болады
    open: true,
  },
  build: {
    sourcemap: true,  // дебагқа ыңғайлы
    outDir: 'dist',
  },
});
