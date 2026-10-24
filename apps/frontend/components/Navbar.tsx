"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close dropdown on route change
  useEffect(() => {
    setDropdownOpen(false);
  }, [pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const isAdmin = user?.role?.type === 'ADMIN';

  return (
    <nav className="w-full h-16 bg-black/70 backdrop-blur-xl border-b border-white/10 flex items-center px-6 md:px-8 z-50 sticky top-0 transition-all">
      <Link href="/" className="flex items-center gap-2 group">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-500 to-pink-500 flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:scale-105 transition-transform">
          <span className="text-white font-black text-sm tracking-tighter">PS</span>
        </div>
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-indigo-300 to-pink-400">
          Showcase
        </span>
      </Link>

      <div className="ml-auto flex gap-5 md:gap-6 text-sm font-medium text-gray-300 items-center">
        <Link href="/" className="hover:text-white transition-colors hidden sm:inline-block">Home</Link>
        <Link href="/about" className="hover:text-white transition-colors">About</Link>
        <Link href="/blog" className="hover:text-white transition-colors hidden md:inline-block">Blog</Link>
        <Link href="/contact" className="hover:text-white transition-colors hidden sm:inline-block">Contact</Link>

        {/* Dynamic Resume Link */}
        <button
          onClick={(e) => {
            e.preventDefault();
            if (!isAuthenticated || !user) {
              alert("Please log in to generate and view your personalized dynamic resume.");
              window.location.href = '/auth/login?redirect=' + encodeURIComponent('/api/resume');
            } else {
              window.open(`/api/resume?name=${encodeURIComponent(user.name)}&email=${encodeURIComponent(user.email)}`, '_blank');
            }
          }}
          className="text-violet-400 font-semibold hover:text-violet-300 transition-colors flex items-center gap-1.5"
          title="Export Dynamic Resume PDF"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="hidden sm:inline">Resume</span>
        </button>

        {/* GitHub Repository Link */}
        <a
          href="https://github.com/MysticsWinner/PortfolioShowcase"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
          title="GitHub Repository (MysticsWinner/PortfolioShowcase)"
          aria-label="GitHub Repository"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
        </a>

        <div className="w-px h-5 bg-white/10" />

        {/* Authenticated User Display & Dropdown */}
        {isAuthenticated && user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 p-1 pl-2 pr-3 rounded-full bg-white/5 border border-white/10 hover:border-violet-500/50 hover:bg-white/10 transition-all focus:outline-none focus:ring-2 focus:ring-violet-500/40"
              aria-expanded={dropdownOpen}
            >
              {/* Avatar Orb */}
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-violet-600 via-indigo-600 to-pink-500 flex items-center justify-center text-xs font-bold text-white shadow-sm ring-1 ring-white/20">
                {getInitials(user.name)}
              </div>
              <span className="text-xs font-semibold text-white max-w-[100px] truncate hidden sm:inline-block">
                {user.name}
              </span>
              <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${isAdmin ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'}`}>
                {isAdmin ? 'ADMIN' : 'PRO'}
              </span>
              <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Profile Menu Dropdown */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-[#141417]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* User Identity Header */}
                <div className="p-3 border-b border-white/10 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-pink-500 flex items-center justify-center text-sm font-bold text-white shadow-md">
                      {getInitials(user.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{user.name}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-gray-400">
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Active Session
                    </span>
                    <span className="text-gray-500 uppercase tracking-wider font-semibold">
                      {user.role?.type || 'MEMBER'}
                    </span>
                  </div>
                </div>

                {/* Nav Links */}
                <div className="space-y-0.5 text-sm">
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2.5 px-3 py-2 text-gray-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                  >
                    <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    Dashboard Overview
                  </Link>

                  <Link
                    href="/dashboard/portfolios"
                    className="flex items-center gap-2.5 px-3 py-2 text-gray-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                  >
                    <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    My Portfolios
                  </Link>

                  <Link
                    href="/dashboard/projects"
                    className="flex items-center gap-2.5 px-3 py-2 text-gray-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                  >
                    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    Showcase Projects
                  </Link>

                  <Link
                    href="/dashboard/messages"
                    className="flex items-center gap-2.5 px-3 py-2 text-gray-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                  >
                    <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    Messages & Gateway
                  </Link>

                  <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-2.5 px-3 py-2 text-gray-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                  >
                    <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Account Settings
                  </Link>

                  <Link
                    href="/dashboard/blog"
                    className="flex items-center gap-2.5 px-3 py-2 text-gray-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                  >
                    <svg className="w-4 h-4 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                    Dev Log Studio
                  </Link>

                  {isAdmin && (
                    <>
                      <div className="my-1 border-t border-white/10" />
                      <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                        Admin Controls
                      </div>
                      <Link
                        href="/dashboard/admin"
                        className="flex items-center gap-2.5 px-3 py-2 text-pink-300 hover:text-pink-200 hover:bg-pink-500/10 rounded-xl transition-colors"
                      >
                        <svg className="w-4 h-4 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        Admin User Management
                      </Link>
                      <Link
                        href="/dashboard/cms"
                        className="flex items-center gap-2.5 px-3 py-2 text-cyan-300 hover:text-cyan-200 hover:bg-cyan-500/10 rounded-xl transition-colors"
                      >
                        <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        CMS Control Center
                      </Link>
                    </>
                  )}

                  <div className="my-1 border-t border-white/10" />

                  {/* Logout Button */}
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors text-left"
                  >
                    <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-gray-300 hover:text-white transition-colors text-sm px-3 py-1.5 rounded-lg hover:bg-white/5"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="text-sm font-semibold px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white shadow-md shadow-violet-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
