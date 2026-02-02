import { join } from 'node:path';
import {
  generateSkillTree,
  loadTree,
  saveTree,
  treeToText,
  loadIndex,
  type SkillTree,
  type TreeNode,
} from '@skillkit/core';

const TREE_PATH = join(process.env.HOME || '~', '.skillkit', 'skill-tree.json');

export interface TreeServiceState {
  tree: SkillTree | null;
  currentNode: TreeNode | null;
  currentPath: string[];
  loading: boolean;
  error: string | null;
}

export interface TreeNodeDisplay {
  id: string;
  name: string;
  description?: string;
  skillCount: number;
  childCount: number;
  depth: number;
  isExpanded: boolean;
  isCategory: boolean;
}

export async function loadOrGenerateTree(): Promise<TreeServiceState> {
  try {
    let tree = loadTree(TREE_PATH);

    if (!tree) {
      const index = loadIndex();
      if (index && index.skills.length > 0) {
        tree = generateSkillTree(index.skills);
        saveTree(tree, TREE_PATH);
      }
    }

    if (!tree) {
      return {
        tree: null,
        currentNode: null,
        currentPath: [],
        loading: false,
        error: 'No skill index found. Run "skillkit recommend --update" first.',
      };
    }

    return {
      tree,
      currentNode: tree.rootNode,
      currentPath: [],
      loading: false,
      error: null,
    };
  } catch (err) {
    return {
      tree: null,
      currentNode: null,
      currentPath: [],
      loading: false,
      error: err instanceof Error ? err.message : 'Failed to load tree',
    };
  }
}

export function navigateToPath(tree: SkillTree, path: string[]): TreeNode | null {
  let current = tree.rootNode;

  for (const segment of path) {
    const child = current.children.find(
      (c) => c.name.toLowerCase() === segment.toLowerCase()
    );
    if (!child) {
      return null;
    }
    current = child;
  }

  return current;
}

export function getNodeChildren(node: TreeNode): TreeNodeDisplay[] {
  return node.children.map((child) => ({
    id: child.id,
    name: child.name,
    description: child.description,
    skillCount: child.skillCount,
    childCount: child.children.length,
    depth: child.depth,
    isExpanded: false,
    isCategory: child.children.length > 0,
  }));
}

export function getNodeSkills(node: TreeNode): string[] {
  return node.skills;
}

export function getTreeStats(tree: SkillTree): {
  totalSkills: number;
  totalCategories: number;
  maxDepth: number;
  topCategories: { name: string; count: number }[];
} {
  const topCategories = tree.rootNode.children
    .sort((a, b) => b.skillCount - a.skillCount)
    .slice(0, 5)
    .map((c) => ({ name: c.name, count: c.skillCount }));

  return {
    totalSkills: tree.totalSkills,
    totalCategories: tree.totalCategories,
    maxDepth: tree.maxDepth,
    topCategories,
  };
}

export function searchInTree(tree: SkillTree, query: string): TreeNodeDisplay[] {
  const results: TreeNodeDisplay[] = [];
  const queryLower = query.toLowerCase();

  const traverse = (node: TreeNode) => {
    const nameMatch = node.name.toLowerCase().includes(queryLower);
    const skillMatch = node.skills.some((s) =>
      s.toLowerCase().includes(queryLower)
    );

    if (nameMatch || skillMatch) {
      results.push({
        id: node.id,
        name: node.name,
        description: node.description,
        skillCount: node.skillCount,
        childCount: node.children.length,
        depth: node.depth,
        isExpanded: false,
        isCategory: node.children.length > 0,
      });
    }

    for (const child of node.children) {
      traverse(child);
    }
  };

  traverse(tree.rootNode);
  return results;
}

export function formatTreePath(path: string[]): string {
  if (path.length === 0) return 'Root';
  return path.join(' > ');
}
