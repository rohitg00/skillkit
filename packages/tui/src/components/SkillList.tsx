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
        const descPart = skill.description
          ? ` - ${skill.description.slice(0, 40)}${skill.description.length > 40 ? '...' : ''}`
          : '';
        // Use single text element to avoid rendering overlap
        const line = `${pointer} ${skill.name} ${statusIcon}${descPart}`;

        return (
          <text key={skill.name} fg={fg}>
            {isSelected ? <b>{line}</b> : line}
          </text>
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
