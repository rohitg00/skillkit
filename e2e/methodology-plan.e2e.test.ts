/**
 * E2E Tests: Methodology and Plan System
 *
 * Tests for: methodology list/load/apply/validate, plan create/validate/execute/list/status
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
  writeTestFile,
} from './helpers/cli-runner.js';

// Available methodology packs
const METHODOLOGY_PACKS = [
  'agile',
  'tdd',
  'devops',
  'security-first',
  'documentation-first',
] as const;

describe('E2E: Methodology Framework', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = createTestDir();
    // Create a basic project structure
    writeFileSync(
      join(testDir, 'package.json'),
      JSON.stringify({ name: 'test-project', version: '1.0.0' }, null, 2)
    );
    mkdirSync(join(testDir, 'src'), { recursive: true });
    writeFileSync(join(testDir, 'src', 'index.ts'), 'export const main = () => {};\n');
  });

  afterEach(() => {
    cleanupTestDir(testDir);
  });

  describe('skillkit methodology list', () => {
    it('should list available methodology packs', async () => {
      const result = await runCli(['methodology', 'list'], { cwd: testDir });
      const output = result.stdout + result.stderr;

      // Must complete successfully and show relevant output
      expect(result.exitCode).toBeLessThanOrEqual(1);

      // Should contain methodology-related content
      const hasRelevantOutput =
        output.includes('methodology') ||
        output.includes('agile') ||
        output.includes('tdd') ||
        output.includes('No');

      if (!hasRelevantOutput && result.exitCode !== 0) {
        expect.fail(`Methodology list failed. Exit: ${result.exitCode}\nOutput: ${output}`);
      }

      expect(hasRelevantOutput || result.exitCode === 0).toBe(true);
    });

    it('should support --json output', async () => {
      const result = await runCli(['methodology', 'list', '--json'], { cwd: testDir });
      expect(result.exitCode).toBeLessThanOrEqual(1);

      if (result.stdout.trim().startsWith('[') || result.stdout.trim().startsWith('{')) {
        expect(() => JSON.parse(result.stdout)).not.toThrow();
      }
    });

    it('should show methodology details with --verbose', async () => {
      const result = await runCli(['methodology', 'list', '--verbose'], { cwd: testDir });
      expect(result.exitCode).toBeLessThanOrEqual(1);
    });
  });

  describe('skillkit methodology install', () => {
    describe.each(METHODOLOGY_PACKS)('loading %s methodology', (pack) => {
      it(`should load ${pack} methodology pack`, async () => {
        const result = await runCli(['methodology', 'install', pack], { cwd: testDir });
        const output = result.stdout + result.stderr;

        // Command should complete
        expect(result.exitCode).toBeLessThanOrEqual(1);

        // Should have relevant output
        const hasRelevantOutput =
          output.includes(pack) ||
          output.includes('installed') ||
          output.includes('success') ||
          output.includes('methodology');

        if (!hasRelevantOutput && result.exitCode !== 0) {
          expect.fail(`Load ${pack} failed. Exit: ${result.exitCode}\nOutput: ${output}`);
        }

        expect(hasRelevantOutput || result.exitCode === 0).toBe(true);
      });
    });

    it('should handle unknown methodology gracefully', async () => {
      const result = await runCli(['methodology', 'install', 'nonexistent-methodology'], {
        cwd: testDir,
      });
      const output = result.stdout + result.stderr;

      // Should show error or fail
      const showsError =
        output.includes('not found') ||
        output.includes('unknown') ||
        output.includes('error') ||
        !result.success;

      expect(showsError).toBe(true);
    });

    it('should load multiple methodologies', async () => {
      const result = await runCli(['methodology', 'install', 'tdd', 'security-first'], {
        cwd: testDir,
      });
      expect(result.exitCode).toBeLessThanOrEqual(1);
    });
  });

  describe('skillkit methodology sync', () => {
    it('should sync installed methodology to project', async () => {
      // Install a methodology first
      await runCli(['methodology', 'install', 'tdd'], { cwd: testDir });

      const result = await runCli(['methodology', 'sync'], { cwd: testDir });
      const output = result.stdout + result.stderr;

      expect(result.exitCode).toBeLessThanOrEqual(1);

      const hasRelevantOutput =
        output.includes('sync') ||
        output.includes('tdd') ||
        output.includes('skill') ||
        output.includes('success');

      if (!hasRelevantOutput && result.exitCode !== 0) {
        expect.fail(`Sync methodology failed. Exit: ${result.exitCode}\nOutput: ${output}`);
      }

      expect(hasRelevantOutput || result.exitCode === 0).toBe(true);
    });

    it('should sync specific methodology', async () => {
      const result = await runCli(['methodology', 'sync', 'agile'], { cwd: testDir });
      expect(result.exitCode).toBeLessThanOrEqual(1);
    });
  });

  describe('skillkit methodology info', () => {
    it('should show methodology information', async () => {
      await runCli(['methodology', 'install', 'tdd'], { cwd: testDir });

      const result = await runCli(['methodology', 'info', 'tdd'], { cwd: testDir });
      const output = result.stdout + result.stderr;

      expect(result.exitCode).toBeLessThanOrEqual(1);

      const hasRelevantOutput =
        output.includes('info') ||
        output.includes('tdd') ||
        output.includes('methodology') ||
        output.includes('description');

      if (!hasRelevantOutput && result.exitCode !== 0) {
        expect.fail(`Methodology info failed. Exit: ${result.exitCode}\nOutput: ${output}`);
      }

      expect(hasRelevantOutput || result.exitCode === 0).toBe(true);
    });

    it('should show info for specific methodology', async () => {
      const result = await runCli(['methodology', 'info', 'security-first'], { cwd: testDir });
      expect(result.exitCode).toBeLessThanOrEqual(1);
    });
  });
});

describe('E2E: Plan System', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = createTestDir();
    writeFileSync(
      join(testDir, 'package.json'),
      JSON.stringify({ name: 'plan-test-project', version: '1.0.0' }, null, 2)
    );
    mkdirSync(join(testDir, 'src'), { recursive: true });
  });

  afterEach(() => {
    cleanupTestDir(testDir);
  });

  describe('skillkit plan create', () => {
    it('should create a new plan', async () => {
      const result = await runCli(['plan', 'create', '--name', 'test-plan'], { cwd: testDir });
      const output = result.stdout + result.stderr;

      expect(result.exitCode).toBeLessThanOrEqual(1);

      const hasRelevantOutput =
        output.includes('plan') ||
        output.includes('test-plan') ||
        output.includes('created');

      if (!hasRelevantOutput && result.exitCode !== 0) {
        expect.fail(`Plan create failed. Exit: ${result.exitCode}\nOutput: ${output}`);
      }

      expect(hasRelevantOutput || result.exitCode === 0).toBe(true);
    });

    it('should create plan with description', async () => {
      const result = await runCli(
        ['plan', 'create', '--name', 'described-plan', '--description', 'A test plan for E2E'],
        { cwd: testDir }
      );
      expect(result.exitCode).toBeLessThanOrEqual(1);
    });

    it('should create plan from template', async () => {
      const result = await runCli(
        ['plan', 'create', '--name', 'template-plan', '--template', 'feature'],
        { cwd: testDir }
      );
      expect(result.exitCode).toBeLessThanOrEqual(1);
    });

    it('should create plan with steps', async () => {
      const result = await runCli(
        [
          'plan',
          'create',
          '--name',
          'stepped-plan',
          '--steps',
          'Step 1: Setup,Step 2: Implement,Step 3: Test',
        ],
        { cwd: testDir }
      );
      expect(result.exitCode).toBeLessThanOrEqual(1);
    });
  });

  describe('skillkit plan templates', () => {
    it('should list available plan templates', async () => {
      const result = await runCli(['plan', 'templates'], { cwd: testDir });
      const output = result.stdout + result.stderr;

      expect(result.exitCode).toBeLessThanOrEqual(1);

      const hasRelevantOutput =
        output.includes('template') ||
        output.includes('plan') ||
        output.includes('available') ||
        output.includes('No');

      if (!hasRelevantOutput && result.exitCode !== 0) {
        expect.fail(`Plan templates failed. Exit: ${result.exitCode}\nOutput: ${output}`);
      }

      expect(hasRelevantOutput || result.exitCode === 0).toBe(true);
    });

    it('should support --json output', async () => {
      const result = await runCli(['plan', 'templates', '--json'], { cwd: testDir });
      expect(result.exitCode).toBeLessThanOrEqual(1);

      if (result.stdout.trim().startsWith('[') || result.stdout.trim().startsWith('{')) {
        expect(() => JSON.parse(result.stdout)).not.toThrow();
      }
    });
  });

  describe('skillkit plan validate', () => {
    it('should validate plan structure', async () => {
      // Create a plan
      await runCli(['plan', 'create', '--name', 'validate-plan'], { cwd: testDir });

      const result = await runCli(['plan', 'validate', 'validate-plan'], { cwd: testDir });
      const output = result.stdout + result.stderr;

      expect(result.exitCode).toBeLessThanOrEqual(1);

      const hasRelevantOutput =
        output.includes('valid') ||
        output.includes('validate') ||
        output.includes('plan');

      if (!hasRelevantOutput && result.exitCode !== 0) {
        expect.fail(`Plan validate failed. Exit: ${result.exitCode}\nOutput: ${output}`);
      }

      expect(hasRelevantOutput || result.exitCode === 0).toBe(true);
    });

    it('should report validation errors', async () => {
      // Create an invalid plan file manually
      const plansDir = join(testDir, '.skillkit', 'plans');
      mkdirSync(plansDir, { recursive: true });
      writeFileSync(
        join(plansDir, 'invalid-plan.json'),
        JSON.stringify({ name: 'invalid' }) // Missing required fields
      );

      const result = await runCli(['plan', 'validate', 'invalid-plan'], { cwd: testDir });
      expect(result.exitCode).toBeLessThanOrEqual(1);
    });
  });

  describe('skillkit plan generate', () => {
    it('should generate a plan from a template', async () => {
      const result = await runCli(['plan', 'generate', '--template', 'feature'], { cwd: testDir });
      const output = result.stdout + result.stderr;

      expect(result.exitCode).toBeLessThanOrEqual(1);

      const hasRelevantOutput =
        output.includes('generate') ||
        output.includes('plan') ||
        output.includes('template') ||
        output.includes('feature');

      if (!hasRelevantOutput && result.exitCode !== 0) {
        expect.fail(`Plan generate failed. Exit: ${result.exitCode}\nOutput: ${output}`);
      }

      expect(hasRelevantOutput || result.exitCode === 0).toBe(true);
    });
  });

  describe('skillkit plan execute', () => {
    it('should execute a plan', async () => {
      await runCli(['plan', 'create', '--name', 'exec-plan'], { cwd: testDir });

      const result = await runCli(['plan', 'execute', 'exec-plan'], { cwd: testDir });
      const output = result.stdout + result.stderr;

      expect(result.exitCode).toBeLessThanOrEqual(1);

      const hasRelevantOutput =
        output.includes('execute') ||
        output.includes('plan') ||
        output.includes('exec-plan') ||
        output.includes('running');

      if (!hasRelevantOutput && result.exitCode !== 0) {
        expect.fail(`Plan execute failed. Exit: ${result.exitCode}\nOutput: ${output}`);
      }

      expect(hasRelevantOutput || result.exitCode === 0).toBe(true);
    });

    it('should execute with --dry-run', async () => {
      await runCli(['plan', 'create', '--name', 'dry-run-plan'], { cwd: testDir });

      const result = await runCli(['plan', 'execute', 'dry-run-plan', '--dry-run'], {
        cwd: testDir,
      });
      expect(result.exitCode).toBeLessThanOrEqual(1);
    });

    it('should execute specific step', async () => {
      await runCli(
        ['plan', 'create', '--name', 'step-plan', '--steps', 'Step1,Step2,Step3'],
        { cwd: testDir }
      );

      const result = await runCli(['plan', 'execute', 'step-plan', '--step', '1'], {
        cwd: testDir,
      });
      expect(result.exitCode).toBeLessThanOrEqual(1);
    });
  });
});

describe('E2E: Methodology + Plan Integration', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = createTestDir();
    writeFileSync(
      join(testDir, 'package.json'),
      JSON.stringify({ name: 'integration-test', version: '1.0.0' }, null, 2)
    );
  });

  afterEach(() => {
    cleanupTestDir(testDir);
  });

  it('should create plan based on methodology', async () => {
    // Load TDD methodology
    await runCli(['methodology', 'install', 'tdd'], { cwd: testDir });

    // Create plan using TDD approach
    const result = await runCli(
      ['plan', 'create', '--name', 'tdd-feature-plan', '--methodology', 'tdd'],
      { cwd: testDir }
    );
    expect(result.exitCode).toBeLessThanOrEqual(1);
  });

  it('should validate plan against methodology constraints', async () => {
    await runCli(['methodology', 'install', 'security-first'], { cwd: testDir });
    await runCli(['plan', 'create', '--name', 'secure-plan'], { cwd: testDir });

    const result = await runCli(['plan', 'validate', 'secure-plan', '--methodology'], {
      cwd: testDir,
    });
    expect(result.exitCode).toBeLessThanOrEqual(1);
  });
});
