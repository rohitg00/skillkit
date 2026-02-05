/**
 * Progressive Disclosure System
 *
 * Implements 3-layer token-optimized retrieval for efficient context usage:
 * - Layer 1: Index (titles, timestamps, IDs) - ~50-100 tokens
 * - Layer 2: Timeline (context around observations) - ~200 tokens
 * - Layer 3: Details (full content) - ~500-1000 tokens
 */

import type { Learning } from './types.js';
import { LearningStore } from './learning-store.js';

/**
 * Index entry (Layer 1)
 * Minimal information for fast scanning
 */
export interface IndexEntry {
  id: string;
  title: string;
  timestamp: string;
  tags: string[];
  scope: 'project' | 'global';
  effectiveness?: number;
  useCount: number;
}

/**
 * Timeline entry (Layer 2)
 * Context around the learning with activity timeline
 */
export interface TimelineEntry extends IndexEntry {
  excerpt: string;
  frameworks?: string[];
  patterns?: string[];
  sourceCount: number;
  lastUsed?: string;
  activityTimeline?: ActivityPoint[];
}

/**
 * Activity point for timeline
 */
export interface ActivityPoint {
  timestamp: string;
  type: 'created' | 'used' | 'updated' | 'rated';
  description?: string;
}

/**
 * Details entry (Layer 3)
 * Full content with all metadata
 */
export interface DetailsEntry extends TimelineEntry {
  content: string;
  sourceObservations?: string[];
  metadata?: Record<string, unknown>;
}

/**
 * Progressive disclosure options
 */
export interface ProgressiveDisclosureOptions {
  includeGlobal?: boolean;
  minRelevance?: number;
  maxResults?: number;
}

/**
 * Token estimates per layer
 */
const TOKEN_ESTIMATES = {
  index: 50,
  timeline: 200,
  details: 600,
};

/**
 * Progressive Disclosure Manager
 *
 * Provides 3-layer retrieval for optimal token usage.
 */
export class ProgressiveDisclosureManager {
  private projectStore: LearningStore;
  private globalStore: LearningStore;

  constructor(projectPath: string, projectName?: string) {
    this.projectStore = new LearningStore('project', projectPath, projectName);
    this.globalStore = new LearningStore('global');
  }

  /**
   * Layer 1: Get index of all learnings
   * Minimal tokens (~50-100 per entry)
   */
  getIndex(options: ProgressiveDisclosureOptions = {}): IndexEntry[] {
    const projectLearnings = this.projectStore.getAll();
    const globalLearnings = options.includeGlobal ? this.globalStore.getAll() : [];
    const allLearnings = [...projectLearnings, ...globalLearnings];

    return allLearnings
      .map((learning) => this.toIndexEntry(learning))
      .sort((a, b) => {
        const scoreA = (a.effectiveness ?? 50) + a.useCount * 5;
        const scoreB = (b.effectiveness ?? 50) + b.useCount * 5;
        return scoreB - scoreA;
      })
      .slice(0, options.maxResults ?? 50);
  }

  /**
   * Layer 2: Get timeline entries for specific IDs
   * Medium tokens (~200 per entry)
   */
  getTimeline(ids: string[], options: ProgressiveDisclosureOptions = {}): TimelineEntry[] {
    const entries: TimelineEntry[] = [];

    for (const id of ids) {
      let learning = this.projectStore.getById(id);
      if (!learning && options.includeGlobal) {
        learning = this.globalStore.getById(id);
      }

      if (learning) {
        entries.push(this.toTimelineEntry(learning));
      }
    }

    return entries.slice(0, options.maxResults ?? 20);
  }

  /**
   * Layer 3: Get full details for specific IDs
   * High tokens (~500-1000 per entry)
   */
  getDetails(ids: string[], options: ProgressiveDisclosureOptions = {}): DetailsEntry[] {
    const entries: DetailsEntry[] = [];

    for (const id of ids) {
      let learning = this.projectStore.getById(id);
      let store = this.projectStore;

      if (!learning && options.includeGlobal) {
        learning = this.globalStore.getById(id);
        store = this.globalStore;
      }

      if (learning) {
        store.incrementUseCount(id);
        entries.push(this.toDetailsEntry(learning));
      }
    }

    return entries.slice(0, options.maxResults ?? 10);
  }

