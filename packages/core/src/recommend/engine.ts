import type { ProjectStack } from '../context/types.js';
import type {
  SkillSummary,
  ScoredSkill,
  MatchReason,
  ScoringWeights,
  ProjectProfile,
  SkillIndex,
  RecommendOptions,
  RecommendationResult,
  SearchOptions,
  SearchResult,
  FreshnessResult,
} from './types.js';
import { DEFAULT_SCORING_WEIGHTS, TAG_TO_TECH, getTechTags } from './types.js';

/**
 * Recommendation engine for matching skills to project profiles
 */
export class RecommendationEngine {
  private weights: ScoringWeights;
  private index: SkillIndex | null = null;

  constructor(weights?: Partial<ScoringWeights>) {
    this.weights = { ...DEFAULT_SCORING_WEIGHTS, ...weights };
  }

  /**
   * Load skill index from cache or generate from local skills
   */
  loadIndex(index: SkillIndex): void {
    this.index = index;
  }

  /**
   * Get loaded index
   */
  getIndex(): SkillIndex | null {
    return this.index;
  }

  /**
   * Score a single skill against a project profile
   */
  scoreSkill(profile: ProjectProfile, skill: SkillSummary): ScoredSkill {
    const reasons: MatchReason[] = [];
    const warnings: string[] = [];
    let totalScore = 0;

    // Framework matching (40 points max)
    const frameworkMatch = this.matchFrameworks(profile.stack, skill);
    reasons.push(frameworkMatch);
    totalScore += frameworkMatch.weight;

    // Language matching (20 points max)
    const languageMatch = this.matchLanguages(profile.stack, skill);
    reasons.push(languageMatch);
    totalScore += languageMatch.weight;

    // Library matching (15 points max)
    const libraryMatch = this.matchLibraries(profile.stack, skill);
    reasons.push(libraryMatch);
    totalScore += libraryMatch.weight;

    // Tag relevance (10 points max)
    const tagMatch = this.matchTags(profile, skill);
    reasons.push(tagMatch);
    totalScore += tagMatch.weight;

    // Popularity bonus (5 points max)
    const popularityScore = this.scorePopularity(skill);
    reasons.push(popularityScore);
    totalScore += popularityScore.weight;

    // Quality bonus (5 points max)
    const qualityScore = this.scoreQuality(skill);
    reasons.push(qualityScore);
    totalScore += qualityScore.weight;

    // Freshness bonus (5 points max)
    const freshnessScore = this.scoreFreshness(skill);
    reasons.push(freshnessScore);
    totalScore += freshnessScore.weight;

    // Add warnings for potential issues
    if (skill.compatibility?.minVersion) {
      for (const [tech, minVer] of Object.entries(skill.compatibility.minVersion)) {
        const detected = this.findDetectedVersion(profile.stack, tech);
        if (detected && this.isVersionLower(detected, minVer)) {
          warnings.push(`Requires ${tech} ${minVer}+, you have ${detected}`);
        }
      }
    }

    // Check if skill is already installed
    if (profile.installedSkills.includes(skill.name)) {
      warnings.push('Already installed');
    }

    return {
      skill,
      score: Math.min(100, Math.round(totalScore)),
      reasons,
      warnings,
    };
  }

  /**
   * Match frameworks in project stack against skill
   */
  private matchFrameworks(stack: ProjectStack, skill: SkillSummary): MatchReason {
    const matched: string[] = [];
    const skillFrameworks = skill.compatibility?.frameworks || [];
    const skillTags = skill.tags || [];

    for (const detection of stack.frameworks) {
      const techName = detection.name.toLowerCase();

      // Direct framework match
      if (skillFrameworks.some((f) => f.toLowerCase() === techName)) {
        matched.push(detection.name);
        continue;
      }

      // Tag-based match
      const relatedTags = getTechTags(techName);
      for (const tag of skillTags) {
        if (relatedTags.includes(tag.toLowerCase()) || tag.toLowerCase() === techName) {
          matched.push(detection.name);
          break;
        }
      }

      // Check if skill tags match framework-related tags
      for (const [tagName, techs] of Object.entries(TAG_TO_TECH)) {
        if (techs.includes(techName) && skillTags.includes(tagName)) {
          if (!matched.includes(detection.name)) {
            matched.push(detection.name);
          }
        }
      }
    }

    const ratio = matched.length / Math.max(stack.frameworks.length, 1);
    const weight = Math.round(this.weights.framework * ratio);

    return {
      category: 'framework',
      description:
        matched.length > 0
          ? `Matches frameworks: ${matched.join(', ')}`
          : 'No framework match',
      weight,
      matched,
    };
  }

