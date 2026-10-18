"use client";

import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useRouter } from 'next/navigation';
import { Search, Home, FileText, Mail, User, Shield, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // Toggle the menu when ⌘K is pressed
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] bg-black/60 backdrop-blur-sm px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="w-full max-w-xl bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl overflow-hidden font-sans"
          >
            <Command className="w-full">
              <div className="flex items-center border-b border-white/10 px-4">
                <Search className="w-5 h-5 text-gray-400 mr-2" />
                <Command.Input 
                  placeholder="Type a command or search..." 
                  className="w-full py-4 bg-transparent outline-none text-white text-base placeholder:text-gray-500"
                />
              </div>

              <Command.List className="max-h-[300px] overflow-y-auto p-2 scrollbar-hide">
                <Command.Empty className="py-6 text-center text-sm text-gray-500">
                  No results found matrix-wide.
                </Command.Empty>

                <Command.Group heading="Navigation" className="text-xs font-semibold text-gray-500 px-2 py-2">
                  <Command.Item onSelect={() => runCommand(() => router.push('/'))} className="flex items-center px-4 py-3 rounded-md text-sm text-gray-300 hover:bg-white/10 hover:text-white cursor-pointer transition-colors aria-selected:bg-white/10 aria-selected:text-white">
                    <Home className="w-4 h-4 mr-3 text-violet-400" /> Home
                  </Command.Item>
                  <Command.Item onSelect={() => runCommand(() => router.push('/blog'))} className="flex items-center px-4 py-3 rounded-md text-sm text-gray-300 hover:bg-white/10 hover:text-white cursor-pointer transition-colors aria-selected:bg-white/10 aria-selected:text-white">
                    <Terminal className="w-4 h-4 mr-3 text-pink-400" /> Dev Log (Blog)
                  </Command.Item>
                  <Command.Item onSelect={() => runCommand(() => router.push('/contact'))} className="flex items-center px-4 py-3 rounded-md text-sm text-gray-300 hover:bg-white/10 hover:text-white cursor-pointer transition-colors aria-selected:bg-white/10 aria-selected:text-white">
                    <Mail className="w-4 h-4 mr-3 text-emerald-400" /> Contact Intel
                  </Command.Item>
                </Command.Group>

                <Command.Group heading="Documents" className="text-xs font-semibold text-gray-500 px-2 py-2 border-t border-white/5 mt-2">
                  <Command.Item onSelect={() => runCommand(() => window.open('/api/resume', '_blank'))} className="flex items-center px-4 py-3 rounded-md text-sm text-gray-300 hover:bg-white/10 hover:text-white cursor-pointer transition-colors aria-selected:bg-white/10 aria-selected:text-white">
                    <FileText className="w-4 h-4 mr-3 text-blue-400" /> Download PDF Resume
                  </Command.Item>
                </Command.Group>

                <Command.Group heading="System" className="text-xs font-semibold text-gray-500 px-2 py-2 border-t border-white/5 mt-2">
                  <Command.Item onSelect={() => runCommand(() => window.open('https://github.com/MysticsWinner/PortfolioShowcase', '_blank'))} className="flex items-center px-4 py-3 rounded-md text-sm text-gray-300 hover:bg-white/10 hover:text-white cursor-pointer transition-colors aria-selected:bg-white/10 aria-selected:text-white">
                    <Terminal className="w-4 h-4 mr-3 text-violet-400" /> View Source on GitHub (MysticsWinner/PortfolioShowcase)
                  </Command.Item>
                  <Command.Item onSelect={() => runCommand(() => router.push('/dashboard/admin'))} className="flex items-center px-4 py-3 rounded-md text-sm text-gray-300 hover:bg-white/10 hover:text-white cursor-pointer transition-colors aria-selected:bg-white/10 aria-selected:text-white">
                    <Shield className="w-4 h-4 mr-3 text-red-400" /> Admin Dashboard
                  </Command.Item>
                  <Command.Item onSelect={() => runCommand(() => router.push('/auth/login'))} className="flex items-center px-4 py-3 rounded-md text-sm text-gray-300 hover:bg-white/10 hover:text-white cursor-pointer transition-colors aria-selected:bg-white/10 aria-selected:text-white">
                    <User className="w-4 h-4 mr-3 text-gray-400" /> Identity verification (Login)
                  </Command.Item>
                </Command.Group>
              </Command.List>
            </Command>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
