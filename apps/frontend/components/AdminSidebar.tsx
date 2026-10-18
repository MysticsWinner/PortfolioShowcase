"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';

export default function AdminSidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const isAdmin = user?.role?.type === 'ADMIN';

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const navLinks = [
    { label: 'Overview', href: '/dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { label: 'Portfolios', href: '/dashboard/portfolios', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { label: 'Projects', href: '/dashboard/projects', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z' },
    { label: 'Messages', href: '/dashboard/messages', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
  ];

  const adminLinks = [
    { label: 'Users & Roles', href: '/dashboard/admin', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { label: 'CMS Manager', href: '/dashboard/cms', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
  ];

  return (
    <aside className="w-64 bg-[#0a0a0c] border-r border-white/10 flex flex-col justify-between hidden md:flex shrink-0 min-h-screen">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-500 to-pink-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <span className="text-white font-black text-xs">PS</span>
          </div>
          <span className="text-sm font-bold uppercase tracking-wider text-white">Dashboard</span>
        </div>

        <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3 px-3">
          Workspace
        </div>
        <nav className="space-y-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-violet-600/15 text-violet-300 border border-violet-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={link.icon} />
                </svg>
                {link.label}
              </Link>
            );
          })}
        </nav>

        {isAdmin && (
          <div className="mt-8">
            <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3 px-3">
              Administration
            </div>
            <nav className="space-y-1">
              {adminLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-pink-600/15 text-pink-300 border border-pink-500/30'
                        : 'text-gray-400 hover:text-pink-300 hover:bg-pink-500/5'
                    }`}
                  >
                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={link.icon} />
                    </svg>
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      {/* User Retention Profile Block & Exit */}
      <div className="p-4 border-t border-white/10 space-y-3 bg-white/[0.02]">
        {user && (
          <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-pink-500 flex items-center justify-center text-xs font-bold text-white shadow-md">
                {getInitials(user.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{user.name}</p>
                <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between">
              <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Verified
              </span>
              <span className="text-[10px] uppercase font-bold text-gray-400">
                {user.role?.type || 'MEMBER'}
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between px-1">
          <Link
            href="/"
            className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Site Home
          </Link>

          <button
            onClick={logout}
            className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
            title="Log out"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}
