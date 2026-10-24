/**
 * Client-Side Resume & Project Extraction Engine
 * Zero-compute cost: Runs 100% on-device in the user's browser.
 */

export interface CandidateProject {
  id: string;
  title: string;
  description: string;
  content: string;
  technologies: string[];
  repoUrl?: string;
  liveUrl?: string;
  confidence: number; // 0 - 100
  selected: boolean;
  status: 'DRAFT' | 'PUBLISHED';
  visibility: 'PRIVATE' | 'PUBLIC';
}

export interface ParseResult {
  rawText: string;
  projects: CandidateProject[];
  detectedSkills: string[];
  candidateEmail?: string;
  durationMs: number;
}

const COMMON_TECH_DICTIONARY: string[] = [
  'React', 'Next.js', 'Vue', 'Angular', 'Svelte', 'Node.js', 'Express', 'NestJS',
  'FastAPI', 'Django', 'Flask', 'Go', 'Golang', 'Rust', 'Python', 'TypeScript',
  'JavaScript', 'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'MongoDB',
  'PostgreSQL', 'MySQL', 'Redis', 'GraphQL', 'TailwindCSS', 'Prisma', 'Socket.io',
  'Three.js', 'WebAssembly', 'C++', 'C#', '.NET', 'Java', 'Spring Boot', 'Kafka',
  'RabbitMQ', 'Elasticsearch', 'TensorFlow', 'PyTorch', 'OpenCV', 'Pandas',
  'NumPy', 'Scikit-learn', 'Git', 'GitHub Actions', 'CI/CD', 'Jest', 'Cypress',
  'Playwright', 'Vitest', 'Supabase', 'Firebase', 'Vercel', 'Render', 'Nginx',
  'Linux', 'GraphQL', 'REST API', 'WebSockets', 'HTML5', 'CSS3', 'Sass', 'Redux',
  'Zustand', 'React Native', 'Flutter', 'Swift', 'Kotlin'
];

/**
 * Extracts plain text from a File object client-side
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  // Plain text / Markdown / JSON files
  if (extension === 'txt' || extension === 'md' || extension === 'json' || file.type.startsWith('text/')) {
    return await file.text();
  }

  // PDF extraction using pdfjs-dist
  if (extension === 'pdf' || file.type === 'application/pdf') {
    try {
      const pdfjs = await import('pdfjs-dist');
      // Configure worker via CDN for browser compatibility
      if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
        pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdfjs.worker.min.mjs`;
      }

      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) });
      const pdfDoc = await loadingTask.promise;

      let extractedText = '';
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const textContent = await page.getTextContent();
        const pageStrings = textContent.items
          .map((item: any) => item.str || '')
          .join(' ');
        extractedText += pageStrings + '\n\n';
      }

      if (extractedText.trim().length > 0) {
        return extractedText;
      }
    } catch (pdfErr) {
      console.warn('pdfjs extraction notice, trying fallback text decoding:', pdfErr);
      // Fallback: decode raw text stream if available
      const buffer = await file.arrayBuffer();
      const raw = new TextDecoder('utf-8', { fatal: false }).decode(buffer);
      // Clean non-printable characters
      const cleaned = raw.replace(/[^\x20-\x7E\t\r\n]/g, ' ');
      if (cleaned.length > 100) {
        return cleaned;
      }
    }
  }

  throw new Error(`Unsupported file type (.${extension}). Please upload a PDF, Markdown (.md), or plain text (.txt) resume.`);
}

/**
 * Analyzes resume text and segments projects with confidence rating
 */
