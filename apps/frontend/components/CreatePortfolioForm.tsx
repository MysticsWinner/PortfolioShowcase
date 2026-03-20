"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CreatePortfolioFormProps {
  onSubmit: (title: string, data: string) => Promise<void>;
  isLoading: boolean;
}

export default function CreatePortfolioForm({ onSubmit, isLoading }: CreatePortfolioFormProps) {
  const [title, setTitle] = useState('');
  const [data, setData] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !data.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    setError(null);
    try {
      await onSubmit(title, data);
    } catch (err) {
      setError("Failed to upload portfolio. Connection error.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="max-w-xl mx-auto w-full backdrop-blur-2xl bg-black/40 border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/20 rounded-full blur-[100px] -z-10 mix-blend-screen" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-500/20 rounded-full blur-[80px] -z-10 mix-blend-screen" />

      <h2 className="text-3xl font-extrabold mb-2 text-white text-center tracking-tight">
        Secure Upload
      </h2>
      <p className="text-gray-400 text-center text-sm mb-8 font-light">
        Your portfolio is instantly AES-256 encrypted upon arrival. 
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2 relative group">
          <label htmlFor="title" className="block text-xs uppercase tracking-wider text-gray-400 font-semibold ml-1">
            Portfolio Title
          </label>
          <input
            id="title"
            type="text"
            className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all placeholder:text-gray-600 font-light"
            placeholder="e.g. My Next.js Masterpieces..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="data" className="block text-xs uppercase tracking-wider text-gray-400 font-semibold ml-1">
            Raw Portfolio Data (Markdown/JSON)
          </label>
          <textarea
            id="data"
            rows={5}
            className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all placeholder:text-gray-600 font-mono text-sm resize-none"
            placeholder="Introduce yourself or paste a standard format..."
            value={data}
            onChange={(e) => setData(e.target.value)}
          />
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-red-400 text-sm font-medium text-center bg-red-500/10 border border-red-500/20 py-2 rounded-xl"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="submit"
          disabled={isLoading}
          className="relative w-full overflow-hidden group rounded-xl p-[1px]"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-violet-600 via-pink-600 to-violet-600 opacity-70 group-hover:opacity-100 animate-gradient bg-[length:200%_auto] transition-opacity duration-500" />
          <div className="relative flex justify-center items-center bg-black/50 backdrop-blur-md px-4 py-3 rounded-xl w-full h-full font-semibold text-white tracking-wide transition-all group-hover:bg-black/40">
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              "Encrypt & Upload"
            )}
          </div>
        </button>
      </form>
    </motion.div>
  );
}
