/**
 * Agent Translator Tests
 */

import { describe, it, expect } from 'vitest';
import {
  translateAgent,
  translateCanonicalAgent,
  getAgentFilename,
  getAgentTargetDirectory,
  isAgentCompatible,
} from '../translator.js';
import type { CustomAgent, CanonicalAgent, AgentFrontmatter } from '../types.js';

describe('Agent Translator', () => {
  describe('translateAgent', () => {
    it('should translate agent to claude-code format', () => {
      const agent: CustomAgent = {
        name: 'test-agent',
        description: 'A test agent',
        path: '/path/to/agent.md',
        location: 'project',
        frontmatter: {
          name: 'test-agent',
          description: 'A test agent',
          model: 'opus',
        } as AgentFrontmatter,
        content: 'Agent instructions here.',
        enabled: true,
      };

      const result = translateAgent(agent, 'claude-code');

      expect(result.success).toBe(true);
      expect(result.targetAgent).toBe('claude-code');
      expect(result.targetFormat).toBe('claude-agent');
      expect(result.content).toContain('name: test-agent');
      expect(result.content).toContain('model: opus');
    });

    it('should translate agent to cursor format', () => {
      const agent: CustomAgent = {
        name: 'reviewer',
        description: 'Code reviewer',
        path: '/path/to/agent.md',
        location: 'project',
        frontmatter: {
          name: 'reviewer',
          description: 'Code reviewer',
        } as AgentFrontmatter,
        content: 'Review code carefully.',
        enabled: true,
      };

      const result = translateAgent(agent, 'cursor');

      expect(result.success).toBe(true);
      expect(result.targetAgent).toBe('cursor');
      expect(result.targetFormat).toBe('cursor-agent');
      expect(result.filename).toBe('reviewer.md');
    });

    it('should add warnings for hooks in cursor format', () => {
      const agent: CustomAgent = {
        name: 'hooked-agent',
        description: 'Agent with hooks',
        path: '/path/to/agent.md',
        location: 'project',
        frontmatter: {
          name: 'hooked-agent',
          description: 'Agent with hooks',
          hooks: [
            { type: 'PreToolUse', command: 'echo test' },
          ],
        } as AgentFrontmatter,
        content: 'Content here.',
        enabled: true,
      };

      const result = translateAgent(agent, 'cursor');

      expect(result.success).toBe(true);
      expect(result.warnings).toContain('Hooks may require manual adjustment for Cursor');
    });

    it('should add incompatible features for universal format', () => {
      const agent: CustomAgent = {
        name: 'complex-agent',
        description: 'Complex agent',
        path: '/path/to/agent.md',
        location: 'project',
        frontmatter: {
          name: 'complex-agent',
          description: 'Complex agent',
          permissionMode: 'plan',
          hooks: [
            { type: 'SessionStart', command: 'echo start' },
          ],
        } as AgentFrontmatter,
        content: 'Content here.',
        enabled: true,
      };

      const result = translateAgent(agent, 'universal');

      expect(result.success).toBe(true);
      expect(result.incompatible).toContain('hooks (not supported in universal format)');
      expect(result.incompatible).toContain('permissionMode (not supported in universal format)');
    });
  });

  describe('translateCanonicalAgent', () => {
    it('should translate canonical agent to different formats', () => {
      const canonical: CanonicalAgent = {
        name: 'test-agent',
        description: 'Test agent',
        model: 'sonnet',
        content: 'Agent content.',
        sourceFormat: 'claude-agent',
      };

      const claudeResult = translateCanonicalAgent(canonical, 'claude-code');
      expect(claudeResult.success).toBe(true);
      expect(claudeResult.content).toContain('name: test-agent');

      const cursorResult = translateCanonicalAgent(canonical, 'cursor');
      expect(cursorResult.success).toBe(true);
      expect(cursorResult.content).toContain('name: test-agent');

      const universalResult = translateCanonicalAgent(canonical, 'universal');
      expect(universalResult.success).toBe(true);
      expect(universalResult.content).toContain('name: test-agent');
    });

    it('should include metadata when option is set', () => {
      const canonical: CanonicalAgent = {
        name: 'test-agent',
        description: 'Test agent',
        content: 'Content.',
        sourceFormat: 'claude-agent',
        sourceAgent: 'cursor',
      };

      const result = translateCanonicalAgent(canonical, 'claude-code', { addMetadata: true });

      expect(result.content).toContain('# Translated by SkillKit from cursor');
    });
  });

  describe('getAgentFilename', () => {
    it('should return correct filename for different agents', () => {
      expect(getAgentFilename('test-agent', 'claude-code')).toBe('test-agent.md');
      expect(getAgentFilename('reviewer', 'cursor')).toBe('reviewer.md');
      expect(getAgentFilename('my-agent', 'universal')).toBe('my-agent.md');
    });
  });

  describe('getAgentTargetDirectory', () => {
    it('should return correct target directory', () => {
      const rootDir = '/home/user/project';

      expect(getAgentTargetDirectory(rootDir, 'claude-code')).toBe('/home/user/project/.claude/agents');
      expect(getAgentTargetDirectory(rootDir, 'cursor')).toBe('/home/user/project/.cursor/agents');
      expect(getAgentTargetDirectory(rootDir, 'universal')).toBe('/home/user/project/agents');
    });
  });

  describe('isAgentCompatible', () => {
    it('should return compatible for same format', () => {
      const result = isAgentCompatible('claude-agent', 'claude-agent');
      expect(result.compatible).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it('should return compatible for claude-agent target', () => {
      const result = isAgentCompatible('cursor-agent', 'claude-agent');
      expect(result.compatible).toBe(true);
    });

    it('should add warnings for universal target from claude-agent', () => {
      const result = isAgentCompatible('claude-agent', 'universal');
      expect(result.compatible).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should add warnings for cursor target from claude-agent', () => {
      const result = isAgentCompatible('claude-agent', 'cursor-agent');
      expect(result.compatible).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });
});
