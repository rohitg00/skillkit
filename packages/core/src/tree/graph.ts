import type { SkillSummary } from '../recommend/types.js';
import type { TreeNode, SkillTree } from './types.js';

export type RelationType = 'similar' | 'complementary' | 'dependency' | 'alternative';

export interface SkillRelation {
  skillName: string;
  relationType: RelationType;
  strength: number;
  reason: string;
}

export interface SkillNode {
  name: string;
  tags: string[];
  source?: string;
  relations: SkillRelation[];
}

export interface SkillGraph {
  version: number;
  generatedAt: string;
  nodes: Map<string, SkillNode>;
  totalSkills: number;
  totalRelations: number;
}

export interface RelatedSkillResult {
  skill: SkillSummary;
  relationType: RelationType;
  strength: number;
  reason: string;
  path?: string[];
}

const TAG_SIMILARITY_THRESHOLD = 0.3;
const MAX_RELATIONS_PER_SKILL = 10;

export function buildSkillGraph(skills: SkillSummary[]): SkillGraph {
  const nodes = new Map<string, SkillNode>();
  let totalRelations = 0;

  for (const skill of skills) {
    const node: SkillNode = {
      name: skill.name,
      tags: skill.tags || [],
      source: skill.source,
      relations: [],
    };
    nodes.set(skill.name, node);
  }

  for (const skill of skills) {
    const node = nodes.get(skill.name);
    if (!node) continue;

    const relatedSkills = findRelatedSkills(skill, skills);
    node.relations = relatedSkills.slice(0, MAX_RELATIONS_PER_SKILL);
    totalRelations += node.relations.length;
  }

  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    nodes,
    totalSkills: skills.length,
    totalRelations,
  };
}

function findRelatedSkills(
  skill: SkillSummary,
  allSkills: SkillSummary[]
): SkillRelation[] {
  const relations: SkillRelation[] = [];
  const skillTags = new Set<string>(skill.tags || []);
  const skillName = skill.name.toLowerCase();

  for (const other of allSkills) {
    if (other.name === skill.name) continue;

    const otherTags = new Set<string>(other.tags || []);
    const otherName = other.name.toLowerCase();

    const commonTags: string[] = [...skillTags].filter((tag) => otherTags.has(tag));
    const totalTags = new Set([...skillTags, ...otherTags]).size;
    const tagSimilarity = totalTags > 0 ? commonTags.length / totalTags : 0;

    if (tagSimilarity >= TAG_SIMILARITY_THRESHOLD) {
      const relationType = determineRelationType(skill, other, commonTags);
      const reason = generateRelationReason(relationType, commonTags);

      relations.push({
        skillName: other.name,
        relationType,
        strength: Math.round(tagSimilarity * 100),
        reason,
      });
    }

    if (skillName.includes(otherName) || otherName.includes(skillName)) {
      const existing = relations.find((r) => r.skillName === other.name);
      if (!existing) {
        relations.push({
          skillName: other.name,
          relationType: 'similar',
          strength: 50,
          reason: 'Related by name',
        });
      }
    }

    if (skill.source && other.source && skill.source === other.source) {
      const existing = relations.find((r) => r.skillName === other.name);
      if (existing) {
        existing.strength = Math.min(100, existing.strength + 20);
      } else if (commonTags.length > 0) {
        relations.push({
          skillName: other.name,
          relationType: 'similar',
          strength: 30,
          reason: `Same source: ${skill.source}`,
        });
      }
    }
  }

  return relations.sort((a, b) => b.strength - a.strength);
}

function determineRelationType(
  skill: SkillSummary,
  other: SkillSummary,
  _commonTags: string[]
): RelationType {
  const complementaryPairs = [
    ['frontend', 'backend'],
    ['testing', 'development'],
    ['security', 'api'],
    ['database', 'api'],
    ['docker', 'kubernetes'],
  ];

  const skillTags = skill.tags || [];
  const otherTags = other.tags || [];

  for (const [tag1, tag2] of complementaryPairs) {
    if (
      (skillTags.includes(tag1) && otherTags.includes(tag2)) ||
      (skillTags.includes(tag2) && otherTags.includes(tag1))
    ) {
      return 'complementary';
    }
  }

  const alternativeIndicators = ['vs', 'alternative', 'instead'];
  const skillName = skill.name.toLowerCase();
  const otherName = other.name.toLowerCase();

  for (const indicator of alternativeIndicators) {
    if (skillName.includes(indicator) || otherName.includes(indicator)) {
      return 'alternative';
    }
  }

  return 'similar';
}

