/**
 * ProgressBar Component
 * Animated progress bar display
 */
import { terminalColors } from '../theme/colors.js';
import { symbols } from '../theme/symbols.js';

interface ProgressBarProps {
  progress: number; // 0-100
  width?: number;
  showPercentage?: boolean;
  color?: keyof typeof terminalColors;
}

export function ProgressBar({
  progress,
  width = 20,
  showPercentage = true,
  color = 'accent',
}: ProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress));
  const filledWidth = Math.round((clampedProgress / 100) * width);
  const emptyWidth = width - filledWidth;

  const filled = symbols.progressFilled.repeat(filledWidth);
  const empty = symbols.progressEmpty.repeat(emptyWidth);

  return (
    <box flexDirection="row" gap={1}>
      <text>
        <span fg={terminalColors[color]}>{filled}</span>
        <span fg={terminalColors.textMuted}>{empty}</span>
      </text>
      {showPercentage && (
        <text fg={terminalColors.textSecondary}>
          {Math.round(clampedProgress)}%
        </text>
      )}
    </box>
  );
}
