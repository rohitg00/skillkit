import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { colors, symbols } from '../theme.js';

interface Props {
  cols?: number;
  rows?: number;
}

const SETTINGS = [
  { id: 'agent', label: 'Default Agent', value: 'auto-detect' },
  { id: 'sync', label: 'Auto Sync', value: 'disabled' },
  { id: 'cache', label: 'Cache Dir', value: '~/.skillkit/cache' },
];

export function Settings({}: Props) {
  const [sel, setSel] = useState(0);

  useInput((_, key) => {
    if (key.upArrow) setSel(i => Math.max(0, i - 1));
    else if (key.downArrow) setSel(i => Math.min(SETTINGS.length - 1, i + 1));
  });

  return (
    <Box flexDirection="column">
      <Text bold>{colors.primary('SETTINGS')}</Text>
      <Text dimColor>Configure SkillKit</Text>

      <Box marginTop={1} flexDirection="column">
        {SETTINGS.map((s, i) => {
          const isSel = i === sel;
          return (
            <Text key={s.id} inverse={isSel}>
              {isSel ? symbols.pointer : ' '}{s.label.padEnd(16)} {colors.secondaryDim(s.value)}
            </Text>
          );
        })}
      </Box>

      <Box marginTop={1}>
        <Text dimColor>Enter=edit  q=quit</Text>
      </Box>
    </Box>
  );
}
