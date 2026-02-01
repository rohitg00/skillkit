/**
 * Clickable Component
 * Wrapper to make any element clickable with hover effects
 */

import { type JSX, Show, createSignal } from 'solid-js';
import { terminalColors } from '../theme/colors.js';

interface ClickableProps {
  children: JSX.Element;
  onClick?: () => void;
  onDoubleClick?: () => void;
  onRightClick?: () => void;
  disabled?: boolean;
  hovered?: boolean;
  pressed?: boolean;
  focusable?: boolean;
  focused?: boolean;
  cursor?: string;
  hoverEffect?: 'highlight' | 'underline' | 'pointer' | 'none';
}

export function Clickable(props: ClickableProps) {
  const disabled = () => props.disabled ?? false;
  const hovered = () => props.hovered ?? false;
  const focused = () => props.focused ?? false;
  const hoverEffect = () => props.hoverEffect ?? 'highlight';

  const showHighlight = () => {
    if (disabled()) return false;
    return hovered() || focused();
  };

  const cursor = () => {
    if (disabled()) return '';
    if (hovered()) return props.cursor ?? '▸';
    return '';
  };

  return (
    <box flexDirection="row">
      <Show when={hoverEffect() === 'pointer' && showHighlight()}>
        <text fg={terminalColors.accent}>{cursor()} </text>
      </Show>
      <box>
        {props.children}
      </box>
    </box>
  );
}

interface ClickableTextProps {
  children: string;
  onClick?: () => void;
  disabled?: boolean;
  hovered?: boolean;
  color?: string;
  hoverColor?: string;
  underlineOnHover?: boolean;
}

export function ClickableText(props: ClickableTextProps) {
  const disabled = () => props.disabled ?? false;
  const hovered = () => props.hovered ?? false;

  const color = () => {
    if (disabled()) return terminalColors.textMuted;
    if (hovered()) return props.hoverColor ?? terminalColors.accent;
    return props.color ?? terminalColors.text;
  };

  return (
    <text fg={color()}>
      {props.children}
    </text>
  );
}

interface ClickableRowProps {
  children: JSX.Element;
  selected?: boolean;
  hovered?: boolean;
  disabled?: boolean;
  showIndicator?: boolean;
  indicatorChar?: string;
  onClick?: () => void;
}

export function ClickableRow(props: ClickableRowProps) {
  const selected = () => props.selected ?? false;
  const hovered = () => props.hovered ?? false;
  const disabled = () => props.disabled ?? false;
  const showIndicator = () => props.showIndicator ?? true;
  const indicatorChar = () => props.indicatorChar ?? '▸';

  const indicator = () => {
    if (!showIndicator()) return '  ';
    if (selected()) return `${indicatorChar()} `;
    if (hovered()) return '▹ ';
    return '  ';
  };

  const fg = () => {
    if (disabled()) return terminalColors.textMuted;
    if (selected()) return terminalColors.accent;
    if (hovered()) return terminalColors.text;
    return terminalColors.textSecondary;
  };

  return (
    <box flexDirection="row">
      <text fg={fg()}>{indicator()}</text>
      {props.children}
    </box>
  );
}

interface InteractiveAreaProps {
  children: JSX.Element;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClick?: () => void;
}

export function InteractiveArea(props: InteractiveAreaProps) {
  return (
    <box
      flexDirection="column"
      width={props.width}
      height={props.height}
    >
      {props.children}
    </box>
  );
}
