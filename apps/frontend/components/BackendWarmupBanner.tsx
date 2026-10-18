"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { subscribeBackendStatus, BackendState, systemApi } from '../utils/api';

export default function BackendWarmupBanner() {
  const [state, setState] = useState<BackendState | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [pinging, setPinging] = useState(false);
  const [healthData, setHealthData] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = subscribeBackendStatus((newState) => {
      setState(newState);
      if (!newState.isColdStarting) {
        setElapsed(0);
      }
    });
    return () => unsubscribe();
  }, []);

  // Timer for active cold start
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (state?.isColdStarting) {
      timer = setInterval(() => {
        setElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [state?.isColdStarting]);

  const handlePing = async () => {
    setPinging(true);
    try {
      const data = await systemApi.getHealth();
      setHealthData(data);
    } catch {
      // Handled via state subscriber
    } finally {
      setPinging(false);
    }
  };

  const isWaking = state?.isColdStarting || state?.status === 'waking';

  return (
    <>
      {/* Floating Cold-Start & Health Indicator */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2 pointer-events-none">
        <AnimatePresence>
          {isWaking && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="pointer-events-auto max-w-sm p-4 rounded-2xl bg-[#121217]/95 border border-amber-500/30 shadow-[0_10px_35px_rgba(245,158,11,0.2)] backdrop-blur-2xl text-white text-xs font-sans space-y-2"
            >
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3 w-3 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                </span>
                <span className="font-bold text-amber-300 text-sm">
                  Render Backend Cold-Start
                </span>
                <span className="ml-auto text-[11px] font-mono text-amber-400/80 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  {elapsed}s elapsed
                </span>
              </div>

              <p className="text-gray-300 text-[11.5px] leading-relaxed">
                Backend on <strong>Render</strong> is spinning up from idle (~30-50s). Requests will automatically retry and complete.
              </p>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-gray-400">
                <span className="flex items-center gap-1">
                  <span className="text-violet-400 font-semibold">Vercel</span>
                  <span>➔</span>
                  <span className="text-pink-400 font-semibold">Render</span>
                </span>
                <button
                  onClick={() => setShowModal(true)}
                  className="text-amber-400 hover:text-amber-300 underline underline-offset-2"
                >
                  View Details
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Small Discreet System Status Pill */}
        <div className="pointer-events-auto">
          <button
            onClick={() => {
              setShowModal(true);
              handlePing();
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 border border-white/10 hover:border-violet-500/40 text-[11px] text-gray-300 hover:text-white transition-all backdrop-blur-xl shadow-lg"
            title="Inspect Frontend & Backend Hosting Environment"
          >
            <span className={`w-2 h-2 rounded-full ${isWaking ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
            <span className="font-medium">
              {isWaking ? 'Render Waking...' : 'Render • Vercel'}
            </span>
          </button>
        </div>
      </div>

      {/* Hosting Environment Diagnostics Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#141418] border border-white/15 rounded-3xl p-6 shadow-2xl text-white space-y-5"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-pink-500 flex items-center justify-center text-xs font-bold shadow-md">
                    PS
                  </div>
                  <div>
                    <h2 className="text-base font-bold">Hosting & Telemetry Inspector</h2>
                    <p className="text-xs text-gray-400">Live production infrastructure map</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center text-xs"
                >
                  ✕
                </button>
              </div>

              {/* Host Comparison Cards */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                {/* Frontend Host */}
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-violet-400 tracking-wider">Frontend Tier</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  <p className="font-bold text-sm text-white">Vercel</p>
                  <p className="text-[11px] text-gray-400">Edge Network / Next.js 14</p>
                  <div className="pt-2 text-[10px] text-gray-500 font-mono truncate">
                    Host: {state?.frontendHost}
                  </div>
                </div>

                {/* Backend Host */}
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-pink-400 tracking-wider">Backend Tier</span>
                    <span className={`w-2 h-2 rounded-full ${isWaking ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
                  </div>
                  <p className="font-bold text-sm text-white">Render</p>
                  <p className="text-[11px] text-gray-400">NestJS Web Service</p>
                  <div className="pt-2 text-[10px] text-gray-500 font-mono truncate">
                    {state?.backendUrl}
                  </div>
                </div>
              </div>

              {/* Live Health Status Metrics */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Backend Status:</span>
                  <span className={`font-semibold ${isWaking ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {isWaking ? `Waking up (${elapsed}s)...` : 'Operational (Healthy)'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Database Engine:</span>
                  <span className="font-semibold text-cyan-400">Neon PostgreSQL (Serverless)</span>
                </div>
                {state?.latencyMs !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Round-Trip Latency:</span>
                    <span className="font-mono text-gray-200">{state.latencyMs} ms</span>
                  </div>
                )}
                {healthData?.uptimeSeconds !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Container Uptime:</span>
                    <span className="font-mono text-gray-200">{healthData.uptimeSeconds}s</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handlePing}
                  disabled={pinging}
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {pinging ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Probing Render...</span>
                    </>
                  ) : (
                    <span>Ping Health Endpoint</span>
                  )}
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-gray-300 text-xs font-semibold transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
