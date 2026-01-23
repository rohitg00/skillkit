/**
 * Memory Compression Engine
 *
 * Compresses raw observations into learnings using either rule-based
 * extraction or AI-powered compression.
 */

import type { Observation, Learning, ObservationType } from './types.js';
import { LearningStore } from './learning-store.js';
import { MemoryIndexStore } from './memory-index.js';

/**
 * Compression result for a single learning
 */
export interface CompressedLearning {
  title: string;
  content: string;
  tags: string[];
  frameworks?: string[];
  patterns?: string[];
  importance: number; // 1-10
  sourceObservationIds: string[];
}

/**
 * Compression result
 */
export interface CompressionResult {
  learnings: CompressedLearning[];
  processedObservationIds: string[];
  skippedObservationIds: string[];
  stats: {
    inputCount: number;
    outputCount: number;
    compressionRatio: number;
  };
}

/**
 * Compression options
 */
export interface CompressionOptions {
  /** Minimum observations to trigger compression */
  minObservations?: number;
  /** Maximum learnings to generate per compression */
  maxLearnings?: number;
  /** Minimum importance score (1-10) to keep a learning */
  minImportance?: number;
  /** Whether to include low-relevance observations */
  includeLowRelevance?: boolean;
  /** Custom tags to add to all learnings */
  additionalTags?: string[];
  /** Project name for context */
  projectName?: string;
}

const DEFAULT_COMPRESSION_OPTIONS: Required<CompressionOptions> = {
  minObservations: 3,
  maxLearnings: 10,
  minImportance: 4,
  includeLowRelevance: false,
  additionalTags: [],
  projectName: '',
};

/**
 * Compression engine interface
 */
export interface CompressionEngine {
  /**
   * Compress observations into learnings
   */
  compress(observations: Observation[], options?: CompressionOptions): Promise<CompressionResult>;

  /**
   * Get the engine type
   */
  getType(): 'rule-based' | 'api';
}

/**
 * Rule-based compression engine
 *
 * Uses heuristics and patterns to extract learnings without AI.
 */
export class RuleBasedCompressor implements CompressionEngine {
  getType(): 'rule-based' | 'api' {
    return 'rule-based';
  }

  async compress(
    observations: Observation[],
    options: CompressionOptions = {}
  ): Promise<CompressionResult> {
    const opts = { ...DEFAULT_COMPRESSION_OPTIONS, ...options };

    // Filter observations
    const filtered = opts.includeLowRelevance
      ? observations
      : observations.filter((o) => o.relevance >= 50);

    if (filtered.length < opts.minObservations) {
      return {
        learnings: [],
        processedObservationIds: [],
        skippedObservationIds: observations.map((o) => o.id),
        stats: {
          inputCount: observations.length,
          outputCount: 0,
          compressionRatio: 0,
        },
      };
    }

    const learnings: CompressedLearning[] = [];
    const processedIds: string[] = [];

    // Group observations by type
    const byType = this.groupByType(filtered);

    // Extract error-solution pairs
    const errorSolutionLearnings = this.extractErrorSolutionPairs(byType, opts);
    learnings.push(...errorSolutionLearnings.learnings);
    processedIds.push(...errorSolutionLearnings.processedIds);

    // Extract decision patterns
    const decisionLearnings = this.extractDecisionPatterns(byType, opts);
    learnings.push(...decisionLearnings.learnings);
    processedIds.push(...decisionLearnings.processedIds);

    // Extract file change patterns
    const fileChangeLearnings = this.extractFileChangePatterns(byType, opts);
    learnings.push(...fileChangeLearnings.learnings);
    processedIds.push(...fileChangeLearnings.processedIds);

    // Extract tool usage patterns
    const toolUsageLearnings = this.extractToolUsagePatterns(byType, opts);
    learnings.push(...toolUsageLearnings.learnings);
    processedIds.push(...toolUsageLearnings.processedIds);

    // Filter by importance and limit
    const finalLearnings = learnings
      .filter((l) => l.importance >= opts.minImportance)
      .sort((a, b) => b.importance - a.importance)
      .slice(0, opts.maxLearnings);

    // Add additional tags
    if (opts.additionalTags.length > 0) {
      for (const learning of finalLearnings) {
        learning.tags = [...new Set([...learning.tags, ...opts.additionalTags])];
      }
    }

    const skippedIds = observations
      .map((o) => o.id)
      .filter((id) => !processedIds.includes(id));

    return {
      learnings: finalLearnings,
      processedObservationIds: processedIds,
      skippedObservationIds: skippedIds,
      stats: {
        inputCount: observations.length,
        outputCount: finalLearnings.length,
        compressionRatio: observations.length > 0 ? finalLearnings.length / observations.length : 0,
      },
    };
  }

