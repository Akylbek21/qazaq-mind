// src/pages/ProfileEdit.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../auth/AuthContext";
import http from "../lib/http";

export default function ProfileEdit() {
  const { user, username: authUsername, fetchProfile } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Профильді жүктеу
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const { data } = await http.get("/user/profile");
        
        setFormData({
          firstName: data?.firstName || "",
          lastName: data?.lastName || "",
        });
      } catch (err) {
        console.error("Profile load error:", err);
        setError(err?.response?.data?.message || "Профиль жүктелмеді");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError("");
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Валидация
    if (!formData.firstName.trim()) {
      setError("Атыңызды енгізіңіз");
      return;
    }
    
    if (!formData.lastName.trim()) {
      setError("Тегіңізді енгізіңіз");
      return;
    }

    try {
      setSaving(true);
      setError("");
      
      // PUT/PATCH запрос
      await http.put("/user/profile", {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
      });
      
      setSuccess(true);
      
      // AuthContext-те профильді жаңарту
      if (fetchProfile) {
        await fetchProfile();
      }
      
      // 2 секундтан кейін басты бетке оралу
      setTimeout(() => {
        navigate(-1); // Артқа қайту
      }, 2000);
    } catch (err) {
      console.error("Profile update error:", err);
      setError(err?.response?.data?.message || "Профиль жаңартылмады");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Профиль жүктелуде...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-block p-4 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl mb-4">
            <svg className="w-12 h-12 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-100 mb-2">Профильді өңдеу</h1>
          <p className="text-slate-400">
            @{user?.username || authUsername}
          </p>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* First Name */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-slate-300 mb-2">
                Аты <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 focus:outline-none transition"
                placeholder="Асылхан"
                disabled={saving}
              />
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-slate-300 mb-2">
                Тегі <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 focus:outline-none transition"
                placeholder="Ажибек"
                disabled={saving}
              />
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300"
              >
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">{error}</span>
              </motion.div>
            )}

            {/* Success Message */}
            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-start gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-300"
              >
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">Профиль сәтті жаңартылды! Қайта бағыттау...</span>
              </motion.div>
            )}

            {/* Info */}
            <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-300">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-sm">
                <p className="font-medium mb-1">Назар аударыңыз:</p>
                <p className="text-blue-200">Тек атыңыз бен тегіңізді өзгерте аласыз. Username ({user?.username || authUsername}) өзгертуге болмайды.</p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-indigo-500/25"
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Сақталуда...
                  </span>
                ) : (
                  "Сақтау"
                )}
              </button>
              
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-100 font-medium rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                Болдырмау
              </button>
            </div>
          </form>
        </motion.div>

        {/* User Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 bg-gradient-to-br from-slate-800/30 to-slate-900/30 backdrop-blur-xl rounded-xl border border-slate-700/30 p-6"
        >
          <h3 className="text-lg font-semibold text-slate-200 mb-4">Қосымша ақпарат</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500 mb-1">Рөлі</p>
              <p className="text-sm text-slate-300 font-medium">
                {user?.role === "STUDENT" && "Оқушы"}
                {user?.role === "TEACHER" && "Мұғалім"}
                {user?.role === "PARENT" && "Ата-ана"}
                {!user?.role && "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Ұпай (Score)</p>
              <p className="text-sm text-slate-300 font-medium">
                {user?.score ?? 0}
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

