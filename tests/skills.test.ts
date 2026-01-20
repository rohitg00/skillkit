import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';
import {
  discoverSkills,
  parseSkill,
  extractFrontmatter,
  extractField,
  validateSkill,
  isPathInside,
} from '../src/core/skills.js';

describe('skills', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = join(tmpdir(), `skillkit-test-${randomUUID()}`);
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('extractFrontmatter', () => {
    it('should extract valid YAML frontmatter', () => {
      const content = `---
name: test-skill
description: A test skill
---
# Content`;

      const frontmatter = extractFrontmatter(content);
      expect(frontmatter).toEqual({
        name: 'test-skill',
        description: 'A test skill',
      });
    });

    it('should return null for missing frontmatter', () => {
      const content = '# No frontmatter';
      expect(extractFrontmatter(content)).toBeNull();
    });

    it('should handle multiline descriptions', () => {
      const content = `---
name: test-skill
description: |
  A multiline
  description
---
# Content`;

      const frontmatter = extractFrontmatter(content);
      expect(frontmatter?.description).toContain('multiline');
    });
  });

  describe('extractField', () => {
    it('should extract specific field', () => {
      const content = `---
name: test-skill
description: A test
---`;

      expect(extractField(content, 'name')).toBe('test-skill');
      expect(extractField(content, 'description')).toBe('A test');
    });

    it('should return null for missing field', () => {
      const content = `---
name: test-skill
---`;

      expect(extractField(content, 'description')).toBeNull();
    });
  });

  describe('discoverSkills', () => {
    it('should discover skills with SKILL.md', () => {
      // Create test skill
      const skillDir = join(testDir, 'test-skill');
      mkdirSync(skillDir);
      writeFileSync(
        join(skillDir, 'SKILL.md'),
        `---
name: test-skill
description: A test skill for testing purposes
---
# Test Skill`
      );

      const skills = discoverSkills(testDir);
      expect(skills).toHaveLength(1);
      expect(skills[0].name).toBe('test-skill');
    });

    it('should skip directories without SKILL.md', () => {
      const noSkillDir = join(testDir, 'not-a-skill');
      mkdirSync(noSkillDir);
      writeFileSync(join(noSkillDir, 'README.md'), '# Not a skill');

      const skills = discoverSkills(testDir);
      expect(skills).toHaveLength(0);
    });

    it('should return empty array for non-existent directory', () => {
      const skills = discoverSkills('/nonexistent/path');
      expect(skills).toHaveLength(0);
    });
  });

  describe('parseSkill', () => {
    it('should parse a valid skill', () => {
      const skillDir = join(testDir, 'valid-skill');
      mkdirSync(skillDir);
      writeFileSync(
        join(skillDir, 'SKILL.md'),
        `---
name: valid-skill
description: A valid skill with proper frontmatter
---
# Valid Skill`
      );

      const skill = parseSkill(skillDir);
      expect(skill).not.toBeNull();
      expect(skill?.name).toBe('valid-skill');
      expect(skill?.description).toBe('A valid skill with proper frontmatter');
    });

    it('should return null for missing SKILL.md', () => {
      const emptyDir = join(testDir, 'empty');
      mkdirSync(emptyDir);

      expect(parseSkill(emptyDir)).toBeNull();
    });
  });

  describe('validateSkill', () => {
    it('should validate a proper skill', () => {
      const skillDir = join(testDir, 'valid');
      mkdirSync(skillDir);
      writeFileSync(
        join(skillDir, 'SKILL.md'),
        `---
name: valid
description: A valid skill with proper frontmatter that is long enough
---
# Content`
      );

      const result = validateSkill(skillDir);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail for missing SKILL.md', () => {
      const emptyDir = join(testDir, 'empty');
      mkdirSync(emptyDir);

      const result = validateSkill(emptyDir);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing SKILL.md file');
    });

    it('should fail for missing frontmatter', () => {
      const skillDir = join(testDir, 'no-fm');
      mkdirSync(skillDir);
      writeFileSync(join(skillDir, 'SKILL.md'), '# No frontmatter');

      const result = validateSkill(skillDir);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing YAML frontmatter in SKILL.md');
    });

    it('should warn when name does not match directory', () => {
      const skillDir = join(testDir, 'my-dir');
      mkdirSync(skillDir);
      writeFileSync(
        join(skillDir, 'SKILL.md'),
        `---
name: different-name
description: A skill with mismatched name that is long enough for validation
---
# Content`
      );

      const result = validateSkill(skillDir);
      expect(result.valid).toBe(true);
      expect(result.warnings).toBeDefined();
      expect(result.warnings?.some(w => w.includes('does not match directory'))).toBe(true);
    });

    it('should warn for short descriptions', () => {
      const skillDir = join(testDir, 'short-desc');
      mkdirSync(skillDir);
      writeFileSync(
        join(skillDir, 'SKILL.md'),
        `---
name: short-desc
description: Too short
---
# Content`
      );

      const result = validateSkill(skillDir);
      expect(result.valid).toBe(true);
      expect(result.warnings?.some(w => w.includes('description is short'))).toBe(true);
    });
  });

  describe('Agent Skills spec frontmatter', () => {
    it('should accept license field', () => {
      const skillDir = join(testDir, 'with-license');
      mkdirSync(skillDir);
      writeFileSync(
        join(skillDir, 'SKILL.md'),
        `---
name: with-license
description: A skill with license field that meets minimum length requirement
license: MIT
---
# Content`
      );

      const result = validateSkill(skillDir);
      expect(result.valid).toBe(true);
    });

    it('should accept compatibility field', () => {
      const skillDir = join(testDir, 'with-compat');
      mkdirSync(skillDir);
      writeFileSync(
        join(skillDir, 'SKILL.md'),
        `---
name: with-compat
description: A skill with compatibility field that meets minimum length requirement
compatibility: Requires Node.js 18+
---
# Content`
      );

      const result = validateSkill(skillDir);
      expect(result.valid).toBe(true);
    });

    it('should accept metadata field', () => {
      const skillDir = join(testDir, 'with-meta');
      mkdirSync(skillDir);
      writeFileSync(
        join(skillDir, 'SKILL.md'),
        `---
name: with-meta
description: A skill with metadata field that meets minimum length requirement
metadata:
  author: test-org
  version: "1.0"
---
# Content`
      );

      const result = validateSkill(skillDir);
      expect(result.valid).toBe(true);

      const frontmatter = extractFrontmatter(`---
name: with-meta
description: A skill
metadata:
  author: test-org
  version: "1.0"
---`);
      expect(frontmatter?.metadata).toEqual({ author: 'test-org', version: '1.0' });
    });

    it('should accept allowed-tools field', () => {
      const skillDir = join(testDir, 'with-tools');
      mkdirSync(skillDir);
      writeFileSync(
        join(skillDir, 'SKILL.md'),
        `---
name: with-tools
description: A skill with allowed-tools field that meets minimum length requirement
allowed-tools: Bash(git:*) Read Write
---
# Content`
      );

      const result = validateSkill(skillDir);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid skill names', () => {
      const skillDir = join(testDir, 'InvalidName');
      mkdirSync(skillDir);
      writeFileSync(
        join(skillDir, 'SKILL.md'),
        `---
name: InvalidName
description: A skill with invalid name format
---
# Content`
      );

      const result = validateSkill(skillDir);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('lowercase'))).toBe(true);
    });
  });

  describe('isPathInside', () => {
    it('should return true for child paths', () => {
      expect(isPathInside('/parent/child', '/parent')).toBe(true);
      expect(isPathInside('/parent/child/grandchild', '/parent')).toBe(true);
    });

    it('should return false for path traversal', () => {
      expect(isPathInside('/parent/../outside', '/parent')).toBe(false);
      expect(isPathInside('/parent/child/../../outside', '/parent')).toBe(false);
    });
  });
});
