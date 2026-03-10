import type { EvalResult, TierResult, DimensionScore, ContradictionFinding, SecurityFinding, BenchmarkComparison, CommunitySignal } from './types.js';

const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const CYAN = '\x1b[36m';
const WHITE = '\x1b[37m';

const GRADE_COLORS: Record<string, string> = {
  S: '\x1b[95m',
  A: GREEN,
  B: CYAN,
  C: YELLOW,
  D: '\x1b[33m',
  F: RED,
};

function gradeColor(grade: string): string {
  return GRADE_COLORS[grade] ?? WHITE;
}

function scoreBar(score: number, width: number = 20): string {
  const filled = Math.round((score / 100) * width);
  const empty = width - filled;
  const color = score >= 85 ? GREEN : score >= 70 ? CYAN : score >= 55 ? YELLOW : RED;
  return `${color}${'█'.repeat(filled)}${DIM}${'░'.repeat(empty)}${RESET} ${score}`;
}

function formatTierSummary(tier: TierResult): string[] {
  const lines: string[] = [];
  const gc = gradeColor(tier.grade);
  lines.push(`  ${gc}[${tier.grade}]${RESET} Tier ${tier.tier}: ${tier.name}  ${scoreBar(tier.score)}  ${DIM}(${tier.duration}ms)${RESET}`);
  return lines;
}

function formatQualityDetails(details: Record<string, unknown>): string[] {
  const lines: string[] = [];
  const dimensions = details.dimensions as DimensionScore[] | undefined;
  if (!dimensions) return lines;

  for (const dim of dimensions) {
    lines.push(`      ${dim.dimension.padEnd(18)} ${scoreBar(dim.score, 15)}  ${DIM}(confidence: ${dim.confidence.toFixed(2)})${RESET}`);
  }

  if (details.heuristicFallback) {
    lines.push(`      ${DIM}(heuristic fallback — no LLM provider configured)${RESET}`);
  }

  return lines;
}

function formatContradictionDetails(details: Record<string, unknown>): string[] {
  const lines: string[] = [];
  const findings = details.findings as ContradictionFinding[] | undefined;
  if (!findings || findings.length === 0) {
    lines.push(`      ${GREEN}No contradictions detected${RESET}`);
    return lines;
  }

  for (const f of findings) {
    const sevColor = f.severity === 'critical' ? RED : f.severity === 'high' ? RED : f.severity === 'medium' ? YELLOW : DIM;
    lines.push(`      ${sevColor}${f.severity.toUpperCase().padEnd(8)}${RESET} ${f.description}`);
    if (f.textA) lines.push(`        ${DIM}A: "${f.textA}"${RESET}`);
    if (f.textB) lines.push(`        ${DIM}B: "${f.textB}"${RESET}`);
  }

  return lines;
}

function formatSecurityDetails(details: Record<string, unknown>): string[] {
  const lines: string[] = [];
  const findings = details.findings as SecurityFinding[] | undefined;
  if (!findings || findings.length === 0) {
    lines.push(`      ${GREEN}No security issues detected${RESET}`);
    return lines;
  }

  for (const f of findings) {
    const sevColor = f.severity === 'critical' ? RED : f.severity === 'high' ? RED : f.severity === 'medium' ? YELLOW : DIM;
    lines.push(`      ${sevColor}${f.severity.toUpperCase().padEnd(8)}${RESET} [${f.engine}] ${f.description}`);
    if (f.location) lines.push(`        ${DIM}${f.location}${RESET}`);
    if (f.remediation) lines.push(`        Fix: ${f.remediation}`);
  }

  return lines;
}

function formatBenchmarkDetails(details: Record<string, unknown>): string[] {
  const lines: string[] = [];
  const comparisons = details.comparisons as BenchmarkComparison[] | undefined;
  if (!comparisons || comparisons.length === 0) return lines;

  for (const c of comparisons) {
    lines.push(`      ${c.category.padEnd(20)} P${c.percentile} ${DIM}(${c.skillScore} vs median ${c.median}, n=${c.sampleSize})${RESET}`);
  }

  return lines;
}

