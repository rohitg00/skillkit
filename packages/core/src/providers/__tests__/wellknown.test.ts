import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { WellKnownProvider, generateWellKnownIndex, generateWellKnownStructure, calculateBaseSkillsUrl } from '../wellknown.js';
import { existsSync, rmSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';

describe('WellKnownProvider', () => {
  const provider = new WellKnownProvider();

  describe('matches', () => {
    it('should match https URLs not on github/gitlab/bitbucket', () => {
      expect(provider.matches('https://example.com')).toBe(true);
      expect(provider.matches('https://skills.vercel.app')).toBe(true);
      expect(provider.matches('https://my-skills.com/api')).toBe(true);
    });

    it('should not match github.com URLs', () => {
      expect(provider.matches('https://github.com/owner/repo')).toBe(false);
    });

    it('should not match gitlab.com URLs', () => {
      expect(provider.matches('https://gitlab.com/owner/repo')).toBe(false);
    });

    it('should not match bitbucket.org URLs', () => {
      expect(provider.matches('https://bitbucket.org/owner/repo')).toBe(false);
    });

    it('should not match local paths', () => {
      expect(provider.matches('./my-skills')).toBe(false);
      expect(provider.matches('/absolute/path')).toBe(false);
      expect(provider.matches('~/home/skills')).toBe(false);
    });

    it('should not match shorthand GitHub format', () => {
      expect(provider.matches('owner/repo')).toBe(false);
    });
  });

  describe('parseSource', () => {
    it('should parse URL hostname and path', () => {
      const result = provider.parseSource('https://example.com/api');
      expect(result).toEqual({ owner: 'example.com', repo: 'api' });
    });

    it('should handle root URLs', () => {
      const result = provider.parseSource('https://skills.example.com');
      expect(result).toEqual({ owner: 'skills.example.com', repo: 'skills' });
    });

    it('should return null for invalid URLs', () => {
      const result = provider.parseSource('not-a-url');
      expect(result).toBeNull();
    });
  });

  describe('type and name', () => {
    it('should have correct type', () => {
      expect(provider.type).toBe('wellknown');
    });

    it('should have correct name', () => {
      expect(provider.name).toBe('Well-Known');
    });
  });
});

describe('calculateBaseSkillsUrl', () => {
  it('should handle index.json URL correctly', () => {
    const result = calculateBaseSkillsUrl('https://example.com/.well-known/skills/index.json');
    expect(result).toBe('https://example.com/.well-known/skills');
  });

  it('should handle skills.json URL correctly without duplicating .well-known', () => {
    const result = calculateBaseSkillsUrl('https://example.com/.well-known/skills.json');
    expect(result).toBe('https://example.com/.well-known/skills');
  });

  it('should handle nested paths with index.json', () => {
    const result = calculateBaseSkillsUrl('https://cdn.example.com/v1/.well-known/skills/index.json');
    expect(result).toBe('https://cdn.example.com/v1/.well-known/skills');
  });

  it('should handle nested paths with skills.json', () => {
    const result = calculateBaseSkillsUrl('https://cdn.example.com/v1/.well-known/skills.json');
    expect(result).toBe('https://cdn.example.com/v1/.well-known/skills');
  });
});

describe('generateWellKnownIndex', () => {
  it('should generate valid index structure', () => {
    const skills = [
      { name: 'test-skill', description: 'A test skill', files: ['SKILL.md', 'README.md'] },
      { name: 'another-skill', description: 'Another skill', files: ['SKILL.md'] },
    ];

    const index = generateWellKnownIndex(skills);

    expect(index.version).toBe('1.0');
    expect(index.skills).toHaveLength(2);
    expect(index.skills[0]).toEqual({
      name: 'test-skill',
      description: 'A test skill',
      files: ['SKILL.md', 'README.md'],
    });
    expect(index.skills[1]).toEqual({
      name: 'another-skill',
      description: 'Another skill',
      files: ['SKILL.md'],
    });
  });

  it('should handle empty skills array', () => {
    const index = generateWellKnownIndex([]);
    expect(index.version).toBe('1.0');
    expect(index.skills).toEqual([]);
  });
});

describe('generateWellKnownStructure', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = join(tmpdir(), `skillkit-test-${randomUUID()}`);
  });

  afterEach(() => {
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('should create well-known directory structure', () => {
    const skills = [
      {
        name: 'test-skill',
        description: 'A test skill',
        content: '---\nname: test-skill\ndescription: A test skill\n---\n\n# Test Skill\n\nContent here.',
      },
    ];

    const result = generateWellKnownStructure(tempDir, skills);

    expect(existsSync(join(tempDir, '.well-known', 'skills'))).toBe(true);
    expect(existsSync(result.indexPath)).toBe(true);
    expect(result.skillPaths).toContain(join(tempDir, '.well-known', 'skills', 'test-skill', 'SKILL.md'));

    const index = JSON.parse(readFileSync(result.indexPath, 'utf-8'));
    expect(index.skills[0].name).toBe('test-skill');
    expect(index.skills[0].files).toContain('SKILL.md');
  });

  it('should include additional files', () => {
    const skills = [
      {
        name: 'test-skill',
        description: 'Test',
        content: '# Test',
        additionalFiles: {
          'README.md': '# README',
          'config.json': '{"key": "value"}',
        },
      },
    ];

    const result = generateWellKnownStructure(tempDir, skills);

    expect(result.skillPaths).toContain(join(tempDir, '.well-known', 'skills', 'test-skill', 'README.md'));
    expect(result.skillPaths).toContain(join(tempDir, '.well-known', 'skills', 'test-skill', 'config.json'));

    const readme = readFileSync(join(tempDir, '.well-known', 'skills', 'test-skill', 'README.md'), 'utf-8');
    expect(readme).toBe('# README');

    const index = JSON.parse(readFileSync(result.indexPath, 'utf-8'));
    expect(index.skills[0].files).toContain('README.md');
    expect(index.skills[0].files).toContain('config.json');
  });

  it('should handle multiple skills', () => {
    const skills = [
      { name: 'skill-one', description: 'First', content: '# Skill One' },
      { name: 'skill-two', description: 'Second', content: '# Skill Two' },
    ];

    const result = generateWellKnownStructure(tempDir, skills);

    expect(existsSync(join(tempDir, '.well-known', 'skills', 'skill-one', 'SKILL.md'))).toBe(true);
    expect(existsSync(join(tempDir, '.well-known', 'skills', 'skill-two', 'SKILL.md'))).toBe(true);

    const index = JSON.parse(readFileSync(result.indexPath, 'utf-8'));
    expect(index.skills).toHaveLength(2);
  });
});
