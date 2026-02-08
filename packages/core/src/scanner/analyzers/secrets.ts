import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';
import type { Analyzer } from './base.js';
import type { Finding } from '../types.js';
import { Severity, ThreatCategory } from '../types.js';

interface SecretPattern {
  id: string;
  name: string;
  pattern: RegExp;
  severity: Severity;
}

const SECRET_PATTERNS: SecretPattern[] = [
  {
    id: 'SK001',
    name: 'OpenAI API key',
    pattern: /sk-(?!ant-)(?:proj-|admin-)?[A-Za-z0-9-]{20,}/,
    severity: Severity.CRITICAL,
  },
  {
    id: 'SK002',
    name: 'Stripe live key',
    pattern: /pk_live_[a-zA-Z0-9]{20,}/,
    severity: Severity.CRITICAL,
  },
  {
    id: 'SK003',
    name: 'Stripe secret key',
    pattern: /sk_live_[a-zA-Z0-9]{20,}/,
    severity: Severity.CRITICAL,
  },
  {
    id: 'SK004',
    name: 'GitHub personal access token',
    pattern: /ghp_[a-zA-Z0-9]{36}/,
    severity: Severity.CRITICAL,
  },
  {
    id: 'SK005',
    name: 'GitHub OAuth token',
    pattern: /gho_[a-zA-Z0-9]{36}/,
    severity: Severity.CRITICAL,
  },
  {
    id: 'SK006',
    name: 'AWS access key',
    pattern: /AKIA[0-9A-Z]{16}/,
    severity: Severity.CRITICAL,
  },
  {
    id: 'SK007',
    name: 'Slack bot token',
    pattern: /xoxb-[0-9]{10,}-[a-zA-Z0-9]{20,}/,
    severity: Severity.CRITICAL,
  },
  {
    id: 'SK008',
    name: 'Slack user token',
    pattern: /xoxp-[0-9]{10,}-[a-zA-Z0-9]{20,}/,
    severity: Severity.CRITICAL,
  },
  {
    id: 'SK009',
    name: 'Private key block',
    pattern: /-----BEGIN\s+(?:RSA\s+|EC\s+|DSA\s+|OPENSSH\s+)?PRIVATE\s+KEY-----/,
    severity: Severity.CRITICAL,
  },
  {
    id: 'SK010',
    name: 'Google API key',
    pattern: /AIza[0-9A-Za-z_-]{35}/,
    severity: Severity.HIGH,
  },
  {
    id: 'SK011',
    name: 'Anthropic API key',
    pattern: /sk-ant-[a-zA-Z0-9]{20,}/,
    severity: Severity.CRITICAL,
  },
  {
    id: 'SK012',
    name: 'npm token',
    pattern: /npm_[a-zA-Z0-9]{36}/,
    severity: Severity.HIGH,
  },
  {
    id: 'SK013',
    name: 'Heroku API key',
    pattern: /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/,
    severity: Severity.LOW,
  },
];

const PLACEHOLDER_INDICATORS = [
  /your[-_]?api[-_]?key/i,
  /example/i,
  /sample/i,
  /dummy/i,
  /placeholder/i,
  /xxx+/i,
  /test[-_]?key/i,
  /fake/i,
  /replace[-_]?with/i,
  /\<.*key.*\>/i,
];

const ENV_FILE_PATTERN = /^\.env/;

function isPlaceholder(line: string): boolean {
  return PLACEHOLDER_INDICATORS.some((p) => p.test(line));
}

export class SecretsAnalyzer implements Analyzer {
  name = 'secrets';
  private findingCounter = 0;
  private skipRules: Set<string>;

  constructor(skipRules?: string[]) {
    this.skipRules = new Set(skipRules ?? []);
  }

  async analyze(_skillPath: string, files: string[]): Promise<Finding[]> {
    this.findingCounter = 0;
    const findings: Finding[] = [];

    for (const file of files) {
      const name = basename(file);

      if (ENV_FILE_PATTERN.test(name) && !this.skipRules.has('SK-ENV')) {
        findings.push({
          id: `SK${++this.findingCounter}`,
          ruleId: 'SK-ENV',
          category: ThreatCategory.HARDCODED_SECRETS,
          severity: Severity.HIGH,
          title: `Environment file included: ${name}`,
          description: 'Environment files should not be included in skill distributions',
          filePath: file,
          analyzer: this.name,
          remediation: 'Remove .env files from skill directory. Add to .gitignore.',
        });
        continue;
      }

      let content: string;
      try {
        content = await readFile(file, 'utf-8');
      } catch {
        continue;
      }

      if (content.length > 1_000_000) continue;

      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (isPlaceholder(line)) continue;

        for (const secret of SECRET_PATTERNS) {
          if (this.skipRules.has(secret.id)) continue;
          if (secret.pattern.test(line)) {
            if (secret.id === 'SK013') {
              if (!/(?:key|token|secret|password|credential|api)/i.test(line)) continue;
            }

            findings.push({
              id: `SK${++this.findingCounter}`,
              ruleId: secret.id,
              category: ThreatCategory.HARDCODED_SECRETS,
              severity: secret.severity,
              title: `${secret.name} detected`,
              description: `Potential ${secret.name} found in skill file`,
              filePath: file,
              lineNumber: i + 1,
              snippet: line.trim().replace(secret.pattern, '[REDACTED]').substring(0, 100),
              analyzer: this.name,
              remediation: 'Remove hardcoded secrets. Use environment variables or secret managers.',
            });
            break;
          }
        }
      }
    }

    return findings;
  }
}