  private groupByType(observations: Observation[]): Map<ObservationType, Observation[]> {
    const groups = new Map<ObservationType, Observation[]>();
    for (const obs of observations) {
      const existing = groups.get(obs.type) || [];
      existing.push(obs);
      groups.set(obs.type, existing);
    }
    return groups;
  }

  private extractErrorSolutionPairs(
    byType: Map<ObservationType, Observation[]>,
    _opts: Required<CompressionOptions>
  ): { learnings: CompressedLearning[]; processedIds: string[] } {
    const errors = byType.get('error') || [];
    const solutions = byType.get('solution') || [];
    const learnings: CompressedLearning[] = [];
    const processedIds: string[] = [];

    // Match errors with solutions
    for (const error of errors) {
      const errorText = error.content.error || error.content.action;
      const matchingSolution = solutions.find((s) => {
        const solutionContext = s.content.context?.toLowerCase() || '';
        const errorLower = errorText.toLowerCase();
        // Simple matching: solution mentions similar keywords
        return (
          solutionContext.includes('fix') ||
          solutionContext.includes('resolve') ||
          this.hasSimilarKeywords(errorLower, solutionContext)
        );
      });

      if (matchingSolution) {
        const title = this.generateTitle('Error Resolution', errorText);
        const content = this.formatErrorSolutionContent(error, matchingSolution);
        const tags = this.extractTags([error, matchingSolution]);

        learnings.push({
          title,
          content,
          tags,
          frameworks: this.extractFrameworks(tags),
          patterns: ['error-handling', 'debugging'],
          importance: 8,
          sourceObservationIds: [error.id, matchingSolution.id],
        });

        processedIds.push(error.id, matchingSolution.id);
      } else if (error.content.error) {
        // Standalone error learning
        const title = this.generateTitle('Error Pattern', errorText);
        const content = this.formatStandaloneErrorContent(error);
        const tags = this.extractTags([error]);

        learnings.push({
          title,
          content,
          tags,
          frameworks: this.extractFrameworks(tags),
          patterns: ['error-handling'],
          importance: 6,
          sourceObservationIds: [error.id],
        });

        processedIds.push(error.id);
      }
    }

    // Process remaining solutions
    for (const solution of solutions) {
      if (!processedIds.includes(solution.id)) {
        const title = this.generateTitle('Solution', solution.content.action);
        const content = this.formatSolutionContent(solution);
        const tags = this.extractTags([solution]);

        learnings.push({
          title,
          content,
          tags,
          frameworks: this.extractFrameworks(tags),
          patterns: ['solution-pattern'],
          importance: 7,
          sourceObservationIds: [solution.id],
        });

        processedIds.push(solution.id);
      }
    }

    return { learnings, processedIds };
  }

