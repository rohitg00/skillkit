/**
 * FormField Component
 * Input with label and validation
 */

import { Show } from 'solid-js';
import { terminalColors } from '../theme/colors.js';

interface FormFieldProps {
  label: string;
  value: string;
  placeholder?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  focused?: boolean;
  type?: 'text' | 'password' | 'search';
  width?: number;
}

export function FormField(props: FormFieldProps) {
  const type = () => props.type ?? 'text';
  const focused = () => props.focused ?? false;
  const disabled = () => props.disabled ?? false;
  const width = () => props.width ?? 30;

  const displayValue = () => {
    if (type() === 'password') {
      return '•'.repeat(props.value.length);
    }
    return props.value;
  };

  const borderColor = () => {
    if (props.error) return terminalColors.error;
    if (focused()) return terminalColors.accent;
    if (disabled()) return terminalColors.textMuted;
    return terminalColors.border;
  };

  const labelColor = () => {
    if (props.error) return terminalColors.error;
    if (focused()) return terminalColors.accent;
    return terminalColors.textSecondary;
  };

  return (
    <box flexDirection="column" marginBottom={1}>
      <box flexDirection="row">
        <text fg={labelColor()}>
          {props.label}
          <Show when={props.required}>
            <text fg={terminalColors.error}>*</text>
          </Show>
        </text>
      </box>

      <box
        flexDirection="row"
        width={width()}
        borderStyle="round"
        borderColor={borderColor()}
        paddingX={1}
      >
        <Show when={type() === 'search'}>
          <text fg={terminalColors.textMuted}>/ </text>
        </Show>
        <text fg={disabled() ? terminalColors.textMuted : terminalColors.text}>
          {displayValue() || (
            <text fg={terminalColors.textMuted}>{props.placeholder ?? ''}</text>
          )}
        </text>
        <Show when={focused()}>
          <text fg={terminalColors.accent}>▌</text>
        </Show>
      </box>

      <Show when={props.error}>
        <text fg={terminalColors.error}>✗ {props.error}</text>
      </Show>

      <Show when={props.hint && !props.error}>
        <text fg={terminalColors.textMuted}>{props.hint}</text>
      </Show>
    </box>
  );
}

interface TextAreaFieldProps {
  label: string;
  value: string;
  placeholder?: string;
  error?: string;
  rows?: number;
  width?: number;
  focused?: boolean;
}

export function TextAreaField(props: TextAreaFieldProps) {
  const rows = () => props.rows ?? 3;
  const width = () => props.width ?? 40;
  const focused = () => props.focused ?? false;

  const lines = () => props.value.split('\n').slice(0, rows());

  const hasContent = () => props.value !== '' && props.value !== undefined;

  const borderColor = () => {
    if (props.error) return terminalColors.error;
    if (focused()) return terminalColors.accent;
    return terminalColors.border;
  };

  return (
    <box flexDirection="column" marginBottom={1}>
      <text fg={terminalColors.textSecondary}>{props.label}</text>

      <box
        flexDirection="column"
        width={width()}
        height={rows() + 2}
        borderStyle="round"
        borderColor={borderColor()}
        paddingX={1}
      >
        <Show
          when={hasContent()}
          fallback={<text fg={terminalColors.textMuted}>{props.placeholder ?? ''}</text>}
        >
          {lines().map((line) => (
            <text fg={terminalColors.text}>{line}</text>
          ))}
        </Show>
      </box>

      <Show when={props.error}>
        <text fg={terminalColors.error}>✗ {props.error}</text>
      </Show>
    </box>
  );
}

interface SelectFieldProps {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  focused?: boolean;
  expanded?: boolean;
  selectedOptionIndex?: number;
}

export function SelectField(props: SelectFieldProps) {
  const focused = () => props.focused ?? false;
  const expanded = () => props.expanded ?? false;

  const selectedLabel = () => {
    const option = props.options.find((o) => o.value === props.value);
    return option?.label ?? props.value ?? 'Select...';
  };

  return (
    <box flexDirection="column" marginBottom={1}>
      <text fg={terminalColors.textSecondary}>{props.label}</text>

      <box
        flexDirection="row"
        borderStyle="round"
        borderColor={focused() ? terminalColors.accent : terminalColors.border}
        paddingX={1}
      >
        <text fg={terminalColors.text}>{selectedLabel()}</text>
        <text fg={terminalColors.textMuted}> {expanded() ? '▲' : '▼'}</text>
      </box>

      <Show when={expanded()}>
        <box
          flexDirection="column"
          borderStyle="round"
          borderColor={terminalColors.border}
          paddingX={1}
        >
          {props.options.map((option, index) => {
            const isSelected = index === props.selectedOptionIndex;
            return (
              <text
                fg={
                  option.value === props.value
                    ? terminalColors.accent
                    : isSelected
                      ? terminalColors.text
                      : terminalColors.textSecondary
                }
              >
                {isSelected ? '▸ ' : '  '}
                {option.label}
              </text>
            );
          })}
        </box>
      </Show>
    </box>
  );
}
