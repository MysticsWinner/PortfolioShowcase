import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  const folder = path.join(process.cwd(), 'content', 'blog');
  if (!fs.existsSync(folder)) return [];
  const files = fs.readdirSync(folder);
  return files
    .filter((file) => file.endsWith('.md'))
    .map((file) => ({
      slug: file.replace('.md', ''),
    }));
}

function getPostContent(slug: string) {
  const file = path.join(process.cwd(), 'content', 'blog', `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  const content = fs.readFileSync(file, 'utf8');
  return matter(content);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostContent(slug);
  if (!post) {
    return { title: 'Post Not Found | Portfolio Showcase' };
  }
  return {
    title: `${post.data.title} | Blog`,
    description: post.data.description,
    openGraph: {
      title: post.data.title,
      description: post.data.description,
      type: 'article',
      publishedTime: post.data.date,
      tags: post.data.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.data.title,
      description: post.data.description,
    },
  };
}

import Link from 'next/link';

function formatMarkdownToHtml(raw: string): string {
  let html = raw;

  // Code blocks (fenced ```lang ... ```)
  html = html.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (_match, lang, code) => {
    const escaped = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return `<div class="my-6 rounded-2xl overflow-hidden border border-white/10 bg-[#0d1117] shadow-xl">
      <div class="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10 text-xs font-mono text-gray-400">
        <span class="text-pink-400 font-semibold">${lang || 'code'}</span>
        <span>snippet</span>
      </div>
      <pre class="p-4 text-xs font-mono text-indigo-200 overflow-x-auto leading-relaxed"><code>${escaped}</code></pre>
    </div>`;
  });

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold text-violet-300 mt-8 mb-3 tracking-tight">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-white mt-10 mb-4 pb-2 border-b border-white/10 tracking-tight">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-extrabold text-white mt-12 mb-6 tracking-tight">$1</h1>');

  // Blockquotes
  html = html.replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-violet-500 bg-violet-500/5 px-4 py-3 my-4 rounded-r-xl text-gray-300 italic text-sm leading-relaxed">$1</blockquote>');

  // Horizontal Rules
  html = html.replace(/^---$/gim, '<hr class="border-white/10 my-8" />');

  // Bold & Italics
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="text-pink-300 font-semibold">$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em class="text-gray-300 italic">$1</em>');

  // Inline Code
  html = html.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-white/10 text-pink-300 font-mono text-xs border border-white/5">$1</code>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-indigo-400 hover:text-indigo-300 underline underline-offset-4 decoration-indigo-400/40 font-medium" target="_blank" rel="noopener noreferrer">$1</a>');

  // Unordered list items (- item or * item)
  html = html.replace(/^[•\-\*]\s+(.*$)/gim, '<li class="flex items-start gap-2 my-1.5 text-gray-300 leading-relaxed"><span class="text-violet-400 mt-1 shrink-0">•</span><span>$1</span></li>');

  // Paragraph breaks
  html = html.replace(/\n\n+/g, '<br/><br/>');

  return html;
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostContent(slug);

  if (!post) {
    notFound();
  }

  const renderedHtml = formatMarkdownToHtml(post.content);

  return (
    <article className="min-h-screen bg-black text-gray-200 py-16 px-6 sm:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between text-xs text-gray-400 border-b border-white/5 pb-4">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 hover:text-white transition-colors"
          >
            ← Back to Dev Log
          </Link>
          <Link
            href="/dashboard/blog"
            className="text-violet-400 hover:text-violet-300 transition-colors"
          >
            + Author New Post
          </Link>
        </div>

        <header className="border-b border-white/10 pb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight tracking-tight">
            {post.data.title}
          </h1>
          <p className="text-gray-300 text-base sm:text-lg mb-6 leading-relaxed">
            {post.data.description}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
            <span className="font-mono text-indigo-400">{post.data.date}</span>
            {post.data.tags && (
              <div className="flex flex-wrap gap-1.5 border-l border-white/10 pl-4">
                {post.data.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-violet-900/30 text-violet-300 rounded-md border border-violet-500/20"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </header>

        <div
          className="prose prose-invert prose-violet prose-lg max-w-none text-gray-200 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: renderedHtml }}
        />

        {/* Article Footer */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-gray-400">
          <div>
            <span>Published on </span>
            <strong className="text-white">{post.data.date}</strong>
            <span> in </span>
            <strong className="text-violet-400">Engineering Dev Log</strong>
          </div>
          <Link
            href="/blog"
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors"
          >
            Read More Articles →
          </Link>
        </div>
      </div>
    </article>
  );
}

