import { Command, Option } from 'clipanion';
import { join } from 'node:path';
import { homedir } from 'node:os';
import {
  loadIndex as loadIndexFromCache,
  generateSkillTree,
  saveTree,
  loadTree,
  type SkillTree,
  type TreeNode,
} from '@skillkit/core';
import {
  header,
  colors,
  symbols,
  spinner,
  warn,
} from '../onboarding/index.js';

const TREE_PATH = join(homedir(), '.skillkit', 'skill-tree.json');

export class TreeCommand extends Command {
  static override paths = [['tree']];

  static override usage = Command.Usage({
    description: 'Browse skills in a hierarchical tree structure',
    details: `
      The tree command displays skills organized in a hierarchical taxonomy.
      Navigate through categories like Development, Testing, DevOps, AI/ML, etc.

      Features:
      - Visual tree structure of all skills
      - Filter by category path (e.g., "Frontend > React")
      - Generate tree from skill index
      - Export to markdown format
    `,
    examples: [
      ['Show full tree', '$0 tree'],
      ['Show specific category', '$0 tree Frontend'],
      ['Show subcategory', '$0 tree "Frontend > React"'],
      ['Limit depth', '$0 tree --depth 2'],
      ['Generate/update tree', '$0 tree --generate'],
      ['Export to markdown', '$0 tree --markdown'],
      ['Show tree stats', '$0 tree --stats'],
    ],
  });

  treePath = Option.String({ required: false });

  depth = Option.String('--depth,-d', {
    description: 'Maximum depth to display',
  });

  generate = Option.Boolean('--generate,-g', false, {
    description: 'Generate/update tree from skill index',
  });

  markdown = Option.Boolean('--markdown,-m', false, {
    description: 'Output in markdown format',
  });

  stats = Option.Boolean('--stats,-s', false, {
    description: 'Show tree statistics',
  });

  json = Option.Boolean('--json,-j', false, {
    description: 'Output in JSON format',
  });

  quiet = Option.Boolean('--quiet,-q', false, {
    description: 'Minimal output',
  });

  async execute(): Promise<number> {
    if (this.generate) {
      return await this.generateTree();
    }

    const tree = this.loadOrGenerateTree();
    if (!tree) {
      warn('No skill tree found. Run "skillkit tree --generate" first.');
      return 1;
    }

    if (this.stats) {
      return this.showStats(tree);
    }

    if (this.json) {
      console.log(JSON.stringify(tree, null, 2));
      return 0;
    }

    if (this.markdown) {
      const { treeToMarkdown } = await import('@skillkit/core');
      console.log(treeToMarkdown(tree));
      return 0;
    }

    return this.displayTree(tree);
  }

  private async generateTree(): Promise<number> {
    if (!this.quiet) {
      header('Generate Skill Tree');
    }

    const index = loadIndexFromCache();
    if (!index || index.skills.length === 0) {
      warn('No skill index found. Run "skillkit recommend --update" first.');
      return 1;
    }

    const s = spinner();
    s.start('Generating skill tree...');

    try {
      const tree = generateSkillTree(index.skills);
      saveTree(tree, TREE_PATH);

      s.stop(`Generated tree with ${tree.totalCategories} categories`);

      console.log('');
      console.log(colors.success(`${symbols.success} Tree generated successfully`));
      console.log(colors.muted(`  Total skills: ${tree.totalSkills}`));
      console.log(colors.muted(`  Categories: ${tree.totalCategories}`));
      console.log(colors.muted(`  Max depth: ${tree.maxDepth}`));
      console.log(colors.muted(`  Saved to: ${TREE_PATH}`));
      console.log('');

      return 0;
    } catch (err) {
      s.stop(colors.error('Failed to generate tree'));
      console.log(colors.muted(err instanceof Error ? err.message : String(err)));
      return 1;
    }
  }

  private loadOrGenerateTree(): SkillTree | null {
    let tree = loadTree(TREE_PATH);

    if (!tree) {
      const index = loadIndexFromCache();
      if (index && index.skills.length > 0) {
        tree = generateSkillTree(index.skills);
        saveTree(tree, TREE_PATH);
      }
    }

    return tree;
  }

