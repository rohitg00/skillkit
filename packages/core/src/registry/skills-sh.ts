import type { ExternalRegistry, ExternalSkill } from "./index.js";

const SKILLS_SH_BASE = "https://skills.sh";
const SKILLS_SH_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

export interface SkillsShStats {
  rank: number;
  installs: number;
  name: string;
  source: string;
  skillName: string;
}

interface CachedLeaderboard {
  skills: ExternalSkill[];
  fetchedAt: number;
}

export class SkillsShRegistry implements ExternalRegistry {
  name = "skills.sh";
  private cache: CachedLeaderboard | null = null;

  async search(
    query: string,
    options?: { limit?: number; timeoutMs?: number },
  ): Promise<ExternalSkill[]> {
    const limit = options?.limit ?? 20;
    const skills = await this.fetchLeaderboard(options?.timeoutMs);
    const q = query.toLowerCase();

    return skills
      .filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.source.toLowerCase().includes(q),
      )
      .slice(0, limit);
  }

  async getLeaderboard(
    limit = 50,
    timeoutMs?: number,
  ): Promise<ExternalSkill[]> {
    const skills = await this.fetchLeaderboard(timeoutMs);
    return skills.slice(0, limit);
  }

  async getSkillStats(
    owner: string,
    repo: string,
    skillName: string,
  ): Promise<SkillsShStats | null> {
    const skills = await this.fetchLeaderboard();
    const source = `${owner}/${repo}`;

    for (let i = 0; i < skills.length; i++) {
      const skill = skills[i];
      if (skill.name === skillName && skill.source.endsWith(`/${source}`)) {
        return {
          rank: i + 1,
          installs: skill.stars ?? 0,
          name: skill.name,
          source: skill.source,
          skillName,
        };
      }
    }

    return null;
  }

  private async fetchLeaderboard(timeoutMs = 15_000): Promise<ExternalSkill[]> {
    if (this.cache && Date.now() - this.cache.fetchedAt < SKILLS_SH_CACHE_TTL) {
      return this.cache.skills;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(SKILLS_SH_BASE, {
        headers: {
          Accept: "text/html",
          "User-Agent": "skillkit-cli",
        },
        signal: controller.signal,
      });

      if (!response.ok) return this.cache?.skills ?? [];

      const html = await response.text();
      const skills = this.parseLeaderboard(html);

      this.cache = { skills, fetchedAt: Date.now() };
      return skills;
    } catch {
      return this.cache?.skills ?? [];
    } finally {
      clearTimeout(timer);
    }
  }

  private parseLeaderboard(html: string): ExternalSkill[] {
    const skills: ExternalSkill[] = [];

    const lines = html.split("\n");
    for (const line of lines) {
      // Match patterns like: [1vercel-labs/skills290.0K] from the page links
      const hrefMatch = line.match(
        /href="\/([^/]+)\/([^/]+)\/([^"]+)".*?(\d[\d,.]*[KMB]?)\s*<\/a>/,
      );
      if (hrefMatch) {
        const [, owner, repo, skillName, installStr] = hrefMatch;
        const installs = this.parseInstallCount(installStr);

        skills.push({
          name: skillName,
          description: `${owner}/${repo}`,
          source: `https://github.com/${owner}/${repo}`,
          registry: this.name,
          path: skillName,
          stars: installs,
        });
      }
    }

    // Fallback: try simpler pattern matching if structured parsing found nothing
    if (skills.length === 0) {
      const simplePattern = /skills\.sh\/([^/]+)\/([^/]+)\/([^/"]+)/g;
      let match;
      while ((match = simplePattern.exec(html)) !== null) {
        const [, owner, repo, skillName] = match;
        skills.push({
          name: skillName,
          description: `${owner}/${repo}`,
          source: `https://github.com/${owner}/${repo}`,
          registry: this.name,
          path: skillName,
        });
      }
    }

    return skills;
  }

  private parseInstallCount(str: string): number {
    if (!str) return 0;
    const cleaned = str.replace(/,/g, "");
    const multiplier = cleaned.endsWith("K")
      ? 1_000
      : cleaned.endsWith("M")
        ? 1_000_000
        : cleaned.endsWith("B")
          ? 1_000_000_000
          : 1;
    const num = parseFloat(cleaned.replace(/[KMB]$/, ""));
    return Math.round(num * multiplier);
  }
}

function parseSkillsShParts(
  source: string,
): { owner: string; repo: string; rest?: string } | null {
  const cleaned = source
    .replace(/^https?:\/\//, "")
    .replace(/^skills\.sh\//, "");

  const parts = cleaned.split("/").filter(Boolean);
  if (parts.length < 2) return null;

  return {
    owner: parts[0],
    repo: parts[1],
    rest: parts.length > 2 ? parts.slice(2).join("/") : undefined,
  };
}

export function resolveSkillsShUrl(
  source: string,
): { owner: string; repo: string; skillName?: string } | null {
  const parsed = parseSkillsShParts(source);
  if (!parsed) return null;

  return {
    owner: parsed.owner,
    repo: parsed.repo,
    skillName: parsed.rest,
  };
}
