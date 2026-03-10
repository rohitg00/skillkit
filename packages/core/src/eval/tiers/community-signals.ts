import { statSync } from 'node:fs';
import { join } from 'node:path';
import type {
  TierEvaluator,
  EvalOptions,
  CommunityTierResult,
  CommunitySignal,
} from '../types.js';
import { scoreToGrade } from '../types.js';

const FRESHNESS_THRESHOLDS = [
  { days: 30, score: 100 },
  { days: 90, score: 80 },
  { days: 180, score: 60 },
  { days: 365, score: 40 },
] as const;

const FRESHNESS_FLOOR = 20;

const CONTENT_SIZE_OPTIMAL_MIN = 500;
const CONTENT_SIZE_OPTIMAL_MAX = 5000;

const SIGNAL_WEIGHTS: Record<string, number> = {
  freshness: 0.25,
  contentSize: 0.20,
  linkHealth: 0.20,
  metadataCompleteness: 0.35,
};

function extractFrontmatter(content: string): Record<string, string> | null {
  const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const match = normalized.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) return null;

  const fm: Record<string, string> = {};
  const lines = match[1].split('\n');
  for (const line of lines) {
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim();
      const value = line.slice(colonIdx + 1).trim();
      fm[key] = value;
    }
  }
  return Object.keys(fm).length > 0 ? fm : null;
}

function scoreFreshness(skillPath: string): { score: number; daysSinceUpdate: number } {
  const candidates = ['SKILL.md', 'index.mdc'];
  for (const file of candidates) {
    try {
      const filePath = join(skillPath, file);
      const stat = statSync(filePath);
      const mtime = stat.mtime.getTime();
      const daysSince = Math.floor((Date.now() - mtime) / (1000 * 60 * 60 * 24));

      for (const threshold of FRESHNESS_THRESHOLDS) {
        if (daysSince < threshold.days) {
          return { score: threshold.score, daysSinceUpdate: daysSince };
        }
      }
      return { score: FRESHNESS_FLOOR, daysSinceUpdate: daysSince };
    } catch {
      continue;
    }
  }

  try {
    const stat = statSync(skillPath);
    if (stat.isFile()) {
      const mtime = stat.mtime.getTime();
      const daysSince = Math.floor((Date.now() - mtime) / (1000 * 60 * 60 * 24));
      for (const threshold of FRESHNESS_THRESHOLDS) {
        if (daysSince < threshold.days) {
          return { score: threshold.score, daysSinceUpdate: daysSince };
        }
      }
      return { score: FRESHNESS_FLOOR, daysSinceUpdate: daysSince };
    }
  } catch {
    // path not accessible
  }

  return { score: 50, daysSinceUpdate: -1 };
}

function scoreContentSize(content: string): number {
  const len = content.length;
  if (len >= CONTENT_SIZE_OPTIMAL_MIN && len <= CONTENT_SIZE_OPTIMAL_MAX) {
    return 100;
  }
  if (len < CONTENT_SIZE_OPTIMAL_MIN) {
    if (len < 100) return 20;
    if (len < 200) return 40;
    return Math.min(99, 60 + Math.round((len / CONTENT_SIZE_OPTIMAL_MIN) * 40));
  }
  if (len <= 8000) return 80;
  if (len <= 12000) return 60;
  return 40;
}

function scoreLinkHealth(content: string): { score: number; urlCount: number } {
  const urlPattern = /https?:\/\/[^\s)>\]"'`]+/g;
  const urls = content.match(urlPattern) || [];
  const urlCount = urls.length;

  if (urlCount === 0) return { score: 30, urlCount: 0 };
  if (urlCount <= 2) return { score: 60, urlCount };
  if (urlCount <= 5) return { score: 85, urlCount };
  if (urlCount <= 10) return { score: 100, urlCount };
  return { score: 90, urlCount };
}

function scoreMetadataCompleteness(
  content: string,
): { score: number; fields: Record<string, boolean> } {
  const fm = extractFrontmatter(content);
  const fields: Record<string, boolean> = {
    name: false,
    description: false,
    version: false,
    tags: false,
    globs: false,
  };

  if (fm) {
    fields.name = !!fm.name;
    fields.description = !!fm.description;
    fields.version = !!fm.version;
    fields.tags = !!fm.tags && fm.tags !== '[]';
    fields.globs = !!fm.globs && fm.globs !== '[]';
  }

  const present = Object.values(fields).filter(Boolean).length;
  const total = Object.keys(fields).length;
  const score = Math.round((present / total) * 100);

  return { score, fields };
}

function generateWarnings(
  content: string,
  freshness: { daysSinceUpdate: number },
  metadata: { fields: Record<string, boolean> },
): string[] {
  const warnings: string[] = [];

  if (!metadata.fields.version) {
    warnings.push('No version specified in frontmatter');
  }
  if (!metadata.fields.tags) {
    warnings.push('No tags specified');
  }
  if (freshness.daysSinceUpdate > 180) {
    warnings.push("Skill hasn't been updated in over 6 months");
  }
  if (content.length < 200) {
    warnings.push('Very short skill content (under 200 characters)');
  }

  return warnings;
}

export class CommunitySignalsEvaluator implements TierEvaluator {
  readonly tier = 6 as const;
  readonly name = 'Community Signals';

  async evaluate(
    content: string,
    skillPath: string,
    _options: EvalOptions,
  ): Promise<CommunityTierResult> {
    const start = performance.now();

    const freshness = scoreFreshness(skillPath);
    const contentSizeScore = scoreContentSize(content);
    const linkHealth = scoreLinkHealth(content);
    const metadata = scoreMetadataCompleteness(content);

    const signals: CommunitySignal[] = [
      {
        source: 'filesystem',
        metric: 'freshness',
        value: freshness.daysSinceUpdate >= 0
          ? `${freshness.daysSinceUpdate} days ago`
          : 'unknown',
        normalizedScore: freshness.score,
      },
      {
        source: 'content',
        metric: 'content-size',
        value: content.length,
        normalizedScore: contentSizeScore,
      },
      {
        source: 'content',
        metric: 'link-health',
        value: linkHealth.urlCount,
        normalizedScore: linkHealth.score,
      },
      {
        source: 'frontmatter',
        metric: 'metadata-completeness',
        value: `${Object.values(metadata.fields).filter(Boolean).length}/${Object.keys(metadata.fields).length} fields`,
        normalizedScore: metadata.score,
      },
    ];

    const score = Math.round(
      freshness.score * SIGNAL_WEIGHTS.freshness +
      contentSizeScore * SIGNAL_WEIGHTS.contentSize +
      linkHealth.score * SIGNAL_WEIGHTS.linkHealth +
      metadata.score * SIGNAL_WEIGHTS.metadataCompleteness,
    );

    const warnings = generateWarnings(content, freshness, metadata);
    const duration = Math.round(performance.now() - start);

    return {
      tier: 6,
      name: this.name,
      score,
      grade: scoreToGrade(score),
      duration,
      details: {
        signals,
        warnings,
      },
    };
  }
}
