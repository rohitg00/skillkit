import { useState, useEffect } from 'react';
import { getSearchDirs } from '../../core/config.js';
import { findAllSkills } from '../../core/skills.js';
import type { SkillItem } from '../components/SkillList.js';

interface UseSkillsResult {
  skills: SkillItem[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
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
        source: s.source,
        enabled: s.enabled,
      }));

      setSkills(skillItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load skills');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return { skills, loading, error, refresh };
}

interface UseSkillStatsResult {
  projectCount: number;
  globalCount: number;
  enabledCount: number;
  agentCount: number;
}

export function useSkillStats(): UseSkillStatsResult {
  const { skills } = useSkills();

  return {
    projectCount: skills.length,
    globalCount: 0,
    enabledCount: skills.filter((s) => s.enabled !== false).length,
    agentCount: 1,
  };
}