  /**
   * Smart retrieval with automatic layer selection
   * Uses minimum tokens needed to satisfy the query.
   *
   * Note: tokensUsed reflects cumulative cost of the retrieval operation
   * (index lookup + any deeper layer fetches), not just the returned entries.
   * This is intentional since progressive disclosure requires scanning
   * the index first before fetching timeline/details.
   */
  smartRetrieve(
    query: string,
    tokenBudget: number = 2000,
    options: ProgressiveDisclosureOptions = {}
  ): {
    layer: 1 | 2 | 3;
    entries: IndexEntry[] | TimelineEntry[] | DetailsEntry[];
    tokensUsed: number;
    tokensRemaining: number;
  } {
    if (tokenBudget <= 0) {
      return {
        layer: 1,
        entries: [],
        tokensUsed: 0,
        tokensRemaining: 0,
      };
    }

    const index = this.getIndex(options);

    if (index.length === 0) {
      return {
        layer: 1,
        entries: [],
        tokensUsed: 0,
        tokensRemaining: tokenBudget,
      };
    }

    const indexTokens = index.length * TOKEN_ESTIMATES.index;

    if (tokenBudget < indexTokens) {
      const maxEntries = Math.floor(tokenBudget / TOKEN_ESTIMATES.index);
      const limitedIndex = index.slice(0, maxEntries);
      return {
        layer: 1,
        entries: limitedIndex,
        tokensUsed: limitedIndex.length * TOKEN_ESTIMATES.index,
        tokensRemaining: tokenBudget - limitedIndex.length * TOKEN_ESTIMATES.index,
      };
    }

    const relevantIds = this.findRelevantIds(index, query, options.minRelevance ?? 0);

    if (relevantIds.length === 0) {
      return {
        layer: 1,
        entries: index,
        tokensUsed: indexTokens,
        tokensRemaining: tokenBudget - indexTokens,
      };
    }

    const remainingBudget = tokenBudget - indexTokens;
    const maxTimelineEntries = Math.floor(remainingBudget / TOKEN_ESTIMATES.timeline);

    if (maxTimelineEntries >= 1) {
      const timelineIds = relevantIds.slice(0, Math.min(maxTimelineEntries, 10));
      const timeline = this.getTimeline(timelineIds, options);
      const timelineTokens = timeline.length * TOKEN_ESTIMATES.timeline;

      const afterTimelineBudget = remainingBudget - timelineTokens;
      const maxDetailsEntries = Math.floor(afterTimelineBudget / TOKEN_ESTIMATES.details);

      if (maxDetailsEntries >= 1) {
        const detailsIds = timelineIds.slice(0, Math.min(maxDetailsEntries, 5));
        const details = this.getDetails(detailsIds, options);
        const detailsTokens = details.length * TOKEN_ESTIMATES.details;

        return {
          layer: 3,
          entries: details,
          tokensUsed: indexTokens + timelineTokens + detailsTokens,
          tokensRemaining: tokenBudget - (indexTokens + timelineTokens + detailsTokens),
        };
      }

      return {
        layer: 2,
        entries: timeline,
        tokensUsed: indexTokens + timelineTokens,
        tokensRemaining: tokenBudget - (indexTokens + timelineTokens),
      };
    }

    return {
      layer: 1,
      entries: index,
      tokensUsed: indexTokens,
      tokensRemaining: tokenBudget - indexTokens,
    };
  }

  /**
   * Estimate tokens for a given layer and count
   */
  estimateTokens(layer: 1 | 2 | 3, count: number): number {
    const estimate = {
      1: TOKEN_ESTIMATES.index,
      2: TOKEN_ESTIMATES.timeline,
      3: TOKEN_ESTIMATES.details,
    };
    return estimate[layer] * count;
  }

  /**
   * Format entries for injection
   */
  formatForInjection(
    entries: IndexEntry[] | TimelineEntry[] | DetailsEntry[],
    layer: 1 | 2 | 3
  ): string {
    if (entries.length === 0) return '';

    const lines: string[] = ['<skillkit-memories>'];

    switch (layer) {
      case 1:
        lines.push('<!-- Memory Index (summaries only) -->');
        for (const entry of entries as IndexEntry[]) {
          lines.push(`- [${entry.id.slice(0, 8)}] ${entry.title} (${entry.tags.join(', ')})`);
        }
        break;

      case 2:
        lines.push('<!-- Memory Timeline (with context) -->');
        for (const entry of entries as TimelineEntry[]) {
          lines.push(`## ${entry.title}`);
          lines.push(`ID: ${entry.id.slice(0, 8)} | Tags: ${entry.tags.join(', ')}`);
          if (entry.frameworks && entry.frameworks.length > 0) {
            lines.push(`Frameworks: ${entry.frameworks.join(', ')}`);
          }
          lines.push('');
          lines.push(entry.excerpt);
          lines.push('');
        }
        break;

      case 3:
        lines.push('<!-- Memory Details (full content) -->');
        for (const entry of entries as DetailsEntry[]) {
          lines.push(`## ${entry.title}`);
          lines.push(`ID: ${entry.id.slice(0, 8)} | Tags: ${entry.tags.join(', ')}`);
          if (entry.frameworks && entry.frameworks.length > 0) {
            lines.push(`Frameworks: ${entry.frameworks.join(', ')}`);
          }
          if (entry.patterns && entry.patterns.length > 0) {
            lines.push(`Patterns: ${entry.patterns.join(', ')}`);
          }
          lines.push('');
          lines.push(entry.content);
          lines.push('');
        }
        break;
    }

    lines.push('</skillkit-memories>');
    return lines.join('\n');
  }

