import { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { colors, symbols } from '../theme.js';
import { createSessionManager, type ExecutionHistory } from '@skillkit/core';

interface Props {
  cols?: number;
  rows?: number;
}

export function History({ rows = 24 }: Props) {
  const [history, setHistory] = useState<ExecutionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const maxVisible = Math.max(5, rows - 8);
  const start = Math.max(0, Math.min(sel - Math.floor(maxVisible / 2), history.length - maxVisible));
  const visible = history.slice(start, start + maxVisible);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    setLoading(true);
    try {
      const manager = createSessionManager(process.cwd());
      const h = manager.getHistory(50);
      setHistory(h);
    } catch {
      setHistory([]);
    }
    setLoading(false);
  };

  useInput((input, key) => {
    if (loading) return;

    if (key.upArrow) {
      setSel(i => Math.max(0, i - 1));
      setExpanded(false);
    }
    else if (key.downArrow) {
      setSel(i => Math.min(history.length - 1, i + 1));
      setExpanded(false);
    }
    else if (input === 'r') loadHistory();
    else if (key.return) setExpanded(e => !e);
  });

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const formatDate = (iso: string): string => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <Box flexDirection="column">
      <Text bold color={colors.primary}>EXECUTION HISTORY</Text>
      <Text dimColor>{history.length} execution(s)</Text>

      {loading && <Text>Loading history...</Text>}

      {!loading && history.length === 0 && (
        <Box marginTop={1} flexDirection="column">
          <Text dimColor>No execution history.</Text>
          <Text dimColor>Run a skill with: skillkit run {'<skill>'}</Text>
        </Box>
      )}

      {!loading && history.length > 0 && (
        <Box marginTop={1} flexDirection="column">
          {start > 0 && <Text dimColor>  ↑ {start} more</Text>}
          {visible.map((entry, i) => {
            const idx = start + i;
            const isSel = idx === sel;
            const icon = entry.status === 'completed' ? symbols.success :
                        entry.status === 'failed' ? symbols.error :
                        symbols.warning;
            const color = entry.status === 'completed' ? 'green' :
                         entry.status === 'failed' ? 'red' : 'yellow';

            return (
              <Box key={idx} flexDirection="column">
                <Text inverse={isSel}>
                  {isSel ? symbols.pointer : ' '}<Text color={color}>{icon}</Text> {entry.skillName.padEnd(25)} {formatDate(entry.completedAt).padEnd(12)} {formatDuration(entry.durationMs)}
                </Text>
                {isSel && expanded && (
                  <Box flexDirection="column" marginLeft={3}>
                    <Text dimColor>Source: {entry.skillSource}</Text>
                    <Text dimColor>Status: {entry.status}</Text>
                    {entry.commits.length > 0 && (
                      <Text dimColor>Commits: {entry.commits.join(', ')}</Text>
                    )}
                    {entry.filesModified.length > 0 && (
                      <Text dimColor>Files: {entry.filesModified.length} modified</Text>
                    )}
                    {entry.error && (
                      <Text color="red">Error: {entry.error}</Text>
                    )}
                  </Box>
                )}
              </Box>
            );
          })}
          {start + maxVisible < history.length && <Text dimColor>  ↓ {history.length - start - maxVisible} more</Text>}
        </Box>
      )}

      <Box marginTop={1}>
        <Text dimColor>Enter=expand  r=refresh  q=quit</Text>
      </Box>
    </Box>
  );
}
