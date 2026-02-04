import { Hono } from 'hono';
import type { ApiSkill, SearchResponse } from '../types.js';
import { RelevanceRanker } from '@skillkit/core';
import type { MemoryCache } from '@skillkit/core';

export function searchRoutes(skills: ApiSkill[], cache: MemoryCache<SearchResponse>) {
  const app = new Hono();
  const ranker = new RelevanceRanker();

  app.get('/search', (c) => {
    const query = c.req.query('q') || '';
    const parsedLimit = parseInt(c.req.query('limit') || '20', 10);
    const limit = Math.min(Number.isNaN(parsedLimit) ? 20 : parsedLimit, 100);
    const includeContent = c.req.query('include_content') === 'true';

    if (!query) {
      return c.json({ error: 'Query parameter "q" is required' }, 400);
    }

    const cacheKey = `search:${query}:${limit}:${includeContent}`;
    const cached = cache.get(cacheKey);
    if (cached) return c.json(cached);

    const ranked = ranker.rank(
      skills.map((s) => ({
        name: s.name,
        description: s.description,
        content: s.content,
        stars: s.stars,
        installs: s.installs,
      })),
      query,
    );

    const results: ApiSkill[] = ranked.slice(0, limit).map((r) => {
      const original = skills.find((s) => s.name === r.skill.name)!;
      if (!includeContent) {
        const { content: _, ...rest } = original;
        return rest;
      }
      return original;
    });

    const response: SearchResponse = {
      skills: results,
      total: ranked.length,
      query,
      limit,
    };

    cache.set(cacheKey, response);
    return c.json(response);
  });

  app.post('/search', async (c) => {
    let body: {
      query: string;
      limit?: number;
      include_content?: boolean;
      filters?: { tags?: string[]; category?: string; source?: string };
    };
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: 'Invalid JSON body' }, 400);
    }

    if (!body.query) {
      return c.json({ error: 'Field "query" is required' }, 400);
    }

    const limit = Math.min(body.limit ?? 20, 100);
    let filtered = skills;

    if (body.filters) {
      if (body.filters.tags?.length) {
        filtered = filtered.filter((s) =>
          body.filters!.tags!.some((t) => s.tags?.includes(t)),
        );
      }
      if (body.filters.category) {
        filtered = filtered.filter((s) => s.category === body.filters!.category);
      }
      if (body.filters.source) {
        filtered = filtered.filter((s) => s.source.includes(body.filters!.source!));
      }
    }

    const ranked = ranker.rank(
      filtered.map((s) => ({
        name: s.name,
        description: s.description,
        content: s.content,
        stars: s.stars,
        installs: s.installs,
      })),
      body.query,
    );

    const results: ApiSkill[] = ranked.slice(0, limit).map((r) => {
      const original = filtered.find((s) => s.name === r.skill.name)!;
      if (!body.include_content) {
        const { content: _, ...rest } = original;
        return rest;
      }
      return original;
    });

    const response: SearchResponse = {
      skills: results,
      total: ranked.length,
      query: body.query,
      limit,
    };

    return c.json(response);
  });

  return app;
}
