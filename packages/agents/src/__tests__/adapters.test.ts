import { describe, it, expect } from 'vitest';
import { getAllAdapters, getAdapter, detectAgent } from '../index.js';
import { AGENT_CONFIG, AgentType } from '@skillkit/core';

const GENERIC_AGENTS: AgentType[] = [
  'dsh',
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
    it('should return all 47 registered adapters', () => {
      const adapters = getAllAdapters();
      expect(adapters).toBeInstanceOf(Array);
      expect(adapters.length).toBe(47);
    });

    it('should include common agents', () => {
      const adapters = getAllAdapters();
      const types = adapters.map(a => a.type);

      expect(types).toContain('claude-code');
      expect(types).toContain('cursor');
      expect(types).toContain('dsh');
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

    it('dsh adapter should use the native DSH paths and display name', () => {
      const adapter = getAdapter('dsh');
      const config = AGENT_CONFIG.dsh;
      expect(adapter.type).toBe('dsh');
      expect(adapter.name).toBe('DeepSeek Harness');
      expect(adapter.skillsDir).toBe('.dsh/skills');
      expect(adapter.configFile).toBe('AGENTS.md');
      expect(config.globalSkillsDir).toBe('~/.dsh/skills');
      expect(config.configFormat).toBe('xml');
      expect(config.usesFrontmatter).toBe(true);
      expect(config.supportsAutoDiscovery).toBe(true);
    });

    it('dsh adapter should generate and parse the generic skill catalog', () => {
      const adapter = getAdapter('dsh');
      const skills = [
        { name: 'pdf', description: 'PDF tools', enabled: true, path: '', location: 'project' },
        { name: 'xlsx', description: 'Sheet tools', enabled: false, path: '', location: 'project' },
      ];
      const generated = adapter.generateConfig(skills as any);
      expect(generated).toContain('SKILLKIT_SKILLS_START');
      expect(generated).toContain('<name>pdf</name>');
      expect(generated).not.toContain('<name>xlsx</name>');
      expect(adapter.parseConfig(generated)).toEqual(['pdf']);
      expect(adapter.getInvokeCommand('pdf')).toBe('skillkit read pdf');
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

  describe('HermesAdapter', () => {
    it('should generate valid XML config', () => {
      const adapter = getAdapter('hermes');
      const mockSkills = [
        { name: 'test-skill', description: 'Testing', enabled: true, path: '', location: 'project' }
      ];
      const config = adapter.generateConfig(mockSkills as any);
      
      expect(config).toContain('<skills_system');
      expect(config).toContain('<name>test-skill</name>');
      expect(config).toContain('SKILLS_TABLE_START');
    });

    it('should parse skill names from XML correctly within markers', () => {
      const adapter = getAdapter('hermes');
      const xml = `
<!-- SKILLS_TABLE_START -->
<available_skills><skill><name>git-ops</name></skill></available_skills>
<!-- SKILLS_TABLE_END -->`;
      const names = adapter.parseConfig(xml);
      expect(names).toContain('git-ops');
    });

    it('should ignore <name> tags outside of sync markers', () => {
      const adapter = getAdapter('hermes');
      const xml = `
<mission><name>save-the-world</name></mission>
<!-- SKILLS_TABLE_START -->
<available_skills><skill><name>git-ops</name></skill></available_skills>
<!-- SKILLS_TABLE_END -->
<footer_meta><name>internal-id</name></footer_meta>`;
      const names = adapter.parseConfig(xml);
      expect(names).toHaveLength(1);
      expect(names).toContain('git-ops');
      expect(names).not.toContain('save-the-world');
      expect(names).not.toContain('internal-id');
    });
  });
});
