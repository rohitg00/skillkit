import { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { colors, symbols } from '../theme.js';
import { getAllAdapters } from '@skillkit/agents';

interface AgentStatus {
  name: string;
  type: string;
  detected: boolean;
}

interface Props {
  cols?: number;
  rows?: number;
}

export function Sync({ rows = 24 }: Props) {
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState(0);
  const [syncing, setSyncing] = useState(false);

  const maxVisible = Math.max(5, rows - 6);
  const start = Math.max(0, Math.min(sel - Math.floor(maxVisible / 2), agents.length - maxVisible));
  const visible = agents.slice(start, start + maxVisible);

  useEffect(() => {
    (async () => {
      const adapters = getAllAdapters();
      const s: AgentStatus[] = [];
      for (const a of adapters) {
        s.push({ name: a.name, type: a.type, detected: await a.isDetected() });
      }
      setAgents(s);
      setLoading(false);
    })();
  }, []);

  useInput((input, key) => {
    if (loading || syncing) return;
    if (key.upArrow) setSel(i => Math.max(0, i - 1));
    else if (key.downArrow) setSel(i => Math.min(agents.length - 1, i + 1));
    else if (input === 'a') { setSyncing(true); setTimeout(() => setSyncing(false), 500); }
    else if (key.return && agents[sel]?.detected) { setSyncing(true); setTimeout(() => setSyncing(false), 300); }
  });

  const detected = agents.filter(a => a.detected).length;

  return (
    <Box flexDirection="column">
      <Text bold color={colors.primary}>SYNC SKILLS</Text>
      <Text dimColor>{detected}/{agents.length} agents detected</Text>

      {loading && <Text>Detecting agents...</Text>}
      {syncing && <Text>Syncing...</Text>}

      {!loading && !syncing && (
        <Box marginTop={1} flexDirection="column">
          {start > 0 && <Text dimColor>  ↑ {start} more</Text>}
          {visible.map((agent, i) => {
            const idx = start + i;
            const isSel = idx === sel;
            return (
              <Text key={agent.type} inverse={isSel} dimColor={!agent.detected}>
                {isSel ? symbols.pointer : ' '}{agent.detected ? symbols.checkboxOn : symbols.checkboxOff} {agent.name.padEnd(20)} {agent.detected ? 'Ready' : 'N/A'}
              </Text>
            );
          })}
          {start + maxVisible < agents.length && <Text dimColor>  ↓ {agents.length - start - maxVisible} more</Text>}
        </Box>
      )}

      <Box marginTop={1}>
        <Text dimColor>Enter=sync  a=all  q=quit</Text>
      </Box>
    </Box>
  );
}