  /**
   * Match languages in project stack against skill
   */
  private matchLanguages(stack: ProjectStack, skill: SkillSummary): MatchReason {
    const matched: string[] = [];
    const skillLanguages = skill.compatibility?.languages || [];
    const skillTags = skill.tags || [];

    for (const detection of stack.languages) {
      const langName = detection.name.toLowerCase();

      // Direct language match
      if (skillLanguages.some((l) => l.toLowerCase() === langName)) {
        matched.push(detection.name);
        continue;
      }

      // Tag-based match
      if (skillTags.some((t) => t.toLowerCase() === langName)) {
        matched.push(detection.name);
      }
    }

    const ratio = matched.length / Math.max(stack.languages.length, 1);
    const weight = Math.round(this.weights.language * ratio);

    return {
      category: 'language',
      description:
        matched.length > 0 ? `Matches languages: ${matched.join(', ')}` : 'No language match',
      weight,
      matched,
    };
  }

  /**
   * Match libraries in project stack against skill
   */
  private matchLibraries(stack: ProjectStack, skill: SkillSummary): MatchReason {
    const matched: string[] = [];
    const skillLibraries = skill.compatibility?.libraries || [];
    const skillTags = skill.tags || [];

    const allLibraries = [...stack.libraries, ...stack.styling, ...stack.testing, ...stack.databases];

    for (const detection of allLibraries) {
      const libName = detection.name.toLowerCase();

      // Direct library match
      if (skillLibraries.some((l) => l.toLowerCase() === libName)) {
        matched.push(detection.name);
        continue;
      }

      // Tag-based match
      const relatedTags = getTechTags(libName);
      for (const tag of skillTags) {
        if (relatedTags.includes(tag.toLowerCase()) || tag.toLowerCase() === libName) {
          matched.push(detection.name);
          break;
        }
      }
    }

    const ratio = matched.length / Math.max(allLibraries.length, 1);
    const weight = Math.round(this.weights.library * ratio);

    return {
      category: 'library',
      description:
        matched.length > 0 ? `Matches libraries: ${matched.join(', ')}` : 'No library match',
      weight,
      matched,
    };
  }

  /**
   * Match tags based on project patterns and type
   */
  private matchTags(profile: ProjectProfile, skill: SkillSummary): MatchReason {
    const matched: string[] = [];
    const skillTags = skill.tags || [];

    // Extract relevant tags from project
    const projectTags = this.extractProjectTags(profile);

    for (const tag of skillTags) {
      if (projectTags.includes(tag.toLowerCase())) {
        matched.push(tag);
      }
    }

    const ratio = matched.length / Math.max(skillTags.length, 1);
    const weight = Math.round(this.weights.tag * ratio);

    return {
      category: 'tag',
      description: matched.length > 0 ? `Matches tags: ${matched.join(', ')}` : 'No tag match',
      weight,
      matched,
    };
  }

  /**
   * Extract relevant tags from project profile
   */
  private extractProjectTags(profile: ProjectProfile): string[] {
    const tags: string[] = [];

    // Add project type as tag
    if (profile.type) {
      tags.push(profile.type.toLowerCase());
    }

    // Add patterns as tags
    if (profile.patterns) {
      if (profile.patterns.components) tags.push(profile.patterns.components);
      if (profile.patterns.stateManagement) tags.push(profile.patterns.stateManagement);
      if (profile.patterns.apiStyle) tags.push(profile.patterns.apiStyle);
      if (profile.patterns.styling) tags.push(profile.patterns.styling);
      if (profile.patterns.testing) tags.push(profile.patterns.testing);
    }

    // Derive tags from stack
    const allDetections = [
      ...profile.stack.frameworks,
      ...profile.stack.languages,
      ...profile.stack.libraries,
      ...profile.stack.styling,
      ...profile.stack.testing,
      ...profile.stack.databases,
      ...profile.stack.tools,
    ];

    for (const detection of allDetections) {
      tags.push(detection.name.toLowerCase());
      // Add related tags
      const related = getTechTags(detection.name.toLowerCase());
      tags.push(...related);
    }

    return [...new Set(tags)];
  }

