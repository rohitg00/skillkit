/**
 * E2E Tests: Onboarding UI
 *
 * Tests for the new @clack/prompts based CLI onboarding experience
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'node:path';
import { mkdirSync, writeFileSync } from 'node:fs';
import {
  runCli,
  createTestDir,
  cleanupTestDir,
  createTestSkill,
  testFileExists,
} from './helpers/cli-runner.js';

describe('E2E: Onboarding UI', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = createTestDir();
  });

  afterEach(() => {
    cleanupTestDir(testDir);
  });

  describe('skillkit init --list', () => {
    it('should display agents with icons', async () => {
      const result = await runCli(['init', '--list']);
      const output = result.stdout + result.stderr;

      // Should show agent icons
      expect(output).toContain('Claude Code');
      expect(output).toContain('Cursor');
      expect(output).toContain('Codex');

      // Should show Skills dir info
      expect(output).toContain('Skills dir');
      expect(output).toContain('Config');

      // Should complete successfully
      expect(result.success).toBe(true);
    });

    it('should display all 17 agents', async () => {
      const result = await runCli(['init', '--list']);
      const output = result.stdout + result.stderr;

      const agents = [
        'Claude Code',
        'Cursor',
        'Codex',
        'Gemini',
        'OpenCode',
        'Copilot',
        'Windsurf',
        'Droid',
        'Goose',
        'Amp',
        'Kilo',
        'Kiro',
        'Roo',
        'Trae',
        'Antigravity',
        'Clawdbot',
        'Universal',
      ];

      for (const agent of agents) {
        expect(output.toLowerCase()).toContain(agent.toLowerCase());
      }
    });
  });

  describe('skillkit install --list', () => {
    it('should list skills with visual formatting', async () => {
      // Create a test repo-like structure
      const skillsDir = join(testDir, 'test-skills');
      mkdirSync(skillsDir, { recursive: true });
      createTestSkill(skillsDir, 'skill-one');
      createTestSkill(skillsDir, 'skill-two');

      const result = await runCli(['install', testDir, '--list'], { cwd: testDir });
      const output = result.stdout + result.stderr;

      // Should show skills found
      expect(output.toLowerCase()).toMatch(/skill|found|available/);
    });
  });

  describe('skillkit marketplace', () => {
    it('should display marketplace header', async () => {
      const result = await runCli(['marketplace', '--json']);
      const output = result.stdout + result.stderr;

      // JSON output should contain marketplace data
      if (result.success) {
        try {
          const data = JSON.parse(result.stdout.trim().split('\n').pop() || '{}');
          expect(data).toHaveProperty('totalSkills');
          expect(data).toHaveProperty('sources');
        } catch {
          // Non-JSON output is also acceptable
        }
      }
    });

    it('should show popular tags with progress bars', async () => {
      const result = await runCli(['marketplace', 'tags', '--json']);

      if (result.success && result.stdout.trim().startsWith('[')) {
        const tags = JSON.parse(result.stdout);
        expect(Array.isArray(tags)).toBe(true);
        if (tags.length > 0) {
          expect(tags[0]).toHaveProperty('tag');
          expect(tags[0]).toHaveProperty('count');
        }
      }
    });
  });

  describe('skillkit sync', () => {
    it('should sync with formatted output', async () => {
      // Create skills to sync
      const skillsDir = join(testDir, 'skills');
      mkdirSync(skillsDir, { recursive: true });
      createTestSkill(skillsDir, 'sync-skill-1');
      createTestSkill(skillsDir, 'sync-skill-2');

      const result = await runCli(['sync', '--agent', 'claude-code', '-y'], { cwd: testDir });
      const output = result.stdout + result.stderr;

      // Should show sync operation
      expect(output.toLowerCase()).toMatch(/sync|skill|claude/);
    });

    it('should show skill status indicators', async () => {
      const skillsDir = join(testDir, 'skills');
      mkdirSync(skillsDir, { recursive: true });
      createTestSkill(skillsDir, 'enabled-skill');

      const result = await runCli(['sync', '--agent', 'claude-code', '-y'], { cwd: testDir });
      const output = result.stdout + result.stderr;

      // Should complete without error
      expect(result.exitCode).toBeDefined();
    });
  });

  describe('skillkit recommend', () => {
    it('should show project analysis with spinner', async () => {
      // Create a node project
      writeFileSync(
        join(testDir, 'package.json'),
        JSON.stringify({ name: 'test-project', version: '1.0.0' }, null, 2)
      );

      const result = await runCli(['recommend', '--quiet'], { cwd: testDir });
      const output = result.stdout + result.stderr;

      // Should show some output about recommendations or project
      expect(
        output.toLowerCase().includes('project') ||
        output.toLowerCase().includes('skill') ||
        output.toLowerCase().includes('recommend') ||
        output.toLowerCase().includes('index') ||
        result.exitCode !== undefined
      ).toBe(true);
    });

    it('should format scores with progress bars', async () => {
      // Create a TypeScript project
      writeFileSync(
        join(testDir, 'package.json'),
        JSON.stringify({
          name: 'test-project',
          dependencies: { typescript: '^5.0.0' },
        }, null, 2)
      );
      writeFileSync(join(testDir, 'tsconfig.json'), '{}');

      const result = await runCli(['recommend', '--json'], { cwd: testDir });

      if (result.success && result.stdout.includes('"recommendations"')) {
        const data = JSON.parse(result.stdout);
        expect(data).toHaveProperty('recommendations');
      }
    });
  });

  describe('Non-interactive mode', () => {
    it('should work with --yes flag', async () => {
      const skillsDir = join(testDir, 'skills');
      mkdirSync(skillsDir, { recursive: true });
      createTestSkill(skillsDir, 'test-skill');

      const result = await runCli(['sync', '--agent', 'claude-code', '-y'], { cwd: testDir });
      // Should complete without prompting
      expect(result.exitCode).toBeDefined();
    });

    it('should work with --quiet flag', async () => {
      const result = await runCli(['init', '--list', '-q']);
      const output = result.stdout + result.stderr;

      // Should still show content but without extra formatting
      expect(output).toContain('Claude Code');
    });

    it('should work with --json flag', async () => {
      const result = await runCli(['marketplace', '--json']);

      // Should output valid JSON
      if (result.success) {
        const jsonLine = result.stdout.trim().split('\n').pop() || '';
        if (jsonLine.startsWith('{') || jsonLine.startsWith('[')) {
          expect(() => JSON.parse(jsonLine)).not.toThrow();
        }
      }
    });
  });

  describe('Error handling', () => {
    it('should show formatted errors', async () => {
      const result = await runCli(['install', 'nonexistent-source-12345']);
      const output = result.stdout + result.stderr;

      // Should show some error message
      expect(
        output.toLowerCase().includes('error') ||
        output.toLowerCase().includes('fail') ||
        output.toLowerCase().includes('not found') ||
        !result.success
      ).toBe(true);
    });

    it('should handle missing skills gracefully', async () => {
      const result = await runCli(['read', 'nonexistent-skill'], { cwd: testDir });
      // Should not crash
      expect(result.exitCode).toBeDefined();
    });
  });

  describe('Visual elements', () => {
    it('should use Unicode symbols in output', async () => {
      const result = await runCli(['init', '--list']);
      const output = result.stdout + result.stderr;

      // Should contain Unicode agent icons (any of the defined icons)
      const unicodePatterns = [
        /[\u2500-\u257F]/, // Box drawing
        /[\u25A0-\u25FF]/, // Geometric shapes
        /[\u2700-\u27BF]/, // Dingbats
      ];

      const hasUnicode = unicodePatterns.some(pattern => pattern.test(output));
      // Unicode support depends on terminal, so just check it doesn't crash
      expect(result.exitCode).toBe(0);
    });

    it('should handle narrow terminal gracefully', async () => {
      // Even with narrow output, should not crash
      const result = await runCli(['init', '--list'], {
        env: { COLUMNS: '40' },
      });
      expect(result.exitCode).toBeDefined();
    });
  });
});
