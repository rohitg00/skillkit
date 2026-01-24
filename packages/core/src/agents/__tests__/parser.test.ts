/**
 * Agent Parser Tests
 */

import { describe, it, expect } from 'vitest';
import {
  extractAgentFrontmatter,
  extractAgentContent,
  toCanonicalAgent,
  fromCanonicalAgent,
  validateAgent,
} from '../parser.js';
import type { CustomAgent, CanonicalAgent, AgentFrontmatter } from '../types.js';

describe('Agent Parser', () => {
  describe('extractAgentFrontmatter', () => {
    it('should extract valid YAML frontmatter', () => {
      const content = `---
name: test-agent
description: A test agent
model: opus
---

Agent content here.`;

      const frontmatter = extractAgentFrontmatter(content);
      expect(frontmatter).not.toBeNull();
      expect(frontmatter?.name).toBe('test-agent');
      expect(frontmatter?.description).toBe('A test agent');
      expect(frontmatter?.model).toBe('opus');
    });

    it('should return null for content without frontmatter', () => {
      const content = 'Just some content without frontmatter.';
      const frontmatter = extractAgentFrontmatter(content);
      expect(frontmatter).toBeNull();
    });

    it('should return null for invalid YAML', () => {
      const content = `---
name: test-agent
invalid: yaml: structure: [broken
---

Content here.`;

      const frontmatter = extractAgentFrontmatter(content);
      expect(frontmatter).toBeNull();
    });

    it('should extract complex frontmatter with arrays', () => {
      const content = `---
name: security-reviewer
description: Reviews code for security issues
disallowedTools:
  - Bash
  - Write
skills:
  - code-review
  - security
---

Content here.`;

      const frontmatter = extractAgentFrontmatter(content);
      expect(frontmatter?.name).toBe('security-reviewer');
      expect(frontmatter?.disallowedTools).toEqual(['Bash', 'Write']);
      expect(frontmatter?.skills).toEqual(['code-review', 'security']);
    });
  });

  describe('extractAgentContent', () => {
    it('should extract content after frontmatter', () => {
      const content = `---
name: test-agent
description: A test agent
---

# Agent Instructions

This is the main content.`;

      const extracted = extractAgentContent(content);
      expect(extracted).toBe('# Agent Instructions\n\nThis is the main content.');
    });

    it('should return full content if no frontmatter', () => {
      const content = 'Just content without frontmatter.';
      const extracted = extractAgentContent(content);
      expect(extracted).toBe('Just content without frontmatter.');
    });

    it('should handle empty content after frontmatter', () => {
      const content = `---
name: test-agent
description: Empty agent
---`;

      const extracted = extractAgentContent(content);
      expect(extracted).toBe('');
    });
  });

  describe('toCanonicalAgent', () => {
    it('should convert CustomAgent to CanonicalAgent', () => {
      const agent: CustomAgent = {
        name: 'test-agent',
        description: 'A test agent',
        path: '/path/to/agent.md',
        location: 'project',
        frontmatter: {
          name: 'test-agent',
          description: 'A test agent',
          model: 'opus',
          permissionMode: 'default',
          disallowedTools: ['Bash'],
          skills: ['testing'],
        } as AgentFrontmatter,
        content: 'Agent instructions here.',
        enabled: true,
      };

      const canonical = toCanonicalAgent(agent);

      expect(canonical.name).toBe('test-agent');
      expect(canonical.description).toBe('A test agent');
      expect(canonical.model).toBe('opus');
      expect(canonical.permissionMode).toBe('default');
      expect(canonical.disallowedTools).toEqual(['Bash']);
      expect(canonical.skills).toEqual(['testing']);
      expect(canonical.content).toBe('Agent instructions here.');
      expect(canonical.sourceFormat).toBe('claude-agent');
    });

    it('should handle string allowedTools', () => {
      const agent: CustomAgent = {
        name: 'test-agent',
        description: 'Test',
        path: '/path',
        location: 'project',
        frontmatter: {
          name: 'test-agent',
          description: 'Test',
          allowedTools: 'Read, Glob, Grep',
        } as unknown as AgentFrontmatter,
        content: 'Content',
        enabled: true,
      };

      const canonical = toCanonicalAgent(agent);
      expect(canonical.allowedTools).toEqual(['Read', 'Glob', 'Grep']);
    });
  });

  describe('fromCanonicalAgent', () => {
    it('should generate markdown from CanonicalAgent', () => {
      const canonical: CanonicalAgent = {
        name: 'test-agent',
        description: 'A test agent',
        model: 'opus',
        content: '# Test Agent\n\nInstructions here.',
        sourceFormat: 'claude-agent',
      };

      const markdown = fromCanonicalAgent(canonical);

      expect(markdown).toContain('---');
      expect(markdown).toContain('name: test-agent');
      expect(markdown).toContain('description: A test agent');
      expect(markdown).toContain('model: opus');
      expect(markdown).toContain('# Test Agent');
    });

    it('should include optional fields when present', () => {
      const canonical: CanonicalAgent = {
        name: 'security-agent',
        description: 'Security reviewer',
        permissionMode: 'plan',
        disallowedTools: ['Bash', 'Write'],
        allowedTools: ['Read', 'Glob'],
        skills: ['security', 'review'],
        tags: ['security', 'code-review'],
        version: '1.0.0',
        author: 'test',
        content: 'Content here.',
        sourceFormat: 'claude-agent',
      };

      const markdown = fromCanonicalAgent(canonical);

      expect(markdown).toContain('permissionMode: plan');
      expect(markdown).toContain('disallowedTools:');
      expect(markdown).toContain('  - Bash');
      expect(markdown).toContain('allowed-tools:');
      expect(markdown).toContain('skills:');
      expect(markdown).toContain('tags: [security, code-review]');
      expect(markdown).toContain('version: "1.0.0"');
      expect(markdown).toContain('author: test');
    });
  });
});
