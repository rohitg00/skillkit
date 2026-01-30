import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';

import { BUNDLED_AGENTS, AGENT_MANIFEST } from './manifest.js';
import type {
  BundledAgent,
  AgentManifest,
  AgentCategory,
  AgentInstallOptions,
  AgentInstallResult,
} from './types.js';

export type { BundledAgent, AgentManifest, AgentCategory, AgentInstallOptions, AgentInstallResult };
export { BUNDLED_AGENTS, AGENT_MANIFEST };

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function getTemplatesDir(): string {
  return join(__dirname, '..', '..', 'templates', 'agents');
}

export function getBundledAgents(): BundledAgent[] {
  return BUNDLED_AGENTS;
}

export function getBundledAgent(id: string): BundledAgent | null {
  return BUNDLED_AGENTS.find(a => a.id === id) || null;
}

export function getBundledAgentsByCategory(category: AgentCategory): BundledAgent[] {
  return BUNDLED_AGENTS.filter(a => a.category === category);
}

export function getBundledAgentIds(): string[] {
  return BUNDLED_AGENTS.map(a => a.id);
}

export function getAgentTemplate(id: string): string | null {
  const agent = getBundledAgent(id);
  if (!agent) return null;

  const templatePath = join(getTemplatesDir(), `${id}.md`);

  try {
    if (existsSync(templatePath)) {
      return readFileSync(templatePath, 'utf-8');
    }
    return null;
  } catch {
    return null;
  }
}

export function installBundledAgent(
  id: string,
  options: AgentInstallOptions = {}
): AgentInstallResult {
  const agent = getBundledAgent(id);
  if (!agent) {
    return {
      success: false,
      agentId: id,
      path: '',
      message: `Bundled agent not found: ${id}`,
    };
  }

  const template = getAgentTemplate(id);
  if (!template) {
    return {
      success: false,
      agentId: id,
      path: '',
      message: `Template not found for agent: ${id}`,
    };
  }

  let targetDir: string;
  if (options.targetDir) {
    targetDir = options.targetDir;
  } else if (options.global) {
    targetDir = join(homedir(), '.claude', 'agents');
  } else {
    targetDir = join(process.cwd(), '.claude', 'agents');
  }

  const targetPath = join(targetDir, `${id}.md`);

  if (existsSync(targetPath) && !options.force) {
    return {
      success: false,
      agentId: id,
      path: targetPath,
      message: `Agent already exists: ${targetPath}. Use --force to overwrite.`,
    };
  }

  try {
    if (!existsSync(targetDir)) {
      mkdirSync(targetDir, { recursive: true });
    }

    writeFileSync(targetPath, template);

    return {
      success: true,
      agentId: id,
      path: targetPath,
      message: `Installed agent: ${agent.name}`,
    };
  } catch (error) {
    return {
      success: false,
      agentId: id,
      path: targetPath,
      message: `Failed to install agent: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

export function getInstalledAgentIds(searchDirs?: string[]): string[] {
  const dirs = searchDirs || [
    join(process.cwd(), '.claude', 'agents'),
    join(homedir(), '.claude', 'agents'),
  ];

  const installed = new Set<string>();

  for (const dir of dirs) {
    if (existsSync(dir)) {
      try {
        const files = require('node:fs').readdirSync(dir);
        for (const file of files) {
          if (file.endsWith('.md')) {
            installed.add(file.replace('.md', ''));
          }
        }
      } catch {
        continue;
      }
    }
  }

  return Array.from(installed);
}

export function getAvailableAgents(searchDirs?: string[]): BundledAgent[] {
  const installed = new Set(getInstalledAgentIds(searchDirs));
  return BUNDLED_AGENTS.filter(a => !installed.has(a.id));
}

export function isAgentInstalled(id: string, searchDirs?: string[]): boolean {
  return getInstalledAgentIds(searchDirs).includes(id);
}
