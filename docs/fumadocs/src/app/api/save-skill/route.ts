import { NextRequest, NextResponse } from 'next/server';
import TurndownService from 'turndown';

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 10;

function checkRateLimit(key: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1 };
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - entry.count };
}

const BLOCKED_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]', '::1', '0.0.0.0']);

function isAllowedUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;

    const hostname = parsed.hostname.toLowerCase();
    const bare = hostname.replace(/^\[|\]$/g, '');

    if (BLOCKED_HOSTS.has(hostname) || BLOCKED_HOSTS.has(bare)) return false;
    if (bare.startsWith('::ffff:')) return isAllowedUrl(`http://${bare.slice(7)}`);
    if (/^127\./.test(bare) || /^0\./.test(bare)) return false;
    if (bare.startsWith('10.') || bare.startsWith('192.168.')) return false;
    if (/^172\.(1[6-9]|2\d|3[01])\./.test(bare)) return false;
    if (bare.startsWith('169.254.')) return false;
    if (bare.startsWith('fe80:') || bare.startsWith('fc00:') || bare.startsWith('fd')) return false;
    if (/^(22[4-9]|23\d|24\d|25[0-5])\./.test(bare)) return false;
    if (/^ff[0-9a-f]{2}:/.test(bare)) return false;
    return true;
  } catch {
    return false;
  }
}

const GITHUB_URL_PATTERN = /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/;
const GITHUB_RAW_PATTERN = /^https?:\/\/raw\.githubusercontent\.com\//;
const FETCH_TIMEOUT = 30_000;

const TECH_KEYWORDS = new Set([
  'react', 'vue', 'angular', 'svelte', 'nextjs', 'nuxt', 'remix',
  'typescript', 'javascript', 'python', 'rust', 'go', 'java', 'ruby',
  'node', 'deno', 'bun', 'docker', 'kubernetes', 'terraform',
  'aws', 'gcp', 'azure', 'vercel', 'netlify', 'cloudflare',
  'graphql', 'rest', 'grpc', 'websocket', 'redis', 'postgres',
  'mongodb', 'sqlite', 'mysql', 'prisma', 'drizzle',
  'tailwind', 'css', 'html', 'sass', 'webpack', 'vite', 'esbuild',
  'git', 'ci', 'cd', 'testing', 'security', 'authentication',
  'api', 'cli', 'sdk', 'mcp', 'llm', 'ai', 'ml', 'openai', 'anthropic',
]);

const TAG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const turndown = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });

interface ExtractedContent {
  title: string;
  content: string;
  sourceUrl: string;
  contentType: string;
  language?: string;
}

async function extractFromUrl(url: string): Promise<ExtractedContent> {
  if (GITHUB_URL_PATTERN.test(url) || GITHUB_RAW_PATTERN.test(url)) {
    return fetchGitHubContent(url);
  }

  const MAX_BODY_SIZE = 5 * 1024 * 1024;
  const response = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT) });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  const contentLength = Number(response.headers.get('content-length') || '0');
  if (contentLength > MAX_BODY_SIZE) {
    throw new Error('Response too large');
  }

  const contentType = response.headers.get('content-type') ?? '';
  const body = await response.text();
  if (body.length > MAX_BODY_SIZE) {
    throw new Error('Response too large');
  }

  if (contentType.includes('text/html')) {
    const titleMatch = body.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch?.[1]?.trim() ?? new URL(url).hostname;
    const bodyMatch = body.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    const content = turndown.turndown(bodyMatch?.[1] ?? body);
    return { title, content, sourceUrl: url, contentType: 'webpage' };
  }

  const title = new URL(url).pathname.split('/').pop() ?? 'Untitled';
  return { title, content: body, sourceUrl: url, contentType: 'text' };
}

const LANG_MAP: Record<string, string> = {
  '.ts': 'typescript', '.tsx': 'typescript', '.js': 'javascript', '.jsx': 'javascript',
  '.py': 'python', '.rb': 'ruby', '.go': 'go', '.rs': 'rust', '.java': 'java',
  '.kt': 'kotlin', '.swift': 'swift', '.sh': 'shell', '.yml': 'yaml', '.yaml': 'yaml',
  '.json': 'json', '.md': 'markdown', '.html': 'html', '.css': 'css', '.sql': 'sql',
};

