'use client';

import React, { useState, useRef } from 'react';
import {
  extractTextFromFile,
  parseResumeText,
  CandidateProject,
  ParseResult,
} from '../utils/resumeParser';
import ProjectReviewMatrix from './ProjectReviewMatrix';
import { projectsApi } from '../utils/api';
import {
  X,
  UploadCloud,
  FileText,
  Clipboard,
  Cpu,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface ResumeImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (count: number) => void;
}

export default function ResumeImportModal({
  isOpen,
  onClose,
  onImportSuccess,
}: ResumeImportModalProps) {
  const [tab, setTab] = useState<'upload' | 'paste'>('upload');
  const [pastedText, setPastedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleProcessFile = async (file: File) => {
    setError(null);
    setIsProcessing(true);
    setProcessingStep('Reading document on your device (zero backend compute)...');

    try {
      const text = await extractTextFromFile(file);
      setProcessingStep('Analyzing structure, GitHub repositories, and tech stack...');
      
      // Allow render frame update for smooth UI
      await new Promise((r) => setTimeout(r, 200));

      const result = parseResumeText(text);
      if (result.projects.length === 0) {
        throw new Error(
          'Could not automatically detect distinct project headings. You can use the Direct Paste tab or manually add projects.'
        );
      }

      setParseResult(result);
    } catch (err: any) {
      console.error('Extraction error:', err);
      setError(err?.message || 'Failed to extract projects from the uploaded file.');
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  const handleProcessPastedText = () => {
    if (!pastedText.trim()) return;
    setError(null);
    setIsProcessing(true);
    setProcessingStep('Parsing pasted text on-device...');

    try {
      const result = parseResumeText(pastedText);
      if (result.projects.length === 0) {
        throw new Error('No project sections recognized. Please check your text format.');
      }
      setParseResult(result);
    } catch (err: any) {
      setError(err?.message || 'Failed to parse text.');
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleCommitProjects = async (approved: CandidateProject[]) => {
    setIsSaving(true);
    setError(null);
    try {
      const payload = approved.map((p) => ({
        title: p.title,
        description: p.description,
        content: p.content,
        repoUrl: p.repoUrl || null,
        liveUrl: p.liveUrl || null,
        technologies: p.technologies,
        status: p.status, // Enforces user selection / DRAFT
        visibility: p.visibility,
      }));

      const res = await projectsApi.bulkCreate(payload);
      onImportSuccess(res.count);
      onClose();
    } catch (err: any) {
      console.error('Failed to commit projects:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to save imported projects.');
    } finally {
      setIsSaving(false);
    }
  };

  const resetParser = () => {
    setParseResult(null);
    setError(null);
    setPastedText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                Resume & Project Scanner
                <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  On-Device Zero-Compute
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Extract projects and tech stack with immediate verification before saving to your profile.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">{error}</p>
                <p className="text-slate-400 mt-0.5">
                  Try uploading a standard PDF or paste your project section text directly into the Direct Paste tab.
                </p>
              </div>
            </div>
          )}

          {/* Review Matrix View (When parsed) */}
          {parseResult ? (
            <ProjectReviewMatrix
              candidates={parseResult.projects}
              detectedSkills={parseResult.detectedSkills}
              candidateEmail={parseResult.candidateEmail}
              onCommit={handleCommitProjects}
              onCancel={resetParser}
              isSaving={isSaving}
            />
          ) : (
            /* Upload & Extraction View */
            <div className="space-y-6">
              {/* Tab Selector */}
              <div className="flex gap-2 p-1 bg-slate-950/60 rounded-xl border border-slate-800/80 w-fit">
                <button
                  type="button"
                  onClick={() => setTab('upload')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    tab === 'upload'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <UploadCloud className="w-4 h-4" />
                  Upload Document (PDF / MD / TXT)
                </button>
                <button
                  type="button"
                  onClick={() => setTab('paste')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    tab === 'paste'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Clipboard className="w-4 h-4" />
                  Direct Paste Text
                </button>
              </div>

              {isProcessing ? (
                /* Processing Animated State */
                <div className="py-16 text-center space-y-4">
                  <div className="relative inline-flex items-center justify-center">
                    <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                    <Sparkles className="w-6 h-6 text-indigo-400 absolute" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-slate-200">Processing on Device</h3>
                    <p className="text-xs text-indigo-400 font-medium animate-pulse">
                      {processingStep}
                    </p>
                  </div>
                </div>
              ) : tab === 'upload' ? (
                /* Upload Drag & Drop Area */
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-700/80 hover:border-indigo-500/60 bg-slate-950/40 hover:bg-slate-950/80 rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.txt,.md"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleProcessFile(e.target.files[0]);
                      }
                    }}
                  />
                  <div className="w-12 h-12 rounded-xl bg-slate-800/80 group-hover:bg-indigo-600/20 border border-slate-700 group-hover:border-indigo-500/30 flex items-center justify-center mx-auto mb-3 text-slate-400 group-hover:text-indigo-400 transition-colors">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-medium text-slate-200 group-hover:text-indigo-300 transition-colors">
                    Drop your resume here, or <span className="text-indigo-400 underline">browse</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Supported: PDF (standard digital format), Markdown (.md), or Plain Text (.txt)
                  </p>

                  <div className="mt-6 inline-flex items-center gap-4 text-[11px] text-slate-400 bg-slate-900/80 px-4 py-2 rounded-lg border border-slate-800">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 100% Client-Side Privacy
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Preserves Free-Tier RAM
                    </span>
                  </div>
                </div>
              ) : (
                /* Direct Text Paste Area */
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300">
                      Paste Resume or Projects Section
                    </label>
                    <textarea
                      rows={10}
                      value={pastedText}
                      onChange={(e) => setPastedText(e.target.value)}
                      placeholder={`Paste project text or markdown here, for example:\n\nDistributed Task Queue\nTech: Go, Redis, Docker, RabbitMQ\nLive: https://queue-demo.com\nRepo: https://github.com/developer/task-queue\n• Built high-throughput task processor with zero message loss\n• Reduced task execution latency by 45%`}
                      className="w-full text-xs font-mono bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleProcessPastedText}
                      disabled={!pastedText.trim()}
                      className="flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white transition-all shadow-md shadow-indigo-600/25"
                    >
                      <Sparkles className="w-4 h-4" />
                      Scan & Extract Projects
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
