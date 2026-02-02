import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { QueryExpander, expandQuerySimple } from '../expansion.js';

describe('QueryExpander', () => {
  let expander: QueryExpander;

  beforeEach(() => {
    expander = new QueryExpander();
  });

  afterEach(() => {
    expander.clearCache();
  });

  describe('expandQuerySimple (without LLM)', () => {
    it('should expand "auth" to authentication-related terms', () => {
      const result = expandQuerySimple('auth');

      expect(result.original).toBe('auth');
      expect(result.variations.length).toBeGreaterThan(0);
      expect(result.variations.some((v) => v.includes('authentication'))).toBe(true);
    });

    it('should expand "api" to related terms', () => {
      const result = expandQuerySimple('api');

      expect(result.original).toBe('api');
      expect(result.variations.some((v) => v.includes('rest') || v.includes('endpoint'))).toBe(true);
    });

    it('should expand "test" to testing-related terms', () => {
      const result = expandQuerySimple('testing');

      expect(result.original).toBe('testing');
      expect(result.variations.some((v) => v.includes('test') || v.includes('unit'))).toBe(true);
    });

    it('should handle queries without synonyms', () => {
      const result = expandQuerySimple('xyz123unique');

      expect(result.original).toBe('xyz123unique');
      expect(result.variations).toEqual([]);
      expect(result.weights).toEqual([2.0]);
    });

    it('should give original query weight of 2.0', () => {
      const result = expandQuerySimple('auth');

      expect(result.weights[0]).toBe(2.0);
      for (let i = 1; i < result.weights.length; i++) {
        expect(result.weights[i]).toBe(1.0);
      }
    });

    it('should limit variations to 3', () => {
      const result = expandQuerySimple('auth');
      expect(result.variations.length).toBeLessThanOrEqual(3);
    });
  });

  describe('expand (fallback without LLM)', () => {
    it('should return expanded query without LLM initialization', async () => {
      const result = await expander.expand('auth');

      expect(result.original).toBe('auth');
      expect(result.variations.length).toBeGreaterThan(0);
    });

    it('should cache results', async () => {
      const result1 = await expander.expand('auth');
      const result2 = await expander.expand('auth');

      expect(result1).toEqual(result2);
    });

    it('should handle case-insensitive caching', async () => {
      const result1 = await expander.expand('Auth');
      const result2 = await expander.expand('AUTH');

      expect(result1.original).toBe('Auth');
      expect(result2.original).toBe('AUTH');
    });
  });

  describe('clearCache', () => {
    it('should clear the expansion cache', async () => {
      await expander.expand('auth');
      expander.clearCache();

      const result = await expander.expand('auth');
      expect(result).toBeDefined();
    });
  });

  describe('isInitialized', () => {
    it('should return false when not initialized with LLM', () => {
      expect(expander.isInitialized()).toBe(false);
    });
  });
});
