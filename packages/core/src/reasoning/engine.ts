import type { SkillSummary, ProjectProfile } from '../recommend/types.js';
import type { SkillTree, TreeNode } from '../tree/types.js';
import { TreeGenerator } from '../tree/generator.js';
import {
  type ReasoningConfig,
  type TreeSearchQuery,
  type TreeSearchResult,
  type TreeReasoningResult,
  type ExplainedRecommendation,
  type ExplainedMatch,
  type SearchPlan,
  type ReasoningCacheEntry,
  type ReasoningEngineStats,
  DEFAULT_REASONING_CONFIG,
} from './types.js';
import {
  buildSearchPlanPrompt,
  buildExplanationPrompt,
  extractJsonFromResponse,
  validateSearchPlan,
} from './prompts.js';
import { CATEGORY_TAXONOMY } from '../tree/types.js';

const CACHE_TTL_MS = 5 * 60 * 1000;
const MAX_CACHE_SIZE = 100;

export class ReasoningEngine {
  private config: ReasoningConfig;
  private skillMap: Map<string, SkillSummary> = new Map();
  private tree: SkillTree | null = null;
  private cache: Map<string, ReasoningCacheEntry> = new Map();
  private stats: ReasoningEngineStats = {
    totalQueries: 0,
    cacheHits: 0,
    cacheMisses: 0,
    averageProcessingTimeMs: 0,
    averageResultsPerQuery: 0,
  };

  constructor(config?: Partial<ReasoningConfig>) {
    this.config = { ...DEFAULT_REASONING_CONFIG, ...config };
  }

  loadSkills(skills: SkillSummary[]): void {
    this.skillMap.clear();
    for (const skill of skills) {
      this.skillMap.set(skill.name, skill);
    }
  }

  loadTree(tree: SkillTree): void {
    this.tree = tree;
  }

  generateTree(skills: SkillSummary[]): void {
    const generator = new TreeGenerator();
    this.tree = generator.generateTree(skills);
    this.loadSkills(skills);
  }

  async search(query: TreeSearchQuery): Promise<TreeReasoningResult> {
    const startTime = Date.now();
    this.stats.totalQueries++;

    const cacheKey = this.getCacheKey(query);
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      this.stats.cacheHits++;
      return {
        query: query.query,
        results: cached.results,
        exploredPaths: [],
        reasoning: 'Retrieved from cache',
        totalNodesVisited: 0,
        processingTimeMs: Date.now() - startTime,
      };
    }

    this.stats.cacheMisses++;

    const maxResults = query.maxResults ?? 10;
    const minConfidence = query.minConfidence ?? 30;

    const plan = await this.createSearchPlan(query);

    const results: TreeSearchResult[] = [];
    const exploredPaths: string[][] = [];
    let totalNodesVisited = 0;

    if (this.tree) {
      const traversalResult = await this.traverseTree(query, plan);
      results.push(...traversalResult.results);
      exploredPaths.push(...traversalResult.exploredPaths);
      totalNodesVisited = traversalResult.nodesVisited;
    } else {
      const fallbackResults = this.fallbackSearch(query);
      results.push(...fallbackResults);
    }

