import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

import type { LearnedPattern, PatternCategory } from './types.js';

export interface LearnedSkillOutput {
  id: string;
  name: string;
  filename: string;
  content: string;
  patterns: LearnedPattern[];
}

export interface PatternGenerateOptions {
  outputDir?: string;
  minConfidence?: number;
  minPatterns?: number;
  format?: 'skill' | 'markdown' | 'json';
}

export function generateSkillFromPatterns(
  patterns: LearnedPattern[],
  options: PatternGenerateOptions = {}
): LearnedSkillOutput | null {
  const minConfidence = options.minConfidence ?? 0.5;
  const minPatterns = options.minPatterns ?? 1;

  const eligiblePatterns = patterns.filter(p => p.confidence >= minConfidence);

  if (eligiblePatterns.length < minPatterns) {
    return null;
  }

  const category = getMostCommonCategory(eligiblePatterns);
  const id = `learned-${category}-${Date.now()}`;
  const name = formatSkillName(category, eligiblePatterns);

  const content = generateSkillContent(name, eligiblePatterns, category);
  const filename = `${id}.md`;

  return {
    id,
    name,
    filename,
    content,
    patterns: eligiblePatterns,
  };
}

function getMostCommonCategory(patterns: LearnedPattern[]): PatternCategory {
  const counts = new Map<PatternCategory, number>();

  for (const pattern of patterns) {
    counts.set(pattern.category, (counts.get(pattern.category) || 0) + 1);
  }

  let maxCategory: PatternCategory = 'error_fix';
  let maxCount = 0;

  for (const [category, count] of counts) {
    if (count > maxCount) {
      maxCount = count;
      maxCategory = category;
    }
  }

  return maxCategory;
}

function formatSkillName(
  category: PatternCategory,
  patterns: LearnedPattern[]
): string {
  const categoryNames: Record<PatternCategory, string> = {
    error_fix: 'Error Fixes',
    refactor: 'Refactoring Patterns',
    workaround: 'Workarounds',
    debugging: 'Debugging Techniques',
    convention: 'Project Conventions',
  };

  const baseName = categoryNames[category];
  const context = patterns[0]?.context || 'Project';

  return `${baseName} - ${context}`;
}

function generateSkillContent(
  name: string,
  patterns: LearnedPattern[],
  category: PatternCategory
): string {
  const lines: string[] = [];

  lines.push('---');
  lines.push(`name: ${name.toLowerCase().replace(/\s+/g, '-')}`);
  lines.push(`description: Learned ${category.replace('_', ' ')} patterns from project history`);
  lines.push(`category: learned`);
  lines.push(`source: automated`);
  lines.push(`generated: ${new Date().toISOString()}`);
  lines.push(`pattern_count: ${patterns.length}`);
  lines.push('---');
  lines.push('');
  lines.push(`# ${name}`);
  lines.push('');
  lines.push('> This skill was automatically generated from learned patterns.');
  lines.push('');
  lines.push('## Patterns');
  lines.push('');

  for (const pattern of patterns) {
    lines.push(`### ${pattern.title}`);
    lines.push('');
    lines.push(`**Category:** ${pattern.category.replace('_', ' ')}`);
    lines.push(`**Confidence:** ${(pattern.confidence * 100).toFixed(0)}%`);
    lines.push('');
    lines.push('**Problem:**');
    lines.push(pattern.problem);
    lines.push('');
    lines.push('**Solution:**');
    lines.push(pattern.solution);
    lines.push('');

    if (pattern.example) {
      lines.push('**Example:**');
      lines.push('```');
      lines.push(pattern.example);
      lines.push('```');
      lines.push('');
    }

    lines.push('---');
    lines.push('');
  }

  return lines.join('\n');
}

export function saveGeneratedSkill(
  skill: LearnedSkillOutput,
  outputDir?: string
): string {
  const dir = outputDir || join(homedir(), '.skillkit', 'skills', 'learned');

  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  const filepath = join(dir, skill.filename);
  writeFileSync(filepath, skill.content);

  return filepath;
}

export function generatePatternReport(patterns: LearnedPattern[]): string {
  const lines: string[] = [];

  lines.push('# Learned Patterns Report');
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push(`Total Patterns: ${patterns.length}`);
  lines.push('');

  const byCategory = new Map<PatternCategory, LearnedPattern[]>();
  for (const pattern of patterns) {
    if (!byCategory.has(pattern.category)) {
      byCategory.set(pattern.category, []);
    }
    byCategory.get(pattern.category)!.push(pattern);
  }

  lines.push('## Summary by Category');
  lines.push('');
  lines.push('| Category | Count | Avg Confidence |');
  lines.push('|----------|-------|----------------|');

  for (const [category, catPatterns] of byCategory) {
    const avgConfidence = catPatterns.reduce((sum, p) => sum + p.confidence, 0) / catPatterns.length;
    lines.push(`| ${category.replace('_', ' ')} | ${catPatterns.length} | ${(avgConfidence * 100).toFixed(0)}% |`);
  }

  lines.push('');
  lines.push('## Patterns');
  lines.push('');

  const approved = patterns.filter(p => p.approved);
  const pending = patterns.filter(p => !p.approved);

  if (approved.length > 0) {
    lines.push('### Approved Patterns');
    lines.push('');
    for (const pattern of approved) {
      lines.push(`- **${pattern.title}** (${pattern.category}, ${(pattern.confidence * 100).toFixed(0)}%)`);
    }
    lines.push('');
  }

  if (pending.length > 0) {
    lines.push('### Pending Approval');
    lines.push('');
    for (const pattern of pending) {
      lines.push(`- **${pattern.title}** (${pattern.category}, ${(pattern.confidence * 100).toFixed(0)}%)`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

export function exportPatternsAsJson(patterns: LearnedPattern[]): string {
  return JSON.stringify(
    {
      version: 1,
      exportedAt: new Date().toISOString(),
      count: patterns.length,
      patterns,
    },
    null,
    2
  );
}

export function importPatternsFromJson(jsonContent: string): LearnedPattern[] {
  try {
    const data = JSON.parse(jsonContent);
    if (Array.isArray(data.patterns)) {
      return data.patterns;
    }
    if (Array.isArray(data)) {
      return data;
    }
    return [];
  } catch {
    return [];
  }
}
