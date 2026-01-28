import { readFileSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';

export * from './benchmark.js';

export interface QualityScore {
  overall: number;
  structure: StructureScore;
  clarity: ClarityScore;
  specificity: SpecificityScore;
  advanced: AdvancedScore;
  warnings: string[];
  suggestions: string[];
}

export interface AdvancedScore {
  score: number;
  deprecatedPatterns: string[];
  conflictingInstructions: string[];
  securityIssues: string[];
  completeness: CompletenessResult;
}

export interface CompletenessResult {
  score: number;
  hasTodos: boolean;
  todoCount: number;
  emptySections: string[];
  exampleCoverage: number;
}

export interface StructureScore {
  score: number;
  hasMetadata: boolean;
  hasDescription: boolean;
  hasTriggers: boolean;
  hasExamples: boolean;
  hasBoundaries: boolean;
  hasWhenToUse: boolean;
}

export interface ClarityScore {
  score: number;
  lineCount: number;
  tokenCount: number;
  avgSentenceLength: number;
  hasHeaders: boolean;
}

export interface SpecificityScore {
  score: number;
  hasConcreteCommands: boolean;
  hasFilePatterns: boolean;
  hasCodeExamples: boolean;
  vagueTermCount: number;
}

const VAGUE_TERMS = [
  'be helpful',
  'assist the user',
  'help with',
  'try to',
  'attempt to',
  'do your best',
  'as needed',
  'when appropriate',
  'if necessary',
  'general purpose',
  'various tasks',
  'many things',
  'etc.',
  'and so on',
  'stuff like that',
];

const BOUNDARY_PATTERNS = [
  /never\s+(?:do|use|commit|push|delete|remove)/i,
  /always\s+(?:do|use|check|verify|ensure)/i,
  /don'?t\s+(?:do|use|commit|push|delete)/i,
  /avoid\s+(?:using|doing|committing)/i,
  /must\s+(?:not|always|never)/i,
  /forbidden/i,
  /prohibited/i,
  /required/i,
];

const TRIGGER_PATTERNS = [
  /when\s+to\s+use/i,
  /use\s+this\s+(?:skill|when)/i,
  /triggers?\s*(?:when|:)/i,
  /activated?\s+(?:when|by)/i,
  /applies?\s+(?:when|to)/i,
  /invoke\s+(?:when|this)/i,
];

const COMMAND_PATTERNS = [
  /```(?:bash|sh|shell|zsh)[\s\S]*?```/g,
  /`(?:npm|pnpm|yarn|bun|npx|git|docker|kubectl)\s+[^`]+`/g,
  /\$\s*\w+/g,
];

const CODE_EXAMPLE_PATTERNS = [
  /```(?:typescript|javascript|tsx|jsx|python|go|rust|java)[\s\S]*?```/g,
  /```[\s\S]{50,}?```/g,
];

const FILE_PATTERN_PATTERNS = [
  /\*\*\/\*\.\w+/,
  /\.\w+$/m,
  /glob[s]?\s*[:=]/i,
  /include[s]?\s*[:=]/i,
  /pattern[s]?\s*[:=]/i,
];

const DEPRECATED_PATTERNS = [
  { pattern: /require\s*\(['"][^'"]+['"]\)/g, message: 'Uses CommonJS require() instead of ES modules' },
  { pattern: /React\.Component/g, message: 'Uses class components instead of functional' },
  { pattern: /componentDidMount|componentWillUnmount|componentDidUpdate/g, message: 'Uses lifecycle methods instead of hooks' },
  { pattern: /\bvar\s+\w+\s*=/g, message: 'Uses var instead of const/let' },
  { pattern: /\.then\s*\([^)]*\)\.catch/g, message: 'Uses .then().catch() instead of async/await' },
  { pattern: /new\s+Promise\s*\(/g, message: 'Consider using async/await instead of new Promise()' },
];

const SECURITY_PATTERNS = [
  { pattern: /password\s*[:=]\s*['"][^'"]+['"]/gi, message: 'Potential hardcoded password' },
  { pattern: /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/gi, message: 'Potential hardcoded API key' },
  { pattern: /secret\s*[:=]\s*['"][^'"]+['"]/gi, message: 'Potential hardcoded secret' },
  { pattern: /token\s*[:=]\s*['"][A-Za-z0-9_-]{20,}['"]/gi, message: 'Potential hardcoded token' },
  { pattern: /\$\{[^}]*\}/g, message: 'Template literal - ensure proper sanitization in shell commands' },
  { pattern: /eval\s*\(/g, message: 'Uses eval() - potential code injection risk' },
  { pattern: /innerHTML\s*=/g, message: 'Uses innerHTML - potential XSS risk' },
  { pattern: /dangerouslySetInnerHTML/g, message: 'Uses dangerouslySetInnerHTML - potential XSS risk' },
];


function extractFrontmatter(content: string): Record<string, unknown> | null {
  const normalizedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const match = normalizedContent.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) return null;

  const frontmatter: Record<string, unknown> = {};
  const lines = match[1].split('\n');

  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      const value = line.slice(colonIndex + 1).trim();
      frontmatter[key] = value;
    }
  }

  return Object.keys(frontmatter).length > 0 ? frontmatter : null;
}

function countTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function countVagueTerms(content: string): number {
  const lowerContent = content.toLowerCase();
  let count = 0;
  for (const term of VAGUE_TERMS) {
    const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const matches = lowerContent.match(regex);
    if (matches) count += matches.length;
  }
  return count;
}

function hasPattern(content: string, patterns: RegExp[]): boolean {
  return patterns.some(p => p.test(content));
}

function countMatches(content: string, patterns: RegExp[]): number {
  let count = 0;
  for (const pattern of patterns) {
    const matches = content.match(pattern);
    if (matches) count += matches.length;
  }
  return count;
}

function calculateAvgSentenceLength(content: string): number {
  const contentWithoutCode = content.replace(/```[\s\S]*?```/g, '');
  const sentences = contentWithoutCode.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length === 0) return 0;
  const totalWords = sentences.reduce((sum, s) => sum + s.trim().split(/\s+/).length, 0);
  return Math.round(totalWords / sentences.length);
}

function evaluateStructure(content: string): StructureScore {
  const frontmatter = extractFrontmatter(content);
  const hasMetadata = frontmatter !== null && Object.keys(frontmatter).length > 0;
  const hasDescription = !!(frontmatter?.description) || /^#+\s*description/im.test(content);
  const hasTriggers = hasPattern(content, TRIGGER_PATTERNS);
  const hasExamples = countMatches(content, CODE_EXAMPLE_PATTERNS) > 0;
  const hasBoundaries = hasPattern(content, BOUNDARY_PATTERNS);
  const hasWhenToUse = /when\s+to\s+use|use\s+case|scenario/i.test(content);

  let score = 0;
  if (hasMetadata) score += 15;
  if (hasDescription) score += 10;
  if (hasTriggers) score += 20;
  if (hasExamples) score += 20;
  if (hasBoundaries) score += 20;
  if (hasWhenToUse) score += 15;

  return {
    score: Math.min(100, score),
    hasMetadata,
    hasDescription,
    hasTriggers,
    hasExamples,
    hasBoundaries,
    hasWhenToUse,
  };
}

function evaluateClarity(content: string): ClarityScore {
  const lines = content.split('\n');
  const lineCount = lines.length;
  const tokenCount = countTokens(content);
  const avgSentenceLength = calculateAvgSentenceLength(content);
  const hasHeaders = /^#+\s+/m.test(content);

  let score = 100;

  if (lineCount > 500) score -= 30;
  else if (lineCount > 300) score -= 15;
  else if (lineCount > 150) score -= 5;

  if (tokenCount > 4000) score -= 30;
  else if (tokenCount > 2000) score -= 15;
  else if (tokenCount > 1000) score -= 5;

  if (avgSentenceLength > 30) score -= 20;
  else if (avgSentenceLength > 20) score -= 10;

  if (!hasHeaders) score -= 15;

  return {
    score: Math.max(0, score),
    lineCount,
    tokenCount,
    avgSentenceLength,
    hasHeaders,
  };
}

function countCodeBlocks(content: string): number {
  const fencedBlocks = content.match(/```[\s\S]*?```/g) || [];
  return fencedBlocks.length;
}

function detectDeprecatedPatterns(content: string): string[] {
  const codeBlocks = content.match(/```[\s\S]*?```/g) || [];
  const codeContent = codeBlocks.join('\n');
  const issues: string[] = [];

  for (const { pattern, message } of DEPRECATED_PATTERNS) {
    const regex = new RegExp(pattern.source, pattern.flags);
    if (regex.test(codeContent)) {
      issues.push(message);
    }
  }

  return [...new Set(issues)];
}

function detectSecurityPatterns(content: string): string[] {
  const issues: string[] = [];

  for (const { pattern, message } of SECURITY_PATTERNS) {
    const regex = new RegExp(pattern.source, pattern.flags);
    if (regex.test(content)) {
      if (!message.includes('Template literal') || content.includes('bash') || content.includes('shell')) {
        issues.push(message);
      }
    }
  }

  return [...new Set(issues)];
}

function detectConflictingInstructions(content: string): string[] {
  const issues: string[] = [];
  const lowerContent = content.toLowerCase();

  const alwaysMatches = lowerContent.match(/always\s+(?:use|do|include|add)\s+(\w+)/gi) || [];
  const neverMatches = lowerContent.match(/never\s+(?:use|do|include|add)\s+(\w+)/gi) || [];

  for (const always of alwaysMatches) {
    const term = always.replace(/always\s+(?:use|do|include|add)\s+/i, '').toLowerCase();
    for (const never of neverMatches) {
      const neverTerm = never.replace(/never\s+(?:use|do|include|add)\s+/i, '').toLowerCase();
      if (term === neverTerm) {
        issues.push(`Conflicting instructions: "always" and "never" used with "${term}"`);
      }
    }
  }

  const mustMatches = lowerContent.match(/must\s+(\w+)/gi) || [];
  const mustNotMatches = lowerContent.match(/must\s+not\s+(\w+)/gi) || [];

  for (const must of mustMatches) {
    const term = must.replace(/must\s+/i, '').toLowerCase();
    for (const mustNot of mustNotMatches) {
      const notTerm = mustNot.replace(/must\s+not\s+/i, '').toLowerCase();
      if (term === notTerm) {
        issues.push(`Conflicting instructions: "must" and "must not" used with "${term}"`);
      }
    }
  }

  return [...new Set(issues)];
}

function assessCompleteness(content: string): CompletenessResult {
  const todoMatches = content.match(/TODO|FIXME|XXX|HACK/gi) || [];
  const todoCount = todoMatches.length;

  const headerRegex = /^#+\s+(.+)$/gm;
  const headerPositions: Array<{ header: string; index: number }> = [];
  let match;
  while ((match = headerRegex.exec(content)) !== null) {
    headerPositions.push({ header: match[0], index: match.index });
  }

  const emptySections: string[] = [];

  for (let i = 0; i < headerPositions.length - 1; i++) {
    const current = headerPositions[i];
    const next = headerPositions[i + 1];
    const sectionContent = content.slice(current.index + current.header.length, next.index).trim();

    if (sectionContent.length < 20) {
      const sectionName = current.header.replace(/^#+\s+/, '');
      emptySections.push(sectionName);
    }
  }

  const codeBlocks = countCodeBlocks(content);
  const exampleCoverage = Math.min(100, codeBlocks * 25);

  let score = 100;
  if (todoCount > 0) score -= Math.min(30, todoCount * 10);
  if (emptySections.length > 0) score -= Math.min(30, emptySections.length * 10);
  if (codeBlocks < 2) score -= 20;
  else if (codeBlocks < 4) score -= 10;

  return {
    score: Math.max(0, score),
    hasTodos: todoCount > 0,
    todoCount,
    emptySections,
    exampleCoverage,
  };
}

function evaluateAdvanced(content: string): AdvancedScore {
  const deprecatedPatterns = detectDeprecatedPatterns(content);
  const conflictingInstructions = detectConflictingInstructions(content);
  const securityIssues = detectSecurityPatterns(content);
  const completeness = assessCompleteness(content);

  let score = 100;
  score -= Math.min(30, deprecatedPatterns.length * 10);
  score -= Math.min(30, conflictingInstructions.length * 15);
  score -= Math.min(25, securityIssues.length * 10);
  score -= Math.round((100 - completeness.score) * 0.15);

  return {
    score: Math.max(0, score),
    deprecatedPatterns,
    conflictingInstructions,
    securityIssues,
    completeness,
  };
}

function evaluateSpecificity(content: string): SpecificityScore {
  const hasConcreteCommands = countMatches(content, COMMAND_PATTERNS) > 0;
  const hasFilePatterns = hasPattern(content, FILE_PATTERN_PATTERNS);
  const codeBlockCount = countCodeBlocks(content);
  const hasCodeExamples = codeBlockCount >= 2;
  const vagueTermCount = countVagueTerms(content);

  let score = 0;

  if (hasConcreteCommands) score += 30;
  if (hasFilePatterns) score += 25;
  if (hasCodeExamples) score += 30;

  if (vagueTermCount === 0) score += 15;
  else if (vagueTermCount <= 2) score += 10;
  else if (vagueTermCount <= 5) score += 5;

  return {
    score: Math.min(100, score),
    hasConcreteCommands,
    hasFilePatterns,
    hasCodeExamples,
    vagueTermCount,
  };
}

function generateWarnings(
  structure: StructureScore,
  clarity: ClarityScore,
  specificity: SpecificityScore,
  advanced: AdvancedScore
): string[] {
  const warnings: string[] = [];

  if (!structure.hasMetadata) {
    warnings.push('Missing frontmatter metadata');
  }
  if (!structure.hasTriggers) {
    warnings.push('No trigger conditions defined');
  }
  if (!structure.hasBoundaries) {
    warnings.push('No boundaries or constraints specified');
  }
  if (clarity.lineCount > 500) {
    warnings.push(`Skill is too long (${clarity.lineCount} lines)`);
  }
  if (clarity.tokenCount > 4000) {
    warnings.push(`High token usage (${clarity.tokenCount} tokens)`);
  }
  if (specificity.vagueTermCount > 5) {
    warnings.push(`Contains ${specificity.vagueTermCount} vague terms`);
  }
  if (!structure.hasExamples) {
    warnings.push('No code examples provided');
  } else if (!specificity.hasCodeExamples) {
    warnings.push('Only one code example provided');
  }

  for (const issue of advanced.securityIssues) {
    warnings.push(`Security: ${issue}`);
  }
  for (const conflict of advanced.conflictingInstructions) {
    warnings.push(conflict);
  }
  if (advanced.completeness.hasTodos) {
    warnings.push(`Contains ${advanced.completeness.todoCount} TODO/FIXME comment(s)`);
  }
  if (advanced.completeness.emptySections.length > 0) {
    warnings.push(`Empty sections: ${advanced.completeness.emptySections.join(', ')}`);
  }

  return warnings;
}

function generateSuggestions(
  structure: StructureScore,
  clarity: ClarityScore,
  specificity: SpecificityScore,
  advanced: AdvancedScore
): string[] {
  const suggestions: string[] = [];

  if (!structure.hasMetadata) {
    suggestions.push('Add YAML frontmatter with name, description, and globs');
  }
  if (!structure.hasTriggers) {
    suggestions.push('Add a "When to Use" section with specific trigger conditions');
  }
  if (!structure.hasExamples) {
    suggestions.push('Include code examples showing expected output');
  }
  if (!structure.hasBoundaries) {
    suggestions.push('Define boundaries: what the agent should never do');
  }
  if (clarity.lineCount > 300) {
    suggestions.push('Consider splitting into multiple focused skills');
  }
  if (!clarity.hasHeaders) {
    suggestions.push('Use markdown headers to organize content');
  }
  if (specificity.vagueTermCount > 0) {
    suggestions.push('Replace vague terms with specific instructions');
  }
  if (!specificity.hasConcreteCommands) {
    suggestions.push('Add concrete executable commands with flags');
  }

  if (advanced.deprecatedPatterns.length > 0) {
    suggestions.push('Update code examples to use modern patterns (ES modules, hooks, async/await)');
  }
  if (advanced.securityIssues.length > 0) {
    suggestions.push('Review and remove potential security risks from examples');
  }
  if (advanced.completeness.hasTodos) {
    suggestions.push('Complete or remove TODO/FIXME comments');
  }
  if (advanced.completeness.emptySections.length > 0) {
    suggestions.push('Add content to empty sections or remove them');
  }
  if (advanced.completeness.exampleCoverage < 50) {
    suggestions.push('Add more code examples to improve coverage');
  }

  return suggestions;
}

export function evaluateSkillContent(content: string): QualityScore {
  const structure = evaluateStructure(content);
  const clarity = evaluateClarity(content);
  const specificity = evaluateSpecificity(content);
  const advanced = evaluateAdvanced(content);

  const overall = Math.round(
    structure.score * 0.35 +
    clarity.score * 0.25 +
    specificity.score * 0.25 +
    advanced.score * 0.15
  );

  const warnings = generateWarnings(structure, clarity, specificity, advanced);
  const suggestions = generateSuggestions(structure, clarity, specificity, advanced);

  return {
    overall,
    structure,
    clarity,
    specificity,
    advanced,
    warnings,
    suggestions,
  };
}

export function evaluateSkillFile(filePath: string): QualityScore | null {
  if (!existsSync(filePath)) return null;

  try {
    const content = readFileSync(filePath, 'utf-8');
    return evaluateSkillContent(content);
  } catch {
    return null;
  }
}

export function evaluateSkillDirectory(dirPath: string): QualityScore | null {
  const skillMdPath = join(dirPath, 'SKILL.md');
  if (existsSync(skillMdPath)) {
    return evaluateSkillFile(skillMdPath);
  }

  const mdcFiles = ['index.mdc', `${basename(dirPath)}.mdc`];
  for (const file of mdcFiles) {
    const mdcPath = join(dirPath, file);
    if (existsSync(mdcPath)) {
      return evaluateSkillFile(mdcPath);
    }
  }

  return null;
}

export function getQualityGrade(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

export function isHighQuality(score: QualityScore): boolean {
  return score.overall >= 80 && score.warnings.length <= 2;
}
