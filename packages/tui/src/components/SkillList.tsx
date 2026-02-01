import { Show, For } from 'solid-js';
import { terminalColors } from '../theme/colors.js';
import { symbols } from '../theme/symbols.js';
import { calculatePagination } from '../utils/list.js';
import type { SkillItem } from '../state/types.js';

interface SkillListProps {
  skills: SkillItem[];
  selectedIndex: number;
  maxVisible?: number;
  onSelect?: (skill: SkillItem) => void;
}

export function SkillList(props: SkillListProps) {
  const maxVisible = () => props.maxVisible ?? 10;

  const pagination = () => calculatePagination(props.skills.length, props.selectedIndex, maxVisible());
  const visibleSkills = () => props.skills.slice(pagination().start, pagination().end);

  return (
    <Show when={props.skills.length > 0} fallback={<text fg={terminalColors.textMuted}>No skills found</text>}>
      <box flexDirection="column">
        <Show when={pagination().itemsAbove > 0}>
          <text fg={terminalColors.textMuted}>
            {symbols.arrowUp} {pagination().itemsAbove} more above
          </text>
        </Show>

        <For each={visibleSkills()}>
          {(skill, idx) => {
            const actualIndex = () => pagination().start + idx();
            const isSelected = () => actualIndex() === props.selectedIndex;
            const pointer = () => (isSelected() ? symbols.pointer : symbols.pointerInactive);
            const fg = () => (isSelected() ? terminalColors.accent : terminalColors.text);
            const statusIcon = () => (skill.enabled ? symbols.active : symbols.pending);
            const descPart = () =>
              skill.description
                ? ` - ${skill.description.slice(0, 40)}${skill.description.length > 40 ? '...' : ''}`
                : '';
            const line = () => `${pointer()} ${skill.name} ${statusIcon()}${descPart()}`;

            return <text fg={fg()}>{isSelected() ? <b>{line()}</b> : line()}</text>;
          }}
        </For>

        <Show when={pagination().itemsBelow > 0}>
          <text fg={terminalColors.textMuted}>
            {symbols.arrowDown} {pagination().itemsBelow} more below
          </text>
        </Show>
      </box>
    </Show>
  );
}