  private extractDecisionPatterns(
    byType: Map<ObservationType, Observation[]>,
    _opts: Required<CompressionOptions>
  ): { learnings: CompressedLearning[]; processedIds: string[] } {
    const decisions = byType.get('decision') || [];
    const learnings: CompressedLearning[] = [];
    const processedIds: string[] = [];

    for (const decision of decisions) {
      const title = this.generateTitle('Decision', decision.content.action);
      const content = this.formatDecisionContent(decision);
      const tags = this.extractTags([decision]);

      learnings.push({
        title,
        content,
        tags,
        frameworks: this.extractFrameworks(tags),
        patterns: ['decision-making', 'architecture'],
        importance: 7,
        sourceObservationIds: [decision.id],
      });

      processedIds.push(decision.id);
    }

    return { learnings, processedIds };
  }

  private extractFileChangePatterns(
    byType: Map<ObservationType, Observation[]>,
    _opts: Required<CompressionOptions>
  ): { learnings: CompressedLearning[]; processedIds: string[] } {
    const fileChanges = byType.get('file_change') || [];
    const learnings: CompressedLearning[] = [];
    const processedIds: string[] = [];

    // Group file changes by pattern (same files modified together)
    const filePatterns = new Map<string, Observation[]>();
    for (const change of fileChanges) {
      const files = change.content.files || [];
      const pattern = this.getFilePattern(files);
      const existing = filePatterns.get(pattern) || [];
      existing.push(change);
      filePatterns.set(pattern, existing);
    }

    // Create learnings for significant patterns (2+ occurrences)
    for (const [pattern, changes] of filePatterns) {
      if (changes.length >= 2 || changes.some((c) => (c.content.files?.length || 0) > 3)) {
        const title = `File Modification Pattern: ${pattern}`;
        const content = this.formatFileChangeContent(changes);
        const tags = this.extractTags(changes);

        learnings.push({
          title,
          content,
          tags,
          frameworks: this.extractFrameworks(tags),
          patterns: ['file-organization', 'code-structure'],
          importance: 5,
          sourceObservationIds: changes.map((c) => c.id),
        });

        processedIds.push(...changes.map((c) => c.id));
      }
    }

    return { learnings, processedIds };
  }

  private extractToolUsagePatterns(
    byType: Map<ObservationType, Observation[]>,
    _opts: Required<CompressionOptions>
  ): { learnings: CompressedLearning[]; processedIds: string[] } {
    const toolUses = byType.get('tool_use') || [];
    const checkpoints = byType.get('checkpoint') || [];
    const learnings: CompressedLearning[] = [];
    const processedIds: string[] = [];

    // Only extract if there are significant patterns
    const allObs = [...toolUses, ...checkpoints];
    if (allObs.length >= 5) {
      // Group by common action patterns
      const actionPatterns = new Map<string, Observation[]>();
      for (const obs of allObs) {
        const actionType = this.getActionType(obs.content.action);
        const existing = actionPatterns.get(actionType) || [];
        existing.push(obs);
        actionPatterns.set(actionType, existing);
      }

      for (const [actionType, observations] of actionPatterns) {
        if (observations.length >= 3) {
          const title = `Workflow Pattern: ${actionType}`;
          const content = this.formatToolUsageContent(observations);
          const tags = this.extractTags(observations);

          learnings.push({
            title,
            content,
            tags,
            frameworks: this.extractFrameworks(tags),
            patterns: ['workflow', 'automation'],
            importance: 4,
            sourceObservationIds: observations.map((o) => o.id),
          });

          processedIds.push(...observations.map((o) => o.id));
        }
      }
    }

    return { learnings, processedIds };
  }

