import { Hono } from 'hono';
import { ContentExtractor, SkillGenerator, AutoTagger } from '@skillkit/core';

interface SaveRequest {
  url?: string;
  text?: string;
  name?: string;
  global?: boolean;
}

const MAX_TEXT_LENGTH = 500_000;

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
    if (bare.startsWith('fe80:') || bare.startsWith('fc') || bare.startsWith('fd')) return false;
    if (/^(22[4-9]|23\d|24\d|25[0-5])\./.test(bare)) return false;
    if (bare.startsWith('ff')) return false;
    return true;
  } catch {
    return false;
  }
}

export function saveRoutes() {
  const app = new Hono();
  const extractor = new ContentExtractor();
  const generator = new SkillGenerator();
  const tagger = new AutoTagger();

  app.post('/save', async (c) => {
    let body: SaveRequest;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: 'Invalid JSON body' }, 400);
    }

    if (!body.url && !body.text) {
      return c.json({ error: 'Either "url" or "text" is required' }, 400);
    }

    if (body.url && !isAllowedUrl(body.url)) {
      return c.json({ error: 'URL must be a public HTTP(S) address' }, 400);
    }

    if (body.text && body.text.length > MAX_TEXT_LENGTH) {
      return c.json({ error: `Text exceeds maximum length of ${MAX_TEXT_LENGTH} characters` }, 400);
    }

    try {
      const content = body.url
        ? await extractor.extractFromUrl(body.url)
        : extractor.extractFromText(body.text!);

      const result = generator.generate(content, {
        name: body.name,
        global: body.global ?? true,
      });

      return c.json({
        name: result.name,
        skillPath: result.skillPath,
        skillMd: result.skillMd,
        tags: tagger.detectTags(content),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      const isTimeout =
        (err instanceof DOMException && err.name === 'TimeoutError') ||
        (err instanceof Error && (err.name === 'TimeoutError' || err.name === 'AbortError'));

      if (isTimeout) {
        return c.json({ error: `Fetch timeout: ${message}` }, 504);
      }

      return c.json({ error: `Extraction failed: ${message}` }, 422);
    }
  });

  return app;
}
