/**
 * E2E Test CLI Runner
 * Executes skillkit CLI commands and captures output for testing
 */

import { spawn, execFileSync } from 'node:child_process';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync, rmSync, existsSync, writeFileSync, readFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';

// ESM-compatible __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface CliResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  success: boolean;
  duration: number;
}

export interface RunOptions {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  timeout?: number;
  input?: string;
}

const ROOT_DIR = resolve(__dirname, '../..');
const CLI_PATH = join(ROOT_DIR, 'apps/skillkit/dist/cli.js');

/**
 * Run a skillkit CLI command and capture the result
 */
export async function runCli(args: string[], options: RunOptions = {}): Promise<CliResult> {
  const startTime = Date.now();
  const cwd = options.cwd || ROOT_DIR;
  const timeout = options.timeout || 30000;

  return new Promise((resolve) => {
    const child = spawn('node', [CLI_PATH, ...args], {
      cwd,
      env: { ...process.env, ...options.env, NO_COLOR: '1', FORCE_COLOR: '0' },
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';
    let killed = false;

    const timeoutId = setTimeout(() => {
      killed = true;
      child.kill('SIGTERM');
    }, timeout);

    child.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    if (options.input) {
      child.stdin?.write(options.input);
      child.stdin?.end();
    }

    child.on('close', (code) => {
      clearTimeout(timeoutId);
      const duration = Date.now() - startTime;
      const exitCode = killed ? -1 : (code ?? 1);
      resolve({
        stdout,
        stderr,
        exitCode,
        success: exitCode === 0,
        duration,
      });
    });

    child.on('error', (err) => {
      clearTimeout(timeoutId);
      const duration = Date.now() - startTime;
      resolve({
        stdout,
        stderr: stderr + err.message,
        exitCode: 1,
        success: false,
        duration,
      });
    });
  });
}

/**
 * Run skillkit CLI synchronously (for simpler tests)
 * Uses execFileSync to avoid shell injection vulnerabilities
 */
export function runCliSync(args: string[], options: RunOptions = {}): CliResult {
  const startTime = Date.now();
  const cwd = options.cwd || ROOT_DIR;

  try {
    const result = execFileSync('node', [CLI_PATH, ...args], {
      cwd,
      env: { ...process.env, ...options.env, NO_COLOR: '1', FORCE_COLOR: '0' },
      encoding: 'utf-8',
      timeout: options.timeout || 30000,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    return {
      stdout: result,
      stderr: '',
      exitCode: 0,
      success: true,
      duration: Date.now() - startTime,
    };
  } catch (error: any) {
    return {
      stdout: error.stdout || '',
      stderr: error.stderr || error.message,
      exitCode: error.status || 1,
      success: false,
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Create a temporary test directory
 */
export function createTestDir(prefix = 'skillkit-e2e-'): string {
  return mkdtempSync(join(tmpdir(), prefix));
}

/**
 * Clean up a test directory
 */
export function cleanupTestDir(dir: string): void {
  if (existsSync(dir)) {
    rmSync(dir, { recursive: true, force: true });
  }
}

/**
 * Create a test skill in a directory
 */
export function createTestSkill(
  dir: string,
  name: string,
  options: {
    description?: string;
    content?: string;
    additionalFrontmatter?: Record<string, unknown>;
  } = {}
): string {
  const skillDir = join(dir, name);
  mkdirSync(skillDir, { recursive: true });

  const frontmatter: Record<string, unknown> = {
    name,
    description: options.description || `Test skill: ${name} for E2E testing`,
    ...options.additionalFrontmatter,
  };

  const frontmatterStr = Object.entries(frontmatter)
    .map(([key, value]) => {
      if (typeof value === 'object') {
        return `${key}:\n${Object.entries(value as Record<string, unknown>)
          .map(([k, v]) => `  ${k}: ${JSON.stringify(v)}`)
          .join('\n')}`;
      }
      return `${key}: ${value}`;
    })
    .join('\n');

  const content = `---
${frontmatterStr}
---

# ${name}

${options.content || `This is a test skill named ${name}.`}
`;

  writeFileSync(join(skillDir, 'SKILL.md'), content);
  return skillDir;
}

/**
 * Create a test project with common setup
 */
export function createTestProject(options: {
  withSkills?: boolean;
  skillCount?: number;
  withGit?: boolean;
  projectType?: 'node' | 'python' | 'rust' | 'go';
} = {}): { dir: string; cleanup: () => void } {
  const dir = createTestDir();

  if (options.withGit) {
    mkdirSync(join(dir, '.git'), { recursive: true });
    writeFileSync(join(dir, '.git', 'config'), '[core]\n\trepositoryformatversion = 0');
  }

  if (options.projectType === 'node') {
    writeFileSync(
      join(dir, 'package.json'),
      JSON.stringify({ name: 'test-project', version: '1.0.0' }, null, 2)
    );
  } else if (options.projectType === 'python') {
    writeFileSync(join(dir, 'requirements.txt'), 'pytest>=7.0.0\n');
  } else if (options.projectType === 'rust') {
    writeFileSync(join(dir, 'Cargo.toml'), '[package]\nname = "test"\nversion = "0.1.0"');
  } else if (options.projectType === 'go') {
    writeFileSync(join(dir, 'go.mod'), 'module test\n\ngo 1.21');
  }

  if (options.withSkills) {
    const skillsDir = join(dir, 'skills');
    mkdirSync(skillsDir, { recursive: true });
    // Use nullish coalescing to respect explicit 0
    const count = options.skillCount ?? 3;
    for (let i = 1; i <= count; i++) {
      createTestSkill(skillsDir, `test-skill-${i}`);
    }
  }

  return {
    dir,
    cleanup: () => cleanupTestDir(dir),
  };
}

/**
 * Read file content from test directory
 */
export function readTestFile(dir: string, ...paths: string[]): string {
  return readFileSync(join(dir, ...paths), 'utf-8');
}

/**
 * Check if file exists in test directory
 */
export function testFileExists(dir: string, ...paths: string[]): boolean {
  return existsSync(join(dir, ...paths));
}

/**
 * Write file in test directory
 */
export function writeTestFile(dir: string, path: string, content: string): void {
  const fullPath = join(dir, path);
  mkdirSync(join(fullPath, '..'), { recursive: true });
  writeFileSync(fullPath, content);
}

/**
 * Assert CLI output contains expected text
 */
export function assertContains(result: CliResult, expected: string, message?: string): void {
  const combined = result.stdout + result.stderr;
  if (!combined.includes(expected)) {
    throw new Error(
      message || `Expected output to contain "${expected}"\nActual output:\n${combined}`
    );
  }
}

/**
 * Assert CLI output matches regex
 */
export function assertMatches(result: CliResult, pattern: RegExp, message?: string): void {
  const combined = result.stdout + result.stderr;
  if (!pattern.test(combined)) {
    throw new Error(
      message || `Expected output to match ${pattern}\nActual output:\n${combined}`
    );
  }
}
