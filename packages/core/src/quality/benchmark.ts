/**
 * Benchmark quality scores against category leaders
 */

import type { QualityScore } from './index.js';

export interface BenchmarkResult {
  skill: string;
  score: number;
  grade: string;
  categoryAvg: number;
  topSkillScore: number;
  percentile: number;
  comparisonNotes: string[];
  recommendations: string[];
}

export interface CategoryStats {
  category: string;
  avgScore: number;
  topScore: number;
  topSkills: string[];
  count: number;
  distribution: {
    A: number;
    B: number;
    C: number;
    D: number;
    F: number;
  };
}

const CATEGORY_BENCHMARKS: Record<string, CategoryStats> = {
  react: {
    category: 'react',
    avgScore: 78,
    topScore: 95,
    topSkills: ['react-patterns', 'react-hooks-best-practices'],
    count: 150,
    distribution: { A: 15, B: 35, C: 30, D: 15, F: 5 },
  },
  typescript: {
    category: 'typescript',
    avgScore: 75,
    topScore: 92,
    topSkills: ['typescript-strict', 'type-safety-patterns'],
    count: 120,
    distribution: { A: 12, B: 30, C: 35, D: 18, F: 5 },
  },
  testing: {
    category: 'testing',
    avgScore: 72,
    topScore: 90,
    topSkills: ['tdd-workflow', 'testing-best-practices'],
    count: 80,
    distribution: { A: 10, B: 28, C: 38, D: 19, F: 5 },
  },
  git: {
    category: 'git',
    avgScore: 80,
    topScore: 94,
    topSkills: ['git-workflow', 'conventional-commits'],
    count: 60,
    distribution: { A: 18, B: 40, C: 28, D: 12, F: 2 },
  },
  security: {
    category: 'security',
    avgScore: 76,
    topScore: 93,
    topSkills: ['security-review', 'owasp-patterns'],
    count: 45,
    distribution: { A: 14, B: 32, C: 34, D: 16, F: 4 },
  },
  api: {
    category: 'api',
    avgScore: 74,
    topScore: 91,
    topSkills: ['api-design', 'rest-best-practices'],
    count: 55,
    distribution: { A: 11, B: 30, C: 36, D: 18, F: 5 },
  },
  general: {
    category: 'general',
    avgScore: 70,
    topScore: 88,
    topSkills: ['code-review', 'best-practices'],
    count: 200,
    distribution: { A: 8, B: 25, C: 40, D: 22, F: 5 },
  },
};

export function getGrade(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

export function detectCategory(skillName: string, tags: string[] = []): string {
  const lowerName = skillName.toLowerCase();
  const lowerTags = tags.map(t => t.toLowerCase());
  const searchTerms = [lowerName, ...lowerTags];

  const categoryKeywords: Record<string, string[]> = {
    react: ['react', 'hooks', 'jsx', 'tsx', 'component', 'nextjs', 'remix'],
    typescript: ['typescript', 'type', 'types', 'ts', 'strict'],
    testing: ['test', 'testing', 'tdd', 'jest', 'vitest', 'playwright', 'e2e'],
    git: ['git', 'commit', 'branch', 'merge', 'workflow', 'conventional'],
    security: ['security', 'auth', 'owasp', 'vulnerability', 'safe'],
    api: ['api', 'rest', 'graphql', 'endpoint', 'http'],
  };

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    for (const term of searchTerms) {
      if (keywords.some(kw => term.includes(kw))) {
        return category;
      }
    }
  }

  return 'general';
}

export function calculatePercentile(score: number, categoryStats: CategoryStats): number {
  const { distribution } = categoryStats;
  const totalSkills = distribution.A + distribution.B + distribution.C + distribution.D + distribution.F;

  let percentBelow = 0;

  if (score < 60) {
    percentBelow = (score / 60) * (distribution.F / totalSkills) * 100;
  } else if (score < 70) {
    percentBelow = (distribution.F / totalSkills) * 100;
    percentBelow += ((score - 60) / 10) * (distribution.D / totalSkills) * 100;
  } else if (score < 80) {
    percentBelow = ((distribution.F + distribution.D) / totalSkills) * 100;
    percentBelow += ((score - 70) / 10) * (distribution.C / totalSkills) * 100;
  } else if (score < 90) {
    percentBelow = ((distribution.F + distribution.D + distribution.C) / totalSkills) * 100;
    percentBelow += ((score - 80) / 10) * (distribution.B / totalSkills) * 100;
  } else {
    percentBelow = ((distribution.F + distribution.D + distribution.C + distribution.B) / totalSkills) * 100;
    percentBelow += ((score - 90) / 10) * (distribution.A / totalSkills) * 100;
  }

  return Math.round(Math.min(99, Math.max(1, percentBelow)));
}

