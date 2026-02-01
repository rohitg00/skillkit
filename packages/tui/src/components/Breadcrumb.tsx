/**
 * Breadcrumb Component
 * Clickable breadcrumb navigation
 */

import { For, Show } from 'solid-js';
import { terminalColors } from '../theme/colors.js';

export interface BreadcrumbItem {
  id: string;
  label: string;
  icon?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: string;
  hoveredId?: string | null;
  onNavigate?: (id: string) => void;
}

export function Breadcrumb(props: BreadcrumbProps) {
  const separator = () => props.separator ?? ' / ';

  return (
    <box flexDirection="row">
      <For each={props.items}>
        {(item, index) => {
          const isLast = () => index() === props.items.length - 1;
          const isHovered = () => item.id === props.hoveredId;

          const fg = () => {
            if (isLast()) return terminalColors.text;
            if (isHovered()) return terminalColors.accent;
            return terminalColors.textMuted;
          };

          return (
            <>
              <box flexDirection="row">
                <Show when={item.icon}>
                  <text fg={fg()}>{item.icon} </text>
                </Show>
                <text fg={fg()}>
                  {isLast() ? <b>{item.label}</b> : item.label}
                </text>
              </box>
              <Show when={!isLast()}>
                <text fg={terminalColors.textMuted}>{separator()}</text>
              </Show>
            </>
          );
        }}
      </For>
    </box>
  );
}

interface PathBreadcrumbProps {
  path: string;
  separator?: string;
  maxSegments?: number;
  hoveredSegment?: number | null;
  onNavigate?: (path: string, segmentIndex: number) => void;
}

export function PathBreadcrumb(props: PathBreadcrumbProps) {
  const separator = () => props.separator ?? '/';
  const maxSegments = () => props.maxSegments ?? 5;

  const segments = () => {
    const parts = props.path.split('/').filter(Boolean);
    if (parts.length <= maxSegments()) {
      return parts;
    }
    return ['...', ...parts.slice(-(maxSegments() - 1))];
  };

  const getPathAtIndex = (index: number): string => {
    const parts = props.path.split('/').filter(Boolean);
    const actualIndex = segments()[0] === '...' ? parts.length - (segments().length - 1) + index : index;
    return '/' + parts.slice(0, actualIndex + 1).join('/');
  };

  return (
    <box flexDirection="row">
      <text fg={terminalColors.textMuted}>{separator()}</text>
      <For each={segments()}>
        {(segment, index) => {
          const isLast = () => index() === segments().length - 1;
          const isHovered = () => index() === props.hoveredSegment;
          const isEllipsis = () => segment === '...';

          const fg = () => {
            if (isEllipsis()) return terminalColors.textMuted;
            if (isLast()) return terminalColors.text;
            if (isHovered()) return terminalColors.accent;
            return terminalColors.textMuted;
          };

          return (
            <>
              <text fg={fg()}>
                {isLast() ? <b>{segment}</b> : segment}
              </text>
              <Show when={!isLast()}>
                <text fg={terminalColors.textMuted}>{separator()}</text>
              </Show>
            </>
          );
        }}
      </For>
    </box>
  );
}

interface NavigationTrailProps {
  items: Array<{ screen: string; label: string }>;
  currentIndex: number;
  hoveredIndex?: number | null;
}

export function NavigationTrail(props: NavigationTrailProps) {
  return (
    <box flexDirection="row">
      <For each={props.items}>
        {(item, index) => {
          const isCurrent = () => index() === props.currentIndex;
          const isPast = () => index() < props.currentIndex;
          const isHovered = () => index() === props.hoveredIndex;

          const fg = () => {
            if (isCurrent()) return terminalColors.accent;
            if (isHovered()) return terminalColors.text;
            if (isPast()) return terminalColors.textSecondary;
            return terminalColors.textMuted;
          };

          const indicator = () => {
            if (isCurrent()) return '●';
            if (isPast()) return '○';
            return '○';
          };

          return (
            <box flexDirection="row" marginRight={2}>
              <text fg={fg()}>{indicator()} </text>
              <text fg={fg()}>{item.label}</text>
            </box>
          );
        }}
      </For>
    </box>
  );
}
