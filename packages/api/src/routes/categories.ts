import { Hono } from 'hono';
import type { ApiSkill, CategoriesResponse } from '../types.js';

export function categoryRoutes(skills: ApiSkill[]) {
  const app = new Hono();

  app.get('/categories', (c) => {
    const tagCounts = new Map<string, number>();

    for (const skill of skills) {
      if (skill.tags) {
        for (const tag of skill.tags) {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
        }
      }
      if (skill.category) {
        const key = `category:${skill.category}`;
        tagCounts.set(key, (tagCounts.get(key) || 0) + 1);
      }
    }

    const categories: CategoryCount[] = Array.from(tagCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const response: CategoriesResponse = {
      categories,
      total: categories.length,
    };
    return c.json(response);
  });

  return app;
}
