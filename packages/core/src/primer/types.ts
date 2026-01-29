import { z } from 'zod';
import type { AgentType } from '../types.js';
import { ProjectStack, ProjectPatterns, Detection } from '../context/types.js';

export const PrimerLanguage = z.enum([
  'typescript',
  'javascript',
  'python',
  'go',
  'rust',
  'java',
  'kotlin',
  'swift',
  'ruby',
  'php',
  'csharp',
  'cpp',
]);
export type PrimerLanguage = z.infer<typeof PrimerLanguage>;

export const PackageManager = z.enum([
  'npm',
  'pnpm',
  'yarn',
  'bun',
  'pip',
  'poetry',
  'uv',
  'cargo',
  'go',
  'maven',
  'gradle',
  'composer',
  'bundler',
  'cocoapods',
  'swift-package-manager',
  'nuget',
]);
export type PackageManager = z.infer<typeof PackageManager>;

export const CodeConvention = z.object({
  namingStyle: z.enum(['camelCase', 'snake_case', 'PascalCase', 'kebab-case']).optional(),
  indentation: z.enum(['tabs', 'spaces-2', 'spaces-4']).optional(),
  quotes: z.enum(['single', 'double']).optional(),
  semicolons: z.boolean().optional(),
  trailingCommas: z.enum(['none', 'es5', 'all']).optional(),
  maxLineLength: z.number().optional(),
});
export type CodeConvention = z.infer<typeof CodeConvention>;

export const ProjectStructure = z.object({
  type: z.enum(['flat', 'src-based', 'monorepo', 'packages']).optional(),
  srcDir: z.string().optional(),
  testDir: z.string().optional(),
  docsDir: z.string().optional(),
  configDir: z.string().optional(),
  hasWorkspaces: z.boolean().default(false),
  workspaces: z.array(z.string()).optional(),
});
export type ProjectStructure = z.infer<typeof ProjectStructure>;

export const CIConfig = z.object({
  provider: z.enum(['github-actions', 'gitlab-ci', 'circleci', 'jenkins', 'travis', 'azure-pipelines']).optional(),
  hasCI: z.boolean().default(false),
  hasCD: z.boolean().default(false),
  configFile: z.string().optional(),
});
export type CIConfig = z.infer<typeof CIConfig>;

export const EnvConfig = z.object({
  hasEnvFile: z.boolean().default(false),
  hasEnvExample: z.boolean().default(false),
  envVariables: z.array(z.string()).optional(),
});
export type EnvConfig = z.infer<typeof EnvConfig>;

export const DockerConfig = z.object({
  hasDockerfile: z.boolean().default(false),
  hasCompose: z.boolean().default(false),
  baseImage: z.string().optional(),
});
export type DockerConfig = z.infer<typeof DockerConfig>;

export const PrimerAnalysis = z.object({
  project: z.object({
    name: z.string(),
    description: z.string().optional(),
    version: z.string().optional(),
    type: z.string().optional(),
    license: z.string().optional(),
    repository: z.string().optional(),
  }),
  languages: z.array(Detection).default([]),
  packageManagers: z.array(PackageManager).default([]),
  stack: ProjectStack,
  patterns: ProjectPatterns.optional(),
  structure: ProjectStructure.optional(),
  conventions: CodeConvention.optional(),
  ci: CIConfig.optional(),
  env: EnvConfig.optional(),
  docker: DockerConfig.optional(),
  buildCommands: z.object({
    install: z.string().optional(),
    build: z.string().optional(),
    test: z.string().optional(),
    lint: z.string().optional(),
    format: z.string().optional(),
    dev: z.string().optional(),
    start: z.string().optional(),
  }).optional(),
  importantFiles: z.array(z.string()).default([]),
  codebaseSize: z.object({
    files: z.number().optional(),
    lines: z.number().optional(),
    directories: z.number().optional(),
  }).optional(),
});
export type PrimerAnalysis = z.infer<typeof PrimerAnalysis>;

export interface PrimerOptions {
  projectPath?: string;
  agents?: AgentType[];
  allAgents?: boolean;
  outputDir?: string;
  dryRun?: boolean;
  analyzeOnly?: boolean;
  verbose?: boolean;
  includeExamples?: boolean;
  customInstructions?: string;
}

export interface GeneratedInstruction {
  agent: AgentType;
  filename: string;
  filepath: string;
  content: string;
  format: 'markdown' | 'json' | 'mdc' | 'xml';
}

export interface PrimerResult {
  success: boolean;
  analysis: PrimerAnalysis;
  generated: GeneratedInstruction[];
  warnings: string[];
  errors: string[];
}

export interface AgentInstructionTemplate {
  agent: AgentType;
  filename: string;
  format: 'markdown' | 'json' | 'mdc' | 'xml';
  header?: string;
  footer?: string;
  sectionOrder: string[];
}

export const AGENT_INSTRUCTION_TEMPLATES: Record<string, AgentInstructionTemplate> = {
  'claude-code': {
    agent: 'claude-code',
    filename: 'CLAUDE.md',
    format: 'markdown',
    sectionOrder: ['overview', 'stack', 'commands', 'conventions', 'structure', 'guidelines'],
  },
  'cursor': {
    agent: 'cursor',
    filename: '.cursorrules',
    format: 'markdown',
    sectionOrder: ['overview', 'stack', 'conventions', 'guidelines'],
  },
  'github-copilot': {
    agent: 'github-copilot',
    filename: '.github/copilot-instructions.md',
    format: 'markdown',
    sectionOrder: ['overview', 'stack', 'commands', 'conventions', 'structure', 'guidelines'],
  },
  'codex': {
    agent: 'codex',
    filename: 'AGENTS.md',
    format: 'markdown',
    sectionOrder: ['overview', 'stack', 'commands', 'conventions', 'structure', 'guidelines'],
  },
  'gemini-cli': {
    agent: 'gemini-cli',
    filename: 'GEMINI.md',
    format: 'markdown',
    sectionOrder: ['overview', 'stack', 'commands', 'conventions', 'structure', 'guidelines'],
  },
  'windsurf': {
    agent: 'windsurf',
    filename: '.windsurfrules',
    format: 'markdown',
    sectionOrder: ['overview', 'stack', 'conventions', 'guidelines'],
  },
  'opencode': {
    agent: 'opencode',
    filename: 'AGENTS.md',
    format: 'markdown',
    sectionOrder: ['overview', 'stack', 'commands', 'conventions', 'structure', 'guidelines'],
  },
  'trae': {
    agent: 'trae',
    filename: '.trae/rules/project_rules.md',
    format: 'markdown',
    sectionOrder: ['overview', 'stack', 'commands', 'conventions', 'guidelines'],
  },
};
