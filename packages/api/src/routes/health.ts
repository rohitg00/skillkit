import { Hono } from 'hono';
import type { HealthResponse, CacheStatsResponse } from '../types.js';
import type { CacheBackend } from '@skillkit/core';

const startTime = Date.now();

export function healthRoutes(skillCount: number, cache: CacheBackend) {
  const app = new Hono();

  app.get('/health', (c) => {
    const response: HealthResponse = {
      status: 'ok',
      version: '1.11.0',
      skillCount,
      uptime: Math.floor((Date.now() - startTime) / 1000),
    };
    return c.json(response);
  });

  app.get('/cache/stats', (c) => {
    const stats = cache.stats();
    const response: CacheStatsResponse = {
      hits: stats.hits,
      misses: stats.misses,
      size: stats.size,
      maxSize: stats.maxSize,
      hitRate: stats.hitRate,
    };
    return c.json(response);
  });

  return app;
}
