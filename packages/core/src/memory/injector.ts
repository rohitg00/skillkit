/**
 * Memory Injector
 *
 * Injects relevant memories into agent context with relevance matching,
 * agent-specific formatting, and token budgeting.
 */

import type { AgentType } from '../types.js';
import type { ProjectContext } from '../context/types.js';
import type { Learning, MemorySummary, MemoryPreview, MemoryFull } from './types.js';
import { LearningStore } from './learning-store.js';

/**
 * Injection options
 */
export interface InjectionOptions {
  /** Maximum tokens to use for injected memories */
  maxTokens?: number;
  /** Minimum relevance score to include (0-100) */
  minRelevance?: number;
  /** Maximum number of learnings to inject */
  maxLearnings?: number;
  /** Include global memories */
  includeGlobal?: boolean;
  /** Specific tags to match */
  tags?: string[];
  /** Current task description for relevance matching */
  currentTask?: string;
  /** Progressive disclosure level */
  disclosureLevel?: 'summary' | 'preview' | 'full';
}

/**
 * Injected memory with relevance score
 */
export interface InjectedMemory {
  learning: Learning;
  relevanceScore: number;
  matchedBy: {
    frameworks: string[];
    tags: string[];
    keywords: string[];
    patterns: string[];
  };
  tokenEstimate: number;
}

/**
 * Injection result
 */
export interface InjectionResult {
  memories: InjectedMemory[];
  formattedContent: string;
  totalTokens: number;
  stats: {
    considered: number;
    matched: number;
    injected: number;
    truncated: number;
  };
}

/**
 * Default injection options
 */
const DEFAULT_OPTIONS: Required<Omit<InjectionOptions, 'tags' | 'currentTask'>> = {
  maxTokens: 2000,
  minRelevance: 30,
  maxLearnings: 10,
  includeGlobal: true,
  disclosureLevel: 'preview',
};

/**
 * Approximate tokens per character (conservative estimate)
 */
const TOKENS_PER_CHAR = 0.25;

/**
 * Memory Injector
 *
 * Retrieves and formats relevant memories for injection into agent context.
 */
export class MemoryInjector {
  private projectStore: LearningStore;
  private globalStore: LearningStore;
  private projectContext?: ProjectContext;

  constructor(
    projectPath: string,
    projectName?: string,
    projectContext?: ProjectContext
  ) {
    this.projectStore = new LearningStore('project', projectPath, projectName);
    this.globalStore = new LearningStore('global');
    this.projectContext = projectContext;
  }

  /**
   * Set project context for better relevance matching
   */
  setProjectContext(context: ProjectContext): void {
    this.projectContext = context;
  }

  /**
   * Get relevant memories for injection
   */
  async getRelevantMemories(options: InjectionOptions = {}): Promise<InjectedMemory[]> {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    // Collect all learnings
    const projectLearnings = this.projectStore.getAll();
    const globalLearnings = opts.includeGlobal ? this.globalStore.getAll() : [];
    const allLearnings = [...projectLearnings, ...globalLearnings];

    // Score each learning for relevance
    const scored = allLearnings.map((learning) => ({
      learning,
      ...this.scoreLearning(learning, opts),
    }));

    // Filter by minimum relevance
    const filtered = scored.filter((s) => s.relevanceScore >= opts.minRelevance);

    // Sort by relevance (descending)
    filtered.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Limit to max learnings
    return filtered.slice(0, opts.maxLearnings);
  }

