import { z } from 'zod';

export const AgentType = z.enum([
  'claude-code',
  'codex',
  'cursor',
  'antigravity',
  'opencode',
  'gemini-cli',
  'amp',
  'clawdbot',
  'droid',
  'github-copilot',
  'goose',
  'kilo',
  'kiro-cli',
  'roo',
  'trae',
  'windsurf',
  'universal',
  'cline',
  'codebuddy',
  'commandcode',
  'continue',
  'crush',
  'factory',
  'mcpjam',
  'mux',
  'neovate',
  'openhands',
  'pi',
  'qoder',
  'qwen',
  'vercel',
  'zencoder',
]);
export type AgentType = z.infer<typeof AgentType>;

export const GitProvider = z.enum(['github', 'gitlab', 'bitbucket', 'local']);
export type GitProvider = z.infer<typeof GitProvider>;

export const SkillFrontmatter = z.object({
  name: z.string()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Skill name must be lowercase alphanumeric with hyphens, no leading/trailing/consecutive hyphens'),
  description: z.string().min(1).max(1024),
  license: z.string().optional(),
  compatibility: z.string().max(500).optional(),
  metadata: z.record(z.string()).optional(),
  'allowed-tools': z.string().optional(),
  version: z.string().optional(),
  author: z.string().optional(),
  tags: z.array(z.string()).optional(),
  agents: z.array(AgentType).optional(),
});
export type SkillFrontmatter = z.infer<typeof SkillFrontmatter>;

export const SkillMetadata = z.object({
  name: z.string(),
  description: z.string(),
  source: z.string(),
  sourceType: GitProvider,
  subpath: z.string().optional(),
  installedAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
  enabled: z.boolean().default(true),
  version: z.string().optional(),
  checksum: z.string().optional(),
});
export type SkillMetadata = z.infer<typeof SkillMetadata>;

export const SkillLocation = z.enum(['project', 'global']);
export type SkillLocation = z.infer<typeof SkillLocation>;

export const Skill = z.object({
  name: z.string(),
  description: z.string(),
  path: z.string(),
  location: SkillLocation,
  metadata: SkillMetadata.optional(),
  enabled: z.boolean().default(true),
});
export type Skill = z.infer<typeof Skill>;

export const SkillkitConfig = z.object({
  version: z.literal(1),
  agent: AgentType.default('universal'),
  skillsDir: z.string().optional(),
  enabledSkills: z.array(z.string()).optional(),
  disabledSkills: z.array(z.string()).optional(),
  autoSync: z.boolean().default(true),
  cacheDir: z.string().optional(),
  marketplaceSources: z.array(z.string()).optional(),
  defaultTimeout: z.number().optional(),
});
export type SkillkitConfig = z.infer<typeof SkillkitConfig>;

export interface InstallOptions {
  global?: boolean;
  skills?: string[];
  provider?: GitProvider;
  yes?: boolean;
  force?: boolean;
}

export interface SyncOptions {
  output?: string;
  agent?: AgentType;
  yes?: boolean;
  enabledOnly?: boolean;
}

export interface UpdateOptions {
  skills?: string[];
  all?: boolean;
  force?: boolean;
}

export interface RegistrySkill {
  name: string;
  description: string;
  source: string;
  provider: GitProvider;
  downloads?: number;
  stars?: number;
  tags?: string[];
}

export interface DiscoveredSkill {
  name: string;
  dirName: string;
  path: string;
}

export interface CloneResult {
  success: boolean;
  path?: string;
  tempRoot?: string;
  error?: string;
  skills?: string[];
  discoveredSkills?: DiscoveredSkill[];
}

export interface CommandResult {
  success: boolean;
  message: string;
  data?: unknown;
}

// Agent adapter interface (used by agents package)
export interface AgentAdapterInfo {
  type: AgentType;
  name: string;
  skillsDir: string;
  configFile: string;
}
