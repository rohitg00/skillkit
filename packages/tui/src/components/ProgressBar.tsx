import { Show } from 'solid-js';
import { terminalColors } from '../theme/colors.js';
import { symbols } from '../theme/symbols.js';

interface ProgressBarProps {
  progress: number;
  width?: number;
  showPercentage?: boolean;
  color?: keyof typeof terminalColors;
}

export function ProgressBar(props: ProgressBarProps) {
  const width = () => Math.max(1, Math.round(props.width ?? 20));
  const safeProgress = () => (Number.isFinite(props.progress) ? props.progress : 0);
  const showPercentage = () => props.showPercentage ?? true;
  const color = () => props.color ?? 'accent';

  const clampedProgress = () => Math.max(0, Math.min(100, safeProgress()));
  const filledWidth = () => Math.round((clampedProgress() / 100) * width());
  const emptyWidth = () => Math.max(0, width() - filledWidth());

  const filled = () => symbols.progressFilled.repeat(filledWidth());
  const empty = () => symbols.progressEmpty.repeat(emptyWidth());

  return (
    <box flexDirection="row" gap={1}>
      <text>
        <span fg={terminalColors[color()]}>{filled()}</span>
        <span fg={terminalColors.textMuted}>{empty()}</span>
      </text>
      <Show when={showPercentage()}>
        <text fg={terminalColors.textSecondary}>{Math.round(clampedProgress())}%</text>
      </Show>
    </box>
  );
}
