import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';
import type {
  TierEvaluator,
  EvalOptions,
  BenchmarkTierResult,
  BenchmarkComparison,
} from '../types.js';
import { scoreToGrade } from '../types.js';
import { evaluateSkillContent } from '../../quality/index.js';

interface CategoryStats {
  scores: number[];
  mean: number;
  median: number;
  p90: number;
}

interface CachedStats {
  timestamp: string;
  categories: Record<string, CategoryStats>;
}

interface MarketplaceSkill {
  id: string;
  name: string;
  description?: string;
  source?: string;
  tags?: string[];
  type?: string;
}

interface MarketplaceData {
  skills: MarketplaceSkill[];
}

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_SAMPLE_SIZE = 200;
const BENCHMARK_CATEGORIES = ['overall', 'structure', 'clarity', 'specificity'] as const;

const FALLBACK_STATS: Record<string, CategoryStats> = {
  overall: { scores: [], mean: 45, median: 42, p90: 72 },
  structure: { scores: [], mean: 38, median: 35, p90: 68 },
  clarity: { scores: [], mean: 62, median: 60, p90: 85 },
  specificity: { scores: [], mean: 35, median: 30, p90: 65 },
};

function computeMedian(sorted: number[]): number {
  if (sorted.length === 0) return 0;
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

function computeP90(sorted: number[]): number {
  if (sorted.length === 0) return 0;
  const idx = Math.floor(sorted.length * 0.9);
  return sorted[Math.min(idx, sorted.length - 1)];
}

function computePercentile(sorted: number[], value: number): number {
  if (sorted.length === 0) return 50;
  let below = 0;
  for (const s of sorted) {
    if (s < value) below++;
  }
  return Math.round((below / sorted.length) * 100);
}

function getCachePath(): string {
  return join(homedir(), '.skillkit', 'cache', 'benchmark-stats.json');
}

function loadCache(): CachedStats | null {
  const cachePath = getCachePath();
  try {
    if (!existsSync(cachePath)) return null;
    const raw = readFileSync(cachePath, 'utf-8');
    const cached: CachedStats = JSON.parse(raw);
    const ts = new Date(cached.timestamp).getTime();
    if (!Number.isFinite(ts)) return null;
    const age = Date.now() - ts;
    if (age > CACHE_TTL_MS) return null;
    return cached;
  } catch {
    return null;
  }
}

function saveCache(stats: CachedStats): void {
  const cachePath = getCachePath();
  try {
    const dir = dirname(cachePath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(cachePath, JSON.stringify(stats, null, 2), 'utf-8');
  } catch {
    // cache write failure is non-fatal
  }
}

function findMarketplacePath(): string | null {
  try {
    const thisDir = dirname(fileURLToPath(import.meta.url));
    let current = thisDir;
    for (let i = 0; i < 10; i++) {
      const candidate = join(current, 'marketplace', 'skills.json');
      if (existsSync(candidate)) return candidate;
      const parent = dirname(current);
      if (parent === current) break;
      current = parent;
    }
  } catch {
    // fallback
  }
  return null;
}

function sampleSkills(skills: MarketplaceSkill[]): MarketplaceSkill[] {
  if (skills.length <= MAX_SAMPLE_SIZE) return skills;
  const shuffled = [...skills];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, MAX_SAMPLE_SIZE);
}

const BATCH_SIZE = 50;

async function buildStatsFromMarketplace(marketplacePath: string): Promise<CachedStats | null> {
  try {
    const raw = readFileSync(marketplacePath, 'utf-8');
    const data: MarketplaceData = JSON.parse(raw);
    if (!Array.isArray(data.skills) || data.skills.length === 0) return null;

    const sampled = sampleSkills(data.skills);
    const categories: Record<string, number[]> = {
      overall: [],
      structure: [],
      clarity: [],
      specificity: [],
    };

    for (let i = 0; i < sampled.length; i++) {
      const skill = sampled[i];
      const content = skill.description || skill.name || '';
      if (content.length < 5) continue;
      try {
        const quality = evaluateSkillContent(content);
        categories.overall.push(quality.overall);
        categories.structure.push(quality.structure.score);
        categories.clarity.push(quality.clarity.score);
        categories.specificity.push(quality.specificity.score);
      } catch {
        continue;
      }
      if ((i + 1) % BATCH_SIZE === 0) {
        await new Promise<void>((resolve) => setTimeout(resolve, 0));
      }
    }

    const result: CachedStats = {
      timestamp: new Date().toISOString(),
      categories: {},
    };

    for (const cat of BENCHMARK_CATEGORIES) {
      const scores = categories[cat].sort((a, b) => a - b);
      if (scores.length === 0) continue;
      const mean = Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);
      result.categories[cat] = {
        scores,
        mean,
        median: computeMedian(scores),
        p90: computeP90(scores),
      };
    }

    return Object.keys(result.categories).length > 0 ? result : null;
  } catch {
    return null;
  }
}

export class DynamicBenchmarkEvaluator implements TierEvaluator {
  readonly tier = 5 as const;
  readonly name = 'Dynamic Benchmark';

  async evaluate(
    content: string,
    _skillPath: string,
    _options: EvalOptions,
  ): Promise<BenchmarkTierResult> {
    const start = performance.now();

    const quality = evaluateSkillContent(content);
    const skillScores: Record<string, number> = {
      overall: quality.overall,
      structure: quality.structure.score,
      clarity: quality.clarity.score,
      specificity: quality.specificity.score,
    };

    let stats = loadCache();
    let cacheUsed = true;

    if (!stats) {
      cacheUsed = false;
      const marketplacePath = findMarketplacePath();
      if (marketplacePath) {
        stats = await buildStatsFromMarketplace(marketplacePath);
        if (stats) {
          saveCache(stats);
        }
      }
    }

    const useFallback = !stats || Object.keys(stats.categories).length === 0;
    const effectiveStats = useFallback ? FALLBACK_STATS : stats!.categories;

    const comparisons: BenchmarkComparison[] = [];

    for (const category of BENCHMARK_CATEGORIES) {
      const catStats = effectiveStats[category];
      if (!catStats) continue;

      const skillScore = skillScores[category] ?? 0;
      const sorted = catStats.scores.length > 0 ? catStats.scores : [];
      const percentile = sorted.length > 0
        ? computePercentile(sorted, skillScore)
        : estimatePercentile(catStats, skillScore);

      comparisons.push({
        category,
        percentile,
        sampleSize: sorted.length,
        mean: catStats.mean,
        median: catStats.median,
        p90: catStats.p90,
        skillScore,
      });
    }

    const overallPercentile = comparisons.length > 0
      ? Math.round(comparisons.reduce((s, c) => s + c.percentile, 0) / comparisons.length)
      : 50;

    const score = Math.round(overallPercentile);
    const duration = Math.round(performance.now() - start);

    return {
      tier: 5,
      name: this.name,
      score,
      grade: scoreToGrade(score),
      duration,
      details: {
        comparisons,
        overallPercentile,
        cacheUsed,
      },
    };
  }
}

function estimatePercentile(stats: CategoryStats, value: number): number {
  if (value >= stats.p90) return Math.min(100, 90 + Math.min(10, Math.round((value - stats.p90) / 2)));
  if (value >= stats.median) {
    const range = stats.p90 - stats.median;
    if (range === 0) return 70;
    return Math.min(100, 50 + Math.round(((value - stats.median) / range) * 40));
  }
  if (stats.median === 0) return 50;
  return Math.max(0, Math.min(100, Math.round((value / stats.median) * 50)));
}
