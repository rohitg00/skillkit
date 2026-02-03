import { Hono } from 'hono';
import type { ApiSkill } from '../types.js';

export function skillRoutes(skills: ApiSkill[]) {
  const app = new Hono();

  app.get('/skills/:source/:id', (c) => {
    const source = c.req.param('source');
    const id = c.req.param('id');

    const skill = skills.find(
      (s) => s.source.includes(source) && s.name === id,
    );

    if (!skill) {
      return c.json({ error: `Skill not found: ${source}/${id}` }, 404);
    }

    return c.json(skill);
  });

  return app;
}
