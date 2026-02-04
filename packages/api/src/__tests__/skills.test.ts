import { describe, it, expect } from 'vitest';
import { createApp } from '../server.js';

const testSkills = [
  { name: 'my-skill', description: 'A test skill', source: 'owner/repo' },
];

describe('Skill Routes', () => {
  const { app } = createApp({ skills: testSkills, rateLimitMax: 1000 });

  it('GET /skills/:source/:id returns a skill', async () => {
    const res = await app.request('/skills/owner/repo/my-skill');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.name).toBe('my-skill');
    expect(body.source).toBe('owner/repo');
  });

  it('GET /skills/:owner/:repo/:id returns 404 for missing skill', async () => {
    const res = await app.request('/skills/owner/repo/nonexistent');
    expect(res.status).toBe(404);
  });
});

describe('Trending Routes', () => {
  const { app } = createApp({ skills: testSkills, rateLimitMax: 1000 });

  it('GET /trending returns skills', async () => {
    const res = await app.request('/trending');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.skills).toBeInstanceOf(Array);
    expect(body.limit).toBeDefined();
  });
});

describe('Category Routes', () => {
  const skills = [
    { name: 'a', source: 'x/y', tags: ['react', 'ui'] },
    { name: 'b', source: 'x/z', tags: ['react'], category: 'framework' },
  ];
  const { app } = createApp({ skills, rateLimitMax: 1000 });

  it('GET /categories returns tag counts', async () => {
    const res = await app.request('/categories');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.categories).toBeInstanceOf(Array);
    expect(body.total).toBeGreaterThan(0);
    const react = body.categories.find((c: { name: string }) => c.name === 'react');
    expect(react?.count).toBe(2);
  });
});
