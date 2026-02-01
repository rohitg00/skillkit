/**
 * Clickable Component
 * Wrapper to make any element clickable with hover effects
 */

import { type JSX, Show } from 'solid-js';
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

  const handleClick = () => {
    if (!disabled() && props.onClick) {
      props.onClick();
    }
  };

  const handleDoubleClick = () => {
    if (!disabled() && props.onDoubleClick) {
      props.onDoubleClick();
    }
  };

  const handleRightClick = () => {
    if (!disabled() && props.onRightClick) {
      props.onRightClick();
    }
  };

  const renderContent = () => {
    if (hoverEffect() === 'underline' && showHighlight()) {
      return <text>{props.children}</text>;
    }
    return props.children;
  };

  return (
    <box
      flexDirection="row"
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleRightClick}
    >
      <Show when={hoverEffect() === 'pointer' && showHighlight()}>
        <text fg={terminalColors.accent}>{cursor()} </text>
      </Show>
      <box
        fg={hoverEffect() === 'highlight' && showHighlight() ? terminalColors.accent : undefined}
      >
        {renderContent()}
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
  const underlineOnHover = () => props.underlineOnHover ?? false;

  const color = () => {
    if (disabled()) return terminalColors.textMuted;
    if (hovered()) return props.hoverColor ?? terminalColors.accent;
    return props.color ?? terminalColors.text;
  };

  const handleClick = () => {
    if (!disabled() && props.onClick) {
      props.onClick();
    }
  };

  return (
    <text fg={color()} onClick={handleClick}>
      {underlineOnHover() && hovered() ? (
        <u>{props.children}</u>
      ) : (
        props.children
      )}
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

  const handleClick = () => {
    if (!disabled() && props.onClick) {
      props.onClick();
    }
  };

  return (
    <box flexDirection="row" onClick={handleClick}>
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
  onMouseOver?: () => void;
  onMouseOut?: () => void;
  onClick?: () => void;
  onMouseDown?: () => void;
  onMouseUp?: () => void;
}

export function InteractiveArea(props: InteractiveAreaProps) {
  return (
    <box
      flexDirection="column"
      width={props.width}
      height={props.height}
      style={{ left: props.x, top: props.y }}
      onMouseEnter={props.onMouseOver}
      onMouseLeave={props.onMouseOut}
      onClick={props.onClick}
      onMouseDown={props.onMouseDown}
      onMouseUp={props.onMouseUp}
    >
      {props.children}
    </box>
  );
}
