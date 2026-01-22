import { useState, useEffect } from 'react';
import { getSearchDirs } from '../../core/config.js';
import { findAllSkills } from '../../core/skills.js';
import type { SkillItem } from '../components/SkillList.js';

interface UseSkillsResult {
  skills: SkillItem[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
  remove: (name: string) => Promise<void>;
}

export function useSkills(): UseSkillsResult {
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = () => {
    setLoading(true);
    setError(null);

    try {
      const searchDirs = getSearchDirs();
      const foundSkills = findAllSkills(searchDirs);

      const skillItems: SkillItem[] = foundSkills.map((s) => ({
        name: s.name,
        description: s.description,
        source: s.metadata?.source,
        enabled: s.enabled,
      }));

      setSkills(skillItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load skills');
    } finally {
      setLoading(false);
    }
  };

  const remove = async (name: string) => {
    const { rmSync } = await import('node:fs');
    const foundSkill = skills.find(s => s.name === name);
    if (foundSkill) {
      const searchDirs = getSearchDirs();
      const allSkills = findAllSkills(searchDirs);
      const skill = allSkills.find(s => s.name === name);
      if (skill) {
        rmSync(skill.path, { recursive: true, force: true });
        refresh();
      }
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return { skills, loading, error, refresh, remove };
}
