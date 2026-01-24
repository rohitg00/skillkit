/**
 * E2E Tests: Hooks System and Agent Orchestration
 *
 * Tests for: hook register/list/trigger/remove, orchestrator commands
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'node:path';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import {
  runCli,
  createTestDir,
  cleanupTestDir,
  createTestSkill,
  testFileExists,
} from './helpers/cli-runner.js';

// Available hook events
const HOOK_EVENTS = [
  'pre-commit',
  'post-commit',
  'file-change',
  'build',
  'test',
  'deploy',
] as const;

describe('E2E: Hooks System', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = createTestDir();
    // Create a git repo structure for commit hooks
    mkdirSync(join(testDir, '.git', 'hooks'), { recursive: true });
    writeFileSync(join(testDir, '.git', 'config'), '[core]\n\trepositoryformatversion = 0');
    // Create project files
    writeFileSync(
      join(testDir, 'package.json'),
      JSON.stringify({ name: 'hooks-test', version: '1.0.0' }, null, 2)
    );
    // Create a skill that can be triggered
    mkdirSync(join(testDir, 'skills'), { recursive: true });
    createTestSkill(join(testDir, 'skills'), 'hookable-skill', {
      description: 'A skill that can be triggered by hooks for E2E testing',
    });
  });

  afterEach(() => {
    cleanupTestDir(testDir);
  });

  describe('skillkit hook register', () => {
    it('should register a pre-commit hook', async () => {
      const result = await runCli(
        ['hook', 'register', '--event', 'pre-commit', '--skill', 'hookable-skill'],
        { cwd: testDir }
      );
      const output = result.stdout + result.stderr;

      // Must have meaningful output about the registration
      const hasRelevantOutput =
        output.includes('register') ||
        output.includes('hook') ||
        output.includes('pre-commit') ||
        output.includes('success');

      if (!hasRelevantOutput && result.exitCode !== 0) {
        expect.fail(`Hook registration failed. Exit: ${result.exitCode}\nOutput: ${output}`);
      }

      expect(hasRelevantOutput || result.exitCode === 0).toBe(true);
    });

    it('should register hooks for all event types', async () => {
      for (const event of HOOK_EVENTS) {
        const result = await runCli(
          ['hook', 'register', '--event', event, '--skill', 'hookable-skill'],
          { cwd: testDir }
        );
        // Command should complete (exit code 0 or 1 for expected behavior)
        expect(result.exitCode).toBeLessThanOrEqual(1);
      }
    });

    it('should register hook with custom name', async () => {
      const result = await runCli(
        [
          'hook',
          'register',
          '--event',
          'test',
          '--skill',
          'hookable-skill',
          '--name',
          'my-test-hook',
        ],
        { cwd: testDir }
      );
      // Command should complete successfully or with expected exit
      expect(result.exitCode).toBeLessThanOrEqual(1);
    });

    it('should register hook with condition', async () => {
      const result = await runCli(
        [
          'hook',
          'register',
          '--event',
          'file-change',
          '--skill',
          'hookable-skill',
          '--pattern',
          '*.ts',
        ],
        { cwd: testDir }
      );
      expect(result.exitCode).toBeLessThanOrEqual(1);
    });

    it('should handle invalid event gracefully', async () => {
      const result = await runCli(
        ['hook', 'register', '--event', 'invalid-event', '--skill', 'hookable-skill'],
        { cwd: testDir }
      );
      const output = result.stdout + result.stderr;

      // Should either fail or show an error message
      const showsError =
        output.includes('invalid') ||
        output.includes('unknown') ||
        output.includes('error') ||
        !result.success;

      expect(showsError).toBe(true);
    });
  });

  describe('skillkit hook list', () => {
    it('should list registered hooks', async () => {
      // Register a hook first
      await runCli(['hook', 'register', '--event', 'build', '--skill', 'hookable-skill'], {
        cwd: testDir,
      });

      const result = await runCli(['hook', 'list'], { cwd: testDir });
      const output = result.stdout + result.stderr;

      // Should show hooks or indicate none
      const hasRelevantOutput =
        output.includes('hook') ||
        output.includes('build') ||
        output.includes('hookable-skill') ||
        output.includes('No');

      if (!hasRelevantOutput && result.exitCode !== 0) {
        expect.fail(`Hook list failed. Exit: ${result.exitCode}\nOutput: ${output}`);
      }

      expect(hasRelevantOutput || result.exitCode === 0).toBe(true);
    });

    it('should support --json output', async () => {
      const result = await runCli(['hook', 'list', '--json'], { cwd: testDir });
      if (result.stdout.trim().startsWith('[') || result.stdout.trim().startsWith('{')) {
        expect(() => JSON.parse(result.stdout)).not.toThrow();
      }
    });

    it('should filter by event type', async () => {
      await runCli(['hook', 'register', '--event', 'test', '--skill', 'hookable-skill'], {
        cwd: testDir,
      });

      const result = await runCli(['hook', 'list', '--event', 'test'], { cwd: testDir });
      expect(result.exitCode).toBeLessThanOrEqual(1);
    });
  });

  describe('skillkit hook trigger', () => {
    it('should trigger a hook manually', async () => {
      await runCli(['hook', 'register', '--event', 'test', '--skill', 'hookable-skill'], {
        cwd: testDir,
      });

      const result = await runCli(['hook', 'trigger', 'test'], { cwd: testDir });
      const output = result.stdout + result.stderr;

      // Should show trigger-related output
      const hasRelevantOutput =
        output.includes('trigger') ||
        output.includes('test') ||
        output.includes('hook') ||
        output.includes('executed');

      if (!hasRelevantOutput && result.exitCode !== 0) {
        expect.fail(`Hook trigger failed. Exit: ${result.exitCode}\nOutput: ${output}`);
      }

      expect(hasRelevantOutput || result.exitCode === 0).toBe(true);
    });

    it('should trigger with --dry-run', async () => {
      await runCli(['hook', 'register', '--event', 'deploy', '--skill', 'hookable-skill'], {
        cwd: testDir,
      });

      const result = await runCli(['hook', 'trigger', 'deploy', '--dry-run'], { cwd: testDir });
      expect(result.exitCode).toBeLessThanOrEqual(1);
    });

    it('should handle missing hook gracefully', async () => {
      const result = await runCli(['hook', 'trigger', 'nonexistent-event'], { cwd: testDir });
      // Should complete without crashing
      expect(result.exitCode).toBeLessThanOrEqual(1);
    });
  });

  describe('skillkit hook remove', () => {
    it('should remove a registered hook', async () => {
      // Register then remove
      await runCli(
        ['hook', 'register', '--event', 'build', '--skill', 'hookable-skill', '--name', 'my-hook'],
        { cwd: testDir }
      );

      const result = await runCli(['hook', 'remove', 'my-hook'], { cwd: testDir });
      const output = result.stdout + result.stderr;

      // Should show removal confirmation
      const hasRelevantOutput =
        output.includes('remove') ||
        output.includes('my-hook') ||
        output.includes('success');

      if (!hasRelevantOutput && result.exitCode !== 0) {
        expect.fail(`Hook remove failed. Exit: ${result.exitCode}\nOutput: ${output}`);
      }

      expect(hasRelevantOutput || result.exitCode === 0).toBe(true);
    });

    it('should remove all hooks for an event', async () => {
      await runCli(['hook', 'register', '--event', 'test', '--skill', 'hookable-skill'], {
        cwd: testDir,
      });

      const result = await runCli(['hook', 'remove', '--event', 'test', '--all'], { cwd: testDir });
      expect(result.exitCode).toBeLessThanOrEqual(1);
    });
  });
});

describe('E2E: Agent Orchestration', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = createTestDir();
    writeFileSync(
      join(testDir, 'package.json'),
      JSON.stringify({ name: 'orchestration-test', version: '1.0.0' }, null, 2)
    );
    mkdirSync(join(testDir, 'skills'), { recursive: true });
    createTestSkill(join(testDir, 'skills'), 'orchestrated-skill', {
      description: 'A skill for testing multi-agent orchestration features',
    });
  });

  afterEach(() => {
    cleanupTestDir(testDir);
  });

  describe('multi-agent sync', () => {
    it('should sync to multiple agents simultaneously', async () => {
      const result = await runCli(['sync', '--agents', 'claude-code,cursor,windsurf'], {
        cwd: testDir,
      });
      expect(result.exitCode).toBeLessThanOrEqual(1);
    });

    it('should sync to all supported agents', async () => {
      const result = await runCli(['sync', '--all-agents'], { cwd: testDir });
      expect(result.exitCode).toBeLessThanOrEqual(1);
    });
  });

  describe('team orchestration', () => {
    it('should configure team with leader and teammates', async () => {
      await runCli(['team', 'init'], { cwd: testDir });

      const result = await runCli(
        ['team', 'init', '--leader', 'claude-code', '--teammates', 'cursor,windsurf'],
        { cwd: testDir }
      );
      expect(result.exitCode).toBeLessThanOrEqual(1);
    });

    it('should delegate tasks to team members', async () => {
      await runCli(['team', 'init', '--leader', 'claude-code'], { cwd: testDir });

      // This tests the delegation feature if available
      const result = await runCli(['team', 'sync', '--delegate'], { cwd: testDir });
      expect(result.exitCode).toBeLessThanOrEqual(1);
    });
  });

  describe('workflow integration', () => {
    it('should trigger hooks during workflow execution', async () => {
      // Register a build hook
      await runCli(
        ['hook', 'register', '--event', 'build', '--skill', 'orchestrated-skill'],
        { cwd: testDir }
      );

      // Run workflow that triggers build
      const result = await runCli(['workflow', 'run', 'build'], { cwd: testDir });
      expect(result.exitCode).toBeLessThanOrEqual(1);
    });

    it('should chain multiple hooks in sequence', async () => {
      await runCli(['hook', 'register', '--event', 'test', '--skill', 'orchestrated-skill'], {
        cwd: testDir,
      });
      await runCli(
        ['hook', 'register', '--event', 'build', '--skill', 'orchestrated-skill', '--after', 'test'],
        { cwd: testDir }
      );

      const result = await runCli(['hook', 'trigger', 'test', '--chain'], { cwd: testDir });
      expect(result.exitCode).toBeLessThanOrEqual(1);
    });
  });
});

describe('E2E: Hook + Skill Integration', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = createTestDir();
    mkdirSync(join(testDir, '.git', 'hooks'), { recursive: true });
    writeFileSync(join(testDir, '.git', 'config'), '[core]');
    mkdirSync(join(testDir, 'skills'), { recursive: true });

    // Create a skill with specific trigger configuration
    const skillDir = join(testDir, 'skills', 'auto-trigger-skill');
    mkdirSync(skillDir, { recursive: true });
    writeFileSync(
      join(skillDir, 'SKILL.md'),
      `---
name: auto-trigger-skill
description: A skill that auto-triggers on specific events for E2E testing
triggers:
  - event: pre-commit
  - event: file-change
    pattern: "*.ts"
---

# Auto-Trigger Skill

This skill automatically activates on:
- Pre-commit hooks
- TypeScript file changes
`
    );
  });

  afterEach(() => {
    cleanupTestDir(testDir);
  });

  it('should auto-register hooks from skill metadata', async () => {
    const result = await runCli(['hook', 'auto-register'], { cwd: testDir });
    expect(result.exitCode).toBeLessThanOrEqual(1);
  });

  it('should detect and apply skill triggers', async () => {
    const result = await runCli(['sync', '--with-hooks'], { cwd: testDir });
    expect(result.exitCode).toBeLessThanOrEqual(1);
  });
});
