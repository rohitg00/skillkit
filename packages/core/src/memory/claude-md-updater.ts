/**
 * CLAUDE.md Auto-Updater
 *
 * Automatically updates CLAUDE.md with learnings from memory.
 * Populates the LEARNED section with high-effectiveness insights.
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { homedir } from 'node:os';
import type { Learning } from './types.js';
import { LearningStore } from './learning-store.js';

/**
 * CLAUDE.md section markers
 */
const SKILLKIT_MARKER = '<!-- Auto-populated by SkillKit -->';

/**
 * Update options
 */
export interface ClaudeMdUpdateOptions {
  minEffectiveness?: number;
  maxLearnings?: number;
  includeGlobal?: boolean;
  preserveManualEntries?: boolean;
  sectionTitle?: string;
  addTimestamp?: boolean;
}

/**
 * Default update options
 */
const DEFAULT_UPDATE_OPTIONS: Required<ClaudeMdUpdateOptions> = {
  minEffectiveness: 60,
  maxLearnings: 20,
  includeGlobal: false,
  preserveManualEntries: true,
  sectionTitle: 'LEARNED',
  addTimestamp: true,
};

/**
 * Parsed CLAUDE.md structure
 */
export interface ParsedClaudeMd {
  content: string;
  sections: Map<string, { start: number; end: number; content: string }>;
  hasLearnedSection: boolean;
  learnedSectionContent?: string;
  learnedSectionRange?: { start: number; end: number };
}

/**
 * Update result
 */
export interface ClaudeMdUpdateResult {
  updated: boolean;
  path: string;
  learningsAdded: number;
  learningSummaries: string[];
  previousLearnings: number;
}

/**
 * CLAUDE.md Updater
 *
 * Manages automatic updates to CLAUDE.md with learnings from memory.
 */
export class ClaudeMdUpdater {
  private projectPath: string;
  private claudeMdPath: string;

  constructor(projectPath: string, claudeMdPath?: string) {
    this.projectPath = projectPath;
    this.claudeMdPath = claudeMdPath || join(projectPath, 'CLAUDE.md');
  }

