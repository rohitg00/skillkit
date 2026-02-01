/**
 * Helper utilities for agent and skill operations
 */
import {
  loadConfig,
  getSearchDirs as coreGetSearchDirs,
  getInstallDir as coreGetInstallDir,
  saveSkillMetadata as coreSaveSkillMetadata,
} from '@skillkit/core';
import { getAdapter } from '@skillkit/agents';
import type { AgentType, AgentAdapterInfo, SkillMetadata } from '@skillkit/core';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Get search directories for skills based on agent type
 * @param agentType - Optional agent type (defaults to configured agent)
 * @returns Array of directories to search for skills
 */
export function getSearchDirs(agentType?: AgentType): string[] {
  const type = agentType || loadConfig().agent;
  const adapter = getAdapter(type);
  const adapterInfo: AgentAdapterInfo = {
    type: adapter.type,
    name: adapter.name,
    skillsDir: adapter.skillsDir,
    configFile: adapter.configFile,
  };
  return coreGetSearchDirs(adapterInfo);
}

/**
 * Get installation directory for skills
 * @param global - Whether to get global or project-local directory
 * @param agentType - Optional agent type (defaults to configured agent)
 * @returns Installation directory path
 */
export function getInstallDir(global = false, agentType?: AgentType): string {
  const type = agentType || loadConfig().agent;
  const adapter = getAdapter(type);
  const adapterInfo: AgentAdapterInfo = {
    type: adapter.type,
    name: adapter.name,
    skillsDir: adapter.skillsDir,
    configFile: adapter.configFile,
  };
  return coreGetInstallDir(adapterInfo, global);
}

/**
 * Save skill metadata to a skill directory
 * @param skillDir - Directory containing the skill
 * @param metadata - Metadata to save
 */
export function saveSkillMetadata(
  skillDir: string,
  metadata: SkillMetadata
): void {
  coreSaveSkillMetadata(skillDir, metadata);
}

/**
 * Get version from package.json
 * @returns Version string
 */
export function getVersion(): string {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const paths = [
      join(__dirname, '..', 'package.json'),
      join(__dirname, '..', '..', 'package.json'),
      join(__dirname, '..', '..', '..', 'package.json'),
    ];
    for (const packagePath of paths) {
      try {
        const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'));
        if (packageJson.name === '@skillkit/tui' || packageJson.name === 'skillkit') {
          return packageJson.version || '1.8.0';
        }
      } catch {}
    }
    return '1.8.0';
  } catch {
    return '1.8.0';
  }
}
