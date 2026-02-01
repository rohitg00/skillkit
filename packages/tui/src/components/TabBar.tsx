/**
 * TabBar Component
 * Clickable tab navigation
 */

import { For, Show } from 'solid-js';
import { terminalColors } from '../theme/colors.js';

export interface Tab {
  id: string;
  label: string;
  icon?: string;
  badge?: string | number;
  disabled?: boolean;
}

interface TabBarProps {
  tabs: Tab[];
  activeId: string;
  hoveredId?: string | null;
  onSelect?: (id: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
  showShortcuts?: boolean;
}

export function TabBar(props: TabBarProps) {
  const variant = () => props.variant ?? 'default';
  const size = () => props.size ?? 'md';
  const showShortcuts = () => props.showShortcuts ?? false;

  const gap = () => {
    switch (size()) {
      case 'sm':
        return 1;
      case 'lg':
        return 3;
      default:
        return 2;
    }
  };

  return (
    <box flexDirection="row">
      <For each={props.tabs}>
        {(tab, index) => {
          const isActive = () => tab.id === props.activeId;
          const isHovered = () => tab.id === props.hoveredId;
          const isDisabled = () => tab.disabled ?? false;

          const fg = () => {
            if (isDisabled()) return terminalColors.textMuted;
            if (isActive()) return terminalColors.accent;
            if (isHovered()) return terminalColors.text;
            return terminalColors.textSecondary;
          };

          const decoration = () => {
            if (variant() === 'underline' && isActive()) {
              return '─';
            }
            return '';
          };

          const brackets = () => {
            if (variant() === 'pills') {
              if (isActive()) return { left: '[', right: ']' };
              return { left: ' ', right: ' ' };
            }
            return { left: '', right: '' };
          };

          const handleClick = () => {
            if (!isDisabled() && props.onSelect) {
              props.onSelect(tab.id);
            }
          };

          return (
            <box flexDirection="column" marginRight={index() < props.tabs.length - 1 ? gap() : 0} onClick={handleClick}>
              <box flexDirection="row">
                <text fg={terminalColors.border}>{brackets().left}</text>
                <Show when={tab.icon}>
                  <text fg={fg()}>{tab.icon} </text>
                </Show>
                <text fg={fg()}>{tab.label}</text>
                <Show when={tab.badge !== undefined}>
                  <text fg={terminalColors.textMuted}> ({tab.badge})</text>
                </Show>
                <Show when={showShortcuts()}>
                  <text fg={terminalColors.textMuted}>
                    {' '}
                    {String(index() + 1)}
                  </text>
                </Show>
                <text fg={terminalColors.border}>{brackets().right}</text>
              </box>
              <Show when={variant() === 'underline'}>
                <text fg={isActive() ? terminalColors.accent : 'transparent'}>
                  {decoration().repeat(tab.label.length + (tab.icon ? 2 : 0))}
                </text>
              </Show>
            </box>
          );
        }}
      </For>
    </box>
  );
}

interface VerticalTabBarProps {
  tabs: Tab[];
  activeId: string;
  hoveredId?: string | null;
  onSelect?: (id: string) => void;
  width?: number;
}

export function VerticalTabBar(props: VerticalTabBarProps) {
  const width = () => props.width ?? 20;

  return (
    <box flexDirection="column" width={width()}>
      <For each={props.tabs}>
        {(tab) => {
          const isActive = () => tab.id === props.activeId;
          const isHovered = () => tab.id === props.hoveredId;
          const isDisabled = () => tab.disabled ?? false;

          const fg = () => {
            if (isDisabled()) return terminalColors.textMuted;
            if (isActive()) return terminalColors.accent;
            if (isHovered()) return terminalColors.text;
            return terminalColors.textSecondary;
          };

          const prefix = () => {
            if (isActive()) return '▸ ';
            if (isHovered()) return '▹ ';
            return '  ';
          };

          const handleClick = () => {
            if (!isDisabled() && props.onSelect) {
              props.onSelect(tab.id);
            }
          };

          return (
            <box
              flexDirection="row"
              marginBottom={1}
              onClick={handleClick}
            >
              <text fg={fg()}>{prefix()}</text>
              <Show when={tab.icon}>
                <text fg={fg()}>{tab.icon} </text>
              </Show>
              <text fg={fg()}>{tab.label}</text>
              <Show when={tab.badge !== undefined}>
                <text fg={terminalColors.textMuted}> ({tab.badge})</text>
              </Show>
            </box>
          );
        }}
      </For>
    </box>
  );
}
