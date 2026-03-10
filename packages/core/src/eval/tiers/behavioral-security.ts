import type {
  TierEvaluator,
  EvalOptions,
  SecurityTierResult,
  SecurityFinding,
} from '../types.js';
import { scoreToGrade } from '../types.js';
import { securityPrompt } from '../prompts/security-prompt.js';
import { createProvider } from '../../ai/providers/factory.js';
import type { ProviderName } from '../../ai/providers/types.js';

function extractBalancedJsonArray(raw: string): string | null {
  const start = raw.indexOf('[');
  if (start === -1) return null;
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < raw.length; i++) {
    const ch = raw[i];
    if (escape) { escape = false; continue; }
    if (ch === '\\' && inString) { escape = true; continue; }
    if (ch === '"' && !escape) { inString = !inString; continue; }
    if (inString) continue;
    if (ch === '[') depth++;
    else if (ch === ']') {
      depth--;
      if (depth === 0) return raw.slice(start, i + 1);
    }
  }
  return null;
}

const DANGEROUS_PATTERNS = [
  { pattern: /\beval\s*\(/, label: 'eval()' },
  { pattern: /\bnew\s+Function\s*\(/, label: 'new Function()' },
  { pattern: /\bexec\s*\(/, label: 'exec()' },
  { pattern: /\bexecSync\s*\(/, label: 'execSync()' },
  { pattern: /\bchild_process\b/, label: 'child_process' },
  { pattern: /\.innerHTML\s*=/, label: 'innerHTML assignment' },
  { pattern: /document\.write\s*\(/, label: 'document.write()' },
  { pattern: /\bcurl\s+/, label: 'curl command' },
  { pattern: /\bwget\s+/, label: 'wget command' },
  { pattern: /\brm\s+-rf\b/, label: 'rm -rf' },
];

const SUSPICIOUS_FETCH = /fetch\s*\(\s*['"`]https?:\/\/(?!localhost|127\.0\.0\.1)/;

const OBFUSCATION_PATTERNS = [
  { pattern: /(?:[A-Za-z0-9+/]{4}){10,}={0,2}/, label: 'base64-encoded string' },
  { pattern: /\\x[0-9a-fA-F]{2}(?:\\x[0-9a-fA-F]{2}){4,}/, label: 'hex-encoded string' },
  { pattern: /String\.fromCharCode\s*\(/, label: 'String.fromCharCode chain' },
];

const INPUT_SOURCES = [
  /\$input\b/,
  /\{\{.*?\}\}/,
  /`[^`]*\$\{/,
  /\buserInput\b/,
  /\buser_input\b/,
  /\brequest\.body\b/,
];

const DANGEROUS_SINKS = [
  { pattern: /\beval\b/, label: 'eval' },
  { pattern: /\bexec\b/, label: 'exec' },
  { pattern: /\bfetch\b/, label: 'fetch' },
  { pattern: /\.innerHTML\b/, label: 'innerHTML' },
  { pattern: /document\.write\b/, label: 'document.write' },
  { pattern: /\bFunction\b/, label: 'Function constructor' },
];

const SEVERITY_PENALTIES: Record<string, number> = {
  critical: 25,
  high: 15,
  medium: 8,
  low: 3,
};

function extractCodeBlocks(content: string): { code: string; lang: string; index: number }[] {
  const blocks: { code: string; lang: string; index: number }[] = [];
  const regex = /```(\w*)\n([\s\S]*?)```/g;
  let match;

  while ((match = regex.exec(content)) !== null) {
    blocks.push({
      lang: match[1] || 'unknown',
      code: match[2],
      index: match.index,
    });
  }

  return blocks;
}

function runCodeBlockAnalysis(content: string): SecurityFinding[] {
  const findings: SecurityFinding[] = [];
  const codeBlocks = extractCodeBlocks(content);
  const searchTargets = [
    ...codeBlocks.map((b) => ({ text: b.code, location: `code block (${b.lang})` })),
    { text: content, location: 'skill content' },
  ];

  for (const target of searchTargets) {
    for (const { pattern, label } of DANGEROUS_PATTERNS) {
      const match = target.text.match(pattern);
      if (match) {
        findings.push({
          engine: 'ast',
          severity: label === 'rm -rf' || label === 'eval()' || label === 'child_process'
            ? 'critical'
            : 'high',
          description: `Dangerous pattern detected: ${label}`,
          location: target.location,
          snippet: match[0],
          remediation: `Remove or sandbox the use of ${label}. Consider safer alternatives.`,
        });
      }
    }

    const fetchMatch = target.text.match(SUSPICIOUS_FETCH);
    if (fetchMatch) {
      findings.push({
        engine: 'ast',
        severity: 'high',
        description: 'Fetch to external URL detected — potential data exfiltration vector',
        location: target.location,
        snippet: fetchMatch[0],
        remediation: 'Validate and allowlist external URLs. Avoid sending sensitive data to unknown endpoints.',
      });
    }

    for (const { pattern, label } of OBFUSCATION_PATTERNS) {
      const match = target.text.match(pattern);
      if (match) {
        findings.push({
          engine: 'ast',
          severity: label === 'String.fromCharCode chain' ? 'high' : 'medium',
          description: `Obfuscation detected: ${label}`,
          location: target.location,
          snippet: match[0].slice(0, 80),
          remediation: 'Replace obfuscated content with readable code. Obfuscation in skills is a red flag.',
        });
      }
    }
  }

  const seen = new Set<string>();
  return findings.filter((f) => {
    const key = `${f.description}::${f.snippet}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function runTaintTracking(content: string): SecurityFinding[] {
  const findings: SecurityFinding[] = [];
  const lines = content.split('\n');

  const hasInputSource = INPUT_SOURCES.some((p) => p.test(content));
  if (!hasInputSource) {
    return findings;
  }

  const inputLines: number[] = [];
  const sinkLines: { line: number; label: string }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (INPUT_SOURCES.some((p) => p.test(line))) {
      inputLines.push(i);
    }
    for (const { pattern, label } of DANGEROUS_SINKS) {
      if (pattern.test(line)) {
        sinkLines.push({ line: i, label });
      }
    }
  }

  for (const sinkInfo of sinkLines) {
    const nearbyInput = inputLines.some(
      (inputLine) => Math.abs(inputLine - sinkInfo.line) <= 10
    );

    if (nearbyInput) {
      findings.push({
        engine: 'taint',
        severity: sinkInfo.label === 'eval' || sinkInfo.label === 'exec'
          ? 'critical'
          : 'high',
        description: `Unsanitized input flows to dangerous sink: ${sinkInfo.label}`,
        location: `line ${sinkInfo.line + 1}`,
        snippet: lines[sinkInfo.line].trim(),
        remediation: `Sanitize or validate input before passing to ${sinkInfo.label}. Add input validation between source and sink.`,
      });
    }
  }

  return findings;
}

async function runLLMAnalysis(
  content: string,
  options: EvalOptions
): Promise<SecurityFinding[]> {
  try {
    const provider = createProvider(
      (options.provider as ProviderName) || undefined,
      options.model ? { model: options.model } : undefined
    );

    if (!provider.isConfigured()) {
      return [];
    }

    const messages = securityPrompt(content);
    const response = await provider.chat(messages);

    const jsonStr = extractBalancedJsonArray(response);
    if (!jsonStr) {
      return [];
    }

    const parsed = JSON.parse(jsonStr);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter(
        (f: Record<string, unknown>) =>
          typeof f === 'object' &&
          f !== null &&
          typeof f.severity === 'string' &&
          typeof f.description === 'string'
      )
      .map((f: Record<string, unknown>) => ({
        engine: 'llm' as const,
        severity: (['critical', 'high', 'medium', 'low'].includes(f.severity as string)
          ? f.severity
          : 'medium') as SecurityFinding['severity'],
        description: String(f.description),
        snippet: typeof f.snippet === 'string' ? f.snippet : undefined,
        remediation: typeof f.remediation === 'string' ? f.remediation : undefined,
      }));
  } catch {
    return [];
  }
}

function lowerSeverity(
  severity: SecurityFinding['severity']
): SecurityFinding['severity'] {
  const levels: SecurityFinding['severity'][] = ['critical', 'high', 'medium', 'low'];
  const idx = levels.indexOf(severity);
  return idx < levels.length - 1 ? levels[idx + 1] : 'low';
}

function crossValidate(findings: SecurityFinding[]): {
  findings: SecurityFinding[];
  crossValidated: number;
} {
  const grouped = new Map<string, SecurityFinding[]>();

  for (const finding of findings) {
    const key = finding.description
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim()
      .split(' ')
      .slice(0, 4)
      .join(' ');

    const existing = grouped.get(key);
    if (existing) {
      existing.push(finding);
    } else {
      grouped.set(key, [finding]);
    }
  }

  let crossValidatedCount = 0;
  const snippetMatched = new Map<string, Set<string>>();

  for (const finding of findings) {
    if (!finding.snippet) continue;
    const snippet = finding.snippet.toLowerCase().trim();
    if (snippet.length < 3) continue;

    const engines = snippetMatched.get(snippet) || new Set();
    engines.add(finding.engine);
    snippetMatched.set(snippet, engines);
  }

  Array.from(snippetMatched.values()).forEach((engines) => {
    if (engines.size >= 2) {
      crossValidatedCount += engines.size;
    }
  });

  Array.from(grouped.entries()).forEach(([, group]) => {
    const uniqueEngines = new Set(group.map((f) => f.engine));
    if (uniqueEngines.size >= 2) {
      crossValidatedCount += uniqueEngines.size;
    }
  });

  const result: SecurityFinding[] = [];
  const seen = new Set<string>();

  for (const finding of findings) {
    const snippet = (finding.snippet || '').toLowerCase().trim();
    const multiEngine =
      (snippet.length >= 3 && (snippetMatched.get(snippet)?.size ?? 0) >= 2) ||
      Array.from(grouped.values()).some(
        (group) =>
          group.includes(finding) &&
          new Set(group.map((f) => f.engine)).size >= 2
      );

    const dedupeKey = `${finding.engine}:${finding.description}:${finding.snippet || ''}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    if (multiEngine) {
      result.push(finding);
    } else {
      result.push({
        ...finding,
        severity: lowerSeverity(finding.severity),
      });
    }
  }

  return { findings: result, crossValidated: crossValidatedCount };
}

export class BehavioralSecurityEvaluator implements TierEvaluator {
  readonly tier = 3 as const;
  readonly name = 'Behavioral Security';

  async evaluate(
    content: string,
    _skillPath: string,
    options: EvalOptions
  ): Promise<SecurityTierResult> {
    const start = performance.now();
    const engines: string[] = [];

    const astFindings = runCodeBlockAnalysis(content);
    engines.push('ast');

    const taintFindings = runTaintTracking(content);
    engines.push('taint');

    let llmFindings: SecurityFinding[] = [];
    if (options.provider || options.model) {
      llmFindings = await runLLMAnalysis(content, options);
      if (llmFindings.length > 0) {
        engines.push('llm');
      }
    }

    const allFindings = [...astFindings, ...taintFindings, ...llmFindings];
    const { findings, crossValidated } = crossValidate(allFindings);

    let score = 100;
    for (const finding of findings) {
      score -= SEVERITY_PENALTIES[finding.severity] ?? 0;
    }
    score = Math.max(0, score);

    const duration = Math.round(performance.now() - start);

    return {
      tier: 3,
      name: this.name,
      score,
      grade: scoreToGrade(score),
      duration,
      details: {
        findings,
        engines,
        crossValidated,
      },
    };
  }
}
