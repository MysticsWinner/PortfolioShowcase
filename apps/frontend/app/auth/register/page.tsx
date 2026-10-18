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
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill out all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const data = await authApi.register(name, email, password);
      // If registration mandates OTP verification
      if (data.requiresConfirmation || data.requiresVerification) {
        router.push(`/auth/verify?email=${encodeURIComponent(email)}`);
        return;
      }
      
      // If direct activation
      if (data.accessToken && data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.accessToken);
        router.push('/dashboard');
      } else {
        router.push(`/auth/verify?email=${encodeURIComponent(email)}`);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(typeof msg === 'string' ? msg : 'Failed to create account. That email address might already be in use.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex justify-center items-center p-6 relative">
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-pink-600/15 rounded-full blur-[130px] -z-10 animate-pulse" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-violet-600/15 rounded-full blur-[130px] -z-10 animate-pulse" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white/[0.04] backdrop-blur-2xl border border-white/10 p-8 rounded-3xl shadow-2xl relative"
      >
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-600 via-rose-500 to-violet-600 items-center justify-center text-white font-black text-lg mb-4 shadow-lg shadow-pink-500/30">
            PS
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Create Account</h1>
          <p className="text-gray-400 text-sm mt-1 font-light">
            Join the Showcase platform to build and present your portfolio.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold ml-1">
              Full Name
            </label>
            <input
              type="text"
              required
              className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/40 transition-all font-light placeholder:text-gray-600"
              placeholder="Alex Morgan"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold ml-1">
              Email Address
            </label>
            <input
              type="email"
              required
              className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/40 transition-all font-light placeholder:text-gray-600"
              placeholder="alex@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center ml-1">
              <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-xs text-pink-400 hover:text-pink-300 transition-colors"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/40 transition-all font-light placeholder:text-gray-600"
              placeholder="••••••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <p className="text-[11px] text-gray-500 ml-1">Minimum 6 characters with secure bcrypt hashing.</p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-red-400 text-xs font-medium bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-2"
              >
                <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-pink-600 via-rose-600 to-violet-600 hover:from-pink-500 hover:to-violet-500 text-white font-bold py-3.5 rounded-xl transition-all hover:shadow-[0_0_25px_rgba(219,39,119,0.4)] flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Provisioning Account...</span>
              </span>
            ) : "Complete Registration"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/10 text-center text-sm text-gray-400">
          Already registered?{" "}
          <Link href="/auth/login" className="text-pink-400 hover:text-white font-medium transition-colors underline underline-offset-4">
            Log in here
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
