import { Show } from 'solid-js';
import { terminalColors } from '../theme/colors.js';

interface HeaderProps {
  title: string;
  subtitle?: string;
  count?: number;
  badge?: string;
  icon?: string;
}

export function Header(props: HeaderProps) {
  return (
    <box flexDirection="column" marginBottom={1}>
      <box flexDirection="row" gap={2}>
        <text fg={terminalColors.text}>
          <b>
            {props.icon && `${props.icon} `}
            {props.title}
          </b>
        </text>
        <Show when={props.count !== undefined}>
          <text fg={terminalColors.textMuted}>({props.count})</text>
        </Show>
        <Show when={props.badge}>
          <text fg={terminalColors.accent}>[{props.badge}]</text>
        </Show>
      </box>
      <Show when={props.subtitle}>
        <text fg={terminalColors.textSecondary}>{props.subtitle}</text>
      </Show>
    </box>
  );
}
