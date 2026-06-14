import type { TapEntry } from './helpers.js';

const GITHUB_REPO_PATTERN = /^([\w.-]+)\/([\w.-]+)$/;

export interface SkillRepoSource {
  owner: string;
  repo: string;
  description?: string;
}

export interface RecommendationSourcesResult {
  sources: SkillRepoSource[];
  warnings: string[];
}

export function buildRecommendationSources(
  builtInSources: readonly SkillRepoSource[],
  taps: readonly TapEntry[],
): RecommendationSourcesResult {
  const sources: SkillRepoSource[] = [];
  const warnings: string[] = [];
  const seen = new Set<string>();

  function addSource(source: SkillRepoSource): void {
    const key = `${source.owner.toLowerCase()}/${source.repo.toLowerCase()}`;
    if (seen.has(key)) return;
    seen.add(key);
    sources.push(source);
  }

  for (const source of builtInSources) {
    addSource(source);
  }

  for (const tap of taps) {
    const match = GITHUB_REPO_PATTERN.exec(tap.source);
    if (!match) {
      warnings.push(`Invalid tap source skipped: ${tap.source}`);
      continue;
    }

    addSource({
      owner: match[1],
      repo: match[2],
      description: tap.name,
    });
  }

  return { sources, warnings };
}
