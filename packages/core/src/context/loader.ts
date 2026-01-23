/**
 * Context Loader
 *
 * Smart context loading with token budgets and category-based loading.
 */

import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Context category with size limits
 */
export interface ContextCategory {
  /** Category name */
  name: string;
  /** Maximum tokens for this category */
  maxTokens: number;
  /** Whether to always load this category */
  alwaysLoad: boolean;
  /** File path (relative to project) */
  file?: string;
  /** Inline content */
  content?: string;
}

/**
 * Context loading options
 */
export interface ContextLoadOptions {
  /** Total token budget */
  totalBudget?: number;
  /** Categories to load (load all if not specified) */
  categories?: string[];
  /** Whether to warn when approaching budget limits */
  warnOnBudgetLimit?: boolean;
}

/**
 * Loaded context result
 */
export interface LoadedContext {
  /** All loaded content combined */
  content: string;
  /** Total tokens used */
  totalTokens: number;
  /** Budget remaining */
  budgetRemaining: number;
  /** Categories loaded */
  categoriesLoaded: string[];
  /** Categories skipped (due to budget or not found) */
  categoriesSkipped: string[];
  /** Warnings generated */
  warnings: string[];
  /** Whether budget is near limit (>50% used) */
  nearBudgetLimit: boolean;
  /** Whether context is degraded (>70% used) */
  contextDegraded: boolean;
}

/**
 * Default context categories
 */
export const DEFAULT_CONTEXT_CATEGORIES: ContextCategory[] = [
  {
    name: 'project',
    maxTokens: 2000,
    alwaysLoad: true,
    file: '.skillkit/context.yaml',
  },
  {
    name: 'requirements',
    maxTokens: 5000,
    alwaysLoad: false,
    file: 'REQUIREMENTS.md',
  },
  {
    name: 'decisions',
    maxTokens: 1000,
    alwaysLoad: false,
    file: '.skillkit/decisions.yaml',
  },
  {
    name: 'readme',
    maxTokens: 3000,
    alwaysLoad: false,
    file: 'README.md',
  },
];

/**
 * Rough estimate of tokens from text
 * (approximation: ~4 characters per token for English text)
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Context Loader class
 */
export class ContextLoader {
  private projectPath: string;
  private categories: ContextCategory[];
  private defaultBudget: number;

  constructor(projectPath: string, options?: { categories?: ContextCategory[]; defaultBudget?: number }) {
    this.projectPath = projectPath;
    this.categories = options?.categories || DEFAULT_CONTEXT_CATEGORIES;
    this.defaultBudget = options?.defaultBudget || 32000; // Default ~32k tokens
  }

  /**
   * Load context based on options
   */
  load(options: ContextLoadOptions = {}): LoadedContext {
    const totalBudget = options.totalBudget || this.defaultBudget;
    const requestedCategories = options.categories;

    const result: LoadedContext = {
      content: '',
      totalTokens: 0,
      budgetRemaining: totalBudget,
      categoriesLoaded: [],
      categoriesSkipped: [],
      warnings: [],
      nearBudgetLimit: false,
      contextDegraded: false,
    };

    const contentParts: string[] = [];

    // First pass: load alwaysLoad categories
    for (const category of this.categories) {
      if (!category.alwaysLoad) continue;
      if (requestedCategories && !requestedCategories.includes(category.name)) continue;

      this.loadCategory(category, result, contentParts, totalBudget);
    }

    // Second pass: load requested categories
    for (const category of this.categories) {
      if (category.alwaysLoad) continue; // Already loaded
      if (requestedCategories && !requestedCategories.includes(category.name)) continue;

      this.loadCategory(category, result, contentParts, totalBudget);
    }

    // Combine content
    result.content = contentParts.join('\n\n---\n\n');

    // Check budget status
    const usagePercent = (result.totalTokens / totalBudget) * 100;
    result.nearBudgetLimit = usagePercent >= 50;
    result.contextDegraded = usagePercent >= 70;

    // Add warnings for budget limits
    if (result.contextDegraded && options.warnOnBudgetLimit !== false) {
      result.warnings.push(
        `Context usage at ${Math.round(usagePercent)}% - quality may degrade. Consider spawning a fresh agent.`
      );
    } else if (result.nearBudgetLimit && options.warnOnBudgetLimit !== false) {
      result.warnings.push(`Context usage at ${Math.round(usagePercent)}% - approaching limit.`);
    }

    return result;
  }

