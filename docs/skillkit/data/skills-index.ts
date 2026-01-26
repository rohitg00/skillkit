import skillsData from './skills.json';

export interface IndexedSkill {
  id: string;
  name: string;
  description: string;
  source: string;
  sourceUrl: string;
  rawUrl: string;
  tags: string[];
}

function buildSkillIndex(): IndexedSkill[] {
  return skillsData.skills.map(skill => {
    const sourceParts = skill.source?.split('/') || [];
    const owner = sourceParts[0] || 'unknown';
    const repo = sourceParts[1] || 'unknown';
    const skillSlug = skill.id.split('/').pop() || skill.name.toLowerCase().replace(/\s+/g, '-');

    return {
      id: skill.id,
      name: skill.name,
      description: skill.description || '',
      source: skill.source || '',
      sourceUrl: owner !== 'unknown' ? `https://github.com/${skill.source}` : '',
      rawUrl: owner !== 'unknown' && repo !== 'unknown'
        ? `https://raw.githubusercontent.com/${owner}/${repo}/main/skills/${skillSlug}/SKILL.md`
        : '',
      tags: skill.tags || [],
    };
  });
}

export const SKILLS_INDEX: IndexedSkill[] = buildSkillIndex();

export function searchSkills(query: string): IndexedSkill[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  return SKILLS_INDEX.filter(skill =>
    skill.name.toLowerCase().includes(q) ||
    skill.description.toLowerCase().includes(q) ||
    skill.tags.some(tag => tag.toLowerCase().includes(q))
  ).slice(0, 20);
}

export function getSkillsByTag(tag: string): IndexedSkill[] {
  return SKILLS_INDEX.filter(skill =>
    skill.tags.some(t => t.toLowerCase() === tag.toLowerCase())
  );
}

export function getAllTags(): string[] {
  const tags = new Set<string>();
  SKILLS_INDEX.forEach(skill => skill.tags.forEach(tag => tags.add(tag)));
  return Array.from(tags).sort();
}
