import { z } from 'zod';
import type { AgentType } from '../types.js';

/**
 * Format categories for skill translation
 */
export type FormatCategory =
  | 'skill-md'      // Category A: Standard SKILL.md (13 agents)
  | 'cursor-mdc'    // Category B: Cursor MDC format
  | 'markdown-rules' // Category C: Windsurf, GitHub Copilot
  | 'external';     // Category D: External systems (Devin, etc.)

/**
 * Mapping of agents to their format categories
 */
export const AGENT_FORMAT_MAP: Record<AgentType, FormatCategory> = {
  'claude-code': 'skill-md',
  'codex': 'skill-md',
  'gemini-cli': 'skill-md',
  'opencode': 'skill-md',
  'antigravity': 'skill-md',
  'amp': 'skill-md',
  'clawdbot': 'skill-md',
  'droid': 'skill-md',
  'goose': 'skill-md',
  'kilo': 'skill-md',
  'kiro-cli': 'skill-md',
  'roo': 'skill-md',
  'trae': 'skill-md',
  'universal': 'skill-md',
  'cursor': 'cursor-mdc',
  'windsurf': 'markdown-rules',
  'github-copilot': 'markdown-rules',
  'cline': 'skill-md',
  'codebuddy': 'skill-md',
  'commandcode': 'skill-md',
  'continue': 'skill-md',
  'crush': 'skill-md',
  'factory': 'skill-md',
  'mcpjam': 'skill-md',
  'mux': 'skill-md',
  'neovate': 'skill-md',
  'openhands': 'skill-md',
  'pi': 'skill-md',
  'qoder': 'skill-md',
  'qwen': 'skill-md',
  'vercel': 'skill-md',
  'zencoder': 'skill-md',
};

/**
 * Extended skill frontmatter for translation
 */
export const TranslatableSkillFrontmatter = z.object({
  name: z.string(),
  description: z.string(),
  version: z.string().optional(),
  author: z.string().optional(),
  license: z.string().optional(),
  tags: z.array(z.string()).optional(),
  compatibility: z.string().optional(),
  'allowed-tools': z.string().optional(),
  metadata: z.record(z.string()).optional(),
  // Cursor-specific fields
  globs: z.array(z.string()).optional(),
  alwaysApply: z.boolean().optional(),
  // Agent optimization hints
  agents: z.object({
    optimized: z.array(z.string()).optional(),
    compatible: z.array(z.string()).optional(),
  }).optional(),
});
export type TranslatableSkillFrontmatter = z.infer<typeof TranslatableSkillFrontmatter>;

/**
 * Canonical skill representation for translation
 */
export interface CanonicalSkill {
  /** Skill name (kebab-case) */
  name: string;
  /** Human-readable description */
  description: string;
  /** Version string */
  version?: string;
  /** Author name or handle */
  author?: string;
  /** License identifier */
  license?: string;
  /** Categorization tags */
  tags?: string[];
  /** Compatibility description */
  compatibility?: string;
  /** Allowed tools list */
  allowedTools?: string;
  /** Additional metadata */
  metadata?: Record<string, string>;
  /** Main content (markdown) */
  content: string;
  /** Original format this was parsed from */
  sourceFormat: FormatCategory;
  /** Source agent type */
  sourceAgent?: AgentType;
  /** Cursor-specific: glob patterns */
  globs?: string[];
  /** Cursor-specific: always apply flag */
  alwaysApply?: boolean;
  /** Agent optimization hints */
  agentHints?: {
    optimized?: string[];
    compatible?: string[];
  };
}

/**
 * Result of a translation operation
 */
export interface TranslationResult {
  /** Whether translation succeeded */
  success: boolean;
  /** Translated content */
  content: string;
  /** Output filename */
  filename: string;
  /** Warnings during translation */
  warnings: string[];
  /** Features that couldn't be translated */
  incompatible: string[];
  /** Target format */
  targetFormat: FormatCategory;
  /** Target agent */
  targetAgent: AgentType;
}

/**
 * Options for translation
 */
export interface TranslationOptions {
  /** Preserve original comments */
  preserveComments?: boolean;
  /** Add translation metadata */
  addMetadata?: boolean;
  /** Custom output filename */
  outputFilename?: string;
  /** For Cursor: glob patterns to include */
  globs?: string[];
  /** For Cursor: always apply setting */
  alwaysApply?: boolean;
}

/**
 * Interface for format-specific translators
 */
export interface FormatTranslator {
  /** Format this translator handles */
  readonly format: FormatCategory;
  /** Agents this translator is optimized for */
  readonly agents: AgentType[];

  /**
   * Parse content into canonical format
   */
  parse(content: string, filename?: string): CanonicalSkill | null;

  /**
   * Check if content matches this format
   */
  detect(content: string, filename?: string): boolean;

  /**
   * Generate content for target agent
   */
  generate(skill: CanonicalSkill, targetAgent: AgentType, options?: TranslationOptions): TranslationResult;

  /**
   * Get the expected filename for this format
   */
  getFilename(skillName: string, targetAgent: AgentType): string;
}

/**
 * Translation path between formats
 */
export interface TranslationPath {
  from: FormatCategory;
  to: FormatCategory;
  steps: FormatCategory[];
}
