// =============================================
// FILE: src/App.jsx
// Публичная «О сайте» — всегда доступна.
// Остальные страницы — только после регистрации.
// Доступ по ролям для специальных разделов.
// =============================================
import React from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";

// Общие секции лендинга
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

// Страницы проекта (модули)
import RealTalkTime from "./pages/RealTalkTime";
import IntellectUp from "./pages/IntellectUp";
import TeacherConsole from "./pages/TeacherConsole";
import HistoricalQuiz from "./pages/HistoricalQuiz";
import LitQuiz from "./pages/LitQuiz";
import ThinkHub from "./pages/ThinkHub";
import LifeCharge from "./pages/LifeCharge";
import AtaLink from "./pages/AtaLink";

// Новые страницы (аутентификация и домашние по ролям)
import Register from "./pages/Register";
import StudentHome from "./pages/StudentHome";
import TeacherHome from "./pages/TeacherHome";
import ParentHome from "./pages/ParentHome";

// ---------- Публичная страница «О сайте» ----------
function Landing() {
  return (
    <>
      <Header />
      <main className="relative">
        <HeroSection />
        <PitchSection />
        <ProductsSection />
        <TeacherInsightSection />
        <HistoricalQuizSection />
        <MissionSection />
        <ScenariosSection />
        <FinalCtaSection />
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

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Публичные */}
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />

        {/* Домашние по ролям */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allow={["student"]}>
              <StudentHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher"
          element={
            <ProtectedRoute allow={["teacher"]}>
              <TeacherHome />
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

        {/* Модули: доступны всем зарегистрированным */}
        <Route
          path="/realtalk"
          element={
            <ProtectedRoute>
              <RealTalkTime />
            </ProtectedRoute>
          }
        />
        <Route
          path="/intellect-up"
          element={
            <ProtectedRoute>
              <IntellectUp />
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
            <ProtectedRoute>
              <ThinkHub />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lifecharge"
          element={
            <ProtectedRoute>
              <LifeCharge />
            </ProtectedRoute>
          }
        />
        <Route
          path="/atalink"
          element={
            <ProtectedRoute>
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

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}

/*
ВАЖНО:
— Чтобы незарегистрированных не кидало на 404, а на регистрацию с баннером,
  в ProtectedRoute сделай редирект на /register?reason=auth (я уже показывал код).
— В Register.jsx покажи баннер, если reason=auth или есть state.from.
— BrowserRouter должен быть в src/main.jsx, например:
    import { BrowserRouter } from "react-router-dom";
    createRoot(...).render(
      <BrowserRouter><App /></BrowserRouter>
    );
*/
