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
 */

export * from './types.js';
export * from './engine.js';
export { createRecommendationEngine, RecommendationEngine } from './engine.js';
