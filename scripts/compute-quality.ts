#!/usr/bin/env ts-node
/**
 * Compute quality scores for marketplace skills
 *
 * This script assigns default quality scores to skills based on source verification.
 * For detailed quality evaluation, skills would need to be fetched and analyzed individually.
 *
 * Usage:
 *   npx ts-node scripts/compute-quality.ts
 *   pnpm tsx scripts/compute-quality.ts
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

interface Skill {
  id: string;
  name: string;
  source: string;
  description?: string;
  tags: string[];
  author?: string;
  version?: string;
  agents?: string[];
  quality?: number;
}

interface SkillsIndex {
  version: number;
  updatedAt: string;
  skills: Skill[];
}

const VERIFIED_SOURCES = [
  'anthropics/',
  'vercel/',
  'vercel-labs/',
  'modelcontextprotocol/',
  'cursor/',
  'google/',
  'microsoft/',
  'openai/',
];

const TRUSTED_AUTHORS = [
  'anthropic',
  'vercel',
  'google',
  'microsoft',
  'openai',
];

function computeDefaultQuality(skill: Skill): number {
  let score = 70;

  for (const verified of VERIFIED_SOURCES) {
    if (skill.source.startsWith(verified)) {
      score = 85;
      break;
    }
  }

  if (skill.author) {
    for (const trusted of TRUSTED_AUTHORS) {
      if (skill.author.toLowerCase().includes(trusted)) {
        score = Math.max(score, 85);
        break;
      }
    }
  }

  if (skill.description && skill.description.length > 50) {
    score += 3;
  }

  if (skill.tags && skill.tags.length >= 3) {
    score += 2;
  }

  if (skill.version) {
    score += 2;
  }

  if (skill.agents && skill.agents.length >= 2) {
    score += 3;
  }

  return Math.min(100, score);
}

function main() {
  const skillsPath = join(__dirname, '../marketplace/skills.json');

  console.log('Reading skills.json...');
  const data = JSON.parse(readFileSync(skillsPath, 'utf-8')) as SkillsIndex;

  console.log(`Processing ${data.skills.length} skills...`);

  let updated = 0;
  let verified = 0;

  for (const skill of data.skills) {
    const quality = computeDefaultQuality(skill);
    if (skill.quality !== quality) {
      skill.quality = quality;
      updated++;
    }
    if (quality >= 85) {
      verified++;
    }
  }

  data.updatedAt = new Date().toISOString().split('T')[0];

  console.log(`Updated ${updated} skills with quality scores`);
  console.log(`Verified sources: ${verified} skills (quality >= 85)`);
  console.log(`Average quality: ${Math.round(data.skills.reduce((sum, s) => sum + (s.quality || 70), 0) / data.skills.length)}`);

  writeFileSync(skillsPath, JSON.stringify(data, null, 2));
  console.log('Saved skills.json');
}

main();
