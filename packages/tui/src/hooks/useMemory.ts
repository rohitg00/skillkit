import { useState, useEffect, useCallback } from 'react';
import {
  LearningStore,
  ObservationStore,
  getMemoryStatus,
  createMemoryInjector,
  type Learning,
  type Observation,
  type MemoryStatus,
} from '@skillkit/core';

interface UseMemoryResult {
  learnings: Learning[];
  observations: Observation[];
  status: MemoryStatus | null;
  loading: boolean;
  error: string | null;
  isGlobal: boolean;
  setIsGlobal: (isGlobal: boolean) => void;
  refresh: () => void;
  search: (query: string) => Learning[];
  deleteLearning: (id: string) => boolean;
  deleteObservation: (id: string) => boolean;
}

export function useMemory(): UseMemoryResult {
  const [learnings, setLearnings] = useState<Learning[]>([]);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [status, setStatus] = useState<MemoryStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGlobal, setIsGlobal] = useState(false);

  const projectPath = process.cwd();

  const refresh = useCallback(() => {
    setLoading(true);
    setError(null);

    try {
      // Get memory status
      const memStatus = getMemoryStatus(projectPath);
      setStatus(memStatus);

      // Load learnings
      const learningStore = new LearningStore(
        isGlobal ? 'global' : 'project',
        isGlobal ? undefined : projectPath
      );
      setLearnings(learningStore.getAll());

      // Load observations (project only)
      if (memStatus.hasObservations) {
        const obsStore = new ObservationStore(projectPath);
        setObservations(obsStore.getAll());
      } else {
        setObservations([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load memory');
      setLearnings([]);
      setObservations([]);
    } finally {
      setLoading(false);
    }
  }, [projectPath, isGlobal]);

  const search = useCallback(
    (query: string): Learning[] => {
      if (!query.trim()) {
        return [];
      }

      try {
        const injector = createMemoryInjector(projectPath);
        const results = injector.search(query, {
          includeGlobal: true,
          maxLearnings: 50,
          minRelevance: 0,
        });
        return results.map((r) => r.learning);
      } catch {
        return [];
      }
    },
    [projectPath]
  );

  const deleteLearning = useCallback(
    (id: string): boolean => {
      try {
        const store = new LearningStore(
          isGlobal ? 'global' : 'project',
          isGlobal ? undefined : projectPath
        );
        const result = store.delete(id);
        if (result) {
          refresh();
        }
        return result;
      } catch {
        return false;
      }
    },
    [projectPath, isGlobal, refresh]
  );

  const deleteObservation = useCallback(
    (id: string): boolean => {
      try {
        const store = new ObservationStore(projectPath);
        const result = store.delete(id);
        if (result) {
          refresh();
        }
        return result;
      } catch {
        return false;
      }
    },
    [projectPath, refresh]
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    learnings,
    observations,
    status,
    loading,
    error,
    isGlobal,
    setIsGlobal,
    refresh,
    search,
    deleteLearning,
    deleteObservation,
  };
}