  private toIndexEntry(learning: Learning): IndexEntry {
    return {
      id: learning.id,
      title: learning.title,
      timestamp: learning.updatedAt,
      tags: learning.tags,
      scope: learning.scope,
      effectiveness: learning.effectiveness,
      useCount: learning.useCount,
    };
  }

  private toTimelineEntry(learning: Learning): TimelineEntry {
    const timeline = this.buildActivityTimeline(learning);

    return {
      id: learning.id,
      title: learning.title,
      timestamp: learning.updatedAt,
      tags: learning.tags,
      scope: learning.scope,
      effectiveness: learning.effectiveness,
      useCount: learning.useCount,
      excerpt: learning.content.slice(0, 200) + (learning.content.length > 200 ? '...' : ''),
      frameworks: learning.frameworks,
      patterns: learning.patterns,
      sourceCount: learning.sourceObservations?.length ?? 0,
      lastUsed: learning.lastUsed,
      activityTimeline: timeline,
    };
  }

  private toDetailsEntry(learning: Learning): DetailsEntry {
    const timeline = this.buildActivityTimeline(learning);

    return {
      id: learning.id,
      title: learning.title,
      timestamp: learning.updatedAt,
      tags: learning.tags,
      scope: learning.scope,
      effectiveness: learning.effectiveness,
      useCount: learning.useCount,
      excerpt: learning.content.slice(0, 200) + (learning.content.length > 200 ? '...' : ''),
      frameworks: learning.frameworks,
      patterns: learning.patterns,
      sourceCount: learning.sourceObservations?.length ?? 0,
      lastUsed: learning.lastUsed,
      activityTimeline: timeline,
      content: learning.content,
      sourceObservations: learning.sourceObservations,
    };
  }

  private buildActivityTimeline(learning: Learning): ActivityPoint[] {
    const timeline: ActivityPoint[] = [];

    timeline.push({
      timestamp: learning.createdAt,
      type: 'created',
      description: `Learning created from ${learning.source}`,
    });

    if (learning.updatedAt !== learning.createdAt) {
      timeline.push({
        timestamp: learning.updatedAt,
        type: 'updated',
      });
    }

    if (learning.lastUsed) {
      timeline.push({
        timestamp: learning.lastUsed,
        type: 'used',
        description: `Used ${learning.useCount} times`,
      });
    }

    if (learning.effectiveness !== undefined) {
      timeline.push({
        timestamp: learning.updatedAt,
        type: 'rated',
        description: `Effectiveness: ${learning.effectiveness}%`,
      });
    }

    return timeline.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  private findRelevantIds(index: IndexEntry[], query: string, minRelevance: number = 0): string[] {
    const queryWords = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
    const scored: Array<{ id: string; score: number }> = [];

    for (const entry of index) {
      let score = 0;

      const titleWords = entry.title.toLowerCase().split(/\s+/);
      for (const qw of queryWords) {
        if (titleWords.some((tw) => tw.includes(qw))) {
          score += 10;
        }
      }

      const tags = entry.tags.map((t) => t.toLowerCase());
      for (const qw of queryWords) {
        if (tags.includes(qw)) {
          score += 20;
        }
      }

      score += (entry.effectiveness ?? 50) / 10;
      score += Math.min(entry.useCount * 2, 20);

      if (score >= minRelevance) {
        scored.push({ id: entry.id, score });
      }
    }

    return scored
      .sort((a, b) => b.score - a.score)
      .map((s) => s.id);
  }
}

/**
 * Create a progressive disclosure manager
 */
export function createProgressiveDisclosureManager(
  projectPath: string,
  projectName?: string
): ProgressiveDisclosureManager {
  return new ProgressiveDisclosureManager(projectPath, projectName);
}
