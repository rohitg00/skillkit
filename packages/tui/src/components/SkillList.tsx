/**
 * SkillList Component
 * Paginated list of skills with selection
 */
import { terminalColors } from '../theme/colors.js';
import { symbols } from '../theme/symbols.js';
import { calculatePagination, type PaginationResult } from '../utils/list.js';
import type { SkillItem } from '../state/types.js';

interface SkillListProps {
  skills: SkillItem[];
  selectedIndex: number;
  maxVisible?: number;
  onSelect?: (skill: SkillItem) => void;
}

export function SkillList({
  skills,
  selectedIndex,
  maxVisible = 10,
  onSelect,
}: SkillListProps) {
  if (skills.length === 0) {
    return (
      <text fg={terminalColors.textMuted}>No skills found</text>
    );
  }

  const pagination = calculatePagination(skills.length, selectedIndex, maxVisible);
  const visibleSkills = skills.slice(pagination.start, pagination.end);

  return (
    <box flexDirection="column">
      {/* Items above indicator */}
      {pagination.itemsAbove > 0 && (
        <text fg={terminalColors.textMuted}>
          {symbols.arrowUp} {pagination.itemsAbove} more above
        </text>
      )}

      {/* Skill list */}
      {visibleSkills.map((skill, idx) => {
        const actualIndex = pagination.start + idx;
        const isSelected = actualIndex === selectedIndex;
        const pointer = isSelected ? symbols.pointer : symbols.pointerInactive;
        const fg = isSelected ? terminalColors.accent : terminalColors.text;
        const statusIcon = skill.enabled ? symbols.active : symbols.pending;
        const statusColor = skill.enabled
          ? terminalColors.success
          : terminalColors.textMuted;

        return (
          <box key={skill.name} flexDirection="row">
            <text fg={fg}>
              {isSelected ? <b>{pointer} {skill.name}</b> : <>{pointer} {skill.name}</>}
            </text>
            <text fg={terminalColors.textMuted}>
              {' '}{statusIcon}
            </text>
            {skill.description && (
              <text fg={terminalColors.textMuted}>
                {' '}- {skill.description.slice(0, 40)}
                {skill.description.length > 40 ? '...' : ''}
              </text>
            )}
          </box>
        );
      })}

      {/* Items below indicator */}
      {pagination.itemsBelow > 0 && (
        <text fg={terminalColors.textMuted}>
          {symbols.arrowDown} {pagination.itemsBelow} more below
        </text>
      )}
    </box>
  );
}
