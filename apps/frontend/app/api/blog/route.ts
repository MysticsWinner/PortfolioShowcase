import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

function getBlogDir(): string {
  const localDir = path.join(process.cwd(), 'content', 'blog');
  if (fs.existsSync(localDir)) return localDir;
  const nestedDir = path.join(process.cwd(), 'apps', 'frontend', 'content', 'blog');
  if (fs.existsSync(nestedDir)) return nestedDir;
  // Ensure the directory exists
  fs.mkdirSync(localDir, { recursive: true });
  return localDir;
}

export async function GET() {
  try {
    const blogDir = getBlogDir();
    if (!fs.existsSync(blogDir)) {
      return NextResponse.json({ posts: [] });
    }

    const files = fs.readdirSync(blogDir).filter((file) => file.endsWith('.md'));
    const posts = files.map((fileName) => {
      const filePath = path.join(blogDir, fileName);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data, content } = matter(fileContents);
      return {
        slug: fileName.replace('.md', ''),
        title: data.title || 'Untitled Post',
        date: data.date || '',
        description: data.description || '',
        tags: Array.isArray(data.tags) ? data.tags : [],
        contentSnippet: content.slice(0, 180).trim(),
      };
    });

    posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({ posts });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to retrieve blog posts', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, content, tags, slug: rawSlug, date } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Post title is required' }, { status: 400 });
    }
    if (!description || !description.trim()) {
      return NextResponse.json({ error: 'Post description/excerpt is required' }, { status: 400 });
    }
    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Post markdown content is required' }, { status: 400 });
    }

    // Generate safe URL slug
    const cleanSlug = (rawSlug || title)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    if (!cleanSlug) {
      return NextResponse.json({ error: 'Invalid post slug generated' }, { status: 400 });
    }

    const postDate = date || new Date().toISOString().split('T')[0];
    const cleanTags = Array.isArray(tags)
      ? tags.map((t: string) => String(t).trim()).filter(Boolean)
      : [];

    const fileMatter = matter.stringify(content.trim(), {
      title: title.trim(),
      date: postDate,
      description: description.trim(),
      tags: cleanTags,
    });

    const blogDir = getBlogDir();
    const targetFilePath = path.join(blogDir, `${cleanSlug}.md`);

    fs.writeFileSync(targetFilePath, fileMatter, 'utf8');

    return NextResponse.json({
      success: true,
      slug: cleanSlug,
      message: 'Blog post published successfully',
      post: {
        slug: cleanSlug,
        title: title.trim(),
        date: postDate,
        description: description.trim(),
        tags: cleanTags,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to create blog post', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ error: 'Slug parameter is required' }, { status: 400 });
    }

    const cleanSlug = slug.replace(/[^a-z0-9_-]/gi, '');
    const blogDir = getBlogDir();
    const targetFilePath = path.join(blogDir, `${cleanSlug}.md`);

    if (fs.existsSync(targetFilePath)) {
      fs.unlinkSync(targetFilePath);
      return NextResponse.json({ success: true, message: `Post "${cleanSlug}" deleted` });
    } else {
      return NextResponse.json({ error: 'Blog post file not found' }, { status: 404 });
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to delete blog post', details: error.message },
      { status: 500 }
    );
  }
}
