/**
 * Memory Screen
 * Session memory management
 */
import { type Screen } from '../state/index.js';
import { terminalColors } from '../theme/colors.js';
import { Header } from '../components/Header.js';

interface MemoryProps {
  onNavigate: (screen: Screen) => void;
  cols?: number;
  rows?: number;
}

export function Memory({ onNavigate, cols = 80, rows = 24 }: MemoryProps) {
  const memories = [
    { key: 'project-context', size: '2.4 KB', updated: '2 min ago' },
    { key: 'user-preferences', size: '1.1 KB', updated: '5 min ago' },
    { key: 'session-history', size: '4.7 KB', updated: '1 min ago' },
  ];

  return (
    <box flexDirection="column" paddingLeft={1}>
      <Header
        title="Memory"
        subtitle="Manage persistent session memory"
        count={memories.length}
        icon="&#x25CE;"
      />

      <text fg={terminalColors.text}><b>Stored Memories</b></text>
      <text> </text>

      {memories.map((mem, idx) => (
        <box key={mem.key} flexDirection="row" marginBottom={1}>
          <text fg={idx === 0 ? terminalColors.accent : terminalColors.text} width={25}>
            {idx === 0 ? '\u25B8 ' : '  '}{mem.key}
          </text>
          <text fg={terminalColors.textMuted} width={12}>{mem.size}</text>
          <text fg={terminalColors.textMuted}>{mem.updated}</text>
        </box>
      ))}

      <text> </text>
      <text fg={terminalColors.textMuted}>
        Press Enter to view, 'd' to delete, 'c' to clear all
      </text>
    </box>
  );
}
