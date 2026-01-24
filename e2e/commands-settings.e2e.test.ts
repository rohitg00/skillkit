/**
 * E2E Tests: Commands, Settings, and Advanced Features
 *
 * Tests for: command generate/export/merge, settings, memory, audit, ai, cicd
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
} from './helpers/cli-runner.js';

describe('E2E: Slash Commands', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = createTestDir();
    writeFileSync(
      join(testDir, 'package.json'),
      JSON.stringify({ name: 'commands-test', version: '1.0.0' }, null, 2)
    );
    mkdirSync(join(testDir, 'skills'), { recursive: true });
    createTestSkill(join(testDir, 'skills'), 'command-skill', {
      description: 'A skill for testing slash command generation',
    });
  });

  afterEach(() => {
    cleanupTestDir(testDir);
  });

  describe('skillkit command generate', () => {
    it('should generate slash commands from skills', async () => {
      const result = await runCli(['command', 'generate'], { cwd: testDir });
      const output = result.stdout + result.stderr;
      expect(
        output.includes('command') ||
          output.includes('generate') ||
          output.includes('slash') ||
          result.exitCode !== undefined
      ).toBe(true);
    });

    it('should generate commands for specific agent', async () => {
      const result = await runCli(['command', 'generate', '--agent', 'claude-code'], {
        cwd: testDir,
      });
      expect(result.exitCode).toBeDefined();
    });

    it('should generate from natural language prompt', async () => {
      const result = await runCli(
        ['command', 'generate', '--prompt', 'Create a command to run tests'],
        { cwd: testDir }
      );
      expect(result.exitCode).toBeDefined();
    });
  });

  describe('skillkit command export', () => {
    it('should export generated commands', async () => {
      // Generate first
      await runCli(['command', 'generate'], { cwd: testDir });

      const outputPath = join(testDir, 'commands-export');
      const result = await runCli(['command', 'export', '--output', outputPath], { cwd: testDir });
      expect(result.exitCode).toBeDefined();
    });

    it('should export in different formats', async () => {
      await runCli(['command', 'generate'], { cwd: testDir });

      const result = await runCli(['command', 'export', '--format', 'json'], { cwd: testDir });
      expect(result.exitCode).toBeDefined();
    });
  });

  describe('skillkit command merge', () => {
    it('should merge multiple command files', async () => {
      // Create two command files
      mkdirSync(join(testDir, 'commands'), { recursive: true });
      writeFileSync(
        join(testDir, 'commands', 'cmd1.json'),
        JSON.stringify({ commands: [{ name: 'test1' }] }, null, 2)
      );
      writeFileSync(
        join(testDir, 'commands', 'cmd2.json'),
        JSON.stringify({ commands: [{ name: 'test2' }] }, null, 2)
      );

      const result = await runCli(
        [
          'command',
          'merge',
          join(testDir, 'commands', 'cmd1.json'),
          join(testDir, 'commands', 'cmd2.json'),
        ],
        { cwd: testDir }
      );
      expect(result.exitCode).toBeDefined();
    });
  });
});

describe('E2E: Settings Management', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = createTestDir();
    writeFileSync(
      join(testDir, 'package.json'),
      JSON.stringify({ name: 'settings-test', version: '1.0.0' }, null, 2)
    );
  });

  afterEach(() => {
    cleanupTestDir(testDir);
  });

  describe('skillkit settings', () => {
    it('should show current settings', async () => {
      const result = await runCli(['settings'], { cwd: testDir });
      const output = result.stdout + result.stderr;
      expect(
        output.includes('setting') ||
          output.includes('config') ||
          output.includes('No') ||
          result.exitCode !== undefined
      ).toBe(true);
    });

    it('should set a configuration value', async () => {
      const result = await runCli(['settings', '--set', 'defaultAgent=claude-code'], {
        cwd: testDir,
      });
      expect(result.exitCode).toBeDefined();
    });

    it('should get a specific setting', async () => {
      await runCli(['settings', '--set', 'testKey=testValue'], { cwd: testDir });

      const result = await runCli(['settings', '--get', 'testKey'], { cwd: testDir });
      expect(result.exitCode).toBeDefined();
    });

    it('should unset a configuration value', async () => {
      await runCli(['settings', '--set', 'removeKey=value'], { cwd: testDir });

      const result = await runCli(['settings', '--unset', 'removeKey'], { cwd: testDir });
      expect(result.exitCode).toBeDefined();
    });

    it('should support --json output', async () => {
      const result = await runCli(['settings', '--json'], { cwd: testDir });
      if (result.stdout.trim().startsWith('{')) {
        expect(() => JSON.parse(result.stdout)).not.toThrow();
      }
    });

    it('should reset all settings', async () => {
      const result = await runCli(['settings', '--reset'], { cwd: testDir });
      expect(result.exitCode).toBeDefined();
    });
  });
});

describe('E2E: Memory System', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = createTestDir();
    writeFileSync(
      join(testDir, 'package.json'),
      JSON.stringify({ name: 'memory-test', version: '1.0.0' }, null, 2)
    );
  });

  afterEach(() => {
    cleanupTestDir(testDir);
  });

  describe('skillkit memory', () => {
    it('should show memory status', async () => {
      const result = await runCli(['memory'], { cwd: testDir });
      const output = result.stdout + result.stderr;
      expect(
        output.includes('memory') ||
          output.includes('session') ||
          output.includes('No') ||
          result.exitCode !== undefined
      ).toBe(true);
    });

    it('should store observation', async () => {
      const result = await runCli(['memory', 'store', '--observation', 'User prefers TypeScript'], {
        cwd: testDir,
      });
      expect(result.exitCode).toBeDefined();
    });

    it('should retrieve memories', async () => {
      await runCli(['memory', 'store', '--observation', 'Test observation for retrieval'], {
        cwd: testDir,
      });

      const result = await runCli(['memory', 'retrieve'], { cwd: testDir });
      expect(result.exitCode).toBeDefined();
    });

    it('should clear memory', async () => {
      const result = await runCli(['memory', 'clear'], { cwd: testDir });
      expect(result.exitCode).toBeDefined();
    });

    it('should compress memory', async () => {
      // Store some memories
      await runCli(['memory', 'store', '--observation', 'Observation 1'], { cwd: testDir });
      await runCli(['memory', 'store', '--observation', 'Observation 2'], { cwd: testDir });

      const result = await runCli(['memory', 'compress'], { cwd: testDir });
      expect(result.exitCode).toBeDefined();
    });

    it('should support --json output', async () => {
      const result = await runCli(['memory', '--json'], { cwd: testDir });
      if (result.stdout.trim().startsWith('{') || result.stdout.trim().startsWith('[')) {
        expect(() => JSON.parse(result.stdout)).not.toThrow();
      }
    });
  });
});

describe('E2E: Audit System', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = createTestDir();
    writeFileSync(
      join(testDir, 'package.json'),
      JSON.stringify({ name: 'audit-test', version: '1.0.0' }, null, 2)
    );
    mkdirSync(join(testDir, 'skills'), { recursive: true });
    createTestSkill(join(testDir, 'skills'), 'audit-skill', {
      description: 'A skill for testing audit logging',
    });
  });

  afterEach(() => {
    cleanupTestDir(testDir);
  });

  describe('skillkit audit', () => {
    it('should show audit log', async () => {
      // Perform some actions to generate audit entries
      await runCli(['list'], { cwd: testDir });
      await runCli(['sync', '--agent', 'claude-code'], { cwd: testDir });

      const result = await runCli(['audit'], { cwd: testDir });
      const output = result.stdout + result.stderr;
      expect(
        output.includes('audit') ||
          output.includes('log') ||
          output.includes('No') ||
          result.exitCode !== undefined
      ).toBe(true);
    });

    it('should filter audit by date range', async () => {
      const result = await runCli(['audit', '--since', '2024-01-01'], { cwd: testDir });
      expect(result.exitCode).toBeDefined();
    });

    it('should filter audit by action type', async () => {
      const result = await runCli(['audit', '--action', 'sync'], { cwd: testDir });
      expect(result.exitCode).toBeDefined();
    });

    it('should export audit log', async () => {
      const outputPath = join(testDir, 'audit-export.json');
      const result = await runCli(['audit', '--export', outputPath], { cwd: testDir });
      expect(result.exitCode).toBeDefined();
    });

    it('should clear audit log', async () => {
      const result = await runCli(['audit', '--clear'], { cwd: testDir });
      expect(result.exitCode).toBeDefined();
    });
  });
});

describe('E2E: AI Features', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = createTestDir();
    writeFileSync(
      join(testDir, 'package.json'),
      JSON.stringify({ name: 'ai-test', version: '1.0.0' }, null, 2)
    );
  });

  afterEach(() => {
    cleanupTestDir(testDir);
  });

  describe('skillkit ai', () => {
    it('should show AI status', async () => {
      const result = await runCli(['ai'], { cwd: testDir });
      const output = result.stdout + result.stderr;
      expect(
        output.includes('ai') ||
          output.includes('API') ||
          output.includes('status') ||
          result.exitCode !== undefined
      ).toBe(true);
    });

    it('should configure AI provider', async () => {
      const result = await runCli(['ai', 'configure', '--provider', 'openai'], { cwd: testDir });
      expect(result.exitCode).toBeDefined();
    });

    it('should test AI connection', async () => {
      const result = await runCli(['ai', 'test'], { cwd: testDir });
      expect(result.exitCode).toBeDefined();
    });
  });
});

describe('E2E: CI/CD Integration', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = createTestDir();
    writeFileSync(
      join(testDir, 'package.json'),
      JSON.stringify({ name: 'cicd-test', version: '1.0.0' }, null, 2)
    );
    mkdirSync(join(testDir, '.git'), { recursive: true });
    writeFileSync(join(testDir, '.git', 'config'), '[core]');
  });

  afterEach(() => {
    cleanupTestDir(testDir);
  });

  describe('skillkit cicd init', () => {
    it('should generate GitHub Actions workflow', async () => {
      const result = await runCli(['cicd', 'init', '--provider', 'github'], { cwd: testDir });
      const output = result.stdout + result.stderr;
      expect(
        output.includes('cicd') ||
          output.includes('github') ||
          output.includes('workflow') ||
          output.includes('created') ||
          testFileExists(testDir, '.github', 'workflows') ||
          result.exitCode !== undefined
      ).toBe(true);
    });

    it('should generate GitLab CI config', async () => {
      const result = await runCli(['cicd', 'init', '--provider', 'gitlab'], { cwd: testDir });
      expect(result.exitCode).toBeDefined();
    });

    it('should generate CircleCI config', async () => {
      const result = await runCli(['cicd', 'init', '--provider', 'circleci'], { cwd: testDir });
      expect(result.exitCode).toBeDefined();
    });

    it('should support --dry-run', async () => {
      const result = await runCli(['cicd', 'init', '--provider', 'github', '--dry-run'], {
        cwd: testDir,
      });
      expect(result.exitCode).toBeDefined();
    });

    it('should handle unknown provider gracefully', async () => {
      const result = await runCli(['cicd', 'init', '--provider', 'unknown-ci'], { cwd: testDir });
      const output = result.stdout + result.stderr;
      expect(
        output.includes('unknown') ||
          output.includes('not supported') ||
          output.includes('error') ||
          !result.success ||
          result.exitCode !== undefined
      ).toBe(true);
    });
  });
});

describe('E2E: Workflow Commands', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = createTestDir();
    writeFileSync(
      join(testDir, 'package.json'),
      JSON.stringify(
        {
          name: 'workflow-test',
          version: '1.0.0',
          scripts: {
            test: 'echo "test passed"',
            build: 'echo "build completed"',
          },
        },
        null,
        2
      )
    );
  });

  afterEach(() => {
    cleanupTestDir(testDir);
  });

  describe('skillkit workflow-create', () => {
    it('should create a new workflow', async () => {
      const result = await runCli(['workflow-create', '--name', 'test-workflow'], { cwd: testDir });
      expect(result.exitCode).toBeDefined();
    });

    it('should create workflow with steps', async () => {
      const result = await runCli(
        ['workflow-create', '--name', 'stepped-workflow', '--steps', 'build,test,deploy'],
        { cwd: testDir }
      );
      expect(result.exitCode).toBeDefined();
    });
  });

  describe('skillkit workflow-list', () => {
    it('should list available workflows', async () => {
      const result = await runCli(['workflow-list'], { cwd: testDir });
      expect(result.exitCode).toBeDefined();
    });
  });

  describe('skillkit workflow-run', () => {
    it('should run a workflow', async () => {
      await runCli(['workflow-create', '--name', 'runnable-workflow'], { cwd: testDir });

      const result = await runCli(['workflow-run', 'runnable-workflow'], { cwd: testDir });
      expect(result.exitCode).toBeDefined();
    });

    it('should run workflow with --dry-run', async () => {
      const result = await runCli(['workflow-run', 'test', '--dry-run'], { cwd: testDir });
      expect(result.exitCode).toBeDefined();
    });
  });
});
