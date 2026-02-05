import type { ComposableSkill, LLMProvider } from '../providers/types.js';
import { SkillAnalyzer } from './analyzer.js';
import { SkillMerger } from './merger.js';

export interface ComposeOptions {
  preserveAll?: boolean;
  conflictStrategy?: 'first' | 'merge' | 'best';
  targetAgent?: string;
}

export interface ComposedSkill {
  name: string;
  description: string;
  content: string;
  sourceSkills: string[];
  mergeReport: MergeReport;
}

export interface MergeReport {
  sectionsPreserved: number;
  conflictsResolved: number;
  duplicatesRemoved: number;
  totalSections: number;
}

export interface CompositionResult {
  skill: ComposedSkill;
  warnings: string[];
  suggestions: string[];
}

export class SkillComposer {
  private analyzer: SkillAnalyzer;
  private merger: SkillMerger;
  private provider?: LLMProvider;

  constructor(provider?: LLMProvider) {
    this.analyzer = new SkillAnalyzer();
    this.merger = new SkillMerger(provider);
    this.provider = provider;
  }

  async findComposable(query: string, limit = 10): Promise<ComposableSkill[]> {
    return this.analyzer.findComposableSkills(query, limit);
  }

  async analyzeSkill(skillContent: string): Promise<{
    sections: string[];
    patterns: string[];
    complexity: number;
  }> {
    return this.analyzer.analyzeSkillContent(skillContent);
  }

  async compose(skills: ComposableSkill[], options: ComposeOptions = {}): Promise<CompositionResult> {
    if (skills.length === 0) {
      throw new Error('No skills provided for composition');
    }

    if (skills.length === 1) {
      return {
        skill: {
          name: skills[0].name,
          description: skills[0].description || '',
          content: skills[0].content,
          sourceSkills: [skills[0].name],
          mergeReport: {
            sectionsPreserved: 1,
            conflictsResolved: 0,
            duplicatesRemoved: 0,
            totalSections: 1,
          },
        },
        warnings: [],
        suggestions: ['Consider adding more skills for a richer composition'],
      };
    }

    const mergeResult = await this.merger.merge(skills, options);

    const warnings: string[] = [];
    const suggestions: string[] = [];

    if (mergeResult.report.conflictsResolved > 0) {
      warnings.push(`${mergeResult.report.conflictsResolved} conflicts were resolved automatically`);
    }

    if (mergeResult.report.duplicatesRemoved > 0) {
      suggestions.push(`${mergeResult.report.duplicatesRemoved} duplicate sections were consolidated`);
    }

    const sourceNames = skills.map((s) => s.name);
    const composedName = this.generateComposedName(sourceNames);
    const composedDescription = this.generateComposedDescription(skills);

    return {
      skill: {
        name: composedName,
        description: composedDescription,
        content: mergeResult.content,
        sourceSkills: sourceNames,
        mergeReport: mergeResult.report,
      },
      warnings,
      suggestions,
    };
  }

  async composeWithAI(
    skills: ComposableSkill[],
    expertise: string,
    options: ComposeOptions = {}
  ): Promise<CompositionResult> {
    if (!this.provider) {
      return this.compose(skills, options);
    }

    const basicComposition = await this.compose(skills, options);

    try {
      const enhancedContent = await this.provider.chat([
        {
          role: 'system',
          content: `You are an expert skill designer. Given a composed skill from multiple sources, enhance and refine it to be cohesive and well-organized. Preserve all important patterns while removing redundancy.

Return the enhanced skill content in markdown format.`,
        },
        {
          role: 'user',
          content: `Expertise goal: ${expertise}

Source skills: ${skills.map((s) => s.name).join(', ')}

Composed content to enhance:
${basicComposition.skill.content}

Enhance this skill to be more cohesive while preserving all valuable patterns:`,
        },
      ]);

      basicComposition.skill.content = enhancedContent;
      basicComposition.suggestions.push('Content was enhanced by AI for better cohesion');
    } catch (error) {
      basicComposition.warnings.push('AI enhancement skipped: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }

    return basicComposition;
  }

  private generateComposedName(sourceNames: string[]): string {
    if (sourceNames.length === 1) {
      return sourceNames[0];
    }

    const commonWords = this.findCommonWords(sourceNames);
    if (commonWords.length > 0) {
      return commonWords.join('-') + '-composite';
    }

    const shortened = sourceNames.slice(0, 2).map((n) => n.split('-')[0]);
    return shortened.join('-') + '-composite';
  }

  private generateComposedDescription(skills: ComposableSkill[]): string {
    const descriptions = skills
      .filter((s) => s.description)
      .map((s) => s.description!);

    if (descriptions.length === 0) {
      return `Composed skill from ${skills.length} sources`;
    }

    if (descriptions.length === 1) {
      return descriptions[0];
    }

    const themes = this.extractThemes(descriptions);
    return `Comprehensive skill combining: ${themes.join(', ')}`;
  }

  private findCommonWords(names: string[]): string[] {
    const wordSets = names.map((n) =>
      new Set(n.toLowerCase().split(/[-_\s]+/))
    );

    if (wordSets.length === 0) return [];

    const common = [...wordSets[0]].filter((word) =>
      wordSets.every((set) => set.has(word))
    );

    const stopWords = new Set(['the', 'a', 'an', 'for', 'with', 'and', 'or', 'skill', 'best', 'practices']);
    return common.filter((w) => w.length > 2 && !stopWords.has(w));
  }

  private extractThemes(descriptions: string[]): string[] {
    const words: Map<string, number> = new Map();

    for (const desc of descriptions) {
      const descWords = desc.toLowerCase().split(/\s+/);
      for (const word of descWords) {
        if (word.length > 4) {
          words.set(word, (words.get(word) || 0) + 1);
        }
      }
    }

    return [...words.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([word]) => word);
  }
}

export { SkillAnalyzer } from './analyzer.js';
export { SkillMerger } from './merger.js';
