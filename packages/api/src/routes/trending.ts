import { Hono } from 'hono';
import type { ApiSkill, TrendingResponse } from '../types.js';
import { RelevanceRanker } from '@skillkit/core';

export function trendingRoutes(skills: ApiSkill[]) {
  const app = new Hono();
  const ranker = new RelevanceRanker();

  app.get('/trending', (c) => {
    const parsedLimit = parseInt(c.req.query('limit') || '20', 10);
    const limit = Math.min(Number.isNaN(parsedLimit) ? 20 : parsedLimit, 100);

    const skillMap = new Map(skills.map((s) => [`${s.source}:${s.name}`, s]));

    const ranked = ranker.rank(
      skills.map((s) => ({
        name: s.name,
        description: s.description,
        content: s.content,
        stars: s.stars,
        installs: s.installs,
        references: [],
        source: s.source,
      })),
    );

    const results = ranked.slice(0, limit).map((r) => {
      const key = `${(r.skill as Record<string, unknown>).source}:${r.skill.name}`;
      const original = skillMap.get(key) ?? skills.find((s) => s.name === r.skill.name)!;
      const { content: _, ...rest } = original;
      return rest;
    });

    const response: TrendingResponse = { skills: results, limit };
    return c.json(response);
  });

  return app;
}
