/**
 * Methodology Manager
 *
 * Manages methodology pack installation, syncing, and lifecycle.
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import type { AgentType } from '../types.js';
import type {
  MethodologyPack,
  MethodologySkill,
  MethodologyState,
  MethodologyManagerOptions,
  InstallResult,
  MethodologySyncResult,
  MethodologySearchQuery,
  MethodologySearchResult,
} from './types.js';
import { MethodologyLoader, createMethodologyLoader } from './loader.js';
import { TranslatorRegistry } from '../translator/registry.js';

const METHODOLOGY_STATE_FILE = '.skillkit/methodology.json';

/**
 * Methodology Manager class
 */
export class MethodologyManager {
  private projectPath: string;
  private loader: MethodologyLoader;
  private state: MethodologyState;
  private autoSync: boolean;

  constructor(options: MethodologyManagerOptions) {
    this.projectPath = options.projectPath;
    this.loader = createMethodologyLoader(options.packsDir);
    this.autoSync = options.autoSync ?? true;
    this.state = this.loadState();
  }

  /**
   * Install a methodology pack
   */
  async installPack(packName: string): Promise<InstallResult> {
    const result: InstallResult = {
      success: true,
      installed: [],
      skipped: [],
      failed: [],
    };

    // Load pack
    const pack = await this.loader.loadPack(packName);
    if (!pack) {
      result.success = false;
      result.failed.push({
        name: packName,
        error: `Pack not found: ${packName}`,
      });
      return result;
    }

    // Check if already installed
    if (this.state.installedPacks[packName]) {
      const installedVersion = this.state.installedPacks[packName].version;
      if (installedVersion === pack.version) {
        result.skipped.push(packName);
        return result;
      }
    }

    // Install each skill
    const skills = await this.loader.loadPackSkills(packName);
    const installedSkillNames: string[] = [];

    for (const skill of skills) {
      try {
        await this.installSkillLocally(skill);
        installedSkillNames.push(skill.id);
        result.installed.push(skill.id);
      } catch (e) {
        result.failed.push({
          name: skill.id,
          error: e instanceof Error ? e.message : 'Unknown error',
        });
      }
    }

    // Update state
    this.state.installedPacks[packName] = {
      version: pack.version,
      installedAt: new Date().toISOString(),
      skills: installedSkillNames,
      autoSync: this.autoSync,
    };
    this.saveState();

    // Auto-sync if enabled
    if (this.autoSync) {
      await this.syncPack(packName);
    }

    result.success = result.failed.length === 0;
    return result;
  }

  /**
   * Install all available packs
   */
  async installAllPacks(): Promise<InstallResult> {
    const result: InstallResult = {
      success: true,
      installed: [],
      skipped: [],
      failed: [],
    };

    const packs = await this.loader.loadAllPacks();

    for (const pack of packs) {
      const packResult = await this.installPack(pack.name);
      result.installed.push(...packResult.installed);
      result.skipped.push(...packResult.skipped);
      result.failed.push(...packResult.failed);
    }

    result.success = result.failed.length === 0;
    return result;
  }

  /**
   * Install a single skill by ID
   */
  async installSkill(skillId: string): Promise<InstallResult> {
    const result: InstallResult = {
      success: true,
      installed: [],
      skipped: [],
      failed: [],
    };

    const skill = await this.loader.getSkillById(skillId);
    if (!skill) {
      result.success = false;
      result.failed.push({
        name: skillId,
        error: `Skill not found: ${skillId}`,
      });
      return result;
    }

    // Check if already installed
    if (this.state.installedSkills[skillId]) {
      const installedVersion = this.state.installedSkills[skillId].version;
      if (installedVersion === skill.version) {
        result.skipped.push(skillId);
        return result;
      }
    }

    try {
      await this.installSkillLocally(skill);
      result.installed.push(skillId);

      // Update state
      this.state.installedSkills[skillId] = {
        version: skill.version,
        pack: skill.pack,
        installedAt: new Date().toISOString(),
        syncedAgents: [],
      };
      this.saveState();

      // Auto-sync if enabled
      if (this.autoSync) {
        await this.syncSkill(skillId);
      }
    } catch (e) {
      result.success = false;
      result.failed.push({
        name: skillId,
        error: e instanceof Error ? e.message : 'Unknown error',
      });
    }

    return result;
  }

