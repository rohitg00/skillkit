import type { AgentAdapter } from './base.js';
import type { AgentType } from '@skillkit/core';
import { ClaudeCodeAdapter } from './claude-code.js';
import { CursorAdapter } from './cursor.js';
import { CodexAdapter } from './codex.js';
import { GeminiCliAdapter } from './gemini-cli.js';
import { OpenCodeAdapter } from './opencode.js';
import { AntigravityAdapter } from './antigravity.js';
import { AmpAdapter } from './amp.js';
import { ClawdbotAdapter } from './clawdbot.js';
import { DroidAdapter } from './droid.js';
import { FactoryAdapter } from './factory.js';
import { GitHubCopilotAdapter } from './github-copilot.js';
import { GooseAdapter } from './goose.js';
import { KiloAdapter } from './kilo.js';
import { KiroCliAdapter } from './kiro-cli.js';
import { RooAdapter } from './roo.js';
import { TraeAdapter } from './trae.js';
import { WindsurfAdapter } from './windsurf.js';
import { UniversalAdapter } from './universal.js';

export * from './base.js';
export * from './claude-code.js';
export * from './cursor.js';
export * from './codex.js';
export * from './gemini-cli.js';
export * from './opencode.js';
export * from './antigravity.js';
export * from './amp.js';
export * from './clawdbot.js';
export * from './droid.js';
export * from './factory.js';
export * from './github-copilot.js';
export * from './goose.js';
export * from './kilo.js';
export * from './kiro-cli.js';
export * from './roo.js';
export * from './trae.js';
export * from './windsurf.js';
export * from './universal.js';

// Agent features
export * from './features/index.js';

const adapters: Record<AgentType, AgentAdapter> = {
  'claude-code': new ClaudeCodeAdapter(),
  cursor: new CursorAdapter(),
  codex: new CodexAdapter(),
  'gemini-cli': new GeminiCliAdapter(),
  opencode: new OpenCodeAdapter(),
  antigravity: new AntigravityAdapter(),
  amp: new AmpAdapter(),
  clawdbot: new ClawdbotAdapter(),
  droid: new DroidAdapter(),
  'github-copilot': new GitHubCopilotAdapter(),
  goose: new GooseAdapter(),
  kilo: new KiloAdapter(),
  'kiro-cli': new KiroCliAdapter(),
  roo: new RooAdapter(),
  trae: new TraeAdapter(),
  windsurf: new WindsurfAdapter(),
  universal: new UniversalAdapter(),
  cline: new UniversalAdapter(),
  codebuddy: new UniversalAdapter(),
  commandcode: new UniversalAdapter(),
  continue: new UniversalAdapter(),
  crush: new UniversalAdapter(),
  factory: new FactoryAdapter(),
  mcpjam: new UniversalAdapter(),
  mux: new UniversalAdapter(),
  neovate: new UniversalAdapter(),
  openhands: new UniversalAdapter(),
  pi: new UniversalAdapter(),
  qoder: new UniversalAdapter(),
  qwen: new UniversalAdapter(),
  vercel: new UniversalAdapter(),
  zencoder: new UniversalAdapter(),
};

export function getAdapter(type: AgentType): AgentAdapter {
  return adapters[type];
}

export interface AgentAdapterWithType extends AgentAdapter {
  readonly agentType: AgentType;
}

export function getAllAdapters(): AgentAdapterWithType[] {
  return Object.entries(adapters).map(([type, adapter]) => ({
    ...adapter,
    type: type as AgentType,
    agentType: type as AgentType,
  }));
}

export async function detectAgent(): Promise<AgentType> {
  const checkOrder: AgentType[] = [
    'claude-code',
    'cursor',
    'codex',
    'gemini-cli',
    'opencode',
    'antigravity',
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
    'universal',
  ];

  for (const type of checkOrder) {
    const adapter = adapters[type];
    if (await adapter.isDetected()) {
      return type;
    }
  }

  return 'universal';
}

// getSkillsDir and getConfigFile are now re-exported from @skillkit/core above
// This ensures a single source of truth for agent configurations
