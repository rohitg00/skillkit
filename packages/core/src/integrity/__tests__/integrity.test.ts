import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  computeSkillIntegrity,
  verifySkillIntegrity,
  formatIntegrity,
  parseIntegrity,
} from '../integrity.js';

describe('integrity', () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'skillkit-integrity-'));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it('computes a stable digest for a single-file skill', () => {
    writeFileSync(join(dir, 'SKILL.md'), '# Hello\n\nbody\n');
    const a = computeSkillIntegrity(dir);
    const b = computeSkillIntegrity(dir);
    expect(a.digest).toBe(b.digest);
    expect(a.digest).toMatch(/^[a-f0-9]{64}$/);
    expect(a.sri.startsWith('sha256-')).toBe(true);
    expect(a.files).toHaveLength(1);
    expect(a.files[0].path).toBe('SKILL.md');
  });

  it('hashes file contents recursively and ignores metadata files', () => {
    writeFileSync(join(dir, 'SKILL.md'), 'a');
    mkdirSync(join(dir, 'scripts'));
    writeFileSync(join(dir, 'scripts', 'do.sh'), 'echo hi');
    writeFileSync(join(dir, '.skillkit.json'), '{}');
    writeFileSync(join(dir, '.DS_Store'), 'noise');

    const result = computeSkillIntegrity(dir);
    const paths = result.files.map((f) => f.path).sort();
    expect(paths).toEqual(['SKILL.md', 'scripts/do.sh']);
  });

  it('detects content drift', () => {
    writeFileSync(join(dir, 'SKILL.md'), 'original');
    const before = computeSkillIntegrity(dir).digest;
    writeFileSync(join(dir, 'SKILL.md'), 'tampered');
    const after = computeSkillIntegrity(dir).digest;
    expect(before).not.toBe(after);
  });

  it('detects new file additions (path matters, not just contents)', () => {
    writeFileSync(join(dir, 'SKILL.md'), 'x');
    const before = computeSkillIntegrity(dir).digest;
    writeFileSync(join(dir, 'extra.txt'), 'x');
    const after = computeSkillIntegrity(dir).digest;
    expect(before).not.toBe(after);
  });

  it('verifies matching SRI strings', () => {
    writeFileSync(join(dir, 'SKILL.md'), '# test');
    const result = computeSkillIntegrity(dir);
    expect(verifySkillIntegrity(dir, result.sri).valid).toBe(true);
    expect(verifySkillIntegrity(dir, result.digest).valid).toBe(true);
  });

  it('rejects mismatched integrity strings', () => {
    writeFileSync(join(dir, 'SKILL.md'), '# test');
    const result = verifySkillIntegrity(dir, 'sha256-' + Buffer.alloc(32).toString('base64'));
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('mismatch');
  });

  it('rejects malformed integrity strings', () => {
    writeFileSync(join(dir, 'SKILL.md'), 'x');
    const r = verifySkillIntegrity(dir, 'not-a-hash');
    expect(r.valid).toBe(false);
    expect(r.reason).toBe('invalid-expected-format');
  });

  it('parses both SRI and bare hex', () => {
    const hex = 'a'.repeat(64);
    expect(parseIntegrity(hex)?.digest).toBe(hex);
    const sri = 'sha256-' + Buffer.alloc(32, 1).toString('base64');
    const parsed = parseIntegrity(sri);
    expect(parsed?.digest).toMatch(/^[a-f0-9]{64}$/);
    expect(parseIntegrity('garbage')).toBeNull();
  });

  it('formats integrity in hex or SRI', () => {
    writeFileSync(join(dir, 'SKILL.md'), 'fmt');
    const r = computeSkillIntegrity(dir);
    expect(formatIntegrity(r, 'sri')).toBe(r.sri);
    expect(formatIntegrity(r, 'hex')).toBe(r.digest);
  });

  it('throws on missing path', () => {
    expect(() => computeSkillIntegrity(join(dir, 'nope'))).toThrow();
  });

  it('enforces maxBytes limit', () => {
    const buf = Buffer.alloc(1024).fill('x');
    writeFileSync(join(dir, 'SKILL.md'), buf);
    expect(() => computeSkillIntegrity(dir, { maxBytes: 100 })).toThrow(/max integrity size/);
  });
});
