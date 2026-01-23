import { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { colors, symbols } from '../theme.js';
import {
  ObservationStore,
  LearningStore,
  getMemoryStatus,
  getMemoryPaths,
  createMemoryInjector,
  type Learning,
} from '@skillkit/core';

interface Props {
  cols?: number;
  rows?: number;
}

type Tab = 'learnings' | 'observations' | 'search';

export function Memory({ rows = 24 }: Props) {
  const [tab, setTab] = useState<Tab>('learnings');
  const [learnings, setLearnings] = useState<Learning[]>([]);
  const [observationCount, setObservationCount] = useState(0);
  const [globalCount, setGlobalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Learning[]>([]);
  const [isGlobal, setIsGlobal] = useState(false);

  const maxVisible = Math.max(5, rows - 10);
  const currentList = tab === 'search' ? searchResults : learnings;
  const start = Math.max(0, Math.min(sel - Math.floor(maxVisible / 2), currentList.length - maxVisible));
  const visible = currentList.slice(start, start + maxVisible);

  useEffect(() => {
    loadMemory();
  }, [isGlobal]);

  const loadMemory = () => {
    setLoading(true);
    try {
      const projectPath = process.cwd();
      const status = getMemoryStatus(projectPath);

      // Load learnings
      const store = new LearningStore(
        isGlobal ? 'global' : 'project',
        isGlobal ? undefined : projectPath
      );
      setLearnings(store.getAll());

      // Get counts
      if (status.hasObservations) {
        const obsStore = new ObservationStore(projectPath);
        setObservationCount(obsStore.count());
      } else {
        setObservationCount(0);
      }

      if (status.hasGlobalLearnings) {
        const globalStore = new LearningStore('global');
        setGlobalCount(globalStore.count());
      } else {
        setGlobalCount(0);
      }
    } catch {
      setLearnings([]);
      setObservationCount(0);
      setGlobalCount(0);
    }
    setLoading(false);
  };

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const projectPath = process.cwd();
      const injector = createMemoryInjector(projectPath);
      const results = injector.search(query, {
        includeGlobal: true,
        maxLearnings: 20,
        minRelevance: 0,
      });
      setSearchResults(results.map(r => r.learning));
    } catch {
      setSearchResults([]);
    }
  };

  useInput((input, key) => {
    if (loading) return;

    // Tab navigation
    if (input === '1') { setTab('learnings'); setSel(0); setExpanded(false); }
    else if (input === '2') { setTab('observations'); setSel(0); setExpanded(false); }
    else if (input === '3') { setTab('search'); setSel(0); setExpanded(false); }

    // List navigation
    else if (key.upArrow) {
      setSel(i => Math.max(0, i - 1));
      setExpanded(false);
    }
    else if (key.downArrow) {
      setSel(i => Math.min(currentList.length - 1, i + 1));
      setExpanded(false);
    }

    // Actions (use 'f' for refresh to avoid conflict with global 'r' for Recommend)
    else if (input === 'f') loadMemory();
    else if (input === 'g') setIsGlobal(g => !g);
    else if (key.return) setExpanded(e => !e);

    // Search input (basic)
    else if (tab === 'search' && input && input.length === 1 && !key.ctrl && !key.meta) {
      const newQuery = searchQuery + input;
      setSearchQuery(newQuery);
      handleSearch(newQuery);
    }
    else if (tab === 'search' && key.backspace) {
      const newQuery = searchQuery.slice(0, -1);
      setSearchQuery(newQuery);
      handleSearch(newQuery);
    }
  });

  const ONE_MINUTE = 60_000;
  const ONE_HOUR = 3_600_000;
  const ONE_DAY = 86_400_000;

  function formatDate(iso: string): string {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();

    if (diff < ONE_MINUTE) return 'Just now';
    if (diff < ONE_HOUR) return `${Math.floor(diff / ONE_MINUTE)}m ago`;
    if (diff < ONE_DAY) return `${Math.floor(diff / ONE_HOUR)}h ago`;
    return d.toLocaleDateString();
  }

  function formatEffectiveness(eff?: number): string {
    if (eff === undefined) return '  -';
    return eff.toString().padStart(3) + '%';
  }

  function getEffectivenessColor(eff?: number): string | undefined {
    if (eff === undefined) return undefined;
    if (eff >= 70) return 'green';
    if (eff >= 40) return 'yellow';
    return 'red';
  }

  const renderLearnings = () => (
    <Box flexDirection="column">
      {currentList.length === 0 && (
        <Box marginTop={1} flexDirection="column">
          <Text dimColor>No learnings found.</Text>
          <Text dimColor>Run skills to capture learnings, or add manually:</Text>
          <Text dimColor>  skillkit memory add --title "..." --content "..."</Text>
        </Box>
      )}

      {currentList.length > 0 && (
        <Box marginTop={1} flexDirection="column">
          {start > 0 && <Text dimColor>  {symbols.arrowUp} {start} more</Text>}
          {visible.map((learning, i) => {
            const idx = start + i;
            const isSel = idx === sel;

            return (
              <Box key={learning.id} flexDirection="column">
                <Text inverse={isSel}>
                  {isSel ? symbols.pointer : ' '}
                  <Text color={colors.primary}>{symbols.bullet}</Text>
                  {' '}{learning.title.slice(0, 35).padEnd(35)}{' '}
                  <Text dimColor>{learning.tags.slice(0, 2).join(', ').slice(0, 15).padEnd(15)}</Text>
                  {' '}<Text color={getEffectivenessColor(learning.effectiveness)}>{formatEffectiveness(learning.effectiveness)}</Text>
                  {' '}<Text dimColor>{formatDate(learning.updatedAt)}</Text>
                </Text>
                {isSel && expanded && (
                  <Box flexDirection="column" marginLeft={3} marginY={1}>
                    <Text dimColor>ID: {learning.id.slice(0, 8)}</Text>
                    <Text dimColor>Scope: {learning.scope}</Text>
                    <Text dimColor>Source: {learning.source}</Text>
                    <Text dimColor>Tags: {learning.tags.join(', ')}</Text>
                    {learning.frameworks && learning.frameworks.length > 0 && (
                      <Text dimColor>Frameworks: {learning.frameworks.join(', ')}</Text>
                    )}
                    <Text dimColor>Uses: {learning.useCount}</Text>
                    <Box marginTop={1}>
                      <Text wrap="wrap">{learning.content.slice(0, 300)}{learning.content.length > 300 ? '...' : ''}</Text>
                    </Box>
                  </Box>
                )}
              </Box>
            );
          })}
          {start + maxVisible < currentList.length && (
            <Text dimColor>  {symbols.arrowDown} {currentList.length - start - maxVisible} more</Text>
          )}
        </Box>
      )}
    </Box>
  );

  const renderObservations = () => (
    <Box flexDirection="column" marginTop={1}>
      <Text>Session Observations: <Text bold color={colors.primary}>{observationCount}</Text></Text>
      <Text dimColor>Observations are raw captures from skill execution.</Text>

      {observationCount > 0 && (
        <Box marginTop={1} flexDirection="column">
          <Text>Compress observations into learnings:</Text>
          <Text dimColor>  skillkit memory compress</Text>
        </Box>
      )}

      {observationCount >= 50 && (
        <Box marginTop={1}>
          <Text color="yellow">{symbols.warning} You have many uncompressed observations.</Text>
        </Box>
      )}

      <Box marginTop={1}>
        <Text dimColor>Observations are stored at:</Text>
      </Box>
      <Text dimColor>  {getMemoryPaths(process.cwd()).observationsFile}</Text>
    </Box>
  );

  const renderSearch = () => (
    <Box flexDirection="column" marginTop={1}>
      <Box>
        <Text>Search: </Text>
        <Text color={colors.primary}>{searchQuery}</Text>
        <Text color={colors.secondary}>_</Text>
      </Box>

      {searchQuery && searchResults.length === 0 && (
        <Box marginTop={1}>
          <Text dimColor>No results found for "{searchQuery}"</Text>
        </Box>
      )}

      {searchResults.length > 0 && renderLearnings()}
    </Box>
  );

  return (
    <Box flexDirection="column">
      <Text bold color={colors.primary}>MEMORY</Text>
      <Text dimColor>
        {isGlobal ? 'Global' : 'Project'}: {learnings.length} learning(s)
        {!isGlobal && globalCount > 0 && <Text> | Global: {globalCount}</Text>}
      </Text>

      {/* Tabs */}
      <Box marginTop={1}>
        <Text inverse={tab === 'learnings'}>[1] Learnings</Text>
        <Text> </Text>
        <Text inverse={tab === 'observations'}>[2] Observations</Text>
        <Text> </Text>
        <Text inverse={tab === 'search'}>[3] Search</Text>
      </Box>

      {loading && <Box marginTop={1}><Text>Loading...</Text></Box>}

      {!loading && tab === 'learnings' && renderLearnings()}
      {!loading && tab === 'observations' && renderObservations()}
      {!loading && tab === 'search' && renderSearch()}

      <Box marginTop={1}>
        <Text dimColor>
          Enter=expand  g=toggle global  f=refresh  1-3=tabs
        </Text>
      </Box>
    </Box>
  );
}
