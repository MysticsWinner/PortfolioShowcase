"use client";

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../components/AuthProvider';

export default function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.role?.type === 'ADMIN';

  return (
    <div className="p-6 md:p-10 text-white max-w-7xl mx-auto space-y-8">
      {/* Welcome Header & User Identity Display */}
      <div className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-r from-violet-900/30 via-indigo-900/20 to-pink-900/20 border border-white/10 backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-violet-600/20 rounded-full blur-[100px] -z-10" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-violet-500/20 text-violet-300 border border-violet-500/30">
                {user?.role?.type || 'PRO MEMBER'}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Session Active & Verified
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Welcome back, <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-pink-400">{user?.name || 'Developer'}</span>!
            </h1>
            <p className="text-gray-400 text-sm max-w-2xl font-light">
              Manage your presentation portfolios, evaluate visitor intelligence telemetry, and showcase your best technical work.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/portfolios"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-violet-600/25 transition-all hover:scale-[1.02]"
            >
              My Portfolios
            </Link>
            <button
              onClick={() => {
                if (user) {
                  window.open(`/api/resume?name=${encodeURIComponent(user.name)}&email=${encodeURIComponent(user.email)}`, '_blank');
                }
              }}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold text-sm transition-all"
            >
              Export Resume PDF
            </button>
          </div>
        </div>
      </div>

      {/* User Retention & Telemetry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Identity & Retention Card */}
        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Identity & Retention</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Verified
            </span>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
              <span className="text-[11px] text-gray-500 uppercase font-semibold">User Account</span>
              <p className="text-sm font-bold text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                <span className="text-gray-500 block text-[10px] uppercase font-semibold">Session Status</span>
                <span className="font-bold text-emerald-400">Authenticated</span>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                <span className="text-gray-500 block text-[10px] uppercase font-semibold">Security Chain</span>
                <span className="font-bold text-violet-400">JWT Intercepted</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Workspaces Card */}
        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Portfolios & Projects</h3>
            <Link href="/dashboard/portfolios" className="text-xs text-violet-400 hover:text-violet-300">
              View All →
            </Link>
          </div>

          <p className="text-xs text-gray-400">
            Upload custom portfolio templates, binary document attachments (PDF/DOCX), and synchronize live data directly to PostgreSQL.
          </p>

          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/dashboard/portfolios"
              className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-200 transition-colors flex items-center justify-between"
            >
              <span>Manage Portfolios</span>
              <span className="text-gray-500">→</span>
            </Link>
            <Link
              href="/dashboard/projects"
              className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-200 transition-colors flex items-center justify-between"
            >
              <span>Manage Showcase Projects</span>
              <span className="text-gray-500">→</span>
            </Link>
          </div>
        </div>

        {/* System & Hosting Infrastructure Card */}
        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Hosting & Topology</h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Live Topology
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5">
              <span className="text-gray-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                Frontend:
              </span>
              <strong className="text-white">Vercel (Production Edge)</strong>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5">
              <span className="text-gray-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                Backend:
              </span>
              <strong className="text-white">Render (Web Service)</strong>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5">
              <span className="text-gray-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                Database:
              </span>
              <strong className="text-white">Neon PostgreSQL</strong>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <a
              href="https://github.com/MysticsWinner/PortfolioShowcase"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-200 transition-colors flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                GitHub Repository
              </span>
              <span>↗</span>
            </a>

            {isAdmin && (
              <Link
                href="/dashboard/admin"
                className="w-full py-2 px-3 rounded-xl bg-pink-600/15 hover:bg-pink-600/25 border border-pink-500/30 text-xs font-semibold text-pink-300 transition-colors flex items-center justify-between"
              >
                <span>Admin User Portal</span>
                <span>→</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
