"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { portfolioApi, Portfolio } from '../../../utils/api';
import PortfolioCard from '../../../components/PortfolioCard';

// Mock user ID for demonstration purposes (in a real app, from Auth Context)
const MOCK_USER_ID = "123e4567-e89b-12d3-a456-426614174000";

export default function PortfoliosPage() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const fetchPortfolios = async () => {
    setIsLoading(true);
    try {
      const data = await portfolioApi.getPortfolios(MOCK_USER_ID);
      setPortfolios(data);
      setError(null);
    } catch (err) {
      setError("Failed to load portfolios. Ensure the backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await portfolioApi.deletePortfolio(MOCK_USER_ID, id);
      setPortfolios((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert("Failed to delete portfolio.");
    }
  };

  return (
    <div className="min-h-[80vh] p-8 md:p-12 relative w-full overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-2">
              Your Portfolios
            </h1>
            <p className="text-gray-400 font-light text-lg">
              Securely encrypted and beautifully presented.
            </p>
          </div>
          <Link href="/dashboard/portfolios/new">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-black px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-gray-100 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Upload New
            </motion.button>
          </Link>
        </div>

        {error ? (
          <div className="text-red-400 text-center py-12 bg-red-500/10 rounded-2xl border border-red-500/20 max-w-2xl mx-auto">
            {error}
          </div>
        ) : isLoading ? (
          <div className="flex justify-center items-center h-64">
             <div className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
          </div>
        ) : portfolios.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-64 border border-dashed border-white/20 rounded-3xl bg-white/5 backdrop-blur-sm"
          >
            <p className="text-gray-400 text-lg mb-4">No portfolios uploaded yet.</p>
            <Link href="/dashboard/portfolios/new" className="text-violet-400 hover:text-violet-300 underline underline-offset-4 transition-colors">
              Upload your first portfolio
            </Link>
          </motion.div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {portfolios.map((portfolio) => (
                <PortfolioCard 
                  key={portfolio.id} 
                  portfolio={portfolio} 
                  onDelete={handleDelete} 
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