  private generateTitle(prefix: string, text: string): string {
    // Extract key words from text
    const cleaned = text
      .replace(/[^a-zA-Z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const words = cleaned.split(' ').slice(0, 5).join(' ');
    return `${prefix}: ${words}`.slice(0, 80);
  }

  private formatErrorSolutionContent(error: Observation, solution: Observation): string {
    return `## Problem
${error.content.error || error.content.action}

**Context:** ${error.content.context}

## Solution
${solution.content.solution || solution.content.action}

**How it was applied:** ${solution.content.context}

## Files Involved
${[...(error.content.files || []), ...(solution.content.files || [])].join(', ') || 'N/A'}
`;
  }

  private formatStandaloneErrorContent(error: Observation): string {
    return `## Error
${error.content.error || error.content.action}

**Context:** ${error.content.context}

## Files Involved
${error.content.files?.join(', ') || 'N/A'}

## Notes
This error was encountered but no direct solution was recorded. Consider investigating similar patterns.
`;
  }

  private formatSolutionContent(solution: Observation): string {
    return `## Solution
${solution.content.solution || solution.content.action}

**Context:** ${solution.content.context}

## Result
${solution.content.result || 'Solution applied successfully'}

## Files Involved
${solution.content.files?.join(', ') || 'N/A'}
`;
  }

  private formatDecisionContent(decision: Observation): string {
    return `## Decision
${decision.content.action}

**Context:** ${decision.content.context}

## Reasoning
This decision was made during skill execution. The context above explains why this approach was chosen.

## Result
${decision.content.result || 'Decision implemented'}
`;
  }

  private formatFileChangeContent(changes: Observation[]): string {
    const allFiles = new Set<string>();
    const contexts: string[] = [];

    for (const change of changes) {
      for (const file of change.content.files || []) {
        allFiles.add(file);
      }
      if (change.content.context) {
        contexts.push(`- ${change.content.context}`);
      }
    }

    return `## Files Modified
${Array.from(allFiles).join('\n')}

## Contexts
${contexts.join('\n') || 'Various modifications'}

## Pattern
These files were frequently modified together, suggesting a common pattern or component boundary.
`;
  }

  private formatToolUsageContent(observations: Observation[]): string {
    const actions = observations
      .map((o) => `- ${o.content.action}`)
      .slice(0, 10)
      .join('\n');

    return `## Workflow Steps
${actions}

## Pattern
This sequence of actions was repeated during execution, indicating a common workflow pattern.

## Recommendation
Consider automating or documenting this workflow for future reference.
`;
  }

  private extractTags(observations: Observation[]): string[] {
    const tags = new Set<string>();
    for (const obs of observations) {
      for (const tag of obs.content.tags || []) {
        tags.add(tag.toLowerCase());
      }
    }
    return Array.from(tags);
  }

  private extractFrameworks(tags: string[]): string[] {
    const frameworks = [
      'react',
      'nextjs',
      'vue',
      'angular',
      'svelte',
      'express',
      'nestjs',
      'fastify',
      'django',
      'flask',
      'rails',
      'spring',
      'typescript',
      'javascript',
      'python',
      'rust',
      'go',
    ];
    return tags.filter((t) => frameworks.includes(t.toLowerCase()));
  }

  private getFilePattern(files: string[]): string {
    if (files.length === 0) return 'unknown';

    // Extract common directory
    const dirs = files.map((f) => {
      const parts = f.split('/');
      return parts.slice(0, -1).join('/') || 'root';
    });

    const uniqueDirs = [...new Set(dirs)];
    if (uniqueDirs.length === 1) {
      return uniqueDirs[0];
    }

    // Extract file types
    const extensions = files.map((f) => {
      const ext = f.split('.').pop() || 'unknown';
      return ext;
    });
    const uniqueExts = [...new Set(extensions)];

    return `${uniqueDirs[0]} (${uniqueExts.join(', ')})`;
  }

  private getActionType(action: string): string {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('read') || actionLower.includes('view')) return 'read';
    if (actionLower.includes('write') || actionLower.includes('create')) return 'write';
    if (actionLower.includes('edit') || actionLower.includes('modify')) return 'edit';
    if (actionLower.includes('delete') || actionLower.includes('remove')) return 'delete';
    if (actionLower.includes('test') || actionLower.includes('verify')) return 'test';
    if (actionLower.includes('build') || actionLower.includes('compile')) return 'build';
    if (actionLower.includes('start') || actionLower.includes('run')) return 'run';
    return 'other';
  }

  private hasSimilarKeywords(text1: string, text2: string): boolean {
    const words1 = text1.split(/\s+/).filter((w) => w.length > 3);
    const words2 = new Set(text2.split(/\s+/).filter((w) => w.length > 3));
    return words1.some((w) => words2.has(w));
  }
}

/**
 * API-based compression engine configuration
 */
export interface APICompressionConfig {
  /** API provider */
  provider: 'anthropic' | 'openai';
  /** API key */
  apiKey: string;
  /** Model to use */
  model?: string;
  /** Maximum tokens for response */
  maxTokens?: number;
}

/**
 * API-based compression engine
 *
 * Uses Claude or OpenAI to extract learnings from observations.
 */
export class APIBasedCompressor implements CompressionEngine {
  private config: APICompressionConfig;

