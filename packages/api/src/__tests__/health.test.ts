import { describe, it, expect } from 'vitest';
import { createApp } from '../server.js';

describe('Health Routes', () => {
  const { app } = createApp({ skills: [{ name: 'test', source: 'a/b' }], rateLimitMax: 1000 });

  it('GET /health returns status ok', async () => {
    const res = await app.request('/health');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('ok');
    expect(body.skillCount).toBe(1);
    expect(typeof body.uptime).toBe('number');
    expect(body.version).toBeDefined();
  });

  it('GET /cache/stats returns cache statistics', async () => {
    const res = await app.request('/cache/stats');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(typeof body.hits).toBe('number');
    expect(typeof body.misses).toBe('number');
    expect(typeof body.size).toBe('number');
    expect(typeof body.maxSize).toBe('number');
    expect(typeof body.hitRate).toBe('number');
  });
});
