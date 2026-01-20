import type { AgentAdapter } from './base.js';
import type { AgentType } from '../core/types.js';
import { ClaudeCodeAdapter } from './claude-code.js';
import { CursorAdapter } from './cursor.js';
import { CodexAdapter } from './codex.js';
import { GeminiCliAdapter } from './gemini-cli.js';
import { OpenCodeAdapter } from './opencode.js';
import { AntigravityAdapter } from './antigravity.js';
import { UniversalAdapter } from './universal.js';

export * from './base.js';
export * from './claude-code.js';
export * from './cursor.js';
export * from './codex.js';
export * from './gemini-cli.js';
export * from './opencode.js';
export * from './antigravity.js';
export * from './universal.js';

const adapters: Record<AgentType, AgentAdapter> = {
  'claude-code': new ClaudeCodeAdapter(),
  cursor: new CursorAdapter(),
  codex: new CodexAdapter(),
  'gemini-cli': new GeminiCliAdapter(),
  opencode: new OpenCodeAdapter(),
  antigravity: new AntigravityAdapter(),
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
