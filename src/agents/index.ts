import type { AgentAdapter } from './base.js';
import type { AgentType } from '../core/types.js';
import { ClaudeCodeAdapter } from './claude-code.js';
import { CursorAdapter } from './cursor.js';
import { CodexAdapter } from './codex.js';
import { GeminiCliAdapter } from './gemini-cli.js';
import { OpenCodeAdapter } from './opencode.js';
import { AntigravityAdapter } from './antigravity.js';
import { AmpAdapter } from './amp.js';
import { ClawdbotAdapter } from './clawdbot.js';
import { DroidAdapter } from './droid.js';
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
export * from './github-copilot.js';
export * from './goose.js';
export * from './kilo.js';
export * from './kiro-cli.js';
export * from './roo.js';
export * from './trae.js';
export * from './windsurf.js';
export * from './universal.js';

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
};

export function getAdapter(type: AgentType): AgentAdapter {
  return adapters[type];
}

export function getAllAdapters(): AgentAdapter[] {
  return Object.values(adapters);
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

export function getSkillsDir(type: AgentType): string {
  return adapters[type].skillsDir;
}

export function getConfigFile(type: AgentType): string {
  return adapters[type].configFile;
}
