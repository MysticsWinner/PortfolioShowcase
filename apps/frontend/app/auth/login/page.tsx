"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../components/AuthProvider';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/dashboard';

  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Restore remembered credentials preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem('saved_email');
      const isRemembered = localStorage.getItem('remember_me') !== 'false';
      if (savedEmail) {
        setEmail(savedEmail);
      }
      setRememberMe(isRemembered);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill out all required fields.');
      return;
    }
    setError('');
    setUnverifiedEmail(null);
    setLoading(true);

    try {
      const result = await login(email, password, rememberMe);
      if (result.requiresVerification) {
        router.push(`/auth/verify?email=${encodeURIComponent(result.email || email)}`);
        return;
      }
      router.push(redirectUrl);
    } catch (err: any) {
      const respData = err.response?.data;
      const errorMsg = respData?.message || '';

      if (errorMsg === 'ACCOUNT_NOT_VERIFIED' || respData?.error === 'ACCOUNT_NOT_VERIFIED') {
        setUnverifiedEmail(email);
        setError('Your account is not verified yet. An OTP code is required to complete activation.');
      } else {
        setError(typeof errorMsg === 'string' ? errorMsg : 'Invalid credentials. Please verify your email and password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex justify-center items-center p-6 relative">
      {/* Dynamic Background Ambient Blobs */}
      <div className="absolute top-10 right-1/4 w-96 h-96 bg-violet-600/15 rounded-full blur-[130px] -z-10 animate-pulse" />
      <div className="absolute bottom-10 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-[130px] -z-10 animate-pulse" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white/[0.04] backdrop-blur-2xl border border-white/10 p-8 rounded-3xl shadow-2xl relative"
      >
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-pink-500 items-center justify-center text-white font-black text-lg mb-4 shadow-lg shadow-violet-500/30">
            PS
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Welcome Back</h1>
          <p className="text-gray-400 text-sm mt-1 font-light">
            Authenticate to access your portfolios and telemetry.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold ml-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/40 transition-all font-light placeholder:text-gray-600"
                placeholder="developer@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center ml-1">
              <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/40 transition-all font-light placeholder:text-gray-600"
                placeholder="••••••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* User Retention: Remember Me Toggle */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-violet-600 focus:ring-violet-500 focus:ring-offset-0 focus:ring-2"
              />
              <span>Remember me for 30 days</span>
            </label>
            <span className="text-xs text-gray-500">JWT Encrypted</span>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-red-400 text-xs font-medium bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex flex-col gap-2"
              >
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{error}</span>
                </div>
                {unverifiedEmail && (
                  <button
                    type="button"
                    onClick={() => router.push(`/auth/verify?email=${encodeURIComponent(unverifiedEmail)}`)}
                    className="mt-1 w-full py-2 px-3 bg-red-500/20 hover:bg-red-500/30 text-white rounded-lg font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Activate Account with OTP</span>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-bold py-3.5 rounded-xl transition-all hover:shadow-[0_0_25px_rgba(139,92,246,0.4)] flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Authenticating...</span>
              </span>
            ) : "Sign In to Dashboard"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/10 text-center text-sm text-gray-400">
          Don't have an account yet?{" "}
          <Link href="/auth/register" className="text-violet-400 hover:text-white font-medium transition-colors underline underline-offset-4">
            Create an account
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center text-gray-400">
        Loading authentication interface...
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
