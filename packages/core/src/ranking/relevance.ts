export interface RankableSkill {
  name: string;
  description?: string;
  content?: string;
  stars?: number;
  installs?: number;
  references?: string[];
}

export interface RankedSkill<T extends RankableSkill = RankableSkill> {
  skill: T;
  score: number;
  breakdown: ScoreBreakdown;
}

export interface ScoreBreakdown {
  contentAvailability: number;
  queryMatch: number;
  popularity: number;
  referenceScore: number;
}

const WEIGHTS = {
  contentAvailability: 40,
  queryMatch: 30,
  popularity: 15,
  references: 15,
} as const;

export class RelevanceRanker {
  rank<T extends RankableSkill>(skills: T[], query?: string): RankedSkill<T>[] {
    const results = skills.map((skill) => {
      const breakdown = this.score(skill, query);
      const score =
        breakdown.contentAvailability +
        breakdown.queryMatch +
        breakdown.popularity +
        breakdown.referenceScore;
      return { skill, score, breakdown };
    });

    results.sort((a, b) => b.score - a.score);
    return results;
  }

  private score(skill: RankableSkill, query?: string): ScoreBreakdown {
    return {
      contentAvailability: this.scoreContent(skill),
      queryMatch: query ? this.scoreQuery(skill, query) : 0,
      popularity: this.scorePopularity(skill),
      referenceScore: this.scoreReferences(skill),
    };
  }

  private scoreContent(skill: RankableSkill): number {
    let score = 0;
    if (skill.description && skill.description.length > 0) score += 20;
    if (skill.content && skill.content.length > 0) score += 20;
    return score;
  }

  private scoreQuery(skill: RankableSkill, query: string): number {
    const q = query.toLowerCase();
    const name = skill.name.toLowerCase();

    if (name === q) return WEIGHTS.queryMatch;

    if (name.includes(q) || q.includes(name)) {
      return WEIGHTS.queryMatch * 0.7;
    }

    const desc = (skill.description || '').toLowerCase();
    const content = (skill.content || '').toLowerCase();
    const searchable = `${name} ${desc} ${content}`;
    const words = q.split(/\s+/);
    const matched = words.filter((w) => searchable.includes(w)).length;

    if (words.length === 0) return 0;
    return Math.round(WEIGHTS.queryMatch * (matched / words.length) * 0.6);
  }

  private scorePopularity(skill: RankableSkill): number {
    const count = (skill.stars ?? 0) + (skill.installs ?? 0);
    if (count <= 0) return 0;
    return Math.min(WEIGHTS.popularity, Math.round(Math.log10(count + 1) * 5));
  }

  private scoreReferences(skill: RankableSkill): number {
    if (!skill.references || skill.references.length === 0) return 0;
    return Math.min(WEIGHTS.references, skill.references.length * 5);
  }
}
