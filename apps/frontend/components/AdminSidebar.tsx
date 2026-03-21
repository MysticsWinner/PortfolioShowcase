import React from 'react';
import Link from 'next/link';

export default function AdminSidebar() {
  return (
    <aside className="w-64 bg-black/40 border-r border-white/10 p-6 hidden md:block">
      <div className="text-sm text-gray-400 uppercase tracking-widest font-bold mb-6 mt-4">Dashboard</div>
      <nav className="space-y-4">
        <Link href="/dashboard" className="block text-gray-300 hover:text-white transition-colors">
          Overview
        </Link>
        <Link href="/dashboard/portfolios" className="block text-gray-300 hover:text-white transition-colors">
          Portfolios
        </Link>
        <Link href="/dashboard/projects" className="block text-gray-300 hover:text-white transition-colors">
          Projects
        </Link>
        <div className="pt-8 mt-8 border-t border-white/10">
          <Link href="/" className="block text-gray-500 hover:text-white transition-colors">
            Exit Dashboard
          </Link>
        </div>
      </nav>
    </aside>
  );
}
