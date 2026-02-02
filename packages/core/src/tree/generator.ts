import type { SkillSummary } from '../recommend/types.js';
import {
  type TreeNode,
  type SkillTree,
  type TreeGeneratorOptions,
  type CategoryMapping,
  CATEGORY_TAXONOMY,
} from './types.js';

const DEFAULT_OPTIONS: Required<TreeGeneratorOptions> = {
  maxDepth: 3,
  minSkillsPerNode: 1,
  includeEmpty: false,
};

export class TreeGenerator {
  private options: Required<TreeGeneratorOptions>;

  constructor(options?: TreeGeneratorOptions) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  generateTree(skills: SkillSummary[]): SkillTree {
    const rootNode = this.buildTreeFromTaxonomy(skills);
    const { totalCategories, maxDepth } = this.countTreeStats(rootNode);

    return {
      version: 1,
      generatedAt: new Date().toISOString(),
      rootNode,
      totalSkills: skills.length,
      totalCategories,
      maxDepth,
    };
  }

  private buildTreeFromTaxonomy(skills: SkillSummary[]): TreeNode {
    const root: TreeNode = {
      id: 'root',
      name: 'Skills',
      description: 'All available skills organized by category',
      children: [],
      skills: [],
      skillCount: skills.length,
      depth: 0,
    };

    const uncategorized: string[] = [];

    for (const category of CATEGORY_TAXONOMY) {
      const categoryNode = this.buildCategoryNode(category, skills, 1);
      if (categoryNode.skillCount > 0 || this.options.includeEmpty) {
        root.children.push(categoryNode);
      }
    }

    for (const skill of skills) {
      if (!this.isSkillCategorized(skill)) {
        uncategorized.push(skill.name);
      }
    }

    if (uncategorized.length > 0) {
      root.children.push({
        id: 'other',
        name: 'Other',
        description: 'Skills without specific categorization',
        children: [],
        skills: uncategorized,
        skillCount: uncategorized.length,
        depth: 1,
      });
    }

    return root;
  }

