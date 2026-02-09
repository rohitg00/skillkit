import { describe, it, expect } from 'vitest';
import { getAllAdapters, getAdapter, detectAgent } from '../index.js';
import { AGENT_CONFIG, AgentType } from '@skillkit/core';

const GENERIC_AGENTS: AgentType[] = [
  'cline',
  'codebuddy',
  'commandcode',
  'continue',
  'crush',
  'mcpjam',
  'mux',
  'neovate',
  'openhands',
  'pi',
  'qoder',
  'qwen',
  'vercel',
  'zencoder',
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
];

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
  });

  describe('GenericAgentAdapter correctness', () => {
    it.each(GENERIC_AGENTS)('%s adapter should have correct type', (agent) => {
      const adapter = getAdapter(agent);
      expect(adapter).toBeDefined();
      expect(adapter.type).toBe(agent);
    });

    it.each(GENERIC_AGENTS)('%s adapter should use AGENT_CONFIG skillsDir', (agent) => {
      const adapter = getAdapter(agent);
      const config = AGENT_CONFIG[agent];
      expect(adapter.skillsDir).toBe(config.skillsDir);
    });

    it.each(GENERIC_AGENTS)('%s adapter should use AGENT_CONFIG configFile', (agent) => {
      const adapter = getAdapter(agent);
      const config = AGENT_CONFIG[agent];
      expect(adapter.configFile).toBe(config.configFile);
    });

    it.each(GENERIC_AGENTS)('%s adapter should not have universal name', (agent) => {
      const adapter = getAdapter(agent);
      expect(adapter.name).not.toBe('Universal (Any Agent)');
    });

    it('devin adapter should have correct skillsDir', () => {
      const adapter = getAdapter('devin');
      expect(adapter.skillsDir).toBe('.devin/skills');
    });

    it('sourcegraph-cody adapter should have correct skillsDir', () => {
      const adapter = getAdapter('sourcegraph-cody');
      expect(adapter.skillsDir).toBe('.cody/skills');
    });

    it('amazon-q adapter should have correct skillsDir', () => {
      const adapter = getAdapter('amazon-q');
      expect(adapter.skillsDir).toBe('.amazonq/skills');
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
  });

  describe('universal adapter stays universal', () => {
    it('should have type universal', () => {
      const adapter = getAdapter('universal');
      expect(adapter.type).toBe('universal');
      expect(adapter.skillsDir).toBe('skills');
      expect(adapter.name).toBe('Universal (Any Agent)');
    });
  });

  describe('detectAgent', () => {
    it('should return an agent type', async () => {
      const agent = await detectAgent();
      expect(typeof agent).toBe('string');
    });
  });
});
