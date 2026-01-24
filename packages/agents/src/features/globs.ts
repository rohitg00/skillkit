/**
 * Glob Pattern System
 *
 * Implements file pattern matching for file-scoped skills.
 */

import { minimatch } from 'minimatch';
import type { GlobConfig } from './types.js';

/**
 * GlobMatcher - Match files against glob patterns
 */
export class GlobMatcher {
  private config: GlobConfig;
  private includePatterns: RegExp[];
  private excludePatterns: RegExp[];

  constructor(config: GlobConfig) {
    this.config = config;
    this.includePatterns = config.include.map((p) => this.patternToRegex(p));
    this.excludePatterns = (config.exclude || []).map((p) => this.patternToRegex(p));
  }

  /**
   * Check if a file matches the glob patterns
   */
  matches(filePath: string): boolean {
    // Normalize path separators
    const normalizedPath = filePath.replace(/\\/g, '/');

    // Check if hidden file and skip if not matching hidden
    if (!this.config.matchHidden && this.isHiddenFile(normalizedPath)) {
      return false;
    }

    // Check exclude patterns first
    for (const pattern of this.excludePatterns) {
      if (pattern.test(normalizedPath)) {
        return false;
      }
    }

    // Check include patterns
    for (const pattern of this.includePatterns) {
      if (pattern.test(normalizedPath)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Filter a list of files
   */
  filter(filePaths: string[]): string[] {
    return filePaths.filter((p) => this.matches(p));
  }

  /**
   * Get all include patterns
   */
  getIncludePatterns(): string[] {
    return [...this.config.include];
  }

  /**
   * Get all exclude patterns
   */
  getExcludePatterns(): string[] {
    return [...(this.config.exclude || [])];
  }

  /**
   * Add an include pattern
   */
  addInclude(pattern: string): void {
    this.config.include.push(pattern);
    this.includePatterns.push(this.patternToRegex(pattern));
  }

  /**
   * Add an exclude pattern
   */
  addExclude(pattern: string): void {
    if (!this.config.exclude) {
      this.config.exclude = [];
    }
    this.config.exclude.push(pattern);
    this.excludePatterns.push(this.patternToRegex(pattern));
  }

  /**
   * Convert glob pattern to regex using minimatch
   *
   * Uses the battle-tested minimatch library to avoid ReDoS vulnerabilities
   * and ensure consistent glob matching behavior.
   */
  private patternToRegex(pattern: string): RegExp {
    // Handle negation
    const isNegated = pattern.startsWith('!');
    const cleanPattern = isNegated ? pattern.slice(1) : pattern;

    // Adjust pattern for directory matching
    let adjustedPattern = cleanPattern;
    if (this.config.matchDirectories && !cleanPattern.endsWith('/**')) {
      // Append /** to match directories and their contents
      adjustedPattern = cleanPattern.endsWith('/')
        ? `${cleanPattern}**`
        : `${cleanPattern}/**`;
    }

    // Use minimatch to create a safe regex
    // minimatch returns null if pattern is invalid, fallback to match-nothing regex
    const regex = minimatch.makeRe(adjustedPattern, { dot: this.config.matchHidden });

    return regex || /(?!)/; // /(?!)/ is a regex that never matches anything
  }

  /**
   * Check if file is hidden (starts with .)
   */
  private isHiddenFile(path: string): boolean {
    const parts = path.split('/');
    return parts.some((part) => part.startsWith('.') && part !== '.' && part !== '..');
  }

  /**
   * Generate Cursor-compatible globs field
   */
  generateCursorGlobs(): string[] {
    const globs: string[] = [...this.config.include];

    // Add negated exclude patterns
    if (this.config.exclude) {
      for (const pattern of this.config.exclude) {
        globs.push(`!${pattern}`);
      }
    }

    return globs;
  }

  /**
   * Generate MDC frontmatter
   */
  generateMDCFrontmatter(): string {
    const globs = this.generateCursorGlobs();
    return `globs: ${JSON.stringify(globs)}`;
  }
}

/**
 * Create a GlobMatcher instance
 */
export function createGlobMatcher(config: GlobConfig): GlobMatcher {
  return new GlobMatcher(config);
}

/**
 * Create a GlobMatcher from a single pattern
 */
export function matchPattern(pattern: string): GlobMatcher {
  return new GlobMatcher({ include: [pattern] });
}

/**
 * Parse glob patterns from Cursor MDC format
 */
export function parseGlobsFromMDC(content: string): GlobConfig | null {
  const match = content.match(/globs:\s*(\[.*?\])/s);
  if (!match) {
    return null;
  }

  try {
    const patterns = JSON.parse(match[1]) as string[];
    const include: string[] = [];
    const exclude: string[] = [];

    for (const pattern of patterns) {
      if (pattern.startsWith('!')) {
        exclude.push(pattern.slice(1));
      } else {
        include.push(pattern);
      }
    }

    return { include, exclude };
  } catch {
    return null;
  }
}

/**
 * Common glob patterns for different file types
 */
export const COMMON_PATTERNS = {
  /** All TypeScript files */
  typescript: ['**/*.ts', '**/*.tsx'],
  /** All JavaScript files */
  javascript: ['**/*.js', '**/*.jsx', '**/*.mjs', '**/*.cjs'],
  /** All test files */
  tests: ['**/*.test.*', '**/*.spec.*', '**/__tests__/**'],
  /** All config files */
  configs: ['*.config.*', '*rc', '*rc.*', '*.json', '*.yaml', '*.yml'],
  /** All source files */
  source: ['src/**/*'],
  /** All documentation */
  docs: ['**/*.md', 'docs/**/*', 'README*'],
  /** Node modules (usually excluded) */
  nodeModules: ['**/node_modules/**'],
  /** Build outputs (usually excluded) */
  buildOutputs: ['**/dist/**', '**/build/**', '**/.next/**'],
  /** All files */
  all: ['**/*'],
} as const;

/**
 * Create glob config from common pattern names
 */
export function fromCommonPatterns(
  includeNames: (keyof typeof COMMON_PATTERNS)[],
  excludeNames?: (keyof typeof COMMON_PATTERNS)[]
): GlobConfig {
  const include: string[] = [];
  const exclude: string[] = [];

  for (const name of includeNames) {
    include.push(...COMMON_PATTERNS[name]);
  }

  if (excludeNames) {
    for (const name of excludeNames) {
      exclude.push(...COMMON_PATTERNS[name]);
    }
  }

  return { include, exclude };
}
