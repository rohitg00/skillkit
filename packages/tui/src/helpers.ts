// Re-export commonly used functions with proper adapters
import {
  loadConfig,
  getSearchDirs as coreGetSearchDirs,
  getInstallDir as coreGetInstallDir,
  saveSkillMetadata as coreSaveSkillMetadata,
} from '@skillkit/core';
import { getAdapter } from '@skillkit/agents';
import type { AgentType, AgentAdapterInfo } from '@skillkit/core';

// Re-export for direct use
export { coreSaveSkillMetadata as saveSkillMetadata };

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
