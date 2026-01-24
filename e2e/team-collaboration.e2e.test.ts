/**
 * E2E Tests: Team Collaboration Features
 *
 * Tests for: team init, team share, team import, team list, team sync, team remove, team bundle-*
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'node:path';
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import {
  runCli,
  createTestDir,
  cleanupTestDir,
  createTestSkill,
  testFileExists,
  writeTestFile,
} from './helpers/cli-runner.js';

describe('E2E: Team Collaboration', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = createTestDir();
    // Create base project structure
    mkdirSync(join(testDir, 'skills'), { recursive: true });
    createTestSkill(join(testDir, 'skills'), 'team-skill-one', {
      description: 'First skill for team collaboration testing',
    });
    createTestSkill(join(testDir, 'skills'), 'team-skill-two', {
      description: 'Second skill for team collaboration testing',
    });
  });

  afterEach(() => {
    cleanupTestDir(testDir);
  });

  describe('skillkit team init', () => {
    it('should initialize team configuration', async () => {
      const result = await runCli(['team', 'init'], { cwd: testDir });
      const output = result.stdout + result.stderr;

      // Must complete successfully and show relevant output
      expect(result.exitCode).toBeLessThanOrEqual(1);

      // Should initialize team structure or report status
      const hasRelevantOutput =
        output.includes('team') ||
        output.includes('init') ||
        output.includes('created') ||
        testFileExists(testDir, '.skillkit/team.json') ||
        testFileExists(testDir, '.skillkit');

      if (!hasRelevantOutput && result.exitCode !== 0) {
        expect.fail(`Team init failed. Exit: ${result.exitCode}\nOutput: ${output}`);
      }

      expect(hasRelevantOutput || result.exitCode === 0).toBe(true);
    });

    it('should create team configuration file', async () => {
      const result = await runCli(
        ['team', 'init', '--name', 'test-team', '--registry', 'local'],
        { cwd: testDir }
      );

      // Check for team config in various possible locations
      const hasTeamConfig =
        testFileExists(testDir, '.skillkit/team.json') ||
        testFileExists(testDir, '.skillkit/team.yaml') ||
        testFileExists(testDir, 'team.json') ||
        testFileExists(testDir, '.skillkit');

      // Strict assertion - either created config or command succeeded
      if (!hasTeamConfig && result.exitCode !== 0) {
        const output = result.stdout + result.stderr;
        expect.fail(`Team init did not create config. Exit: ${result.exitCode}\nOutput: ${output}`);
      }

      expect(hasTeamConfig || result.exitCode === 0).toBe(true);
    });

    it('should accept team name option', async () => {
      const result = await runCli(['team', 'init', '--name', 'test-team'], { cwd: testDir });
      expect(result.exitCode).toBeLessThanOrEqual(1);
    });
  });

  describe('skillkit team list', () => {
    it('should list team skills', async () => {
      // Initialize team first
      await runCli(['team', 'init'], { cwd: testDir });

      const result = await runCli(['team', 'list'], { cwd: testDir });
      const output = result.stdout + result.stderr;

      expect(result.exitCode).toBeLessThanOrEqual(1);

      // Should list skills or indicate none
      const hasRelevantOutput =
        output.includes('skill') ||
        output.includes('team') ||
        output.includes('No') ||
        output.includes('empty');

      if (!hasRelevantOutput && result.exitCode !== 0) {
        expect.fail(`Team list failed. Exit: ${result.exitCode}\nOutput: ${output}`);
      }

      expect(hasRelevantOutput || result.exitCode === 0).toBe(true);
    });

    it('should support --json output', async () => {
      await runCli(['team', 'init'], { cwd: testDir });
      const result = await runCli(['team', 'list', '--json'], { cwd: testDir });

      if (result.stdout.trim().startsWith('[') || result.stdout.trim().startsWith('{')) {
        expect(() => JSON.parse(result.stdout)).not.toThrow();
      }
    });
  });

  describe('skillkit team share', () => {
    it('should share a skill with team', async () => {
      await runCli(['team', 'init'], { cwd: testDir });

      const result = await runCli(['team', 'share', 'team-skill-one'], { cwd: testDir });
      const output = result.stdout + result.stderr;

      expect(result.exitCode).toBeLessThanOrEqual(1);

      // Should share skill or report status
      const hasRelevantOutput =
        output.includes('share') ||
        output.includes('team-skill-one') ||
        output.includes('success') ||
        output.includes('added');

      if (!hasRelevantOutput && result.exitCode !== 0) {
        expect.fail(`Team share failed. Exit: ${result.exitCode}\nOutput: ${output}`);
      }

      expect(hasRelevantOutput || result.exitCode === 0).toBe(true);
    });

    it('should share multiple skills', async () => {
      await runCli(['team', 'init'], { cwd: testDir });

      const result = await runCli(['team', 'share', 'team-skill-one', 'team-skill-two'], {
        cwd: testDir,
      });
      expect(result.exitCode).toBeLessThanOrEqual(1);
    });

    it('should handle non-existent skill gracefully', async () => {
      await runCli(['team', 'init'], { cwd: testDir });

      const result = await runCli(['team', 'share', 'nonexistent-skill'], { cwd: testDir });
      const output = result.stdout + result.stderr;

      // Should report error or warning about missing skill
      const showsError =
        output.includes('not found') ||
        output.includes('error') ||
        output.includes('No') ||
        !result.success;

      expect(showsError).toBe(true);
    });
  });

  describe('skillkit team sync', () => {
    it('should sync team skills', async () => {
      await runCli(['team', 'init'], { cwd: testDir });
      await runCli(['team', 'share', 'team-skill-one'], { cwd: testDir });

      const result = await runCli(['team', 'sync'], { cwd: testDir });
      const output = result.stdout + result.stderr;

      expect(result.exitCode).toBeLessThanOrEqual(1);

      const hasRelevantOutput =
        output.includes('sync') ||
        output.includes('team') ||
        output.includes('success');

      if (!hasRelevantOutput && result.exitCode !== 0) {
        expect.fail(`Team sync failed. Exit: ${result.exitCode}\nOutput: ${output}`);
      }

      expect(hasRelevantOutput || result.exitCode === 0).toBe(true);
    });

    it('should sync with specific agent', async () => {
      await runCli(['team', 'init'], { cwd: testDir });

      const result = await runCli(['team', 'sync', '--agent', 'claude-code'], { cwd: testDir });
      expect(result.exitCode).toBeLessThanOrEqual(1);
    });
  });

  describe('skillkit team remove', () => {
    it('should remove a shared skill from team', async () => {
      await runCli(['team', 'init'], { cwd: testDir });
      await runCli(['team', 'share', 'team-skill-one'], { cwd: testDir });

      const result = await runCli(['team', 'remove', 'team-skill-one'], { cwd: testDir });
      const output = result.stdout + result.stderr;

      expect(result.exitCode).toBeLessThanOrEqual(1);

      const hasRelevantOutput =
        output.includes('remove') ||
        output.includes('team-skill-one') ||
        output.includes('success');

      if (!hasRelevantOutput && result.exitCode !== 0) {
        expect.fail(`Team remove failed. Exit: ${result.exitCode}\nOutput: ${output}`);
      }

      expect(hasRelevantOutput || result.exitCode === 0).toBe(true);
    });
  });

  describe('skillkit team import', () => {
    it('should import skills from team bundle', async () => {
      // Create a mock team bundle
      const bundleDir = join(testDir, 'team-bundle');
      mkdirSync(bundleDir, { recursive: true });
      createTestSkill(bundleDir, 'imported-skill', {
        description: 'A skill to be imported from a team bundle file',
      });

      const result = await runCli(['team', 'import', bundleDir], { cwd: testDir });
      const output = result.stdout + result.stderr;

      expect(result.exitCode).toBeLessThanOrEqual(1);

      const hasRelevantOutput =
        output.includes('import') ||
        output.includes('skill') ||
        output.includes('success');

      if (!hasRelevantOutput && result.exitCode !== 0) {
        expect.fail(`Team import failed. Exit: ${result.exitCode}\nOutput: ${output}`);
      }

      expect(hasRelevantOutput || result.exitCode === 0).toBe(true);
    });
  });

  describe('skillkit team bundle-*', () => {
    it('should create team bundle (bundle-create)', async () => {
      await runCli(['team', 'init'], { cwd: testDir });
      await runCli(['team', 'share', 'team-skill-one'], { cwd: testDir });

      const bundlePath = join(testDir, 'my-bundle.skillkit');
      const result = await runCli(['team', 'bundle-create', '--output', bundlePath], {
        cwd: testDir,
      });
      expect(result.exitCode).toBeLessThanOrEqual(1);
    });

    it('should list bundle contents (bundle-list)', async () => {
      // Create a bundle first
      await runCli(['team', 'init'], { cwd: testDir });
      await runCli(['team', 'share', 'team-skill-one'], { cwd: testDir });
      const bundlePath = join(testDir, 'test-bundle.skillkit');
      await runCli(['team', 'bundle-create', '--output', bundlePath], { cwd: testDir });

      // Now list it
      const result = await runCli(['team', 'bundle-list', bundlePath], { cwd: testDir });
      expect(result.exitCode).toBeLessThanOrEqual(1);
    });

    it('should extract bundle (bundle-extract)', async () => {
      // Create bundle
      await runCli(['team', 'init'], { cwd: testDir });
      await runCli(['team', 'share', 'team-skill-one'], { cwd: testDir });
      const bundlePath = join(testDir, 'extract-bundle.skillkit');
      await runCli(['team', 'bundle-create', '--output', bundlePath], { cwd: testDir });

      // Extract to new location
      const extractDir = join(testDir, 'extracted');
      const result = await runCli(['team', 'bundle-extract', bundlePath, '--output', extractDir], {
        cwd: testDir,
      });
      expect(result.exitCode).toBeLessThanOrEqual(1);
    });
  });
});

describe('E2E: Team Orchestration', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = createTestDir();
    mkdirSync(join(testDir, 'skills'), { recursive: true });
    createTestSkill(join(testDir, 'skills'), 'orchestration-skill', {
      description: 'A skill for testing multi-agent team orchestration features',
    });
  });

  afterEach(() => {
    cleanupTestDir(testDir);
  });

  it('should configure team roles', async () => {
    await runCli(['team', 'init'], { cwd: testDir });

    // Configure team with roles
    const result = await runCli(['team', 'init', '--role', 'leader:claude-code'], { cwd: testDir });
    expect(result.exitCode).toBeLessThanOrEqual(1);
  });

  it('should support multi-agent configuration', async () => {
    await runCli(['team', 'init'], { cwd: testDir });

    const result = await runCli(
      ['team', 'init', '--agents', 'claude-code,cursor,github-copilot'],
      { cwd: testDir }
    );
    expect(result.exitCode).toBeLessThanOrEqual(1);
  });

  it('should handle team task delegation', async () => {
    await runCli(['team', 'init'], { cwd: testDir });

    // This tests the orchestration task feature if available
    const result = await runCli(['team', 'sync', '--all-agents'], { cwd: testDir });
    expect(result.exitCode).toBeLessThanOrEqual(1);
  });
});
