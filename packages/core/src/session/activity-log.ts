import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse, stringify } from 'yaml';
import type { SkillActivity, ActivityLogData } from './types.js';

const ACTIVITY_FILE = 'activity.yaml';

export class ActivityLog {
  private readonly filePath: string;
  private readonly projectPath: string;
  private data: ActivityLogData | null = null;

  constructor(projectPath: string) {
    this.projectPath = projectPath;
    this.filePath = join(projectPath, '.skillkit', ACTIVITY_FILE);
  }

  private createEmpty(): ActivityLogData {
    return { version: 1, activities: [] };
  }

  private load(): ActivityLogData {
    if (this.data) return this.data;

    if (!existsSync(this.filePath)) {
      this.data = this.createEmpty();
      return this.data;
    }

    try {
      const content = readFileSync(this.filePath, 'utf-8');
      const parsed = parse(content);
      if (parsed && Array.isArray(parsed.activities)) {
        this.data = parsed as ActivityLogData;
      } else {
        this.data = this.createEmpty();
      }
    } catch {
      this.data = this.createEmpty();
    }

    return this.data;
  }

  private save(): void {
    const dir = join(this.projectPath, '.skillkit');
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(this.filePath, stringify(this.data));
  }

  record(entry: {
    commitSha: string;
    message: string;
    activeSkills: string[];
    filesChanged: string[];
  }): void {
    const data = this.load();
    data.activities.unshift({
      commitSha: entry.commitSha,
      committedAt: new Date().toISOString(),
      activeSkills: entry.activeSkills,
      filesChanged: entry.filesChanged,
      message: entry.message,
    });

    if (data.activities.length > 500) {
      data.activities = data.activities.slice(0, 500);
    }

    this.save();
  }

  getByCommit(sha: string): SkillActivity | undefined {
    if (sha.length < 4) return undefined;
    const data = this.load();
    return data.activities.find(
      (a) => a.commitSha === sha || a.commitSha.startsWith(sha)
    );
  }

  getBySkill(skillName: string): SkillActivity[] {
    const data = this.load();
    return data.activities.filter((a) => a.activeSkills.includes(skillName));
  }

  getRecent(limit = 20): SkillActivity[] {
    const data = this.load();
    return data.activities.slice(0, limit);
  }

  getMostUsedSkills(): Array<{ skill: string; count: number }> {
    const data = this.load();
    const counts = new Map<string, number>();

    for (const activity of data.activities) {
      for (const skill of activity.activeSkills) {
        counts.set(skill, (counts.get(skill) ?? 0) + 1);
      }
    }

    return Array.from(counts.entries())
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count);
  }
}