  /**
   * Score based on popularity (downloads/stars)
   */
  private scorePopularity(skill: SkillSummary): MatchReason {
    // Normalize popularity to 0-5 range
    // Assume 1000+ is high popularity
    const popularity = skill.popularity ?? 0;
    const normalized = Math.min(popularity / 1000, 1);
    const weight = Math.round(this.weights.popularity * normalized);

    return {
      category: 'popularity',
      description:
        popularity > 0 ? `${popularity} downloads/stars` : 'No popularity data',
      weight,
      matched: popularity > 0 ? [popularity.toString()] : [],
    };
  }

  /**
   * Score based on quality metrics
   */
  private scoreQuality(skill: SkillSummary): MatchReason {
    const quality = skill.quality ?? 50; // Default to 50 if not specified
    const normalized = quality / 100;
    const weight = Math.round(this.weights.quality * normalized);

    return {
      category: 'quality',
      description: `Quality score: ${skill.quality}/100`,
      weight,
      matched: skill.verified ? ['verified'] : [],
    };
  }

  /**
   * Score based on freshness (last update)
   */
  private scoreFreshness(skill: SkillSummary): MatchReason {
    if (!skill.lastUpdated) {
      return {
        category: 'freshness',
        description: 'No update date available',
        weight: 0,
        matched: [],
      };
    }

    const lastUpdate = new Date(skill.lastUpdated);
    const now = new Date();
    const daysSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);

    // Full points if updated within 30 days, decreasing linearly to 0 at 365 days
    let normalized = Math.max(0, 1 - daysSinceUpdate / 365);
    if (daysSinceUpdate <= 30) normalized = 1;

    const weight = Math.round(this.weights.freshness * normalized);

