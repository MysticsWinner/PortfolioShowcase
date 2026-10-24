"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { projectsApi, Project } from '../../../utils/api';
import { useAuth } from '../../../components/AuthProvider';
import ResumeImportModal from '../../../components/ResumeImportModal';

export default function ProjectsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');
  const [visibilityFilter, setVisibilityFilter] = useState<'ALL' | 'PUBLIC' | 'PRIVATE'>('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Resume Scanner Modal State
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);


  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('PUBLISHED');
  const [visibility, setVisibility] = useState<'PUBLIC' | 'PRIVATE'>('PUBLIC');

  // Fetch projects
  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const data = await projectsApi.getMyProjects();
      setProjects(data);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const openCreateModal = () => {
    setEditingProject(null);
    setTitle('');
    setDescription('');
    setContent('');
    setRepoUrl('');
    setLiveUrl('');
    setStatus('PUBLISHED');
    setVisibility('PUBLIC');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (proj: Project) => {
    setEditingProject(proj);
    setTitle(proj.title);
    setDescription(proj.description || '');
    setContent(proj.content || '');
    setRepoUrl(proj.repoUrl || '');
    setLiveUrl(proj.liveUrl || '');
    setStatus(proj.status);
    setVisibility(proj.visibility);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Project title is strictly required.');
      return;
    }
    if (!description.trim()) {
      setFormError('Please provide a brief description.');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);

      const payload = {
        title: title.trim(),
        description: description.trim(),
        content: content.trim() || null,
        repoUrl: repoUrl.trim() || null,
        liveUrl: liveUrl.trim() || null,
        status,
        visibility,
      };

      if (editingProject) {
        await projectsApi.updateProject(editingProject.id, payload);
      } else {
        await projectsApi.createProject(payload);
      }

      setIsModalOpen(false);
      await fetchProjects();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to save project record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, projTitle: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${projTitle}"?`)) {
      return;
    }

    try {
      await projectsApi.deleteProject(id);
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert('Failed to delete project. Please verify permissions.');
    }
  };

  // Filtered List
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesSearch = 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.repoUrl?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
      const matchesVisibility = visibilityFilter === 'ALL' || p.visibility === visibilityFilter;

      return matchesSearch && matchesStatus && matchesVisibility;
    });
  }, [projects, searchQuery, statusFilter, visibilityFilter]);

  const metrics = useMemo(() => {
    const total = projects.length;
    const published = projects.filter(p => p.status === 'PUBLISHED').length;
    const drafts = projects.filter(p => p.status === 'DRAFT').length;
    const publicCount = projects.filter(p => p.visibility === 'PUBLIC').length;
    return { total, published, drafts, publicCount };
  }, [projects]);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 min-h-screen text-gray-100">
      {/* Notification Toast */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs flex items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white"
          >
            ×
          </button>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-violet-400 mb-2">
            <span>Dashboard</span>
            <span>/</span>
            <span className="text-gray-400">Showcase Projects</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-indigo-300 to-pink-400">
            Showcase Projects
          </h1>
          <p className="text-sm text-gray-400 mt-2 max-w-2xl">
            Architect, manage, and feature your software systems, open-source repositories, and production apps in the live showcase matrix.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto shrink-0 flex-wrap">
          <button
            onClick={() => setIsResumeModalOpen(true)}
            id="btn-import-resume"
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-indigo-500/30 hover:border-indigo-500/60 font-semibold text-sm shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Import from Resume</span>
          </button>

          <button
            onClick={openCreateModal}
            id="btn-create-project"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white font-semibold text-sm shadow-lg shadow-violet-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            <span>Create Project</span>
          </button>
        </div>
      </div>


      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
          <p className="text-xs uppercase font-semibold text-gray-400">Total Projects</p>
          <p className="text-2xl font-black text-white mt-1">{metrics.total}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
          <p className="text-xs uppercase font-semibold text-emerald-400">Published</p>
          <p className="text-2xl font-black text-emerald-300 mt-1">{metrics.published}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
          <p className="text-xs uppercase font-semibold text-amber-400">Drafts</p>
          <p className="text-2xl font-black text-amber-300 mt-1">{metrics.drafts}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
          <p className="text-xs uppercase font-semibold text-cyan-400">Public Live</p>
          <p className="text-2xl font-black text-cyan-300 mt-1">{metrics.publicCount}</p>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
        {/* Search */}
        <div className="relative flex-1">
          <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by title, stack, or URL..."
            className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Segment */}
          <div className="flex rounded-xl bg-black/50 p-1 border border-white/10 text-xs">
            {(['ALL', 'PUBLISHED', 'DRAFT'] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  statusFilter === s ? 'bg-violet-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                }`}
              >
                {s === 'ALL' ? 'All Status' : s}
              </button>
            ))}
          </div>

          {/* Visibility Segment */}
          <div className="flex rounded-xl bg-black/50 p-1 border border-white/10 text-xs">
            {(['ALL', 'PUBLIC', 'PRIVATE'] as const).map(v => (
              <button
                key={v}
                onClick={() => setVisibilityFilter(v)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  visibilityFilter === v ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                }`}
              >
                {v === 'ALL' ? 'All Visibility' : v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading project architecture...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center p-8 rounded-3xl bg-white/[0.02] border border-dashed border-white/10">
          <div className="w-16 h-16 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-white">No projects found</h3>
          <p className="text-xs text-gray-400 mt-1 max-w-sm">
            {searchQuery || statusFilter !== 'ALL' || visibilityFilter !== 'ALL'
              ? 'No projects match your active search and filter constraints.'
              : 'You have not added any showcase projects yet. Create your first project to share your work.'}
          </p>
          <button
            onClick={openCreateModal}
            className="mt-5 px-4 py-2 rounded-xl bg-violet-600/30 hover:bg-violet-600/50 border border-violet-500/30 text-violet-300 text-xs font-semibold transition-colors"
          >
            + Create First Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((proj) => (            <motion.div
              key={proj.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="group relative flex flex-col justify-between p-6 rounded-2xl bg-gradient-to-b from-white/[0.04] to-black/40 border border-white/10 hover:border-violet-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-violet-900/10"
            >
              {/* Card Header */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        proj.status === 'PUBLISHED'
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {proj.status}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        proj.visibility === 'PUBLIC'
                          ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                          : 'bg-violet-500/10 text-violet-300 border-violet-500/30'
                      }`}
                    >
                      {proj.visibility}
                    </span>

                    {/* Workability Score Pill */}
                    {proj.workabilityScore !== undefined && proj.workabilityScore !== null && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          proj.workabilityScore >= 80
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                            : proj.workabilityScore >= 55
                            ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                            : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                        }`}
                        title="Criteria-based Workability Score"
                      >
                        {proj.workabilityScore} pts
                      </span>
                    )}

                    {/* Live Health Pill */}
                    {proj.healthStatus && proj.healthStatus !== 'NO_LINK' && (
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          proj.healthStatus === 'ONLINE'
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/80'
                            : proj.healthStatus === 'DEGRADED'
                            ? 'bg-amber-950/80 text-amber-400 border border-amber-800/80'
                            : 'bg-rose-950/80 text-rose-400 border border-rose-800/80'
                        }`}
                      >
                        ● {proj.healthStatus}
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] text-gray-500">
                    {new Date(proj.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                <h3
                  onClick={() => router.push(`/dashboard/projects/${proj.id}`)}
                  className="text-lg font-bold text-white group-hover:text-violet-300 transition-colors line-clamp-1 cursor-pointer hover:underline"
                >
                  {proj.title}
                </h3>

                <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">
                  {proj.description || 'No description provided.'}
                </p>
              </div>

              {/* Card Footer & Links */}
              <div className="mt-6 pt-4 border-t border-white/5 space-y-4">
                {/* External links */}
                <div className="flex items-center gap-2 text-xs flex-wrap">
                  {proj.repoUrl && (
                    <a
                      href={proj.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/5 transition-colors flex items-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                      </svg>
                      Repository
                    </a>
                  )}
                  {proj.liveUrl && (
                    <a
                      href={proj.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-violet-600/10 hover:bg-violet-600/20 text-violet-300 border border-violet-500/20 transition-colors flex items-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Live Demo
                    </a>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between text-xs pt-1 flex-wrap gap-2">
                  <button
                    onClick={() => router.push(`/dashboard/projects/${proj.id}`)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition-all font-medium"
                  >
                    <span>Showcase & Rubric</span>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(proj)}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(proj.id, proj.title)}
                      className="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create / Edit Project Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-2xl bg-[#121216] border border-white/10 rounded-3xl shadow-2xl overflow-hidden p-6 md:p-8 space-y-6"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h2 className="text-xl font-bold text-white">
                  {editingProject ? 'Edit Showcase Project' : 'Create Showcase Project'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {formError && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Distributed Vector Search Engine"
                    className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                    Tagline / Brief Summary *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="High-performance search engine built with Rust, gRPC, and HNSW graphs..."
                    className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500/50 transition-colors"
                    >
                      <option value="PUBLISHED">PUBLISHED (Live)</option>
                      <option value="DRAFT">DRAFT (Hidden)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                      Visibility
                    </label>
                    <select
                      value={visibility}
                      onChange={(e) => setVisibility(e.target.value as any)}
                      className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500/50 transition-colors"
                    >
                      <option value="PUBLIC">PUBLIC (Everyone)</option>
                      <option value="PRIVATE">PRIVATE (Members Only)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                      Repository URL
                    </label>
                    <input
                      type="url"
                      value={repoUrl}
                      onChange={(e) => setRepoUrl(e.target.value)}
                      placeholder="https://github.com/..."
                      className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                      Live Demo URL
                    </label>
                    <input
                      type="url"
                      value={liveUrl}
                      onChange={(e) => setLiveUrl(e.target.value)}
                      placeholder="https://myproject.com"
                      className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                    Detailed Notes / Markdown Documentation
                  </label>
                  <textarea
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Describe the architecture, benchmarks, API specifications, and key engineering decisions..."
                    className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 transition-colors"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white font-semibold shadow-lg shadow-violet-600/30 transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : editingProject ? 'Update Project' : 'Publish Project'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Zero-Compute Client-Side Resume & Project Scanner Modal */}
      <ResumeImportModal
        isOpen={isResumeModalOpen}
        onClose={() => setIsResumeModalOpen(false)}
        onImportSuccess={(count) => {
          fetchProjects();
          setToastMessage(`Successfully extracted and imported ${count} project(s) to your profile as DRAFT!`);
        }}
      />
    </div>
  );
}
