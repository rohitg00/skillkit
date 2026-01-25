/**
 * StatusBar Component
 * Bottom status bar with keyboard shortcuts
 */
import { terminalColors } from '../theme/colors.js';
import { STATUS_BAR_SHORTCUTS } from '../state/types.js';

interface StatusBarProps {
  message?: string;
  messageType?: 'info' | 'success' | 'error' | 'warning';
  shortcuts?: string;
}

export function StatusBar({
  message,
  messageType = 'info',
  shortcuts = STATUS_BAR_SHORTCUTS,
}: StatusBarProps) {
  const messageColors = {
    info: terminalColors.info,
    success: terminalColors.success,
    error: terminalColors.error,
    warning: terminalColors.warning,
  };

  return (
    <box flexDirection="column">
      <text fg={terminalColors.textMuted}>
        {'\u2500'.repeat(70)}
      </text>
      {message ? (
        <text fg={messageColors[messageType]}>{message}</text>
      ) : (
        <text fg={terminalColors.textMuted}>{shortcuts}</text>
      )}
    </box>
  );
}
