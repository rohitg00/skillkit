import { describe, it, expect } from 'vitest';
import { getAllAdapters, getAdapter, detectAgent } from '../index.js';

describe('Agent Adapters', () => {
  describe('getAllAdapters', () => {
    it('should return all registered adapters', () => {
      const adapters = getAllAdapters();
      expect(adapters).toBeInstanceOf(Array);
      expect(adapters.length).toBeGreaterThan(0);
    });

    it('should include common agents', () => {
      const adapters = getAllAdapters();
      const types = adapters.map(a => a.type);

      // Should include at least some well-known agents
      expect(types).toContain('claude-code');
      expect(types).toContain('cursor');
    });
  });

  describe('getAdapter', () => {
    it('should return adapter for known agent type', () => {
      const adapter = getAdapter('claude-code');
      expect(adapter).toBeDefined();
      expect(adapter.type).toBe('claude-code');
      expect(adapter.name).toBeDefined();
    });

    it('should return undefined for unknown agent type', () => {
      const adapter = getAdapter('unknown-agent' as any);
      expect(adapter).toBeUndefined();
    });
  });

  describe('detectAgent', () => {
    it('should return an agent type', async () => {
      const agent = await detectAgent();
      expect(typeof agent).toBe('string');
    });
  });
});