    const filteredResults = results
      .filter((r) => r.confidence >= minConfidence)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, maxResults);

    const processingTimeMs = Date.now() - startTime;

    this.updateStats(processingTimeMs, filteredResults.length);

    this.addToCache(cacheKey, filteredResults);

    return {
      query: query.query,
      results: filteredResults,
      exploredPaths,
      reasoning: this.buildReasoningSummary(plan, filteredResults),
      totalNodesVisited,
      processingTimeMs,
    };
  }

  async explain(
    skill: SkillSummary,
    score: number,
    profile: ProjectProfile
  ): Promise<ExplainedRecommendation> {
    const treePath = this.getSkillPath(skill.name);

    const explanation = await this.generateExplanation(skill, score, profile);

    return {
      skill,
      score,
      reasoning: explanation,
      treePath,
    };
  }

  async explainBatch(
    skills: Array<{ skill: SkillSummary; score: number }>,
    profile: ProjectProfile
  ): Promise<ExplainedRecommendation[]> {
    const results: ExplainedRecommendation[] = [];

    for (const { skill, score } of skills) {
      const explained = await this.explain(skill, score, profile);
      results.push(explained);
    }

    return results;
  }

  private async createSearchPlan(query: TreeSearchQuery): Promise<SearchPlan> {
    const categories = CATEGORY_TAXONOMY.map((c) => c.category);

    if (this.config.provider === 'mock') {
      return this.mockSearchPlan(query.query, query.context);
    }

    const prompt = buildSearchPlanPrompt(
      query.query,
      categories,
      query.context
    );

    const response = await this.callLLM(prompt);

    try {
      const data = extractJsonFromResponse(response);
      return validateSearchPlan(data);
    } catch {
      return this.mockSearchPlan(query.query, query.context);
    }
  }

  private mockSearchPlan(query: string, context?: ProjectProfile): SearchPlan {
    const queryLower = query.toLowerCase();
    const keywords = queryLower
      .split(/\s+/)
      .filter((w) => w.length > 2);

    const categoryScores: { category: string; score: number }[] = [];

    for (const mapping of CATEGORY_TAXONOMY) {
      let score = 0;

      for (const keyword of keywords) {
        if (mapping.category.toLowerCase().includes(keyword)) {
          score += 30;
        }

        for (const tag of mapping.tags) {
          if (tag.includes(keyword) || keyword.includes(tag)) {
            score += 20;
          }
        }

        for (const kw of mapping.keywords) {
          if (kw.includes(keyword) || keyword.includes(kw)) {
            score += 15;
          }
        }
      }

      if (context) {
        for (const framework of context.stack.frameworks) {
          if (mapping.tags.includes(framework.name.toLowerCase())) {
            score += 10;
          }
        }

        for (const language of context.stack.languages) {
          if (mapping.tags.includes(language.name.toLowerCase())) {
            score += 5;
          }
        }
      }

      if (score > 0) {
        categoryScores.push({ category: mapping.category, score });
      }
    }

    categoryScores.sort((a, b) => b.score - a.score);

    const primaryCategories = categoryScores
      .slice(0, 3)
      .map((c) => c.category);
    const secondaryCategories = categoryScores
      .slice(3, 6)
      .map((c) => c.category);

    const filters: SearchPlan['filters'] = {
      tags: keywords.filter((k) =>
        CATEGORY_TAXONOMY.some((m) => m.tags.includes(k))
      ),
      frameworks: context?.stack.frameworks.map((f) => f.name) || [],
      languages: context?.stack.languages.map((l) => l.name) || [],
    };

    return {
      primaryCategories: primaryCategories.length > 0 ? primaryCategories : ['Development'],
      secondaryCategories,
      keywords,
      filters,
      strategy: keywords.length <= 2 ? 'breadth-first' : 'targeted',
    };
  }

  private async traverseTree(
    query: TreeSearchQuery,
    plan: SearchPlan
  ): Promise<{
    results: TreeSearchResult[];
    exploredPaths: string[][];
    nodesVisited: number;
  }> {
    if (!this.tree) {
      return { results: [], exploredPaths: [], nodesVisited: 0 };
    }

    const results: TreeSearchResult[] = [];
    const exploredPaths: string[][] = [];
    let nodesVisited = 0;

    const relevantNodes = this.findRelevantNodes(plan);

    for (const { node, path } of relevantNodes) {
      nodesVisited++;
      exploredPaths.push(path);

      for (const skillName of node.skills) {
        const skill = this.skillMap.get(skillName);
        if (!skill) continue;

        const matchResult = this.evaluateSkillMatch(query.query, skill, query.context);

        if (matchResult.confidence >= (query.minConfidence ?? 30)) {
          results.push({
            skill,
            path,
            reasoning: matchResult.reasoning,
            confidence: matchResult.confidence,
            relevantSections: matchResult.relevantSections,
            matchedKeywords: matchResult.matchedKeywords,
          });
        }
      }
    }

    return { results, exploredPaths, nodesVisited };
  }

  private findRelevantNodes(
    plan: SearchPlan
  ): Array<{ node: TreeNode; path: string[] }> {
    if (!this.tree) return [];

    const relevant: Array<{ node: TreeNode; path: string[]; priority: number }> = [];

    const traverse = (node: TreeNode, path: string[], priorityBoost: number) => {
      const nodeName = node.name.toLowerCase();

      let priority = priorityBoost;

      if (plan.primaryCategories.some((c) => c.toLowerCase() === nodeName)) {
        priority += 100;
      }

      if (plan.secondaryCategories.some((c) => c.toLowerCase() === nodeName)) {
        priority += 50;
      }

      for (const keyword of plan.keywords) {
        if (nodeName.includes(keyword) || keyword.includes(nodeName)) {
          priority += 25;
        }
      }

      if (priority > 0 || node.depth === 0) {
        relevant.push({ node, path: [...path, node.name], priority });
      }

      for (const child of node.children) {
        traverse(child, [...path, node.name], priority > 0 ? priority * 0.5 : 0);
      }
    };

    traverse(this.tree.rootNode, [], 0);

    relevant.sort((a, b) => b.priority - a.priority);

    return relevant.slice(0, 20).map(({ node, path }) => ({ node, path }));
  }

  private evaluateSkillMatch(
    query: string,
    skill: SkillSummary,
    context?: ProjectProfile
  ): {
    confidence: number;
    reasoning: string;
    relevantSections: string[];
    matchedKeywords: string[];
  } {
    const queryTerms = query.toLowerCase().split(/\s+/);
    const matchedKeywords: string[] = [];
    let confidence = 0;

    const nameLower = skill.name.toLowerCase();
    for (const term of queryTerms) {
      if (nameLower.includes(term)) {
        confidence += 30;
        matchedKeywords.push(term);
      }
    }

    const descLower = (skill.description || '').toLowerCase();
    for (const term of queryTerms) {
      if (descLower.includes(term) && !matchedKeywords.includes(term)) {
        confidence += 20;
        matchedKeywords.push(term);
      }
    }

    const tagsLower = (skill.tags || []).map((t) => t.toLowerCase());
    for (const term of queryTerms) {
      if (tagsLower.some((t) => t.includes(term) || term.includes(t))) {
        if (!matchedKeywords.includes(term)) {
          confidence += 25;
          matchedKeywords.push(term);
        }
      }
    }

    if (context) {
      for (const framework of context.stack.frameworks) {
        const fwLower = framework.name.toLowerCase();
        if (tagsLower.includes(fwLower) || nameLower.includes(fwLower)) {
          confidence += 15;
        }
      }

      for (const language of context.stack.languages) {
        const langLower = language.name.toLowerCase();
        if (tagsLower.includes(langLower) || nameLower.includes(langLower)) {
          confidence += 10;
        }
      }
    }

    confidence = Math.min(100, confidence);

    const relevantSections: string[] = [];
    if (matchedKeywords.length > 0) {
      relevantSections.push('description', 'tags');
    }

    const reasoning = matchedKeywords.length > 0
      ? `Matches keywords: ${matchedKeywords.join(', ')}`
      : 'No direct keyword match';

    return {
      confidence,
      reasoning,
      relevantSections,
      matchedKeywords,
    };
  }

  private fallbackSearch(query: TreeSearchQuery): TreeSearchResult[] {
    const results: TreeSearchResult[] = [];

    for (const skill of this.skillMap.values()) {
      const matchResult = this.evaluateSkillMatch(
        query.query,
        skill,
        query.context
      );

      if (matchResult.confidence >= (query.minConfidence ?? 30)) {
        results.push({
          skill,
          path: ['Uncategorized'],
          reasoning: matchResult.reasoning,
          confidence: matchResult.confidence,
          relevantSections: matchResult.relevantSections,
          matchedKeywords: matchResult.matchedKeywords,
        });
      }
    }

    return results;
  }

  private async generateExplanation(
    skill: SkillSummary,
    score: number,
    profile: ProjectProfile
  ): Promise<ExplainedMatch> {
    if (this.config.provider === 'mock') {
      return this.mockExplanation(skill, score, profile);
    }

    const prompt = buildExplanationPrompt(skill, score, profile);

    try {
      const response = await this.callLLM(prompt);
      const data = extractJsonFromResponse(response) as Partial<ExplainedMatch>;

      return {
        matchedBecause: data.matchedBecause || [],
        relevantFor: data.relevantFor || [],
        differentFrom: data.differentFrom || [],
        confidence: data.confidence || this.scoreToConfidence(score),
      };
    } catch {
      return this.mockExplanation(skill, score, profile);
    }
  }

  private mockExplanation(
    skill: SkillSummary,
    score: number,
    profile: ProjectProfile
  ): ExplainedMatch {
    const matchedBecause: string[] = [];
    const relevantFor: string[] = [];
    const differentFrom: string[] = [];

    const skillTags = skill.tags || [];

    for (const framework of profile.stack.frameworks) {
      const fwLower = framework.name.toLowerCase();
      if (
        skillTags.some((t) => t.toLowerCase().includes(fwLower)) ||
        skill.name.toLowerCase().includes(fwLower)
      ) {
        matchedBecause.push(`Uses ${framework.name}`);
      }
    }

    for (const language of profile.stack.languages) {
      const langLower = language.name.toLowerCase();
      if (skillTags.some((t) => t.toLowerCase().includes(langLower))) {
        matchedBecause.push(`Supports ${language.name}`);
      }
    }

    if (matchedBecause.length === 0) {
      matchedBecause.push(`Related tags: ${skillTags.slice(0, 3).join(', ')}`);
    }

    relevantFor.push(`Your ${profile.type || 'project'} project`);
    if (profile.name) {
      relevantFor.push(`Specifically for ${profile.name}`);
    }

    differentFrom.push('General-purpose alternatives');

    return {
      matchedBecause,
      relevantFor,
      differentFrom,
      confidence: this.scoreToConfidence(score),
    };
  }

  private scoreToConfidence(score: number): 'high' | 'medium' | 'low' {
    if (score >= 70) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
  }

  private getSkillPath(skillName: string): string[] {
    if (!this.tree) return ['Uncategorized'];

    const generator = new TreeGenerator();
    const path = generator.getPath(this.tree, skillName);
    return path || ['Uncategorized'];
  }

  private buildReasoningSummary(
    plan: SearchPlan,
    results: TreeSearchResult[]
  ): string {
    const parts: string[] = [];

    parts.push(`Search strategy: ${plan.strategy}`);
    parts.push(`Primary categories: ${plan.primaryCategories.join(', ')}`);

    if (plan.keywords.length > 0) {
      parts.push(`Keywords extracted: ${plan.keywords.join(', ')}`);
    }

    parts.push(`Found ${results.length} matching skills`);

    if (results.length > 0) {
      const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
      parts.push(`Average confidence: ${Math.round(avgConfidence)}%`);
    }

    return parts.join('. ');
  }

  private async callLLM(prompt: string): Promise<string> {
    return `Mock response for: ${prompt.slice(0, 50)}...`;
  }

  private getCacheKey(query: TreeSearchQuery): string {
    return JSON.stringify({
      query: query.query,
      contextName: query.context?.name,
      maxResults: query.maxResults,
      minConfidence: query.minConfidence,
    });
  }

  private getFromCache(key: string): ReasoningCacheEntry | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry;
  }

  private addToCache(key: string, results: TreeSearchResult[]): void {
    if (this.cache.size >= MAX_CACHE_SIZE) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      query: key,
      results,
      timestamp: Date.now(),
      ttl: CACHE_TTL_MS,
    });
  }

  private updateStats(processingTimeMs: number, resultCount: number): void {
    const totalQueries = this.stats.totalQueries;

    this.stats.averageProcessingTimeMs =
      (this.stats.averageProcessingTimeMs * (totalQueries - 1) + processingTimeMs) / totalQueries;

    this.stats.averageResultsPerQuery =
      (this.stats.averageResultsPerQuery * (totalQueries - 1) + resultCount) / totalQueries;
  }

  getStats(): ReasoningEngineStats {
    return { ...this.stats };
  }

  clearCache(): void {
    this.cache.clear();
  }

  getTree(): SkillTree | null {
    return this.tree;
  }
}

export function createReasoningEngine(
  config?: Partial<ReasoningConfig>
): ReasoningEngine {
  return new ReasoningEngine(config);
}
