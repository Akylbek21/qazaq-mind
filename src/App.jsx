// =============================================
// FILE: src/App.jsx
// Публичная «О сайте» — доступна всем.
// IntellectUp (Danalyq Challenge) — ПУБЛИЧНО.
// Остальные модули — только после авторизации.
// =============================================
import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import './styles/components.css';

// --- Публичные секции лендинга ---
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import PitchSection from "./components/PitchSection";
import ProductsSection from "./components/ProductsSection";
import HistoricalQuizSection from "./components/HistoricalQuizSection";
import TeacherInsightSection from "./components/TeacherInsightSection";
import MissionSection from "./components/MissionSection";
import ScenariosSection from "./components/ScenariosSection";
import FinalCtaSection from "./components/FinalCtaSection";

import Footer from "./components/Footer";
import UserInsightBlock from "./components/UserInsightBlock";

// --- Страницы (ленивые импорты) ---
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));

const StudentHome = lazy(() => import("./pages/StudentHome"));
const ParentHome = lazy(() => import("./pages/ParentHome"));

const RealTalkTime = lazy(() => import("./pages/RealTalkTime"));
const IntellectUp = lazy(() => import("./pages/IntellectUp"));
const TeacherConsole = lazy(() => import("./pages/TeacherConsole"));
const HistoricalQuiz = lazy(() => import("./pages/HistoricalQuiz"));
const LitQuiz = lazy(() => import("./pages/LitQuiz"));
const ThinkHub = lazy(() => import("./pages/ThinkHub"));
const LifeCharge = lazy(() => import("./pages/LifeCharge"));
const AtaLink = lazy(() => import("./pages/AtaLink"));
const ProfileEdit = lazy(() => import("./pages/ProfileEdit"));
const StudentInsights = lazy(() => import("./pages/StudentInsights"));

// ---------- Публичная страница «О сайте» ----------
function Landing() {
  const { role, isAuthenticated } = useAuth();
  
  // Для STUDENT скрываем некоторые секции
  const isStudent = isAuthenticated && String(role || "").toUpperCase() === "STUDENT";
  const isTeacher = isAuthenticated && String(role || "").toUpperCase() === "TEACHER";
  
  return (
    <>
      <Header />
      <main className="relative">
        <HeroSection />
        <PitchSection />
        <ProductsSection />
        {/* TeacherInsightSection — только для не-STUDENT */}
        {!isStudent && <TeacherInsightSection />}
        {/* HistoricalQuizSection — тест про тарихи тұлға */}
        <HistoricalQuizSection />
        
        {/* Секция анализа учеников (только для учителей) */}
        {isTeacher && (
          <div className="py-12 bg-gradient-to-b from-slate-50 to-white">
            <div className="container mx-auto max-w-4xl text-center px-4">
              <motion.h2
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.5 }}
                className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4"
              >
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#7c3aed] via-[#8b5cf6] to-[#a78bfa]">
                  Оқушыларды талдау
                </span>
              </motion.h2>
              <div className="mx-auto mt-4 h-[3px] w-24 rounded-full bg-gradient-to-r from-[#7c3aed] to-[#a78bfa]" />
              <p className="max-w-2xl mx-auto text-lg text-slate-600 mt-6 mb-8">
                Барлық оқушылардың IQ, EQ, SQ, PQ көрсеткіштері мен детальды аналитикасын көріңіз.
              </p>
              <Link 
                to="/student-insights" 
                className="inline-flex items-center justify-center rounded-xl px-8 py-4 bg-gradient-to-r from-[#7c3aed] via-[#8b5cf6] to-[#a78bfa] text-white font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                Анализге өту
              </Link>
            </div>
          </div>
        )}
        
        {/* Анализ пользователя — только для STUDENT */}
        {isStudent && <UserInsightBlock />}
        {/* Эти секции скрыты для STUDENT */}
        {!isStudent && (
          <>
            <MissionSection />
            <ScenariosSection />
            <FinalCtaSection />
          </>
        )}
      </main>
      <Footer />
    </>
  );
}

// ---------- 404 ----------
function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl font-extrabold">404</div>
        <div className="text-slate-600 mt-2">Бет табылмады</div>
      </div>
    </div>
  );
}

// Общий fallback для ленивых страниц
function Fallback() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center text-slate-600">
      Жүктеліп жатыр...
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<Fallback />}>
        <Routes>
          {/* Публичные */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ⚡ Danalyq Challenge (IQ) — ПУБЛИЧНО */}
          <Route path="/intellect-up" element={<IntellectUp />} />
          {/* Алиасы-редиректы на /intellect-up */}
          <Route path="/intellectup" element={<Navigate to="/intellect-up" replace />} />
          <Route path="/IntellectUp" element={<Navigate to="/intellect-up" replace />} />
          <Route path="/danalyq" element={<Navigate to="/intellect-up" replace />} />
          <Route path="/Danalyq" element={<Navigate to="/intellect-up" replace />} />
          <Route path="/danalyq-challenge" element={<Navigate to="/intellect-up" replace />} />
          <Route path="/Danalyq-Challenge" element={<Navigate to="/intellect-up" replace />} />

          {/* Домашние по ролям (требуется авторизация) */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allow={["student"]}>
                <StudentHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent"
            element={
              <ProtectedRoute allow={["parent"]}>
                <ParentHome />
              </ProtectedRoute>
            }
          />

          {/* Остальные модули — только для авторизованных */}
          <Route
            path="/realtalk"
            element={
              <ProtectedRoute allow={["STUDENT"]}>
                <RealTalkTime />
              </ProtectedRoute>
            }
          />
          <Route
            path="/historical-quiz"
            element={
              <ProtectedRoute>
                <HistoricalQuiz />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz/:slug"
            element={
              <ProtectedRoute>
                <LitQuiz />
              </ProtectedRoute>
            }
          />
          <Route
            path="/thinkhub"
            element={
              <ProtectedRoute allow={["STUDENT"]}>
                <ThinkHub />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lifecharge"
            element={
              <ProtectedRoute allow={["STUDENT"]}>
                <LifeCharge />
              </ProtectedRoute>
            }
          />
          <Route
            path="/atalink"
            element={
              <ProtectedRoute allow={["PARENT"]}>
                <AtaLink />
              </ProtectedRoute>
            }
          />

          {/* Только для учителя */}
          <Route
            path="/teacher-console"
            element={
              <ProtectedRoute allow={["teacher"]}>
                <TeacherConsole />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student-insights"
            element={
              <ProtectedRoute allow={["teacher"]}>
                <StudentInsights />
              </ProtectedRoute>
            }
          />

          {/* Profile Edit - для всех авторизованных пользователей */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfileEdit />
              </ProtectedRoute>
            }
          />

          {/* Публичный 404 (без ProtectedRoute, чтобы не путать с редиректом на /login) */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}
