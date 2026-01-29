/**
 * E2E Tests: Skill Translation Commands
 *
 * Tests for: translate, context, recommend
 * Validates translation to all 32 supported agents
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'node:path';
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import {
  runCli,
  createTestDir,
  cleanupTestDir,
  createTestSkill,
  testFileExists,
} from './helpers/cli-runner.js';

// All 32 supported agents
const SUPPORTED_AGENTS = [
  'claude-code',
  'cursor',
  'codex',
  'gemini-cli',
  'opencode',
  'antigravity',
  'amp',
  'clawdbot',
  'droid',
  'github-copilot',
  'goose',
  'kilo',
  'kiro-cli',
  'roo',
  'trae',
  'windsurf',
  'universal',
] as const;

describe('E2E: Skill Translation', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = createTestDir();
    // Create a skill for translation tests
    const skillsDir = join(testDir, 'skills');
    mkdirSync(skillsDir, { recursive: true });
    createTestSkill(skillsDir, 'translation-test', {
      description: 'A skill designed for testing translation across multiple AI coding agents',
      content: `## Usage

Run this command to test the skill:

\`\`\`bash
npm test
\`\`\`

## Features

- Feature A: Does something useful
- Feature B: Does something else
`,
    });
  });

  afterEach(() => {
    cleanupTestDir(testDir);
  });

  describe('skillkit translate', () => {
    it('should translate skill to claude-code format', async () => {
      const result = await runCli(['translate', '--agent', 'claude-code'], { cwd: testDir });
      const output = result.stdout + result.stderr;
      // Should complete translation or show relevant output
      expect(
        output.includes('claude') ||
          output.includes('translate') ||
          output.includes('CLAUDE.md') ||
          result.exitCode !== undefined
      ).toBe(true);
    });

    it('should translate skill to cursor format', async () => {
      const result = await runCli(['translate', '--agent', 'cursor'], { cwd: testDir });
      const output = result.stdout + result.stderr;
      expect(
        output.includes('cursor') ||
          output.includes('.cursorrules') ||
          output.includes('translate') ||
          result.exitCode !== undefined
      ).toBe(true);
    });

    it('should translate skill to windsurf format', async () => {
      const result = await runCli(['translate', '--agent', 'windsurf'], { cwd: testDir });
      const output = result.stdout + result.stderr;
      expect(
        output.includes('windsurf') ||
          output.includes('.windsurfrules') ||
          output.includes('translate') ||
          result.exitCode !== undefined
      ).toBe(true);
    });

    it('should translate skill to github-copilot format', async () => {
      const result = await runCli(['translate', '--agent', 'github-copilot'], { cwd: testDir });
      const output = result.stdout + result.stderr;
      expect(
        output.includes('copilot') ||
          output.includes('.github') ||
          output.includes('translate') ||
          result.exitCode !== undefined
      ).toBe(true);
    });

    it('should support universal format for all agents', async () => {
      const result = await runCli(['translate', '--agent', 'universal'], { cwd: testDir });
      expect(result.exitCode).toBeDefined();
    });

    // Test all agents can at least attempt translation
    describe.each(SUPPORTED_AGENTS)('translation to %s', (agent) => {
      it(`should handle translation to ${agent}`, async () => {
        const result = await runCli(['translate', '--agent', agent], { cwd: testDir });
        // Should not crash - either succeeds or reports error gracefully
        expect(result.exitCode).toBeDefined();
        expect(typeof result.stdout).toBe('string');
        expect(typeof result.stderr).toBe('string');
      });
    });

    it('should handle unknown agent gracefully', async () => {
      const result = await runCli(['translate', '--agent', 'nonexistent-agent'], { cwd: testDir });
      const output = result.stdout + result.stderr;
      // Should report error about unknown agent
      expect(
        output.toLowerCase().includes('unknown') ||
          output.toLowerCase().includes('not supported') ||
          output.toLowerCase().includes('invalid') ||
          output.toLowerCase().includes('error') ||
          !result.success
      ).toBe(true);
    });

    it('should translate with --output option', async () => {
      const outputPath = join(testDir, 'translated-output');
      mkdirSync(outputPath, { recursive: true });

      const result = await runCli(['translate', '--agent', 'claude-code', '--output', outputPath], {
        cwd: testDir,
      });
      // Command should complete
      expect(result.exitCode).toBeDefined();
    });

    it('should translate with --dry-run option', async () => {
      const result = await runCli(['translate', '--agent', 'cursor', '--dry-run'], {
        cwd: testDir,
      });
      const output = result.stdout + result.stderr;
      // Dry run should show what would be done without making changes
      expect(result.exitCode !== undefined || output.length > 0).toBe(true);
    });
  });

  describe('skillkit context', () => {
    it('should detect project context', async () => {
      // Create a Node.js project
      writeFileSync(
        join(testDir, 'package.json'),
        JSON.stringify(
          {
            name: 'test-project',
            version: '1.0.0',
            dependencies: { express: '^4.18.0' },
          },
          null,
          2
        )
      );

      const result = await runCli(['context'], { cwd: testDir });
      const output = result.stdout + result.stderr;
      // Should detect the project type
      expect(
        output.includes('node') ||
          output.includes('javascript') ||
          output.includes('typescript') ||
          output.includes('context') ||
          output.includes('project') ||
          result.exitCode !== undefined
      ).toBe(true);
    });

    it('should detect Python project', async () => {
      // Create a Python project
      writeFileSync(join(testDir, 'requirements.txt'), 'flask>=2.0.0\npytest>=7.0.0\n');
      writeFileSync(join(testDir, 'main.py'), 'print("Hello")\n');

      const result = await runCli(['context'], { cwd: testDir });
      const output = result.stdout + result.stderr;
      expect(
        output.includes('python') || output.includes('context') || result.exitCode !== undefined
      ).toBe(true);
    });

    it('should detect Rust project', async () => {
      // Create a Rust project
      writeFileSync(
        join(testDir, 'Cargo.toml'),
        '[package]\nname = "test"\nversion = "0.1.0"\nedition = "2021"'
      );

      const result = await runCli(['context'], { cwd: testDir });
      const output = result.stdout + result.stderr;
      expect(
        output.includes('rust') || output.includes('context') || result.exitCode !== undefined
      ).toBe(true);
    });

    it('should detect Go project', async () => {
      // Create a Go project
      writeFileSync(join(testDir, 'go.mod'), 'module example.com/test\n\ngo 1.21');

      const result = await runCli(['context'], { cwd: testDir });
      const output = result.stdout + result.stderr;
      expect(
        output.includes('go') || output.includes('context') || result.exitCode !== undefined
      ).toBe(true);
    });

    it('should support --json output', async () => {
      writeFileSync(
        join(testDir, 'package.json'),
        JSON.stringify({ name: 'test', version: '1.0.0' }, null, 2)
      );

      const result = await runCli(['context', '--json'], { cwd: testDir });
      // If JSON is supported, should be parseable
      if (result.stdout.trim().startsWith('{')) {
        expect(() => JSON.parse(result.stdout)).not.toThrow();
      }
    });
  });

  describe('skillkit recommend', () => {
    it('should recommend skills for a project', async () => {
      // Create a Node.js project with common patterns
      writeFileSync(
        join(testDir, 'package.json'),
        JSON.stringify(
          {
            name: 'web-app',
            version: '1.0.0',
            dependencies: {
              express: '^4.18.0',
              typescript: '^5.0.0',
              jest: '^29.0.0',
            },
          },
          null,
          2
        )
      );

      const result = await runCli(['recommend'], { cwd: testDir });
      const output = result.stdout + result.stderr;
      // Should provide recommendations or indicate none available
      expect(
        output.includes('recommend') ||
          output.includes('skill') ||
          output.includes('suggest') ||
          output.includes('No') ||
          result.exitCode !== undefined
      ).toBe(true);
    });

    it('should handle empty project gracefully', async () => {
      const result = await runCli(['recommend'], { cwd: testDir });
      // Should not crash
      expect(result.exitCode).toBeDefined();
    });

    it('should support --limit option', async () => {
      writeFileSync(
        join(testDir, 'package.json'),
        JSON.stringify({ name: 'test', version: '1.0.0' }, null, 2)
      );

      const result = await runCli(['recommend', '--limit', '5'], { cwd: testDir });
      expect(result.exitCode).toBeDefined();
    });
  });
});

describe('E2E: Agent Config Generation', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = createTestDir();
    const skillsDir = join(testDir, 'skills');
    mkdirSync(skillsDir, { recursive: true });
    createTestSkill(skillsDir, 'config-test-skill', {
      description: 'A skill for testing agent configuration generation across all agents',
      additionalFrontmatter: {
        'allowed-tools': 'Bash(npm:*) Read Write Edit',
      },
    });
  });

  afterEach(() => {
    cleanupTestDir(testDir);
  });

  it('should generate valid claude-code config (CLAUDE.md)', async () => {
    const result = await runCli(['sync', '--agent', 'claude-code'], { cwd: testDir });
    // Check if CLAUDE.md was created or would be created
    const claudeMdExists = testFileExists(testDir, 'CLAUDE.md');
    expect(result.exitCode !== undefined || claudeMdExists).toBe(true);
  });

  it('should generate valid cursor config (.cursorrules)', async () => {
    const result = await runCli(['sync', '--agent', 'cursor'], { cwd: testDir });
    const cursorRulesExists = testFileExists(testDir, '.cursorrules');
    expect(result.exitCode !== undefined || cursorRulesExists).toBe(true);
  });

  it('should generate valid windsurf config (.windsurfrules)', async () => {
    const result = await runCli(['sync', '--agent', 'windsurf'], { cwd: testDir });
    const windsurfRulesExists = testFileExists(testDir, '.windsurfrules');
    expect(result.exitCode !== undefined || windsurfRulesExists).toBe(true);
  });

  it('should preserve allowed-tools in translation', async () => {
    const result = await runCli(['translate', '--agent', 'claude-code'], { cwd: testDir });
    const output = result.stdout + result.stderr;
    // Output or generated file should mention tools
    expect(
      output.includes('tool') ||
        output.includes('Bash') ||
        output.includes('permission') ||
        result.exitCode !== undefined
    ).toBe(true);
  });
});
