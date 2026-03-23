import React from 'react';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';
import NewsletterWidget from '../../components/NewsletterWidget';

interface PostMetadata {
  title: string;
  date: string;
  description: string;
  slug: string;
  tags?: string[];
}

function getPostMetadata(): PostMetadata[] {
  const folder = path.join(process.cwd(), 'content', 'blog');
  if (!fs.existsSync(folder)) return [];
  
  const files = fs.readdirSync(folder);
  const markdownPosts = files.filter((file) => file.endsWith('.md'));

  const posts = markdownPosts.map((fileName) => {
    const fileContents = fs.readFileSync(path.join(folder, fileName), 'utf8');
    const matterResult = matter(fileContents);
    return {
      title: matterResult.data.title,
      date: matterResult.data.date,
      description: matterResult.data.description,
      slug: fileName.replace('.md', ''),
      tags: matterResult.data.tags,
    };
  });

  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export default function BlogPage() {
  const posts = getPostMetadata();

  return (
    <div className="min-h-screen bg-black text-gray-200 py-16 px-8 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-violet-900/10 to-transparent blur-[120px] rounded-full" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-pink-400">
          Dev Log
        </h1>
        <p className="text-gray-400 mb-12 text-lg">
          Insights, learnings, and thoughts on software architecture and full-stack development.
        </p>

        <NewsletterWidget />

        <div className="grid gap-6">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}>
              <div className="group block bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-colors shadow-lg">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-2xl font-bold text-white group-hover:text-pink-400 transition-colors">
                    {post.title}
                  </h2>
                  <span className="text-sm text-gray-500">{post.date}</span>
                </div>
                <p className="text-gray-400 mb-4">{post.description}</p>
                {post.tags && (
                  <div className="flex gap-2">
                    {post.tags.map((tag: string) => (
                      <span key={tag} className="text-xs px-2 py-1 bg-violet-900/30 text-violet-300 rounded-md border border-violet-500/20">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}

          {posts.length === 0 && (
            <div className="text-center py-12 text-gray-500 border border-dashed border-white/10 rounded-2xl">
              No technical articles published yet. Stay tuned.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
