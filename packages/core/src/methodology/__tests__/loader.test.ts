import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { MethodologyLoader, createMethodologyLoader } from '../loader.js';

describe('MethodologyLoader', () => {
  let testDir: string;
  let packsDir: string;

  beforeEach(() => {
    // Create temporary directory for tests
    testDir = join(tmpdir(), `skillkit-test-${Date.now()}`);
    packsDir = join(testDir, 'packs');
    mkdirSync(packsDir, { recursive: true });
  });

  afterEach(() => {
    // Clean up
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  function createTestPack(name: string, skills: string[]): void {
    const packDir = join(packsDir, name);
    mkdirSync(packDir, { recursive: true });

    // Create pack.json
    const manifest = {
      name,
      version: '1.0.0',
      description: `Test ${name} pack`,
      skills,
      tags: [name],
      compatibility: ['all'],
    };
    writeFileSync(join(packDir, 'pack.json'), JSON.stringify(manifest, null, 2));

    // Create skill directories and SKILL.md files
    for (const skill of skills) {
      const skillDir = join(packDir, skill);
      mkdirSync(skillDir, { recursive: true });

      const skillContent = `---
name: ${skill}
description: Test skill ${skill}
version: 1.0.0
triggers:
  - ${skill}
tags:
  - test
---

# ${skill}

This is a test skill. You must follow these instructions.

## Instructions

Do the thing.
`;
      writeFileSync(join(skillDir, 'SKILL.md'), skillContent);
    }
  }

  describe('loadAllPacks', () => {
    it('should load all available packs', async () => {
      createTestPack('testing', ['skill1', 'skill2']);
      createTestPack('debugging', ['skill3']);

      const loader = new MethodologyLoader(packsDir);
      const packs = await loader.loadAllPacks();

      expect(packs).toHaveLength(2);
      expect(packs.map(p => p.name).sort()).toEqual(['debugging', 'testing']);
    });

    it('should return empty array when no packs exist', async () => {
      const loader = new MethodologyLoader(packsDir);
      const packs = await loader.loadAllPacks();

      expect(packs).toHaveLength(0);
    });
  });

  describe('loadPack', () => {
    it('should load a specific pack by name', async () => {
      createTestPack('testing', ['skill1', 'skill2']);

      const loader = new MethodologyLoader(packsDir);
      const pack = await loader.loadPack('testing');

      expect(pack).not.toBeNull();
      expect(pack?.name).toBe('testing');
      expect(pack?.skills).toEqual(['skill1', 'skill2']);
    });

    it('should return null for non-existent pack', async () => {
      const loader = new MethodologyLoader(packsDir);
      const pack = await loader.loadPack('nonexistent');

      expect(pack).toBeNull();
    });

    it('should cache loaded packs', async () => {
      createTestPack('testing', ['skill1']);

      const loader = new MethodologyLoader(packsDir);

      const pack1 = await loader.loadPack('testing');
      const pack2 = await loader.loadPack('testing');

      expect(pack1).toBe(pack2);
    });
  });

  describe('loadPackSkills', () => {
    it('should load all skills from a pack', async () => {
      createTestPack('testing', ['skill1', 'skill2']);

      const loader = new MethodologyLoader(packsDir);
      const skills = await loader.loadPackSkills('testing');

      expect(skills).toHaveLength(2);
      expect(skills.map(s => s.id).sort()).toEqual(['testing/skill1', 'testing/skill2']);
    });

    it('should throw error for non-existent pack', async () => {
      const loader = new MethodologyLoader(packsDir);

      await expect(loader.loadPackSkills('nonexistent')).rejects.toThrow();
    });
  });

  describe('loadSkill', () => {
    it('should load a specific skill', async () => {
      createTestPack('testing', ['skill1']);

      const loader = new MethodologyLoader(packsDir);
      const skill = await loader.loadSkill('testing', 'skill1');

      expect(skill).not.toBeNull();
      expect(skill?.id).toBe('testing/skill1');
      expect(skill?.name).toBe('skill1');
      expect(skill?.pack).toBe('testing');
    });

    it('should return null for non-existent skill', async () => {
      createTestPack('testing', ['skill1']);

      const loader = new MethodologyLoader(packsDir);
      const skill = await loader.loadSkill('testing', 'nonexistent');

      expect(skill).toBeNull();
    });

    it('should extract metadata from skill content', async () => {
      createTestPack('testing', ['skill1']);

      const loader = new MethodologyLoader(packsDir);
      const skill = await loader.loadSkill('testing', 'skill1');

      expect(skill?.metadata.triggers).toEqual(['skill1']);
      expect(skill?.tags).toEqual(['test']);
    });
  });

  describe('getSkillById', () => {
    it('should get skill by full ID', async () => {
      createTestPack('testing', ['skill1']);

      const loader = new MethodologyLoader(packsDir);
      const skill = await loader.getSkillById('testing/skill1');

      expect(skill).not.toBeNull();
      expect(skill?.id).toBe('testing/skill1');
    });

    it('should return null for invalid ID format', async () => {
      const loader = new MethodologyLoader(packsDir);
      const skill = await loader.getSkillById('invalid');

      expect(skill).toBeNull();
    });
  });

  describe('searchSkills', () => {
    it('should search skills by name', async () => {
      createTestPack('testing', ['tdd-skill', 'debug-skill']);

      const loader = new MethodologyLoader(packsDir);
      const skills = await loader.searchSkills('tdd');

      expect(skills).toHaveLength(1);
      expect(skills[0].id).toBe('testing/tdd-skill');
    });

    it('should search skills by tag', async () => {
      createTestPack('testing', ['skill1']);

      const loader = new MethodologyLoader(packsDir);
      const skills = await loader.searchSkills('test');

      expect(skills).toHaveLength(1);
    });

    it('should return all skills when query is empty', async () => {
      createTestPack('testing', ['skill1', 'skill2']);

      const loader = new MethodologyLoader(packsDir);
      const skills = await loader.searchSkills('');

      expect(skills).toHaveLength(2);
    });
  });

  describe('packExists', () => {
    it('should return true for existing pack', () => {
      createTestPack('testing', ['skill1']);

      const loader = new MethodologyLoader(packsDir);
      expect(loader.packExists('testing')).toBe(true);
    });

    it('should return false for non-existent pack', () => {
      const loader = new MethodologyLoader(packsDir);
      expect(loader.packExists('nonexistent')).toBe(false);
    });
  });

  describe('clearCache', () => {
    it('should clear cached packs and skills', async () => {
      createTestPack('testing', ['skill1']);

      const loader = new MethodologyLoader(packsDir);

      // Load to populate cache
      await loader.loadPack('testing');
      await loader.loadSkill('testing', 'skill1');

      // Clear cache
      loader.clearCache();

      // Modify pack on disk
      const packDir = join(packsDir, 'testing');
      const manifest = {
        name: 'testing',
        version: '2.0.0',
        description: 'Updated pack',
        skills: ['skill1'],
        tags: ['testing'],
        compatibility: ['all'],
      };
      writeFileSync(join(packDir, 'pack.json'), JSON.stringify(manifest, null, 2));

      // Reload should get new version
      const pack = await loader.loadPack('testing');
      expect(pack?.version).toBe('2.0.0');
    });
  });
});

describe('createMethodologyLoader', () => {
  it('should create a loader instance', () => {
    const loader = createMethodologyLoader();
    expect(loader).toBeInstanceOf(MethodologyLoader);
  });

  it('should accept custom packs directory', () => {
    const customDir = '/custom/packs';
    const loader = createMethodologyLoader(customDir);
    expect(loader.getPacksDir()).toBe(customDir);
  });
});