  /**
   * Uninstall a pack
   */
  async uninstallPack(packName: string): Promise<void> {
    const packInfo = this.state.installedPacks[packName];
    if (!packInfo) {
      throw new Error(`Pack not installed: ${packName}`);
    }

    // Remove all skills from the pack
    for (const skillId of packInfo.skills) {
      await this.removeSkillLocally(skillId);
      delete this.state.installedSkills[skillId];
    }

    // Remove pack from state
    delete this.state.installedPacks[packName];
    this.saveState();
  }

  /**
   * Uninstall a skill
   */
  async uninstallSkill(skillId: string): Promise<void> {
    const skillInfo = this.state.installedSkills[skillId];
    if (!skillInfo) {
      throw new Error(`Skill not installed: ${skillId}`);
    }

    await this.removeSkillLocally(skillId);
    delete this.state.installedSkills[skillId];
    this.saveState();
  }

  /**
   * Sync a pack to all detected agents
   */
  async syncPack(packName: string, agents?: AgentType[]): Promise<MethodologySyncResult> {
    const result: MethodologySyncResult = {
      success: true,
      synced: [],
      failed: [],
    };

    const packInfo = this.state.installedPacks[packName];
    if (!packInfo) {
      throw new Error(`Pack not installed: ${packName}`);
    }

    for (const skillId of packInfo.skills) {
      const skillResult = await this.syncSkill(skillId, agents);
      result.synced.push(...skillResult.synced);
      result.failed.push(...skillResult.failed);
    }

    result.success = result.failed.length === 0;
    return result;
  }

  /**
   * Sync a skill to all detected agents
   */
  async syncSkill(skillId: string, agents?: AgentType[]): Promise<MethodologySyncResult> {
    const result: MethodologySyncResult = {
      success: true,
      synced: [],
      failed: [],
    };

    const skill = await this.loader.getSkillById(skillId);
    if (!skill) {
      throw new Error(`Skill not found: ${skillId}`);
    }

    const targetAgents = agents || this.detectAgents();
    const registry = new TranslatorRegistry();
    const syncedAgents: AgentType[] = [];

    for (const agent of targetAgents) {
      try {
        // Translate skill to target agent format
        const translationResult = registry.translateContent(skill.content, agent, {
          sourceFilename: 'SKILL.md',
        });

        if (!translationResult.success) {
          result.failed.push({
            skill: skillId,
            agent,
            error: translationResult.incompatible?.join(', ') || 'Translation failed',
          });
          continue;
        }

        // Write to agent's skills directory
        await this.writeSkillToAgent(skillId, translationResult.content, agent);

        syncedAgents.push(agent);
        result.synced.push({ skill: skillId, agents: [agent] });
      } catch (e) {
        result.failed.push({
          skill: skillId,
          agent,
          error: e instanceof Error ? e.message : 'Unknown error',
        });
      }
    }

    // Update synced agents in state
    if (this.state.installedSkills[skillId]) {
      this.state.installedSkills[skillId].syncedAgents = syncedAgents;
    }
    this.state.lastSync = new Date().toISOString();
    this.saveState();

    result.success = result.failed.length === 0;
    return result;
  }

  /**
   * Sync all installed skills
   */
  async syncAll(agents?: AgentType[]): Promise<MethodologySyncResult> {
    const result: MethodologySyncResult = {
      success: true,
      synced: [],
      failed: [],
    };

    const allSkillIds = [
      ...Object.keys(this.state.installedSkills),
      ...Object.values(this.state.installedPacks).flatMap((p) => p.skills),
    ];

    const uniqueSkillIds = [...new Set(allSkillIds)];

    for (const skillId of uniqueSkillIds) {
      const skillResult = await this.syncSkill(skillId, agents);
      result.synced.push(...skillResult.synced);
      result.failed.push(...skillResult.failed);
    }

    result.success = result.failed.length === 0;
    return result;
  }

