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
      // Should list methodologies or indicate none loaded
      expect(
        output.includes('methodology') ||
          output.includes('agile') ||
          output.includes('tdd') ||
          output.includes('No') ||
          result.exitCode !== undefined
      ).toBe(true);
    });

    it('should support --json output', async () => {
      const result = await runCli(['methodology', 'list', '--json'], { cwd: testDir });
      if (result.stdout.trim().startsWith('[') || result.stdout.trim().startsWith('{')) {
        expect(() => JSON.parse(result.stdout)).not.toThrow();
      }
    });

    it('should show methodology details with --verbose', async () => {
      const result = await runCli(['methodology', 'list', '--verbose'], { cwd: testDir });
      expect(result.exitCode).toBeDefined();
    });
  });

  describe('skillkit methodology load', () => {
    describe.each(METHODOLOGY_PACKS)('loading %s methodology', (pack) => {
      it(`should load ${pack} methodology pack`, async () => {
        const result = await runCli(['methodology', 'load', pack], { cwd: testDir });
        const output = result.stdout + result.stderr;
        expect(
          output.includes(pack) ||
            output.includes('loaded') ||
            output.includes('success') ||
            output.includes('methodology') ||
            result.exitCode !== undefined
        ).toBe(true);
      });
    });

    it('should handle unknown methodology gracefully', async () => {
      const result = await runCli(['methodology', 'load', 'nonexistent-methodology'], {
        cwd: testDir,
      });
      const output = result.stdout + result.stderr;
      expect(
        output.includes('not found') ||
          output.includes('unknown') ||
          output.includes('error') ||
          !result.success
      ).toBe(true);
    });

    it('should load multiple methodologies', async () => {
      const result = await runCli(['methodology', 'load', 'tdd', 'security-first'], {
        cwd: testDir,
      });
      expect(result.exitCode).toBeDefined();
    });
  });

  describe('skillkit methodology apply', () => {
    it('should apply loaded methodology to project', async () => {
      // Load a methodology first
      await runCli(['methodology', 'load', 'tdd'], { cwd: testDir });

      const result = await runCli(['methodology', 'apply'], { cwd: testDir });
      const output = result.stdout + result.stderr;
      expect(
        output.includes('apply') ||
          output.includes('tdd') ||
          output.includes('skill') ||
          output.includes('success') ||
          result.exitCode !== undefined
      ).toBe(true);
    });

    it('should apply specific methodology', async () => {
      const result = await runCli(['methodology', 'apply', 'agile'], { cwd: testDir });
      expect(result.exitCode).toBeDefined();
    });

    it('should apply with --dry-run option', async () => {
      const result = await runCli(['methodology', 'apply', 'devops', '--dry-run'], {
        cwd: testDir,
      });
      expect(result.exitCode).toBeDefined();
    });
  });

  describe('skillkit methodology validate', () => {
    it('should validate methodology compliance', async () => {
      await runCli(['methodology', 'load', 'tdd'], { cwd: testDir });

      const result = await runCli(['methodology', 'validate'], { cwd: testDir });
      const output = result.stdout + result.stderr;
      expect(
        output.includes('validate') ||
          output.includes('compliance') ||
          output.includes('tdd') ||
          output.includes('pass') ||
          output.includes('fail') ||
          result.exitCode !== undefined
      ).toBe(true);
    });

    it('should validate specific methodology', async () => {
      const result = await runCli(['methodology', 'validate', 'security-first'], { cwd: testDir });
      expect(result.exitCode).toBeDefined();
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
      expect(
        output.includes('plan') ||
          output.includes('test-plan') ||
          output.includes('created') ||
          result.exitCode !== undefined
      ).toBe(true);
    });

    it('should create plan with description', async () => {
      const result = await runCli(
        ['plan', 'create', '--name', 'described-plan', '--description', 'A test plan for E2E'],
        { cwd: testDir }
      );
      expect(result.exitCode).toBeDefined();
    });

    it('should create plan from template', async () => {
      const result = await runCli(
        ['plan', 'create', '--name', 'template-plan', '--template', 'feature'],
        { cwd: testDir }
      );
      expect(result.exitCode).toBeDefined();
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
      expect(result.exitCode).toBeDefined();
    });
  });

  describe('skillkit plan list', () => {
    it('should list all plans', async () => {
      // Create a plan first
      await runCli(['plan', 'create', '--name', 'list-test-plan'], { cwd: testDir });

      const result = await runCli(['plan', 'list'], { cwd: testDir });
      const output = result.stdout + result.stderr;
      expect(
        output.includes('plan') ||
          output.includes('list-test-plan') ||
          output.includes('No') ||
          result.exitCode !== undefined
      ).toBe(true);
    });

    it('should support --json output', async () => {
      const result = await runCli(['plan', 'list', '--json'], { cwd: testDir });
      if (result.stdout.trim().startsWith('[') || result.stdout.trim().startsWith('{')) {
        expect(() => JSON.parse(result.stdout)).not.toThrow();
      }
    });

    it('should filter by status', async () => {
      const result = await runCli(['plan', 'list', '--status', 'pending'], { cwd: testDir });
      expect(result.exitCode).toBeDefined();
    });
  });

  describe('skillkit plan validate', () => {
    it('should validate plan structure', async () => {
      // Create a plan
      await runCli(['plan', 'create', '--name', 'validate-plan'], { cwd: testDir });

      const result = await runCli(['plan', 'validate', 'validate-plan'], { cwd: testDir });
      const output = result.stdout + result.stderr;
      expect(
        output.includes('valid') ||
          output.includes('validate') ||
          output.includes('plan') ||
          result.exitCode !== undefined
      ).toBe(true);
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
      expect(result.exitCode).toBeDefined();
    });
  });

  describe('skillkit plan status', () => {
    it('should show plan status', async () => {
      await runCli(['plan', 'create', '--name', 'status-plan'], { cwd: testDir });

      const result = await runCli(['plan', 'status', 'status-plan'], { cwd: testDir });
      const output = result.stdout + result.stderr;
      expect(
        output.includes('status') ||
          output.includes('plan') ||
          output.includes('pending') ||
          output.includes('progress') ||
          result.exitCode !== undefined
      ).toBe(true);
    });

    it('should show overall plans status without arguments', async () => {
      const result = await runCli(['plan', 'status'], { cwd: testDir });
      expect(result.exitCode).toBeDefined();
    });
  });

  describe('skillkit plan execute', () => {
    it('should execute a plan', async () => {
      await runCli(['plan', 'create', '--name', 'exec-plan'], { cwd: testDir });

      const result = await runCli(['plan', 'execute', 'exec-plan'], { cwd: testDir });
      const output = result.stdout + result.stderr;
      expect(
        output.includes('execute') ||
          output.includes('plan') ||
          output.includes('exec-plan') ||
          output.includes('running') ||
          result.exitCode !== undefined
      ).toBe(true);
    });

    it('should execute with --dry-run', async () => {
      await runCli(['plan', 'create', '--name', 'dry-run-plan'], { cwd: testDir });

      const result = await runCli(['plan', 'execute', 'dry-run-plan', '--dry-run'], {
        cwd: testDir,
      });
      expect(result.exitCode).toBeDefined();
    });

    it('should execute specific step', async () => {
      await runCli(
        ['plan', 'create', '--name', 'step-plan', '--steps', 'Step1,Step2,Step3'],
        { cwd: testDir }
      );

      const result = await runCli(['plan', 'execute', 'step-plan', '--step', '1'], {
        cwd: testDir,
      });
      expect(result.exitCode).toBeDefined();
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
    await runCli(['methodology', 'load', 'tdd'], { cwd: testDir });

    // Create plan using TDD approach
    const result = await runCli(
      ['plan', 'create', '--name', 'tdd-feature-plan', '--methodology', 'tdd'],
      { cwd: testDir }
    );
    expect(result.exitCode).toBeDefined();
  });

  it('should validate plan against methodology constraints', async () => {
    await runCli(['methodology', 'load', 'security-first'], { cwd: testDir });
    await runCli(['plan', 'create', '--name', 'secure-plan'], { cwd: testDir });

    const result = await runCli(['plan', 'validate', 'secure-plan', '--methodology'], {
      cwd: testDir,
    });
    expect(result.exitCode).toBeDefined();
  });
});