  /**
   * Parse CLAUDE.md to extract structure
   */
  parse(): ParsedClaudeMd {
    if (!existsSync(this.claudeMdPath)) {
      return {
        content: '',
        sections: new Map(),
        hasLearnedSection: false,
      };
    }

    const content = readFileSync(this.claudeMdPath, 'utf-8');
    const sections = new Map<string, { start: number; end: number; content: string }>();

    const lines = content.split('\n');
    let currentSection: string | null = null;
    let sectionStart = 0;
    let sectionContent: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const headerMatch = line.match(/^(#{1,3})\s+(.+)$/);

      if (headerMatch) {
        if (currentSection) {
          sections.set(currentSection, {
            start: sectionStart,
            end: i - 1,
            content: sectionContent.join('\n'),
          });
        }

        currentSection = headerMatch[2].trim();
        sectionStart = i;
        sectionContent = [line];
      } else if (currentSection) {
        sectionContent.push(line);
      }
    }

    if (currentSection) {
      sections.set(currentSection, {
        start: sectionStart,
        end: lines.length - 1,
        content: sectionContent.join('\n'),
      });
    }

    const learnedSection = sections.get('LEARNED') || sections.get('Learned');
    const hasLearnedSection = !!learnedSection;

    return {
      content,
      sections,
      hasLearnedSection,
      learnedSectionContent: learnedSection?.content,
      learnedSectionRange: learnedSection
        ? { start: learnedSection.start, end: learnedSection.end }
        : undefined,
    };
  }

  /**
   * Get learnings to add to CLAUDE.md
   */
  getLearningsForClaudeMd(options: ClaudeMdUpdateOptions = {}): Learning[] {
    const opts = { ...DEFAULT_UPDATE_OPTIONS, ...options };

    const projectStore = new LearningStore('project', this.projectPath);
    let learnings = projectStore.getAll();

    if (opts.includeGlobal) {
      const globalStore = new LearningStore('global');
      learnings = [...learnings, ...globalStore.getAll()];
    }

    return learnings
      .filter((l) => (l.effectiveness ?? 0) >= opts.minEffectiveness || l.useCount >= 3)
      .sort((a, b) => {
        const scoreA = (a.effectiveness ?? 50) + a.useCount * 5;
        const scoreB = (b.effectiveness ?? 50) + b.useCount * 5;
        return scoreB - scoreA;
      })
      .slice(0, opts.maxLearnings);
  }

  /**
   * Format learnings as CLAUDE.md LEARNED section
   */
  formatLearnedSection(learnings: Learning[], options: ClaudeMdUpdateOptions = {}): string {
    const opts = { ...DEFAULT_UPDATE_OPTIONS, ...options };
    const lines: string[] = [];

    lines.push(`## ${opts.sectionTitle}`);
    lines.push('');
    lines.push(SKILLKIT_MARKER);

    if (opts.addTimestamp) {
      lines.push(`<!-- Last updated: ${new Date().toISOString()} -->`);
    }

    lines.push('');

    const byCategory = this.categorizeLearnings(learnings);

    for (const [category, categoryLearnings] of byCategory) {
      if (categoryLearnings.length > 0) {
        lines.push(`### ${category}`);

        for (const learning of categoryLearnings) {
          const title = this.formatLearningTitle(learning);
          const summary = this.extractSummary(learning.content);
          lines.push(`${title}`);
          lines.push(summary);
          lines.push('');
        }
      }
    }

    return lines.join('\n');
  }

  /**
   * Update CLAUDE.md with learnings
   */
  update(options: ClaudeMdUpdateOptions = {}): ClaudeMdUpdateResult {
    const opts = { ...DEFAULT_UPDATE_OPTIONS, ...options };
    const learnings = this.getLearningsForClaudeMd(opts);

    if (learnings.length === 0) {
      return {
        updated: false,
        path: this.claudeMdPath,
        learningsAdded: 0,
        learningSummaries: [],
        previousLearnings: 0,
      };
    }

    const parsed = this.parse();
    const newSection = this.formatLearnedSection(learnings, opts);

    let newContent: string;
    let previousLearnings = 0;

    if (parsed.hasLearnedSection && parsed.learnedSectionRange) {
      if (opts.preserveManualEntries) {
        const existingContent = parsed.learnedSectionContent || '';
        const manualEntries = this.extractManualEntries(existingContent);
        previousLearnings = this.countLearnings(existingContent);

        const combinedSection = this.combineWithManualEntries(newSection, manualEntries);

        const lines = parsed.content.split('\n');
        const before = lines.slice(0, parsed.learnedSectionRange.start).join('\n');
        const after = lines.slice(parsed.learnedSectionRange.end + 1).join('\n');

        newContent = before + (before ? '\n' : '') + combinedSection + (after ? '\n' + after : '');
      } else {
        const lines = parsed.content.split('\n');
        const before = lines.slice(0, parsed.learnedSectionRange.start).join('\n');
        const after = lines.slice(parsed.learnedSectionRange.end + 1).join('\n');

        newContent = before + (before ? '\n' : '') + newSection + (after ? '\n' + after : '');
      }
    } else if (parsed.content) {
      newContent = parsed.content + '\n\n' + newSection;
    } else {
      newContent = this.createNewClaudeMd(newSection);
    }

    const dir = dirname(this.claudeMdPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    writeFileSync(this.claudeMdPath, newContent, 'utf-8');

    return {
      updated: true,
      path: this.claudeMdPath,
      learningsAdded: learnings.length,
      learningSummaries: learnings.map((l) => l.title),
      previousLearnings,
    };
  }

  /**
   * Preview update without writing
   */
  preview(options: ClaudeMdUpdateOptions = {}): {
    learnings: Learning[];
    formattedSection: string;
    wouldUpdate: boolean;
  } {
    const learnings = this.getLearningsForClaudeMd(options);
    const formattedSection = this.formatLearnedSection(learnings, options);

    return {
      learnings,
      formattedSection,
      wouldUpdate: learnings.length > 0,
    };
  }

  /**
   * Check if CLAUDE.md exists
   */
  exists(): boolean {
    return existsSync(this.claudeMdPath);
  }

  /**
   * Get CLAUDE.md path
   */
  getPath(): string {
    return this.claudeMdPath;
  }

  private categorizeLearnings(learnings: Learning[]): Map<string, Learning[]> {
    const categories = new Map<string, Learning[]>();

    for (const learning of learnings) {
      let category = 'General';

      if (learning.patterns?.includes('error-handling')) {
        category = 'Error-Handling';
      } else if (learning.patterns?.includes('debugging')) {
        category = 'Debugging';
      } else if (learning.patterns?.includes('architecture')) {
        category = 'Architecture';
      } else if (learning.patterns?.includes('workflow')) {
        category = 'Workflow';
      } else if (learning.tags.some((t) => t.includes('react') || t.includes('typescript'))) {
        category = 'Code-Patterns';
      }

      const existing = categories.get(category) || [];
      existing.push(learning);
      categories.set(category, existing);
    }

    return categories;
  }

  private formatLearningTitle(learning: Learning): string {
    const tags = learning.tags.slice(0, 3).join(', ');
    return tags ? `**${tags}**: ${learning.title}` : `**${learning.title}**`;
  }

  private extractSummary(content: string): string {
    const lines = content.split('\n').filter((l) => l.trim());

    for (const line of lines) {
      const cleaned = line.replace(/^#+\s*/, '').replace(/^\*\*.*?\*\*:?\s*/, '');
      if (cleaned.length > 20 && !cleaned.startsWith('#')) {
        return cleaned.slice(0, 200) + (cleaned.length > 200 ? '...' : '');
      }
    }

    return content.slice(0, 200) + (content.length > 200 ? '...' : '');
  }

  private extractManualEntries(sectionContent: string): string[] {
    const lines = sectionContent.split('\n');
    const manualEntries: string[] = [];
    let inManualEntry = false;
    let currentEntry: string[] = [];

    for (const line of lines) {
      if (line.includes(SKILLKIT_MARKER)) {
        inManualEntry = false;
        continue;
      }

      if (line.startsWith('### ') && !line.includes('Auto-populated')) {
        if (currentEntry.length > 0) {
          manualEntries.push(currentEntry.join('\n'));
        }
        inManualEntry = true;
        currentEntry = [line];
      } else if (inManualEntry) {
        currentEntry.push(line);
      }
    }

    if (currentEntry.length > 0) {
      manualEntries.push(currentEntry.join('\n'));
    }

    return manualEntries.filter((e) => e.trim().length > 0);
  }

  private combineWithManualEntries(autoSection: string, manualEntries: string[]): string {
    if (manualEntries.length === 0) {
      return autoSection;
    }

    const lines = autoSection.split('\n');
    const combinedLines = [...lines];

    combinedLines.push('');
    combinedLines.push('### Manual Entries');
    combinedLines.push('<!-- Preserved from previous edits -->');
    combinedLines.push('');

    for (const entry of manualEntries) {
      combinedLines.push(entry);
      combinedLines.push('');
    }

    return combinedLines.join('\n');
  }

  private countLearnings(content: string): number {
    const matches = content.match(/^\*\*[^*]+\*\*/gm);
    return matches ? matches.length : 0;
  }

  private createNewClaudeMd(learnedSection: string): string {
    const projectName = this.projectPath.split('/').pop() || 'Project';

    return `# ${projectName}

${learnedSection}
`;
  }
}

/**
 * Create a CLAUDE.md updater
 */
export function createClaudeMdUpdater(
  projectPath: string,
  claudeMdPath?: string
): ClaudeMdUpdater {
  return new ClaudeMdUpdater(projectPath, claudeMdPath);
}

/**
 * Update CLAUDE.md with learnings (standalone function)
 */
export function updateClaudeMd(
  projectPath: string,
  options: ClaudeMdUpdateOptions = {}
): ClaudeMdUpdateResult {
  const updater = new ClaudeMdUpdater(projectPath);
  return updater.update(options);
}

/**
 * Sync global CLAUDE.md with global learnings
 */
export function syncGlobalClaudeMd(options: ClaudeMdUpdateOptions = {}): ClaudeMdUpdateResult {
  const globalClaudeMdPath = join(homedir(), '.claude', 'CLAUDE.md');
  const updater = new ClaudeMdUpdater(homedir(), globalClaudeMdPath);

  const globalOpts: ClaudeMdUpdateOptions = {
    ...options,
    includeGlobal: true,
    sectionTitle: 'Global Learnings',
  };

  return updater.update(globalOpts);
}
