import { useState, useCallback, useEffect } from 'react';
import {
  RecommendationEngine,
  ContextManager,
  type ScoredSkill,
  type ProjectProfile,
  loadIndex as loadIndexFromCache,
  saveIndex,
  buildSkillIndex,
  isIndexStale,
  KNOWN_SKILL_REPOS,
} from '@skillkit/core';

interface UseRecommendResult {
  recommendations: ScoredSkill[];
  profile: ProjectProfile | null;
  loading: boolean;
  error: string | null;
  totalScanned: number;
  indexStatus: 'missing' | 'stale' | 'fresh';
  refresh: () => void;
  updateIndex: () => void;
  search: (query: string) => void;
  searchResults: ScoredSkill[];
}

export function useRecommend(projectPath: string = process.cwd()): UseRecommendResult {
  const [recommendations, setRecommendations] = useState<ScoredSkill[]>([]);
  const [searchResults, setSearchResults] = useState<ScoredSkill[]>([]);
  const [profile, setProfile] = useState<ProjectProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalScanned, setTotalScanned] = useState(0);
  const [indexStatus, setIndexStatus] = useState<'missing' | 'stale' | 'fresh'>('missing');
  const [engine] = useState(() => new RecommendationEngine());

  const loadIndex = useCallback(() => {
    const index = loadIndexFromCache();

    if (!index) {
      setIndexStatus('missing');
      return null;
    }

    // Check if index is stale
    if (isIndexStale(index)) {
      setIndexStatus('stale');
    } else {
      setIndexStatus('fresh');
    }

    return index;
  }, []);

  const getProjectProfile = useCallback((): ProjectProfile | null => {
    try {
      const manager = new ContextManager(projectPath);
      let context = manager.get();

      if (!context) {
        context = manager.init();
      }

      if (!context) {
        return null;
      }

      return {
        name: context.project.name,
        type: context.project.type,
        stack: context.stack,
        patterns: context.patterns,
        installedSkills: context.skills?.installed || [],
        excludedSkills: context.skills?.excluded || [],
      };
    } catch {
      return null;
    }
  }, [projectPath]);

  const loadRecommendations = useCallback(() => {
    setLoading(true);
    setError(null);

    try {
      // Load project profile
      const projectProfile = getProjectProfile();
      if (!projectProfile) {
        setError('Failed to analyze project');
        setLoading(false);
        return;
      }
      setProfile(projectProfile);

      // Load skill index
      const index = loadIndex();
      if (!index || index.skills.length === 0) {
        setRecommendations([]);
        setTotalScanned(0);
        setLoading(false);
        return;
      }

      engine.loadIndex(index);

      // Get recommendations
      const result = engine.recommend(projectProfile, {
        limit: 20,
        minScore: 20,
        excludeInstalled: true,
        includeReasons: true,
      });

      setRecommendations(result.recommendations);
      setTotalScanned(result.totalSkillsScanned);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get recommendations');
    } finally {
      setLoading(false);
    }
  }, [engine, getProjectProfile, loadIndex]);

  const updateIndex = useCallback(() => {
    setLoading(true);
    setError(null);

    // Fetch skills from known GitHub repositories
    buildSkillIndex(KNOWN_SKILL_REPOS)
      .then(({ index, errors }) => {
        if (errors.length > 0) {
          console.warn('Index update warnings:', errors);
        }

        // Save the fetched index
        saveIndex(index);
        setIndexStatus('fresh');

        // Reload recommendations with new index
        loadRecommendations();
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to update index');
        setLoading(false);
      });
  }, [loadRecommendations]);

  const search = useCallback((query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const results = engine.search({
      query,
      limit: 10,
      semantic: true,
    });

    // Convert SearchResult to ScoredSkill for consistency
    const scoredResults: ScoredSkill[] = results.map(r => ({
      skill: r.skill,
      score: r.relevance,
      reasons: r.matchedTerms.map(term => ({
        category: 'tag' as const,
        description: `Matched: ${term}`,
        weight: 0,
        matched: [term],
      })),
      warnings: [],
    }));

    setSearchResults(scoredResults);
  }, [engine]);

  const refresh = useCallback(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  // Initial load
  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  return {
    recommendations,
    profile,
    loading,
    error,
    totalScanned,
    indexStatus,
    refresh,
    updateIndex,
    search,
    searchResults,
  };
}
