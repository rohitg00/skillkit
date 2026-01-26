/**
 * Skills state management for SkillKit TUI
 */
import { findAllSkills } from '@skillkit/core';
import { rmSync } from 'node:fs';
import { resolve, normalize } from 'node:path';
import { getSearchDirs } from '../utils/helpers.js';
import type { SkillItem } from './types.js';
import type { AgentType } from '@skillkit/core';

/**
 * Skills store state
 */
export interface SkillsState {
  skills: SkillItem[];
  loading: boolean;
  error: string | null;
}

/**
 * Create initial skills state
 */
export function createSkillsState(): SkillsState {
  return {
    skills: [],
    loading: true,
    error: null,
  };
}

/**
 * Load installed skills
 * @param agentType - Optional agent type to load skills for
 * @returns Updated skills state
 */
export function loadSkills(agentType?: AgentType): SkillsState {
  try {
    const searchDirs = getSearchDirs(agentType);
    const foundSkills = findAllSkills(searchDirs);

    const skillItems: SkillItem[] = foundSkills.map((s) => ({
      name: s.name,
      description: s.description,
      source: s.metadata?.source,
      enabled: s.enabled,
    }));

    return {
      skills: skillItems,
      loading: false,
      error: null,
    };
  } catch (err) {
    return {
      skills: [],
      loading: false,
      error: err instanceof Error ? err.message : 'Failed to load skills',
    };
  }
}

/**
 * Remove a skill by name
 * @param skillName - Name of the skill to remove
 * @param agentType - Optional agent type
 * @returns true if removed, false otherwise
 */
export function removeSkill(skillName: string, agentType?: AgentType): boolean {
  try {
    const searchDirs = getSearchDirs(agentType);
    const allSkills = findAllSkills(searchDirs);
    const skill = allSkills.find((s) => s.name === skillName);

    if (skill) {
      const normalizedPath = normalize(resolve(skill.path));
      const isWithinSearchDirs = searchDirs.some((dir) => {
        const normalizedDir = normalize(resolve(dir));
        return normalizedPath.startsWith(normalizedDir + '/') || normalizedPath === normalizedDir;
      });

      if (!isWithinSearchDirs) {
        return false;
      }

      rmSync(skill.path, { recursive: true, force: true });
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Filter skills by search query
 */
export function filterSkills(skills: SkillItem[], query: string): SkillItem[] {
  if (!query.trim()) return skills;

  const lowerQuery = query.toLowerCase();
  return skills.filter(
    (s) =>
      s.name.toLowerCase().includes(lowerQuery) ||
      s.description?.toLowerCase().includes(lowerQuery) ||
      s.source?.toLowerCase().includes(lowerQuery)
  );
}
