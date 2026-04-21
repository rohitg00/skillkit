import { existsSync, readFileSync, writeFileSync, mkdirSync, statSync, renameSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { homedir } from 'node:os';
import { createHash } from 'node:crypto';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import { SkillkitConfig, LockFile, type AgentType, type SkillMetadata, type AgentAdapterInfo, type LockEntry } from './types.js';
import { AGENT_CONFIG } from './agent-config.js';

const CONFIG_FILE = 'skillkit.yaml';
const METADATA_FILE = '.skillkit.json';

function metadataPathFor(skillPath: string): string {
  if (skillPath.endsWith('.md') && existsSync(skillPath) && statSync(skillPath).isFile()) {
    return join(dirname(skillPath), `.${basename(skillPath, '.md')}.skillkit.json`);
  }
  return join(skillPath, METADATA_FILE);
}

export function getProjectConfigPath(): string {
  return join(process.cwd(), CONFIG_FILE);
}

export function getGlobalConfigPath(): string {
  return join(homedir(), '.config', 'skillkit', CONFIG_FILE);
}

export function loadConfig(global = false): SkillkitConfig {
  const projectPath = getProjectConfigPath();
  const globalPath = getGlobalConfigPath();

  // If global is explicitly requested, only load from global path
  if (global) {
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

  // Default behavior: project config takes precedence over global
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

  const globalDir = AGENT_CONFIG[adapter.type]?.globalSkillsDir;
  if (globalDir) {
    const resolved = globalDir.startsWith('~/')
      ? join(homedir(), globalDir.slice(2))
      : globalDir;
    dirs.push(resolved);
  } else {
    dirs.push(join(homedir(), adapter.skillsDir));
  }
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
  const metadataPath = metadataPathFor(skillPath);
  writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), 'utf-8');
}

export function loadSkillMetadata(skillPath: string): SkillMetadata | null {
  const metadataPath = metadataPathFor(skillPath);

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

export function computeSkillChecksum(skillPath: string): string {
  const mdPath = skillPath.endsWith('.md') ? skillPath : join(skillPath, 'SKILL.md');
  if (!existsSync(mdPath)) return '';
  return createHash('sha256').update(readFileSync(mdPath)).digest('hex').slice(0, 16);
}

const LOCK_FILE = join(homedir(), '.skillkit', 'lock.json');

export function loadLockFile(): LockFile {
  if (!existsSync(LOCK_FILE)) return { version: 1, skills: {} };
  try {
    return LockFile.parse(JSON.parse(readFileSync(LOCK_FILE, 'utf-8')));
  } catch {
    return { version: 1, skills: {} };
  }
}

export function saveLockFile(lock: LockFile): void {
  const dir = dirname(LOCK_FILE);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const tmpFile = `${LOCK_FILE}.${process.pid}.tmp`;
  writeFileSync(tmpFile, JSON.stringify(lock, null, 2), 'utf-8');
  renameSync(tmpFile, LOCK_FILE);
}

export function addSkillToLock(name: string, entry: LockEntry): void {
  const lock = loadLockFile();
  const key = `${entry.source}:${name}`;
  const existing = lock.skills[key];
  if (existing) {
    const mergedAgents = [...new Set([...existing.agents, ...entry.agents])];
    lock.skills[key] = { ...entry, agents: mergedAgents };
  } else {
    lock.skills[key] = entry;
  }
  saveLockFile(lock);
}

export function removeSkillFromLock(name: string, source?: string): void {
  const lock = loadLockFile();
  if (source) {
    delete lock.skills[`${source}:${name}`];
  } else {
    for (const key of Object.keys(lock.skills)) {
      if (key === name || key.endsWith(`:${name}`)) {
        delete lock.skills[key];
      }
    }
  }
  saveLockFile(lock);
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
