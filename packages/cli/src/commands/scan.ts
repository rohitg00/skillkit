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

  async execute(): Promise<number> {
    const targetPath = resolve(this.skillPath);

    if (!existsSync(targetPath)) {
      this.context.stderr.write(`Path not found: ${targetPath}\n`);
      return 1;
    }

    const validFormats = ['summary', 'json', 'table', 'sarif'];
    if (!validFormats.includes(this.format)) {
      this.context.stderr.write(`Invalid format: "${this.format}". Must be one of: ${validFormats.join(', ')}\n`);
      return 1;
    }

    const skipRules = this.skipRules?.split(',').map((s) => s.trim()) ?? [];

    let failOnSeverity: Severity | undefined;
    if (this.failOn) {
      failOnSeverity = SEVERITY_MAP[this.failOn.toLowerCase()];
      if (!failOnSeverity) {
        this.context.stderr.write(`Invalid --fail-on value: "${this.failOn}". Must be one of: ${Object.keys(SEVERITY_MAP).join(', ')}\n`);
        return 1;
      }
    }

    const scanner = new SkillScanner({
      failOnSeverity,
      skipRules,
    });

    const result = await scanner.scan(targetPath);

    this.context.stdout.write(formatResult(result, this.format) + '\n');

    return result.verdict === 'fail' ? 1 : 0;
  }
}
