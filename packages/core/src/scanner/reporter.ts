import { basename } from 'node:path';
import type { Finding, ScanResult } from './types.js';
import { Severity } from './types.js';

declare const __PACKAGE_VERSION__: string;
const SCANNER_VERSION = typeof __PACKAGE_VERSION__ !== 'undefined' ? __PACKAGE_VERSION__ : '0.0.0';

const SEVERITY_COLORS: Record<string, string> = {
  [Severity.CRITICAL]: '\x1b[91m',
  [Severity.HIGH]: '\x1b[31m',
  [Severity.MEDIUM]: '\x1b[33m',
  [Severity.LOW]: '\x1b[36m',
  [Severity.INFO]: '\x1b[37m',
  [Severity.SAFE]: '\x1b[32m',
};
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';

const VERDICT_ICON: Record<string, string> = {
  pass: '\x1b[32m PASS \x1b[0m',
  warn: '\x1b[33m WARN \x1b[0m',
  fail: '\x1b[91m FAIL \x1b[0m',
};

export function formatSummary(result: ScanResult): string {
  const lines: string[] = [];

  lines.push('');
  lines.push(`${BOLD}Security Scan: ${result.skillName}${RESET}`);
  lines.push(`Verdict: ${VERDICT_ICON[result.verdict] ?? result.verdict}`);
  lines.push(`Duration: ${result.duration}ms | Analyzers: ${result.analyzersUsed.join(', ')}`);
  lines.push('');

  const { critical, high, medium, low, info } = result.stats;
  const parts: string[] = [];
  if (critical) parts.push(`${SEVERITY_COLORS[Severity.CRITICAL]}${critical} critical${RESET}`);
  if (high) parts.push(`${SEVERITY_COLORS[Severity.HIGH]}${high} high${RESET}`);
  if (medium) parts.push(`${SEVERITY_COLORS[Severity.MEDIUM]}${medium} medium${RESET}`);
  if (low) parts.push(`${SEVERITY_COLORS[Severity.LOW]}${low} low${RESET}`);
  if (info) parts.push(`${SEVERITY_COLORS[Severity.INFO]}${info} info${RESET}`);

  if (parts.length > 0) {
    lines.push(`Findings: ${parts.join(' | ')}`);
    lines.push('');
  } else {
    lines.push(`${SEVERITY_COLORS[Severity.SAFE]}No security findings${RESET}`);
    lines.push('');
    return lines.join('\n');
  }

  for (const finding of result.findings) {
    const color = SEVERITY_COLORS[finding.severity] ?? '';
    const sev = finding.severity.toUpperCase().padEnd(8);
    lines.push(`  ${color}${sev}${RESET} [${finding.ruleId}] ${finding.title}`);

    if (finding.filePath) {
      const loc = finding.lineNumber ? `${finding.filePath}:${finding.lineNumber}` : finding.filePath;
      lines.push(`           ${DIM}${loc}${RESET}`);
    }

    if (finding.snippet) {
      lines.push(`           ${DIM}> ${finding.snippet}${RESET}`);
    }

    if (finding.remediation) {
      lines.push(`           Fix: ${finding.remediation}`);
    }

    lines.push('');
  }

  return lines.join('\n');
}

export function formatJson(result: ScanResult): string {
  return JSON.stringify(result, null, 2);
}

export function formatTable(result: ScanResult): string {
  const lines: string[] = [];
  const header = ['Severity', 'Rule', 'Title', 'File', 'Line'];
  const widths = [10, 8, 50, 40, 6];

  lines.push(header.map((h, i) => h.padEnd(widths[i])).join(' | '));
  lines.push(widths.map((w) => '-'.repeat(w)).join('-+-'));

  for (const f of result.findings) {
    const row = [
      f.severity.toUpperCase().padEnd(widths[0]),
      f.ruleId.padEnd(widths[1]),
      f.title.substring(0, widths[2]).padEnd(widths[2]),
      (f.filePath ? basename(f.filePath) : '').substring(0, widths[3]).padEnd(widths[3]),
      String(f.lineNumber ?? '').padEnd(widths[4]),
    ];
    lines.push(row.join(' | '));
  }

  lines.push('');
  lines.push(`Total: ${result.findings.length} findings | Verdict: ${result.verdict.toUpperCase()}`);
  return lines.join('\n');
}

export function formatSarif(result: ScanResult): string {
  const rules = new Map<string, Finding>();
  for (const f of result.findings) {
    if (!rules.has(f.ruleId)) rules.set(f.ruleId, f);
  }

  const severityToSarif: Record<string, string> = {
    [Severity.CRITICAL]: 'error',
    [Severity.HIGH]: 'error',
    [Severity.MEDIUM]: 'warning',
    [Severity.LOW]: 'note',
    [Severity.INFO]: 'note',
    [Severity.SAFE]: 'none',
  };

  const sarif = {
    $schema: 'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/main/sarif-2.1/schema/sarif-schema-2.1.0.json',
    version: '2.1.0',
    runs: [
      {
        tool: {
          driver: {
            name: 'skillkit-scanner',
            version: SCANNER_VERSION,
            informationUri: 'https://agenstskills.com',
            rules: [...rules.values()].map((r) => ({
              id: r.ruleId,
              name: r.ruleId,
              shortDescription: { text: r.title },
              fullDescription: { text: r.description },
              helpUri: 'https://agenstskills.com/docs/security',
              defaultConfiguration: {
                level: severityToSarif[r.severity] ?? 'warning',
              },
              properties: {
                category: r.category,
              },
            })),
          },
        },
        results: result.findings.map((f) => ({
          ruleId: f.ruleId,
          level: severityToSarif[f.severity] ?? 'warning',
          message: { text: f.description },
          locations: f.filePath
            ? [
                {
                  physicalLocation: {
                    artifactLocation: {
                      uri: f.filePath.startsWith(result.skillPath)
                        ? f.filePath.slice(result.skillPath.length).replace(/^\//, '')
                        : f.filePath,
                    },
                    region: f.lineNumber
                      ? { startLine: f.lineNumber }
                      : undefined,
                  },
                },
              ]
            : [],
          fixes: f.remediation
            ? [{ description: { text: f.remediation } }]
            : undefined,
        })),
      },
    ],
  };

  return JSON.stringify(sarif, null, 2);
}

export function formatResult(result: ScanResult, format: string = 'summary'): string {
  switch (format) {
    case 'json': return formatJson(result);
    case 'table': return formatTable(result);
    case 'sarif': return formatSarif(result);
    default: return formatSummary(result);
  }
}