  /**
   * Load a single category
   */
  private loadCategory(
    category: ContextCategory,
    result: LoadedContext,
    contentParts: string[],
    totalBudget: number
  ): void {
    let content: string | null = null;

    // Load from file
    if (category.file) {
      const filePath = join(this.projectPath, category.file);
      if (existsSync(filePath)) {
        try {
          content = readFileSync(filePath, 'utf-8');
        } catch {
          result.categoriesSkipped.push(category.name);
          return;
        }
      }
    }

    // Use inline content if no file
    if (!content && category.content) {
      content = category.content;
    }

    if (!content) {
      result.categoriesSkipped.push(category.name);
      return;
    }

    // Estimate tokens
    const tokens = estimateTokens(content);

    // Check category limit
    if (tokens > category.maxTokens) {
      // Truncate to category limit
      const truncateChars = category.maxTokens * 4;
      content = content.slice(0, truncateChars) + '\n\n[... content truncated ...]';
      result.warnings.push(
        `Category "${category.name}" truncated to ${category.maxTokens} tokens`
      );
    }

    // Check total budget
    const truncatedTokens = estimateTokens(content);
    if (result.totalTokens + truncatedTokens > totalBudget) {
      // Skip if would exceed budget
      result.categoriesSkipped.push(category.name);
      result.warnings.push(
        `Category "${category.name}" skipped - would exceed budget`
      );
      return;
    }

    // Add to result
    contentParts.push(`# ${category.name.toUpperCase()}\n\n${content}`);
    result.totalTokens += truncatedTokens;
    result.budgetRemaining = totalBudget - result.totalTokens;
    result.categoriesLoaded.push(category.name);
  }

  /**
   * Get category by name
   */
  getCategory(name: string): ContextCategory | undefined {
    return this.categories.find((c) => c.name === name);
  }

  /**
   * Add a custom category
   */
  addCategory(category: ContextCategory): void {
    const existing = this.categories.findIndex((c) => c.name === category.name);
    if (existing >= 0) {
      this.categories[existing] = category;
    } else {
      this.categories.push(category);
    }
  }

  /**
   * Remove a category
   */
  removeCategory(name: string): void {
    this.categories = this.categories.filter((c) => c.name !== name);
  }

  /**
   * Get estimated context size for categories
   */
  estimateSize(categoryNames?: string[]): { category: string; tokens: number; available: boolean }[] {
    const estimates: { category: string; tokens: number; available: boolean }[] = [];

    for (const category of this.categories) {
      if (categoryNames && !categoryNames.includes(category.name)) continue;

      let tokens = 0;
      let available = false;

      if (category.file) {
        const filePath = join(this.projectPath, category.file);
        if (existsSync(filePath)) {
          try {
            const stat = statSync(filePath);
            tokens = Math.ceil(stat.size / 4); // Rough estimate
            available = true;
          } catch {
            // File not accessible
          }
        }
      } else if (category.content) {
        tokens = estimateTokens(category.content);
        available = true;
      }

      estimates.push({
        category: category.name,
        tokens: Math.min(tokens, category.maxTokens),
        available,
      });
    }

    return estimates;
  }

  /**
   * Check if context would exceed budget threshold
   */
  wouldExceedThreshold(additionalTokens: number, threshold: number = 0.7): boolean {
    const currentTokens = this.load().totalTokens;
    const newTotal = currentTokens + additionalTokens;
    return newTotal / this.defaultBudget > threshold;
  }

  /**
   * Suggest spawning fresh agent if context is degraded
   */
  shouldSpawnFreshAgent(): { should: boolean; reason?: string } {
    const context = this.load();

    if (context.contextDegraded) {
      return {
        should: true,
        reason: `Context at ${Math.round((context.totalTokens / this.defaultBudget) * 100)}% capacity`,
      };
    }

    return { should: false };
  }
}

/**
 * Create a context loader
 */
export function createContextLoader(
  projectPath: string,
  options?: { categories?: ContextCategory[]; defaultBudget?: number }
): ContextLoader {
  return new ContextLoader(projectPath, options);
}
