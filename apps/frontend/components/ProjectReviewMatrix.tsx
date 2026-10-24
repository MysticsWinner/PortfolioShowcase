'use client';

import React, { useState } from 'react';
import { CandidateProject } from '../utils/resumeParser';
import { Check, Trash2, Globe, Github, Sparkles, Plus, AlertCircle, ShieldCheck, Eye, EyeOff } from 'lucide-react';

interface ProjectReviewMatrixProps {
  candidates: CandidateProject[];
  detectedSkills: string[];
  candidateEmail?: string;
  onCommit: (approvedProjects: CandidateProject[]) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

export default function ProjectReviewMatrix({
  candidates: initialCandidates,
  detectedSkills,
  candidateEmail,
  onCommit,
  onCancel,
  isSaving,
}: ProjectReviewMatrixProps) {
  const [candidates, setCandidates] = useState<CandidateProject[]>(initialCandidates);
  const [newTechInputs, setNewTechInputs] = useState<Record<string, string>>({});

  const updateCandidate = (id: string, updates: Partial<CandidateProject>) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const removeCandidate = (id: string) => {
    setCandidates((prev) => prev.filter((c) => c.id !== id));
  };

  const toggleSelectAll = (selectAll: boolean) => {
    setCandidates((prev) => prev.map((c) => ({ ...c, selected: selectAll })));
  };

  const addTechTag = (id: string) => {
    const raw = (newTechInputs[id] || '').trim();
    if (!raw) return;
    const project = candidates.find((c) => c.id === id);
    if (project && !project.technologies.includes(raw)) {
      updateCandidate(id, {
        technologies: [...project.technologies, raw],
      });
    }
    setNewTechInputs((prev) => ({ ...prev, [id]: '' }));
  };

  const removeTechTag = (id: string, tagToRemove: string) => {
    const project = candidates.find((c) => c.id === id);
    if (project) {
      updateCandidate(id, {
        technologies: project.technologies.filter((t) => t !== tagToRemove),
      });
    }
  };

  const addNewCustomProject = () => {
    const newProj: CandidateProject = {
      id: 'proj_' + Math.random().toString(36).substring(2, 9),
      title: 'New Showcase Project',
      description: 'Describe key problem, architecture, and impact.',
      content: '### Overview\nProject overview and technical highlights.',
      technologies: detectedSkills.slice(0, 3),
      confidence: 100,
      selected: true,
      status: 'DRAFT', // Default DRAFT per user requirement
      visibility: 'PRIVATE',
    };
    setCandidates((prev) => [newProj, ...prev]);
  };

  const selectedCount = candidates.filter((c) => c.selected).length;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const approved = candidates.filter((c) => c.selected);
    if (approved.length === 0) return;
    await onCommit(approved);
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      {/* Top Banner: Verification Notice & Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h3 className="font-semibold text-slate-100 text-base">
              Extracted {candidates.length} Project{candidates.length !== 1 ? 's' : ''} for Review
            </h3>
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Zero Server Compute
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Verify titles, stack, repository links, and deployment status.
            <strong className="text-slate-300 ml-1">
              Projects default to DRAFT and require your explicit toggle to publish.
            </strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={addNewCustomProject}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-400" />
            Add Project
          </button>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <button
              type="button"
              onClick={() => toggleSelectAll(true)}
              className="text-indigo-400 hover:underline px-1"
            >
              Select All
            </button>
            <span>/</span>
            <button
              type="button"
              onClick={() => toggleSelectAll(false)}
              className="text-slate-400 hover:underline px-1"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Detected Profile Context Pill bar */}
      {detectedSkills.length > 0 && (
        <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800/80">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Detected Resume Skills ({detectedSkills.length}):</span>
            {candidateEmail && (
              <span className="text-slate-500 ml-auto">Candidate: {candidateEmail}</span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {detectedSkills.slice(0, 15).map((skill) => (
              <span
                key={skill}
                className="px-2 py-0.5 text-[11px] font-medium rounded bg-slate-800/80 text-slate-300 border border-slate-700/60"
              >
                {skill}
              </span>
            ))}
            {detectedSkills.length > 15 && (
              <span className="text-[11px] text-slate-500 self-center">
                +{detectedSkills.length - 15} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Project Candidates Matrix */}
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
        {candidates.map((proj, idx) => (
          <div
            key={proj.id}
            className={`p-5 rounded-xl border transition-all duration-200 ${
              proj.selected
                ? 'bg-slate-900/90 border-slate-700/80 shadow-md shadow-black/20'
                : 'bg-slate-950/40 border-slate-800/40 opacity-60'
            }`}
          >
            {/* Header: Select Checkbox, Title Input, Confidence, and Publish Toggle */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
                <label className="flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={proj.selected}
                    onChange={(e) => updateCandidate(proj.id, { selected: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-700 focus:ring-indigo-500 focus:ring-offset-slate-900"
                  />
                </label>

                <div className="flex-1">
                  <input
                    type="text"
                    value={proj.title}
                    onChange={(e) => updateCandidate(proj.id, { title: e.target.value })}
                    placeholder="Project Title"
                    className="w-full text-base font-semibold bg-transparent border-b border-transparent hover:border-slate-700 focus:border-indigo-500 focus:outline-none text-slate-100 px-1 py-0.5 rounded transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2.5 self-end sm:self-auto">
                {/* Confidence Pill */}
                <span
                  className={`text-[11px] px-2 py-0.5 rounded font-medium border ${
                    proj.confidence >= 80
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : proj.confidence >= 60
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                  title="Parsing detection confidence based on URLs and tech structure"
                >
                  {proj.confidence}% match
                </span>

                {/* Explicit Publish Status Toggle (Mandatory approval to publish) */}
                <button
                  type="button"
                  onClick={() =>
                    updateCandidate(proj.id, {
                      status: proj.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED',
                      visibility: proj.status === 'PUBLISHED' ? 'PRIVATE' : 'PUBLIC',
                    })
                  }
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
                    proj.status === 'PUBLISHED'
                      ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-600/30'
                      : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                  }`}
                  title="User approval required to publish public showcases"
                >
                  {proj.status === 'PUBLISHED' ? (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Approved: PUBLISHED</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Approval Req: DRAFT</span>
                    </>
                  )}
                </button>

                {/* Remove Candidate */}
                <button
                  type="button"
                  onClick={() => removeCandidate(proj.id)}
                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Discard this candidate"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Body: Description & Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Summary Description
                </label>
                <textarea
                  rows={2}
                  value={proj.description}
                  onChange={(e) => updateCandidate(proj.id, { description: e.target.value })}
                  placeholder="Summary overview of the project..."
                  className="w-full text-xs bg-slate-950/60 border border-slate-800 rounded-lg p-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                />
              </div>

              {/* Repository Link */}
              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 mb-1">
                  <Github className="w-3 h-3 text-slate-400" />
                  <span>GitHub Repository</span>
                </label>
                <input
                  type="url"
                  value={proj.repoUrl || ''}
                  onChange={(e) => updateCandidate(proj.id, { repoUrl: e.target.value })}
                  placeholder="https://github.com/username/project"
                  className="w-full text-xs bg-slate-950/60 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Live Demo Link */}
              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 mb-1">
                  <Globe className="w-3 h-3 text-emerald-400" />
                  <span>Live Deployment URL</span>
                </label>
                <input
                  type="url"
                  value={proj.liveUrl || ''}
                  onChange={(e) => updateCandidate(proj.id, { liveUrl: e.target.value })}
                  placeholder="https://project.vercel.app"
                  className="w-full text-xs bg-slate-950/60 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Tech Stack Pills & Tag Editor */}
              <div className="md:col-span-2">
                <label className="block text-[11px] font-medium text-slate-400 mb-1.5">
                  Technologies & Frameworks
                </label>
                <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-lg bg-slate-950/40 border border-slate-800/80">
                  {proj.technologies.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                    >
                      {t}
                      <button
                        type="button"
                        onClick={() => removeTechTag(proj.id, t)}
                        className="hover:text-red-400 text-slate-400 ml-0.5"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <div className="flex items-center gap-1 ml-1">
                    <input
                      type="text"
                      value={newTechInputs[proj.id] || ''}
                      onChange={(e) =>
                        setNewTechInputs((prev) => ({ ...prev, [proj.id]: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTechTag(proj.id);
                        }
                      }}
                      placeholder="+ Add tech..."
                      className="w-24 text-xs bg-transparent border-none focus:outline-none text-slate-300 placeholder-slate-600"
                    />
                    {(newTechInputs[proj.id] || '').trim().length > 0 && (
                      <button
                        type="button"
                        onClick={() => addTechTag(proj.id)}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                      >
                        Add
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
        <div className="text-xs text-slate-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-indigo-400 flex-shrink-0" />
          <span>
            {selectedCount} of {candidates.length} project{candidates.length !== 1 ? 's' : ''} selected.
            Review and adjust scores in each project showcase after saving.
          </span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="flex-1 sm:flex-none px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving || selectedCount === 0}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-lg shadow-indigo-600/25 transition-all"
          >
            {isSaving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Importing Projects...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Commit {selectedCount} Project{selectedCount !== 1 ? 's' : ''}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