async function fetchGitHubContent(url: string): Promise<ExtractedContent> {
  let rawUrl = url;
  const match = url.match(GITHUB_URL_PATTERN);
  if (match) {
    const [, owner, repo, branch, path] = match;
    rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
  }

  const MAX_BODY_SIZE = 5 * 1024 * 1024;
  const response = await fetch(rawUrl, { signal: AbortSignal.timeout(FETCH_TIMEOUT) });
  if (!response.ok) {
    throw new Error(`Failed to fetch GitHub content: ${response.status} ${response.statusText}`);
  }

  const contentLength = Number(response.headers.get('content-length') || '0');
  if (contentLength > MAX_BODY_SIZE) {
    throw new Error('Response too large');
  }

  const body = await response.text();
  if (body.length > MAX_BODY_SIZE) {
    throw new Error('Response too large');
  }
  const filename = rawUrl.split('/').pop() ?? 'file';
  const ext = filename.includes('.') ? '.' + filename.split('.').pop()!.toLowerCase() : '';
  const language = LANG_MAP[ext];
  const isCode = language !== undefined && language !== 'markdown';
  const content = isCode ? `\`\`\`${language}\n${body}\n\`\`\`` : body;

  return { title: filename, content, sourceUrl: url, contentType: 'github', language };
}

function addTag(counts: Map<string, number>, tag: string, weight: number): void {
  if (TAG_PATTERN.test(tag)) {
    counts.set(tag, (counts.get(tag) ?? 0) + weight);
  }
}

function detectTags(extracted: ExtractedContent): string[] {
  const counts = new Map<string, number>();

  try {
    const segments = new URL(extracted.sourceUrl).pathname
      .split('/').filter(Boolean)
      .map((s) => s.toLowerCase().replace(/[^a-z0-9-]/g, ''));
    for (const seg of segments) {
      if (seg.length >= 2 && seg.length <= 30) {
        addTag(counts, seg, 2);
      }
    }
  } catch { /* skip */ }

  const headingRe = /^#{1,2}\s+(.+)$/gm;
  let m: RegExpExecArray | null;
  while ((m = headingRe.exec(extracted.content)) !== null) {
    for (const word of m[1].toLowerCase().split(/\s+/)) {
      const cleaned = word.replace(/[^a-z0-9-]/g, '');
      if (cleaned.length >= 2) {
        addTag(counts, cleaned, 2);
      }
    }
  }

  const codeBlockRe = /^```(\w+)/gm;
  while ((m = codeBlockRe.exec(extracted.content)) !== null) {
    const lang = m[1].toLowerCase();
    if (lang.length >= 2) {
      addTag(counts, lang, 3);
    }
  }

  const lower = extracted.content.toLowerCase();
  for (const keyword of TECH_KEYWORDS) {
    if (new RegExp(`\\b${keyword}\\b`, 'i').test(lower)) {
      addTag(counts, keyword, 1);
    }
  }

  if (extracted.language) {
    addTag(counts, extracted.language.toLowerCase(), 3);
  }

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([tag]) => tag);
}

function slugify(input: string): string {
  const slug = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
  return slug.slice(0, 64).replace(/-+$/, '') || 'untitled-skill';
}

function yamlEscape(value: string): string {
  const singleLine = value.replace(/\r?\n/g, ' ').trim();
  if (/[:#{}[\],&*?|>!%@`]/.test(singleLine) || singleLine.startsWith("'") || singleLine.startsWith('"')) {
    return `"${singleLine.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  }
  return singleLine;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const { allowed, remaining } = checkRateLimit(ip);

  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Try again in a minute.' },
      { status: 429, headers: { 'X-RateLimit-Remaining': '0', 'Retry-After': '60' } },
    );
  }

  let body: { url?: string; name?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { url, name } = body;
  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'Missing required field: url' }, { status: 400 });
  }

  if (name !== undefined && typeof name !== 'string') {
    return NextResponse.json({ error: 'Field "name" must be a string' }, { status: 400 });
  }

  if (!isAllowedUrl(url)) {
    return NextResponse.json({ error: 'URL not allowed' }, { status: 403 });
  }

  try {
    const extracted = await extractFromUrl(url);
    const tags = detectTags(extracted);

    const skillName = slugify(name || extracted.title || 'untitled');
    const description = extracted.content
      .split('\n')
      .find((l) => l.trim().length > 0)
      ?.replace(/^#+\s*/, '')
      .trim()
      .slice(0, 200) || 'Saved skill';
    const savedAt = new Date().toISOString();

    const yamlTags = tags.length > 0
      ? `tags:\n${tags.map((t) => `  - ${t}`).join('\n')}\n`
      : '';

    const skillMd =
      `---\n` +
      `name: ${skillName}\n` +
      `description: ${yamlEscape(description)}\n` +
      yamlTags +
      `metadata:\n` +
      `  source: ${yamlEscape(url)}\n` +
      `  savedAt: ${savedAt}\n` +
      `---\n\n` +
      extracted.content + '\n';

    return NextResponse.json(
      { name: skillName, skillMd, tags, description },
      { headers: { 'X-RateLimit-Remaining': String(remaining) } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to extract content';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