  private showStats(tree: SkillTree): number {
    if (!this.quiet) {
      header('Skill Tree Statistics');
    }

    console.log('');
    console.log(colors.bold('Overview:'));
    console.log(`  Total Skills: ${colors.accent(String(tree.totalSkills))}`);
    console.log(`  Categories: ${colors.accent(String(tree.totalCategories))}`);
    console.log(`  Max Depth: ${colors.accent(String(tree.maxDepth))}`);
    console.log(`  Generated: ${colors.muted(tree.generatedAt)}`);
    console.log('');

    console.log(colors.bold('Top-Level Categories:'));
    for (const child of tree.rootNode.children) {
      const percentage = tree.totalSkills > 0
        ? ((child.skillCount / tree.totalSkills) * 100).toFixed(1)
        : '0.0';
      console.log(
        `  ${colors.accent(child.name.padEnd(15))} ${String(child.skillCount).padStart(6)} skills (${percentage}%)`
      );

      if (child.children.length > 0) {
        const subcats = child.children
          .sort((a, b) => b.skillCount - a.skillCount)
          .slice(0, 3)
          .map((c) => `${c.name} (${c.skillCount})`)
          .join(', ');
        console.log(`    ${colors.muted(subcats)}`);
      }
    }
    console.log('');

    return 0;
  }

  private displayTree(tree: SkillTree): number {
    if (!this.quiet) {
      header('Skill Tree');
      console.log(colors.muted(`${tree.totalSkills} skills in ${tree.totalCategories} categories`));
      console.log('');
    }

    let targetNode: TreeNode = tree.rootNode;

    if (this.treePath) {
      const segments = this.treePath.split('>').map((s) => s.trim());
      let current = tree.rootNode;

      for (const segment of segments) {
        const child = current.children.find(
          (c) => c.name.toLowerCase() === segment.toLowerCase()
        );
        if (!child) {
          warn(`Category not found: ${segment}`);
          console.log(colors.muted(`Available categories: ${current.children.map((c) => c.name).join(', ')}`));
          return 1;
        }
        current = child;
      }
      targetNode = current;
    }

    let maxDepth = this.depth ? parseInt(this.depth, 10) : 3;
    if (Number.isNaN(maxDepth) || maxDepth < 0) {
      warn('Invalid depth value. Using default depth of 3.');
      maxDepth = 3;
    }
    this.renderNode(targetNode, '', true, 0, maxDepth);

    console.log('');
    console.log(colors.muted('Navigate: skillkit tree "Category > Subcategory"'));
    console.log(colors.muted('Generate: skillkit tree --generate'));

    return 0;
  }

  private renderNode(
    node: TreeNode,
    prefix: string,
    isLast: boolean,
    depth: number,
    maxDepth: number
  ): void {
    if (depth > maxDepth) return;

    const connector = depth === 0 ? '' : isLast ? '└── ' : '├── ';
    const icon = node.children.length > 0 ? '📁 ' : '📄 ';
    const skillInfo =
      node.skillCount > 0 ? colors.muted(` (${node.skillCount})`) : '';

    const nameColor = depth === 0 ? colors.bold : depth === 1 ? colors.accent : colors.dim;

    console.log(`${prefix}${connector}${icon}${nameColor(node.name)}${skillInfo}`);

    if (depth === maxDepth && node.skills.length > 0 && node.skills.length <= 5) {
      const childPrefix = prefix + (isLast ? '    ' : '│   ');
      for (const skill of node.skills) {
        console.log(`${childPrefix}  • ${colors.muted(skill)}`);
      }
    }

    const newPrefix = prefix + (depth === 0 ? '' : isLast ? '    ' : '│   ');

    if (depth < maxDepth) {
      node.children.forEach((child, index) => {
        const childIsLast = index === node.children.length - 1;
        this.renderNode(child, newPrefix, childIsLast, depth + 1, maxDepth);
      });
    } else if (node.children.length > 0) {
      console.log(`${newPrefix}    ${colors.muted(`... ${node.children.length} more subcategories`)}`);
    }
  }
}
