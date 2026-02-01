/**
 * Skill to Subagent Converter Tests
 */

import { describe, it, expect } from 'vitest';
import {
  skillToSubagent,
  generateSubagentFromSkill,
} from '../skill-converter.js';
import type { Skill } from '../../types.js';

describe('Skill Converter', () => {
  const mockSkill: Skill = {
    name: 'code-simplifier',
    description: 'Simplifies and refines code for clarity and maintainability',
    path: '/path/to/skills/code-simplifier',
    location: 'project',
    enabled: true,
  };

  const mockSkillContent = `---
name: code-simplifier
description: Simplifies and refines code for clarity and maintainability
version: "1.0.0"
author: skillkit
tags: [refactoring, code-quality]
allowed-tools: Edit, Read, Grep
---

# Code Simplifier

You are an expert at simplifying code.

## Guidelines

- Remove unnecessary complexity
- Improve readability
- Preserve functionality
`;

  describe('skillToSubagent', () => {
    it('should convert skill to canonical agent in reference mode', () => {
      const result = skillToSubagent(mockSkill, mockSkillContent);

      expect(result.name).toBe('code-simplifier');
      expect(result.description).toBe('Simplifies and refines code for clarity and maintainability');
      expect(result.skills).toEqual(['code-simplifier']);
      expect(result.sourceFormat).toBe('claude-agent');
      expect(result.userInvocable).toBe(true);
    });

    it('should not include skills array in inline mode', () => {
      const result = skillToSubagent(mockSkill, mockSkillContent, { inline: true });

      expect(result.name).toBe('code-simplifier');
      expect(result.skills).toBeUndefined();
      expect(result.content).toContain('Code Simplifier');
      expect(result.content).toContain('Remove unnecessary complexity');
    });

    it('should parse allowed-tools from skill frontmatter', () => {
      const result = skillToSubagent(mockSkill, mockSkillContent);

      expect(result.allowedTools).toEqual(['Edit', 'Read', 'Grep']);
    });

    it('should use option tools over frontmatter tools', () => {
      const result = skillToSubagent(mockSkill, mockSkillContent, {
        tools: ['Bash', 'Write'],
      });

      expect(result.allowedTools).toEqual(['Bash', 'Write']);
    });

    it('should set model from options', () => {
      const result = skillToSubagent(mockSkill, mockSkillContent, {
        model: 'opus',
      });

      expect(result.model).toBe('opus');
    });

    it('should not set model when inherit is specified', () => {
      const result = skillToSubagent(mockSkill, mockSkillContent, {
        model: 'inherit',
      });

      expect(result.model).toBeUndefined();
    });

    it('should set permission mode from options', () => {
      const result = skillToSubagent(mockSkill, mockSkillContent, {
        permissionMode: 'plan',
      });

      expect(result.permissionMode).toBe('plan');
    });

    it('should set disallowed tools from options', () => {
      const result = skillToSubagent(mockSkill, mockSkillContent, {
        disallowedTools: ['Bash', 'Write'],
      });

      expect(result.disallowedTools).toEqual(['Bash', 'Write']);
    });

    it('should preserve version and author from frontmatter', () => {
      const result = skillToSubagent(mockSkill, mockSkillContent);

      expect(result.version).toBe('1.0.0');
      expect(result.author).toBe('skillkit');
    });

    it('should preserve tags from frontmatter', () => {
      const result = skillToSubagent(mockSkill, mockSkillContent);

      expect(result.tags).toEqual(['refactoring', 'code-quality']);
    });
  });

  describe('generateSubagentFromSkill', () => {
    it('should generate valid markdown with frontmatter in reference mode', () => {
      const content = generateSubagentFromSkill(mockSkill, mockSkillContent);

      expect(content).toContain('---');
      expect(content).toContain('name: code-simplifier');
      expect(content).toContain('description: Simplifies and refines code');
      expect(content).toContain('skills:');
      expect(content).toContain('  - code-simplifier');
      expect(content).toContain('user-invocable: true');
    });

    it('should generate valid markdown in inline mode', () => {
      const content = generateSubagentFromSkill(mockSkill, mockSkillContent, { inline: true });

      expect(content).toContain('---');
      expect(content).toContain('name: code-simplifier');
      expect(content).not.toContain('skills:');
      expect(content).toContain('# Code Simplifier');
      expect(content).toContain('Remove unnecessary complexity');
    });

    it('should include tools in frontmatter', () => {
      const content = generateSubagentFromSkill(mockSkill, mockSkillContent);

      expect(content).toContain('tools:');
      expect(content).toContain('  - Edit');
      expect(content).toContain('  - Read');
      expect(content).toContain('  - Grep');
    });

    it('should include model in frontmatter when specified', () => {
      const content = generateSubagentFromSkill(mockSkill, mockSkillContent, {
        model: 'opus',
      });

      expect(content).toContain('model: opus');
    });

    it('should include permission mode in frontmatter when specified', () => {
      const content = generateSubagentFromSkill(mockSkill, mockSkillContent, {
        permissionMode: 'plan',
      });

      expect(content).toContain('permissionMode: plan');
    });

    it('should include disallowed tools in frontmatter when specified', () => {
      const content = generateSubagentFromSkill(mockSkill, mockSkillContent, {
        disallowedTools: ['Bash'],
      });

      expect(content).toContain('disallowedTools:');
      expect(content).toContain('  - Bash');
    });

    it('should include version and author in frontmatter', () => {
      const content = generateSubagentFromSkill(mockSkill, mockSkillContent);

      expect(content).toContain('version: "1.0.0"');
      expect(content).toContain('author: skillkit');
    });

    it('should include tags in frontmatter', () => {
      const content = generateSubagentFromSkill(mockSkill, mockSkillContent);

      expect(content).toContain('tags: [refactoring, code-quality]');
    });

    it('should generate reference content with skill description', () => {
      const content = generateSubagentFromSkill(mockSkill, mockSkillContent);

      expect(content).toContain('# Code Simplifier');
      expect(content).toContain('uses the "code-simplifier" skill');
      expect(content).toContain('## Skill Description');
      expect(content).toContain('Simplifies and refines code');
    });

    it('should embed full skill content in inline mode', () => {
      const content = generateSubagentFromSkill(mockSkill, mockSkillContent, { inline: true });

      expect(content).toContain('You are a specialized assistant');
      expect(content).toContain('Remove unnecessary complexity');
      expect(content).toContain('Improve readability');
      expect(content).toContain('Preserve functionality');
    });
  });

  describe('edge cases', () => {
    it('should handle skill without frontmatter', () => {
      const noFrontmatterContent = `# Simple Skill

Just some content without frontmatter.
`;

      const result = skillToSubagent(mockSkill, noFrontmatterContent);

      expect(result.name).toBe('code-simplifier');
      expect(result.description).toBe('Simplifies and refines code for clarity and maintainability');
      expect(result.allowedTools).toBeUndefined();
    });

    it('should handle skill with empty allowed-tools', () => {
      const contentWithEmptyTools = `---
name: test-skill
description: Test
allowed-tools:
---

Content here.
`;

      const skill: Skill = {
        name: 'test-skill',
        description: 'Test',
        path: '/path/to/test-skill',
        location: 'project',
        enabled: true,
      };

      const result = skillToSubagent(skill, contentWithEmptyTools);

      expect(result.allowedTools).toBeUndefined();
    });

    it('should handle skill name with multiple hyphens', () => {
      const skill: Skill = {
        name: 'my-complex-skill-name',
        description: 'A complex skill',
        path: '/path/to/skill',
        location: 'project',
        enabled: true,
      };

      const content = generateSubagentFromSkill(skill, `---
name: my-complex-skill-name
description: A complex skill
---

Content.
`);

      expect(content).toContain('# My Complex Skill Name');
    });

    it('should handle space-separated allowed-tools format', () => {
      const contentWithSpaceSeparated = `---
name: test-skill
description: Test
allowed-tools: Bash(git:*) Read Write Edit
---

Content here.
`;

      const skill: Skill = {
        name: 'test-skill',
        description: 'Test',
        path: '/path/to/test-skill',
        location: 'project',
        enabled: true,
      };

      const result = skillToSubagent(skill, contentWithSpaceSeparated);

      expect(result.allowedTools).toEqual(['Bash(git:*)', 'Read', 'Write', 'Edit']);
    });

    it('should handle YAML array format for allowed-tools', () => {
      const contentWithArrayTools = `---
name: test-skill
description: Test
allowed-tools:
  - Read
  - Write
  - Bash(npm:*)
---

Content here.
`;

      const skill: Skill = {
        name: 'test-skill',
        description: 'Test',
        path: '/path/to/test-skill',
        location: 'project',
        enabled: true,
      };

      const result = skillToSubagent(skill, contentWithArrayTools);

      expect(result.allowedTools).toEqual(['Read', 'Write', 'Bash(npm:*)']);
    });

    it('should handle CRLF line endings', () => {
      const crlfContent = `---\r\nname: test-skill\r\ndescription: Test\r\n---\r\n\r\n# Content\r\n\r\nWith CRLF endings.\r\n`;

      const skill: Skill = {
        name: 'test-skill',
        description: 'Test',
        path: '/path/to/test-skill',
        location: 'project',
        enabled: true,
      };

      const result = skillToSubagent(skill, crlfContent, { inline: true });

      expect(result.content).toContain('# Content');
      expect(result.content).toContain('With CRLF endings.');
    });
  });
});
