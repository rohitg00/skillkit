import type { ContextChunk } from '../providers/types.js';
import type { ContextSource, ContextFetchOptions } from './index.js';
import { loadIndex } from '../../recommend/fetcher.js';
import type { SkillSummary } from '../../recommend/types.js';

export class SkillsSource implements ContextSource {
  readonly name = 'skills' as const;
  readonly displayName = 'Marketplace Skills';

  async fetch(query: string, options: ContextFetchOptions = {}): Promise<ContextChunk[]> {
    const { maxChunks = 5, minRelevance = 0.3 } = options;

    const index = loadIndex();
    if (!index || index.skills.length === 0) {
      return [];
    }

    const keywords = this.extractKeywords(query);
    const scoredSkills = this.scoreSkills(index.skills, keywords);

    const chunks: ContextChunk[] = [];

    for (const { skill, score } of scoredSkills.slice(0, maxChunks)) {
      if (score < minRelevance) continue;

      chunks.push({
        source: 'skills',
        content: this.formatSkill(skill),
        relevance: score,
        metadata: {
          skillName: skill.name,
          source: skill.source,
          tags: skill.tags,
        },
      });
    }

    return chunks;
  }

  async isAvailable(): Promise<boolean> {
    const index = loadIndex();
    return index !== null && index.skills.length > 0;
  }

  async searchSkills(query: string, limit = 10): Promise<Array<{ skill: SkillSummary; score: number }>> {
    const index = loadIndex();
    if (!index) return [];

    const keywords = this.extractKeywords(query);
    return this.scoreSkills(index.skills, keywords).slice(0, limit);
  }

  private scoreSkills(skills: SkillSummary[], keywords: string[]): Array<{ skill: SkillSummary; score: number }> {
    const scored = skills.map((skill) => ({
      skill,
      score: this.calculateScore(skill, keywords),
    }));

    return scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score);
  }

  private calculateScore(skill: SkillSummary, keywords: string[]): number {
    let score = 0;
    const nameWords = skill.name.toLowerCase().split(/[-_\s]+/);
    const descWords = (skill.description || '').toLowerCase().split(/\s+/);
    const tagWords = (skill.tags || []).map((t) => t.toLowerCase());

    for (const keyword of keywords) {
      const keywordLower = keyword.toLowerCase();

      if (skill.name.toLowerCase() === keywordLower) {
        score += 1.0;
      }

      for (const nameWord of nameWords) {
        if (nameWord === keywordLower) {
          score += 0.5;
        } else if (nameWord.includes(keywordLower) || keywordLower.includes(nameWord)) {
          score += 0.2;
        }
      }

      for (const descWord of descWords) {
        if (descWord === keywordLower) {
          score += 0.1;
        }
      }

      for (const tag of tagWords) {
        if (tag === keywordLower) {
          score += 0.3;
        }
      }
    }

    return Math.min(score / keywords.length, 1);
  }

  private extractKeywords(query: string): string[] {
    const stopWords = new Set([
      'a', 'an', 'the', 'for', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'with',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
      'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
      'must', 'shall', 'can', 'need', 'dare', 'ought', 'used', 'how', 'what',
      'when', 'where', 'why', 'who', 'which', 'that', 'this', 'these', 'those',
      'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your',
      'skill', 'skills', 'help', 'want', 'create', 'make', 'build', 'write',
    ]);

    return query
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 1 && !stopWords.has(word));
  }

  private formatSkill(skill: SkillSummary): string {
    let content = `## Skill: ${skill.name}\n\n`;

    if (skill.description) {
      content += `${skill.description}\n\n`;
    }

    if (skill.tags && skill.tags.length > 0) {
      content += `Tags: ${skill.tags.join(', ')}\n`;
    }

    if (skill.source) {
      content += `Source: ${skill.source}\n`;
    }

    content += `\nThis existing skill can be composed with or referenced for patterns.`;

    return content;
  }
}
