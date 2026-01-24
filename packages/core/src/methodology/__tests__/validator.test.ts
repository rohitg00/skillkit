import { describe, it, expect } from 'vitest';
import {
  validatePackManifest,
  validateSkillContent,
  extractSkillMetadata,
} from '../validator.js';

describe('validatePackManifest', () => {
  it('should validate a valid pack manifest', () => {
    const manifest = {
      name: 'testing',
      version: '1.0.0',
      description: 'Test-driven development methodology pack',
      skills: ['red-green-refactor', 'test-patterns'],
      tags: ['tdd', 'testing'],
      compatibility: ['all'],
    };

    const result = validatePackManifest(manifest);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject manifest with missing name', () => {
    const manifest = {
      version: '1.0.0',
      description: 'Test pack',
      skills: ['skill1'],
    };

    const result = validatePackManifest(manifest);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.code === 'MISSING_NAME')).toBe(true);
  });

  it('should reject manifest with invalid name format', () => {
    const manifest = {
      name: 'Invalid Name',
      version: '1.0.0',
      description: 'Test pack',
      skills: ['skill1'],
    };

    const result = validatePackManifest(manifest);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.code === 'INVALID_NAME')).toBe(true);
  });

  it('should reject manifest with missing version', () => {
    const manifest = {
      name: 'testing',
      description: 'Test pack',
      skills: ['skill1'],
    };

    const result = validatePackManifest(manifest);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.code === 'MISSING_VERSION')).toBe(true);
  });

  it('should reject manifest with invalid version format', () => {
    const manifest = {
      name: 'testing',
      version: 'v1',
      description: 'Test pack',
      skills: ['skill1'],
    };

    const result = validatePackManifest(manifest);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.code === 'INVALID_VERSION')).toBe(true);
  });

  it('should reject manifest with empty skills array', () => {
    const manifest = {
      name: 'testing',
      version: '1.0.0',
      description: 'Test pack',
      skills: [],
    };

    const result = validatePackManifest(manifest);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.code === 'EMPTY_SKILLS')).toBe(true);
  });

  it('should warn about short description', () => {
    const manifest = {
      name: 'testing',
      version: '1.0.0',
      description: 'Short',
      skills: ['skill1'],
    };

    const result = validatePackManifest(manifest);
    expect(result.warnings.some(w => w.code === 'SHORT_DESCRIPTION')).toBe(true);
  });

  it('should warn about missing tags', () => {
    const manifest = {
      name: 'testing',
      version: '1.0.0',
      description: 'A longer description for the pack',
      skills: ['skill1'],
    };

    const result = validatePackManifest(manifest);
    expect(result.warnings.some(w => w.code === 'MISSING_TAGS')).toBe(true);
  });
});

describe('validateSkillContent', () => {
  it('should validate valid skill content', () => {
    const content = `---
name: Test Skill
description: A test skill
version: 1.0.0
triggers:
  - test
---

# Test Skill

## Description

This skill helps with testing. You should always write tests first.

## Instructions

1. Write a failing test
2. Make it pass
3. Refactor
`;

    const result = validateSkillContent(content);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject empty content', () => {
    const result = validateSkillContent('');
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.code === 'EMPTY_CONTENT')).toBe(true);
  });

  it('should reject unclosed frontmatter', () => {
    const content = `---
name: Test Skill
description: A test skill

# Missing closing frontmatter
`;

    const result = validateSkillContent(content);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.code === 'UNCLOSED_FRONTMATTER')).toBe(true);
  });

  it('should warn about missing frontmatter', () => {
    const content = `# Test Skill

This is a skill without frontmatter. You should always follow these instructions.
`;

    const result = validateSkillContent(content);
    expect(result.valid).toBe(true); // Still valid, just a warning
    expect(result.warnings.some(w => w.code === 'NO_FRONTMATTER')).toBe(true);
  });

  it('should warn about missing structure', () => {
    const content = `---
name: Test
---

Just some random text without proper sections. You must follow this.
`;

    const result = validateSkillContent(content);
    expect(result.warnings.some(w => w.code === 'MISSING_STRUCTURE')).toBe(true);
  });
});

describe('extractSkillMetadata', () => {
  it('should extract simple key-value pairs', () => {
    const content = `---
name: Test Skill
version: 1.0.0
difficulty: intermediate
---

# Content
`;

    const metadata = extractSkillMetadata(content);
    expect(metadata.name).toBe('Test Skill');
    expect(metadata.version).toBe('1.0.0');
    expect(metadata.difficulty).toBe('intermediate');
  });

  it('should extract array values', () => {
    const content = `---
name: Test Skill
triggers:
  - tdd
  - test driven
  - write tests
tags:
  - testing
  - quality
---

# Content
`;

    const metadata = extractSkillMetadata(content);
    expect(metadata.triggers).toEqual(['tdd', 'test driven', 'write tests']);
    expect(metadata.tags).toEqual(['testing', 'quality']);
  });

  it('should extract inline arrays', () => {
    const content = `---
name: Test Skill
tags: [testing, quality]
---

# Content
`;

    const metadata = extractSkillMetadata(content);
    expect(metadata.tags).toEqual(['testing', 'quality']);
  });

  it('should extract numeric values', () => {
    const content = `---
name: Test Skill
estimatedTime: 15
---

# Content
`;

    const metadata = extractSkillMetadata(content);
    expect(metadata.estimatedTime).toBe(15);
  });

  it('should extract boolean values', () => {
    const content = `---
name: Test Skill
deprecated: true
active: false
---

# Content
`;

    const metadata = extractSkillMetadata(content);
    expect(metadata.deprecated).toBe(true);
    expect(metadata.active).toBe(false);
  });

  it('should return empty object for content without frontmatter', () => {
    const content = `# Test Skill

No frontmatter here.
`;

    const metadata = extractSkillMetadata(content);
    expect(metadata).toEqual({});
  });
});
