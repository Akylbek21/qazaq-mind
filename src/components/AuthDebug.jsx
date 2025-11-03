// src/components/AuthDebug.jsx
// Компонент для отладки авторизации
import React, { useState } from "react";
import { useAuth } from "../auth/AuthContext";

export default function AuthDebug() {
  const { role, username, token, user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);

  const roleNames = {
    TEACHER: "Мұғалім",
    STUDENT: "Оқушы",
    PARENT: "Ата-ана",
  };
  const roleName = roleNames[role] || role || "—";

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-3 py-2 bg-slate-800 text-white rounded-lg shadow-lg text-sm font-medium hover:bg-slate-700 transition"
      >
        {isExpanded ? "✕ Жабу" : "🔍 Auth Debug"}
      </button>

      {isExpanded && (
        <div className="absolute bottom-14 right-0 w-80 bg-slate-800 text-white rounded-lg shadow-2xl p-4 text-sm">
          <h3 className="font-bold mb-3 text-base">Авторизация ақпараты</h3>
          
          <div className="space-y-2">
            <div>
              <div className="text-slate-400 text-xs">Қолданушы:</div>
              <div className="font-mono">{username || "—"}</div>
            </div>

            <div>
              <div className="text-slate-400 text-xs">Рөлі (role):</div>
              <div className="font-mono">
                {role || "—"} 
                {role && <span className="ml-2 text-slate-400">({roleName})</span>}
              </div>
            </div>

            <div>
              <div className="text-slate-400 text-xs">Токен бар ма?</div>
              <div className={token ? "text-green-400" : "text-red-400"}>
                {token ? "✓ Иә" : "✗ Жоқ"}
              </div>
            </div>

            <div>
              <div className="text-slate-400 text-xs">Мұғалім ме?</div>
              <div className={role === "TEACHER" ? "text-green-400" : "text-yellow-400"}>
                {role === "TEACHER" ? "✓ Иә" : "✗ Жоқ"}
              </div>
            </div>

            {user && (
              <div>
                <div className="text-slate-400 text-xs">Профиль:</div>
                <pre className="text-xs bg-slate-900 p-2 rounded mt-1 overflow-auto max-h-40">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>
            )}

            <div className="pt-2 border-t border-slate-700">
              <div className="text-slate-400 text-xs mb-1">LocalStorage:</div>
              <div className="text-xs bg-slate-900 p-2 rounded space-y-1">
                <div>qm_token: {localStorage.getItem("qm_token") ? "✓" : "✗"}</div>
                <div>qm_role: {localStorage.getItem("qm_role") || "—"}</div>
                <div>qm_username: {localStorage.getItem("qm_username") || "—"}</div>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-700 text-xs text-slate-400">
            <div className="font-semibold text-white mb-1">Егер қате болса:</div>
            <ul className="list-disc ml-4 space-y-1">
              <li>Мұғалім ретінде кіріңіз</li>
              <li>Токеніңізді тексеріңіз</li>
              <li>Браузерді қайта жүктеңіз</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

