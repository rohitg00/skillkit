import { Box, Text } from 'ink';
import { colors, symbols } from '../theme.js';

interface HeaderProps {
  title: string;
  subtitle?: string;
  count?: number;
}

export function Header({ title, subtitle, count }: HeaderProps) {
  return (
    <Box flexDirection="column" marginBottom={1}>
      <Box justifyContent="space-between">
        <Text color={colors.primary} bold>
          {title.toUpperCase()}
        </Text>
        {count !== undefined && (
          <Text color={colors.secondaryDim}>
            {symbols.star} {count}
          </Text>
        )}
      </Box>
      {subtitle && (
        <Text color={colors.secondaryDim} dimColor>
          {subtitle}
        </Text>
      )}
    </Box>
  );
}
