/**
 * Unicode symbols and agent logos for SkillKit TUI
 * Monochromatic design system for terminal display
 */

/**
 * Agent logo definitions with monochromatic icons
 */
export interface AgentLogo {
  icon: string;
  name: string;
  company: string;
}

/**
 * All 32 supported agents with monochromatic Unicode logos
 */
export const AGENT_LOGOS: Record<string, AgentLogo> = {
  'claude-code': { icon: '⟁', name: 'Claude Code', company: 'Anthropic' },
  'cursor': { icon: '◫', name: 'Cursor', company: 'Anysphere' },
  'codex': { icon: '◎', name: 'Codex CLI', company: 'OpenAI' },
  'gemini-cli': { icon: '✦', name: 'Gemini CLI', company: 'Google' },
  'opencode': { icon: '⬡', name: 'OpenCode', company: 'SST' },
  'github-copilot': { icon: '◈', name: 'Copilot', company: 'GitHub' },
  'windsurf': { icon: '≋', name: 'Windsurf', company: 'Codeium' },
  'droid': { icon: '▣', name: 'Droid', company: 'Factory' },
  'goose': { icon: '◇', name: 'Goose', company: 'Block' },
  'amp': { icon: '△', name: 'Amp', company: 'Sourcegraph' },
  'kilo': { icon: '◉', name: 'Kilo Code', company: '' },
  'kiro-cli': { icon: '⬢', name: 'Kiro', company: 'AWS' },
  'roo': { icon: '⊙', name: 'Roo Code', company: '' },
  'trae': { icon: '◆', name: 'Trae', company: 'ByteDance' },
  'antigravity': { icon: '⊛', name: 'Antigravity', company: '' },
  'clawdbot': { icon: '⟐', name: 'Clawdbot', company: '' },
  'cline': { icon: '⊕', name: 'Cline', company: '' },
  'codebuddy': { icon: '⊗', name: 'CodeBuddy', company: '' },
  'commandcode': { icon: '⊘', name: 'CommandCode', company: '' },
  'continue': { icon: '⊞', name: 'Continue', company: '' },
  'crush': { icon: '⊟', name: 'Crush', company: '' },
  'factory': { icon: '⊠', name: 'Factory', company: '' },
  'mcpjam': { icon: '⊡', name: 'MCPJam', company: '' },
  'mux': { icon: '⊢', name: 'Mux', company: '' },
  'neovate': { icon: '⊣', name: 'Neovate', company: '' },
  'openhands': { icon: '⊤', name: 'OpenHands', company: '' },
  'pi': { icon: '⊥', name: 'Pi', company: '' },
  'qoder': { icon: '⊦', name: 'Qoder', company: '' },
  'qwen': { icon: '⊧', name: 'Qwen', company: 'Alibaba' },
  'vercel': { icon: '▲', name: 'Vercel', company: 'Vercel' },
  'zencoder': { icon: '⊩', name: 'Zencoder', company: '' },
  'universal': { icon: '●', name: 'Universal', company: '' },
} as const;

/**
 * UI symbols for status and navigation
 */
export const symbols = {
  // Navigation
  pointer: '▸',
  pointerInactive: ' ',
  bullet: '●',
  bulletEmpty: '○',

  // Status
  success: '✓',
  error: '✗',
  warning: '⚠',
  info: 'ℹ',
  pending: '○',
  active: '●',
  synced: '●',

  // Progress
  progressFilled: '█',
  progressEmpty: '░',

  // Spinner frames
  spinner: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'] as const,

  // Arrows
  arrowUp: '↑',
  arrowDown: '↓',
  arrowLeft: '←',
  arrowRight: '→',

  // Decorative
  diamond: '◆',
  diamondEmpty: '◇',
  star: '★',
  starEmpty: '☆',

  // Box drawing
  horizontalLine: '─',
  verticalLine: '│',
  topLeft: '┌',
  topRight: '┐',
  bottomLeft: '└',
  bottomRight: '┘',

  // Brand
  brandIcon: '◆',
} as const;

export type SymbolName = keyof typeof symbols;

/**
 * Get agent logo by agent type ID
 */
export function getAgentLogo(agentType: string): AgentLogo | undefined {
  return AGENT_LOGOS[agentType];
}

/**
 * Get all agent types
 */
export function getAgentTypes(): string[] {
  return Object.keys(AGENT_LOGOS);
}

/**
 * Get formatted agent display string (icon + name)
 */
export function formatAgentDisplay(agentType: string): string {
  const logo = AGENT_LOGOS[agentType];
  if (!logo) return agentType;
  return `${logo.icon} ${logo.name}`;
}
