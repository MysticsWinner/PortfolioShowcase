"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function NewsletterWidget() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [msg, setMsg] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Subscription failed');
      
      setStatus('success');
      setMsg(data.message || 'Successfully subscribed!');
      setEmail('');
    } catch (err: any) {
      console.error('[NewsletterWidget Error]:', err);
      setStatus('error');
      setMsg(err.message);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-violet-900/40 to-black border border-violet-500/20 rounded-2xl p-8 mb-12 text-center"
    >
      <h3 className="text-2xl font-bold text-white mb-2">Join the Dev Network</h3>
      <p className="text-gray-400 mb-6 max-w-md mx-auto">
        Subscribe to get notified about deep-dive technical articles, architecture teardowns, and showcase updates.
      </p>
      
      <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
        <input 
          type="email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email address..."
          required
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-pink-500 transition-colors"
        />
        <button 
          type="submit" 
          disabled={status === 'loading'}
          className="bg-white text-black font-bold px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          {status === 'loading' ? 'Binding...' : 'Subscribe'}
        </button>
      </form>

      {status === 'success' && <p className="text-emerald-400 mt-4 font-medium">{msg}</p>}
      {status === 'error' && <p className="text-red-400 mt-4 font-medium">{msg}</p>}
    </motion.div>
  );
}
