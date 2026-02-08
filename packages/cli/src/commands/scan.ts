import { Command, Option } from 'clipanion';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { SkillScanner, formatResult, Severity } from '@skillkit/core';

const SEVERITY_MAP: Record<string, Severity> = {
  critical: Severity.CRITICAL,
  high: Severity.HIGH,
  medium: Severity.MEDIUM,
  low: Severity.LOW,
  info: Severity.INFO,
};

export class ScanCommand extends Command {
  static override paths = [['scan']];

  static override usage = Command.Usage({
    description: 'Scan a skill directory for security vulnerabilities',
    details: `
      Analyzes skill files for prompt injection, command injection, data exfiltration,
      tool abuse, hardcoded secrets, and unicode steganography.

      Outputs findings in various formats including SARIF for GitHub Code Scanning.
    `,
    examples: [
      ['Scan current directory', '$0 scan .'],
      ['Scan a specific skill', '$0 scan ./my-skill'],
      ['Output as JSON', '$0 scan ./my-skill --format json'],
      ['Output as SARIF', '$0 scan ./my-skill --format sarif'],
      ['Fail on high severity', '$0 scan ./my-skill --fail-on high'],
      ['Skip unicode rules', '$0 scan ./my-skill --skip-rules UC001,UC002'],
    ],
  });

  skillPath = Option.String({ required: true, name: 'path' });

  format = Option.String('--format,-f', 'summary', {
    description: 'Output format: summary, json, table, sarif',
  });

  failOn = Option.String('--fail-on', {
    description: 'Exit with code 1 if findings at this severity or above (critical, high, medium, low)',
  });

  skipRules = Option.String('--skip-rules', {
    description: 'Comma-separated rule IDs or categories to skip',
  });

  quiet = Option.Boolean('--quiet,-q', false, {
    description: 'Suppress non-essential output',
  });

  async execute(): Promise<number> {
    const targetPath = resolve(this.skillPath);

    if (!existsSync(targetPath)) {
      this.context.stderr.write(`Path not found: ${targetPath}\n`);
      return 1;
    }

    const skipRules = this.skipRules?.split(',').map((s) => s.trim()) ?? [];

    const failOnSeverity = this.failOn ? SEVERITY_MAP[this.failOn.toLowerCase()] : undefined;

    const scanner = new SkillScanner({
      failOnSeverity,
      format: this.format as 'summary' | 'json' | 'table' | 'sarif',
      quiet: this.quiet,
      skipRules,
    });

    const result = await scanner.scan(targetPath);

    this.context.stdout.write(formatResult(result, this.format) + '\n');

    return result.verdict === 'fail' ? 1 : 0;
  }
}