export function generateComparisonNotes(
  quality: QualityScore,
  categoryStats: CategoryStats
): string[] {
  const notes: string[] = [];
  const topScore = categoryStats.topScore;
  const avgScore = categoryStats.avgScore;

  if (quality.overall >= topScore) {
    notes.push('Your skill is among the top performers in this category');
  } else if (quality.overall >= avgScore) {
    notes.push(`Your skill is above the category average (${avgScore})`);
  } else {
    notes.push(`Your skill is ${avgScore - quality.overall} points below the category average`);
  }

  if (!quality.structure.hasExamples) {
    notes.push('Missing code examples (present in 95% of top skills)');
  }

  if (!quality.structure.hasTriggers) {
    notes.push('Missing trigger conditions (present in 80% of top skills)');
  }

  if (!quality.structure.hasBoundaries) {
    notes.push('Missing "When Not to Use" section (present in 80% of top skills)');
  }

  if (quality.specificity.vagueTermCount > 3) {
    notes.push('Trigger conditions are less specific than category average');
  }

  if (quality.clarity.lineCount > 300) {
    notes.push('Skill is longer than recommended (top skills average 150-250 lines)');
  }

  if (quality.advanced.deprecatedPatterns.length > 0) {
    notes.push('Contains deprecated patterns not found in top skills');
  }

  return notes;
}

export function generateRecommendations(
  quality: QualityScore,
  categoryStats: CategoryStats
): string[] {
  const recommendations: string[] = [];
  const gap = categoryStats.topScore - quality.overall;

  if (gap > 20) {
    recommendations.push('Consider studying top skills in this category for patterns');
  }

  if (!quality.structure.hasExamples) {
    recommendations.push(`Add ${quality.specificity.hasCodeExamples ? 'more' : ''} code examples showing input/output`);
  }

  if (!quality.structure.hasTriggers) {
    recommendations.push('Add explicit trigger conditions with patterns like "Triggers when:"');
  }

  if (!quality.structure.hasBoundaries) {
    recommendations.push('Add a "Boundaries" or "Limitations" section');
  }

  if (quality.clarity.lineCount > 400) {
    recommendations.push('Split into multiple focused skills (top skills are 150-250 lines)');
  }

  if (quality.specificity.vagueTermCount > 0) {
    recommendations.push(`Replace ${quality.specificity.vagueTermCount} vague term(s) with specific instructions`);
  }

  if (quality.advanced.completeness.hasTodos) {
    recommendations.push('Complete TODO items before publishing');
  }

  return recommendations;
}

export function benchmarkSkill(
  skillName: string,
  quality: QualityScore,
  tags: string[] = [],
  customCategoryStats?: CategoryStats
): BenchmarkResult {
  const category = detectCategory(skillName, tags);
  const categoryStats = customCategoryStats || CATEGORY_BENCHMARKS[category] || CATEGORY_BENCHMARKS.general;

  const percentile = calculatePercentile(quality.overall, categoryStats);
  const comparisonNotes = generateComparisonNotes(quality, categoryStats);
  const recommendations = generateRecommendations(quality, categoryStats);

  return {
    skill: skillName,
    score: quality.overall,
    grade: getGrade(quality.overall),
    categoryAvg: categoryStats.avgScore,
    topSkillScore: categoryStats.topScore,
    percentile,
    comparisonNotes,
    recommendations,
  };
}

export function getCategoryStats(category: string): CategoryStats | null {
  return CATEGORY_BENCHMARKS[category] || null;
}

export function getAllCategories(): string[] {
  return Object.keys(CATEGORY_BENCHMARKS);
}
