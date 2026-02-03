import { describe, it, expect } from 'vitest';
import { createApp } from '../server.js';

const testSkills = [
  { name: 'react-perf', description: 'React performance tips', source: 'owner/repo', tags: ['react', 'performance'] },
  { name: 'testing-guide', description: 'Unit testing guide', source: 'owner/repo2', tags: ['testing'] },
  { name: 'nextjs-auth', description: 'Next.js authentication', source: 'other/repo', tags: ['nextjs', 'auth'], category: 'framework' },
];

describe('Search Routes', () => {
  const { app } = createApp({ skills: testSkills, rateLimitMax: 1000 });

  it('GET /search returns results for query', async () => {
    const res = await app.request('/search?q=react');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.query).toBe('react');
    expect(body.skills.length).toBeGreaterThan(0);
    expect(body.total).toBeGreaterThan(0);
  });

  it('GET /search returns 400 without query', async () => {
    const res = await app.request('/search');
    expect(res.status).toBe(400);
  });

  it('GET /search respects limit parameter', async () => {
    const res = await app.request('/search?q=test&limit=1');
    const body = await res.json();
    expect(body.skills.length).toBeLessThanOrEqual(1);
    expect(body.limit).toBe(1);
  });

  it('POST /search with filters', async () => {
    const res = await app.request('/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'auth',
        filters: { tags: ['nextjs'] },
      }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.skills.length).toBeGreaterThan(0);
  });

  it('POST /search returns 400 without query', async () => {
    const res = await app.request('/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
  });
});
