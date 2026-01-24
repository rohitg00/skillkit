/**
 * Glob Pattern System
 *
 * Implements file pattern matching for file-scoped skills.
 */

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
   * Convert glob pattern to regex
   *
   * Uses a tokenization approach to avoid conflicts between glob wildcards
   * and regex special characters in replacement strings.
   */
  private patternToRegex(pattern: string): RegExp {
    // Handle negation
    const isNegated = pattern.startsWith('!');
    const cleanPattern = isNegated ? pattern.slice(1) : pattern;

    // Tokenize the pattern: split into segments handling **, *, ?, and literals
    const tokens: string[] = [];
    let i = 0;

    while (i < cleanPattern.length) {
      if (cleanPattern[i] === '*') {
        if (cleanPattern[i + 1] === '*') {
          // Handle **
          if (cleanPattern[i + 2] === '/') {
            // **/ pattern
            tokens.push('**/');
            i += 3;
          } else if (i > 0 && cleanPattern[i - 1] === '/') {
            // /** pattern (already consumed /)
            tokens.push('**');
            i += 2;
          } else {
            tokens.push('**');
            i += 2;
          }
        } else {
          tokens.push('*');
          i += 1;
        }
      } else if (cleanPattern[i] === '?') {
        tokens.push('?');
        i += 1;
      } else {
        // Literal character - collect consecutive literals
        let literal = '';
        while (i < cleanPattern.length &&
               cleanPattern[i] !== '*' &&
               cleanPattern[i] !== '?') {
          literal += cleanPattern[i];
          i += 1;
        }
        tokens.push(literal);
      }
    }

    // Convert tokens to regex parts
    const regexParts: string[] = [];

    for (let t = 0; t < tokens.length; t++) {
      const token = tokens[t];

      if (token === '**/') {
        // **/ matches zero or more path segments with trailing /
        // At start: any prefix or nothing
        // In middle: any directories
        if (t === 0) {
          regexParts.push('(?:[^/]+/)*');
        } else {
          regexParts.push('(?:[^/]+/)*');
        }
      } else if (token === '**') {
        // ** matches any path (including /)
        regexParts.push('.*');
      } else if (token === '*') {
        // * matches any character except /
        regexParts.push('[^/]*');
      } else if (token === '?') {
        // ? matches single character except /
        regexParts.push('[^/]');
      } else {
        // Literal - escape regex special characters
        const escaped = token.replace(/[.+^${}()|[\]\\]/g, '\\$&');
        regexParts.push(escaped);
      }
    }

    let regexPattern = regexParts.join('');

    // Handle directory matching
    if (this.config.matchDirectories) {
      regexPattern = `${regexPattern}(?:/.*)?`;
    }

    return new RegExp(`^${regexPattern}$`);
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