  constructor(config: APICompressionConfig) {
    this.config = config;
  }

  getType(): 'rule-based' | 'api' {
    return 'api';
  }

  async compress(
    observations: Observation[],
    options: CompressionOptions = {}
  ): Promise<CompressionResult> {
    const opts = { ...DEFAULT_COMPRESSION_OPTIONS, ...options };

    // Filter observations
    const filtered = opts.includeLowRelevance
      ? observations
      : observations.filter((o) => o.relevance >= 50);

    if (filtered.length < opts.minObservations) {
      return {
        learnings: [],
        processedObservationIds: [],
        skippedObservationIds: observations.map((o) => o.id),
        stats: {
          inputCount: observations.length,
          outputCount: 0,
          compressionRatio: 0,
        },
      };
    }

    // Format observations for the prompt
    const observationsText = this.formatObservationsForPrompt(filtered);

    // Build the prompt
    const prompt = this.buildCompressionPrompt(observationsText, opts);

    try {
      // Call the API
      const response = await this.callAPI(prompt);

      // Parse the response
      const learnings = this.parseAPIResponse(response, filtered);

      // Filter and limit
      const finalLearnings = learnings
        .filter((l) => l.importance >= opts.minImportance)
        .sort((a, b) => b.importance - a.importance)
        .slice(0, opts.maxLearnings);

      // Add additional tags
      if (opts.additionalTags.length > 0) {
        for (const learning of finalLearnings) {
          learning.tags = [...new Set([...learning.tags, ...opts.additionalTags])];
        }
      }

      const processedIds = finalLearnings.flatMap((l) => l.sourceObservationIds);
      const skippedIds = observations
        .map((o) => o.id)
        .filter((id) => !processedIds.includes(id));

      return {
        learnings: finalLearnings,
        processedObservationIds: processedIds,
        skippedObservationIds: skippedIds,
        stats: {
          inputCount: observations.length,
          outputCount: finalLearnings.length,
          compressionRatio:
            observations.length > 0 ? finalLearnings.length / observations.length : 0,
        },
      };
    } catch (error) {
      // Fall back to rule-based compression on API failure
      console.warn('API compression failed, falling back to rule-based:', error);
      const fallback = new RuleBasedCompressor();
      return fallback.compress(observations, options);
    }
  }

  private formatObservationsForPrompt(observations: Observation[]): string {
    return observations
      .map(
        (o, i) => `
[Observation ${i + 1}] ID: ${o.id}
Type: ${o.type}
Timestamp: ${o.timestamp}
Action: ${o.content.action}
Context: ${o.content.context}
${o.content.error ? `Error: ${o.content.error}` : ''}
${o.content.solution ? `Solution: ${o.content.solution}` : ''}
${o.content.result ? `Result: ${o.content.result}` : ''}
${o.content.files?.length ? `Files: ${o.content.files.join(', ')}` : ''}
${o.content.tags?.length ? `Tags: ${o.content.tags.join(', ')}` : ''}
Relevance: ${o.relevance}/100
`
      )
      .join('\n---\n');
  }

