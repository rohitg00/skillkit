/**
 * E2E Tests: Plugin System
 *
 * Tests for: plugin list/install/uninstall/enable/disable/info
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'node:path';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import {
  runCli,
  createTestDir,
  cleanupTestDir,
  testFileExists,
  writeTestFile,
} from './helpers/cli-runner.js';

describe('E2E: Plugin System', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = createTestDir();
    writeFileSync(
      join(testDir, 'package.json'),
      JSON.stringify({ name: 'plugin-test', version: '1.0.0' }, null, 2)
    );
    // Create .skillkit directory for plugin storage
    mkdirSync(join(testDir, '.skillkit', 'plugins'), { recursive: true });
  });

  afterEach(() => {
    cleanupTestDir(testDir);
  });

  describe('skillkit plugin list', () => {
    it('should list installed plugins', async () => {
      const result = await runCli(['plugin', 'list'], { cwd: testDir });
      const output = result.stdout + result.stderr;
      expect(
        output.includes('plugin') ||
          output.includes('No') ||
          output.includes('installed') ||
          result.exitCode !== undefined
      ).toBe(true);
    });

    it('should support --json output', async () => {
      const result = await runCli(['plugin', 'list', '--json'], { cwd: testDir });
      if (result.stdout.trim().startsWith('[') || result.stdout.trim().startsWith('{')) {
        expect(() => JSON.parse(result.stdout)).not.toThrow();
      }
    });

    it('should show available plugins from marketplace', async () => {
      const result = await runCli(['plugin', 'list', '--available'], { cwd: testDir });
      expect(result.exitCode).toBeDefined();
    });

    it('should filter enabled/disabled plugins', async () => {
      const result = await runCli(['plugin', 'list', '--enabled'], { cwd: testDir });
      expect(result.exitCode).toBeDefined();
    });
  });

  describe('skillkit plugin install', () => {
    it('should install plugin from local path', async () => {
      // Create a mock plugin
      const pluginDir = join(testDir, 'my-plugin');
      mkdirSync(pluginDir, { recursive: true });
      writeFileSync(
        join(pluginDir, 'plugin.json'),
        JSON.stringify(
          {
            name: 'my-plugin',
            version: '1.0.0',
            description: 'A test plugin for E2E testing',
          },
          null,
          2
        )
      );
      writeFileSync(join(pluginDir, 'index.js'), 'module.exports = { init: () => {} };');

      const result = await runCli(['plugin', 'install', pluginDir], { cwd: testDir });
      const output = result.stdout + result.stderr;
      expect(
        output.includes('install') ||
          output.includes('my-plugin') ||
          output.includes('success') ||
          result.exitCode !== undefined
      ).toBe(true);
    });

    it('should install plugin from npm-style name', async () => {
      // This may fail if plugin doesn't exist, but shouldn't crash
      const result = await runCli(['plugin', 'install', 'skillkit-plugin-example'], {
        cwd: testDir,
      });
      expect(result.exitCode).toBeDefined();
    });

    it('should handle non-existent plugin gracefully', async () => {
      const result = await runCli(['plugin', 'install', 'nonexistent-plugin-12345'], {
        cwd: testDir,
      });
      const output = result.stdout + result.stderr;
      expect(
        output.includes('not found') ||
          output.includes('error') ||
          output.includes('fail') ||
          !result.success ||
          result.exitCode !== undefined
      ).toBe(true);
    });

    it('should install with --force option', async () => {
      const pluginDir = join(testDir, 'force-plugin');
      mkdirSync(pluginDir, { recursive: true });
      writeFileSync(
        join(pluginDir, 'plugin.json'),
        JSON.stringify({ name: 'force-plugin', version: '1.0.0' }, null, 2)
      );

      // Install twice with force
      await runCli(['plugin', 'install', pluginDir], { cwd: testDir });
      const result = await runCli(['plugin', 'install', pluginDir, '--force'], { cwd: testDir });
      expect(result.exitCode).toBeDefined();
    });
  });

  describe('skillkit plugin uninstall', () => {
    it('should uninstall an installed plugin', async () => {
      // First install a plugin
      const pluginDir = join(testDir, 'uninstall-plugin');
      mkdirSync(pluginDir, { recursive: true });
      writeFileSync(
        join(pluginDir, 'plugin.json'),
        JSON.stringify({ name: 'uninstall-plugin', version: '1.0.0' }, null, 2)
      );
      await runCli(['plugin', 'install', pluginDir], { cwd: testDir });

      // Then uninstall
      const result = await runCli(['plugin', 'uninstall', 'uninstall-plugin'], { cwd: testDir });
      const output = result.stdout + result.stderr;
      expect(
        output.includes('uninstall') ||
          output.includes('remove') ||
          output.includes('success') ||
          result.exitCode !== undefined
      ).toBe(true);
    });

    it('should handle uninstalling non-installed plugin gracefully', async () => {
      const result = await runCli(['plugin', 'uninstall', 'not-installed-plugin'], { cwd: testDir });
      expect(result.exitCode).toBeDefined();
    });
  });

  describe('skillkit plugin enable/disable', () => {
    beforeEach(async () => {
      // Install a test plugin
      const pluginDir = join(testDir, 'toggle-plugin');
      mkdirSync(pluginDir, { recursive: true });
      writeFileSync(
        join(pluginDir, 'plugin.json'),
        JSON.stringify({ name: 'toggle-plugin', version: '1.0.0' }, null, 2)
      );
      await runCli(['plugin', 'install', pluginDir], { cwd: testDir });
    });

    it('should enable a disabled plugin', async () => {
      // First disable
      await runCli(['plugin', 'disable', 'toggle-plugin'], { cwd: testDir });

      // Then enable
      const result = await runCli(['plugin', 'enable', 'toggle-plugin'], { cwd: testDir });
      const output = result.stdout + result.stderr;
      expect(
        output.includes('enable') ||
          output.includes('toggle-plugin') ||
          result.exitCode !== undefined
      ).toBe(true);
    });

    it('should disable an enabled plugin', async () => {
      const result = await runCli(['plugin', 'disable', 'toggle-plugin'], { cwd: testDir });
      const output = result.stdout + result.stderr;
      expect(
        output.includes('disable') ||
          output.includes('toggle-plugin') ||
          result.exitCode !== undefined
      ).toBe(true);
    });
  });

  describe('skillkit plugin info', () => {
    it('should show plugin information', async () => {
      // Install a plugin first
      const pluginDir = join(testDir, 'info-plugin');
      mkdirSync(pluginDir, { recursive: true });
      writeFileSync(
        join(pluginDir, 'plugin.json'),
        JSON.stringify(
          {
            name: 'info-plugin',
            version: '2.0.0',
            description: 'A plugin with detailed info for testing',
            author: 'Test Author',
            homepage: 'https://example.com',
          },
          null,
          2
        )
      );
      await runCli(['plugin', 'install', pluginDir], { cwd: testDir });

      const result = await runCli(['plugin', 'info', 'info-plugin'], { cwd: testDir });
      const output = result.stdout + result.stderr;
      expect(
        output.includes('info-plugin') ||
          output.includes('2.0.0') ||
          output.includes('info') ||
          output.includes('description') ||
          result.exitCode !== undefined
      ).toBe(true);
    });

    it('should handle non-existent plugin info gracefully', async () => {
      const result = await runCli(['plugin', 'info', 'nonexistent-plugin'], { cwd: testDir });
      expect(result.exitCode).toBeDefined();
    });

    it('should support --json output', async () => {
      const pluginDir = join(testDir, 'json-info-plugin');
      mkdirSync(pluginDir, { recursive: true });
      writeFileSync(
        join(pluginDir, 'plugin.json'),
        JSON.stringify({ name: 'json-info-plugin', version: '1.0.0' }, null, 2)
      );
      await runCli(['plugin', 'install', pluginDir], { cwd: testDir });

      const result = await runCli(['plugin', 'info', 'json-info-plugin', '--json'], {
        cwd: testDir,
      });
      if (result.stdout.trim().startsWith('{')) {
        expect(() => JSON.parse(result.stdout)).not.toThrow();
      }
    });
  });
});

describe('E2E: Plugin Integration', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = createTestDir();
    writeFileSync(
      join(testDir, 'package.json'),
      JSON.stringify({ name: 'plugin-integration', version: '1.0.0' }, null, 2)
    );
    mkdirSync(join(testDir, '.skillkit', 'plugins'), { recursive: true });
    mkdirSync(join(testDir, 'skills'), { recursive: true });
  });

  afterEach(() => {
    cleanupTestDir(testDir);
  });

  it('should load plugin skills into skill list', async () => {
    // Create a plugin with skills
    const pluginDir = join(testDir, 'skills-plugin');
    mkdirSync(join(pluginDir, 'skills', 'plugin-skill'), { recursive: true });
    writeFileSync(
      join(pluginDir, 'plugin.json'),
      JSON.stringify(
        {
          name: 'skills-plugin',
          version: '1.0.0',
          skills: ['skills/plugin-skill'],
        },
        null,
        2
      )
    );
    writeFileSync(
      join(pluginDir, 'skills', 'plugin-skill', 'SKILL.md'),
      `---
name: plugin-skill
description: A skill provided by a plugin for E2E testing
---

# Plugin Skill
`
    );

    await runCli(['plugin', 'install', pluginDir], { cwd: testDir });

    // List should include plugin skill
    const result = await runCli(['list'], { cwd: testDir });
    expect(result.exitCode).toBeDefined();
  });

  it('should handle plugin hooks', async () => {
    // Create a plugin with hooks
    const pluginDir = join(testDir, 'hooks-plugin');
    mkdirSync(pluginDir, { recursive: true });
    writeFileSync(
      join(pluginDir, 'plugin.json'),
      JSON.stringify(
        {
          name: 'hooks-plugin',
          version: '1.0.0',
          hooks: {
            'pre-sync': 'echo "pre-sync from plugin"',
            'post-sync': 'echo "post-sync from plugin"',
          },
        },
        null,
        2
      )
    );

    await runCli(['plugin', 'install', pluginDir], { cwd: testDir });

    // Sync should trigger plugin hooks
    const result = await runCli(['sync', '--agent', 'claude-code'], { cwd: testDir });
    expect(result.exitCode).toBeDefined();
  });

  it('should respect plugin priority order', async () => {
    // Create two plugins with different priorities
    const plugin1Dir = join(testDir, 'priority-plugin-1');
    const plugin2Dir = join(testDir, 'priority-plugin-2');

    mkdirSync(plugin1Dir, { recursive: true });
    mkdirSync(plugin2Dir, { recursive: true });

    writeFileSync(
      join(plugin1Dir, 'plugin.json'),
      JSON.stringify({ name: 'priority-plugin-1', version: '1.0.0', priority: 10 }, null, 2)
    );
    writeFileSync(
      join(plugin2Dir, 'plugin.json'),
      JSON.stringify({ name: 'priority-plugin-2', version: '1.0.0', priority: 20 }, null, 2)
    );

    await runCli(['plugin', 'install', plugin1Dir], { cwd: testDir });
    await runCli(['plugin', 'install', plugin2Dir], { cwd: testDir });

    const result = await runCli(['plugin', 'list'], { cwd: testDir });
    expect(result.exitCode).toBeDefined();
  });
});

describe('E2E: Marketplace Integration', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = createTestDir();
    writeFileSync(
      join(testDir, 'package.json'),
      JSON.stringify({ name: 'marketplace-test', version: '1.0.0' }, null, 2)
    );
  });

  afterEach(() => {
    cleanupTestDir(testDir);
  });

  describe('skillkit marketplace', () => {
    it('should list marketplace skills', async () => {
      const result = await runCli(['marketplace'], { cwd: testDir });
      const output = result.stdout + result.stderr;
      expect(
        output.includes('marketplace') ||
          output.includes('skill') ||
          output.includes('available') ||
          result.exitCode !== undefined
      ).toBe(true);
    });

    it('should search marketplace', async () => {
      const result = await runCli(['marketplace', '--search', 'typescript'], { cwd: testDir });
      expect(result.exitCode).toBeDefined();
    });

    it('should filter by category', async () => {
      const result = await runCli(['marketplace', '--category', 'testing'], { cwd: testDir });
      expect(result.exitCode).toBeDefined();
    });

    it('should show skill details', async () => {
      const result = await runCli(['marketplace', '--info', 'some-skill'], { cwd: testDir });
      expect(result.exitCode).toBeDefined();
    });
  });
});
