import { Hono } from 'hono';
import type { ApiSkill } from '../types.js';

export function skillRoutes(skills: ApiSkill[]) {
  const app = new Hono();

  app.get('/skills/:owner/:repo/:id', (c) => {
    const source = `${c.req.param('owner')}/${c.req.param('repo')}`;
    const id = c.req.param('id');

    const skill = skills.find(
      (s) => s.source === source && s.name === id,
    );

    if (!skill) {
      return c.json({ error: `Skill not found: ${source}/${id}` }, 404);
    }

    return c.json(skill);
  });

  return app;
}
