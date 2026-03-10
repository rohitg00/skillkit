import type {
  TierEvaluator,
  EvalOptions,
  ContradictionTierResult,
  ContradictionFinding,
} from '../types.js';
import { scoreToGrade } from '../types.js';
import { createProvider } from '../../ai/providers/factory.js';
import type { ProviderName } from '../../ai/providers/types.js';
import { contradictionPrompt } from '../prompts/contradiction-prompt.js';

interface BoundaryPair {
  positive: RegExp;
  negative: RegExp;
  label: string;
}

function buildBoundaryPairs(content: string): BoundaryPair[] {
  const terms = new Set<string>();
  const boundaryRe = /\b(?:always|never|must|must not|do not|don't)\s+([\w\s]{2,30}?)(?:[.,;!\n]|$)/gi;
  let match: RegExpExecArray | null;
  while ((match = boundaryRe.exec(content)) !== null) {
    const term = match[1].trim().toLowerCase();
    if (term.length >= 2) {
      terms.add(term);
    }
  }
  const pairs: BoundaryPair[] = [];
  for (const term of terms) {
    if (term.length > 100) continue;
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    pairs.push({
      positive: new RegExp(`\\balways\\s{1,10}${escaped}\\b`, 'i'),
      negative: new RegExp(`\\b(?:never|don'?t|do not)\\s{1,10}${escaped}\\b`, 'i'),
      label: term,
    });
  }
  return pairs;
}

function findBoundaryContradictions(content: string): ContradictionFinding[] {
  const findings: ContradictionFinding[] = [];
  const pairs = buildBoundaryPairs(content);
  const lines = content.split('\n');

  for (const pair of pairs) {
    const posMatch = pair.positive.exec(content);
    const negMatch = pair.negative.exec(content);
    if (posMatch && negMatch) {
      const lineA = findLineNumber(lines, posMatch.index);
      const lineB = findLineNumber(lines, negMatch.index);
      findings.push({
        type: 'formal',
        severity: 'critical',
        description: `Boundary contradiction: "always ${pair.label}" conflicts with negation of the same term`,
        lineA,
        lineB,
        textA: posMatch[0],
        textB: negMatch[0],
      });
    }
  }
  return findings;
}

function findMustConflicts(content: string): ContradictionFinding[] {
  const findings: ContradictionFinding[] = [];
  const lines = content.split('\n');
  const mustRe = /\bmust\s+([\w\s]{2,30}?)(?:[.,;!\n]|$)/gi;
  const mustNotRe = /\bmust\s+not\s+([\w\s]{2,30}?)(?:[.,;!\n]|$)/gi;

  const musts = new Map<string, { text: string; index: number }>();
  const mustNots = new Map<string, { text: string; index: number }>();

  let match: RegExpExecArray | null;
  while ((match = mustRe.exec(content)) !== null) {
    const term = match[1].trim().toLowerCase();
    if (term.startsWith('not')) continue;
    musts.set(term, { text: match[0], index: match.index });
  }
  while ((match = mustNotRe.exec(content)) !== null) {
    const term = match[1].trim().toLowerCase();
    mustNots.set(term, { text: match[0], index: match.index });
  }

  for (const [term, pos] of musts) {
    const neg = mustNots.get(term);
    if (neg) {
      findings.push({
        type: 'formal',
        severity: 'critical',
        description: `Must/must-not conflict for "${term}"`,
        lineA: findLineNumber(lines, pos.index),
        lineB: findLineNumber(lines, neg.index),
        textA: pos.text,
        textB: neg.text,
      });
    }
  }
  return findings;
}

function extractFrontmatterTools(content: string): string[] {
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) return [];
  const toolsMatch = fmMatch[1].match(/tools\s*:\s*\[([^\]]*)\]/);
  if (!toolsMatch) return [];
  return toolsMatch[1]
    .split(',')
    .map((t) => t.trim().replace(/["']/g, ''))
    .filter(Boolean);
}

function findToolPermissionConflicts(content: string): ContradictionFinding[] {
  const findings: ContradictionFinding[] = [];
  const tools = extractFrontmatterTools(content);
  if (tools.length === 0) return findings;

  const lines = content.split('\n');
  const fmEnd = content.indexOf('---', content.indexOf('---') + 3);
  const body = fmEnd >= 0 ? content.slice(fmEnd + 3) : content;
  const bodyOffset = fmEnd >= 0 ? fmEnd + 3 : 0;

  for (const tool of tools) {
    if (tool.length > 100) continue;
    const escaped = tool.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const denyRe = new RegExp(
      `\\b(?:never|don'?t|do not|must not|avoid)\\s{1,10}(?:use\\s{1,10})?(?:the\\s{1,10})?${escaped}\\b`,
      'i'
    );
    const denyMatch = denyRe.exec(body);
    if (denyMatch) {
      findings.push({
        type: 'formal',
        severity: 'high',
        description: `Tool "${tool}" is granted in frontmatter but forbidden in body`,
        lineA: findLineNumber(lines, content.indexOf(`tools`)),
        lineB: findLineNumber(lines, bodyOffset + denyMatch.index),
        textA: `tools: [..., "${tool}", ...]`,
        textB: denyMatch[0],
      });
    }
  }
  return findings;
}

function findTriggerOverlaps(content: string): ContradictionFinding[] {
  const findings: ContradictionFinding[] = [];
  const lines = content.split('\n');

  const triggerLines: { text: string; index: number; lineNum: number }[] = [];
  let offset = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/trigger/i.test(line) && /when|if|on\b/i.test(line)) {
      triggerLines.push({ text: line.trim(), index: offset, lineNum: i + 1 });
    }
    offset += line.length + 1;
  }

  for (let i = 0; i < triggerLines.length; i++) {
    for (let j = i + 1; j < triggerLines.length; j++) {
      const a = triggerLines[i].text.toLowerCase();
      const b = triggerLines[j].text.toLowerCase();
      const hasNegation =
        (a.includes('not') && !b.includes('not')) ||
        (!a.includes('not') && b.includes('not')) ||
        (a.includes('never') && !b.includes('never')) ||
        (!a.includes('never') && b.includes('never'));

      const sharedWords = extractSignificantWords(a).filter((w) =>
        extractSignificantWords(b).includes(w)
      );

      if (hasNegation && sharedWords.length >= 2) {
        findings.push({
          type: 'formal',
          severity: 'high',
          description: `Potentially conflicting trigger conditions`,
          lineA: triggerLines[i].lineNum,
          lineB: triggerLines[j].lineNum,
          textA: triggerLines[i].text,
          textB: triggerLines[j].text,
        });
      }
    }
  }
  return findings;
}

