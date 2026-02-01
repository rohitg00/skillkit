import { Show } from 'solid-js';
import { terminalColors } from '../theme/colors.js';

interface SearchInputProps {
  value: string;
  placeholder?: string;
  focused?: boolean;
  onChange?: (value: string) => void;
}

export function SearchInput(props: SearchInputProps) {
  const placeholder = () => props.placeholder ?? 'Search...';
  const focused = () => props.focused ?? false;
  const display = () => props.value || placeholder();
  const textColor = () => (props.value ? terminalColors.text : terminalColors.textMuted);

  return (
    <box flexDirection="row" marginBottom={1}>
      <text fg={terminalColors.textMuted}>&#x2315; </text>
      <text fg={textColor()}>{display()}</text>
      <Show when={focused()}>
        <text fg={terminalColors.accent}>&#x258F;</text>
      </Show>
    </box>
  );
}
