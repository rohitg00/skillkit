// Re-export commonly used functions with proper adapters
import {
  loadConfig,
  getSearchDirs as coreGetSearchDirs,
  getInstallDir as coreGetInstallDir,
  getAgentConfigPath as coreGetAgentConfigPath,
  initProject as coreInitProject,
  loadSkillMetadata as coreLoadSkillMetadata,
  saveSkillMetadata as coreSaveSkillMetadata,
} from '@skillkit/core';
import { getAdapter, detectAgent } from '@skillkit/agents';
import type { AgentType, AgentAdapterInfo } from '@skillkit/core';

// Re-export metadata functions directly (they don't need adapter bridging)
export const loadSkillMetadata = coreLoadSkillMetadata;
export const saveSkillMetadata = coreSaveSkillMetadata;

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

export function getAgentConfigPath(agentType?: AgentType): string {
  const type = agentType || loadConfig().agent;
  const adapter = getAdapter(type);
  const adapterInfo: AgentAdapterInfo = {
    type: adapter.type,
    name: adapter.name,
    skillsDir: adapter.skillsDir,
    configFile: adapter.configFile,
  };
  return coreGetAgentConfigPath(adapterInfo);
}

export async function initProject(agentType?: AgentType): Promise<void> {
  const type = agentType || (await detectAgent());
  const adapter = getAdapter(type);
  const adapterInfo: AgentAdapterInfo = {
    type: adapter.type,
    name: adapter.name,
    skillsDir: adapter.skillsDir,
    configFile: adapter.configFile,
  };
  return coreInitProject(type, adapterInfo);
}
