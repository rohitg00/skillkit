import { Box, Text } from 'ink';
import { colors, symbols } from '../theme.js';
import type { Screen } from '../App.js';

interface SidebarProps {
  screen: Screen;
  onNavigate: (screen: Screen) => void;
  isCompact?: boolean;
}

const NAV: { id: Screen; label: string; key: string }[] = [
  // Discovery
  { id: 'home', label: 'Home', key: 'h' },
  { id: 'marketplace', label: 'Marketplace', key: 'm' },
  { id: 'browse', label: 'Browse', key: 'b' },
  // Execution
  { id: 'workflow', label: 'Workflows', key: 'w' },
  { id: 'execute', label: 'Execute', key: 'x' },
  { id: 'history', label: 'History', key: 'y' },
  // Tools
  { id: 'recommend', label: 'Recommend', key: 'r' },
  { id: 'translate', label: 'Translate', key: 't' },
  { id: 'context', label: 'Context', key: 'c' },
  { id: 'memory', label: 'Memory', key: 'e' },
  // Management
  { id: 'installed', label: 'Installed', key: 'i' },
  { id: 'sync', label: 'Sync', key: 's' },
  { id: 'settings', label: 'Config', key: ',' },
];

export function Sidebar({ screen }: SidebarProps) {
  return (
    <Box flexDirection="column" width={14} borderStyle="single" paddingX={1}>
      <Text bold color={colors.primary}>SkillKit</Text>

      {/* Discovery (0-2) */}
      {NAV.slice(0, 3).map((item) => (
        <Text key={item.id} inverse={screen === item.id}>
          {screen === item.id ? symbols.bullet : ' '}{item.label}
        </Text>
      ))}

      <Text> </Text>

      {/* Execution (3-5) */}
      {NAV.slice(3, 6).map((item) => (
        <Text key={item.id} inverse={screen === item.id}>
          {screen === item.id ? symbols.bullet : ' '}{item.label}
        </Text>
      ))}

      <Text> </Text>

      {/* Tools (6-9) */}
      {NAV.slice(6, 10).map((item) => (
        <Text key={item.id} inverse={screen === item.id}>
          {screen === item.id ? symbols.bullet : ' '}{item.label}
        </Text>
      ))}

      <Text> </Text>

      {/* Management (10-12) */}
      {NAV.slice(10).map((item) => (
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
