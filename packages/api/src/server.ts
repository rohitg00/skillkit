import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { MemoryCache } from '@skillkit/core';
import { rateLimiter } from './middleware/rate-limit.js';
import { healthRoutes } from './routes/health.js';
import { searchRoutes } from './routes/search.js';
import { skillRoutes } from './routes/skills.js';
import { trendingRoutes } from './routes/trending.js';
import { categoryRoutes } from './routes/categories.js';
import type { ApiSkill, SearchResponse } from './types.js';

export interface ServerOptions {
  port?: number;
  host?: string;
  corsOrigin?: string;
  cacheTtlMs?: number;
  skills?: ApiSkill[];
  rateLimitMax?: number;
}

export function createApp(options: ServerOptions = {}) {
  const skills = options.skills || [];
  const cache = new MemoryCache<SearchResponse>({
    maxSize: 500,
    ttlMs: options.cacheTtlMs ?? 86_400_000,
  });

  const app = new Hono();

  app.use('*', cors({ origin: options.corsOrigin || '*' }));
  app.use('*', rateLimiter(options.rateLimitMax ?? 60));

  app.route('/', healthRoutes(skills.length, cache));
  app.route('/', searchRoutes(skills, cache));
  app.route('/', skillRoutes(skills));
  app.route('/', trendingRoutes(skills));
  app.route('/', categoryRoutes(skills));

  return { app, cache };
}

export async function startServer(options: ServerOptions = {}) {
  const port = options.port ?? 3737;
  const host = options.host ?? '0.0.0.0';
  const { app, cache } = createApp(options);

  const { serve } = await import('@hono/node-server');

  const server = serve({ fetch: app.fetch, port, hostname: host }, () => {
    console.log(`SkillKit API server running at http://${host}:${port}`);
    console.log(`Skills loaded: ${options.skills?.length ?? 0}`);
  });

  return { server, app, cache };
}
