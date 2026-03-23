"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

const HeroCanvas = dynamic(() => import('../components/HeroCanvas'), {
  ssr: false,
});

export default function LandingPage() {
  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center text-center p-6 relative overflow-hidden">
      {/* Background glowing orbs & 3D WebGL Canvas */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] -z-10" />
      <HeroCanvas />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl space-y-8"
      >
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-300 to-gray-500">
          Showcase Your Best Work.
          <br className="hidden md:block"/> Securely.
        </h1>
        
        <p className="text-lg md:text-xl text-gray-400 font-light max-w-2xl mx-auto">
          Upload, manage, and securely encrypt your portfolios in the database. 
          Provide proof of work by sharing beautiful presentations of your projects safely.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
          <Link href="/auth/register" className="w-full sm:w-auto px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors">
            Get Started
          </Link>
          <Link href="/auth/login" className="w-full sm:w-auto px-8 py-3 bg-white/10 text-white font-medium rounded-full border border-white/10 hover:bg-white/20 transition-colors">
            Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
