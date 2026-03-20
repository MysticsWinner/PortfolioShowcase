import React from 'react';
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="w-full h-16 bg-black/50 backdrop-blur-md border-b border-white/10 flex items-center px-8 z-50 sticky top-0">
      <Link href="/dashboard" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-pink-400">
        Showcase
      </Link>
      <div className="ml-auto flex gap-6 text-sm font-medium text-gray-300">
        <Link href="/dashboard/portfolios" className="hover:text-white transition-colors">Portfolios</Link>
        <Link href="/dashboard/projects" className="hover:text-white transition-colors">Projects</Link>
      </div>
    </nav>
  );
}