  /**
   * List installed packs
   */
  listInstalledPacks(): Array<{ name: string; version: string; skills: string[] }> {
    return Object.entries(this.state.installedPacks).map(([name, info]) => ({
      name,
      version: info.version,
      skills: info.skills,
    }));
  }

  /**
   * List installed skills
   */
  listInstalledSkills(): Array<{
    id: string;
    version: string;
    pack?: string;
    syncedAgents: AgentType[];
  }> {
    const skillsFromPacks = Object.values(this.state.installedPacks).flatMap(
      (pack) =>
        pack.skills.map((skillId) => ({
          id: skillId,
          version: this.state.installedSkills[skillId]?.version || pack.version,
          pack: skillId.split('/')[0],
          syncedAgents: this.state.installedSkills[skillId]?.syncedAgents || [],
        }))
    );

    const individualSkills = Object.entries(this.state.installedSkills)
      .filter(([id]) => !skillsFromPacks.some((s) => s.id === id))
      .map(([id, info]) => ({
        id,
        version: info.version,
        pack: info.pack,
        syncedAgents: info.syncedAgents,
      }));

    return [...skillsFromPacks, ...individualSkills];
  }

  /**
   * List available packs (not yet installed)
   */
  async listAvailablePacks(): Promise<MethodologyPack[]> {
    const allPacks = await this.loader.loadAllPacks();
    return allPacks.filter((pack) => !this.state.installedPacks[pack.name]);
  }

  /**
   * Search methodology skills
   */
  async search(query: MethodologySearchQuery): Promise<MethodologySearchResult> {
    const packs = await this.loader.loadAllPacks();
    const allSkills: MethodologySkill[] = [];

    for (const pack of packs) {
      const skills = await this.loader.loadPackSkills(pack.name);
      allSkills.push(...skills);
    }

    let matchingSkills = allSkills;
    let matchingPacks = packs;

    // Filter by query string
    if (query.query) {
      const lowerQuery = query.query.toLowerCase();
      matchingSkills = matchingSkills.filter(
        (skill) =>
          skill.name.toLowerCase().includes(lowerQuery) ||
          skill.description.toLowerCase().includes(lowerQuery) ||
          skill.tags.some((t) => t.toLowerCase().includes(lowerQuery))
      );
      matchingPacks = matchingPacks.filter(
        (pack) =>
          pack.name.toLowerCase().includes(lowerQuery) ||
          pack.description.toLowerCase().includes(lowerQuery) ||
          pack.tags.some((t) => t.toLowerCase().includes(lowerQuery))
      );
    }

    // Filter by tags
    if (query.tags && query.tags.length > 0) {
      const lowerTags = query.tags.map((t) => t.toLowerCase());
      matchingSkills = matchingSkills.filter((skill) =>
        lowerTags.some((tag) =>
          skill.tags.some((t) => t.toLowerCase() === tag)
        )
      );
      matchingPacks = matchingPacks.filter((pack) =>
        lowerTags.some((tag) => pack.tags.some((t) => t.toLowerCase() === tag))
      );
    }

    // Filter by pack
    if (query.pack) {
      matchingSkills = matchingSkills.filter(
        (skill) => skill.pack === query.pack
      );
      matchingPacks = matchingPacks.filter((pack) => pack.name === query.pack);
    }

    // Filter by difficulty
    if (query.difficulty) {
      matchingSkills = matchingSkills.filter(
        (skill) => skill.metadata.difficulty === query.difficulty
      );
    }

    return {
      skills: matchingSkills,
      packs: matchingPacks,
      total: matchingSkills.length + matchingPacks.length,
    };
  }

  /**
   * Get the loader instance
   */
  getLoader(): MethodologyLoader {
    return this.loader;
  }

  // Private helpers

