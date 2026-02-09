import { describe, it, expect } from 'vitest';
import { getAllAdapters, getAdapter, detectAgent } from '../index.js';
import { AGENT_CONFIG, AgentType } from '@skillkit/core';

const NEW_AGENTS = [
  'devin',
  'aider',
  'sourcegraph-cody',
  'amazon-q',
  'augment-code',
  'replit-agent',
  'bolt',
  'lovable',
  'tabby',
  'tabnine',
  'codegpt',
  'playcode-agent',
] as const;

const ALL_AGENTS = AgentType.options;

describe('Agent Adapters', () => {
  describe('getAllAdapters', () => {
    it('should return all 44 registered adapters', () => {
      const adapters = getAllAdapters();
      expect(adapters).toBeInstanceOf(Array);
      expect(adapters.length).toBe(44);
    });

    it('should include common agents', () => {
      const adapters = getAllAdapters();
      const types = adapters.map(a => a.type);

      expect(types).toContain('claude-code');
      expect(types).toContain('cursor');
    });

    it('should have an adapter for every AgentType', () => {
      const adapters = getAllAdapters();
      const types = new Set(adapters.map(a => a.type));

      for (const agent of ALL_AGENTS) {
        expect(types.has(agent)).toBe(true);
      }
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

    it.each(NEW_AGENTS)('should return adapter for new agent: %s', (agent) => {
      const adapter = getAdapter(agent);
      expect(adapter).toBeDefined();
    });
  });

  describe('AGENT_CONFIG completeness', () => {
    it('should have config for every AgentType', () => {
      for (const agent of ALL_AGENTS) {
        const config = AGENT_CONFIG[agent];
        expect(config).toBeDefined();
        expect(config.skillsDir).toBeTruthy();
        expect(config.configFile).toBeTruthy();
        expect(config.configFormat).toBeTruthy();
      }
    });

    it.each(NEW_AGENTS)('should have valid config for new agent: %s', (agent) => {
      const config = AGENT_CONFIG[agent];
      expect(config).toBeDefined();
      expect(config.skillsDir).toMatch(/^\./);
      expect(config.configFile).toBe('AGENTS.md');
      expect(config.configFormat).toBe('markdown');
      expect(config.supportsAutoDiscovery).toBe(true);
    });
  });

  describe('detectAgent', () => {
    it('should return an agent type', async () => {
      const agent = await detectAgent();
      expect(typeof agent).toBe('string');
    });
  });
});