    return {
      category: 'freshness',
      description:
        daysSinceUpdate <= 30
          ? 'Recently updated'
          : `Updated ${Math.round(daysSinceUpdate)} days ago`,
      weight,
      matched: [skill.lastUpdated],
    };
  }

  /**
   * Find detected version for a technology
   */
  private findDetectedVersion(stack: ProjectStack, tech: string): string | null {
    const techLower = tech.toLowerCase();
    const allDetections = [
      ...stack.frameworks,
      ...stack.languages,
      ...stack.libraries,
      ...stack.styling,
      ...stack.testing,
      ...stack.databases,
      ...stack.tools,
      ...stack.runtime,
    ];

    const found = allDetections.find((d) => d.name.toLowerCase() === techLower);
    return found?.version || null;
  }

  /**
   * Compare semantic versions (basic implementation)
   */
  private isVersionLower(current: string, required: string): boolean {
    const parseVersion = (v: string): number[] =>
      v
        .replace(/[^0-9.]/g, '')
        .split('.')
        .map(Number);

    const currentParts = parseVersion(current);
    const requiredParts = parseVersion(required);

    for (let i = 0; i < Math.max(currentParts.length, requiredParts.length); i++) {
      const c = currentParts[i] || 0;
      const r = requiredParts[i] || 0;
      if (c < r) return true;
      if (c > r) return false;
    }

    return false;
  }

  /**
   * Get top recommendations for a project profile
   */
  recommend(profile: ProjectProfile, options: RecommendOptions = {}): RecommendationResult {
    const {
      limit = 10,
      minScore = 30,
      categories,
      excludeInstalled = true,
      includeReasons = true,
    } = options;

    if (!this.index) {
      return {
        recommendations: [],
        profile,
        totalSkillsScanned: 0,
        timestamp: new Date().toISOString(),
      };
    }

    let skills = this.index.skills;

    // Filter by categories if specified
    if (categories && categories.length > 0) {
      skills = skills.filter((s) => s.tags?.some((t) => categories.includes(t)));
    }

    // Score all skills
    const scored = skills.map((skill) => this.scoreSkill(profile, skill));

    // Filter by minimum score
    let filtered = scored.filter((s) => s.score >= minScore);

    // Exclude installed skills
    if (excludeInstalled) {
      filtered = filtered.filter((s) => !profile.installedSkills.includes(s.skill.name));
    }

    // Exclude explicitly excluded skills
    filtered = filtered.filter((s) => !profile.excludedSkills.includes(s.skill.name));

    // Sort by score descending
    filtered.sort((a, b) => b.score - a.score);

    // Limit results
    const recommendations = filtered.slice(0, limit);

    // Optionally strip reasons for minimal output
    if (!includeReasons) {
      recommendations.forEach((r) => {
        r.reasons = [];
      });
    }

    return {
      recommendations,
      profile,
      totalSkillsScanned: skills.length,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Search skills by query (task-based search)
   */
  search(options: SearchOptions): SearchResult[] {
    const { query, limit = 10, semantic = true, filters } = options;

    if (!this.index) {
      return [];
    }

    // Handle empty or whitespace-only queries
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      return [];
    }

    const queryTerms = trimmedQuery.toLowerCase().split(/\s+/).filter(t => t.length > 0);
    if (queryTerms.length === 0) {
      return [];
    }

    const results: SearchResult[] = [];

    for (const skill of this.index.skills) {
      // Apply filters
      if (filters?.tags && filters.tags.length > 0) {
        if (!skill.tags?.some((t) => filters.tags!.includes(t))) continue;
      }
      if (filters?.verified && !skill.verified) continue;

      // Calculate relevance
      const { relevance, matchedTerms, snippet } = this.calculateRelevance(
        skill,
        queryTerms,
        semantic
      );

      if (relevance > 0 && (!filters?.minScore || relevance >= filters.minScore)) {
        results.push({ skill, relevance, matchedTerms, snippet });
      }
    }

    // Sort by relevance
    results.sort((a, b) => b.relevance - a.relevance);

    return results.slice(0, limit);
  }

  /**
   * Calculate search relevance for a skill
   */
  private calculateRelevance(
    skill: SkillSummary,
    queryTerms: string[],
    semantic: boolean
  ): { relevance: number; matchedTerms: string[]; snippet?: string } {
    const matchedTerms: string[] = [];
    let relevance = 0;

    // Search in name (high weight)
    const nameLower = skill.name.toLowerCase();
    for (const term of queryTerms) {
      if (nameLower.includes(term)) {
        relevance += 40;
        matchedTerms.push(term);
      }
    }

    // Search in description (medium weight)
    const descLower = (skill.description || '').toLowerCase();
    for (const term of queryTerms) {
      if (descLower.includes(term) && !matchedTerms.includes(term)) {
        relevance += 20;
        matchedTerms.push(term);
      }
    }

    // Search in tags (medium weight)
    const tagsLower = (skill.tags || []).map((t) => t.toLowerCase());
    for (const term of queryTerms) {
      if (tagsLower.some((t) => t.includes(term)) && !matchedTerms.includes(term)) {
        relevance += 25;
        matchedTerms.push(term);
      }
    }

    // Semantic matching: expand terms using TAG_TO_TECH
    if (semantic) {
      for (const term of queryTerms) {
        const relatedTags = getTechTags(term);
        for (const relatedTag of relatedTags) {
          if (
            tagsLower.includes(relatedTag) ||
            nameLower.includes(relatedTag) ||
            descLower.includes(relatedTag)
          ) {
            if (!matchedTerms.includes(term)) {
              relevance += 15;
              matchedTerms.push(term);
            }
          }
        }

        // Also check if term is a tag that maps to skill tags
        const tagTechs = TAG_TO_TECH[term] || [];
        for (const tech of tagTechs) {
          if (skill.compatibility?.libraries?.includes(tech)) {
            if (!matchedTerms.includes(term)) {
              relevance += 15;
              matchedTerms.push(term);
            }
          }
        }
      }
    }

    // Generate snippet if description matches
    let snippet: string | undefined;
    if (skill.description && matchedTerms.length > 0) {
      snippet = skill.description.slice(0, 150);
      if (skill.description.length > 150) snippet += '...';
    }

    // Normalize to 0-100
    relevance = Math.min(100, relevance);

    return { relevance, matchedTerms, snippet };
  }

  /**
   * Check freshness of installed skills against project dependencies
   *
   * A skill is considered:
   * - 'current': skill's minVersion is <= project version (compatible and up to date)
   * - 'outdated': skill targets a significantly older major version
   * - 'unknown': no version requirements specified
   */
  checkFreshness(
    profile: ProjectProfile,
    installedSkills: SkillSummary[]
  ): FreshnessResult[] {
    const results: FreshnessResult[] = [];

    for (const skill of installedSkills) {
      if (!skill.compatibility?.minVersion) {
        results.push({
          skill: skill.name,
          status: 'unknown',
          details: { message: 'No version requirements specified' },
        });
        continue;
      }

      let status: 'current' | 'outdated' = 'current';
      const messages: string[] = [];

      for (const [tech, minVer] of Object.entries(skill.compatibility.minVersion)) {
        const detected = this.findDetectedVersion(profile.stack, tech);
        if (detected) {
          const majorSkill = parseInt(minVer.split('.')[0]) || 0;
          const majorProject = parseInt(detected.split('.')[0]) || 0;

          // Skill is outdated if it targets a version that is 2+ major versions behind
          // e.g., skill targets React 16 but project uses React 19
          if (majorProject - majorSkill >= 2) {
            status = 'outdated';
            messages.push(`Skill targets ${tech} ${minVer}, you have ${detected}`);
          }
        }
      }

      results.push({
        skill: skill.name,
        status,
        details:
          messages.length > 0 ? { message: messages.join('; ') } : { message: 'Up to date' },
      });
    }

    return results;
  }
}

