/**
 * Recommendation Engine Module
 *
 * Provides smart skill recommendations based on project analysis.
 *
 * Features:
 * - Project-aware skill matching
 * - Framework/language/library detection
 * - Task-based search
 * - Freshness checking
 * - Skill index fetching from GitHub repos
 */

export * from './types.js';
export * from './engine.js';
export * from './fetcher.js';
export { createRecommendationEngine, RecommendationEngine } from './engine.js';
export {
  fetchSkillsFromRepo,
  buildSkillIndex,
  saveIndex,
  loadIndex,
  isIndexStale,
  getIndexStatus,
  KNOWN_SKILL_REPOS,
  INDEX_PATH,
} from './fetcher.js';
