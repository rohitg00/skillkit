import type { ComposableSkill } from '../providers/types.js';
import { SkillsSource } from '../context/skills-source.js';

export interface SkillAnalysis {
  sections: SkillSection[];
  patterns: string[];
  complexity: number;
  estimatedTokens: number;
}

export interface SkillSection {
  title: string;
  content: string;
  type: 'instruction' | 'example' | 'rule' | 'metadata' | 'trigger';
  importance: number;
}

export class SkillAnalyzer {
  private skillsSource: SkillsSource;

  constructor() {
    this.skillsSource = new SkillsSource();
  }

  async findComposableSkills(query: string, limit = 10): Promise<ComposableSkill[]> {
    const results = await this.skillsSource.searchSkills(query, limit * 2);

    return results.slice(0, limit).map(({ skill, score }) => ({
      name: skill.name,
      description: skill.description,
      content: this.generateSkillContent(skill),
      trustScore: this.estimateTrustScore(skill),
      relevance: score,
      source: skill.source,
    }));
  }

  analyzeSkillContent(content: string): {
    sections: string[];
    patterns: string[];
    complexity: number;
  } {
    const analysis = this.parseSkillContent(content);

    return {
      sections: analysis.sections.map((s) => s.title),
      patterns: analysis.patterns,
      complexity: analysis.complexity,
    };
  }

  parseSkillContent(content: string): SkillAnalysis {
    const sections: SkillSection[] = [];
    const patterns: string[] = [];

    const headingRegex = /^(#{1,3})\s+(.+)$/gm;
    const matches: Array<{ level: number; title: string; index: number }> = [];

    let match;
    while ((match = headingRegex.exec(content)) !== null) {
      matches.push({
        level: match[1].length,
        title: match[2].trim(),
        index: match.index,
      });
    }

    for (let i = 0; i < matches.length; i++) {
      const current = matches[i];
      const next = matches[i + 1];
      const endIndex = next ? next.index : content.length;
      const sectionContent = content.slice(current.index, endIndex).trim();

      const type = this.classifySectionType(current.title, sectionContent);
      const importance = this.calculateSectionImportance(type, sectionContent);

      sections.push({
        title: current.title,
        content: sectionContent,
        type,
        importance,
      });
    }

    if (sections.length === 0 && content.trim()) {
      sections.push({
        title: 'Main',
        content: content.trim(),
        type: 'instruction',
        importance: 1.0,
      });
    }

    const extractedPatterns = this.extractPatterns(content);
    patterns.push(...extractedPatterns);

    const complexity = this.calculateComplexity(sections, patterns);

    return {
      sections,
      patterns,
      complexity,
      estimatedTokens: Math.ceil(content.length / 4),
    };
  }

  findOverlappingSections(skills: ComposableSkill[]): Map<string, string[]> {
    const sectionMap: Map<string, string[]> = new Map();

    for (const skill of skills) {
      const analysis = this.parseSkillContent(skill.content);

      for (const section of analysis.sections) {
        const normalizedTitle = this.normalizeTitle(section.title);
        const existingSkills = sectionMap.get(normalizedTitle) || [];
        existingSkills.push(skill.name);
        sectionMap.set(normalizedTitle, existingSkills);
      }
    }

    const overlapping: Map<string, string[]> = new Map();
    for (const [title, skillNames] of sectionMap) {
      if (skillNames.length > 1) {
        overlapping.set(title, skillNames);
      }
    }

    return overlapping;
  }

  private classifySectionType(title: string, content: string): SkillSection['type'] {
    const titleLower = title.toLowerCase();

    if (titleLower.includes('trigger') || titleLower.includes('when to use') || titleLower.includes('activation')) {
      return 'trigger';
    }

    if (titleLower.includes('example') || titleLower.includes('sample') || content.includes('```')) {
      return 'example';
    }

    if (titleLower.includes('rule') || titleLower.includes('must') || titleLower.includes('never') || titleLower.includes('always')) {
      return 'rule';
    }

    if (titleLower.includes('metadata') || titleLower.includes('version') || titleLower.includes('author') || titleLower.includes('tags')) {
      return 'metadata';
    }

    return 'instruction';
  }

  private calculateSectionImportance(type: SkillSection['type'], content: string): number {
    const baseImportance: Record<SkillSection['type'], number> = {
      rule: 0.95,
      instruction: 0.85,
      trigger: 0.8,
      example: 0.7,
      metadata: 0.3,
    };

    let importance = baseImportance[type];

    const importantKeywords = ['must', 'never', 'always', 'critical', 'important', 'required'];
    const contentLower = content.toLowerCase();

    for (const keyword of importantKeywords) {
      if (contentLower.includes(keyword)) {
        importance = Math.min(importance + 0.05, 1.0);
      }
    }

    return importance;
  }

  private extractPatterns(content: string): string[] {
    const patterns: string[] = [];

    const listItemRegex = /^[-*]\s+(.+)$/gm;
    let match;

    while ((match = listItemRegex.exec(content)) !== null) {
      const item = match[1].trim();
      if (item.length > 10 && item.length < 200) {
        if (
          item.toLowerCase().includes('should') ||
          item.toLowerCase().includes('must') ||
          item.toLowerCase().includes('always') ||
          item.toLowerCase().includes('never')
        ) {
          patterns.push(item);
        }
      }
    }

    return patterns.slice(0, 20);
  }

  private calculateComplexity(sections: SkillSection[], patterns: string[]): number {
    let complexity = 0;

    complexity += sections.length * 0.1;

    complexity += patterns.length * 0.05;

    const ruleCount = sections.filter((s) => s.type === 'rule').length;
    complexity += ruleCount * 0.15;

    return Math.min(complexity, 1.0);
  }

  private normalizeTitle(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  }

  private generateSkillContent(skill: { name: string; description?: string; tags?: string[] }): string {
    let content = `# ${skill.name}\n\n`;

    if (skill.description) {
      content += `${skill.description}\n\n`;
    }

    if (skill.tags && skill.tags.length > 0) {
      content += `**Tags:** ${skill.tags.join(', ')}\n`;
    }

    return content;
  }

  private estimateTrustScore(skill: { name: string; source?: string; tags?: string[] }): number {
    let score = 5;

    if (skill.source) {
      if (skill.source.includes('official') || skill.source.includes('anthropic')) {
        score += 3;
      } else if (skill.source.includes('github.com')) {
        score += 2;
      } else {
        score += 1;
      }
    }

    if (skill.tags && skill.tags.length > 2) {
      score += 1;
    }

    return Math.min(score, 10);
  }
}
