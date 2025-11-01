// vite.config.js
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const rawTarget = env.VITE_QAZAQMIND_SERVICE || "http://85.202.193.138:8087";
  const apiTarget = (/^https?:\/\//.test(rawTarget) ? rawTarget : `http://${rawTarget}`).replace(/\/+$/, "");

  return defineConfig({
    plugins: [react()],
    server: {
      host: true,
      port: 5173,
      cors: true,
      proxy: {
        "/api": { target: apiTarget, changeOrigin: true, secure: false },
      },
    },
    preview: { host: true, port: 4173, open: true },
    build: { outDir: "dist", sourcemap: true, chunkSizeWarningLimit: 1000 },
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
  });
};