  private buildCategoryNode(
    category: CategoryMapping,
    skills: SkillSummary[],
    depth: number
  ): TreeNode {
    const categorySkills = this.filterSkillsByCategory(skills, category);
    const subcategoryNodes: TreeNode[] = [];

    if (depth < this.options.maxDepth) {
      for (const subcategory of category.subcategories) {
        const subcategorySkills = this.filterSkillsBySubcategory(
          categorySkills,
          subcategory,
          category
        );

        if (
          subcategorySkills.length >= this.options.minSkillsPerNode ||
          this.options.includeEmpty
        ) {
          subcategoryNodes.push({
            id: `${category.category.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${subcategory.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
            name: subcategory,
            description: `${subcategory} skills in ${category.category}`,
            children: [],
            skills: subcategorySkills.map((s) => s.name),
            skillCount: subcategorySkills.length,
            depth: depth + 1,
          });
        }
      }
    }

    const directSkills = categorySkills.filter(
      (skill) =>
        !subcategoryNodes.some((node) => node.skills.includes(skill.name))
    );

    const totalSkillCount =
      directSkills.length +
      subcategoryNodes.reduce((sum, node) => sum + node.skillCount, 0);

    return {
      id: category.category.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      name: category.category,
      description: `${category.category} related skills`,
      children: subcategoryNodes,
      skills: directSkills.map((s) => s.name),
      skillCount: totalSkillCount,
      depth,
    };
  }

  private filterSkillsByCategory(
    skills: SkillSummary[],
    category: CategoryMapping
  ): SkillSummary[] {
    return skills.filter((skill) => {
      const skillTags = (skill.tags || []).map((t) => t.toLowerCase());
      const skillName = skill.name.toLowerCase();
      const skillDesc = (skill.description || '').toLowerCase();

      const tagMatch = skillTags.some((tag) =>
        category.tags.includes(tag)
      );

      const keywordMatch = category.keywords.some(
        (keyword) =>
          skillName.includes(keyword) || skillDesc.includes(keyword)
      );

      const categoryNameMatch =
        skillName.includes(category.category.toLowerCase()) ||
        skillDesc.includes(category.category.toLowerCase());

      return tagMatch || keywordMatch || categoryNameMatch;
    });
  }

  private filterSkillsBySubcategory(
    skills: SkillSummary[],
    subcategory: string,
    _parentCategory: CategoryMapping
  ): SkillSummary[] {
    const subcategoryLower = subcategory.toLowerCase();
    const subcategoryNormalized = subcategoryLower.replace(/[^a-z0-9]/g, '');

    return skills.filter((skill) => {
      const skillTags = (skill.tags || []).map((t) => t.toLowerCase());
      const skillName = skill.name.toLowerCase();
      const skillDesc = (skill.description || '').toLowerCase();

      const tagMatch = skillTags.some(
        (tag) =>
          tag === subcategoryLower ||
          tag === subcategoryNormalized ||
          tag.includes(subcategoryLower)
      );

      const nameMatch =
        skillName.includes(subcategoryLower) ||
        skillName.includes(subcategoryNormalized);

      const descMatch =
        skillDesc.includes(subcategoryLower) ||
        skillDesc.includes(subcategoryNormalized);

      const compatibilityMatch =
        skill.compatibility?.frameworks?.some(
          (f) =>
            f.toLowerCase() === subcategoryLower ||
            f.toLowerCase() === subcategoryNormalized
        ) ||
        skill.compatibility?.languages?.some(
          (l) =>
            l.toLowerCase() === subcategoryLower ||
            l.toLowerCase() === subcategoryNormalized
        );

      return tagMatch || nameMatch || descMatch || compatibilityMatch;
    });
  }

  private isSkillCategorized(skill: SkillSummary): boolean {
    for (const category of CATEGORY_TAXONOMY) {
      const skillTags = (skill.tags || []).map((t) => t.toLowerCase());
      const skillName = skill.name.toLowerCase();
      const skillDesc = (skill.description || '').toLowerCase();

      const tagMatch = skillTags.some((tag) => category.tags.includes(tag));

      const keywordMatch = category.keywords.some(
        (keyword) =>
          skillName.includes(keyword) || skillDesc.includes(keyword)
      );

      if (tagMatch || keywordMatch) {
        return true;
      }
    }
    return false;
  }

  private countTreeStats(node: TreeNode): {
    totalCategories: number;
    maxDepth: number;
  } {
    let totalCategories = 1;
    let maxDepth = node.depth;

    for (const child of node.children) {
      const childStats = this.countTreeStats(child);
      totalCategories += childStats.totalCategories;
      maxDepth = Math.max(maxDepth, childStats.maxDepth);
    }

    return { totalCategories, maxDepth };
  }

  findNode(tree: SkillTree, path: string[]): TreeNode | null {
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

  getPath(tree: SkillTree, skillName: string): string[] | null {
    const findPath = (node: TreeNode, path: string[]): string[] | null => {
      if (node.skills.includes(skillName)) {
        return [...path, node.name];
      }

      for (const child of node.children) {
        const result = findPath(child, [...path, node.name]);
        if (result) {
          return result;
        }
      }

      return null;
    };

    const result = findPath(tree.rootNode, []);
    return result ? result.slice(1) : null;
  }

  getAllPaths(tree: SkillTree): Map<string, string[]> {
    const paths = new Map<string, string[]>();

    const traverse = (node: TreeNode, currentPath: string[]) => {
      for (const skillName of node.skills) {
        paths.set(skillName, currentPath);
      }

      for (const child of node.children) {
        traverse(child, [...currentPath, child.name]);
      }
    };

    traverse(tree.rootNode, []);
    return paths;
  }

  getNodesAtDepth(tree: SkillTree, depth: number): TreeNode[] {
    const nodes: TreeNode[] = [];

    const traverse = (node: TreeNode) => {
      if (node.depth === depth) {
        nodes.push(node);
      } else if (node.depth < depth) {
        for (const child of node.children) {
          traverse(child);
        }
      }
    };

    traverse(tree.rootNode);
    return nodes;
  }

  flattenTree(tree: SkillTree): TreeNode[] {
    const nodes: TreeNode[] = [];

    const traverse = (node: TreeNode) => {
      nodes.push(node);
      for (const child of node.children) {
        traverse(child);
      }
    };

    traverse(tree.rootNode);
    return nodes;
  }

  searchTree(tree: SkillTree, query: string): TreeNode[] {
    const queryLower = query.toLowerCase();
    const results: TreeNode[] = [];

    const traverse = (node: TreeNode) => {
      const nameMatch = node.name.toLowerCase().includes(queryLower);
      const descMatch = (node.description || '').toLowerCase().includes(queryLower);
      const skillMatch = node.skills.some((s) =>
        s.toLowerCase().includes(queryLower)
      );

      if (nameMatch || descMatch || skillMatch) {
        results.push(node);
      }

      for (const child of node.children) {
        traverse(child);
      }
    };

    traverse(tree.rootNode);
    return results;
  }
}

export function generateSkillTree(
  skills: SkillSummary[],
  options?: TreeGeneratorOptions
): SkillTree {
  const generator = new TreeGenerator(options);
  return generator.generateTree(skills);
}
