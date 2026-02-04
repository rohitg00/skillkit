import { Hono } from 'hono';
import type { ApiSkill, TrendingResponse } from '../types.js';
import { RelevanceRanker } from '@skillkit/core';

export function trendingRoutes(skills: ApiSkill[]) {
  const app = new Hono();
  const ranker = new RelevanceRanker();

  app.get('/trending', (c) => {
    const parsedLimit = parseInt(c.req.query('limit') || '20', 10);
    const limit = Math.min(Number.isNaN(parsedLimit) ? 20 : parsedLimit, 100);

    const ranked = ranker.rank(
      skills.map((s) => ({
        name: s.name,
        description: s.description,
        content: s.content,
        stars: s.stars,
        installs: s.installs,
        references: [],
      })),
    );

    const results = ranked.slice(0, limit).map((r) => {
      const original = skills.find((s) => s.name === r.skill.name)!;
      const { content: _, ...rest } = original;
      return rest;
    });

    const response: TrendingResponse = { skills: results, limit };
    return c.json(response);
  });

  return app;
}
