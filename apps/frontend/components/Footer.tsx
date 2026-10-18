import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full py-10 mt-20 bg-black/50 border-t border-white/10 text-xs text-gray-400">
      <div className="max-w-7xl mx-auto px-6 md:px-8 space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-violet-600 to-pink-500 flex items-center justify-center text-white font-bold text-xs">
              PS
            </div>
            <span className="font-semibold text-gray-300">Portfolio Showcase CMS</span>
            <span className="text-gray-600">|</span>
            <p>© 2026 Portfolio Showcase. All rights reserved.</p>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
            <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
            <a
              href="https://github.com/MysticsWinner/PortfolioShowcase"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-violet-400 hover:text-violet-300 font-medium transition-colors"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>GitHub</span>
            </a>
          </div>
        </div>

        {/* Live Hosting Architecture Map */}
        <div className="pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-[11px] text-gray-500 font-mono">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
              <span>Frontend: <strong>Vercel</strong></span>
            </span>
            <span className="text-gray-700">•</span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
              <span>Backend: <strong>Render</strong></span>
            </span>
            <span className="text-gray-700">•</span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>Database: <strong>Neon PostgreSQL</strong></span>
            </span>
          </div>

          <div className="text-gray-500">
            Failsafe: Auto-retry backoff on Render cold starts
          </div>
        </div>
      </div>
    </footer>
  );
}
