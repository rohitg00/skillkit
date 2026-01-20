import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';
import { validateSkill } from '../src/core/skills.js';

describe('validate command', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = join(tmpdir(), `skillkit-validate-test-${randomUUID()}`);
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('Agent Skills spec validation', () => {
    it('should validate complete Agent Skills spec skill', () => {
      const skillDir = join(testDir, 'complete-skill');
      mkdirSync(skillDir);
      writeFileSync(
        join(skillDir, 'SKILL.md'),
        `---
name: complete-skill
description: A complete skill following the Agent Skills specification format
license: MIT
compatibility: Requires Node.js 18+ and npm
metadata:
  author: test-org
  version: "1.0.0"
  repository: https://github.com/test/skill
allowed-tools: Bash(git:*) Read Write
---
# Complete Skill

This skill demonstrates the full Agent Skills spec format.

## When to Use

- When you need to test validation
- When you want to see all fields

## Instructions

1. Step one
2. Step two
`
      );

      const result = validateSkill(skillDir);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate minimal required fields only', () => {
      const skillDir = join(testDir, 'minimal');
      mkdirSync(skillDir);
      writeFileSync(
        join(skillDir, 'SKILL.md'),
        `---
name: minimal
description: Just the required fields - name and description for Agent Skills
---
# Minimal Skill
`
      );

      const result = validateSkill(skillDir);
      expect(result.valid).toBe(true);
    });

    it('should fail when name is missing', () => {
      const skillDir = join(testDir, 'no-name');
      mkdirSync(skillDir);
      writeFileSync(
        join(skillDir, 'SKILL.md'),
        `---
description: A skill without a name
---
# No Name
`
      );

      const result = validateSkill(skillDir);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('name'))).toBe(true);
    });

    it('should fail when description is missing', () => {
      const skillDir = join(testDir, 'no-desc');
      mkdirSync(skillDir);
      writeFileSync(
        join(skillDir, 'SKILL.md'),
        `---
name: no-desc
---
# No Description
`
      );

      const result = validateSkill(skillDir);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('description'))).toBe(true);
    });

    it('should fail for name with uppercase letters', () => {
      const skillDir = join(testDir, 'upper');
      mkdirSync(skillDir);
      writeFileSync(
        join(skillDir, 'SKILL.md'),
        `---
name: MySkill
description: A skill with uppercase name
---
# Content
`
      );

      const result = validateSkill(skillDir);
      expect(result.valid).toBe(false);
    });

    it('should fail for name with spaces', () => {
      const skillDir = join(testDir, 'spaces');
      mkdirSync(skillDir);
      writeFileSync(
        join(skillDir, 'SKILL.md'),
        `---
name: my skill
description: A skill with spaces in name
---
# Content
`
      );

      const result = validateSkill(skillDir);
      expect(result.valid).toBe(false);
    });

    it('should fail for name with underscores', () => {
      const skillDir = join(testDir, 'underscores');
      mkdirSync(skillDir);
      writeFileSync(
        join(skillDir, 'SKILL.md'),
        `---
name: my_skill
description: A skill with underscores in name
---
# Content
`
      );

      const result = validateSkill(skillDir);
      expect(result.valid).toBe(false);
    });

    it('should pass for name with hyphens', () => {
      const skillDir = join(testDir, 'my-skill');
      mkdirSync(skillDir);
      writeFileSync(
        join(skillDir, 'SKILL.md'),
        `---
name: my-skill
description: A skill with hyphens in name that is long enough for validation
---
# Content
`
      );

      const result = validateSkill(skillDir);
      expect(result.valid).toBe(true);
    });

    it('should reject description over 1024 chars', () => {
      const skillDir = join(testDir, 'long-desc');
      mkdirSync(skillDir);
      const longDesc = 'x'.repeat(1025);
      writeFileSync(
        join(skillDir, 'SKILL.md'),
        `---
name: long-desc
description: ${longDesc}
---
# Content
`
      );

      const result = validateSkill(skillDir);
      expect(result.valid).toBe(false);
    });

    it('should reject name over 64 chars', () => {
      const skillDir = join(testDir, 'long-name');
      mkdirSync(skillDir);
      const longName = 'a'.repeat(65);
      writeFileSync(
        join(skillDir, 'SKILL.md'),
        `---
name: ${longName}
description: A skill with too long name
---
# Content
`
      );

      const result = validateSkill(skillDir);
      expect(result.valid).toBe(false);
    });
  });

  describe('warnings', () => {
    it('should warn for very long SKILL.md content', () => {
      const skillDir = join(testDir, 'long-content');
      mkdirSync(skillDir);
      const longContent = Array(600).fill('Line of content').join('\n');
      writeFileSync(
        join(skillDir, 'SKILL.md'),
        `---
name: long-content
description: A skill with very long content that should trigger a warning
---
${longContent}
`
      );

      const result = validateSkill(skillDir);
      expect(result.valid).toBe(true);
      expect(result.warnings?.some(w => w.includes('lines'))).toBe(true);
    });
  });
});
