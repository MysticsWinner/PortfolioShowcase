"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/+$/, '');
    try {
      const res = await fetch(`${apiBase}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Submission failed');
      
      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      console.error('[ContactPage Error]:', err);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-8 bg-black">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-violet-900/20 to-transparent blur-[120px] rounded-full" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-cyan-900/20 to-transparent blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-cyan-400 mb-2">
            Get in Touch
          </h1>
          <p className="text-gray-400 text-sm mb-8">
            Have a question or want to work together? Leave a message below.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-gray-300">Name</label>
              <input
                id="name"
                type="text"
                required
                disabled={status === 'loading'}
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-300">Email Address</label>
              <input
                id="email"
                type="email"
                required
                disabled={status === 'loading'}
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                placeholder="john@example.com"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium text-gray-300">Message</label>
              <textarea
                id="message"
                required
                disabled={status === 'loading'}
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                rows={5}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all resize-none"
                placeholder="How can I help you?"
              />
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-semibold py-3 px-4 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {status === 'loading' ? 'Sending Payload...' : 'Submit Transmission'}
            </button>

            {status === 'success' && (
              <motion.p 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="text-emerald-400 text-center text-sm font-medium"
              >
                Message transmitted successfully!
              </motion.p>
            )}
            
            {status === 'error' && (
              <motion.p 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-center text-sm font-medium"
              >
                Transmission failed. Please try again.
              </motion.p>
            )}
          </form>
        </div>
      </motion.div>
    </div>
  );
}
