import { existsSync, readFileSync } from 'node:fs';
import { join, basename, dirname } from 'node:path';
import { execSync } from 'node:child_process';
import chalk from 'chalk';
import { Command, Option } from 'clipanion';

interface SkillFrontmatter {
  name?: string;
  description?: string;
  tags?: string[];
  version?: string;
}

export class PublishCommand extends Command {
  static override paths = [['publish']];

  static override usage = Command.Usage({
    description: 'Publish your skill to the SkillKit marketplace',
    examples: [
      ['Publish skill from current directory', '$0 publish'],
      ['Publish skill from specific path', '$0 publish ./my-skill'],
      ['Publish with custom name', '$0 publish --name my-awesome-skill'],
    ],
  });

  skillPath = Option.String({ required: false, name: 'path' });

  name = Option.String('--name,-n', {
    description: 'Custom skill name (default: parsed from SKILL.md)',
  });

  dryRun = Option.Boolean('--dry-run', false, {
    description: 'Show what would be published without actually publishing',
  });

  async execute(): Promise<number> {
    const skillPath = this.skillPath || process.cwd();
    const skillMdPath = this.findSkillMd(skillPath);

    if (!skillMdPath) {
      console.error(chalk.red('No SKILL.md found'));
      console.error(chalk.dim('Run this command from a directory containing SKILL.md'));
      console.error(chalk.dim('Or specify the path: skillkit publish ./path/to/skill'));
      return 1;
    }

    console.log(chalk.cyan('Publishing skill to SkillKit marketplace...\n'));

    // Parse SKILL.md
    const content = readFileSync(skillMdPath, 'utf-8');
    const frontmatter = this.parseFrontmatter(content);
    const skillName = this.name || frontmatter.name || basename(dirname(skillMdPath));

    // Get git repo info
    const repoInfo = this.getRepoInfo(dirname(skillMdPath));
    if (!repoInfo) {
      console.error(chalk.red('Not a git repository or no remote configured'));
      console.error(chalk.dim('Your skill must be in a git repository with a GitHub remote'));
      return 1;
    }

    // Build skill entry
    const skillSlug = this.slugify(skillName);
    const skillEntry = {
      id: `${repoInfo.owner}/${repoInfo.repo}/${skillSlug}`,
      name: this.formatName(skillName),
      description: frontmatter.description || `Best practices and patterns for ${this.formatName(skillName)}`,
      source: `${repoInfo.owner}/${repoInfo.repo}`,
      tags: frontmatter.tags || this.inferTags(skillName, frontmatter.description || ''),
    };

    console.log(chalk.white('Skill details:'));
    console.log(chalk.dim(`  ID: ${skillEntry.id}`));
    console.log(chalk.dim(`  Name: ${skillEntry.name}`));
    console.log(chalk.dim(`  Description: ${skillEntry.description}`));
    console.log(chalk.dim(`  Source: ${skillEntry.source}`));
    console.log(chalk.dim(`  Tags: ${skillEntry.tags.join(', ')}`));
    console.log();

    if (this.dryRun) {
      console.log(chalk.yellow('Dry run - not publishing'));
      console.log(chalk.dim('JSON entry that would be added:'));
      console.log(JSON.stringify(skillEntry, null, 2));
      return 0;
    }

    // Create GitHub issue to add skill
    const issueBody = this.createIssueBody(skillEntry);
    const issueTitle = encodeURIComponent(`[Publish] ${skillEntry.name}`);
    const issueBodyEncoded = encodeURIComponent(issueBody);
    const issueUrl = `https://github.com/rohitg00/skillkit/issues/new?title=${issueTitle}&body=${issueBodyEncoded}&labels=skill-submission,publish`;

    console.log(chalk.green('Opening GitHub to submit your skill...\n'));

    try {
      // Try to open the URL
      const openCmd =
        process.platform === 'darwin'
          ? `open "${issueUrl}"`
          : process.platform === 'win32'
            ? `cmd /c start "" "${issueUrl}"`
            : `xdg-open "${issueUrl}"`;
      execSync(openCmd, { stdio: 'ignore' });

      console.log(chalk.green('GitHub issue page opened!'));
      console.log(chalk.dim('Review and submit the issue to publish your skill.'));
    } catch {
      console.log(chalk.yellow('Could not open browser automatically.'));
      console.log(chalk.dim('Please open this URL manually:\n'));
      console.log(chalk.cyan(issueUrl.slice(0, 200) + '...'));
    }

    console.log();
    console.log(chalk.cyan('Next steps:'));
    console.log(chalk.dim('  1. Review the skill details in the GitHub issue'));
    console.log(chalk.dim('  2. Submit the issue'));
    console.log(chalk.dim('  3. A maintainer will review and add your skill'));

    return 0;
  }

