'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { projectsApi, Project, RubricCriteria } from '../../../../utils/api';
import {
  ArrowLeft,
  ExternalLink,
  Github,
  Activity,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  RotateCw,
  Edit3,
  Globe,
  Code2,
  FileText,
  Shield,
  Layers,
  Sparkles,
  Eye,
  EyeOff,
} from 'lucide-react';

interface RubricConfig {
  [key: string]: number;
  liveUrl: number;
  repoUrl: number;
  technologies: number;
  content: number;
  ownership: number;
}

const DEFAULT_RUBRIC: RubricConfig = {
  liveUrl: 30,
  repoUrl: 25,
  technologies: 20,
  content: 15,
  ownership: 10,
};

export default function ProjectShowcasePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingHealth, setCheckingHealth] = useState(false);
  const [savingRubric, setSavingRubric] = useState(false);
  const [showRubricEditor, setShowRubricEditor] = useState(false);
  const [rubric, setRubric] = useState<RubricConfig>(DEFAULT_RUBRIC);
  const [rubricBreakdown, setRubricBreakdown] = useState<Record<string, RubricCriteria>>({});
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    try {
      setLoading(true);
      const data = await projectsApi.getProject(projectId);
      setProject(data);
      if (data.rubric) {
        setRubric({ ...DEFAULT_RUBRIC, ...data.rubric });
      }
      if (data.breakdown) {
        setRubricBreakdown(data.breakdown);
      }
    } catch (err) {
      console.error('Failed to load project showcase:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleHealthCheck = async () => {
    if (!project) return;
    setCheckingHealth(true);
    try {
      const res = await projectsApi.checkHealth(project.id);
      setProject(res.project);
      if (res.breakdown) setRubricBreakdown(res.breakdown);
      setNotification({
        type: 'success',
        message: `Health check complete: Status is ${res.healthStatus}. Workability score updated to ${res.score}/100.`,
      });
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err?.response?.data?.message || 'Failed to complete health check ping.',
      });
    } finally {
      setCheckingHealth(false);
    }
  };

  const handleSaveRubric = async () => {
    if (!project) return;
    setSavingRubric(true);
    try {
      const res = await projectsApi.updateRubric(project.id, rubric);
      setProject(res.project);
      if (res.breakdown) setRubricBreakdown(res.breakdown);
      setShowRubricEditor(false);
      setNotification({
        type: 'success',
        message: `Custom rubric applied! Recalculated workability score is ${res.score}/100.`,
      });
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err?.response?.data?.message || 'Failed to update rubric config.',
      });
    } finally {
      setSavingRubric(false);
    }
  };

  const handleTogglePublish = async () => {
    if (!project) return;
    try {
      const nextStatus = project.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
      const nextVisibility = nextStatus === 'PUBLISHED' ? 'PUBLIC' : 'PRIVATE';
      const updated = await projectsApi.updateProject(project.id, {
        status: nextStatus,
        visibility: nextVisibility,
      });
      setProject(updated);
      setNotification({
        type: 'success',
        message: `Project status updated to ${nextStatus}.`,
      });
    } catch (err) {
      setNotification({
        type: 'error',
        message: 'Failed to update project status.',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="space-y-3 text-center">
          <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Loading project showcase & rubric analysis...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-100">Project Not Found</h2>
        <p className="text-sm text-slate-400">The requested project showcase does not exist or was deleted.</p>
        <button
          onClick={() => router.push('/dashboard/projects')}
          className="px-4 py-2 text-xs font-medium rounded-lg bg-indigo-600 text-white"
        >
          Back to Projects
        </button>
      </div>
    );
  }

  const technologiesList = Array.isArray(project.technologies)
    ? project.technologies.map((t: any) => t.technology?.name || t.name || t)
    : [];

  const score = project.workabilityScore ?? 0;
  const scoreColor =
    score >= 80 ? 'text-emerald-400' : score >= 55 ? 'text-amber-400' : 'text-rose-400';
  const scoreRing =
    score >= 80 ? 'border-emerald-500' : score >= 55 ? 'border-amber-500' : 'border-rose-500';

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Back Button & Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <button
          onClick={() => router.push('/dashboard/projects')}
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Projects</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Approval to Publish Toggle */}
          <button
            onClick={handleTogglePublish}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
              project.status === 'PUBLISHED'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
            }`}
          >
            {project.status === 'PUBLISHED' ? (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>Status: PUBLISHED</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span>Status: DRAFT (Unpublished)</span>
              </>
            )}
          </button>

          {/* Quick Health Ping */}
          <button
            onClick={handleHealthCheck}
            disabled={checkingHealth || !project.liveUrl}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors disabled:opacity-50"
            title={project.liveUrl ? 'Ping live deployment' : 'Add a live URL to enable health checks'}
          >
            <RotateCw className={`w-3.5 h-3.5 text-indigo-400 ${checkingHealth ? 'animate-spin' : ''}`} />
            <span>{checkingHealth ? 'Checking...' : 'Ping Live Status'}</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 ${
            notification.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          <span>{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-white"
          >
            ×
          </button>
        </div>
      )}

      {/* Hero Showcase Header */}
      <div className="relative p-8 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-indigo-950/40 border border-slate-800 shadow-xl overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Showcase & Workability
              </span>
              <span
                className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
                  project.status === 'PUBLISHED'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}
              >
                {project.status}
              </span>
              <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                {project.visibility}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              {project.title}
            </h1>

            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              {project.description}
            </p>

            {/* Links Bar */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Launch Live App</span>
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>
              )}

              {project.repoUrl && (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>Source Code</span>
                </a>
              )}
            </div>
          </div>

          {/* Quick Health & Live Indicator Card */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 min-w-[200px] space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-indigo-400" />
                Live Health
              </span>
              <span
                className={`font-semibold ${
                  project.healthStatus === 'ONLINE'
                    ? 'text-emerald-400'
                    : project.healthStatus === 'DEGRADED'
                    ? 'text-amber-400'
                    : project.healthStatus === 'OFFLINE'
                    ? 'text-rose-400'
                    : 'text-slate-500'
                }`}
              >
                {project.healthStatus || 'NO_LINK'}
              </span>
            </div>

            <div className="text-[11px] text-slate-500">
              {project.lastHealthCheck
                ? `Last checked ${new Date(project.lastHealthCheck).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : 'No ping conducted yet'}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CRITICAL REQUIREMENT: SHOW HOW THEY ARE GRADED FIRST, THEN SHOW SCORES   */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Transparent Evaluation Rubric
              </span>
              <h2 className="text-lg font-bold text-slate-100">
                1. How This Project Is Graded
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Review the objective criteria and maximum point weights before reviewing the calculated scores. You can customize the rubric weights below.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowRubricEditor(!showRubricEditor)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{showRubricEditor ? 'Hide Customizer' : 'Customize Rubric Weights'}</span>
          </button>
        </div>

        {/* Optional Interactive Rubric Customizer Panel */}
        {showRubricEditor && (
          <div className="p-5 rounded-xl bg-slate-900 border border-indigo-500/30 shadow-lg space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">
                  Custom Rubric Weight Configuration
                </h3>
                <p className="text-xs text-slate-400">
                  Adjust points assigned to each dimension to align with your personal portfolio standards.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRubric(DEFAULT_RUBRIC)}
                className="text-xs text-indigo-400 hover:underline"
              >
                Reset to Default
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Live URL Health
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={rubric.liveUrl}
                  onChange={(e) => setRubric({ ...rubric, liveUrl: Number(e.target.value) || 0 })}
                  className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100"
                />
                <span className="text-[10px] text-slate-500">Max points for responsive deployment</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Repo Link
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={rubric.repoUrl}
                  onChange={(e) => setRubric({ ...rubric, repoUrl: Number(e.target.value) || 0 })}
                  className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100"
                />
                <span className="text-[10px] text-slate-500">Max points for public source repository</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Tech Breadth
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={rubric.technologies}
                  onChange={(e) => setRubric({ ...rubric, technologies: Number(e.target.value) || 0 })}
                  className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100"
                />
                <span className="text-[10px] text-slate-500">Points for complete stack declaration</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Documentation
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={rubric.content}
                  onChange={(e) => setRubric({ ...rubric, content: Number(e.target.value) || 0 })}
                  className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100"
                />
                <span className="text-[10px] text-slate-500">Points for detailed markdown deep-dive</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Overview & Title
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={rubric.ownership}
                  onChange={(e) => setRubric({ ...rubric, ownership: Number(e.target.value) || 0 })}
                  className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100"
                />
                <span className="text-[10px] text-slate-500">Points for title & description clarity</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowRubricEditor(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveRubric}
                disabled={savingRubric}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/25"
              >
                {savingRubric ? 'Calculating...' : 'Save & Recalculate Score'}
              </button>
            </div>
          </div>
        )}

        {/* Transparent Rubric Criteria Cards (Criteria First) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Criterion 1: Live Deployment */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-semibold text-slate-200">Live Deployment & Health</h4>
              </div>
              <span className="text-xs font-bold text-slate-300">{rubric.liveUrl} pts max</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Assesses whether your application is deployed to production and actively serving HTTP 200/300 responses.
            </p>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Current Judgment:</span>
              <span className="font-medium text-slate-300">
                {rubricBreakdown.liveUrl?.details || 'Evaluation pending'}
              </span>
            </div>
          </div>

          {/* Criterion 2: Source Code */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Github className="w-4 h-4 text-indigo-400" />
                <h4 className="text-xs font-semibold text-slate-200">Source Code Repository</h4>
              </div>
              <span className="text-xs font-bold text-slate-300">{rubric.repoUrl} pts max</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Verifies public repository availability, allowing reviewers and engineering leads to inspect code quality.
            </p>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Current Judgment:</span>
              <span className="font-medium text-slate-300">
                {rubricBreakdown.repoUrl?.details || (project.repoUrl ? 'Valid repo linked' : 'No repo URL')}
              </span>
            </div>
          </div>

          {/* Criterion 3: Tech Stack Breadth */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-semibold text-slate-200">Technology Breadth</h4>
              </div>
              <span className="text-xs font-bold text-slate-300">{rubric.technologies} pts max</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Grades stack completeness (Frontend, Backend, Database, Infrastructure). Minimum 4 technologies recommended.
            </p>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Current Judgment:</span>
              <span className="font-medium text-slate-300">
                {technologiesList.length} technologies tagged
              </span>
            </div>
          </div>

          {/* Criterion 4: Documentation */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-semibold text-slate-200">Documentation & Deep-Dive</h4>
              </div>
              <span className="text-xs font-bold text-slate-300">{rubric.content} pts max</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Measures architectural explanation depth, performance metrics, and problem-solving narrative.
            </p>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Current Judgment:</span>
              <span className="font-medium text-slate-300">
                {project.content ? `${project.content.length} chars written` : 'No documentation'}
              </span>
            </div>
          </div>

          {/* Criterion 5: Title & Overview Clarity */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-400" />
                <h4 className="text-xs font-semibold text-slate-200">Title & Overview Clarity</h4>
              </div>
              <span className="text-xs font-bold text-slate-300">{rubric.ownership} pts max</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Ensures strong project naming conventions and a concise 1-2 sentence executive summary.
            </p>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Current Judgment:</span>
              <span className="font-medium text-slate-300">
                {project.description.length >= 25 ? 'Complete summary' : 'Brief description'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. THEN SHOW SCORES                                                       */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Grading Results
          </span>
          <h2 className="text-lg font-bold text-slate-100">
            2. Calculated Workability Score
          </h2>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center gap-8">
          {/* Dial / Circular Badge */}
          <div className="flex flex-col items-center justify-center flex-shrink-0">
            <div
              className={`w-28 h-28 rounded-full border-4 ${scoreRing} flex flex-col items-center justify-center bg-slate-950/60 shadow-lg`}
            >
              <span className={`text-3xl font-extrabold ${scoreColor}`}>{score}</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">/ 100 PTS</span>
            </div>
            <span className="mt-2 text-xs font-medium text-slate-300">
              {score >= 80 ? 'Showcase Ready' : score >= 55 ? 'Good Progress' : 'Needs Polish'}
            </span>
          </div>

          {/* Points Breakdown List */}
          <div className="flex-1 w-full space-y-3">
            <div className="text-xs font-medium text-slate-300 border-b border-slate-800 pb-2 flex justify-between">
              <span>Evaluation Dimension</span>
              <span>Points Earned</span>
            </div>

            {Object.entries(rubricBreakdown).map(([key, item]) => (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">{item.label}</span>
                  <span className="font-semibold text-slate-100">
                    {item.earnedPoints} / {item.maxPoints} pts
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.earnedPoints === item.maxPoints
                        ? 'bg-emerald-500'
                        : item.earnedPoints > 0
                        ? 'bg-indigo-500'
                        : 'bg-slate-700'
                    }`}
                    style={{
                      width: `${item.maxPoints > 0 ? (item.earnedPoints / item.maxPoints) * 100 : 0}%`,
                    }}
                  />
                </div>
                <p className="text-[11px] text-slate-500">{item.details}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. SHOWCASE CONTENT & ARCHITECTURE                                        */}
      {/* ========================================================================= */}
      <section className="space-y-6">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          <span>Project Specifications & Content</span>
        </h2>

        {/* Technologies Grid */}
        {technologiesList.length > 0 && (
          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Identified Tech Stack
            </h3>
            <div className="flex flex-wrap gap-2">
              {technologiesList.map((techName: string, i: number) => (
                <span
                  key={i}
                  className="px-3 py-1 text-xs font-medium rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                >
                  {techName}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Full Markdown Documentation */}
        <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Project Documentation & Technical Narrative</span>
            </h3>
            <span className="text-xs text-slate-500">Rendered Markdown</span>
          </div>

          {project.content ? (
            <div className="prose prose-invert prose-indigo max-w-none text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
              {project.content}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-500 text-xs">
              No detailed documentation added yet. Edit this project to add architectural breakdown, benchmark results, and engineering highlights.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
