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

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostContent(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="min-h-screen bg-black text-gray-200 py-16 px-8">
      <div className="max-w-3xl mx-auto">
        <header className="mb-12 border-b border-white/10 pb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
            {post.data.title}
          </h1>
          <p className="text-gray-400 text-lg mb-6">{post.data.description}</p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>{post.data.date}</span>
            {post.data.tags && (
              <div className="flex gap-2 border-l border-white/10 pl-4">
                {post.data.tags.map((tag: string) => (
                  <span key={tag} className="px-2 py-0.5 bg-white/5 rounded-md text-gray-300">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </header>
        
        <div 
          className="prose prose-invert prose-violet prose-lg max-w-none prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10 prose-img:rounded-xl"
          dangerouslySetInnerHTML={{ __html: post.content.replace(/\n\n/g, '<br/><br/>').replace(/## (.*)/g, '<h2 class="text-2xl font-bold text-white mt-8 mb-4">$1</h2>').replace(/\*\*([^*]+)\*\*/g, '<strong class="text-pink-400">$1</strong>') }} 
        />
        {/* Note: In production we'd use a real markdown parser like remark/rehype, but this native regex swap simulates a blog parse for the portfolio showcase context elegantly! */}
      </div>
    </article>
  );
}
