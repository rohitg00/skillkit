import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MemoryCache } from '../memory.js';

describe('MemoryCache', () => {
  let cache: MemoryCache<string>;

  beforeEach(() => {
    cache = new MemoryCache<string>({ maxSize: 3, ttlMs: 1000 });
  });

  it('stores and retrieves values', () => {
    cache.set('a', 'value-a');
    expect(cache.get('a')).toBe('value-a');
  });

  it('returns undefined for missing keys', () => {
    expect(cache.get('missing')).toBeUndefined();
  });

  it('deletes entries', () => {
    cache.set('a', 'value-a');
    expect(cache.delete('a')).toBe(true);
    expect(cache.get('a')).toBeUndefined();
  });

  it('checks existence with has()', () => {
    cache.set('a', 'value-a');
    expect(cache.has('a')).toBe(true);
    expect(cache.has('b')).toBe(false);
  });

  it('clears all entries', () => {
    cache.set('a', '1');
    cache.set('b', '2');
    cache.clear();
    expect(cache.has('a')).toBe(false);
    expect(cache.stats().size).toBe(0);
  });

  it('evicts LRU when at capacity', () => {
    vi.useFakeTimers();
    try {
      cache.set('a', '1');
      vi.advanceTimersByTime(1);
      cache.set('b', '2');
      vi.advanceTimersByTime(1);
      cache.set('c', '3');
      vi.advanceTimersByTime(1);
      cache.get('a');
      vi.advanceTimersByTime(1);
      cache.get('b');
      vi.advanceTimersByTime(1);
      cache.set('d', '4');
      expect(cache.has('c')).toBe(false);
      expect(cache.has('a')).toBe(true);
      expect(cache.has('d')).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it('expires entries after TTL', () => {
    vi.useFakeTimers();
    try {
      cache.set('a', 'value');
      expect(cache.get('a')).toBe('value');
      vi.advanceTimersByTime(1001);
      expect(cache.get('a')).toBeUndefined();
    } finally {
      vi.useRealTimers();
    }
  });

  it('tracks hit/miss stats', () => {
    cache.set('a', '1');
    cache.get('a');
    cache.get('missing');
    const stats = cache.stats();
    expect(stats.hits).toBe(1);
    expect(stats.misses).toBe(1);
    expect(stats.hitRate).toBe(0.5);
    expect(stats.size).toBe(1);
    expect(stats.maxSize).toBe(3);
  });

  it('uses default options', () => {
    const defaultCache = new MemoryCache<string>();
    const stats = defaultCache.stats();
    expect(stats.maxSize).toBe(1000);
  });
});
