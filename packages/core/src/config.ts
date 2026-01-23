import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { homedir } from 'node:os';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import { SkillkitConfig, type AgentType, type SkillMetadata, type AgentAdapterInfo } from './types.js';

const CONFIG_FILE = 'skillkit.yaml';
const METADATA_FILE = '.skillkit.json';

export function getProjectConfigPath(): string {
  return join(process.cwd(), CONFIG_FILE);
}

export function getGlobalConfigPath(): string {
  return join(homedir(), '.config', 'skillkit', CONFIG_FILE);
}

export function loadConfig(): SkillkitConfig {
  const projectPath = getProjectConfigPath();
  const globalPath = getGlobalConfigPath();

  if (existsSync(projectPath)) {
    try {
      const content = readFileSync(projectPath, 'utf-8');
      const data = parseYaml(content);
      const parsed = SkillkitConfig.safeParse(data);
      if (parsed.success) {
        return parsed.data;
      }
    } catch {
      // Ignore parse errors
    }
  }

  if (existsSync(globalPath)) {
    try {
      const content = readFileSync(globalPath, 'utf-8');
      const data = parseYaml(content);
      const parsed = SkillkitConfig.safeParse(data);
      if (parsed.success) {
        return parsed.data;
      }
    } catch {
      // Ignore parse errors
    }
  }

  return {
    version: 1,
    agent: 'universal',
    autoSync: true,
  };
}

export function saveConfig(config: SkillkitConfig, global = false): void {
  const configPath = global ? getGlobalConfigPath() : getProjectConfigPath();
  const dir = dirname(configPath);

  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  const content = stringifyYaml(config);
  writeFileSync(configPath, content, 'utf-8');
}

export function getSearchDirs(adapter: AgentAdapterInfo): string[] {
  const dirs: string[] = [];

  dirs.push(join(process.cwd(), adapter.skillsDir));
  dirs.push(join(process.cwd(), '.agent', 'skills'));
  dirs.push(join(homedir(), adapter.skillsDir));
  dirs.push(join(homedir(), '.agent', 'skills'));

  return dirs;
}

export function getInstallDir(adapter: AgentAdapterInfo, global = false): string {
  if (global) {
    return join(homedir(), adapter.skillsDir);
  }

  return join(process.cwd(), adapter.skillsDir);
}

export function getAgentConfigPath(adapter: AgentAdapterInfo): string {
  return join(process.cwd(), adapter.configFile);
}

export function saveSkillMetadata(skillPath: string, metadata: SkillMetadata): void {
  const metadataPath = join(skillPath, METADATA_FILE);
  writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), 'utf-8');
}

export function loadSkillMetadata(skillPath: string): SkillMetadata | null {
  const metadataPath = join(skillPath, METADATA_FILE);

  if (!existsSync(metadataPath)) {
    return null;
  }

  try {
    const content = readFileSync(metadataPath, 'utf-8');
    return JSON.parse(content) as SkillMetadata;
  } catch {
    return null;
  }
}

export function setSkillEnabled(skillPath: string, enabled: boolean): boolean {
  const metadata = loadSkillMetadata(skillPath);

  if (!metadata) {
    return false;
  }

  metadata.enabled = enabled;
  metadata.updatedAt = new Date().toISOString();
  saveSkillMetadata(skillPath, metadata);

  return true;
}

export async function initProject(
  type: AgentType,
  adapter: AgentAdapterInfo
): Promise<void> {
  const skillsDir = join(process.cwd(), adapter.skillsDir);
  if (!existsSync(skillsDir)) {
    mkdirSync(skillsDir, { recursive: true });
  }

  const config: SkillkitConfig = {
    version: 1,
    agent: type,
    autoSync: true,
  };
  saveConfig(config);

  const agentConfigPath = join(process.cwd(), adapter.configFile);
  if (!existsSync(agentConfigPath)) {
    writeFileSync(agentConfigPath, `# ${adapter.name} Configuration\n\n`, 'utf-8');
  }
}
