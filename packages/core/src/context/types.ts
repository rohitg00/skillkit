import { z } from 'zod';
import type { AgentType } from '../types.js';

/**
 * Detected dependency with version
 */
export const DependencyInfo = z.object({
  name: z.string(),
  version: z.string().optional(),
  dev: z.boolean().default(false),
});
export type DependencyInfo = z.infer<typeof DependencyInfo>;

/**
 * Detection result with confidence
 */
export const Detection = z.object({
  name: z.string(),
  version: z.string().optional(),
  confidence: z.number().min(0).max(100).default(100),
  source: z.string().optional(), // Where it was detected from
});
export type Detection = z.infer<typeof Detection>;

/**
 * Project stack detection results
 */
export const ProjectStack = z.object({
  languages: z.array(Detection).default([]),
  frameworks: z.array(Detection).default([]),
  libraries: z.array(Detection).default([]),
  styling: z.array(Detection).default([]),
  testing: z.array(Detection).default([]),
  databases: z.array(Detection).default([]),
  tools: z.array(Detection).default([]),
  runtime: z.array(Detection).default([]),
});
export type ProjectStack = z.infer<typeof ProjectStack>;

/**
 * Project patterns and conventions
 */
export const ProjectPatterns = z.object({
  components: z.string().optional(), // 'functional', 'class', 'mixed'
  stateManagement: z.string().optional(), // 'redux', 'zustand', 'context', etc.
  apiStyle: z.string().optional(), // 'rest', 'graphql', 'trpc', 'server-actions'
  styling: z.string().optional(), // 'css-modules', 'tailwind', 'styled-components'
  testing: z.string().optional(), // 'jest', 'vitest', 'playwright'
  linting: z.string().optional(), // 'eslint', 'biome'
  formatting: z.string().optional(), // 'prettier', 'biome'
});
export type ProjectPatterns = z.infer<typeof ProjectPatterns>;

/**
 * Skill preferences for the project
 */
export const SkillPreferences = z.object({
  installed: z.array(z.string()).default([]),
  recommended: z.array(z.string()).default([]),
  excluded: z.array(z.string()).default([]),
  autoSync: z.boolean().default(true),
  securityLevel: z.enum(['low', 'medium', 'high']).default('medium'),
  testingRequired: z.boolean().default(false),
});
export type SkillPreferences = z.infer<typeof SkillPreferences>;

/**
 * Agent configuration for the project
 */
export const AgentConfig = z.object({
  primary: z.string().optional(), // Primary agent
  detected: z.array(z.string()).default([]), // Auto-detected agents
  synced: z.array(z.string()).default([]), // Agents to sync skills to
  disabled: z.array(z.string()).default([]), // Agents to skip
});
export type AgentConfig = z.infer<typeof AgentConfig>;

/**
 * Full project context
 */
export const ProjectContext = z.object({
  version: z.literal(1),
  project: z.object({
    name: z.string(),
    description: z.string().optional(),
    type: z.string().optional(), // 'web-app', 'cli', 'library', 'api', etc.
    path: z.string().optional(),
  }),
  stack: ProjectStack,
  patterns: ProjectPatterns.optional(),
  skills: SkillPreferences.optional(),
  agents: AgentConfig.optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});
export type ProjectContext = z.infer<typeof ProjectContext>;

/**
 * Context file location
 */
export const CONTEXT_FILE = '.skillkit/context.yaml';
export const CONTEXT_DIR = '.skillkit';

/**
 * Detection source types
 */
export type DetectionSource =
  | 'package.json'
  | 'tsconfig.json'
  | 'pyproject.toml'
  | 'Cargo.toml'
  | 'go.mod'
  | 'pubspec.yaml'
  | 'folder-structure'
  | 'config-file'
  | 'manual';

/**
 * Project type hints based on detection
 */
export const PROJECT_TYPE_HINTS: Record<string, string[]> = {
  'web-app': ['react', 'vue', 'angular', 'svelte', 'nextjs', 'nuxt', 'remix'],
  'api': ['express', 'fastify', 'koa', 'hono', 'fastapi', 'flask', 'django'],
  'cli': ['commander', 'yargs', 'clipanion', 'clap', 'cobra'],
  'library': ['rollup', 'esbuild', 'tsup', 'unbuild'],
  'mobile': ['react-native', 'expo', 'flutter', 'ionic'],
  'desktop': ['electron', 'tauri'],
};

/**
 * Framework detection patterns
 */
export interface FrameworkPattern {
  name: string;
  indicators: {
    dependencies?: string[];
    devDependencies?: string[];
    files?: string[];
    configFiles?: string[];
  };
  category: keyof ProjectStack;
  relatedTags?: string[];
}

/**
 * Context sync options
 */
export interface ContextSyncOptions {
  agents?: AgentType[];
  force?: boolean;
  dryRun?: boolean;
  skillsOnly?: boolean;
}

/**
 * Context export options
 */
export interface ContextExportOptions {
  output?: string;
  format?: 'yaml' | 'json';
  includeSkills?: boolean;
  includeAgents?: boolean;
}

/**
 * Context import options
 */
export interface ContextImportOptions {
  merge?: boolean;
  overwrite?: boolean;
  skipDetection?: boolean;
}
