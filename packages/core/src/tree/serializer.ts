import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import type { SkillTree, TreeNode } from './types.js';
import { SkillTreeSchema } from './types.js';

export const TREE_FILE_NAME = 'skill-tree.json';

export function serializeTree(tree: SkillTree): string {
  return JSON.stringify(tree, null, 2);
}

export function deserializeTree(json: string): SkillTree {
  const parsed = JSON.parse(json);
  return SkillTreeSchema.parse(parsed);
}

export function saveTree(tree: SkillTree, path: string): void {
  const dir = dirname(path);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  const json = serializeTree(tree);
  writeFileSync(path, json, 'utf-8');
}

export function loadTree(path: string): SkillTree | null {
  if (!existsSync(path)) {
    return null;
  }

  try {
    const json = readFileSync(path, 'utf-8');
    return deserializeTree(json);
  } catch {
    return null;
  }
}

export function treeToText(tree: SkillTree, options?: { maxDepth?: number }): string {
  const maxDepth = options?.maxDepth ?? Infinity;
  const lines: string[] = [];

  lines.push(`Skill Tree (${tree.totalSkills} skills, ${tree.totalCategories} categories)`);
  lines.push(`Generated: ${tree.generatedAt}`);
  lines.push('');

  const renderNode = (node: TreeNode, prefix: string, isLast: boolean, depth: number) => {
    if (depth > maxDepth) return;

    const connector = isLast ? '└── ' : '├── ';
    const skillInfo =
      node.skillCount > 0 ? ` (${node.skillCount} skills)` : '';

    lines.push(`${prefix}${connector}${node.name}${skillInfo}`);

    const newPrefix = prefix + (isLast ? '    ' : '│   ');

    if (node.children.length > 0 && depth < maxDepth) {
      node.children.forEach((child, index) => {
        const childIsLast = index === node.children.length - 1;
        renderNode(child, newPrefix, childIsLast, depth + 1);
      });
    }
  };

  const root = tree.rootNode;
  lines.push(root.name);

  root.children.forEach((child, index) => {
    const isLast = index === root.children.length - 1;
    renderNode(child, '', isLast, 1);
  });

  return lines.join('\n');
}

export function treeToMarkdown(tree: SkillTree): string {
  const lines: string[] = [];

  lines.push(`# Skill Tree`);
  lines.push('');
  lines.push(`> ${tree.totalSkills} skills organized in ${tree.totalCategories} categories`);
  lines.push('');
  lines.push(`*Generated: ${tree.generatedAt}*`);
  lines.push('');

  const renderNode = (node: TreeNode, depth: number) => {
    const indent = '  '.repeat(depth);
    const bullet = depth === 0 ? '##' : '-';

    if (depth === 0) {
      lines.push(`${bullet} ${node.name}`);
    } else {
      const skillCount = node.skillCount > 0 ? ` *(${node.skillCount})*` : '';
      lines.push(`${indent}${bullet} **${node.name}**${skillCount}`);
    }

    if (node.skills.length > 0 && node.skills.length <= 10) {
      for (const skill of node.skills) {
        lines.push(`${indent}  - \`${skill}\``);
      }
    } else if (node.skills.length > 10) {
      for (const skill of node.skills.slice(0, 5)) {
        lines.push(`${indent}  - \`${skill}\``);
      }
      lines.push(`${indent}  - *... and ${node.skills.length - 5} more*`);
    }

    for (const child of node.children) {
      renderNode(child, depth + 1);
    }
  };

  for (const category of tree.rootNode.children) {
    renderNode(category, 0);
    lines.push('');
  }

  return lines.join('\n');
}

export function compareTreeVersions(
  oldTree: SkillTree,
  newTree: SkillTree
): {
  added: string[];
  removed: string[];
  moved: { skill: string; from: string[]; to: string[] }[];
} {
  const oldSkills = getAllSkillsWithPaths(oldTree.rootNode);
  const newSkills = getAllSkillsWithPaths(newTree.rootNode);

  const oldNames = new Set(oldSkills.map((s) => s.name));
  const newNames = new Set(newSkills.map((s) => s.name));

  const added: string[] = [];
  const removed: string[] = [];
  const moved: { skill: string; from: string[]; to: string[] }[] = [];

  for (const skill of newSkills) {
    if (!oldNames.has(skill.name)) {
      added.push(skill.name);
    }
  }

  for (const skill of oldSkills) {
    if (!newNames.has(skill.name)) {
      removed.push(skill.name);
    }
  }

  for (const newSkill of newSkills) {
    const oldSkill = oldSkills.find((s) => s.name === newSkill.name);
    if (oldSkill && !arraysEqual(oldSkill.path, newSkill.path)) {
      moved.push({
        skill: newSkill.name,
        from: oldSkill.path,
        to: newSkill.path,
      });
    }
  }

  return { added, removed, moved };
}

function getAllSkillsWithPaths(
  node: TreeNode,
  currentPath: string[] = []
): { name: string; path: string[] }[] {
  const results: { name: string; path: string[] }[] = [];
  const path = [...currentPath, node.name];

  for (const skill of node.skills) {
    results.push({ name: skill, path });
  }

  for (const child of node.children) {
    results.push(...getAllSkillsWithPaths(child, path));
  }

  return results;
}

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}
