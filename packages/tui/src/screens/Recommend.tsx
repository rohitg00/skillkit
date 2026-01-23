import { useState } from 'react';
import { existsSync, mkdirSync, cpSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { Box, Text, useInput } from 'ink';
import { colors, symbols } from '../theme.js';
import { useRecommend } from '../hooks/useRecommend.js';
import { detectProvider, type AgentType, type SkillMetadata } from '@skillkit/core';
import { detectAgent, getAdapter, getAllAdapters } from '@skillkit/agents';
import { getInstallDir, saveSkillMetadata } from '../helpers.js';

type View = 'recommendations' | 'search' | 'agents';

interface Props {
  cols?: number;
  rows?: number;
}

export function Recommend({ rows = 24 }: Props) {
  const {
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
  } = useRecommend();

  const [view, setView] = useState<View>('recommendations');
  const [sel, setSel] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState(false);
  const [installing, setInstalling] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<{ name: string; source: string } | null>(null);
  const [agents, setAgents] = useState<{ type: AgentType; name: string; detected: boolean }[]>([]);

  const items = view === 'recommendations'
    ? recommendations
    : view === 'search'
    ? searchResults
    : agents;

  const maxVisible = Math.max(5, rows - 10);
  const start = Math.max(0, Math.min(sel - Math.floor(maxVisible / 2), items.length - maxVisible));
  const visible = items.slice(start, start + maxVisible);

  const showAgentSelection = async (skillName: string, source: string) => {
    setSelectedSkill({ name: skillName, source });
    const adapters = getAllAdapters();
    const agentList: typeof agents = [];
    for (const a of adapters) {
      agentList.push({
        type: a.type as AgentType,
        name: a.name,
        detected: await a.isDetected(),
      });
    }
    setAgents(agentList);
    setView('agents');
    setSel(0);
  };

  const installSkill = async (skillName: string, source: string, agentType?: AgentType) => {
    if (!source) {
      setMessage('Error: No source available for this skill');
      return;
    }

    setInstalling(skillName);
    setMessage(null);

    try {
      const provider = detectProvider(source);
      if (!provider) {
        setMessage(`Error: Unknown provider for ${source}`);
        setInstalling(null);
        return;
      }

      const result = await provider.clone(source, '', { depth: 1 });

      if (!result.success || !result.discoveredSkills) {
        setMessage(`Error: ${result.error || 'Failed to fetch'}`);
        setInstalling(null);
        return;
      }

      const skill = result.discoveredSkills.find(s => s.name === skillName);
      if (!skill) {
        setMessage(`Error: Skill ${skillName} not found in repo`);
        setInstalling(null);
        return;
      }

      const targetAgentType = agentType || await detectAgent();
      const adapter = getAdapter(targetAgentType);
      const installDir = getInstallDir(false, targetAgentType);

      if (!existsSync(installDir)) {
        mkdirSync(installDir, { recursive: true });
      }

      const targetPath = join(installDir, skillName);

      if (existsSync(targetPath)) {
        rmSync(targetPath, { recursive: true, force: true });
      }

      cpSync(skill.path, targetPath, { recursive: true, dereference: true });

      const metadata: SkillMetadata = {
        name: skillName,
        description: '',
        source: source,
        sourceType: provider.type,
        subpath: skillName,
        installedAt: new Date().toISOString(),
        enabled: true,
      };
      saveSkillMetadata(targetPath, metadata);

      if (result.tempRoot) {
        rmSync(result.tempRoot, { recursive: true, force: true });
      }

      setMessage(`✓ Installed ${skillName} to ${adapter.name}`);
    } catch (err) {
      setMessage(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setInstalling(null);
      if (agentType) {
        setSelectedSkill(null);
        setView('recommendations');
      }
    }
  };

  useInput((input, key) => {
    if (loading || installing) return;

    // Handle search input mode
    if (searchMode) {
      if (key.escape) {
        setSearchMode(false);
        setSearchQuery('');
        setView('recommendations');
        return;
      }
      if (key.return) {
        setSearchMode(false);
        if (searchQuery.trim()) {
          search(searchQuery);
          setView('search');
          setSel(0);
        }
        return;
      }
      if (key.backspace || key.delete) {
        setSearchQuery(q => q.slice(0, -1));
        return;
      }
      if (input && !key.ctrl && !key.meta) {
        setSearchQuery(q => q + input);
        return;
      }
      return;
    }

    // Navigation
    if (key.upArrow) setSel(i => Math.max(0, i - 1));
    else if (key.downArrow) setSel(i => Math.min(items.length - 1, i + 1));
    else if (key.return) {
      if (view === 'agents' && agents[sel]) {
        installSkill(selectedSkill!.name, selectedSkill!.source, agents[sel].type);
      } else if ((view === 'recommendations' || view === 'search') && items[sel]) {
        const skill = items[sel] as typeof recommendations[0];
        if (skill.skill.source) {
          installSkill(skill.skill.name, skill.skill.source);
        }
      }
    }
    // Actions
    else if (input === '/') {
      setSearchMode(true);
      setSearchQuery('');
    }
    else if (input === 'm' && (view === 'recommendations' || view === 'search') && items[sel]) {
      const skill = items[sel] as typeof recommendations[0];
      if (skill.skill.source) {
        showAgentSelection(skill.skill.name, skill.skill.source);
      }
    }
    else if (input === 'u') {
      updateIndex();
    }
    else if (input === 'r' && view !== 'recommendations') {
      if (view === 'agents') {
        setView('recommendations');
      } else {
        setView('recommendations');
        setSearchQuery('');
      }
      setSel(0);
    }
    else if (input === 'R') {
      refresh();
    }
  });

  // Agent selection view
  if (view === 'agents') {
    return (
      <Box flexDirection="column">
        <Text bold color={colors.primary}>SELECT AGENT</Text>
        <Text dimColor>Install "{selectedSkill?.name}" to which agent?</Text>

        <Box marginTop={1} flexDirection="column">
          {visible.map((agent, i) => {
            const idx = start + i;
            const isSel = idx === sel;
            const a = agent as typeof agents[0];
            const status = a.detected ? '(ready)' : '(will create)';
            return (
              <Text key={a.type} inverse={isSel}>
                {isSel ? symbols.pointer : ' '} {a.name.padEnd(20)} <Text color={colors.secondaryDim}>{status}</Text>
              </Text>
            );
          })}
        </Box>

        <Box marginTop={1}>
          <Text dimColor>Enter=install  r=back  q=quit</Text>
        </Box>
      </Box>
    );
  }

  // Score bar helper
  const getScoreBar = (score: number): string => {
    const filled = Math.round(score / 10);
    const empty = 10 - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'green';
    if (score >= 50) return 'yellow';
    return 'gray';
  };

  return (
    <Box flexDirection="column">
      <Text bold color={colors.primary}>
        {view === 'search' ? `SEARCH: "${searchQuery}"` : 'RECOMMENDATIONS'}
      </Text>

      {/* Status bar */}
      {loading && <Text dimColor>Loading...</Text>}
      {installing && <Text>Installing {installing}...</Text>}
      {message && <Text dimColor>{message}</Text>}
      {error && <Text color="red">{error}</Text>}

      {/* Search input */}
      {searchMode && (
        <Box marginTop={1}>
          <Text>Search: {searchQuery}</Text>
          <Text dimColor>█</Text>
        </Box>
      )}

      {/* Index status warning */}
      {indexStatus === 'missing' && !loading && (
        <Box marginTop={1} flexDirection="column">
          <Text color="yellow">No skill index found.</Text>
          <Text dimColor>Press 'u' to update index from known sources.</Text>
        </Box>
      )}

      {indexStatus === 'stale' && !loading && (
        <Text dimColor>Index may be outdated. Press 'u' to update.</Text>
      )}

      {/* Profile info */}
      {profile && !searchMode && (
        <Box marginTop={1} flexDirection="column">
          <Text dimColor>
            Project: {profile.name}
            {profile.type ? ` (${profile.type})` : ''}
          </Text>
          {profile.stack.languages.length > 0 && (
            <Text dimColor>
              Stack: {profile.stack.languages.map(l => l.name).join(', ')}
              {profile.stack.frameworks.length > 0 && `, ${profile.stack.frameworks.map(f => f.name).join(', ')}`}
            </Text>
          )}
        </Box>
      )}

      {/* Item count */}
      {!searchMode && (
        <Text dimColor>
          {view === 'search'
            ? `${searchResults.length} results`
            : `${recommendations.length} of ${totalScanned} skills matched`}
        </Text>
      )}

      {/* List */}
      <Box marginTop={1} flexDirection="column">
        {start > 0 && <Text dimColor>  ↑ {start} more</Text>}
        {visible.map((item, i) => {
          const idx = start + i;
          const isSel = idx === sel;
          const skill = (item as typeof recommendations[0]).skill;
          const score = (item as typeof recommendations[0]).score;

          return (
            <Box key={skill.name} flexDirection="column">
              <Text inverse={isSel}>
                {isSel ? symbols.pointer : ' '}
                <Text color={getScoreColor(score)}>{score.toString().padStart(3)}%</Text>
                {' '}
                <Text color={getScoreColor(score)}>{getScoreBar(score)}</Text>
                {' '}
                <Text bold>{skill.name}</Text>
              </Text>
              {isSel && skill.description && (
                <Text dimColor>      {skill.description.slice(0, 60)}{skill.description.length > 60 ? '...' : ''}</Text>
              )}
              {isSel && skill.source && (
                <Text dimColor>      Source: {skill.source}</Text>
              )}
            </Box>
          );
        })}
        {start + maxVisible < items.length && <Text dimColor>  ↓ {items.length - start - maxVisible} more</Text>}
      </Box>

      {/* Help bar */}
      <Box marginTop={1}>
        <Text dimColor>
          {view === 'search'
            ? 'Enter=install  m=choose agent  /=search  r=back  u=update  q=quit'
            : 'Enter=install  m=choose agent  /=search  u=update  R=refresh  q=quit'}
        </Text>
      </Box>
    </Box>
  );
}