function formatCommunityDetails(details: Record<string, unknown>): string[] {
  const lines: string[] = [];
  const signals = details.signals as CommunitySignal[] | undefined;
  if (!signals || signals.length === 0) return lines;

  for (const s of signals) {
    lines.push(`      ${s.source.padEnd(16)} ${s.metric}: ${s.value} ${DIM}(score: ${s.normalizedScore})${RESET}`);
  }

  const warnings = details.warnings as string[] | undefined;
  if (warnings && warnings.length > 0) {
    for (const w of warnings) {
      lines.push(`      ${YELLOW}! ${w}${RESET}`);
    }
  }

  return lines;
}

function formatSandboxDetails(details: Record<string, unknown>): string[] {
  const lines: string[] = [];
  if (details.dockerAvailable === false) {
    lines.push(`      ${DIM}Docker unavailable — sandbox tests skipped${RESET}`);
    return lines;
  }
  const results = details.results as Array<{ testCase: string; passed: boolean; output?: string }> | undefined;
  if (!results || results.length === 0) {
    lines.push(`      ${DIM}No sandbox tests executed${RESET}`);
    return lines;
  }

  for (const r of results) {
    const icon = r.passed ? `${GREEN}PASS` : `${RED}FAIL`;
    lines.push(`      ${icon}${RESET} ${r.testCase}`);
    if (!r.passed && r.output) {
      lines.push(`        ${DIM}${r.output.slice(0, 200)}${RESET}`);
    }
  }

  return lines;
}

function getTierDetailFormatter(tier: number): ((details: Record<string, unknown>) => string[]) | null {
  switch (tier) {
    case 1: return formatQualityDetails;
    case 2: return formatContradictionDetails;
    case 3: return formatSecurityDetails;
    case 4: return formatSandboxDetails;
    case 5: return formatBenchmarkDetails;
    case 6: return formatCommunityDetails;
    default: return null;
  }
}

export function formatEvalSummary(result: EvalResult): string {
  const lines: string[] = [];

  lines.push('');
  lines.push(`${BOLD}Eval: ${result.skillName}${RESET}`);
  const gc = gradeColor(result.grade);
  lines.push(`Overall: ${gc}${result.grade}${RESET}  ${scoreBar(result.overallScore)}`);
  lines.push(`Duration: ${result.duration}ms | Tiers: ${result.tiers.length} | ${DIM}${result.timestamp}${RESET}`);
  lines.push('');

  for (const tier of result.tiers) {
    lines.push(...formatTierSummary(tier));

    const formatter = getTierDetailFormatter(tier.tier);
    if (formatter) {
      lines.push(...formatter(tier.details));
    }

    if (tier.details.error) {
      lines.push(`      ${RED}Error: ${tier.details.error}${RESET}`);
    }

    lines.push('');
  }

  return lines.join('\n');
}

export function formatEvalJson(result: EvalResult): string {
  return JSON.stringify(result, null, 2);
}

export function formatEvalTable(result: EvalResult): string {
  const lines: string[] = [];
  const header = ['Tier', 'Name', 'Score', 'Grade', 'Duration'];
  const widths = [6, 30, 8, 7, 10];

  lines.push(header.map((h, i) => h.padEnd(widths[i])).join(' | '));
  lines.push(widths.map((w) => '-'.repeat(w)).join('-+-'));

  for (const tier of result.tiers) {
    const row = [
      String(tier.tier).padEnd(widths[0]),
      tier.name.substring(0, widths[1]).padEnd(widths[1]),
      String(tier.score).padEnd(widths[2]),
      tier.grade.padEnd(widths[3]),
      `${tier.duration}ms`.padEnd(widths[4]),
    ];
    lines.push(row.join(' | '));
  }

  lines.push('');
  lines.push(`Overall: ${result.overallScore} (${result.grade}) | Duration: ${result.duration}ms`);
  return lines.join('\n');
}

export function formatEvalResult(result: EvalResult, format: string = 'summary'): string {
  switch (format) {
    case 'json': return formatEvalJson(result);
    case 'table': return formatEvalTable(result);
    default: return formatEvalSummary(result);
  }
}
