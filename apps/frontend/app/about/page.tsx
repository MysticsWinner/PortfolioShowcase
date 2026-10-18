"use client";

import React from 'react';
import { motion } from 'framer-motion';

export default function AboutPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const stack = [
    { name: "Next.js 14 App Router", role: "Frontend UI Framework" },
    { name: "NestJS", role: "Backend API Engine" },
    { name: "PostgreSQL", role: "Relational Database" },
    { name: "Prisma ORM", role: "Database Abstraction" },
    { name: "Tailwind CSS", role: "Utility Styling" },
    { name: "Framer Motion", role: "Animation Library" },
    { name: "AES-256 CBC", role: "Cryptographic Data Encryption" },
    { name: "Passport JWT", role: "Stateless Session Management" },
  ];

  return (
    <div className="min-h-[85vh] p-8 md:p-16 relative overflow-hidden">
      {/* Aesthetic Orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-4xl mx-auto space-y-16"
      >
        <motion.div variants={itemVariants} className="text-center space-y-4">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
            About Showcase
          </h1>
          <p className="text-xl text-gray-400 font-light max-w-2xl mx-auto">
            A bleeding-edge portfolio and project management platform built from the ground up prioritizing unapologetic security and aesthetic excellence.
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl">
          <h2 className="text-2xl font-bold text-white mb-4">The Architecture</h2>
          <p className="text-gray-300 font-light leading-relaxed mb-8">
            This platform operates in a strictly decoupled architecture. The Next.js frontend delivers a hyper-responsive fluid interface, securely bridging HTTP traffic via Axios interceptors directly into the robust NestJS backend. Protected at-rest utilizing AES-256 cryptographic protocols, your sensitive operational portfolios are natively invisible to unauthorized actors.
          </p>
          
          <h3 className="text-lg font-semibold text-gray-200 mb-6 uppercase tracking-widest text-sm">Technology Stack</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stack.map((tech, i) => (
              <div key={i} className="flex flex-col p-4 bg-black/40 border border-white/5 rounded-2xl hover:border-violet-500/50 transition-colors">
                <span className="text-white font-medium">{tech.name}</span>
                <span className="text-gray-500 text-sm">{tech.role}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="text-center pb-12">
          <h3 className="text-2xl font-bold text-white mb-4">Where to find us</h3>
          <p className="text-gray-400 font-light mb-8 max-w-xl mx-auto">
            This project is open-source and internally distributed. You can find the complete implementation details, codebase architecture, and deployment instructions hosted directly on GitHub.
          </p>
          <div className="flex gap-4 justify-center">
            <a href="https://github.com/MysticsWinner/PortfolioShowcase" target="_blank" rel="noopener noreferrer" className="inline-block px-8 py-3 bg-white/10 border border-white/20 text-white font-bold rounded-full hover:bg-white/20 transition-colors">
              View Repository
            </a>
            <a href="/auth/register" className="inline-block px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors shadow-[0_0_30px_rgba(255,255,255,0.2)]">
              Create an Account
            </a>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