export function parseResumeText(text: string): ParseResult {
  const startTime = Date.now();
  const cleanedText = text.replace(/\r\n/g, '\n');

  // Detect candidate email
  const emailMatch = cleanedText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const candidateEmail = emailMatch ? emailMatch[0] : undefined;

  // Extract all mentioned skills
  const detectedSkills = extractTechnologies(cleanedText);

  // Locate the PROJECTS section
  const projectSectionRegex = /(?:^|\n)\s*(?:#+\s*)?(?:TECHNICAL\s+|KEY\s+|PERSONAL\s+|ACADEMIC\s+|SELECTED\s+)?(?:PROJECTS|PORTFOLIO|WORKS|FEATURED WORK)\s*[:\n\-—]/i;
  const projectSectionMatch = cleanedText.search(projectSectionRegex);

  let projectText = '';
  if (projectSectionMatch !== -1) {
    const afterHeading = cleanedText.slice(projectSectionMatch);
    // Find next major section heading
    const nextSectionRegex = /\n\s*(?:#+\s*)?(?:EXPERIENCE|WORK EXPERIENCE|EMPLOYMENT|EDUCATION|SKILLS|TECHNICAL SKILLS|CERTIFICATIONS|PUBLICATIONS|AWARDS|INTERESTS)\s*[:\n\-—]/i;
    const nextSectionMatch = afterHeading.slice(30).search(nextSectionRegex);
    if (nextSectionMatch !== -1) {
      projectText = afterHeading.slice(0, nextSectionMatch + 30);
    } else {
      projectText = afterHeading;
    }
  } else {
    // Fallback: search entire document
    projectText = cleanedText;
  }

  const candidateProjects = extractProjectsFromChunk(projectText, cleanedText);

  return {
    rawText: cleanedText,
    projects: candidateProjects,
    detectedSkills,
    candidateEmail,
    durationMs: Date.now() - startTime,
  };
}

function extractProjectsFromChunk(chunk: string, fullDocText: string): CandidateProject[] {
  // Split into candidate project blocks
  const lines = chunk.split('\n').map(l => l.trim()).filter(Boolean);
  const blocks: string[][] = [];
  let currentBlock: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if line resembles a project heading:
    // e.g. "Distributed Task Queue | Go, Redis, Docker | Jan 2024"
    // or "**Portfolio Showcase** - React, Next.js"
    // or "# Project Name"
    const isHeading =
      /^#{1,3}\s+[A-Za-z0-9]/.test(line) ||
      /^\*{2}[^*]+\*{2}/.test(line) ||
      (/^([A-Z0-9][A-Za-z0-9\s\-–—]{2,40})(\s*[|–—-]\s*|\s*\([^\)]+\)\s*)/.test(line) &&
        !/^(Experience|Education|Skills|Summary|Objective|Projects|Certifications)/i.test(line));

    if (isHeading && currentBlock.length > 0) {
      blocks.push(currentBlock);
      currentBlock = [line];
    } else {
      currentBlock.push(line);
    }
  }
  if (currentBlock.length > 0) {
    blocks.push(currentBlock);
  }

  const projects: CandidateProject[] = [];

  for (const block of blocks) {
    if (block.length === 0) continue;

    const firstLine = block[0];
    // Skip if block is just the section header
    if (/^(PROJECTS?|PERSONAL PROJECTS?|TECHNICAL PROJECTS?)$/i.test(firstLine)) {
      continue;
    }

    // Clean title
    let title = firstLine
      .replace(/^#{1,4}\s*/, '')
      .replace(/^\*{2}|\*{2}$/g, '')
      .split(/[|–—]/)[0]
      .replace(/\([^\)]*\)/g, '')
      .trim();

    // Strip date ranges from title
    title = title.replace(/\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*\d{4}.*$/i, '').trim();

    if (title.length < 2 || title.length > 60) continue;
    if (/^(Summary|Experience|Education|Skills|Languages|Projects|Interests)$/i.test(title)) continue;

    const blockText = block.join('\n');

    // Extract repository URL
    const repoMatch = blockText.match(/https?:\/\/(?:www\.)?(?:github\.com|gitlab\.com|bitbucket\.org)\/[a-zA-Z0-9_\-\.]+\/[a-zA-Z0-9_\-\.]+/i);
    const repoUrl = repoMatch ? repoMatch[0].replace(/[,\.\)]+$/, '') : undefined;

    // Extract live demo URL
    const urlMatches = blockText.match(/https?:\/\/[^\s\)\],]+/gi) || [];
    const liveUrlMatch = urlMatches.find(url => {
      const clean = url.toLowerCase();
      return !clean.includes('github.com') &&
        !clean.includes('gitlab.com') &&
        !clean.includes('linkedin.com') &&
        !clean.includes('twitter.com') &&
        !clean.includes('x.com');
    });
    const liveUrl = liveUrlMatch ? liveUrlMatch.replace(/[,\.\)]+$/, '') : undefined;

    // Extract tech stack in block
    const blockTech = extractTechnologies(blockText);

    // Extract bullet points / description
    const bulletLines = block
      .slice(1)
      .filter(l => /^[•\-\*–—\d\.]+\s+/.test(l) || l.length > 30)
      .map(l => l.replace(/^[•\-\*–—\d\.]+\s+/, '').trim());

    const description = bulletLines[0] || block.slice(1).join(' ').slice(0, 180) || `Project extracted from resume showcasing ${blockTech.slice(0, 3).join(', ')}`;
    
    // Formulate structured markdown content
    let content = `### Overview\n${description}\n\n`;
    if (bulletLines.length > 1) {
      content += `### Key Highlights & Features\n` + bulletLines.map(b => `- ${b}`).join('\n') + '\n\n';
    }
    if (blockTech.length > 0) {
      content += `### Tech Stack\n${blockTech.join(' • ')}\n`;
    }

    // Calculate parsing confidence (0 - 100)
    let confidence = 50;
    if (repoUrl) confidence += 20;
    if (liveUrl) confidence += 15;
    if (blockTech.length >= 2) confidence += 10;
    if (bulletLines.length >= 2) confidence += 5;

    projects.push({
      id: 'proj_' + Math.random().toString(36).substring(2, 9),
      title,
      description: description.slice(0, 240),
      content,
      technologies: blockTech,
      repoUrl,
      liveUrl,
      confidence: Math.min(100, confidence),
      selected: true,
      status: 'DRAFT', // Default DRAFT per user requirement
      visibility: 'PRIVATE', // Default PRIVATE per user requirement
    });
  }

  // Fallback: if zero projects extracted from blocks, try regex pattern search in full document
  if (projects.length === 0) {
    const fallbackProjects = extractFallbackProjects(fullDocText);
    return fallbackProjects;
  }

  return projects;
}

