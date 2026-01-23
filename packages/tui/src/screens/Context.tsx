import { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { colors, symbols } from '../theme.js';
import {
  loadContext,
  initContext,
  syncToAgent,
  type ProjectContext,
  type AgentType,
} from '@skillkit/core';
import { getAllAdapters } from '@skillkit/agents';

type View = 'overview' | 'sync';

interface AgentItem {
  type: AgentType;
  name: string;
  detected: boolean;
  synced?: boolean;
}

interface Props {
  cols?: number;
  rows?: number;
}

export function Context({ rows = 24 }: Props) {
  const [view, setView] = useState<View>('overview');
  const [context, setContext] = useState<ProjectContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [agents, setAgents] = useState<AgentItem[]>([]);
  const [sel, setSel] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const projectPath = process.cwd();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const ctx = loadContext(projectPath);
        setContext(ctx);

        const adapters = getAllAdapters();
        const agentList: AgentItem[] = [];
        for (const a of adapters) {
          const detected = await a.isDetected();
          agentList.push({
            type: a.type as AgentType,
            name: a.name,
            detected,
            synced: ctx?.agents?.synced?.includes(a.type),
          });
        }
        setAgents(agentList);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load context');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [projectPath]);

  const maxVisible = Math.max(5, rows - 14);
  const start = Math.max(0, Math.min(sel - Math.floor(maxVisible / 2), agents.length - maxVisible));
  const visible = agents.slice(start, start + maxVisible);

  const handleInit = () => {
    setInitializing(true);
    setMessage(null);
    setError(null);

    try {
      const newContext = initContext(projectPath);
      setContext(newContext);
      setMessage('Context initialized successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize context');
    } finally {
      setInitializing(false);
    }
  };

  const handleSync = async (agentType: AgentType) => {
    setSyncing(true);
    setMessage(null);
    setError(null);

    try {
      await syncToAgent(agentType, projectPath);

      setAgents(prev =>
        prev.map(a =>
          a.type === agentType ? { ...a, synced: true } : a
        )
      );

      setMessage(`Synced to ${agentType} successfully`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const handleSyncAll = async () => {
    setSyncing(true);
    setMessage(null);
    setError(null);

    try {
      const detectedAgents = agents.filter(a => a.detected);
      for (const agent of detectedAgents) {
        await syncToAgent(agent.type, projectPath);
      }

      setAgents(prev =>
        prev.map(a =>
          a.detected ? { ...a, synced: true } : a
        )
      );

      setMessage(`Synced to ${detectedAgents.length} agents`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  useInput((input, key) => {
    if (loading || initializing || syncing) return;

    if (view === 'sync') {
      if (key.upArrow) setSel(i => Math.max(0, i - 1));
      else if (key.downArrow) setSel(i => Math.min(agents.length - 1, i + 1));
      else if (key.return && agents[sel]) {
        handleSync(agents[sel].type);
      }
      else if (key.escape) {
        setView('overview');
        setSel(0);
      }
      else if (input === 'a') {
        handleSyncAll();
      }
    } else if (view === 'overview') {
      if (input === 'i') handleInit();
      else if (input === 's') {
        setView('sync');
        setSel(0);
      }
    }
  });

  if (loading) {
    return (
      <Box flexDirection="column">
        <Text bold color={colors.primary}>PROJECT CONTEXT</Text>
        <Text dimColor>Loading...</Text>
      </Box>
    );
  }

  if (view === 'sync') {
    return (
      <Box flexDirection="column">
        <Text bold color={colors.primary}>SYNC TO AGENTS</Text>
        <Text dimColor>Select an agent to sync your project context</Text>

        {message && <Text color="green">{'✓'} {message}</Text>}
        {error && <Text color="red">{'✗'} {error}</Text>}
        {syncing && <Text dimColor>Syncing...</Text>}

        <Box marginTop={1} flexDirection="column">
          {start > 0 && <Text dimColor>  ↑ {start} more</Text>}
          {visible.map((agent, i) => {
            const idx = start + i;
            const isSel = idx === sel;
            const status = agent.synced
              ? '(synced)'
              : agent.detected
              ? '(ready)'
              : '(not detected)';
            const statusColor = agent.synced ? 'green' : agent.detected ? 'yellow' : 'gray';

            return (
              <Text key={agent.type} inverse={isSel}>
                {isSel ? symbols.pointer : ' '} {agent.name.padEnd(20)}
                <Text color={statusColor}>{status}</Text>
              </Text>
            );
          })}
          {start + maxVisible < agents.length && (
            <Text dimColor>  ↓ {agents.length - start - maxVisible} more</Text>
          )}
        </Box>

        <Box marginTop={1}>
          <Text dimColor>Enter=sync to agent  a=sync all detected  Esc=back  q=quit</Text>
        </Box>
      </Box>
    );
  }

  const stack = context?.stack;
  const detectedCount = agents.filter(a => a.detected).length;
  const syncedCount = agents.filter(a => a.synced).length;

  return (
    <Box flexDirection="column">
      <Text bold color={colors.primary}>PROJECT CONTEXT</Text>

      {message && <Text color="green">{'✓'} {message}</Text>}
      {error && <Text color="red">{'✗'} {error}</Text>}
      {initializing && <Text dimColor>Initializing...</Text>}

      {!context && (
        <Box marginTop={1} flexDirection="column">
          <Text color="yellow">No context found.</Text>
          <Text dimColor>Press 'i' to initialize and analyze your project.</Text>
        </Box>
      )}

      {context && (
        <>
          <Box marginTop={1} flexDirection="column">
            <Text bold>Project:</Text>
            <Text>  Name: {context.project?.name || 'Unknown'}</Text>
            <Text>  Type: {context.project?.type || 'Not detected'}</Text>
          </Box>

          <Box marginTop={1} flexDirection="column">
            <Text bold>Stack:</Text>
            {stack?.languages && stack.languages.length > 0 && (
              <Text>  Languages: {stack.languages.map(l => l.name).join(', ')}</Text>
            )}
            {stack?.frameworks && stack.frameworks.length > 0 && (
              <Text>  Frameworks: {stack.frameworks.map(f => f.name).join(', ')}</Text>
            )}
            {stack?.libraries && stack.libraries.length > 0 && (
              <Text>  Libraries: {stack.libraries.slice(0, 5).map(l => l.name).join(', ')}{stack.libraries.length > 5 ? '...' : ''}</Text>
            )}
            {(!stack?.languages?.length && !stack?.frameworks?.length) && (
              <Text dimColor>  No stack detected. Press 'i' to re-analyze.</Text>
            )}
          </Box>

          <Box marginTop={1} flexDirection="column">
            <Text bold>Agents:</Text>
            <Text>  Detected: {detectedCount} agents</Text>
            <Text>  Synced: {syncedCount} agents</Text>
            {detectedCount > 0 && (
              <Text dimColor>  ({agents.filter(a => a.detected).map(a => a.name).join(', ')})</Text>
            )}
          </Box>
        </>
      )}

      <Box marginTop={1} flexDirection="column">
        <Text bold>Actions:</Text>
        <Text dimColor>  [i] Initialize/refresh context</Text>
        <Text dimColor>  [s] Sync to agents</Text>
      </Box>

      <Box marginTop={1}>
        <Text dimColor>i=init context  s=sync to agents  q=quit</Text>
      </Box>
    </Box>
  );
}
