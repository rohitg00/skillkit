/**
 * Button Component
 * Clickable button with hover/active states
 */

import { Show } from 'solid-js';
import { terminalColors } from '../theme/colors.js';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  shortcut?: string;
  icon?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  focused?: boolean;
  pressed?: boolean;
  hovered?: boolean;
  onClick?: () => void;
}

const VARIANT_COLORS: Record<
  ButtonVariant,
  { fg: string; bg: string; border: string; hoverFg: string }
> = {
  primary: {
    fg: terminalColors.text,
    bg: terminalColors.accent,
    border: terminalColors.accent,
    hoverFg: terminalColors.accent,
  },
  secondary: {
    fg: terminalColors.text,
    bg: terminalColors.surface,
    border: terminalColors.border,
    hoverFg: terminalColors.text,
  },
  ghost: {
    fg: terminalColors.textSecondary,
    bg: 'transparent',
    border: 'transparent',
    hoverFg: terminalColors.text,
  },
  danger: {
    fg: terminalColors.text,
    bg: terminalColors.error,
    border: terminalColors.error,
    hoverFg: terminalColors.error,
  },
};

export function Button(props: ButtonProps) {
  const variant = () => props.variant ?? 'secondary';
  const size = () => props.size ?? 'md';
  const disabled = () => props.disabled ?? false;
  const focused = () => props.focused ?? false;
  const pressed = () => props.pressed ?? false;
  const hovered = () => props.hovered ?? false;

  const colors = () => VARIANT_COLORS[variant()];

  const fg = () => {
    if (disabled()) return terminalColors.textMuted;
    if (pressed()) return colors().hoverFg;
    if (hovered() || focused()) return colors().hoverFg;
    return colors().fg;
  };

  const borderColor = () => {
    if (disabled()) return terminalColors.textMuted;
    if (focused()) return terminalColors.accent;
    return colors().border;
  };

  const paddingX = () => {
    switch (size()) {
      case 'sm':
        return 1;
      case 'lg':
        return 3;
      default:
        return 2;
    }
  };

  const brackets = () => {
    if (variant() === 'ghost') return { left: '', right: '' };
    if (pressed()) return { left: '▸', right: '◂' };
    return { left: '[', right: ']' };
  };

  const padding = ' '.repeat(paddingX());

  const handleClick = () => {
    if (!disabled() && props.onClick) {
      props.onClick();
    }
  };

  return (
    <box flexDirection="row" onClick={handleClick}>
      <text fg={borderColor()}>{brackets().left}</text>
      <text fg={fg()}>{padding}</text>
      <Show when={props.icon}>
        <text fg={fg()}>{props.icon} </text>
      </Show>
      <text fg={fg()}>{props.label}</text>
      <Show when={props.shortcut}>
        <text fg={terminalColors.textMuted}> ({props.shortcut})</text>
      </Show>
      <text fg={fg()}>{padding}</text>
      <text fg={borderColor()}>{brackets().right}</text>
    </box>
  );
}

interface ButtonGroupProps {
  buttons: Array<{
    id: string;
    label: string;
    shortcut?: string;
    icon?: string;
    variant?: ButtonVariant;
    disabled?: boolean;
    onClick?: () => void;
  }>;
  selectedId?: string;
  focusedId?: string;
  direction?: 'horizontal' | 'vertical';
  gap?: number;
}

export function ButtonGroup(props: ButtonGroupProps) {
  const direction = () => props.direction ?? 'horizontal';
  const gap = () => props.gap ?? 2;

  return (
    <box flexDirection={direction() === 'horizontal' ? 'row' : 'column'}>
      {props.buttons.map((btn, index) => (
        <box
          marginRight={direction() === 'horizontal' && index < props.buttons.length - 1 ? gap() : 0}
          marginBottom={direction() === 'vertical' && index < props.buttons.length - 1 ? gap() : 0}
        >
          <Button
            label={btn.label}
            shortcut={btn.shortcut}
            icon={btn.icon}
            variant={btn.variant}
            disabled={btn.disabled}
            focused={btn.id === props.focusedId}
            hovered={btn.id === props.selectedId}
            onClick={btn.onClick}
          />
        </box>
      ))}
    </box>
  );
}

interface IconButtonProps {
  icon: string;
  label?: string;
  disabled?: boolean;
  focused?: boolean;
  hovered?: boolean;
  onClick?: () => void;
}

export function IconButton(props: IconButtonProps) {
  const disabled = () => props.disabled ?? false;
  const focused = () => props.focused ?? false;
  const hovered = () => props.hovered ?? false;

  const fg = () => {
    if (disabled()) return terminalColors.textMuted;
    if (focused() || hovered()) return terminalColors.accent;
    return terminalColors.textSecondary;
  };

  const handleClick = () => {
    if (!disabled() && props.onClick) {
      props.onClick();
    }
  };

  return (
    <box flexDirection="row" onClick={handleClick}>
      <text fg={fg()}>{props.icon}</text>
      <Show when={props.label}>
        <text fg={fg()}> {props.label}</text>
      </Show>
    </box>
  );
}
