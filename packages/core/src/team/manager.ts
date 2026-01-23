/**
 * Team Manager
 *
 * Manages team skill sharing and collaboration
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import type {
  TeamConfig,
  TeamRegistry,
  SharedSkill,
  ShareOptions,
  ImportOptions,
} from './types.js';
import type { AgentType } from '../types.js';
import { detectProvider } from '../providers/index.js';

const TEAM_CONFIG_FILE = 'team.yaml';
const TEAM_DIR = '.skillkit/team';

/**
 * Team Manager for collaboration features
 */
export class TeamManager {
  private projectPath: string;
  private config: TeamConfig | null = null;
  private registry: TeamRegistry | null = null;

  constructor(projectPath: string) {
    this.projectPath = projectPath;
  }

  /**
   * Initialize team configuration
   */
  async init(config: Omit<TeamConfig, 'teamId'>): Promise<TeamConfig> {
    const teamId = this.generateTeamId();
    const fullConfig: TeamConfig = {
      ...config,
      teamId,
    };

    // Create team directory
    const teamDir = join(this.projectPath, TEAM_DIR);
    if (!existsSync(teamDir)) {
      mkdirSync(teamDir, { recursive: true });
    }

    // Save config
    this.saveConfig(fullConfig);
    this.config = fullConfig;

    // Initialize empty registry
    const registry: TeamRegistry = {
      version: 1,
      teamId,
      teamName: config.teamName,
      skills: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.saveRegistry(registry);
    this.registry = registry;

    return fullConfig;
  }

  /**
   * Load existing team configuration
   */
  load(): TeamConfig | null {
    const configPath = join(this.projectPath, TEAM_DIR, TEAM_CONFIG_FILE);
    if (!existsSync(configPath)) {
      return null;
    }

    try {
      const content = readFileSync(configPath, 'utf-8');
      this.config = this.parseYaml(content) as TeamConfig;
      this.loadRegistry();
      return this.config;
    } catch {
      return null;
    }
  }

  /**
   * Get current config
   */
  getConfig(): TeamConfig | null {
    return this.config;
  }

  /**
   * Get current registry
   */
  getRegistry(): TeamRegistry | null {
    return this.registry;
  }

  /**
   * Share a skill to the team registry
   */
  async shareSkill(options: ShareOptions): Promise<SharedSkill> {
    if (!this.config || !this.registry) {
      throw new Error('Team not initialized. Run `skillkit team init` first.');
    }

    // Find the skill in local skills directory
    const skillPath = this.findLocalSkill(options.skillName);
    if (!skillPath) {
      throw new Error(`Skill "${options.skillName}" not found locally.`);
    }

    // Read skill content and metadata
    const skillMdPath = join(skillPath, 'SKILL.md');
    const skillContent = existsSync(skillMdPath)
      ? readFileSync(skillMdPath, 'utf-8')
      : '';

    // Parse frontmatter for metadata
    const metadata = this.extractFrontmatter(skillContent);

    // Create shared skill entry
    const shared: SharedSkill = {
      name: options.skillName,
      version: (metadata.version as string) || '1.0.0',
      description: options.description || (metadata.description as string) || '',
      author: this.getAuthor(),
      sharedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      source: `${this.config.registryUrl}#${options.skillName}`,
      tags: options.tags || (metadata.tags as string[]) || [],
      agents: options.agents || this.detectCompatibleAgents(skillPath),
      downloads: 0,
    };

    // Check if skill already exists
    const existingIndex = this.registry.skills.findIndex(
      (s) => s.name === options.skillName
    );

    if (existingIndex >= 0) {
      // Update existing
      shared.sharedAt = this.registry.skills[existingIndex].sharedAt;
      shared.downloads = this.registry.skills[existingIndex].downloads;
      this.registry.skills[existingIndex] = shared;
    } else {
      // Add new
      this.registry.skills.push(shared);
    }

    this.registry.updatedAt = new Date().toISOString();
    this.saveRegistry(this.registry);

    return shared;
  }

  /**
   * List all shared skills in the team registry
   */
  listSharedSkills(): SharedSkill[] {
    return this.registry?.skills || [];
  }

  /**
   * Search shared skills
   */
  searchSkills(query: string): SharedSkill[] {
    if (!this.registry) return [];

    const lowerQuery = query.toLowerCase();
    return this.registry.skills.filter(
      (s) =>
        s.name.toLowerCase().includes(lowerQuery) ||
        s.description?.toLowerCase().includes(lowerQuery) ||
        s.tags?.some((t) => t.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Import a shared skill from the team registry
   */
  async importSkill(
    skillName: string,
    options: ImportOptions = {}
  ): Promise<{ success: boolean; path?: string; error?: string }> {
    if (!this.config || !this.registry) {
      return { success: false, error: 'Team not initialized' };
    }

    const sharedSkill = this.registry.skills.find((s) => s.name === skillName);
    if (!sharedSkill) {
      return { success: false, error: `Skill "${skillName}" not found in team registry` };
    }

    // Check if skill exists locally
    const localPath = this.findLocalSkill(skillName);
    if (localPath && !options.overwrite) {
      return {
        success: false,
        error: `Skill "${skillName}" already exists. Use --overwrite to replace.`,
      };
    }

    if (options.dryRun) {
      return {
        success: true,
        path: join(this.projectPath, '.skillkit', 'skills', skillName),
      };
    }

    // Clone from registry source
    try {
      const provider = detectProvider(this.config.registryUrl);
      if (!provider) {
        return { success: false, error: 'Cannot detect provider for registry URL' };
      }

      const result = await provider.clone(this.config.registryUrl, skillName, {
        depth: 1,
      });

      if (!result.success) {
        return { success: false, error: result.error };
      }

      // Update download count
      sharedSkill.downloads = (sharedSkill.downloads || 0) + 1;
      this.saveRegistry(this.registry);

      return { success: true, path: result.path };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  }

  /**
   * Sync with remote registry
   */
  async sync(): Promise<{
    added: string[];
    updated: string[];
    removed: string[];
  }> {
    if (!this.config) {
      throw new Error('Team not initialized');
    }

    const result = { added: [] as string[], updated: [] as string[], removed: [] as string[] };

    try {
      const provider = detectProvider(this.config.registryUrl);
      if (!provider) {
        throw new Error('Cannot detect provider for registry URL');
      }

      // Fetch remote registry
      const fetchResult = await provider.clone(this.config.registryUrl, '', {
        depth: 1,
      });

      if (!fetchResult.success || !fetchResult.path) {
        throw new Error(fetchResult.error || 'Failed to fetch remote registry');
      }

      // Read remote registry
      const remoteRegistryPath = join(fetchResult.path, TEAM_DIR, 'registry.yaml');
      if (existsSync(remoteRegistryPath)) {
        const remoteContent = readFileSync(remoteRegistryPath, 'utf-8');
        const remoteRegistry = this.parseYaml(remoteContent) as TeamRegistry;

        // Merge registries
        const localSkillNames = new Set(this.registry?.skills.map((s) => s.name) || []);

        // Find added skills
        for (const skill of remoteRegistry.skills) {
          if (!localSkillNames.has(skill.name)) {
            result.added.push(skill.name);
            this.registry?.skills.push(skill);
          } else {
            // Check if updated
            const local = this.registry?.skills.find((s) => s.name === skill.name);
            if (local && new Date(skill.updatedAt) > new Date(local.updatedAt)) {
              result.updated.push(skill.name);
              Object.assign(local, skill);
            }
          }
        }

        // Find removed skills (optional - keep local for now)
        // for (const skill of this.registry?.skills || []) {
        //   if (!remoteSkillNames.has(skill.name)) {
        //     result.removed.push(skill.name);
        //   }
        // }

        if (this.registry) {
          this.registry.updatedAt = new Date().toISOString();
          this.saveRegistry(this.registry);
        }
      }

      // Clean up temp directory
      if (fetchResult.tempRoot) {
        const { rmSync } = await import('node:fs');
        rmSync(fetchResult.tempRoot, { recursive: true, force: true });
      }
    } catch (err) {
      throw new Error(`Sync failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }

    return result;
  }

  /**
   * Remove a skill from the team registry
   */
  removeSkill(skillName: string): boolean {
    if (!this.registry) return false;

    const index = this.registry.skills.findIndex((s) => s.name === skillName);
    if (index === -1) return false;

    this.registry.skills.splice(index, 1);
    this.registry.updatedAt = new Date().toISOString();
    this.saveRegistry(this.registry);

    return true;
  }

  // Private helpers

  private generateTeamId(): string {
    return `team-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }

  private saveConfig(config: TeamConfig): void {
    const configPath = join(this.projectPath, TEAM_DIR, TEAM_CONFIG_FILE);
    const dir = dirname(configPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(configPath, this.toYaml(config), 'utf-8');
  }

  private loadRegistry(): void {
    const registryPath = join(this.projectPath, TEAM_DIR, 'registry.yaml');
    if (existsSync(registryPath)) {
      const content = readFileSync(registryPath, 'utf-8');
      this.registry = this.parseYaml(content) as TeamRegistry;
    }
  }

  private saveRegistry(registry: TeamRegistry): void {
    const registryPath = join(this.projectPath, TEAM_DIR, 'registry.yaml');
    writeFileSync(registryPath, this.toYaml(registry), 'utf-8');
  }

  private findLocalSkill(skillName: string): string | null {
    const possiblePaths = [
      join(this.projectPath, '.skillkit', 'skills', skillName),
      join(this.projectPath, 'skills', skillName),
      join(this.projectPath, '.claude', 'skills', skillName),
    ];

    for (const p of possiblePaths) {
      if (existsSync(p)) {
        return p;
      }
    }

    return null;
  }

  private getAuthor(): string {
    // Try to get from git config
    try {
      const { execSync } = require('node:child_process');
      const name = execSync('git config user.name', { encoding: 'utf-8' }).trim();
      const email = execSync('git config user.email', { encoding: 'utf-8' }).trim();
      return email ? `${name} <${email}>` : name;
    } catch {
      return 'Unknown';
    }
  }

  private detectCompatibleAgents(skillPath: string): AgentType[] {
    const agents: AgentType[] = [];

    // Check for format-specific files
    if (existsSync(join(skillPath, 'SKILL.md'))) {
      agents.push('claude-code', 'codex', 'gemini-cli', 'universal');
    }
    if (existsSync(join(skillPath, 'skill.mdc'))) {
      agents.push('cursor');
    }
    if (existsSync(join(skillPath, 'rules.md'))) {
      agents.push('windsurf');
    }

    return agents.length > 0 ? agents : ['universal'];
  }

  private extractFrontmatter(content: string): Record<string, unknown> {
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return {};

    try {
      return this.parseYaml(match[1]) as Record<string, unknown>;
    } catch {
      return {};
    }
  }

  private parseYaml(content: string): unknown {
    // Simple YAML parser for basic structures
    const result: Record<string, unknown> = {};
    const lines = content.split('\n');
    let currentKey = '';
    let inArray = false;
    let arrayItems: unknown[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      if (trimmed.startsWith('- ')) {
        if (inArray && currentKey) {
          arrayItems.push(trimmed.slice(2).trim().replace(/^['"]|['"]$/g, ''));
        }
        continue;
      }

      if (inArray && currentKey) {
        result[currentKey] = arrayItems;
        inArray = false;
        arrayItems = [];
      }

      const colonIndex = trimmed.indexOf(':');
      if (colonIndex > 0) {
        const key = trimmed.slice(0, colonIndex).trim();
        const value = trimmed.slice(colonIndex + 1).trim();

        if (value === '' || value === '|') {
          currentKey = key;
          inArray = true;
          arrayItems = [];
        } else {
          let parsedValue: unknown = value.replace(/^['"]|['"]$/g, '');
          if (parsedValue === 'true') parsedValue = true;
          else if (parsedValue === 'false') parsedValue = false;
          else if (!isNaN(Number(parsedValue)) && parsedValue !== '') {
            parsedValue = Number(parsedValue);
          }
          result[key] = parsedValue;
        }
      }
    }

    if (inArray && currentKey) {
      result[currentKey] = arrayItems;
    }

    return result;
  }

  private toYaml(obj: unknown, indent = 0): string {
    const spaces = '  '.repeat(indent);
    const lines: string[] = [];

    if (Array.isArray(obj)) {
      for (const item of obj) {
        if (typeof item === 'object' && item !== null) {
          lines.push(`${spaces}-`);
          const subYaml = this.toYaml(item, indent + 1);
          lines.push(subYaml);
        } else {
          lines.push(`${spaces}- ${this.yamlValue(item)}`);
        }
      }
    } else if (typeof obj === 'object' && obj !== null) {
      for (const [key, value] of Object.entries(obj)) {
        if (Array.isArray(value)) {
          lines.push(`${spaces}${key}:`);
          lines.push(this.toYaml(value, indent + 1));
        } else if (typeof value === 'object' && value !== null) {
          lines.push(`${spaces}${key}:`);
          lines.push(this.toYaml(value, indent + 1));
        } else {
          lines.push(`${spaces}${key}: ${this.yamlValue(value)}`);
        }
      }
    }

    return lines.join('\n');
  }

  private yamlValue(value: unknown): string {
    if (typeof value === 'string') {
      if (value.includes('\n') || value.includes(':') || value.includes('#')) {
        return `"${value.replace(/"/g, '\\"')}"`;
      }
      return value;
    }
    return String(value);
  }
}

/**
 * Create a team manager instance
 */
export function createTeamManager(projectPath: string): TeamManager {
  return new TeamManager(projectPath);
}
