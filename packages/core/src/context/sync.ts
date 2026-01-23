import { existsSync, writeFileSync, mkdirSync, copyFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { AgentType } from '../types.js';
import type { ContextSyncOptions } from './types.js';
import { ContextManager } from './manager.js';
import { translateSkillFile } from '../translator/index.js';
import { findAllSkills } from '../skills.js';

/**
 * Result of a sync operation
 */
export interface SyncResult {
  success: boolean;
  agent: AgentType;
  skillsSynced: number;
  skillsSkipped: number;
  errors: string[];
  warnings: string[];
  files: string[];
}

/**
 * Overall sync report
 */
export interface SyncReport {
  totalAgents: number;
  successfulAgents: number;
  totalSkills: number;
  results: SyncResult[];
}

/**
 * Agent directory configuration
 */
const AGENT_DIRS: Record<AgentType, { skillsDir: string; configFile: string }> = {
  'claude-code': { skillsDir: '.claude/skills', configFile: 'AGENTS.md' },
  'cursor': { skillsDir: '.cursor/skills', configFile: '.cursorrules' },
  'codex': { skillsDir: '.codex/skills', configFile: 'AGENTS.md' },
  'gemini-cli': { skillsDir: '.gemini/skills', configFile: 'GEMINI.md' },
  'opencode': { skillsDir: '.opencode/skills', configFile: 'AGENTS.md' },
  'antigravity': { skillsDir: '.antigravity/skills', configFile: 'AGENTS.md' },
  'amp': { skillsDir: '.agents/skills', configFile: 'AGENTS.md' },
  'clawdbot': { skillsDir: 'skills', configFile: 'AGENTS.md' },
  'droid': { skillsDir: '.factory/skills', configFile: 'AGENTS.md' },
  'github-copilot': { skillsDir: '.github/skills', configFile: 'AGENTS.md' },
  'goose': { skillsDir: '.goose/skills', configFile: 'AGENTS.md' },
  'kilo': { skillsDir: '.kilocode/skills', configFile: 'AGENTS.md' },
  'kiro-cli': { skillsDir: '.kiro/skills', configFile: 'AGENTS.md' },
  'roo': { skillsDir: '.roo/skills', configFile: 'AGENTS.md' },
  'trae': { skillsDir: '.trae/skills', configFile: 'AGENTS.md' },
  'windsurf': { skillsDir: '.windsurf/skills', configFile: 'AGENTS.md' },
  'universal': { skillsDir: '.agent/skills', configFile: 'AGENTS.md' },
};

/**
 * Context Sync
 *
 * Handles syncing skills across multiple AI agents.
 * Skills are translated to the appropriate format for each agent.
 */
export class ContextSync {
  private projectPath: string;
  private contextManager: ContextManager;

  constructor(projectPath: string = process.cwd()) {
    this.projectPath = projectPath;
    this.contextManager = new ContextManager(projectPath);
  }

  /**
   * Detect which agents are installed/configured on the system
   */
  detectAgents(): AgentType[] {
    const detected: AgentType[] = [];

    for (const [agent, config] of Object.entries(AGENT_DIRS)) {
      const skillsPath = join(this.projectPath, config.skillsDir);
      const configPath = join(this.projectPath, config.configFile);

      // Check if either skills directory or config file exists
      if (existsSync(skillsPath) || existsSync(configPath)) {
        detected.push(agent as AgentType);
      }
    }

    // Also check for global indicators
    const homeDir = process.env.HOME || process.env.USERPROFILE || '';
    if (homeDir) {
      // Check for Claude Code
      if (existsSync(join(homeDir, '.claude'))) {
        if (!detected.includes('claude-code')) detected.push('claude-code');
      }
      // Check for Cursor
      if (existsSync(join(homeDir, '.cursor'))) {
        if (!detected.includes('cursor')) detected.push('cursor');
      }
    }

    return detected;
  }

  /**
   * Get agents to sync to based on context
   */
  getTargetAgents(options: ContextSyncOptions = {}): AgentType[] {
    // If specific agents provided, use those
    if (options.agents?.length) {
      return options.agents;
    }

    // Load context
    const context = this.contextManager.get();
    if (context?.agents?.synced?.length) {
      return context.agents.synced as AgentType[];
    }

    // Auto-detect
    return this.detectAgents();
  }

  /**
   * Sync all skills to all target agents
   */
  async syncAll(options: ContextSyncOptions = {}): Promise<SyncReport> {
    const targetAgents = this.getTargetAgents(options);
    const results: SyncResult[] = [];

    // Get all installed skills from primary agent or first available
    const skills = this.getSourceSkills();

    for (const agent of targetAgents) {
      const result = await this.syncToAgent(agent, skills, options);
      results.push(result);
    }

    // Update context with synced agents
    if (!options.dryRun) {
      this.contextManager.updateAgents({
        detected: this.detectAgents(),
        synced: targetAgents,
      });
    }

    return {
      totalAgents: targetAgents.length,
      successfulAgents: results.filter((r) => r.success).length,
      totalSkills: skills.length,
      results,
    };
  }

  /**
   * Sync skills to a specific agent
   */
  async syncToAgent(
    agent: AgentType,
    skills?: Array<{ name: string; path: string }>,
    options: ContextSyncOptions = {}
  ): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      agent,
      skillsSynced: 0,
      skillsSkipped: 0,
      errors: [],
      warnings: [],
      files: [],
    };

    // Get skills if not provided
    const sourceSkills = skills || this.getSourceSkills();

    // Get target directory
    const agentConfig = AGENT_DIRS[agent];
    if (!agentConfig) {
      result.success = false;
      result.errors.push(`Unknown agent: ${agent}`);
      return result;
    }

    const targetDir = join(this.projectPath, agentConfig.skillsDir);

    // Create target directory if not dry run
    if (!options.dryRun && !existsSync(targetDir)) {
      mkdirSync(targetDir, { recursive: true });
    }

    // Sync each skill
    for (const skill of sourceSkills) {
      try {
        const skillResult = await this.syncSkill(skill, agent, targetDir, options);
        if (skillResult.synced) {
          result.skillsSynced++;
          result.files.push(skillResult.file!);
        } else {
          result.skillsSkipped++;
          if (skillResult.warning) {
            result.warnings.push(skillResult.warning);
          }
        }
      } catch (error) {
        result.errors.push(`Failed to sync ${skill.name}: ${error}`);
        result.skillsSkipped++;
      }
    }

    if (result.errors.length > 0) {
      result.success = false;
    }

    return result;
  }

  /**
   * Sync a single skill to an agent
   */
  private async syncSkill(
    skill: { name: string; path: string },
    agent: AgentType,
    targetDir: string,
    options: ContextSyncOptions
  ): Promise<{ synced: boolean; file?: string; warning?: string }> {
    const skillMdPath = join(skill.path, 'SKILL.md');

    if (!existsSync(skillMdPath)) {
      return { synced: false, warning: `No SKILL.md found for ${skill.name}` };
    }

    // Translate skill to target format
    const translation = translateSkillFile(skillMdPath, agent, {
      addMetadata: true,
    });

    if (!translation.success) {
      return { synced: false, warning: `Translation failed for ${skill.name}` };
    }

    // Determine output path
    const targetSkillDir = join(targetDir, skill.name);
    const outputPath = join(targetSkillDir, translation.filename);

    // Check if file exists and skip if not forcing
    if (existsSync(outputPath) && !options.force) {
      return { synced: false, warning: `${skill.name} already exists (use --force to overwrite)` };
    }

    // Write file (unless dry run)
    if (!options.dryRun) {
      if (!existsSync(targetSkillDir)) {
        mkdirSync(targetSkillDir, { recursive: true });
      }
      writeFileSync(outputPath, translation.content, 'utf-8');

      // Copy additional skill assets if they exist
      await this.copySkillAssets(skill.path, targetSkillDir);
    }

    return { synced: true, file: outputPath };
  }

  /**
   * Copy additional skill assets (references, scripts, etc.)
   */
  private async copySkillAssets(sourcePath: string, targetPath: string): Promise<void> {
    const assetDirs = ['references', 'scripts', 'assets', 'templates'];

    for (const assetDir of assetDirs) {
      const sourceAssetDir = join(sourcePath, assetDir);
      if (existsSync(sourceAssetDir)) {
        const targetAssetDir = join(targetPath, assetDir);
        if (!existsSync(targetAssetDir)) {
          mkdirSync(targetAssetDir, { recursive: true });
        }

        // Copy files
        try {
          const files = readdirSync(sourceAssetDir);
          for (const file of files) {
            const sourcefile = join(sourceAssetDir, file);
            const targetFile = join(targetAssetDir, file);
            copyFileSync(sourcefile, targetFile);
          }
        } catch {
          // Ignore copy errors
        }
      }
    }
  }

  /**
   * Get source skills to sync
   */
  private getSourceSkills(): Array<{ name: string; path: string }> {
    const context = this.contextManager.get();
    const primaryAgent = context?.agents?.primary as AgentType | undefined;

    // Search directories based on primary agent or common locations
    const searchDirs: string[] = [];

    if (primaryAgent && AGENT_DIRS[primaryAgent]) {
      searchDirs.push(join(this.projectPath, AGENT_DIRS[primaryAgent].skillsDir));
    }

    // Add common skill locations
    const commonDirs = [
      '.claude/skills',
      '.cursor/skills',
      '.agent/skills',
      'skills',
    ];

    for (const dir of commonDirs) {
      const fullPath = join(this.projectPath, dir);
      if (!searchDirs.includes(fullPath) && existsSync(fullPath)) {
        searchDirs.push(fullPath);
      }
    }

    // Find all skills
    const skills = findAllSkills(searchDirs);
    return skills.map((s) => ({ name: s.name, path: s.path }));
  }

  /**
   * Check sync status - which agents have which skills
   */
  checkStatus(): Record<AgentType, { hasSkills: boolean; skillCount: number; skills: string[] }> {
    const status: Record<string, { hasSkills: boolean; skillCount: number; skills: string[] }> = {};

    for (const [agent, config] of Object.entries(AGENT_DIRS)) {
      const skillsPath = join(this.projectPath, config.skillsDir);
      const skills: string[] = [];

      if (existsSync(skillsPath)) {
        try {
          const entries = readdirSync(skillsPath, { withFileTypes: true });
          for (const entry of entries) {
            if (entry.isDirectory()) {
              skills.push(entry.name);
            }
          }
        } catch {
          // Ignore errors
        }
      }

      status[agent] = {
        hasSkills: skills.length > 0,
        skillCount: skills.length,
        skills,
      };
    }

    return status as Record<AgentType, { hasSkills: boolean; skillCount: number; skills: string[] }>;
  }
}

/**
 * Create a context sync instance
 */
export function createContextSync(projectPath?: string): ContextSync {
  return new ContextSync(projectPath);
}

/**
 * Sync skills to all detected agents
 */
export async function syncToAllAgents(
  projectPath?: string,
  options?: ContextSyncOptions
): Promise<SyncReport> {
  const sync = new ContextSync(projectPath);
  return sync.syncAll(options);
}

/**
 * Sync skills to a specific agent
 */
export async function syncToAgent(
  agent: AgentType,
  projectPath?: string,
  options?: ContextSyncOptions
): Promise<SyncResult> {
  const sync = new ContextSync(projectPath);
  return sync.syncToAgent(agent, undefined, options);
}
