import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const CLI = join(__dirname, '../../../../apps/skillkit/dist/cli.js');

function run(args: string[]): { code: number; stdout: string; stderr: string } {
  try {
    const stdout = execFileSync(process.execPath, [CLI, ...args], {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return { code: 0, stdout, stderr: '' };
  } catch (err: any) {
    return {
      code: err.status ?? 1,
      stdout: err.stdout?.toString() ?? '',
      stderr: err.stderr?.toString() ?? '',
    };
  }
}

describe('skillkit verify', () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'skillkit-verify-cli-'));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it('prints an SRI digest by default', () => {
    writeFileSync(join(dir, 'SKILL.md'), '# test\n');
    const r = run(['verify', dir]);
    expect(r.code).toBe(0);
    expect(r.stdout.trim()).toMatch(/^sha256-[A-Za-z0-9+/]+=*$/);
  });

  it('emits JSON with --json', () => {
    writeFileSync(join(dir, 'SKILL.md'), '# test\n');
    mkdirSync(join(dir, 'scripts'));
    writeFileSync(join(dir, 'scripts', 'a.sh'), 'echo');
    const r = run(['verify', dir, '--json']);
    expect(r.code).toBe(0);
    const payload = JSON.parse(r.stdout);
    expect(payload.ok).toBe(true);
    expect(payload.algorithm).toBe('sha256');
    expect(payload.sri).toMatch(/^sha256-/);
    expect(typeof payload.digest).toBe('string');
    expect(payload.totalBytes).toBeGreaterThan(0);
  });

  it('returns exit 1 on integrity mismatch', () => {
    writeFileSync(join(dir, 'SKILL.md'), 'hello');
    const bogus = 'sha256-' + Buffer.alloc(32, 7).toString('base64');
    const r = run(['verify', dir, '--expected', bogus, '--json']);
    expect(r.code).toBe(1);
    const payload = JSON.parse(r.stdout);
    expect(payload.ok).toBe(false);
    expect(payload.reason).toBe('mismatch');
  });

  it('returns exit 0 when --expected matches', () => {
    writeFileSync(join(dir, 'SKILL.md'), 'matched');
    const computed = run(['verify', dir]);
    const sri = computed.stdout.trim();
    const r = run(['verify', dir, '--expected', sri, '--json']);
    expect(r.code).toBe(0);
    const payload = JSON.parse(r.stdout);
    expect(payload.ok).toBe(true);
  });

  it('rejects garbage --expected', () => {
    writeFileSync(join(dir, 'SKILL.md'), 'x');
    const r = run(['verify', dir, '--expected', 'garbage']);
    expect(r.code).toBe(1);
  });
});
