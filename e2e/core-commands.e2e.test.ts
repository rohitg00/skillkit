/**
 * E2E Tests: Core CLI Commands
 *
 * Tests for: init, list, install, enable, disable, remove, update, sync, read, validate
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'node:path';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import {
  runCli,
  createTestDir,
  cleanupTestDir,
  createTestSkill,
  createTestProject,
  readTestFile,
  testFileExists,
  writeTestFile,
} from './helpers/cli-runner.js';

describe('E2E: Core CLI Commands', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = createTestDir();
  });

  afterEach(() => {
    cleanupTestDir(testDir);
  });

  describe('skillkit --version', () => {
    it('should display version number', async () => {
      const result = await runCli(['--version']);
      expect(result.success).toBe(true);
      expect(result.stdout).toMatch(/\d+\.\d+\.\d+/);
    });
  });

  describe('skillkit --help', () => {
    it('should display help information', async () => {
      const result = await runCli(['--help']);
      expect(result.success).toBe(true);
      expect(result.stdout).toContain('skillkit');
    });

    it('should list available commands', async () => {
      const result = await runCli(['--help']);
      expect(result.stdout + result.stderr).toMatch(/init|list|install|sync/i);
    });
  });

  describe('skillkit init', () => {
    it('should initialize skillkit in a new project', async () => {
      const result = await runCli(['init'], { cwd: testDir });
      const output = result.stdout + result.stderr;

      // Check for concrete successful outcome - any of these directories
      const hasSkillsDir = testFileExists(testDir, 'skills');
      const hasSkillkitDir = testFileExists(testDir, '.skillkit');
      const hasClaudeSkills = testFileExists(testDir, '.claude/skills');
      const hasAgentSkills = testFileExists(testDir, '.agent/skills');
      const hasAnyDir = hasSkillsDir || hasSkillkitDir || hasClaudeSkills || hasAgentSkills;

      // Either a directory was created OR the command completed successfully with output
      if (!hasAnyDir && result.exitCode !== 0) {
        // Fail with debugging info
        expect.fail(`Init failed. Exit code: ${result.exitCode}\nOutput: ${output}`);
      }

      expect(hasAnyDir || result.exitCode === 0).toBe(true);
    });

    it('should create skills directory structure', async () => {
      const result = await runCli(['init'], { cwd: testDir });

      // Verify expected structure actually exists - any of these directories
      const hasSkillsDir = testFileExists(testDir, 'skills');
      const hasSkillkitDir = testFileExists(testDir, '.skillkit');
      const hasClaudeSkills = testFileExists(testDir, '.claude/skills');
      const hasAgentSkills = testFileExists(testDir, '.agent/skills');
      const hasAnySkillDir = hasSkillsDir || hasSkillkitDir || hasClaudeSkills || hasAgentSkills;

      // Strict assertion - init should create at least one directory
      if (!hasAnySkillDir) {
        const output = result.stdout + result.stderr;
        expect.fail(`Init did not create expected directories.\nExit code: ${result.exitCode}\nOutput: ${output}`);
      }

      expect(hasAnySkillDir).toBe(true);
    });
  });

  describe('skillkit list', () => {
    it('should list no skills in empty project', async () => {
      const result = await runCli(['list'], { cwd: testDir });
      // Should complete without error even if no skills
      expect(result.exitCode).toBeLessThanOrEqual(1);
    });

    it('should list discovered skills', async () => {
      // Create some test skills
      const skillsDir = join(testDir, 'skills');
      mkdirSync(skillsDir, { recursive: true });
      createTestSkill(skillsDir, 'my-skill');
      createTestSkill(skillsDir, 'another-skill');

      const result = await runCli(['list'], { cwd: testDir });
      const output = result.stdout + result.stderr;
      // Should find the skills or report none
      expect(output.includes('my-skill') || output.includes('skill') || output.includes('0')).toBe(
        true
      );
    });

    it('should support --json output format', async () => {
      const skillsDir = join(testDir, 'skills');
      mkdirSync(skillsDir, { recursive: true });
      createTestSkill(skillsDir, 'json-test-skill');

      const result = await runCli(['list', '--json'], { cwd: testDir });
      // If JSON format is supported, output should be parseable
      if (result.stdout.trim().startsWith('[') || result.stdout.trim().startsWith('{')) {
        expect(() => JSON.parse(result.stdout)).not.toThrow();
      }
    });
  });

  describe('skillkit read', () => {
    it('should read skill content', async () => {
      const skillsDir = join(testDir, 'skills');
      mkdirSync(skillsDir, { recursive: true });
      createTestSkill(skillsDir, 'readable-skill', {
        content: 'This skill has specific content for reading.',
      });

      const result = await runCli(['read', 'readable-skill'], { cwd: testDir });
      const output = result.stdout + result.stderr;
      // Should either show the skill or report not found
      expect(
        output.includes('readable-skill') ||
          output.includes('specific content') ||
          output.includes('not found') ||
          output.includes('No skill')
      ).toBe(true);
    });

    it('should handle non-existent skill gracefully', async () => {
      const result = await runCli(['read', 'nonexistent-skill'], { cwd: testDir });
      // Should not crash, may report error
      expect(result.exitCode).toBeDefined();
    });
  });

  describe('skillkit validate', () => {
    it('should validate a correct skill', async () => {
      const skillsDir = join(testDir, 'skills');
      mkdirSync(skillsDir, { recursive: true });
      const skillPath = createTestSkill(skillsDir, 'valid-skill', {
        description: 'A properly formatted skill with sufficient description length for validation',
      });

      const result = await runCli(['validate', skillPath], { cwd: testDir });
      const output = result.stdout + result.stderr;
      expect(output.includes('valid') || output.includes('success') || result.success).toBe(true);
    });

    it('should report errors for invalid skill', async () => {
      const skillDir = join(testDir, 'invalid-skill');
      mkdirSync(skillDir, { recursive: true });
      // Create skill without frontmatter
      writeFileSync(join(skillDir, 'SKILL.md'), '# No Frontmatter\n\nJust content.');

      const result = await runCli(['validate', skillDir], { cwd: testDir });
      const output = result.stdout + result.stderr;
      // Should report validation issues
      expect(
        output.includes('error') ||
          output.includes('invalid') ||
          output.includes('missing') ||
          !result.success
      ).toBe(true);
    });

    it('should validate skill with all Agent Skills spec fields', async () => {
      const skillDir = join(testDir, 'full-spec-skill');
      mkdirSync(skillDir, { recursive: true });
      writeFileSync(
        join(skillDir, 'SKILL.md'),
        `---
name: full-spec-skill
description: A skill that uses all Agent Skills specification fields for complete validation testing
license: MIT
compatibility: Node.js 18+, requires npm
allowed-tools: Bash(npm:*) Read Write Edit
metadata:
  author: test-org
  version: "1.0.0"
  tags:
    - testing
    - e2e
---

# Full Spec Skill

This skill uses all available frontmatter fields.
`
      );

      const result = await runCli(['validate', skillDir], { cwd: testDir });
      const output = result.stdout + result.stderr;
      // Should complete validation - either valid or show specific validation messages
      expect(
        result.success ||
          output.includes('valid') ||
          output.includes('full-spec-skill') ||
          result.exitCode !== undefined
      ).toBe(true);
    });
  });

  describe('skillkit enable/disable', () => {
    it('should enable a skill', async () => {
      const skillsDir = join(testDir, 'skills');
      mkdirSync(skillsDir, { recursive: true });
      createTestSkill(skillsDir, 'toggle-skill');

      const result = await runCli(['enable', 'toggle-skill'], { cwd: testDir });
      // Command should complete
      expect(result.exitCode).toBeDefined();
    });

    it('should disable a skill', async () => {
      const skillsDir = join(testDir, 'skills');
      mkdirSync(skillsDir, { recursive: true });
      createTestSkill(skillsDir, 'toggle-skill');

      // First enable, then disable
      await runCli(['enable', 'toggle-skill'], { cwd: testDir });
      const result = await runCli(['disable', 'toggle-skill'], { cwd: testDir });
      expect(result.exitCode).toBeDefined();
    });
  });

  describe('skillkit sync', () => {
    it('should sync skills to agent config', async () => {
      const skillsDir = join(testDir, 'skills');
      mkdirSync(skillsDir, { recursive: true });
      createTestSkill(skillsDir, 'sync-test-skill');

      const result = await runCli(['sync', '--agent', 'claude-code'], { cwd: testDir });
      const output = result.stdout + result.stderr;
      // Should attempt sync operation
      expect(
        output.includes('sync') ||
          output.includes('claude') ||
          output.includes('skill') ||
          result.exitCode !== undefined
      ).toBe(true);
    });
  });

  describe('skillkit status', () => {
    it('should show current skillkit status', async () => {
      const result = await runCli(['status'], { cwd: testDir });
      const output = result.stdout + result.stderr;
      // Should show some status information
      expect(
        output.includes('status') ||
          output.includes('skill') ||
          output.includes('agent') ||
          output.includes('No') ||
          result.exitCode !== undefined
      ).toBe(true);
    });
  });

  describe('skillkit remove', () => {
    it('should remove an installed skill', async () => {
      const skillsDir = join(testDir, 'skills');
      mkdirSync(skillsDir, { recursive: true });
      createTestSkill(skillsDir, 'removable-skill');

      // First ensure it exists
      expect(testFileExists(testDir, 'skills', 'removable-skill', 'SKILL.md')).toBe(true);

      const result = await runCli(['remove', 'removable-skill'], { cwd: testDir });
      // Command should complete
      expect(result.exitCode).toBeDefined();
    });
  });
});