function extractFallbackProjects(text: string): CandidateProject[] {
  const repoRegex = /https?:\/\/(?:www\.)?github\.com\/([a-zA-Z0-9_\-\.]+)\/([a-zA-Z0-9_\-\.]+)/gi;
  const matches = [...text.matchAll(repoRegex)];
  const projects: CandidateProject[] = [];

  for (const match of matches) {
    const rawRepoName = match[2].replace(/[,\.\)]+$/, '');
    const formattedTitle = rawRepoName
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());

    const repoUrl = match[0].replace(/[,\.\)]+$/, '');
    const surroundingText = text.slice(Math.max(0, match.index! - 200), match.index! + 300);
    const tech = extractTechnologies(surroundingText);

    projects.push({
      id: 'proj_' + Math.random().toString(36).substring(2, 9),
      title: formattedTitle,
      description: `Discovered repository ${rawRepoName} with ${tech.join(', ') || 'modern web technologies'}`,
      content: `### Overview\nRepository extracted from portfolio context: ${repoUrl}`,
      technologies: tech,
      repoUrl,
      confidence: 65,
      selected: true,
      status: 'DRAFT',
      visibility: 'PRIVATE',
    });
  }

  return projects;
}

function extractTechnologies(text: string): string[] {
  const detected = new Set<string>();

  for (const tech of COMMON_TECH_DICTIONARY) {
    // Match whole word with word boundary
    const escaped = tech.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    const regex = new RegExp(`(?:^|[\\s,;(|/])(${escaped})(?:[\\s,;)|/.]|$)`, 'i');
    if (regex.test(text)) {
      detected.add(tech);
    }
  }

  return Array.from(detected);
}
