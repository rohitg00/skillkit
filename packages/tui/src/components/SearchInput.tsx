/**
 * SearchInput Component
 * Rounded search input with icon
 */
import { terminalColors } from '../theme/colors.js';

interface SearchInputProps {
  value: string;
  placeholder?: string;
  focused?: boolean;
  onChange?: (value: string) => void;
}

export function SearchInput({
  value,
  placeholder = 'Search...',
  focused = false,
}: SearchInputProps) {
  const display = value || placeholder;
  const textColor = value ? terminalColors.text : terminalColors.textMuted;

  return (
    <box flexDirection="row" marginBottom={1}>
      <text fg={terminalColors.textMuted}>&#x2315; </text>
      <text fg={textColor}>{display}</text>
      {focused && <text fg={terminalColors.accent}>&#x258F;</text>}
    </box>
  );
}