function generateRelationReason(relationType: RelationType, commonTags: string[]): string {
  switch (relationType) {
    case 'similar':
      return commonTags.length > 0
        ? `Shares tags: ${commonTags.slice(0, 3).join(', ')}`
        : 'Similar functionality';
    case 'complementary':
      return 'Works well together';
    case 'dependency':
      return 'Required by this skill';
    case 'alternative':
      return 'Alternative approach';
    default:
      return 'Related skill';
  }
}

export function getRelatedSkills(
  skillName: string,
  graph: SkillGraph,
  skills: SkillSummary[],
  options: {
    limit?: number;
    types?: RelationType[];
    minStrength?: number;
  } = {}
): RelatedSkillResult[] {
  const { limit = 5, types, minStrength = 0 } = options;
  const node = graph.nodes.get(skillName);
  if (!node) return [];

  const skillMap = new Map(skills.map((s) => [s.name, s]));

  return node.relations
    .filter((r) => {
      if (types && !types.includes(r.relationType)) return false;
      if (r.strength < minStrength) return false;
      return true;
    })
    .slice(0, limit)
    .map((r) => ({
      skill: skillMap.get(r.skillName)!,
      relationType: r.relationType,
      strength: r.strength,
      reason: r.reason,
    }))
    .filter((r) => r.skill);
}

export function findSkillsByRelationType(
  graph: SkillGraph,
  skills: SkillSummary[],
  relationType: RelationType,
  limit: number = 10
): Array<{ skill: SkillSummary; relatedCount: number }> {
  const skillMap = new Map(skills.map((s) => [s.name, s]));
  const counts: Map<string, number> = new Map();

  for (const [_skillName, node] of graph.nodes) {
    const typeRelations = node.relations.filter((r) => r.relationType === relationType);
    counts.set(node.name, typeRelations.length);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, count]) => ({
      skill: skillMap.get(name)!,
      relatedCount: count,
    }))
    .filter((r) => r.skill);
}

export function getSkillPath(
  fromSkillName: string,
  toSkillName: string,
  graph: SkillGraph,
  maxHops: number = 3
): string[] | null {
  if (fromSkillName === toSkillName) return [fromSkillName];

  const visited = new Set<string>();
  const queue: Array<{ name: string; path: string[] }> = [
    { name: fromSkillName, path: [fromSkillName] },
  ];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.path.length > maxHops + 1) continue;

    const node = graph.nodes.get(current.name);
    if (!node) continue;

    for (const relation of node.relations) {
      if (relation.skillName === toSkillName) {
        return [...current.path, toSkillName];
      }

      if (!visited.has(relation.skillName)) {
        visited.add(relation.skillName);
        queue.push({
          name: relation.skillName,
          path: [...current.path, relation.skillName],
        });
      }
    }
  }

  return null;
}

export function findSkillsInCategory(tree: SkillTree, categoryPath: string[]): string[] {
  let current: TreeNode = tree.rootNode;

  for (const segment of categoryPath) {
    const child = current.children.find(
      (c) => c.name.toLowerCase() === segment.toLowerCase()
    );
    if (!child) return [];
    current = child;
  }

  return collectSkillsRecursive(current);
}

function collectSkillsRecursive(node: TreeNode): string[] {
  const skills: string[] = [...node.skills];
  for (const child of node.children) {
    skills.push(...collectSkillsRecursive(child));
  }
  return skills;
}

export function serializeGraph(graph: SkillGraph): string {
  const serialized = {
    version: graph.version,
    generatedAt: graph.generatedAt,
    totalSkills: graph.totalSkills,
    totalRelations: graph.totalRelations,
    nodes: Object.fromEntries(graph.nodes),
  };
  return JSON.stringify(serialized, null, 2);
}

export function deserializeGraph(json: string): SkillGraph {
  const parsed = JSON.parse(json);
  return {
    version: parsed.version,
    generatedAt: parsed.generatedAt,
    totalSkills: parsed.totalSkills,
    totalRelations: parsed.totalRelations,
    nodes: new Map(Object.entries(parsed.nodes)),
  };
}
