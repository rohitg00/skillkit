import { Show } from 'solid-js';
import { terminalColors } from '../theme/colors.js';
import { STATUS_BAR_SHORTCUTS } from '../state/types.js';

interface StatusBarProps {
  message?: string;
  messageType?: 'info' | 'success' | 'error' | 'warning';
  shortcuts?: string;
}

export function StatusBar(props: StatusBarProps) {
  const messageType = () => props.messageType ?? 'info';
  const shortcuts = () => props.shortcuts ?? STATUS_BAR_SHORTCUTS;

  const messageColors = {
    info: terminalColors.info,
    success: terminalColors.success,
    error: terminalColors.error,
    warning: terminalColors.warning,
  };

  return (
    <box flexDirection="column">
      <text fg={terminalColors.textMuted}>{'\u2500'.repeat(70)}</text>
      <Show when={props.message} fallback={<text fg={terminalColors.textMuted}>{shortcuts()}</text>}>
        <text fg={messageColors[messageType()]}>{props.message}</text>
      </Show>
    </box>
  );
}