function extractSignificantWords(text: string): string[] {
  const stopWords = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'shall', 'can', 'to', 'of', 'in', 'for',
    'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during',
    'before', 'after', 'and', 'but', 'or', 'nor', 'not', 'no', 'if',
    'when', 'then', 'than', 'that', 'this', 'it', 'its', 'trigger',
    'never', 'always', 'must', 'don', 'doesn',
  ]);
  return text
    .split(/\W+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));
}

function findLineNumber(lines: string[], charIndex: number): number {
  let offset = 0;
  for (let i = 0; i < lines.length; i++) {
    if (offset + lines[i].length >= charIndex) return i + 1;
    offset += lines[i].length + 1;
  }
  return lines.length;
}

function runFormalChecks(content: string): ContradictionFinding[] {
  return [
    ...findBoundaryContradictions(content),
    ...findMustConflicts(content),
    ...findToolPermissionConflicts(content),
    ...findTriggerOverlaps(content),
  ];
}

function isDuplicate(a: ContradictionFinding, b: ContradictionFinding): boolean {
  if (a.textA && b.textA && a.textB && b.textB) {
    const aTexts = [a.textA.toLowerCase(), a.textB.toLowerCase()].sort();
    const bTexts = [b.textA.toLowerCase(), b.textB.toLowerCase()].sort();
    if (aTexts[0] === bTexts[0] && aTexts[1] === bTexts[1]) return true;
  }
  const descA = a.description.toLowerCase();
  const descB = b.description.toLowerCase();
  const wordsA = new Set(descA.split(/\W+/).filter((w) => w.length > 3));
  const wordsB = new Set(descB.split(/\W+/).filter((w) => w.length > 3));
  if (wordsA.size === 0 || wordsB.size === 0) return false;
  const intersection = [...wordsA].filter((w) => wordsB.has(w));
  const union = new Set([...wordsA, ...wordsB]);
  return intersection.length / union.size > 0.6;
}

function deduplicateFindings(findings: ContradictionFinding[]): ContradictionFinding[] {
  const result: ContradictionFinding[] = [];
  for (const finding of findings) {
    const hasDupe = result.some((existing) => isDuplicate(existing, finding));
    if (!hasDupe) {
      result.push(finding);
    }
  }
  return result;
}

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

function parseSemanticFindings(raw: string): ContradictionFinding[] {
  const jsonStr = extractBalancedJsonArray(raw);
  if (!jsonStr) return [];

  try {
    const parsed = JSON.parse(jsonStr);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(
        (item: Record<string, unknown>) =>
          typeof item === 'object' &&
          item !== null &&
          typeof item.description === 'string' &&
          typeof item.severity === 'string'
      )
      .map((item: Record<string, unknown>) => ({
        type: 'semantic' as const,
        severity: (['critical', 'high', 'medium', 'low'].includes(item.severity as string)
          ? item.severity
          : 'medium') as ContradictionFinding['severity'],
        description: item.description as string,
        textA: typeof item.textA === 'string' ? item.textA : undefined,
        textB: typeof item.textB === 'string' ? item.textB : undefined,
      }));
  } catch {
    return [];
  }
}

function computeScore(findings: ContradictionFinding[]): number {
  const penalties: Record<ContradictionFinding['severity'], number> = {
    critical: 20,
    high: 10,
    medium: 5,
    low: 2,
  };

  let score = 100;
  for (const finding of findings) {
    score -= penalties[finding.severity];
  }
  return Math.max(0, score);
}

export class ContradictionEvaluator implements TierEvaluator {
  readonly tier = 2 as const;
  readonly name = 'Contradiction Detection';

  async evaluate(
    content: string,
    _skillPath: string,
    options: EvalOptions
  ): Promise<ContradictionTierResult> {
    const start = performance.now();

    const formalFindings = runFormalChecks(content);
    let semanticFindings: ContradictionFinding[] = [];

    try {
      const provider = createProvider(
        (options.provider as ProviderName) || undefined,
        options.model ? { model: options.model } : undefined
      );

      if (provider.isConfigured()) {
        const messages = contradictionPrompt(content);
        const response = await provider.chat(messages);
        semanticFindings = parseSemanticFindings(response);
      }
    } catch {
      // LLM unavailable — proceed with formal findings only
    }

    const allFindings = deduplicateFindings([...formalFindings, ...semanticFindings]);
    const score = computeScore(allFindings);
    const duration = Math.round(performance.now() - start);

    return {
      tier: 2,
      name: this.name,
      score,
      grade: scoreToGrade(score),
      duration,
      details: {
        findings: allFindings,
        formalCount: allFindings.filter((f) => f.type === 'formal').length,
        semanticCount: allFindings.filter((f) => f.type === 'semantic').length,
      },
    };
  }
}