/**
 * Create a recommendation engine with default settings
 */
export function createRecommendationEngine(
  weights?: Partial<ScoringWeights>
): RecommendationEngine {
  return new RecommendationEngine(weights);
}

/**
 * Enhanced Recommendation Engine with reasoning support
 */
export class ReasoningRecommendationEngine extends RecommendationEngine {
  private reasoningEngine: import('../reasoning/engine.js').ReasoningEngine | null = null;

  async initReasoning(): Promise<void> {
    const { ReasoningEngine } = await import('../reasoning/engine.js');
    this.reasoningEngine = new ReasoningEngine({ provider: 'mock' });

    const index = this.getIndex();
    if (index) {
      this.reasoningEngine.loadSkills(index.skills);
      this.reasoningEngine.generateTree(index.skills);
    }
  }

  async recommendWithReasoning(
    profile: ProjectProfile,
    options: import('./types.js').ReasoningRecommendOptions = {}
  ): Promise<import('./types.js').ReasoningRecommendationResult> {
    const baseResult = this.recommend(profile, options);

    if (!options.reasoning || !this.reasoningEngine) {
      return {
        ...baseResult,
        recommendations: baseResult.recommendations.map((r) => ({
          ...r,
          treePath: [],
        })),
      };
    }

    const searchResult = await this.reasoningEngine.search({
      query: this.buildQueryFromProfile(profile),
      context: profile,
      maxResults: options.limit ?? 10,
      minConfidence: options.minScore ?? 30,
    });

    const enhancedRecommendations: import('./types.js').ExplainedScoredSkill[] = [];

    for (const rec of baseResult.recommendations) {
      const treeResult = searchResult.results.find(
        (r) => r.skill.name === rec.skill.name
      );

      let explanation: import('./types.js').ExplainedMatchDetails | undefined;

      if (options.explainResults) {
        const explainedRec = await this.reasoningEngine.explain(
          rec.skill,
          rec.score,
          profile
        );
        explanation = explainedRec.reasoning;
      }

      enhancedRecommendations.push({
        ...rec,
        explanation,
        treePath: treeResult?.path ?? [],
        reasoningDetails: treeResult?.reasoning,
      });
    }

    return {
      ...baseResult,
      recommendations: enhancedRecommendations,
      reasoningSummary: searchResult.reasoning,
      searchPlan: {
        primaryCategories: [],
        secondaryCategories: [],
        keywords: this.extractKeywords(profile),
        strategy: 'breadth-first',
      },
    };
  }

  private buildQueryFromProfile(profile: ProjectProfile): string {
    const parts: string[] = [];

    if (profile.type) {
      parts.push(profile.type);
    }

    for (const framework of profile.stack.frameworks.slice(0, 3)) {
      parts.push(framework.name);
    }

    for (const language of profile.stack.languages.slice(0, 2)) {
      parts.push(language.name);
    }

    return parts.join(' ');
  }

  private extractKeywords(profile: ProjectProfile): string[] {
    const keywords: string[] = [];

    if (profile.type) {
      keywords.push(profile.type);
    }

    for (const framework of profile.stack.frameworks) {
      keywords.push(framework.name.toLowerCase());
    }

    for (const language of profile.stack.languages) {
      keywords.push(language.name.toLowerCase());
    }

    return [...new Set(keywords)];
  }

  getReasoningStats(): import('../reasoning/types.js').ReasoningEngineStats | null {
    return this.reasoningEngine?.getStats() ?? null;
  }

  getSkillTree(): import('../tree/types.js').SkillTree | null {
    return this.reasoningEngine?.getTree() ?? null;
  }
}

/**
 * Create an enhanced recommendation engine with reasoning support
 */
export function createReasoningRecommendationEngine(
  weights?: Partial<ScoringWeights>
): ReasoningRecommendationEngine {
  return new ReasoningRecommendationEngine(weights);
}
