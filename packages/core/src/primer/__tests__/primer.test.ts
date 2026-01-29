import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { PrimerAnalyzer, analyzePrimer } from '../analyzer.js';
import { PrimerGenerator, generatePrimer } from '../generator.js';

const TEST_DIR = join(tmpdir(), 'skillkit-primer-test-' + Date.now());

describe('Primer', () => {
  beforeAll(() => {
    mkdirSync(TEST_DIR, { recursive: true });

    writeFileSync(
      join(TEST_DIR, 'package.json'),
      JSON.stringify({
        name: 'test-project',
        version: '1.0.0',
        description: 'A test project',
        scripts: {
          build: 'tsc',
          test: 'vitest',
          lint: 'eslint .',
        },
        dependencies: {
          react: '^18.0.0',
          next: '^14.0.0',
        },
        devDependencies: {
          typescript: '^5.0.0',
          tailwindcss: '^3.0.0',
          vitest: '^1.0.0',
          eslint: '^8.0.0',
          prettier: '^3.0.0',
        },
      })
    );

    writeFileSync(join(TEST_DIR, 'tsconfig.json'), JSON.stringify({ compilerOptions: {} }));

    mkdirSync(join(TEST_DIR, 'src'), { recursive: true });
    writeFileSync(join(TEST_DIR, 'src', 'index.ts'), 'export const hello = "world";');

    mkdirSync(join(TEST_DIR, '.github', 'workflows'), { recursive: true });
    writeFileSync(join(TEST_DIR, '.github', 'workflows', 'ci.yml'), 'name: CI');

    writeFileSync(join(TEST_DIR, 'pnpm-lock.yaml'), '');
  });

  afterAll(() => {
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  describe('PrimerAnalyzer', () => {
    it('should detect project info', () => {
      const analyzer = new PrimerAnalyzer(TEST_DIR);
      const analysis = analyzer.analyze();

      expect(analysis.project.name).toBe('test-project');
      expect(analysis.project.version).toBe('1.0.0');
      expect(analysis.project.description).toBe('A test project');
    });

    it('should detect languages', () => {
      const analysis = analyzePrimer(TEST_DIR);

      const typescript = analysis.languages.find(l => l.name === 'typescript');
      expect(typescript).toBeDefined();
      expect(typescript?.version).toBe('5.0.0');
    });

    it('should detect package managers', () => {
      const analysis = analyzePrimer(TEST_DIR);

      expect(analysis.packageManagers).toContain('pnpm');
    });

    it('should detect frameworks', () => {
      const analysis = analyzePrimer(TEST_DIR);

      const react = analysis.stack.frameworks.find(f => f.name === 'react');
      const nextjs = analysis.stack.frameworks.find(f => f.name === 'nextjs');

      expect(react).toBeDefined();
      expect(nextjs).toBeDefined();
    });

    it('should detect styling', () => {
      const analysis = analyzePrimer(TEST_DIR);

      const tailwind = analysis.stack.styling.find(s => s.name === 'tailwindcss');
      expect(tailwind).toBeDefined();
    });

    it('should detect testing', () => {
      const analysis = analyzePrimer(TEST_DIR);

      const vitest = analysis.stack.testing.find(t => t.name === 'vitest');
      expect(vitest).toBeDefined();
    });

    it('should detect tools', () => {
      const analysis = analyzePrimer(TEST_DIR);

      const eslint = analysis.stack.tools.find(t => t.name === 'eslint');
      const prettier = analysis.stack.tools.find(t => t.name === 'prettier');

      expect(eslint).toBeDefined();
      expect(prettier).toBeDefined();
    });

    it('should detect CI config', () => {
      const analysis = analyzePrimer(TEST_DIR);

      expect(analysis.ci?.hasCI).toBe(true);
      expect(analysis.ci?.provider).toBe('github-actions');
    });

    it('should detect project structure', () => {
      const analysis = analyzePrimer(TEST_DIR);

      expect(analysis.structure?.type).toBe('src-based');
      expect(analysis.structure?.srcDir).toBe('src');
    });

    it('should extract build commands', () => {
      const analysis = analyzePrimer(TEST_DIR);

      expect(analysis.buildCommands?.build).toBe('pnpm build');
      expect(analysis.buildCommands?.test).toBe('pnpm test');
      expect(analysis.buildCommands?.lint).toBe('pnpm lint');
    });
  });

  describe('PrimerGenerator', () => {
    it('should generate instruction files for detected agents', () => {
      const result = generatePrimer(TEST_DIR, { dryRun: true });

      expect(result.success).toBe(true);
      expect(result.generated.length).toBeGreaterThan(0);
      expect(result.errors.length).toBe(0);
    });

    it('should generate for specific agents', () => {
      const result = generatePrimer(TEST_DIR, {
        agents: ['claude-code', 'cursor'],
        dryRun: true,
      });

      expect(result.success).toBe(true);
      expect(result.generated.length).toBe(2);

      const agents = result.generated.map(g => g.agent);
      expect(agents).toContain('claude-code');
      expect(agents).toContain('cursor');
    });

    it('should analyze only when requested', () => {
      const result = generatePrimer(TEST_DIR, { analyzeOnly: true });

      expect(result.success).toBe(true);
      expect(result.generated.length).toBe(0);
      expect(result.analysis).toBeDefined();
      expect(result.analysis.project.name).toBe('test-project');
    });

    it('should generate content with correct sections', () => {
      const result = generatePrimer(TEST_DIR, {
        agents: ['claude-code'],
        dryRun: true,
      });

      expect(result.success).toBe(true);
      expect(result.generated.length).toBeGreaterThan(0);
      const instruction = result.generated[0];

      expect(instruction.content).toContain('# test-project');
      expect(instruction.content).toContain('## Technology Stack');
      expect(instruction.content).toContain('## Development Commands');
      expect(instruction.content).toContain('## Development Guidelines');
    });

    it('should respect output directory option', () => {
      const outputDir = join(TEST_DIR, 'output');
      mkdirSync(outputDir, { recursive: true });

      const result = generatePrimer(TEST_DIR, {
        agents: ['claude-code'],
        outputDir,
        dryRun: true,
      });

      expect(result.success).toBe(true);
      expect(result.generated[0].filepath).toContain('output');
    });
  });
});
