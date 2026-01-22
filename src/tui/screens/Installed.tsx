import { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { colors, symbols } from '../theme.js';
import { useSkills } from '../hooks/useSkills.js';

interface Props {
  cols?: number;
  rows?: number;
}

export function Installed({ rows = 24 }: Props) {
  const { skills, loading, refresh, remove } = useSkills();
  const [sel, setSel] = useState(0);

  const maxVisible = Math.max(5, rows - 6);
  const start = Math.max(0, Math.min(sel - Math.floor(maxVisible / 2), skills.length - maxVisible));
  const visible = skills.slice(start, start + maxVisible);

  useInput((input, key) => {
    if (loading) return;
    if (key.upArrow) setSel(i => Math.max(0, i - 1));
    else if (key.downArrow) setSel(i => Math.min(skills.length - 1, i + 1));
    else if (input === 'r') refresh();
    else if (input === 'd' && skills[sel]) remove(skills[sel].name);
  });

  return (
    <Box flexDirection="column">
      <Text bold color={colors.primary}>INSTALLED SKILLS</Text>
      <Text dimColor>{skills.length} skills</Text>

      {loading && <Text>Loading...</Text>}

      {!loading && skills.length === 0 && (
        <Text dimColor>No skills installed. Press b to browse.</Text>
      )}

      {!loading && skills.length > 0 && (
        <Box marginTop={1} flexDirection="column">
          {start > 0 && <Text dimColor>  ↑ {start} more</Text>}
          {visible.map((skill, i) => {
            const idx = start + i;
            const isSel = idx === sel;
            return (
              <Text key={skill.name} inverse={isSel}>
                {isSel ? symbols.pointer : ' '}{skill.name.padEnd(30)} {skill.source && <Text color={colors.secondaryDim}>{skill.source}</Text>}
              </Text>
            );
          })}
          {start + maxVisible < skills.length && <Text dimColor>  ↓ {skills.length - start - maxVisible} more</Text>}
        </Box>
      )}

      <Box marginTop={1}>
        <Text dimColor>r=refresh  d=delete  q=quit</Text>
      </Box>
    </Box>
  );
}
