import type { ComposableSkill, LLMProvider } from '../providers/types.js';
import type { ComposeOptions, MergeReport } from './index.js';
import { SkillAnalyzer, type SkillSection, type SkillAnalysis } from './analyzer.js';

export interface MergeResult {
  content: string;
  report: MergeReport;
}

interface SectionGroup {
  title: string;
  sections: Array<{
    content: string;
    skillName: string;
    importance: number;
  }>;
  type: SkillSection['type'];
}

export class SkillMerger {
  private analyzer: SkillAnalyzer;

  constructor(_provider?: LLMProvider) {
    this.analyzer = new SkillAnalyzer();
  }

  async merge(skills: ComposableSkill[], options: ComposeOptions = {}): Promise<MergeResult> {
    const { conflictStrategy = 'merge' } = options;

    const analyses: Array<{ skill: ComposableSkill; analysis: SkillAnalysis }> = [];
    for (const skill of skills) {
      analyses.push({
        skill,
        analysis: this.analyzer.parseSkillContent(skill.content),
      });
    }

    const sectionGroups = this.groupSections(analyses);

    let mergedContent = '';
    let conflictsResolved = 0;
    let duplicatesRemoved = 0;
    let sectionsPreserved = 0;

    const sortedGroups = this.sortSectionGroups(sectionGroups);

    for (const group of sortedGroups) {
      if (group.sections.length === 1) {
        mergedContent += group.sections[0].content + '\n\n';
        sectionsPreserved++;
      } else {
        const mergeResult = this.mergeSectionGroup(group, conflictStrategy);
        mergedContent += mergeResult.content + '\n\n';

        if (mergeResult.hadConflicts) {
          conflictsResolved++;
        }
        if (mergeResult.duplicatesFound > 0) {
          duplicatesRemoved += mergeResult.duplicatesFound;
        }
        sectionsPreserved++;
      }
    }

    mergedContent = this.cleanupContent(mergedContent);

    return {
      content: mergedContent.trim(),
      report: {
        sectionsPreserved,
        conflictsResolved,
        duplicatesRemoved,
        totalSections: sortedGroups.length,
      },
    };
  }

  private groupSections(
    analyses: Array<{ skill: ComposableSkill; analysis: SkillAnalysis }>
  ): Map<string, SectionGroup> {
    const groups: Map<string, SectionGroup> = new Map();

    for (const { skill, analysis } of analyses) {
      for (const section of analysis.sections) {
        const normalizedTitle = this.normalizeTitle(section.title);

        if (!groups.has(normalizedTitle)) {
          groups.set(normalizedTitle, {
            title: section.title,
            sections: [],
            type: section.type,
          });
        }

        const group = groups.get(normalizedTitle)!;
        group.sections.push({
          content: section.content,
          skillName: skill.name,
          importance: section.importance,
        });

        if (this.getSectionTypePriority(section.type) > this.getSectionTypePriority(group.type)) {
          group.type = section.type;
        }
      }
    }

    return groups;
  }

  private sortSectionGroups(groups: Map<string, SectionGroup>): SectionGroup[] {
    const sortedGroups = [...groups.values()];

    const typePriority: Record<SkillSection['type'], number> = {
      trigger: 1,
      rule: 2,
      instruction: 3,
      example: 4,
      metadata: 5,
    };

    sortedGroups.sort((a, b) => {
      const priorityDiff = typePriority[a.type] - typePriority[b.type];
      if (priorityDiff !== 0) return priorityDiff;

      const importanceA = Math.max(...a.sections.map((s) => s.importance));
      const importanceB = Math.max(...b.sections.map((s) => s.importance));
      return importanceB - importanceA;
    });

    return sortedGroups;
  }

  private mergeSectionGroup(
    group: SectionGroup,
    strategy: 'first' | 'merge' | 'best'
  ): { content: string; hadConflicts: boolean; duplicatesFound: number } {
    if (group.sections.length === 0) {
      return { content: '', hadConflicts: false, duplicatesFound: 0 };
    }

    if (group.sections.length === 1) {
      return { content: group.sections[0].content, hadConflicts: false, duplicatesFound: 0 };
    }

    const sortedSections = [...group.sections].sort((a, b) => b.importance - a.importance);

    switch (strategy) {
      case 'first':
        return {
          content: sortedSections[0].content,
          hadConflicts: sortedSections.length > 1,
          duplicatesFound: sortedSections.length - 1,
        };

      case 'best':
        return {
          content: sortedSections[0].content,
          hadConflicts: false,
          duplicatesFound: sortedSections.length - 1,
        };

      case 'merge':
      default:
        return this.intelligentMerge(group, sortedSections);
    }
  }

  private intelligentMerge(
    _group: SectionGroup,
    sortedSections: Array<{ content: string; skillName: string; importance: number }>
  ): { content: string; hadConflicts: boolean; duplicatesFound: number } {
    const uniqueLines: Set<string> = new Set();
    const mergedLines: string[] = [];
    let duplicatesFound = 0;

    const primaryContent = sortedSections[0].content;
    const primaryLines = primaryContent.split('\n');

    for (const line of primaryLines) {
      const normalizedLine = this.normalizeLine(line);
      if (normalizedLine && !uniqueLines.has(normalizedLine)) {
        uniqueLines.add(normalizedLine);
        mergedLines.push(line);
      }
    }

    for (let i = 1; i < sortedSections.length; i++) {
      const section = sortedSections[i];
      const lines = section.content.split('\n');

      let addedFromSection = false;

      for (const line of lines) {
        const normalizedLine = this.normalizeLine(line);

        if (!normalizedLine) continue;

        if (uniqueLines.has(normalizedLine)) {
          duplicatesFound++;
          continue;
        }

        if (this.isHeading(line)) {
          continue;
        }

        uniqueLines.add(normalizedLine);
        if (!addedFromSection) {
          mergedLines.push(`\n<!-- From ${section.skillName} -->`);
          addedFromSection = true;
        }
        mergedLines.push(line);
      }
    }

    return {
      content: mergedLines.join('\n'),
      hadConflicts: sortedSections.length > 1,
      duplicatesFound,
    };
  }

  private normalizeTitle(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  }

  private normalizeLine(line: string): string {
    return line
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private isHeading(line: string): boolean {
    return /^#{1,6}\s/.test(line.trim());
  }

  private getSectionTypePriority(type: SkillSection['type']): number {
    const priority: Record<SkillSection['type'], number> = {
      rule: 5,
      instruction: 4,
      trigger: 3,
      example: 2,
      metadata: 1,
    };
    return priority[type] || 0;
  }

  private cleanupContent(content: string): string {
    let cleaned = content.replace(/\n{3,}/g, '\n\n');

    cleaned = cleaned.replace(/<!--.*?-->\n?/g, '');

    cleaned = cleaned.trim();

    return cleaned;
  }
}
