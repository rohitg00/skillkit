import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { MethodologyManager, createMethodologyManager } from '../manager.js';

describe('MethodologyManager', () => {
  let testDir: string;
  let packsDir: string;
  let projectPath: string;

  beforeEach(() => {
    // Create temporary directories for tests
    testDir = join(tmpdir(), `skillkit-manager-test-${Date.now()}`);
    packsDir = join(testDir, 'packs');
    projectPath = join(testDir, 'project');
    mkdirSync(packsDir, { recursive: true });
    mkdirSync(projectPath, { recursive: true });
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

  describe('installPack', () => {
    it('should install a pack and its skills', async () => {
      createTestPack('testing', ['skill1', 'skill2']);

      const manager = createMethodologyManager({
        projectPath,
        packsDir,
        autoSync: false,
      });

      const result = await manager.installPack('testing');

      expect(result.success).toBe(true);
      expect(result.installed).toHaveLength(2);
      expect(result.installed).toContain('testing/skill1');
      expect(result.installed).toContain('testing/skill2');
    });

    it('should skip already installed packs', async () => {
      createTestPack('testing', ['skill1']);

      const manager = createMethodologyManager({
        projectPath,
        packsDir,
        autoSync: false,
      });

      // Install first time
      await manager.installPack('testing');

      // Install again
      const result = await manager.installPack('testing');

      expect(result.success).toBe(true);
      expect(result.skipped).toContain('testing');
    });

    it('should fail for non-existent pack', async () => {
      const manager = createMethodologyManager({
        projectPath,
        packsDir,
        autoSync: false,
      });

      const result = await manager.installPack('nonexistent');

      expect(result.success).toBe(false);
      expect(result.failed).toHaveLength(1);
    });
  });

  describe('installAllPacks', () => {
    it('should install all available packs', async () => {
      createTestPack('testing', ['skill1']);
      createTestPack('debugging', ['skill2']);

      const manager = createMethodologyManager({
        projectPath,
        packsDir,
        autoSync: false,
      });

      const result = await manager.installAllPacks();

      expect(result.success).toBe(true);
      expect(result.installed).toHaveLength(2);
    });
  });

  describe('installSkill', () => {
    it('should install a single skill', async () => {
      createTestPack('testing', ['skill1', 'skill2']);

      const manager = createMethodologyManager({
        projectPath,
        packsDir,
        autoSync: false,
      });

      const result = await manager.installSkill('testing/skill1');

      expect(result.success).toBe(true);
      expect(result.installed).toContain('testing/skill1');
    });

    it('should fail for non-existent skill', async () => {
      createTestPack('testing', ['skill1']);

      const manager = createMethodologyManager({
        projectPath,
        packsDir,
        autoSync: false,
      });

      const result = await manager.installSkill('testing/nonexistent');

      expect(result.success).toBe(false);
    });
  });

  describe('uninstallPack', () => {
    it('should uninstall a pack', async () => {
      createTestPack('testing', ['skill1']);

      const manager = createMethodologyManager({
        projectPath,
        packsDir,
        autoSync: false,
      });

      await manager.installPack('testing');
      await manager.uninstallPack('testing');

      const installed = manager.listInstalledPacks();
      expect(installed).toHaveLength(0);
    });

    it('should throw for non-installed pack', async () => {
      const manager = createMethodologyManager({
        projectPath,
        packsDir,
        autoSync: false,
      });

      await expect(manager.uninstallPack('testing')).rejects.toThrow();
    });
  });

  describe('listInstalledPacks', () => {
    it('should list installed packs', async () => {
      createTestPack('testing', ['skill1', 'skill2']);

      const manager = createMethodologyManager({
        projectPath,
        packsDir,
        autoSync: false,
      });

      await manager.installPack('testing');

      const installed = manager.listInstalledPacks();

      expect(installed).toHaveLength(1);
      expect(installed[0].name).toBe('testing');
      expect(installed[0].skills).toHaveLength(2);
    });

    it('should return empty array when nothing installed', () => {
      const manager = createMethodologyManager({
        projectPath,
        packsDir,
        autoSync: false,
      });

      const installed = manager.listInstalledPacks();
      expect(installed).toHaveLength(0);
    });
  });

  describe('listInstalledSkills', () => {
    it('should list installed skills', async () => {
      createTestPack('testing', ['skill1', 'skill2']);

      const manager = createMethodologyManager({
        projectPath,
        packsDir,
        autoSync: false,
      });

      await manager.installPack('testing');

      const installed = manager.listInstalledSkills();

      expect(installed).toHaveLength(2);
    });
  });

  describe('listAvailablePacks', () => {
    it('should list packs not yet installed', async () => {
      createTestPack('testing', ['skill1']);
      createTestPack('debugging', ['skill2']);

      const manager = createMethodologyManager({
        projectPath,
        packsDir,
        autoSync: false,
      });

      await manager.installPack('testing');

      const available = await manager.listAvailablePacks();

      expect(available).toHaveLength(1);
      expect(available[0].name).toBe('debugging');
    });
  });

  describe('search', () => {
    it('should search by query string', async () => {
      createTestPack('testing', ['tdd-skill']);
      createTestPack('debugging', ['debug-skill']);

      const manager = createMethodologyManager({
        projectPath,
        packsDir,
        autoSync: false,
      });

      const result = await manager.search({ query: 'tdd' });

      expect(result.skills).toHaveLength(1);
      expect(result.skills[0].id).toBe('testing/tdd-skill');
    });

    it('should search by tags', async () => {
      createTestPack('testing', ['skill1']);

      const manager = createMethodologyManager({
        projectPath,
        packsDir,
        autoSync: false,
      });

      const result = await manager.search({ tags: ['test'] });

      expect(result.skills).toHaveLength(1);
    });

    it('should search by pack', async () => {
      createTestPack('testing', ['skill1', 'skill2']);
      createTestPack('debugging', ['skill3']);

      const manager = createMethodologyManager({
        projectPath,
        packsDir,
        autoSync: false,
      });

      const result = await manager.search({ pack: 'testing' });

      expect(result.skills).toHaveLength(2);
      expect(result.packs).toHaveLength(1);
    });
  });

  describe('state persistence', () => {
    it('should persist installed packs across instances', async () => {
      createTestPack('testing', ['skill1']);

      // Install with first instance
      const manager1 = createMethodologyManager({
        projectPath,
        packsDir,
        autoSync: false,
      });
      await manager1.installPack('testing');

      // Check with second instance
      const manager2 = createMethodologyManager({
        projectPath,
        packsDir,
        autoSync: false,
      });
      const installed = manager2.listInstalledPacks();

      expect(installed).toHaveLength(1);
      expect(installed[0].name).toBe('testing');
    });
  });
});

describe('createMethodologyManager', () => {
  it('should create a manager instance', () => {
    const testDir = join(tmpdir(), `skillkit-test-create-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });

    try {
      const manager = createMethodologyManager({ projectPath: testDir });
      expect(manager).toBeInstanceOf(MethodologyManager);
    } finally {
      rmSync(testDir, { recursive: true, force: true });
    }
  });
});
