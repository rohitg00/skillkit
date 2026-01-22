import React from 'react';
import { Box, Text } from 'ink';
import { colors, symbols } from '../theme.js';

export interface SkillItem {
  name: string;
  description?: string;
  source?: string;
  installs?: number;
  enabled?: boolean;
}

interface SkillListProps {
  skills: SkillItem[];
  selectedIndex: number;
  showInstalls?: boolean;
  showRank?: boolean;
  showSource?: boolean;
  maxVisible?: number;
}

function formatInstalls(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return String(count);
}

export function SkillList({
  skills,
  selectedIndex,
  showInstalls = false,
  showRank = false,
  showSource = true,
  maxVisible = 10,
}: SkillListProps) {
  if (skills.length === 0) {
    return (
      <Box>
        <Text color={colors.secondaryDim} dimColor>
          No skills found
        </Text>
      </Box>
    );
  }

  const startIndex = Math.max(0, selectedIndex - Math.floor(maxVisible / 2));
  const visibleSkills = skills.slice(startIndex, startIndex + maxVisible);
  const actualStartIndex = startIndex;

  return (
    <Box flexDirection="column">
      {showRank && (
        <Box marginBottom={1}>
          <Text color={colors.secondaryDim}>
            {'  #  SKILL'}
            {showSource && '                         SOURCE'}
            {showInstalls && '        INSTALLS'}
          </Text>
        </Box>
      )}

      {visibleSkills.map((skill, idx) => {
        const realIndex = actualStartIndex + idx;
        const isSelected = realIndex === selectedIndex;
        const skillName = skill.name.padEnd(28).slice(0, 28);
        const sourceName = skill.source ? skill.source.slice(0, 25) : '';

        return (
          <Box key={`${skill.source}-${skill.name}`}>
            <Text
              color={isSelected ? colors.primary : colors.secondary}
              bold={isSelected}
              inverse={isSelected}
            >
              {isSelected ? symbols.pointer : ' '}
              {showRank ? String(realIndex + 1).padStart(2, ' ') : ''}
              {'  '}
              {skillName}
            </Text>
            {showSource && (
              <Text color={colors.secondaryDim} dimColor={!isSelected}>
                {' '}{sourceName}
              </Text>
            )}
            {showInstalls && skill.installs !== undefined && (
              <Text color={colors.secondaryDim}>
                {formatInstalls(skill.installs).padStart(8)}
              </Text>
            )}
          </Box>
        );
      })}

      {skills.length > maxVisible && (
        <Box marginTop={1}>
          <Text color={colors.secondaryDim} dimColor>
            Showing {startIndex + 1}-{Math.min(startIndex + maxVisible, skills.length)} of {skills.length}
          </Text>
        </Box>
      )}
    </Box>
  );
}