  private buildCompressionPrompt(observationsText: string, opts: Required<CompressionOptions>): string {
    return `Analyze these session observations and extract key learnings that would be valuable for future development sessions.

## Observations
${observationsText}

## Instructions
Extract meaningful learnings from these observations. For each learning:
1. Create a concise, actionable title (max 80 characters)
2. Write content that explains:
   - What was learned
   - When/why this is useful
   - How to apply it
3. Add relevant tags (lowercase, hyphenated)
4. Rate importance (1-10, where 10 is critical)

Focus on:
- Error patterns and their solutions
- Decisions made and their reasoning
- Workflow patterns that emerged
- Best practices discovered
- Gotchas and edge cases

${opts.projectName ? `Project context: ${opts.projectName}` : ''}

## Output Format
Respond with valid JSON array:
[
  {
    "title": "...",
    "content": "...",
    "tags": ["tag1", "tag2"],
    "frameworks": ["react", "typescript"],
    "patterns": ["error-handling", "debugging"],
    "importance": 8,
    "sourceObservationIds": ["obs-id-1", "obs-id-2"]
  }
]

Generate up to ${opts.maxLearnings} learnings. Only include learnings with importance >= ${opts.minImportance}.`;
  }

  private async callAPI(prompt: string): Promise<string> {
    if (this.config.provider === 'anthropic') {
      return this.callAnthropic(prompt);
    } else {
      return this.callOpenAI(prompt);
    }
  }

