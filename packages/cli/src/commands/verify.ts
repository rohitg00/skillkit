import { Command, Option } from 'clipanion';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
import {
  computeSkillIntegrity,
  verifySkillIntegrity,
  loadLockFile,
  parseIntegrity,
} from '@skillkit/core';
import { colors, success, error, warn, step } from '../onboarding/index.js';

export class VerifyCommand extends Command {
  static override paths = [['verify']];

  static override usage = Command.Usage({
    description: 'Compute or verify the SHA-256 integrity of a skill',
    details: `
      Computes a deterministic SHA-256 digest over every file in the skill
      (excluding .skillkit.json metadata and version-control artifacts). The
      digest is emitted as a Subresource Integrity (SRI) string by default
      (sha256-<base64>) and is compatible with the published well-known/skills.json
      index.

      Pass --expected to verify against a known value, or --against-lock to
      cross-check against the locally recorded checksum in ~/.skillkit/lock.json.
    `,
    examples: [
      ['Print integrity of current directory', '$0 verify .'],
      ['Print full per-file table', '$0 verify ./my-skill --files'],
      ['Verify against an expected digest', '$0 verify ./my-skill --expected=sha256-abc...'],
      ['Verify against the local lockfile', '$0 verify ./my-skill --against-lock'],
      ['Emit JSON for CI pipelines', '$0 verify ./my-skill --json'],
    ],
  });

  skillPath = Option.String({ required: true, name: 'path' });

  expected = Option.String('--expected', { description: 'Expected integrity (SRI or hex sha256)' });

  againstLock = Option.Boolean('--against-lock', false, {
    description: 'Verify against the checksum recorded in ~/.skillkit/lock.json',
  });

  showFiles = Option.Boolean('--files', false, { description: 'Print per-file digests' });

  json = Option.Boolean('--json', false, { description: 'Emit machine-readable JSON' });

  format = Option.String('--format', 'sri', {
    description: 'Output digest format: sri (default) or hex',
  });

  async execute(): Promise<number> {
    const target = resolve(this.skillPath);
    if (!existsSync(target)) {
      error(`Path not found: ${target}`);
      return 1;
    }

    if (this.format !== 'sri' && this.format !== 'hex') {
      error(`Invalid --format value: "${this.format}" (must be 'sri' or 'hex')`);
      return 1;
    }

    let computed;
    try {
      computed = computeSkillIntegrity(target);
    } catch (err) {
      error((err as Error).message);
      return 1;
    }

    const expectedFromArgs = this.expected?.trim();
    const expectedFromLock = this.againstLock ? findLockChecksum(target) : null;
    const expected = expectedFromArgs ?? expectedFromLock ?? null;

    if (this.againstLock && !expectedFromLock) {
      if (this.json) {
        this.context.stdout.write(
          JSON.stringify({ ok: false, reason: 'no-lock-entry', target }, null, 2) + '\n',
        );
      } else {
        warn(`No lock entry found for ${target}`);
      }
      return 1;
    }

    if (expected) {
      const parsed = parseIntegrity(expected);
      if (!parsed) {
        error(`Invalid --expected value (must be sha256-<base64> or 64-char hex)`);
        return 1;
      }
      const result = verifySkillIntegrity(target, expected);
      if (this.json) {
        this.context.stdout.write(
          JSON.stringify(
            {
              ok: result.valid,
              algorithm: result.algorithm,
              expected: parsed.digest,
              computed: result.computed,
              sri: computed.sri,
              files: computed.files.length,
              totalBytes: computed.totalBytes,
              reason: result.reason,
            },
            null,
            2,
          ) + '\n',
        );
        return result.valid ? 0 : 1;
      }
      if (result.valid) {
        success(`Integrity verified (${computed.files.length} files, ${computed.totalBytes} bytes)`);
        this.context.stdout.write(`  ${colors.dim('expected')}  ${parsed.digest}\n`);
        this.context.stdout.write(`  ${colors.dim('computed')}  ${result.computed}\n`);
        return 0;
      }
      error('Integrity mismatch — skill content has changed since signing');
      this.context.stdout.write(`  ${colors.dim('expected')}  ${parsed.digest}\n`);
      this.context.stdout.write(`  ${colors.dim('computed')}  ${result.computed}\n`);
      return 1;
    }

    if (this.json) {
      this.context.stdout.write(
        JSON.stringify(
          {
            ok: true,
            algorithm: computed.algorithm,
            sri: computed.sri,
            digest: computed.digest,
            files: this.showFiles ? computed.files : computed.files.length,
            totalBytes: computed.totalBytes,
          },
          null,
          2,
        ) + '\n',
      );
      return 0;
    }

    const out = this.format === 'hex' ? computed.digest : computed.sri;
    this.context.stdout.write(out + '\n');
    if (this.showFiles) {
      step(`${computed.files.length} files, ${computed.totalBytes} bytes`);
      for (const f of computed.files) {
        this.context.stdout.write(`  ${colors.dim(f.sha256.slice(0, 12))}  ${f.path}\n`);
      }
    }
    return 0;
  }
}

function findLockChecksum(target: string): string | null {
  try {
    const lock = loadLockFile();
    for (const entry of Object.values(lock.skills)) {
      if (entry.path === target && entry.checksum) {
        return entry.checksum;
      }
    }
  } catch {
    return null;
  }
  return null;
}
