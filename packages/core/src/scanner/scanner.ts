import { readdir } from 'node:fs/promises';
import { join, basename } from 'node:path';
import type { Analyzer } from './analyzers/base.js';
import { StaticAnalyzer } from './analyzers/static.js';
import { ManifestAnalyzer } from './analyzers/manifest.js';
import { SecretsAnalyzer } from './analyzers/secrets.js';
import type { Finding, ScanResult, ScanOptions } from './types.js';
import { Severity } from './types.js';

const SEVERITY_ORDER: Record<string, number> = {
  [Severity.CRITICAL]: 5,
  [Severity.HIGH]: 4,
  [Severity.MEDIUM]: 3,
  [Severity.LOW]: 2,
  [Severity.INFO]: 1,
  [Severity.SAFE]: 0,
};

async function discoverFiles(dirPath: string): Promise<string[]> {
  const files: string[] = [];

  async function walk(dir: string): Promise<void> {
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.name.startsWith('.') && entry.name !== '.env' && !entry.name.startsWith('.env.')) continue;
      if (entry.name === 'node_modules') continue;

      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile()) {
        files.push(fullPath);
      }
    }
  }

  await walk(dirPath);
  return files;
}

function deduplicateFindings(findings: Finding[]): Finding[] {
  const seen = new Set<string>();
  return findings.filter((f) => {
    const key = `${f.ruleId}:${f.filePath ?? ''}:${f.lineNumber ?? ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function calculateVerdict(
  findings: Finding[],
  failOnSeverity: Severity = Severity.HIGH
): 'pass' | 'warn' | 'fail' {
  const threshold = SEVERITY_ORDER[failOnSeverity] ?? SEVERITY_ORDER[Severity.HIGH];

  for (const f of findings) {
    if ((SEVERITY_ORDER[f.severity] ?? 0) >= threshold) {
      return 'fail';
    }
  }

  if (findings.some((f) => (SEVERITY_ORDER[f.severity] ?? 0) >= SEVERITY_ORDER[Severity.MEDIUM])) {
    return 'warn';
  }

  return 'pass';
}

function countStats(findings: Finding[]): ScanResult['stats'] {
  const stats = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  for (const f of findings) {
    switch (f.severity) {
      case Severity.CRITICAL: stats.critical++; break;
      case Severity.HIGH: stats.high++; break;
      case Severity.MEDIUM: stats.medium++; break;
      case Severity.LOW: stats.low++; break;
      case Severity.INFO: stats.info++; break;
    }
  }
  return stats;
}

export class SkillScanner {
  private analyzers: Analyzer[];
  private options: ScanOptions;

  constructor(options?: ScanOptions) {
    this.options = options ?? {};
    this.analyzers = [
      new StaticAnalyzer(this.options.skipRules),
      new ManifestAnalyzer(this.options.skipRules),
      new SecretsAnalyzer(this.options.skipRules),
    ];
  }

  async scan(skillPath: string): Promise<ScanResult> {
    const start = performance.now();

    const files = await discoverFiles(skillPath);
    const skillName = basename(skillPath.replace(/\/+$/, '')) || 'unknown';

    const resultSets = await Promise.all(
      this.analyzers.map((a) => a.analyze(skillPath, files))
    );

    const allFindings = deduplicateFindings(resultSets.flat());

    allFindings.sort(
      (a, b) => (SEVERITY_ORDER[b.severity] ?? 0) - (SEVERITY_ORDER[a.severity] ?? 0)
    );

    const duration = Math.round(performance.now() - start);

    return {
      skillPath,
      skillName,
      verdict: calculateVerdict(allFindings, this.options.failOnSeverity),
      findings: allFindings,
      stats: countStats(allFindings),
      duration,
      analyzersUsed: this.analyzers.map((a) => a.name),
    };
  }
}
