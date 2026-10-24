'use client';

import React from 'react';
import {
  X,
  Cpu,
  AlertTriangle,
  PlusCircle,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface ResumeImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess?: (count: number) => void;
  onOpenManualCreate?: () => void;
}

export default function ResumeImportModal({
  isOpen,
  onClose,
  onOpenManualCreate,
}: ResumeImportModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                Resume & Project Scanner
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  Work in Progress
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Client-side on-device extraction pipeline
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body - Work In Progress Notice */}
        <div className="p-6 md:p-8 space-y-6">
          <div className="p-5 rounded-2xl bg-amber-500/[0.07] border border-amber-500/20 space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-amber-200">
                  On-Device Extraction Temporarily Paused
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  To eliminate browser hangs and optimize hardware performance on client devices, the in-browser PDF, markdown, and text extraction routines are currently disabled for refactoring.
                </p>
              </div>
            </div>
          </div>

          {/* Planned Optimization Overview */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              What We Are Upgrading
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <div className="flex items-center gap-2 text-indigo-400 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                  <span>Non-Blocking Workers</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-normal">
                  Migrating parser execution to background Web Workers with chunked micro-tasks to guarantee zero UI latency.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <div className="flex items-center gap-2 text-emerald-400 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Client Privacy First</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-normal">
                  Retaining full zero-server compute privacy while preventing memory pressure and thread saturation.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-400">
              You can still create and manage your projects manually:
            </p>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                Close
              </button>
              {onOpenManualCreate && (
                <button
                  type="button"
                  onClick={onOpenManualCreate}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-violet-600/20 transition-all hover:scale-[1.02]"
                >
                  <PlusCircle className="w-4 h-4" />
                  Create Project Manually
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