  private loadState(): MethodologyState {
    const statePath = join(this.projectPath, METHODOLOGY_STATE_FILE);
    if (existsSync(statePath)) {
      try {
        return JSON.parse(readFileSync(statePath, 'utf-8'));
      } catch {
        // Return default state on error
      }
    }
    return {
      version: 1,
      installedPacks: {},
      installedSkills: {},
    };
  }

  private saveState(): void {
    const statePath = join(this.projectPath, METHODOLOGY_STATE_FILE);
    const dir = dirname(statePath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(statePath, JSON.stringify(this.state, null, 2), 'utf-8');
  }

  private async installSkillLocally(skill: MethodologySkill): Promise<void> {
    // Copy skill to local .skillkit/methodology/skills directory
    const skillsDir = join(this.projectPath, '.skillkit', 'methodology', 'skills');
    const skillDir = join(skillsDir, skill.pack, skill.id.split('/')[1]);

    if (!existsSync(skillDir)) {
      mkdirSync(skillDir, { recursive: true });
    }

    const targetPath = join(skillDir, 'SKILL.md');
    writeFileSync(targetPath, skill.content, 'utf-8');
  }

  private async removeSkillLocally(_skillId: string): Promise<void> {
    // Note: We don't delete the skill directory to avoid accidental data loss
    // The skill is just marked as uninstalled in state
    // Future enhancement: add optional force delete flag
  }

  private async writeSkillToAgent(
    skillId: string,
    content: string,
    agent: AgentType
  ): Promise<void> {
    const agentDirs: Record<string, string> = {
      'claude-code': '.claude/skills',
      cursor: '.cursor/skills',
      codex: '.codex/skills',
      'gemini-cli': '.gemini/skills',
      opencode: '.opencode/skills',
      antigravity: '.antigravity/skills',
      amp: '.amp/skills',
      clawdbot: '.clawdbot/skills',
      droid: '.factory/skills',
      'github-copilot': '.github/skills',
      goose: '.goose/skills',
      kilo: '.kilocode/skills',
      'kiro-cli': '.kiro/skills',
      roo: '.roo/skills',
      trae: '.trae/skills',
      windsurf: '.windsurf/skills',
      universal: 'skills',
    };

    const agentDir = agentDirs[agent];
    if (!agentDir) {
      throw new Error(`Unknown agent: ${agent}`);
    }

    const skillsDir = join(this.projectPath, agentDir);
    if (!existsSync(skillsDir)) {
      mkdirSync(skillsDir, { recursive: true });
    }

    // Determine filename based on agent format
    const skillName = skillId.split('/')[1];
    let filename: string;

    if (agent === 'cursor') {
      filename = `${skillName}.mdc`;
    } else if (agent === 'github-copilot' || agent === 'windsurf') {
      filename = `${skillName}.md`;
    } else {
      filename = `${skillName}.md`;
    }

    const targetPath = join(skillsDir, filename);
    writeFileSync(targetPath, content, 'utf-8');
  }

  private detectAgents(): AgentType[] {
    const agents: AgentType[] = [];
    const agentDirs: [AgentType, string][] = [
      ['claude-code', '.claude'],
      ['cursor', '.cursor'],
      ['codex', '.codex'],
      ['gemini-cli', '.gemini'],
      ['opencode', '.opencode'],
      ['antigravity', '.antigravity'],
      ['amp', '.amp'],
      ['clawdbot', '.clawdbot'],
      ['droid', '.factory'],
      ['github-copilot', '.github'],
      ['goose', '.goose'],
      ['kilo', '.kilocode'],
      ['kiro-cli', '.kiro'],
      ['roo', '.roo'],
      ['trae', '.trae'],
      ['windsurf', '.windsurf'],
    ];

    for (const [agent, dir] of agentDirs) {
      if (existsSync(join(this.projectPath, dir))) {
        agents.push(agent);
      }
    }

    // Always include universal
    agents.push('universal');

    return agents;
  }
}

/**
 * Create a methodology manager instance
 */
export function createMethodologyManager(
  options: MethodologyManagerOptions
): MethodologyManager {
  return new MethodologyManager(options);
}
