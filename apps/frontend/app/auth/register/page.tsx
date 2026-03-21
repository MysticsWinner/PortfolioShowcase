"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { authApi } from '../../../utils/api';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill out all fields.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const data = await authApi.register(name, email, password);
      if (data.requiresConfirmation) {
        setError('Registration successful! Please confirm your email before logging in.');
        return;
      }
      
      // Simulating holding the token/user locally or in cookies
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.accessToken);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create account. Email might be in use.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex justify-center items-center p-6 relative">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px] -z-10" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-3xl shadow-2xl relative"
      >
        <h1 className="text-3xl font-extrabold text-white text-center mb-2 tracking-tight">Create Account</h1>
        <p className="text-gray-400 text-center text-sm mb-8 font-light">Join us to showcase your best work securely.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold ml-1">Full Name</label>
            <input
              type="text"
              className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-pink-500/50 transition-all font-light"
              placeholder="John Doe"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold ml-1">Email</label>
            <input
              type="email"
              className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-pink-500/50 transition-all font-light"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold ml-1">Password</label>
            <input
              type="password"
              className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-pink-500/50 transition-all font-light"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
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
             disabled={loading}
             className="w-full bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-500 hover:to-violet-500 text-white font-bold py-3 rounded-xl transition-all hover:shadow-[0_0_20px_rgba(219,39,119,0.4)] flex justify-center items-center"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            ) : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          Already have an account? <Link href="/auth/login" className="text-pink-400 hover:text-white transition-colors underline underline-offset-4">Log in here</Link>
        </div>
      </motion.div>
    </div>
  );
}
