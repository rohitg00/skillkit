import type { RRFRanking } from './types.js';
import { DEFAULT_HYBRID_CONFIG } from './types.js';

export interface RankerResult {
  skillName: string;
  score: number;
}

export interface RRFInput {
  source: string;
  results: RankerResult[];
}

export function computeRRFScore(ranks: number[], k: number = DEFAULT_HYBRID_CONFIG.rrfK): number {
  return ranks.reduce((sum, rank) => sum + 1 / (k + rank), 0);
}

export function fuseWithRRF(
  rankerInputs: RRFInput[],
  k: number = DEFAULT_HYBRID_CONFIG.rrfK
): RRFRanking[] {
  const skillRanks = new Map<string, { source: string; rank: number }[]>();

  for (const input of rankerInputs) {
    const sortedResults = [...input.results].sort((a, b) => b.score - a.score);

    for (let i = 0; i < sortedResults.length; i++) {
      const result = sortedResults[i];
      const rank = i + 1;

      if (!skillRanks.has(result.skillName)) {
        skillRanks.set(result.skillName, []);
      }
      skillRanks.get(result.skillName)!.push({
        source: input.source,
        rank,
      });
    }
  }

  const rankings: RRFRanking[] = [];

  for (const [skillName, ranks] of skillRanks) {
    const rankValues = ranks.map((r) => r.rank);
    const rrfScore = computeRRFScore(rankValues, k);

    rankings.push({
      skillName,
      rrfScore,
      ranks,
    });
  }

  rankings.sort((a, b) => b.rrfScore - a.rrfScore);

  return rankings;
}

export function normalizeScores(results: RankerResult[]): RankerResult[] {
  if (results.length === 0) return [];

  const maxScore = Math.max(...results.map((r) => r.score));
  const minScore = Math.min(...results.map((r) => r.score));
  const range = maxScore - minScore;

  if (range === 0) {
    return results.map((r) => ({ ...r, score: 1 }));
  }

  return results.map((r) => ({
    ...r,
    score: (r.score - minScore) / range,
  }));
}

export function weightedCombine(
  results: RRFInput[],
  weights: Record<string, number>
): RankerResult[] {
  const combinedScores = new Map<string, number>();

  for (const input of results) {
    const weight = weights[input.source] ?? 1;
    const normalizedResults = normalizeScores(input.results);

    for (const result of normalizedResults) {
      const current = combinedScores.get(result.skillName) ?? 0;
      combinedScores.set(result.skillName, current + result.score * weight);
    }
  }

  return Array.from(combinedScores, ([skillName, score]) => ({ skillName, score }))
    .sort((a, b) => b.score - a.score);
}

export function applyPositionAwareBlending(
  retrievalScores: Map<string, number>,
  rerankerScores: Map<string, number>,
  sortedSkillNames: string[],
  config = DEFAULT_HYBRID_CONFIG.positionBlending
): Map<string, number> {
  const blendedScores = new Map<string, number>();

  for (let i = 0; i < sortedSkillNames.length; i++) {
    const skillName = sortedSkillNames[i];
    const rank = i + 1;

    let weights: { retrieval: number; reranker: number };
    if (rank <= 3) {
      weights = config.top3;
    } else if (rank <= 10) {
      weights = config.top10;
    } else {
      weights = config.rest;
    }

    const retrievalScore = retrievalScores.get(skillName) ?? 0;
    const rerankerScore = rerankerScores.get(skillName) ?? 0;

    const blendedScore =
      retrievalScore * weights.retrieval + rerankerScore * weights.reranker;

    blendedScores.set(skillName, blendedScore);
  }

  return blendedScores;
}

export function getRankFromScore(
  skillName: string,
  rankedResults: RankerResult[]
): number {
  const sortedResults = [...rankedResults].sort((a, b) => b.score - a.score);
  const index = sortedResults.findIndex((r) => r.skillName === skillName);
  return index === -1 ? sortedResults.length + 1 : index + 1;
}

export function mergeRankings(
  primaryRankings: RRFRanking[],
  secondaryRankings: RRFRanking[],
  primaryWeight: number = 0.7
): RRFRanking[] {
  const secondaryWeight = 1 - primaryWeight;
  const mergedScores = new Map<string, { score: number; ranks: { source: string; rank: number }[] }>();

  for (const ranking of primaryRankings) {
    mergedScores.set(ranking.skillName, {
      score: ranking.rrfScore * primaryWeight,
      ranks: ranking.ranks,
    });
  }

  for (const ranking of secondaryRankings) {
    const existing = mergedScores.get(ranking.skillName);
    if (existing) {
      existing.score += ranking.rrfScore * secondaryWeight;
      existing.ranks.push(...ranking.ranks);
    } else {
      mergedScores.set(ranking.skillName, {
        score: ranking.rrfScore * secondaryWeight,
        ranks: ranking.ranks,
      });
    }
  }

  const merged: RRFRanking[] = [];
  for (const [skillName, data] of mergedScores) {
    merged.push({
      skillName,
      rrfScore: data.score,
      ranks: data.ranks,
    });
  }

  merged.sort((a, b) => b.rrfScore - a.rrfScore);
  return merged;
}
