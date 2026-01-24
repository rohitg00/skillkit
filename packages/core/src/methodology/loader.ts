/**
 * Methodology Loader
 *
 * Loads methodology packs and skills from the built-in packs directory
 * and custom locations.
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type {
  MethodologyPack,
  MethodologySkill,
  MethodologySkillMetadata,
} from './types.js';
import { validatePackDirectory, extractSkillMetadata } from './validator.js';

// Get the directory of this module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Built-in packs directory (relative to this file in dist)
const BUILTIN_PACKS_DIR = join(__dirname, 'packs');

/**
 * Methodology Loader class
 */
export class MethodologyLoader {
  private packsDir: string;
  private loadedPacks: Map<string, MethodologyPack> = new Map();
  private loadedSkills: Map<string, MethodologySkill> = new Map();

  constructor(customPacksDir?: string) {
    this.packsDir = customPacksDir || BUILTIN_PACKS_DIR;
  }

  /**
   * Load all available packs
   */
  async loadAllPacks(): Promise<MethodologyPack[]> {
    const packs: MethodologyPack[] = [];

    if (!existsSync(this.packsDir)) {
      return packs;
    }

    const packDirs = readdirSync(this.packsDir).filter((name) => {
      const packPath = join(this.packsDir, name);
      return statSync(packPath).isDirectory();
    });

    for (const packName of packDirs) {
      try {
        const pack = await this.loadPack(packName);
        if (pack) {
          packs.push(pack);
        }
      } catch {
        // Skip invalid packs
      }
    }

    return packs;
  }

  /**
   * Load a specific pack by name
   */
  async loadPack(packName: string): Promise<MethodologyPack | null> {
    // Check cache
    if (this.loadedPacks.has(packName)) {
      return this.loadedPacks.get(packName)!;
    }

    const packPath = join(this.packsDir, packName);
    const manifestPath = join(packPath, 'pack.json');

    if (!existsSync(manifestPath)) {
      return null;
    }

    // Validate pack
    const validation = validatePackDirectory(packPath);
    if (!validation.valid) {
      throw new Error(
        `Invalid pack "${packName}": ${validation.errors.map((e) => e.message).join(', ')}`
      );
    }

    // Load manifest
    const manifest = JSON.parse(
      readFileSync(manifestPath, 'utf-8')
    ) as MethodologyPack;

    // Cache and return
    this.loadedPacks.set(packName, manifest);
    return manifest;
  }

  /**
   * Load all skills from a pack
   */
  async loadPackSkills(packName: string): Promise<MethodologySkill[]> {
    const pack = await this.loadPack(packName);
    if (!pack) {
      throw new Error(`Pack not found: ${packName}`);
    }

    const skills: MethodologySkill[] = [];

    for (const skillName of pack.skills) {
      const skill = await this.loadSkill(packName, skillName);
      if (skill) {
        skills.push(skill);
      }
    }

    return skills;
  }

  /**
   * Load a specific skill
   */
  async loadSkill(
    packName: string,
    skillName: string
  ): Promise<MethodologySkill | null> {
    const skillId = `${packName}/${skillName}`;

    // Check cache
    if (this.loadedSkills.has(skillId)) {
      return this.loadedSkills.get(skillId)!;
    }

    const skillPath = join(this.packsDir, packName, skillName, 'SKILL.md');

    if (!existsSync(skillPath)) {
      return null;
    }

    const content = readFileSync(skillPath, 'utf-8');
    const rawMetadata = extractSkillMetadata(content);

    // Parse metadata with defaults
    const metadata: MethodologySkillMetadata = {
      triggers: rawMetadata.triggers as string[] | undefined,
      relatedSkills: rawMetadata.relatedSkills as string[] | undefined,
      difficulty: rawMetadata.difficulty as MethodologySkillMetadata['difficulty'],
      estimatedTime: rawMetadata.estimatedTime as number | undefined,
      prerequisites: rawMetadata.prerequisites as string[] | undefined,
      ...rawMetadata,
    };

    const skill: MethodologySkill = {
      id: skillId,
      name: (rawMetadata.name as string) || formatSkillName(skillName),
      description: (rawMetadata.description as string) || '',
      version: (rawMetadata.version as string) || '1.0.0',
      pack: packName,
      tags: (rawMetadata.tags as string[]) || [],
      path: skillPath,
      content,
      metadata,
    };

    // Cache and return
    this.loadedSkills.set(skillId, skill);
    return skill;
  }

  /**
   * Get skill by full ID (pack/skill)
   */
  async getSkillById(skillId: string): Promise<MethodologySkill | null> {
    const [packName, skillName] = skillId.split('/');
    if (!packName || !skillName) {
      return null;
    }
    return this.loadSkill(packName, skillName);
  }

  /**
   * Search skills by query
   */
  async searchSkills(query: string): Promise<MethodologySkill[]> {
    const allSkills: MethodologySkill[] = [];
    const packs = await this.loadAllPacks();

    for (const pack of packs) {
      const skills = await this.loadPackSkills(pack.name);
      allSkills.push(...skills);
    }

    if (!query) {
      return allSkills;
    }

    const lowerQuery = query.toLowerCase();
    return allSkills.filter((skill) => {
      return (
        skill.name.toLowerCase().includes(lowerQuery) ||
        skill.description.toLowerCase().includes(lowerQuery) ||
        skill.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
        skill.metadata.triggers?.some((t) =>
          t.toLowerCase().includes(lowerQuery)
        )
      );
    });
  }

  /**
   * Get skills by tag
   */
  async getSkillsByTag(tag: string): Promise<MethodologySkill[]> {
    const allSkills: MethodologySkill[] = [];
    const packs = await this.loadAllPacks();

    for (const pack of packs) {
      const skills = await this.loadPackSkills(pack.name);
      allSkills.push(...skills);
    }

    const lowerTag = tag.toLowerCase();
    return allSkills.filter((skill) =>
      skill.tags.some((t) => t.toLowerCase() === lowerTag)
    );
  }

  /**
   * Get built-in packs directory path
   */
  getPacksDir(): string {
    return this.packsDir;
  }

  /**
   * Check if a pack exists
   */
  packExists(packName: string): boolean {
    const packPath = join(this.packsDir, packName);
    const manifestPath = join(packPath, 'pack.json');
    return existsSync(manifestPath);
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.loadedPacks.clear();
    this.loadedSkills.clear();
  }
}

/**
 * Format skill directory name to display name
 */
function formatSkillName(dirName: string): string {
  return dirName
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Create a methodology loader instance
 */
export function createMethodologyLoader(
  customPacksDir?: string
): MethodologyLoader {
  return new MethodologyLoader(customPacksDir);
}

/**
 * Get the built-in packs directory
 */
export function getBuiltinPacksDir(): string {
  return BUILTIN_PACKS_DIR;
}
