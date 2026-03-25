"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Portfolio } from '../utils/api';

interface PortfolioCardProps {
  portfolio: Portfolio;
  onDelete: (id: string) => void;
  onDownload?: (id: string, filename: string) => void;
}

export default function PortfolioCard({ portfolio, onDelete, onDownload }: PortfolioCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="relative group overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 flex flex-col justify-between h-64 hover:border-violet-500/50 hover:shadow-[0_0_40px_-10px_rgba(139,92,246,0.3)] transition-all duration-300"
    >
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-transparent to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div>
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            {portfolio.title}
          </h3>
          <button
            onClick={() => onDelete(portfolio.id)}
            className="text-gray-500 hover:text-red-400 transition-colors bg-white/5 hover:bg-red-500/10 p-2 rounded-full backdrop-blur-md"
            aria-label="Delete Portfolio"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
        
        <p className="text-sm text-gray-400 line-clamp-4 leading-relaxed font-light">
          {portfolio.data}
        </p>

        {portfolio.fileName && (
          <button
            onClick={() => onDownload?.(portfolio.id, portfolio.fileName || "portfolio_document.pdf")}
            className="mt-6 w-full py-2.5 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 rounded-xl text-violet-300 font-semibold text-sm transition-all flex items-center justify-center gap-2 group/btn"
          >
            <svg className="w-4 h-4 group-hover/btn:-translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Unlock & Download File
          </button>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-xs text-gray-500 font-medium">
        <span>Created {new Date(portfolio.createdAt).toLocaleDateString()}</span>
        <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full border border-emerald-400/20">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="tracking-widest uppercase text-[10px]">Encrypted</span>
        </div>
      </div>
    </motion.div>
  );
}
