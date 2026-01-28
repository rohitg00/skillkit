import { readFileSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';

export interface QualityScore {
  overall: number;
  structure: StructureScore;
  clarity: ClarityScore;
  specificity: SpecificityScore;
  warnings: string[];
  suggestions: string[];
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
  specificity: SpecificityScore
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

  return warnings;
}

function generateSuggestions(
  structure: StructureScore,
  clarity: ClarityScore,
  specificity: SpecificityScore
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

  return suggestions;
}

export function evaluateSkillContent(content: string): QualityScore {
  const structure = evaluateStructure(content);
  const clarity = evaluateClarity(content);
  const specificity = evaluateSpecificity(content);

  const overall = Math.round(
    structure.score * 0.4 +
    clarity.score * 0.3 +
    specificity.score * 0.3
  );

  const warnings = generateWarnings(structure, clarity, specificity);
  const suggestions = generateSuggestions(structure, clarity, specificity);

  return {
    overall,
    structure,
    clarity,
    specificity,
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
