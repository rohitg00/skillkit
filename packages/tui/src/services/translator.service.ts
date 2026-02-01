export type AgentType =
  | 'claude-code'
  | 'cursor'
  | 'windsurf'
  | 'github-copilot'
  | 'codex'
  | 'gemini-cli'
  | 'opencode'
  | 'universal'
  | 'antigravity'
  | 'amp'
  | 'clawdbot'
  | 'droid'
  | 'goose'
  | 'kilo'
  | 'kiro-cli'
  | 'roo'
  | 'trae'
  | 'cline'
  | 'codebuddy'
  | 'commandcode'
  | 'continue'
  | 'crush'
  | 'factory'
  | 'mcpjam'
  | 'mux'
  | 'neovate'
  | 'openhands'
  | 'pi'
  | 'qoder'
  | 'qwen'
  | 'vercel'
  | 'zencoder';

export interface TranslationDisplay {
  sourceFormat: string;
  targetAgent: AgentType;
  success: boolean;
  content: string;
  filename?: string;
  warnings: string[];
  incompatible: string[];
}

export interface TranslationOptions {
  sourceFilename?: string;
  preserveMetadata?: boolean;
}

export interface CanonicalSkill {
  id: string;
  name: string;
  description?: string;
  content: string;
  metadata?: Record<string, unknown>;
}

export interface TranslatorServiceState {
  supportedAgents: AgentType[];
  sourceAgent: AgentType | null;
  targetAgent: AgentType | null;
  skill: CanonicalSkill | null;
  result: TranslationDisplay | null;
  loading: boolean;
  error: string | null;
}

export function getSupportedAgents(): AgentType[] {
  return [
    'claude-code',
    'cursor',
    'windsurf',
    'github-copilot',
    'codex',
    'gemini-cli',
    'opencode',
    'universal',
  ];
}

export function checkCanTranslate(_from: AgentType, _to: AgentType): boolean {
  return true;
}

export function translate(
  _content: string,
  targetAgent: AgentType,
  options?: TranslationOptions
): TranslationDisplay {
  return {
    sourceFormat: options?.sourceFilename || 'SKILL.md',
    targetAgent,
    success: true,
    content: '',
    filename: undefined,
    warnings: [],
    incompatible: [],
  };
}

export function translateFromFile(
  sourcePath: string,
  targetAgent: AgentType,
  _options?: TranslationOptions
): TranslationDisplay {
  return {
    sourceFormat: sourcePath,
    targetAgent,
    success: true,
    content: '',
    filename: undefined,
    warnings: [],
    incompatible: [],
  };
}

export function parseSkill(_content: string, _filename?: string): CanonicalSkill | null {
  return null;
}

export function detectFormat(_content: string, _filename?: string): string | null {
  return 'markdown';
}

export function previewTranslation(
  _content: string,
  _targetAgent: AgentType
): { preview: string; compatible: boolean; issues: string[] } {
  return {
    preview: '',
    compatible: true,
    issues: [],
  };
}

export function getAgentFormatInfo(agent: AgentType): {
  extension: string;
  formatName: string;
  description: string;
} {
  const formatMap: Record<string, { extension: string; formatName: string; description: string }> = {
    'claude-code': { extension: '.md', formatName: 'SKILL.md', description: 'Claude Code skills format' },
    cursor: { extension: '.mdc', formatName: 'MDC', description: 'Cursor rules format' },
    windsurf: { extension: '.md', formatName: 'Markdown', description: 'Windsurf rules format' },
    'github-copilot': { extension: '.md', formatName: 'Markdown', description: 'GitHub Copilot instructions' },
    codex: { extension: '.md', formatName: 'Markdown', description: 'Codex instructions' },
    'gemini-cli': { extension: '.md', formatName: 'Markdown', description: 'Gemini CLI instructions' },
    opencode: { extension: '.md', formatName: 'Markdown', description: 'OpenCode instructions' },
    universal: { extension: '.md', formatName: 'SKILL.md', description: 'Universal skill format' },
  };

  return formatMap[agent] || { extension: '.md', formatName: 'Markdown', description: 'Unknown format' };
}

export const translatorService = {
  getSupportedAgents,
  checkCanTranslate,
  translate,
  translateFromFile,
  parseSkill,
  detectFormat,
  previewTranslation,
  getAgentFormatInfo,
};