  private findSkillMd(basePath: string): string | null {
    // Check if path is directly to SKILL.md
    if (basePath.endsWith('SKILL.md') && existsSync(basePath)) {
      return basePath;
    }

    // Check if SKILL.md exists in the directory
    const direct = join(basePath, 'SKILL.md');
    if (existsSync(direct)) {
      return direct;
    }

    // Check common skill locations
    const locations = [
      join(basePath, 'skills', 'SKILL.md'),
      join(basePath, '.claude', 'skills', 'SKILL.md'),
      join(basePath, '.cursor', 'skills', 'SKILL.md'),
    ];

    for (const loc of locations) {
      if (existsSync(loc)) {
        return loc;
      }
    }

    return null;
  }

  private parseFrontmatter(content: string): SkillFrontmatter {
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!match) return {};

    const frontmatter: SkillFrontmatter = {};
    const lines = match[1].split(/\r?\n/);
    let inTagsList = false;

    for (const line of lines) {
      // Handle multiline tags list
      if (inTagsList) {
        const tagMatch = line.match(/^\s*-\s*(.+)$/);
        if (tagMatch) {
          frontmatter.tags ??= [];
          frontmatter.tags.push(tagMatch[1].trim().replace(/^["']|["']$/g, ''));
          continue;
        }
        if (line.trim() === '') continue;
        inTagsList = false;
      }

      const colonIdx = line.indexOf(':');
      if (colonIdx === -1) continue;

      const key = line.slice(0, colonIdx).trim();
      const value = line.slice(colonIdx + 1).trim();

      switch (key) {
        case 'name':
          frontmatter.name = value.replace(/^["']|["']$/g, '');
          break;
        case 'description':
          frontmatter.description = value.replace(/^["']|["']$/g, '');
          break;
        case 'version':
          frontmatter.version = value.replace(/^["']|["']$/g, '');
          break;
        case 'tags':
          // Parse YAML array: [tag1, tag2] or multiline list
          if (value.startsWith('[')) {
            frontmatter.tags = value
              .slice(1, -1)
              .split(',')
              .map(t => t.trim().replace(/^["']|["']$/g, ''));
          } else if (value === '') {
            inTagsList = true;
            frontmatter.tags = [];
          }
          break;
      }
    }

    return frontmatter;
  }

  private slugify(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private getRepoInfo(dir: string): { owner: string; repo: string } | null {
    try {
      const remote = execSync('git remote get-url origin', {
        cwd: dir,
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'ignore'],
      }).trim();

      // Parse GitHub URL: git@github.com:owner/repo.git or https://github.com/owner/repo.git
      const match = remote.match(/github\.com[:/]([^/]+)\/([^/.]+)/);
      if (match) {
        return { owner: match[1], repo: match[2] };
      }
    } catch {
      // Not a git repo or no remote
    }

    return null;
  }

  private formatName(name: string): string {
    return name
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private inferTags(name: string, description: string): string[] {
    const tags: string[] = [];
    const text = `${name} ${description}`.toLowerCase();

    const tagMap: Record<string, string[]> = {
      react: ['react', 'jsx', 'tsx'],
      typescript: ['typescript', 'ts'],
      nextjs: ['next', 'nextjs'],
      testing: ['test', 'jest', 'vitest'],
      mobile: ['mobile', 'react-native', 'expo'],
      backend: ['backend', 'api', 'server'],
      database: ['database', 'postgres', 'mysql', 'supabase'],
      frontend: ['frontend', 'ui', 'design'],
      devops: ['devops', 'ci', 'cd', 'docker'],
    };

    for (const [tag, keywords] of Object.entries(tagMap)) {
      if (keywords.some(k => text.includes(k))) {
        tags.push(tag);
      }
    }

    return tags.length > 0 ? tags : ['general'];
  }

  private createIssueBody(
    skill: { id: string; name: string; description: string; source: string; tags: string[] }
  ): string {
    return `## Publish Skill Request

### Skill Details
- **ID:** \`${skill.id}\`
- **Name:** ${skill.name}
- **Description:** ${skill.description}
- **Source:** [${skill.source}](https://github.com/${skill.source})
- **Tags:** ${skill.tags.map(t => `\`${t}\``).join(', ')}

### JSON Entry
\`\`\`json
${JSON.stringify(skill, null, 2)}
\`\`\`

### Checklist
- [ ] SKILL.md follows the standard format
- [ ] Skill is publicly accessible on GitHub
- [ ] Description accurately describes the skill
- [ ] Tags are appropriate

---
Submitted via \`skillkit publish\``;
  }
}
