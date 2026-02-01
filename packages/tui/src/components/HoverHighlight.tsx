/**
 * HoverHighlight Component
 * Hover highlight effect for list items and buttons
 * Note: Terminal background colors are limited, so we use text color changes for highlighting
 */

import { type JSX, Show, createSignal, createEffect } from 'solid-js';
import { terminalColors } from '../theme/colors.js';

interface HoverHighlightProps {
  children: JSX.Element;
  isHovered?: boolean;
  isSelected?: boolean;
  isDisabled?: boolean;
  highlightColor?: string;
  selectedColor?: string;
  transitionMs?: number;
}

export function HoverHighlight(props: HoverHighlightProps) {
  return <box>{props.children}</box>;
}

interface HighlightableListItemProps {
  children: JSX.Element;
  index: number;
  selectedIndex?: number;
  hoveredIndex?: number | null;
  showPrefix?: boolean;
  prefixWidth?: number;
}

export function HighlightableListItem(props: HighlightableListItemProps) {
  const showPrefix = () => props.showPrefix ?? true;
  const prefixWidth = () => props.prefixWidth ?? 3;

  const isSelected = () => props.index === props.selectedIndex;
  const isHovered = () => props.index === props.hoveredIndex;

  const prefix = () => {
    if (!showPrefix()) return '';
    if (isSelected()) return '▸ ';
    if (isHovered()) return '▹ ';
    return '  ';
  };

  const fg = () => {
    if (isSelected()) return terminalColors.accent;
    if (isHovered()) return terminalColors.text;
    return terminalColors.textSecondary;
  };

  return (
    <box flexDirection="row">
      <Show when={showPrefix()}>
        <text fg={fg()} width={prefixWidth()}>
          {prefix()}
        </text>
      </Show>
      {props.children}
    </box>
  );
}

interface FocusRingProps {
  children: JSX.Element;
  isFocused?: boolean;
  ringColor?: string;
}

export function FocusRing(props: FocusRingProps) {
  const ringColor = () => props.ringColor ?? terminalColors.accent;

  return (
    <box
      borderStyle={props.isFocused ? 'round' : undefined}
      borderColor={props.isFocused ? ringColor() : undefined}
    >
      {props.children}
    </box>
  );
}

interface PressEffectProps {
  children: JSX.Element;
  isPressed?: boolean;
  pressColor?: string;
}

export function PressEffect(props: PressEffectProps) {
  return <box>{props.children}</box>;
}