  private async callAnthropic(prompt: string): Promise<string> {
    const model = this.config.model || 'claude-3-haiku-20240307';
    const maxTokens = this.config.maxTokens || 4096;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error: ${response.status} - ${error}`);
    }

    const data = (await response.json()) as { content: Array<{ text: string }> };
    return data.content[0]?.text || '';
  }

  private async callOpenAI(prompt: string): Promise<string> {
    const model = this.config.model || 'gpt-4o-mini';
    const maxTokens = this.config.maxTokens || 4096;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };
    return data.choices[0]?.message?.content || '';
  }

  private parseAPIResponse(response: string, observations: Observation[]): CompressedLearning[] {
    try {
      // Extract JSON from response (handle markdown code blocks)
      let jsonStr = response;
      const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      }

      const parsed = JSON.parse(jsonStr.trim());

      if (!Array.isArray(parsed)) {
        throw new Error('Response is not an array');
      }

      // Validate and clean up each learning
      const observationIds = new Set(observations.map((o) => o.id));
      return parsed
        .filter((item): item is CompressedLearning => {
          return (
            typeof item === 'object' &&
            typeof item.title === 'string' &&
            typeof item.content === 'string' &&
            Array.isArray(item.tags) &&
            typeof item.importance === 'number'
          );
        })
        .map((item) => ({
          ...item,
          // Validate source observation IDs
          sourceObservationIds: (item.sourceObservationIds || []).filter((id: string) =>
            observationIds.has(id)
          ),
          frameworks: item.frameworks || [],
          patterns: item.patterns || [],
        }));
    } catch (error) {
      console.warn('Failed to parse API response:', error);
      return [];
    }
  }
}

/**
 * Memory compressor that manages compression and stores results
 */
export class MemoryCompressor {
  private engine: CompressionEngine;
  private learningStore: LearningStore;
  private indexStore: MemoryIndexStore;
  private projectName?: string;

  constructor(
    projectPath: string,
    options?: {
      engine?: CompressionEngine;
      scope?: 'project' | 'global';
      projectName?: string;
    }
  ) {
    this.engine = options?.engine || new RuleBasedCompressor();
    this.learningStore = new LearningStore(
      options?.scope || 'project',
      projectPath,
      options?.projectName
    );
    this.indexStore = new MemoryIndexStore(projectPath, options?.scope === 'global');
    this.projectName = options?.projectName;
  }

  /**
   * Set the compression engine
   */
  setEngine(engine: CompressionEngine): void {
    this.engine = engine;
  }

  /**
   * Compress observations without storing (for dry-run/preview)
   */
  async compress(
    observations: Observation[],
    options?: CompressionOptions
  ): Promise<CompressionResult> {
    const compressionOptions = {
      ...options,
      projectName: this.projectName || options?.projectName,
    };
    return this.engine.compress(observations, compressionOptions);
  }

  /**
   * Compress observations and store as learnings
   */
  async compressAndStore(
    observations: Observation[],
    options?: CompressionOptions
  ): Promise<{
    learnings: Learning[];
    result: CompressionResult;
  }> {
    const compressionOptions = {
      ...options,
      projectName: this.projectName || options?.projectName,
    };

    // Compress observations
    const result = await this.engine.compress(observations, compressionOptions);

    // Store each learning
    const storedLearnings: Learning[] = [];
    for (const compressed of result.learnings) {
      const learning = this.learningStore.add({
        source: 'session',
        sourceObservations: compressed.sourceObservationIds,
        title: compressed.title,
        content: compressed.content,
        tags: compressed.tags,
        frameworks: compressed.frameworks,
        patterns: compressed.patterns,
      });

      // Index the learning
      this.indexStore.indexLearning(learning);

      storedLearnings.push(learning);
    }

    return {
      learnings: storedLearnings,
      result,
    };
  }

  /**
   * Get the learning store
   */
  getLearningStore(): LearningStore {
    return this.learningStore;
  }

  /**
   * Get the index store
   */
  getIndexStore(): MemoryIndexStore {
    return this.indexStore;
  }

  /**
   * Get compression engine type
   */
  getEngineType(): 'rule-based' | 'api' {
    return this.engine.getType();
  }
}

/**
 * Learning consolidator
 *
 * Merges similar learnings to reduce redundancy.
 */
export class LearningConsolidator {
  /**
   * Find similar learnings
   */
  findSimilar(learnings: Learning[], similarity = 0.7): Array<[Learning, Learning]> {
    const pairs: Array<[Learning, Learning]> = [];

    for (let i = 0; i < learnings.length; i++) {
      for (let j = i + 1; j < learnings.length; j++) {
        const score = this.calculateSimilarity(learnings[i], learnings[j]);
        if (score >= similarity) {
          pairs.push([learnings[i], learnings[j]]);
        }
      }
    }

    return pairs;
  }

  /**
   * Merge two similar learnings
   */
  merge(learning1: Learning, learning2: Learning): Omit<Learning, 'id' | 'createdAt' | 'updatedAt'> {
    // Keep the more effective/used one as base
    const base = this.getBetterLearning(learning1, learning2);
    const other = base === learning1 ? learning2 : learning1;

    return {
      source: 'session',
      sourceObservations: [
        ...(base.sourceObservations || []),
        ...(other.sourceObservations || []),
      ],
      title: base.title,
      content: this.mergeContent(base.content, other.content),
      scope: base.scope,
      project: base.project,
      tags: [...new Set([...base.tags, ...other.tags])],
      frameworks: [...new Set([...(base.frameworks || []), ...(other.frameworks || [])])],
      patterns: [...new Set([...(base.patterns || []), ...(other.patterns || [])])],
      useCount: base.useCount + other.useCount,
      lastUsed: base.lastUsed || other.lastUsed,
      effectiveness: base.effectiveness ?? other.effectiveness,
    };
  }

  /**
   * Consolidate a list of learnings
   */
  consolidate(
    learnings: Learning[],
    store: LearningStore,
    index: MemoryIndexStore,
    similarity = 0.7
  ): { merged: number; remaining: number } {
    const pairs = this.findSimilar(learnings, similarity);
    const mergedIds = new Set<string>();
    let mergedCount = 0;

    for (const [l1, l2] of pairs) {
      if (mergedIds.has(l1.id) || mergedIds.has(l2.id)) {
        continue;
      }

      // Merge the learnings
      const merged = this.merge(l1, l2);

      // Add the merged learning
      const newLearning = store.add(merged);
      index.indexLearning(newLearning);

      // Remove the old learnings
      store.delete(l1.id);
      store.delete(l2.id);
      index.removeLearning(l1.id);
      index.removeLearning(l2.id);

      mergedIds.add(l1.id);
      mergedIds.add(l2.id);
      mergedCount++;
    }

    return {
      merged: mergedCount,
      remaining: learnings.length - mergedCount * 2 + mergedCount,
    };
  }

  private calculateSimilarity(l1: Learning, l2: Learning): number {
    let score = 0;

    // Title similarity (Jaccard)
    const title1Words = new Set(l1.title.toLowerCase().split(/\s+/));
    const title2Words = new Set(l2.title.toLowerCase().split(/\s+/));
    const titleIntersection = [...title1Words].filter((w) => title2Words.has(w)).length;
    const titleUnion = new Set([...title1Words, ...title2Words]).size;
    score += (titleIntersection / titleUnion) * 0.3;

    // Tag overlap
    const tags1 = new Set(l1.tags);
    const tags2 = new Set(l2.tags);
    const tagIntersection = [...tags1].filter((t) => tags2.has(t)).length;
    const tagUnion = new Set([...tags1, ...tags2]).size;
    if (tagUnion > 0) {
      score += (tagIntersection / tagUnion) * 0.3;
    }

    // Pattern overlap
    const patterns1 = new Set(l1.patterns || []);
    const patterns2 = new Set(l2.patterns || []);
    const patternIntersection = [...patterns1].filter((p) => patterns2.has(p)).length;
    const patternUnion = new Set([...patterns1, ...patterns2]).size;
    if (patternUnion > 0) {
      score += (patternIntersection / patternUnion) * 0.2;
    }

    // Content similarity (simple word overlap)
    const content1Words = new Set(
      l1.content
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 4)
    );
    const content2Words = new Set(
      l2.content
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 4)
    );
    const contentIntersection = [...content1Words].filter((w) => content2Words.has(w)).length;
    const contentUnion = new Set([...content1Words, ...content2Words]).size;
    if (contentUnion > 0) {
      score += (contentIntersection / contentUnion) * 0.2;
    }

    return score;
  }

  private getBetterLearning(l1: Learning, l2: Learning): Learning {
    // Prefer higher effectiveness
    if (l1.effectiveness !== l2.effectiveness) {
      return (l1.effectiveness || 0) > (l2.effectiveness || 0) ? l1 : l2;
    }
    // Prefer higher use count
    if (l1.useCount !== l2.useCount) {
      return l1.useCount > l2.useCount ? l1 : l2;
    }
    // Prefer more recent
    return new Date(l1.updatedAt) > new Date(l2.updatedAt) ? l1 : l2;
  }

  private mergeContent(content1: string, content2: string): string {
    // Simple merge: keep the longer one and add a note
    if (content1.length >= content2.length) {
      return content1;
    }
    return content2;
  }
}

/**
 * Create a rule-based compressor
 */
export function createRuleBasedCompressor(): RuleBasedCompressor {
  return new RuleBasedCompressor();
}

/**
 * Create an API-based compressor
 */
export function createAPIBasedCompressor(config: APICompressionConfig): APIBasedCompressor {
  return new APIBasedCompressor(config);
}

/**
 * Create a memory compressor
 */
export function createMemoryCompressor(
  projectPath: string,
  options?: {
    engine?: CompressionEngine;
    scope?: 'project' | 'global';
    projectName?: string;
  }
): MemoryCompressor {
  return new MemoryCompressor(projectPath, options);
}
