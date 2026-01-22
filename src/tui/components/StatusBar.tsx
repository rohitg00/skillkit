import { Box, Text } from 'ink';
import { colors, symbols } from '../theme.js';

interface Shortcut {
  key: string;
  label: string;
}

interface StatusBarProps {
  shortcuts: Shortcut[];
  message?: string;
}

export function StatusBar({ shortcuts, message }: StatusBarProps) {
  return (
    <Box
      borderStyle="single"
      borderColor={colors.borderDim}
      borderTop
      borderBottom={false}
      borderLeft={false}
      borderRight={false}
      paddingX={1}
      justifyContent="space-between"
    >
      <Box gap={2}>
        {shortcuts.map((shortcut, idx) => (
          <Box key={idx} gap={1}>
            <Text color={colors.primary} bold>
              {shortcut.key}
            </Text>
            <Text color={colors.secondaryDim}>{shortcut.label}</Text>
          </Box>
        ))}
      </Box>

      {message && (
        <Text color={colors.success}>
          {symbols.check} {message}
        </Text>
      )}
    </Box>
  );
}
