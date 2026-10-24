"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../components/AuthProvider';
import { settingsApi } from '../../../utils/api';

export default function SettingsPage() {
  const { user, token, refreshUser, logout, verifySession } = useAuth();

  // Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Preferences State (Stored in localStorage)
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [autoWarmup, setAutoWarmup] = useState(true);

  // Session Token Metadata
  const sessionInfo = useMemo(() => {
    if (!token) return null;
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);
      const expDate = payload.exp ? new Date(payload.exp * 1000) : null;
      const iatDate = payload.iat ? new Date(payload.iat * 1000) : null;
      return {
        expDate,
        iatDate,
        sub: payload.sub,
        role: payload.role,
      };
    } catch {
      return null;
    }
  }, [token]);

  // Session countdown
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    setName(user?.name || '');
  }, [user]);

  useEffect(() => {
    // Load local preferences
    if (typeof window !== 'undefined') {
      setEmailAlerts(localStorage.getItem('pref_email_alerts') !== 'false');
      setSoundEffects(localStorage.getItem('pref_sound_effects') !== 'false');
      setAutoWarmup(localStorage.getItem('pref_auto_warmup') !== 'false');
    }
  }, []);

  useEffect(() => {
    const updateCountdown = () => {
      if (!sessionInfo?.expDate) {
        setTimeRemaining('Unknown');
        return;
      }
      const diffMs = sessionInfo.expDate.getTime() - Date.now();
      if (diffMs <= 0) {
        setTimeRemaining('Expired');
      } else {
        const mins = Math.floor(diffMs / 60000);
        const secs = Math.floor((diffMs % 60000) / 1000);
        setTimeRemaining(`${mins}m ${secs < 10 ? '0' : ''}${secs}s`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [sessionInfo]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setProfileMessage({ type: 'error', text: 'Display name cannot be empty.' });
      return;
    }

    try {
      setIsUpdatingProfile(true);
      setProfileMessage(null);
      await settingsApi.updateProfile({ name: name.trim() });
      await refreshUser();
      setProfileMessage({ type: 'success', text: 'Profile display name updated successfully.' });
    } catch (err: any) {
      setProfileMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setPasswordMessage({ type: 'error', text: 'Current password is required.' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    try {
      setIsUpdatingPassword(true);
      setPasswordMessage(null);
      await settingsApi.changePassword(currentPassword, newPassword);
      setPasswordMessage({ type: 'success', text: 'Password modified and hashed successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update password.' });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const togglePreference = (key: string, current: boolean, setter: (val: boolean) => void) => {
    const nextVal = !current;
    setter(nextVal);
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, String(nextVal));
    }
  };

  const getInitials = (userName?: string) => {
    if (!userName) return 'U';
    const parts = userName.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return userName.slice(0, 2).toUpperCase();
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-10 min-h-screen text-gray-100">
      {/* Top Banner Header */}
      <div className="border-b border-white/10 pb-8">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-violet-400 mb-2">
          <span>Dashboard</span>
          <span>/</span>
          <span className="text-gray-400">User Configuration</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-indigo-300 to-pink-400">
          Account & Security Settings
        </h1>
        <p className="text-sm text-gray-400 mt-2 max-w-2xl">
          Manage your personal identity profile, cryptographic security credentials, and active session verification parameters.
        </p>
      </div>

      {/* SECTION 1: USER IDENTITY & PROFILE */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-b from-white/[0.04] to-black/40 border border-white/10 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Identity & Profile Information
            </h2>
            <p className="text-xs text-gray-400 mt-1">Your public presentation and authentication handle.</p>
          </div>

          <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
            user?.role?.type === 'ADMIN'
              ? 'bg-pink-500/10 text-pink-300 border-pink-500/30'
              : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
          }`}>
            {user?.role?.type || 'MEMBER'}
          </span>
        </div>

        {profileMessage && (
          <div className={`p-3.5 rounded-xl text-xs border ${
            profileMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
              : 'bg-red-500/10 border-red-500/20 text-red-300'
          }`}>
            {profileMessage.text}
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-5">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-pink-500 flex items-center justify-center text-2xl font-black text-white shadow-xl shrink-0 ring-2 ring-white/10">
              {getInitials(user?.name)}
            </div>

            <div className="flex-1 w-full space-y-1">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Full Display Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 transition-colors text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Registered Email Address (Verified)
              </label>
              <div className="flex items-center justify-between px-4 py-2.5 bg-black/30 border border-white/5 rounded-xl text-gray-400 text-sm">
                <span>{user?.email}</span>
                <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Verified
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Internal Account ID
              </label>
              <div className="px-4 py-2.5 bg-black/30 border border-white/5 rounded-xl text-gray-500 font-mono text-xs truncate">
                {user?.id}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white font-semibold text-xs shadow-lg shadow-violet-600/30 transition-all disabled:opacity-50"
            >
              {isUpdatingProfile ? 'Saving...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 2: ACTIVE SESSION & EXPIRY INSPECTOR */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-b from-white/[0.04] to-black/40 border border-white/10 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Active Session & Expiry Inspector
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Cryptographic JSON Web Token (JWT) health and active verification telemetry.
            </p>
          </div>

          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Verified Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1">
            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Configured Lifetime</span>
            <p className="text-sm font-bold text-white">60 Minutes (Default)</p>
            <p className="text-[11px] text-gray-400">Subject to JWT_EXPIRES_IN env</p>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1">
            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Remaining Token Time</span>
            <p className="text-sm font-bold text-emerald-400 font-mono">{timeRemaining || 'Calculating...'}</p>
            <p className="text-[11px] text-gray-400">Live Client Countdown</p>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1">
            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Verification Engine</span>
            <p className="text-sm font-bold text-violet-300">Active per-activity</p>
            <p className="text-[11px] text-gray-400">Clicks, keys, focus & route shifts</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 text-xs text-gray-300">
          <div className="flex items-center justify-between py-1 border-b border-white/5">
            <span className="text-gray-400">Token Issued At:</span>
            <span className="font-mono text-gray-200">
              {sessionInfo?.iatDate ? sessionInfo.iatDate.toLocaleString() : 'Active Session'}
            </span>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-white/5">
            <span className="text-gray-400">Token Scheduled Expiry:</span>
            <span className="font-mono text-gray-200">
              {sessionInfo?.expDate ? sessionInfo.expDate.toLocaleString() : '60 minutes from issue'}
            </span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-gray-400">Database Active Guard:</span>
            <span className="text-emerald-400 font-medium">PostgreSQL prisma.user check on every request</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => verifySession().then(ok => alert(ok ? 'Session verified successfully with backend /auth/me heartbeat!' : 'Session validation failed.'))}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-violet-300 text-xs font-semibold border border-violet-500/20 transition-colors"
          >
            Trigger Manual Heartbeat Check
          </button>

          <button
            type="button"
            onClick={logout}
            className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold border border-red-500/20 transition-colors"
          >
            Invalidate Session & Sign Out
          </button>
        </div>
      </div>

      {/* SECTION 3: SECURITY & PASSWORD CHANGE */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-b from-white/[0.04] to-black/40 border border-white/10 space-y-6 shadow-xl">
        <div className="border-b border-white/10 pb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Security & Cryptographic Password
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Change your password. Passwords are encrypted with bcrypt at 10 rounds of salt.
          </p>
        </div>

        {passwordMessage && (
          <div className={`p-3.5 rounded-xl text-xs border ${
            passwordMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
              : 'bg-red-500/10 border-red-500/20 text-red-300'
          }`}>
            {passwordMessage.text}
          </div>
        )}

        <form onSubmit={handleSavePassword} className="space-y-4 text-sm max-w-xl">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              Current Password *
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                New Password *
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 6 chars"
                className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Confirm New Password *
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50 transition-colors"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isUpdatingPassword}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-500 hover:to-violet-500 text-white font-semibold text-xs shadow-lg shadow-pink-600/30 transition-all disabled:opacity-50"
            >
              {isUpdatingPassword ? 'Updating Password...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 4: WORKSPACE NOTIFICATIONS & PREFERENCES */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-b from-white/[0.04] to-black/40 border border-white/10 space-y-6 shadow-xl">
        <div className="border-b border-white/10 pb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Workspace Preferences & Automation
          </h2>
          <p className="text-xs text-gray-400 mt-1">Configure client behavior and telemetry preferences.</p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/5">
            <div>
              <p className="text-sm font-semibold text-white">Contact Form Email Notifications</p>
              <p className="text-xs text-gray-400 mt-0.5">Receive immediate SMTP alerts when a visitor sends an inquiry.</p>
            </div>
            <button
              onClick={() => togglePreference('pref_email_alerts', emailAlerts, setEmailAlerts)}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${emailAlerts ? 'bg-violet-600' : 'bg-gray-700'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${emailAlerts ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/5">
            <div>
              <p className="text-sm font-semibold text-white">Live Chat Audio Chimes</p>
              <p className="text-xs text-gray-400 mt-0.5">Play subtle audio feedback when new WebSocket messages arrive.</p>
            </div>
            <button
              onClick={() => togglePreference('pref_sound_effects', soundEffects, setSoundEffects)}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${soundEffects ? 'bg-violet-600' : 'bg-gray-700'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${soundEffects ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/5">
            <div>
              <p className="text-sm font-semibold text-white">Automatic Render Cold-Start Warmup</p>
              <p className="text-xs text-gray-400 mt-0.5">Silently ping Render backend on page navigation to prevent spin-up delay.</p>
            </div>
            <button
              onClick={() => togglePreference('pref_auto_warmup', autoWarmup, setAutoWarmup)}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${autoWarmup ? 'bg-violet-600' : 'bg-gray-700'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${autoWarmup ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
