/**
 * SplitPane Component
 * Horizontal/vertical split layout
 */

import { Show, type JSX } from 'solid-js';
import { terminalColors } from '../theme/colors.js';

interface SplitPaneProps {
  direction?: 'horizontal' | 'vertical';
  primarySize?: number | string;
  secondarySize?: number | string;
  showDivider?: boolean;
  dividerChar?: string;
  primary: JSX.Element;
  secondary?: JSX.Element;
  gap?: number;
}

export function SplitPane(props: SplitPaneProps) {
  const direction = () => props.direction ?? 'horizontal';
  const showDivider = () => props.showDivider ?? true;
  const dividerChar = () => props.dividerChar ?? (direction() === 'horizontal' ? '│' : '─');
  const gap = () => props.gap ?? 1;

  const flexDir = () => (direction() === 'horizontal' ? 'row' : 'column');

  const primaryWidth = () => {
    if (direction() === 'vertical') return undefined;
    if (typeof props.primarySize === 'number') return props.primarySize;
    return undefined;
  };

  const primaryHeight = () => {
    if (direction() === 'horizontal') return undefined;
    if (typeof props.primarySize === 'number') return props.primarySize;
    return undefined;
  };

  const secondaryWidth = () => {
    if (direction() === 'vertical') return undefined;
    if (typeof props.secondarySize === 'number') return props.secondarySize;
    return undefined;
  };

  const secondaryHeight = () => {
    if (direction() === 'horizontal') return undefined;
    if (typeof props.secondarySize === 'number') return props.secondarySize;
    return undefined;
  };

  return (
    <box flexDirection={flexDir()}>
      <box
        width={primaryWidth()}
        height={primaryHeight()}
        flexGrow={primaryWidth() === undefined && primaryHeight() === undefined ? 1 : undefined}
      >
        {props.primary}
      </box>

      <Show when={props.secondary && showDivider()}>
        <box
          width={direction() === 'horizontal' ? gap() : undefined}
          height={direction() === 'vertical' ? gap() : undefined}
          justifyContent="center"
          alignItems="center"
        >
          <text fg={terminalColors.border}>{dividerChar()}</text>
        </box>
      </Show>

      <Show when={props.secondary}>
        <box
          width={secondaryWidth()}
          height={secondaryHeight()}
          flexGrow={secondaryWidth() === undefined && secondaryHeight() === undefined ? 1 : undefined}
        >
          {props.secondary}
        </box>
      </Show>
    </box>
  );
}

interface ThreePaneLayoutProps {
  left?: JSX.Element;
  center: JSX.Element;
  right?: JSX.Element;
  leftWidth?: number;
  rightWidth?: number;
  showLeftDivider?: boolean;
  showRightDivider?: boolean;
}

export function ThreePaneLayout(props: ThreePaneLayoutProps) {
  const leftWidth = () => props.leftWidth ?? 20;
  const rightWidth = () => props.rightWidth ?? 30;

  return (
    <box flexDirection="row" flexGrow={1}>
      <Show when={props.left}>
        <box width={leftWidth()}>{props.left}</box>
        <Show when={props.showLeftDivider !== false}>
          <box width={1}>
            <text fg={terminalColors.border}>│</text>
          </box>
        </Show>
      </Show>

      <box flexGrow={1}>{props.center}</box>

      <Show when={props.right}>
        <Show when={props.showRightDivider !== false}>
          <box width={1}>
            <text fg={terminalColors.border}>│</text>
          </box>
        </Show>
        <box width={rightWidth()}>{props.right}</box>
      </Show>
    </box>
  );
}
