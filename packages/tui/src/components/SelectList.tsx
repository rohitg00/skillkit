/**
 * SelectList Component
 * Reusable list with j/k + mouse navigation
 */

import { For, Show, createMemo } from 'solid-js';
import { terminalColors } from '../theme/colors.js';

export interface SelectListItem {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  meta?: string;
  disabled?: boolean;
}

interface SelectListProps {
  items: SelectListItem[];
  selectedIndex: number;
  hoveredIndex?: number | null;
  onSelect?: (item: SelectListItem, index: number) => void;
  onHover?: (index: number) => void;
  maxVisible?: number;
  showIndex?: boolean;
  emptyText?: string;
  compact?: boolean;
}

export function SelectList(props: SelectListProps) {
  const maxVisible = () => props.maxVisible ?? 10;
  const showIndex = () => props.showIndex ?? false;
  const compact = () => props.compact ?? false;

  const scrollOffset = createMemo(() => {
    const selected = props.selectedIndex;
    const visible = maxVisible();
    const total = props.items.length;

    if (total <= visible) return 0;
    if (selected < visible / 2) return 0;
    if (selected > total - visible / 2) return total - visible;
    return Math.floor(selected - visible / 2);
  });

  const visibleItems = createMemo(() => {
    const offset = scrollOffset();
    return props.items.slice(offset, offset + maxVisible()).map((item, i) => ({
      item,
      originalIndex: offset + i,
    }));
  });

  const hasScrollUp = createMemo(() => scrollOffset() > 0);
  const hasScrollDown = createMemo(
    () => scrollOffset() + maxVisible() < props.items.length
  );

  return (
    <box flexDirection="column">
      <Show when={props.items.length === 0}>
        <text fg={terminalColors.textMuted}>{props.emptyText || 'No items'}</text>
      </Show>

      <Show when={hasScrollUp()}>
        <text fg={terminalColors.textMuted}>  ▲ {scrollOffset()} more</text>
      </Show>

      <For each={visibleItems()}>
        {({ item, originalIndex }) => {
          const isSelected = () => originalIndex === props.selectedIndex;
          const isHovered = () => originalIndex === props.hoveredIndex;
          const isDisabled = () => item.disabled ?? false;

          const fg = () => {
            if (isDisabled()) return terminalColors.textMuted;
            if (isSelected()) return terminalColors.accent;
            if (isHovered()) return terminalColors.text;
            return terminalColors.textSecondary;
          };

          const prefix = () => {
            if (isSelected()) return '▸ ';
            if (isHovered()) return '▹ ';
            return '  ';
          };

          return (
            <box flexDirection={compact() ? 'row' : 'column'} marginBottom={compact() ? 0 : 1}>
              <box flexDirection="row">
                <text fg={fg()}>{prefix()}</text>
                <Show when={showIndex()}>
                  <text fg={terminalColors.textMuted} width={4}>
                    {String(originalIndex + 1).padStart(2, ' ')}.{' '}
                  </text>
                </Show>
                <Show when={item.icon}>
                  <text fg={fg()}>{item.icon} </text>
                </Show>
                <text fg={fg()}>{item.label}</text>
                <Show when={item.meta}>
                  <text fg={terminalColors.textMuted}> ({item.meta})</text>
                </Show>
              </box>
              <Show when={item.description && !compact()}>
                <box marginLeft={2}>
                  <text fg={terminalColors.textMuted}>{item.description}</text>
                </box>
              </Show>
            </box>
          );
        }}
      </For>

      <Show when={hasScrollDown()}>
        <text fg={terminalColors.textMuted}>
          {'  '}▼ {props.items.length - scrollOffset() - maxVisible()} more
        </text>
      </Show>
    </box>
  );
}
