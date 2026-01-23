import { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { colors, symbols } from '../theme.js';
import { listWorkflows, type Workflow as WorkflowType } from '@skillkit/core';

interface Props {
  cols?: number;
  rows?: number;
}

export function Workflow({ rows = 24 }: Props) {
  const [workflows, setWorkflows] = useState<WorkflowType[]>([]);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState(0);
  const [running, setRunning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const maxVisible = Math.max(5, rows - 8);
  const start = Math.max(0, Math.min(sel - Math.floor(maxVisible / 2), workflows.length - maxVisible));
  const visible = workflows.slice(start, start + maxVisible);

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = () => {
    setLoading(true);
    setError(null);
    try {
      const wfs = listWorkflows(process.cwd());
      setWorkflows(wfs);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load workflows');
    }
    setLoading(false);
  };

  useInput((input, key) => {
    if (loading || running) return;

    if (key.upArrow) setSel(i => Math.max(0, i - 1));
    else if (key.downArrow) setSel(i => Math.min(workflows.length - 1, i + 1));
    else if (input === 'r') loadWorkflows();
    else if (key.return && workflows[sel]) {
      // Simulate running workflow
      setRunning(workflows[sel].name);
      setTimeout(() => setRunning(null), 2000);
    }
  });

  return (
    <Box flexDirection="column">
      <Text bold color={colors.primary}>WORKFLOWS</Text>
      <Text dimColor>{workflows.length} workflow(s) found</Text>

      {loading && <Text>Loading workflows...</Text>}
      {error && <Text color="red">{error}</Text>}
      {running && <Text color="yellow">Running: {running}...</Text>}

      {!loading && !running && workflows.length === 0 && (
        <Box marginTop={1} flexDirection="column">
          <Text dimColor>No workflows found.</Text>
          <Text dimColor>Create one with: skillkit workflow create</Text>
        </Box>
      )}

      {!loading && !running && workflows.length > 0 && (
        <Box marginTop={1} flexDirection="column">
          {start > 0 && <Text dimColor>  ↑ {start} more</Text>}
          {visible.map((wf, i) => {
            const idx = start + i;
            const isSel = idx === sel;
            return (
              <Box key={wf.name} flexDirection="column">
                <Text inverse={isSel}>
                  {isSel ? symbols.pointer : ' '} {wf.name}
                </Text>
                {isSel && wf.description && (
                  <Text dimColor>   {wf.description}</Text>
                )}
                {isSel && (
                  <Text dimColor>   {wf.waves.length} wave(s), {wf.waves.reduce((acc, w) => acc + w.skills.length, 0)} skill(s)</Text>
                )}
              </Box>
            );
          })}
          {start + maxVisible < workflows.length && <Text dimColor>  ↓ {workflows.length - start - maxVisible} more</Text>}
        </Box>
      )}

      <Box marginTop={1}>
        <Text dimColor>Enter=run  r=refresh  q=quit</Text>
      </Box>
    </Box>
  );
}
