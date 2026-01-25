/**
 * Header Component
 * Screen header with title and optional badge/count
 */
import { terminalColors } from '../theme/colors.js';
import { symbols } from '../theme/symbols.js';

interface HeaderProps {
  title: string;
  subtitle?: string;
  count?: number;
  badge?: string;
  icon?: string;
}

export function Header({ title, subtitle, count, badge, icon }: HeaderProps) {
  return (
    <box flexDirection="column" marginBottom={1}>
      <box flexDirection="row" gap={2}>
        <text fg={terminalColors.text}>
          <b>{icon && `${icon} `}{title}</b>
        </text>
        {count !== undefined && (
          <text fg={terminalColors.textMuted}>({count})</text>
        )}
        {badge && (
          <text fg={terminalColors.accent}>[{badge}]</text>
        )}
      </box>
      {subtitle && (
        <text fg={terminalColors.textSecondary}>{subtitle}</text>
      )}
    </box>
  );
}
