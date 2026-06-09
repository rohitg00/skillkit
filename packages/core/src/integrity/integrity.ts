import { createHash } from 'node:crypto';
import { readFileSync, statSync, readdirSync, existsSync } from 'node:fs';
import { join, relative, sep, posix } from 'node:path';

export interface IntegrityOptions {
  exclude?: string[];
  maxBytes?: number;
}

export interface IntegrityResult {
  algorithm: 'sha256';
  digest: string;
  sri: string;
  files: Array<{ path: string; sha256: string; bytes: number }>;
  totalBytes: number;
}

export interface VerifyResult {
  valid: boolean;
  expected: string;
  computed: string;
  algorithm: 'sha256';
  reason?: string;
}

const DEFAULT_EXCLUDES = new Set([
  '.skillkit.json',
  '.DS_Store',
  '.git',
  'node_modules',
  'dist',
  '.turbo',
]);

const DEFAULT_MAX_BYTES = 50 * 1024 * 1024;

function shouldExclude(name: string, extra: Set<string>): boolean {
  if (DEFAULT_EXCLUDES.has(name)) return true;
  if (extra.has(name)) return true;
  if (name.endsWith('.skillkit.json')) return true;
  return false;
}

function walk(root: string, dir: string, extra: Set<string>, out: string[]): void {
  for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if (shouldExclude(entry.name, extra)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(root, full, extra, out);
    } else if (entry.isFile()) {
      out.push(full);
    }
  }
}

function toPosix(p: string): string {
  return p.split(sep).join(posix.sep);
}

export function computeSkillIntegrity(skillPath: string, options: IntegrityOptions = {}): IntegrityResult {
  if (!existsSync(skillPath)) {
    throw new Error(`Skill path not found: ${skillPath}`);
  }

  const stats = statSync(skillPath);
  const extra = new Set(options.exclude ?? []);
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES;

  let root: string;
  const files: string[] = [];

  if (stats.isFile()) {
    if (!skillPath.toLowerCase().endsWith('.md')) {
      throw new Error(`Single-file skill must be a .md file: ${skillPath}`);
    }
    root = skillPath;
    files.push(skillPath);
  } else if (stats.isDirectory()) {
    root = skillPath;
    walk(root, root, extra, files);
  } else {
    throw new Error(`Unsupported skill path type: ${skillPath}`);
  }

  const fileEntries: IntegrityResult['files'] = [];
  const rollup = createHash('sha256');
  let totalBytes = 0;

  for (const file of files) {
    const data = readFileSync(file);
    totalBytes += data.byteLength;
    if (totalBytes > maxBytes) {
      throw new Error(`Skill exceeds max integrity size (${maxBytes} bytes)`);
    }

    const fileHash = createHash('sha256').update(data).digest('hex');
    const rel = stats.isFile() ? toPosix(file.split(sep).pop()!) : toPosix(relative(root, file));

    fileEntries.push({ path: rel, sha256: fileHash, bytes: data.byteLength });

    rollup.update(rel);
    rollup.update('\0');
    rollup.update(fileHash);
    rollup.update('\n');
  }

  const digest = rollup.digest('hex');
  const sri = `sha256-${Buffer.from(digest, 'hex').toString('base64')}`;

  return {
    algorithm: 'sha256',
    digest,
    sri,
    files: fileEntries,
    totalBytes,
  };
}

export function verifySkillIntegrity(skillPath: string, expected: string, options: IntegrityOptions = {}): VerifyResult {
  if (!expected || typeof expected !== 'string') {
    return {
      valid: false,
      expected: expected ?? '',
      computed: '',
      algorithm: 'sha256',
      reason: 'missing-expected',
    };
  }

  const result = computeSkillIntegrity(skillPath, options);
  const parsed = parseIntegrity(expected);

  if (!parsed) {
    return {
      valid: false,
      expected,
      computed: result.digest,
      algorithm: 'sha256',
      reason: 'invalid-expected-format',
    };
  }

  const valid = parsed.digest === result.digest;
  return {
    valid,
    expected: parsed.digest,
    computed: result.digest,
    algorithm: 'sha256',
    reason: valid ? undefined : 'mismatch',
  };
}

export function formatIntegrity(result: IntegrityResult, format: 'sri' | 'hex' = 'sri'): string {
  return format === 'sri' ? result.sri : result.digest;
}

export function parseIntegrity(input: string): { algorithm: 'sha256'; digest: string } | null {
  if (!input) return null;
  const trimmed = input.trim();

  if (trimmed.startsWith('sha256-')) {
    const b64 = trimmed.slice('sha256-'.length);
    try {
      const buf = Buffer.from(b64, 'base64');
      if (buf.length !== 32) return null;
      return { algorithm: 'sha256', digest: buf.toString('hex') };
    } catch {
      return null;
    }
  }

  if (/^[a-f0-9]{64}$/i.test(trimmed)) {
    return { algorithm: 'sha256', digest: trimmed.toLowerCase() };
  }

  return null;
}
