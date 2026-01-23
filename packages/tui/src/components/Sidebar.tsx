import { Box, Text } from 'ink';
import { colors, symbols } from '../theme.js';
import type { Screen } from '../App.js';

interface SidebarProps {
  screen: Screen;
  onNavigate: (screen: Screen) => void;
  isCompact?: boolean;
}

const NAV: { id: Screen; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'browse', label: 'Browse' },
  { id: 'recommend', label: 'Recommend' },
  { id: 'translate', label: 'Translate' },
  { id: 'context', label: 'Context' },
  { id: 'installed', label: 'List' },
  { id: 'sync', label: 'Sync' },
  { id: 'settings', label: 'Config' },
];

export function Sidebar({ screen }: SidebarProps) {
  return (
    <Box flexDirection="column" width={14} borderStyle="single" paddingX={1}>
      <Text bold color={colors.primary}>SkillKit</Text>

      {NAV.slice(0, 3).map((item) => (
        <Text key={item.id} inverse={screen === item.id}>
          {screen === item.id ? symbols.bullet : ' '}{item.label}
        </Text>
      ))}

      <Text> </Text>

      {NAV.slice(3, 5).map((item) => (
        <Text key={item.id} inverse={screen === item.id}>
          {screen === item.id ? symbols.bullet : ' '}{item.label}
        </Text>
      ))}

      <Text> </Text>

      {NAV.slice(5).map((item) => (
        <Text key={item.id} inverse={screen === item.id}>
          {screen === item.id ? symbols.bullet : ' '}{item.label}
        </Text>
      ))}

      <Box flexGrow={1} />

      <Text dimColor>? Help</Text>
      <Text dimColor>q Quit</Text>
    </Box>
  );
}