  /**
   * Score a learning for relevance to current context
   */
  private scoreLearning(
    learning: Learning,
    options: InjectionOptions
  ): Omit<InjectedMemory, 'learning'> {
    let score = 0;
    const matchedBy = {
      frameworks: [] as string[],
      tags: [] as string[],
      keywords: [] as string[],
      patterns: [] as string[],
    };

    // Match by frameworks from project context
    if (this.projectContext?.stack) {
      const projectFrameworks = this.extractFrameworkNames();
      const learningFrameworks = learning.frameworks || [];

      for (const fw of learningFrameworks) {
        if (projectFrameworks.has(fw.toLowerCase())) {
          score += 15;
          matchedBy.frameworks.push(fw);
        }
      }
    }

    // Match by explicitly requested tags
    if (options.tags && options.tags.length > 0) {
      const requestedTags = new Set(options.tags.map((t) => t.toLowerCase()));
      for (const tag of learning.tags) {
        if (requestedTags.has(tag.toLowerCase())) {
          score += 20;
          matchedBy.tags.push(tag);
        }
      }
    }

    // Match by current task keywords
    if (options.currentTask) {
      const taskKeywords = this.extractKeywords(options.currentTask);
      const learningKeywords = [
        ...this.extractKeywords(learning.title),
        ...this.extractKeywords(learning.content),
        ...learning.tags,
      ];

      const learningKeywordSet = new Set(learningKeywords.map((k) => k.toLowerCase()));
      for (const kw of taskKeywords) {
        if (learningKeywordSet.has(kw.toLowerCase())) {
          score += 10;
          if (!matchedBy.keywords.includes(kw)) {
            matchedBy.keywords.push(kw);
          }
        }
      }
    }

    // Match by patterns
    if (learning.patterns && learning.patterns.length > 0) {
      // Patterns are valuable - boost score
      score += learning.patterns.length * 5;
      matchedBy.patterns.push(...learning.patterns);
    }

    // Boost by effectiveness if known
    if (learning.effectiveness !== undefined) {
      score += (learning.effectiveness / 100) * 20;
    }

    // Boost by use count (popular learnings are likely valuable)
    score += Math.min(learning.useCount * 2, 15);

    // Boost recent learnings
    const daysSinceUpdate = this.daysSince(learning.updatedAt);
    if (daysSinceUpdate < 7) {
      score += 10;
    } else if (daysSinceUpdate < 30) {
      score += 5;
    }

    // Cap score at 100
    score = Math.min(score, 100);

    // Estimate token count
    const tokenEstimate = this.estimateTokens(learning, options.disclosureLevel || 'preview');

    return {
      relevanceScore: score,
      matchedBy,
      tokenEstimate,
    };
  }

  /**
   * Extract framework names from project context
   */
  private extractFrameworkNames(): Set<string> {
    const names = new Set<string>();

    if (!this.projectContext?.stack) return names;

    const stack = this.projectContext.stack;
    const categories = [
      stack.languages,
      stack.frameworks,
      stack.libraries,
      stack.styling,
      stack.testing,
      stack.databases,
      stack.tools,
      stack.runtime,
    ];

    for (const category of categories) {
      for (const detection of category) {
        names.add(detection.name.toLowerCase());
      }
    }

    return names;
  }

