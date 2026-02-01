/**
 * EmptyState Component
 * Consistent "no data" display
 */

import { Show, type JSX } from 'solid-js';
import { terminalColors } from '../theme/colors.js';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    key?: string;
  };
  compact?: boolean;
}

export function EmptyState(props: EmptyStateProps) {
  const compact = () => props.compact ?? false;

  return (
    <box flexDirection="column" alignItems="center" paddingY={compact() ? 1 : 3}>
      <Show when={props.icon}>
        <box marginBottom={1}>
          <text fg={terminalColors.textMuted}>
            {props.icon}
          </text>
        </box>
      </Show>

      <box marginBottom={1}>
        <text fg={terminalColors.textSecondary}>
          {props.title}
        </text>
      </box>

      <Show when={props.description}>
        <text fg={terminalColors.textMuted}>{props.description}</text>
      </Show>

      <Show when={props.action}>
        <box marginTop={1}>
          <text fg={terminalColors.textMuted}>
            <Show when={props.action!.key}>
              <text fg={terminalColors.accent}>{props.action!.key}</text>{' '}
            </Show>
            {props.action!.label}
          </text>
        </box>
      </Show>
    </box>
  );
}

interface LoadingStateProps {
  message?: string;
  compact?: boolean;
}

export function LoadingState(props: LoadingStateProps) {
  const compact = () => props.compact ?? false;
  const message = () => props.message ?? 'Loading...';

  return (
    <box flexDirection="column" alignItems="center" paddingY={compact() ? 1 : 3}>
      <text fg={terminalColors.accent}>⟳ {message()}</text>
    </box>
  );
}

interface ErrorStateProps {
  title?: string;
  message: string;
  action?: {
    label: string;
    key?: string;
  };
  compact?: boolean;
}

export function ErrorState(props: ErrorStateProps) {
  const compact = () => props.compact ?? false;
  const title = () => props.title ?? 'Error';

  return (
    <box flexDirection="column" alignItems="center" paddingY={compact() ? 1 : 3}>
      <box marginBottom={1}>
        <text fg={terminalColors.error}>
          ✗ {title()}
        </text>
      </box>

      <text fg={terminalColors.textMuted}>{props.message}</text>

      <Show when={props.action}>
        <box marginTop={1}>
          <text fg={terminalColors.textMuted}>
            <Show when={props.action!.key}>
              <text fg={terminalColors.accent}>{props.action!.key}</text>{' '}
            </Show>
            {props.action!.label}
          </text>
        </box>
      </Show>
    </box>
  );
}
