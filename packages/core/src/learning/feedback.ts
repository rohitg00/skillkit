import type { LearnedPattern, EvolvingPattern, PatternStore, PatternDomain } from './types.js';
import { loadPatternStore, savePatternStore } from './config.js';

export interface FeedbackResult {
  pattern: EvolvingPattern;
  previousConfidence: number;
  newConfidence: number;
  change: 'increased' | 'decreased' | 'unchanged';
}

export function recordSuccess(
  patternId: string,
  storePath?: string
): FeedbackResult | null {
  const store = loadPatternStore(storePath);
  const evolving = findOrCreateEvolvingPattern(store, patternId);

  if (!evolving) return null;

  const previousConfidence = evolving.confidence;

  evolving.useCount++;
  evolving.successCount++;
  evolving.lastUsed = new Date().toISOString();
  evolving.confidence = Math.min(0.95, evolving.confidence + 0.05);

  updateEvolvingPattern(store, evolving);
  savePatternStore(store, storePath);

  return {
    pattern: evolving,
    previousConfidence,
    newConfidence: evolving.confidence,
    change: 'increased',
  };
}

export function recordFailure(
  patternId: string,
  storePath?: string
): FeedbackResult | null {
  const store = loadPatternStore(storePath);
  const evolving = findOrCreateEvolvingPattern(store, patternId);

  if (!evolving) return null;

  const previousConfidence = evolving.confidence;

  evolving.useCount++;
  evolving.failureCount++;
  evolving.lastUsed = new Date().toISOString();
  evolving.confidence = Math.max(0.1, evolving.confidence - 0.1);

  updateEvolvingPattern(store, evolving);
  savePatternStore(store, storePath);

  return {
    pattern: evolving,
    previousConfidence,
    newConfidence: evolving.confidence,
    change: 'decreased',
  };
}

function findOrCreateEvolvingPattern(
  store: PatternStore,
  patternId: string
): EvolvingPattern | null {
  let evolving = store.evolvingPatterns.find(p => p.id === patternId);

  if (!evolving) {
    const basePattern = store.patterns.find(p => p.id === patternId);
    if (!basePattern) return null;

    evolving = {
      ...basePattern,
      trigger: inferTrigger(basePattern),
      action: inferAction(basePattern),
      useCount: 0,
      successCount: 0,
      failureCount: 0,
    };

    store.evolvingPatterns.push(evolving);
  }

  return evolving;
}

function updateEvolvingPattern(
  store: PatternStore,
  evolving: EvolvingPattern
): void {
  const index = store.evolvingPatterns.findIndex(p => p.id === evolving.id);
  if (index >= 0) {
    store.evolvingPatterns[index] = evolving;
  } else {
    store.evolvingPatterns.push(evolving);
  }
}

function inferTrigger(pattern: LearnedPattern): string {
  const problem = pattern.problem.toLowerCase();

  if (problem.includes('error') || problem.includes('exception')) {
    return 'When encountering similar errors';
  }
  if (problem.includes('build') || problem.includes('compile')) {
    return 'During build/compilation issues';
  }
  if (problem.includes('test')) {
    return 'When tests fail in similar ways';
  }

  return `When facing: ${pattern.title}`;
}

function inferAction(pattern: LearnedPattern): string {
  return pattern.solution.split('\n')[0] || 'Apply learned solution';
}

export function getEvolvingPatternsByDomain(
  domain: PatternDomain,
  storePath?: string
): EvolvingPattern[] {
  const store = loadPatternStore(storePath);
  return store.evolvingPatterns.filter(p => p.domain === domain);
}

export function getHighConfidencePatterns(
  minConfidence = 0.7,
  storePath?: string
): EvolvingPattern[] {
  const store = loadPatternStore(storePath);
  return store.evolvingPatterns
    .filter(p => p.confidence >= minConfidence)
    .sort((a, b) => b.confidence - a.confidence);
}

export function getLowConfidencePatterns(
  maxConfidence = 0.3,
  storePath?: string
): EvolvingPattern[] {
  const store = loadPatternStore(storePath);
  return store.evolvingPatterns
    .filter(p => p.confidence <= maxConfidence)
    .sort((a, b) => a.confidence - b.confidence);
}

export function getMostUsedPatterns(
  limit = 10,
  storePath?: string
): EvolvingPattern[] {
  const store = loadPatternStore(storePath);
  return store.evolvingPatterns
    .sort((a, b) => b.useCount - a.useCount)
    .slice(0, limit);
}

export function getPatternStats(storePath?: string): {
  total: number;
  byDomain: Map<string, number>;
  byConfidenceRange: { high: number; medium: number; low: number };
  mostUsed: EvolvingPattern | null;
  leastConfident: EvolvingPattern | null;
} {
  const store = loadPatternStore(storePath);
  const patterns = store.evolvingPatterns;

  const byDomain = new Map<string, number>();
  let high = 0, medium = 0, low = 0;

  for (const pattern of patterns) {
    const domain = pattern.domain || 'unknown';
    byDomain.set(domain, (byDomain.get(domain) || 0) + 1);

    if (pattern.confidence >= 0.7) high++;
    else if (pattern.confidence >= 0.4) medium++;
    else low++;
  }

  const mostUsed = patterns.length > 0
    ? patterns.reduce((max, p) => p.useCount > max.useCount ? p : max)
    : null;

  const leastConfident = patterns.length > 0
    ? patterns.reduce((min, p) => p.confidence < min.confidence ? p : min)
    : null;

  return {
    total: patterns.length,
    byDomain,
    byConfidenceRange: { high, medium, low },
    mostUsed,
    leastConfident,
  };
}

export function approvePattern(
  patternId: string,
  storePath?: string
): LearnedPattern | null {
  const store = loadPatternStore(storePath);

  const pattern = store.patterns.find(p => p.id === patternId);
  if (!pattern) return null;

  pattern.approved = true;

  savePatternStore(store, storePath);
  return pattern;
}

export function rejectPattern(
  patternId: string,
  storePath?: string
): boolean {
  const store = loadPatternStore(storePath);

  const index = store.patterns.findIndex(p => p.id === patternId);
  if (index < 0) return false;

  store.patterns.splice(index, 1);

  const evolvingIndex = store.evolvingPatterns.findIndex(p => p.id === patternId);
  if (evolvingIndex >= 0) {
    store.evolvingPatterns.splice(evolvingIndex, 1);
  }

  savePatternStore(store, storePath);
  return true;
}

export function clusterPatterns(
  patterns: LearnedPattern[]
): Map<string, LearnedPattern[]> {
  const clusters = new Map<string, LearnedPattern[]>();

  for (const pattern of patterns) {
    const key = pattern.category;
    if (!clusters.has(key)) {
      clusters.set(key, []);
    }
    clusters.get(key)!.push(pattern);
  }

  return clusters;
}
