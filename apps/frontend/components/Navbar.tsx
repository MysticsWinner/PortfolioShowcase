"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();

  useEffect(() => {
    const rawUser = localStorage.getItem('user');
    if (rawUser) {
      setUser(JSON.parse(rawUser));
    }
  }, [pathname]);

  return (
    <nav className="w-full h-16 bg-black/50 backdrop-blur-md border-b border-white/10 flex items-center px-8 z-50 sticky top-0">
      <Link href="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-pink-400">
        Showcase
      </Link>
      <div className="ml-auto flex gap-6 text-sm font-medium text-gray-300 items-center">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <Link href="/about" className="hover:text-white transition-colors">About</Link>
        <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
        <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
        <a 
          href="#"
          onClick={(e) => {
            e.preventDefault();
            if (!user) {
              alert("You must be logged in to view your dynamic resume.");
              window.location.href = '/auth/login';
            } else {
              window.open(`/api/resume?name=${encodeURIComponent(user.name)}&email=${encodeURIComponent(user.email)}`, '_blank');
            }
          }}
          className="text-violet-400 font-semibold hover:text-violet-300 transition-colors"
        >
          Resume
        </a>
        
        {user && (
          <>
            <div className="w-px h-4 bg-white/20 mx-2" />
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <Link href="/dashboard/portfolios" className="hover:text-white transition-colors">Portfolios</Link>
            {user.role?.type === 'ADMIN' && (
              <>
                <Link href="/dashboard/admin" className="text-pink-400 font-bold hover:text-pink-300 transition-colors">
                  Admin Panel
                </Link>
                <Link href="/dashboard/cms" className="text-cyan-400 font-bold hover:text-cyan-300 transition-colors">
                  CMS
                </Link>
              </>
            )}
          </>
        )}
        
        {!user && (
          <>
            <div className="w-px h-4 bg-white/20 mx-2" />
            <Link href="/auth/login" className="hover:text-white transition-colors">Login</Link>
          </>
        )}
      </div>
    </nav>
  );
}
