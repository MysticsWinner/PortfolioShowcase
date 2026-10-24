'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  PenSquare,
  BookOpen,
  Sparkles,
  Trash2,
  Eye,
  Tag,
  Calendar,
  Clock,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  FileText,
  Plus,
  Search,
  Code2,
  RefreshCw,
} from 'lucide-react';

interface BlogPostItem {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  contentSnippet?: string;
}

const PRESET_TAGS = [
  'Architecture',
  'Next.js',
  'React',
  'Performance',
  'Security',
  'Zero-Cost',
  'DevOps',
  'TypeScript',
  'AI & OCR',
  'Showcase',
];

export default function BlogDashboardPage() {
  const [posts, setPosts] = useState<BlogPostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('ALL');

  // Form & Editor State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>(['Architecture']);
  const [tagInput, setTagInput] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Fetch posts from API
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/blog');
      const data = await res.json();
      if (data.posts) {
        setPosts(data.posts);
      }
    } catch (err) {
      console.error('Failed to fetch blog posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Synchronize title to slug automatically if user hasn't typed custom slug
  const handleTitleChange = (val: string) => {
    setTitle(val);
    const autoSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    setSlug(autoSlug);
  };

  const handleAddTag = (newTag: string) => {
    const clean = newTag.trim();
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const insertMarkdown = (before: string, after: string = '') => {
    setContent((prev) => prev + before + after);
  };

  const resetForm = () => {
    setTitle('');
    setSlug('');
    setDescription('');
    setContent('');
    setTags(['Architecture']);
    setDate(new Date().toISOString().split('T')[0]);
    setIsEditorOpen(false);
    setActiveTab('write');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !content.trim()) {
      setNotification({
        type: 'error',
        message: 'Please complete title, summary excerpt, and markdown content.',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setNotification(null);

      const res = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug,
          description,
          content,
          tags,
          date,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to publish post');
      }

      setNotification({
        type: 'success',
        message: `Article "${title}" published successfully to /blog/${data.slug}!`,
      });
      resetForm();
      fetchPosts();
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'An error occurred while publishing article.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async (postSlug: string, postTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${postTitle}"? This will remove the markdown file.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/blog?slug=${encodeURIComponent(postSlug)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setNotification({
          type: 'success',
          message: `Post "${postTitle}" was deleted.`,
        });
        setPosts((prev) => prev.filter((p) => p.slug !== postSlug));
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Failed to delete');
      }
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to delete post.',
      });
    }
  };

  // Filtered Posts
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesTag = selectedTag === 'ALL' || p.tags.includes(selectedTag);

      return matchesSearch && matchesTag;
    });
  }, [posts, searchQuery, selectedTag]);

  // Estimated reading time
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const readingTimeMin = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 min-h-screen text-gray-100">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-violet-400 mb-2">
            <span>Dashboard</span>
            <span>/</span>
            <span className="text-gray-400">Dev Log Studio</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-indigo-300 to-pink-400">
            Technical Blog & Dev Log
          </h1>
          <p className="text-sm text-gray-400 mt-2 max-w-2xl">
            Author and publish technical deep-dives, architectural post-mortems, and engineering changelogs directly to your public showcase.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto shrink-0 flex-wrap">
          <Link
            href="/blog"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/10 text-xs font-semibold transition-all"
          >
            <BookOpen className="w-4 h-4 text-violet-400" />
            <span>View Public Dev Log</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-gray-500" />
          </Link>

          <button
            onClick={() => setIsEditorOpen(!isEditorOpen)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white font-semibold text-xs shadow-lg shadow-violet-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <PenSquare className="w-4 h-4" />
            <span>{isEditorOpen ? 'Close Editor' : 'Write New Article'}</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between gap-3 animate-in fade-in duration-200 ${
            notification.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-white"
          >
            ×
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
          <p className="text-xs uppercase font-semibold text-gray-400">Total Articles</p>
          <p className="text-2xl font-black text-white mt-1">{posts.length}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
          <p className="text-xs uppercase font-semibold text-emerald-400">Published Status</p>
          <p className="text-2xl font-black text-emerald-300 mt-1">Live</p>
        </div>
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
          <p className="text-xs uppercase font-semibold text-cyan-400">Primary Topics</p>
          <p className="text-2xl font-black text-cyan-300 mt-1">
            {Array.from(new Set(posts.flatMap((p) => p.tags))).length}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
          <p className="text-xs uppercase font-semibold text-pink-400">Format</p>
          <p className="text-2xl font-black text-pink-300 mt-1">Markdown</p>
        </div>
      </div>

      {/* Authoring & Publishing Studio Form (Collapsible / Expandable) */}
      {isEditorOpen && (
        <form
          onSubmit={handleSubmit}
          className="p-6 md:p-8 rounded-2xl bg-slate-900/90 border border-indigo-500/30 shadow-2xl space-y-6 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-slate-100">
                Author New Dev Log Article
              </h2>
            </div>
            <span className="text-xs text-slate-400">
              Saves natively to <code className="text-indigo-300">content/blog/[slug].md</code>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Title */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Article Title <span className="text-pink-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Zero-Compute In-Browser Architecture: Scaling to Millions on Render Free Tier"
                className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                required
              />
            </div>

            {/* Publication Date */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Publish Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm"
              />
            </div>

            {/* Slug */}
            <div className="md:col-span-3 space-y-1">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                URL Slug (Perm-Link)
              </label>
              <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-400">
                <span>https://yourdomain.com/blog/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="custom-article-slug"
                  className="flex-1 bg-transparent text-indigo-300 focus:outline-none font-mono"
                  required
                />
              </div>
            </div>

            {/* Description / Excerpt */}
            <div className="md:col-span-3 space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Executive Excerpt / Social Summary <span className="text-pink-400">*</span>
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A high-level summary that appears on Twitter cards, SEO meta descriptions, and blog feeds..."
                className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors text-xs resize-none"
                required
              />
            </div>

            {/* Tags / Topics */}
            <div className="md:col-span-3 space-y-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Article Tags & Topics
              </label>
              <div className="flex flex-wrap items-center gap-1.5 p-3 rounded-xl bg-black/40 border border-white/10">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="hover:text-red-400 text-slate-400 ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag(tagInput);
                      }
                    }}
                    placeholder="+ Add tag..."
                    className="w-24 text-xs bg-transparent border-none focus:outline-none text-slate-300 placeholder-slate-600"
                  />
                  {tagInput.trim() && (
                    <button
                      type="button"
                      onClick={() => handleAddTag(tagInput)}
                      className="text-xs text-indigo-400 font-semibold"
                    >
                      Add
                    </button>
                  )}
                </div>
              </div>

              {/* Quick suggestions */}
              <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-slate-500 pt-1">
                <span>Suggested:</span>
                {PRESET_TAGS.filter((t) => !tags.includes(t)).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleAddTag(preset)}
                    className="hover:text-indigo-300 px-1.5 py-0.5 rounded bg-white/5 border border-white/5"
                  >
                    +{preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Markdown Content Editor */}
            <div className="md:col-span-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('write')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      activeTab === 'write'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Write (Markdown)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('preview')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      activeTab === 'preview'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Live Preview
                  </button>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    ~{readingTimeMin} min read
                  </span>
                  <span>{wordCount} words</span>
                </div>
              </div>

              {/* Formatting Helper Bar */}
              {activeTab === 'write' && (
                <div className="flex items-center gap-2 p-1.5 bg-black/60 border border-white/10 rounded-lg text-xs text-slate-400 flex-wrap">
                  <button
                    type="button"
                    onClick={() => insertMarkdown('\n## Section Title\n')}
                    className="px-2 py-0.5 hover:bg-white/10 rounded"
                  >
                    H2
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('\n### Sub-Heading\n')}
                    className="px-2 py-0.5 hover:bg-white/10 rounded"
                  >
                    H3
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('**bold text**')}
                    className="px-2 py-0.5 hover:bg-white/10 rounded font-bold"
                  >
                    B
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('`code`')}
                    className="px-2 py-0.5 hover:bg-white/10 rounded font-mono"
                  >
                    code
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('\n```typescript\n// code here\n```\n')}
                    className="px-2 py-0.5 hover:bg-white/10 rounded font-mono"
                  >
                    ```ts
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('\n- Bullet point\n')}
                    className="px-2 py-0.5 hover:bg-white/10 rounded"
                  >
                    • List
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('\n> Architectural insight quote\n')}
                    className="px-2 py-0.5 hover:bg-white/10 rounded italic"
                  >
                    Quote
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('[Link text](https://...)')}
                    className="px-2 py-0.5 hover:bg-white/10 rounded text-indigo-400"
                  >
                    Link
                  </button>
                </div>
              )}

              {activeTab === 'write' ? (
                <textarea
                  rows={14}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={`Write your technical article in standard Markdown...\n\n## The Architecture Challenge\nExplain the technical problem...\n\n### The Breakthrough\nProvide code snippets, benchmark results, or metrics...`}
                  className="w-full p-4 font-mono text-xs bg-black/60 border border-white/10 rounded-xl text-slate-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors leading-relaxed"
                  required
                />
              ) : (
                <div className="p-6 min-h-[300px] max-h-[500px] overflow-y-auto bg-black/60 border border-white/10 rounded-xl prose prose-invert prose-indigo max-w-none text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {content ? (
                    content
                  ) : (
                    <span className="text-slate-600 italic">No content typed yet for preview.</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white font-semibold text-xs shadow-lg shadow-violet-600/30 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Publish Dev Log Article</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Controls & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles by title, excerpt, or tag..."
            className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 transition-colors"
          />
        </div>

        {/* Filter Tag Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedTag('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedTag === 'ALL'
                ? 'bg-violet-600 text-white'
                : 'text-gray-400 hover:text-white bg-black/40'
            }`}
          >
            All Topics
          </button>
          {Array.from(new Set(posts.flatMap((p) => p.tags))).map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTag(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedTag === t
                  ? 'bg-violet-600 text-white'
                  : 'text-gray-400 hover:text-white bg-black/40'
              }`}
            >
              #{t}
            </button>
          ))}
        </div>
      </div>

      {/* Article List */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading dev log archive...</p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center p-8 rounded-3xl bg-white/[0.02] border border-dashed border-white/10">
          <div className="w-16 h-16 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-4">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">No articles found</h3>
          <p className="text-xs text-gray-400 mt-1 max-w-sm">
            {searchQuery || selectedTag !== 'ALL'
              ? 'No articles match your search or topic filter.'
              : 'You have not authored any technical blog articles yet.'}
          </p>
          <button
            onClick={() => setIsEditorOpen(true)}
            className="mt-5 px-4 py-2 rounded-xl bg-violet-600/30 hover:bg-violet-600/50 border border-violet-500/30 text-violet-300 text-xs font-semibold transition-colors"
          >
            + Author First Article
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPosts.map((post) => (
            <div
              key={post.slug}
              className="p-6 rounded-2xl bg-gradient-to-b from-white/[0.04] to-black/40 border border-white/10 hover:border-violet-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-violet-900/10 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1.5 text-indigo-400 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    {post.date}
                  </span>
                  <span className="text-[11px] font-mono text-gray-500">/blog/{post.slug}</span>
                </div>

                <Link href={`/blog/${post.slug}`} target="_blank">
                  <h3 className="text-lg font-bold text-white hover:text-violet-300 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                </Link>

                <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">
                  {post.description}
                </p>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] px-2 py-0.5 rounded bg-violet-900/30 text-violet-300 border border-violet-500/20"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs">
                <Link
                  href={`/blog/${post.slug}`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Read Article</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDeletePost(post.slug, post.title)}
                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                    title="Delete post file"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