  /**
   * Extract keywords from text
   */
  private extractKeywords(text: string): string[] {
    return text
      .toLowerCase()
      .split(/[\s\-_.,;:!?()[\]{}'"]+/)
      .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
  }

  /**
   * Calculate days since a date
   */
  private daysSince(dateStr: string): number {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }

  /**
   * Estimate tokens for a learning
   */
  private estimateTokens(
    learning: Learning,
    level: 'summary' | 'preview' | 'full'
  ): number {
    switch (level) {
      case 'summary':
        return Math.ceil((learning.title.length + learning.tags.join(' ').length) * TOKENS_PER_CHAR);
      case 'preview':
        const excerpt = learning.content.slice(0, 200);
        return Math.ceil(
          (learning.title.length + excerpt.length + learning.tags.join(' ').length) * TOKENS_PER_CHAR
        );
      case 'full':
        return Math.ceil(
          (learning.title.length + learning.content.length + learning.tags.join(' ').length) *
            TOKENS_PER_CHAR
        );
    }
  }

  /**
   * Inject memories and return formatted content
   */
  async inject(options: InjectionOptions = {}): Promise<InjectionResult> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const allMemories = await this.getRelevantMemories(opts);

    // Select memories within token budget
    const selected: InjectedMemory[] = [];
    let totalTokens = 0;
    let truncated = 0;

    for (const memory of allMemories) {
      if (totalTokens + memory.tokenEstimate <= opts.maxTokens) {
        selected.push(memory);
        totalTokens += memory.tokenEstimate;

        // Increment use count
        if (memory.learning.scope === 'project') {
          this.projectStore.incrementUseCount(memory.learning.id);
        } else {
          this.globalStore.incrementUseCount(memory.learning.id);
        }
      } else {
        truncated++;
      }
    }

    // Format the content
    const formattedContent = this.formatMemories(selected, opts.disclosureLevel || 'preview');

    return {
      memories: selected,
      formattedContent,
      totalTokens,
      stats: {
        considered: this.projectStore.count() + (opts.includeGlobal ? this.globalStore.count() : 0),
        matched: allMemories.length,
        injected: selected.length,
        truncated,
      },
    };
  }

  /**
   * Inject memories formatted for a specific agent
   */
  async injectForAgent(
    agent: AgentType,
    options: InjectionOptions = {}
  ): Promise<InjectionResult> {
    const result = await this.inject(options);

    // Reformat for specific agent
    result.formattedContent = this.formatForAgent(result.memories, agent, options.disclosureLevel);

    return result;
  }

  /**
   * Format memories for display
   */
  private formatMemories(
    memories: InjectedMemory[],
    level: 'summary' | 'preview' | 'full'
  ): string {
    if (memories.length === 0) {
      return '';
    }

    const lines: string[] = ['# Relevant Memories', ''];

    for (const { learning, relevanceScore, matchedBy } of memories) {
      lines.push(`## ${learning.title}`);
      lines.push(`*Relevance: ${relevanceScore}% | Tags: ${learning.tags.join(', ')}*`);

      if (matchedBy.frameworks.length > 0) {
        lines.push(`*Matched frameworks: ${matchedBy.frameworks.join(', ')}*`);
      }

      lines.push('');

      switch (level) {
        case 'summary':
          // Just title and tags (already shown above)
          break;
        case 'preview':
          lines.push(learning.content.slice(0, 200) + (learning.content.length > 200 ? '...' : ''));
          break;
        case 'full':
          lines.push(learning.content);
          break;
      }

      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Format memories for a specific agent
   */
  formatForAgent(
    memories: InjectedMemory[],
    agent: AgentType,
    level: 'summary' | 'preview' | 'full' = 'preview'
  ): string {
    if (memories.length === 0) {
      return '';
    }

    switch (agent) {
      case 'claude-code':
        return this.formatForClaude(memories, level);
      case 'cursor':
        return this.formatForCursor(memories, level);
      case 'codex':
      case 'github-copilot':
        return this.formatForCopilot(memories, level);
      default:
        return this.formatMemories(memories, level);
    }
  }

  /**
   * Format memories for Claude (XML tags)
   */
  private formatForClaude(
    memories: InjectedMemory[],
    level: 'summary' | 'preview' | 'full'
  ): string {
    const lines: string[] = ['<memories>'];

    for (const { learning, relevanceScore } of memories) {
      lines.push(`  <memory relevance="${relevanceScore}" scope="${learning.scope}">`);
      lines.push(`    <title>${this.escapeXml(learning.title)}</title>`);
      lines.push(`    <tags>${learning.tags.join(', ')}</tags>`);

      if (level !== 'summary') {
        const content =
          level === 'preview' ? learning.content.slice(0, 200) : learning.content;
        lines.push(`    <content>${this.escapeXml(content)}</content>`);
      }

      if (learning.frameworks && learning.frameworks.length > 0) {
        lines.push(`    <frameworks>${learning.frameworks.join(', ')}</frameworks>`);
      }

      lines.push('  </memory>');
    }

    lines.push('</memories>');
    return lines.join('\n');
  }

  /**
   * Format memories for Cursor (.mdc format)
   */
  private formatForCursor(
    memories: InjectedMemory[],
    level: 'summary' | 'preview' | 'full'
  ): string {
    const lines: string[] = [
      '---',
      'description: Relevant memories from previous sessions',
      'globs:',
      '  - "**/*"',
      '---',
      '',
      '# Session Memories',
      '',
    ];

    for (const { learning, relevanceScore } of memories) {
      lines.push(`## ${learning.title}`);
      lines.push('');
      lines.push(`> Relevance: ${relevanceScore}% | Tags: ${learning.tags.join(', ')}`);
      lines.push('');

      if (level !== 'summary') {
        const content =
          level === 'preview'
            ? learning.content.slice(0, 200) + (learning.content.length > 200 ? '...' : '')
            : learning.content;
        lines.push(content);
        lines.push('');
      }
    }

    return lines.join('\n');
  }

  /**
   * Format memories for Copilot/Codex (concise markdown)
   */
  private formatForCopilot(
    memories: InjectedMemory[],
    level: 'summary' | 'preview' | 'full'
  ): string {
    const lines: string[] = ['<!-- Session Memories -->'];

    for (const { learning } of memories) {
      lines.push(`### ${learning.title}`);
      lines.push(`Tags: ${learning.tags.join(', ')}`);

      if (level !== 'summary') {
        const content =
          level === 'preview' ? learning.content.slice(0, 150) : learning.content;
        lines.push(content);
      }

      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Escape XML special characters
   */
  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Get memory summaries (for progressive disclosure)
   */
  getSummaries(options: InjectionOptions = {}): MemorySummary[] {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    const projectLearnings = this.projectStore.getAll();
    const globalLearnings = opts.includeGlobal ? this.globalStore.getAll() : [];
    const allLearnings = [...projectLearnings, ...globalLearnings];

    return allLearnings.map((learning) => ({
      id: learning.id,
      title: learning.title,
      tags: learning.tags,
      relevance: this.scoreLearning(learning, opts).relevanceScore,
    }));
  }

  /**
   * Get memory previews (for progressive disclosure)
   */
  getPreviews(ids: string[], options: InjectionOptions = {}): MemoryPreview[] {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const previews: MemoryPreview[] = [];

    for (const id of ids) {
      let learning = this.projectStore.getById(id);
      if (!learning && opts.includeGlobal) {
        learning = this.globalStore.getById(id);
      }

      if (learning) {
        previews.push({
          id: learning.id,
          title: learning.title,
          tags: learning.tags,
          relevance: this.scoreLearning(learning, opts).relevanceScore,
          excerpt: learning.content.slice(0, 200),
          lastUsed: learning.lastUsed,
        });
      }
    }

    return previews;
  }

  /**
   * Get full memories (for progressive disclosure)
   */
  getFullMemories(ids: string[], options: InjectionOptions = {}): MemoryFull[] {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const fullMemories: MemoryFull[] = [];

    for (const id of ids) {
      let learning = this.projectStore.getById(id);
      if (!learning && opts.includeGlobal) {
        learning = this.globalStore.getById(id);
      }

      if (learning) {
        fullMemories.push({
          id: learning.id,
          title: learning.title,
          tags: learning.tags,
          relevance: this.scoreLearning(learning, opts).relevanceScore,
          excerpt: learning.content.slice(0, 200),
          lastUsed: learning.lastUsed,
          content: learning.content,
        });
      }
    }

    return fullMemories;
  }

  /**
   * Search memories by query
   */
  search(query: string, options: InjectionOptions = {}): InjectedMemory[] {
    const opts = { ...DEFAULT_OPTIONS, ...options, currentTask: query };
    const projectResults = this.projectStore.search(query);
    const globalResults = opts.includeGlobal ? this.globalStore.search(query) : [];
    const allResults = [...projectResults, ...globalResults];

    return allResults
      .map((learning) => ({
        learning,
        ...this.scoreLearning(learning, opts),
      }))
      .filter((m) => m.relevanceScore >= opts.minRelevance)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, opts.maxLearnings);
  }
}

/**
 * Common stop words to ignore in keyword extraction
 */
const STOP_WORDS = new Set([
  'the',
  'a',
  'an',
  'and',
  'or',
  'but',
  'in',
  'on',
  'at',
  'to',
  'for',
  'of',
  'with',
  'by',
  'from',
  'as',
  'is',
  'was',
  'are',
  'were',
  'been',
  'be',
  'have',
  'has',
  'had',
  'do',
  'does',
  'did',
  'will',
  'would',
  'could',
  'should',
  'may',
  'might',
  'must',
  'can',
  'this',
  'that',
  'these',
  'those',
  'i',
  'you',
  'he',
  'she',
  'it',
  'we',
  'they',
  'what',
  'which',
  'who',
  'when',
  'where',
  'why',
  'how',
  'all',
  'each',
  'every',
  'both',
  'few',
  'more',
  'most',
  'other',
  'some',
  'such',
  'no',
  'nor',
  'not',
  'only',
  'own',
  'same',
  'so',
  'than',
  'too',
  'very',
  'just',
  'also',
]);

/**
 * Create a MemoryInjector instance
 */
export function createMemoryInjector(
  projectPath: string,
  projectName?: string,
  projectContext?: ProjectContext
): MemoryInjector {
  return new MemoryInjector(projectPath, projectName, projectContext);
}
