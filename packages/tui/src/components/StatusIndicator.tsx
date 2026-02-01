/**
 * StatusIndicator Component
 * Loading/success/error/warning indicator
 */

import { Show, createSignal, createEffect, onCleanup } from 'solid-js';
import { terminalColors } from '../theme/colors.js';

export type StatusType = 'loading' | 'success' | 'error' | 'warning' | 'info' | 'pending';

interface StatusIndicatorProps {
  status: StatusType;
  label?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

const STATUS_ICONS: Record<StatusType, string> = {
  loading: '⟳',
  success: '✓',
  error: '✗',
  warning: '⚠',
  info: 'ℹ',
  pending: '○',
};

const STATUS_COLORS: Record<StatusType, string> = {
  loading: terminalColors.accent,
  success: terminalColors.success,
  error: terminalColors.error,
  warning: terminalColors.warning,
  info: terminalColors.info,
  pending: terminalColors.textMuted,
};

const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

export function StatusIndicator(props: StatusIndicatorProps) {
  const [spinnerFrame, setSpinnerFrame] = createSignal(0);
  const showLabel = () => props.showLabel ?? true;
  const animated = () => props.animated ?? true;

  createEffect(() => {
    if (props.status === 'loading' && animated()) {
      const interval = setInterval(() => {
        setSpinnerFrame((f) => (f + 1) % SPINNER_FRAMES.length);
      }, 80);
      onCleanup(() => clearInterval(interval));
    }
  });

  const icon = () => {
    if (props.status === 'loading' && animated()) {
      return SPINNER_FRAMES[spinnerFrame()];
    }
    return STATUS_ICONS[props.status];
  };

  const color = () => STATUS_COLORS[props.status];

  const defaultLabel = () => {
    switch (props.status) {
      case 'loading':
        return 'Loading...';
      case 'success':
        return 'Success';
      case 'error':
        return 'Error';
      case 'warning':
        return 'Warning';
      case 'info':
        return 'Info';
      case 'pending':
        return 'Pending';
    }
  };

  return (
    <box flexDirection="row">
      <text fg={color()}>{icon()}</text>
      <Show when={showLabel()}>
        <text fg={color()}> {props.label ?? defaultLabel()}</text>
      </Show>
    </box>
  );
}

interface InlineStatusProps {
  status: StatusType;
  compact?: boolean;
}

export function InlineStatus(props: InlineStatusProps) {
  const icon = () => {
    switch (props.status) {
      case 'success':
        return '●';
      case 'error':
        return '●';
      case 'warning':
        return '●';
      case 'loading':
        return '○';
      case 'pending':
        return '○';
      default:
        return '●';
    }
  };

  return <text fg={STATUS_COLORS[props.status]}>{icon()}</text>;
}

interface StatusBadgeProps {
  status: StatusType;
  label: string;
}

export function StatusBadge(props: StatusBadgeProps) {
  return (
    <box flexDirection="row">
      <text fg={terminalColors.textMuted}>[</text>
      <text fg={STATUS_COLORS[props.status]}>{props.label}</text>
      <text fg={terminalColors.textMuted}>]</text>
    </box>
  );
}
