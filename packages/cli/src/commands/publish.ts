import { existsSync, readFileSync, mkdirSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, basename, dirname, resolve } from 'node:path';
import chalk from 'chalk';
import { Command, Option } from 'clipanion';
import { generateWellKnownIndex, type WellKnownSkill } from '@skillkit/core';

function sanitizeSkillName(name: string): string | null {
  if (!name || typeof name !== 'string') return null;
  const base = basename(name);
  if (base !== name || name.includes('..') || name.includes('/') || name.includes('\\')) {
    return null;
  }
  if (!/^[a-zA-Z0-9._-]+$/.test(name)) {
    return null;
  }
  return name;
}

interface SkillFrontmatter {
  name?: string;
  description?: string;
  tags?: string[];
  version?: string;
}

export class PublishCommand extends Command {
  static override paths = [['publish']];

  static override usage = Command.Usage({
    description: 'Generate well-known skills structure for hosting',
    details: `
      This command generates the RFC 8615 well-known URI structure for hosting skills.

      The output includes:
      - .well-known/skills/index.json - Skill manifest for auto-discovery
      - .well-known/skills/{skill-name}/SKILL.md - Individual skill files

      Users can then install skills via: skillkit add https://your-domain.com
    `,
    examples: [
      ['Generate from current directory', '$0 publish'],
      ['Generate from specific path', '$0 publish ./my-skills'],
      ['Generate to custom output directory', '$0 publish --output ./public'],
      ['Preview without writing', '$0 publish --dry-run'],
    ],
  });

  skillPath = Option.String({ required: false, name: 'path' });

  output = Option.String('--output,-o', {
    description: 'Output directory for well-known structure (default: current directory)',
  });

  dryRun = Option.Boolean('--dry-run,-n', false, {
    description: 'Show what would be generated without writing files',
  });

  async execute(): Promise<number> {
    const basePath = this.skillPath || process.cwd();
    const outputDir = this.output || basePath;

    console.log(chalk.cyan('Generating well-known skills structure...\n'));

    const discoveredSkills = this.discoverSkills(basePath);

    if (discoveredSkills.length === 0) {
      console.error(chalk.red('No skills found'));
      console.error(chalk.dim('Skills must contain a SKILL.md file with frontmatter'));
      return 1;
    }

    console.log(chalk.white(`Found ${discoveredSkills.length} skill(s):\n`));

    const wellKnownSkills: WellKnownSkill[] = [];

    const validSkills: Array<{ name: string; safeName: string; description?: string; path: string }> = [];

    for (const skill of discoveredSkills) {
      const safeName = sanitizeSkillName(skill.name);
      if (!safeName) {
        console.log(chalk.yellow(`  ${chalk.yellow('⚠')} Skipping "${skill.name}" (invalid name - must be alphanumeric with hyphens/underscores)`));
        continue;
      }

      const files = this.getSkillFiles(skill.path);
      console.log(chalk.dim(`  ${chalk.green('●')} ${safeName}`));
      console.log(chalk.dim(`    Description: ${skill.description || 'No description'}`));
      console.log(chalk.dim(`    Files: ${files.join(', ')}`));

      validSkills.push({ name: skill.name, safeName, description: skill.description, path: skill.path });
      wellKnownSkills.push({
        name: safeName,
        description: skill.description,
        files,
      });
    }

    if (validSkills.length === 0) {
      console.error(chalk.red('\nNo valid skills to publish'));
      return 1;
    }

    console.log('');

    if (this.dryRun) {
      console.log(chalk.yellow('Dry run - not writing files\n'));
      console.log(chalk.white('Would generate:'));
      console.log(chalk.dim(`  ${outputDir}/.well-known/skills/index.json`));
      for (const skill of wellKnownSkills) {
        for (const file of skill.files) {
          console.log(chalk.dim(`  ${outputDir}/.well-known/skills/${skill.name}/${file}`));
        }
      }
      console.log('');
      console.log(chalk.white('index.json preview:'));
      console.log(JSON.stringify(generateWellKnownIndex(wellKnownSkills), null, 2));
      return 0;
    }

    const wellKnownDir = join(outputDir, '.well-known', 'skills');
    mkdirSync(wellKnownDir, { recursive: true });

    for (const skill of validSkills) {
      const skillDir = join(wellKnownDir, skill.safeName);
      const resolvedSkillDir = resolve(skillDir);
      const resolvedWellKnownDir = resolve(wellKnownDir);

      if (!resolvedSkillDir.startsWith(resolvedWellKnownDir)) {
        console.log(chalk.yellow(`  Skipping "${skill.name}" (path traversal detected)`));
        continue;
      }

      mkdirSync(skillDir, { recursive: true });

      const files = this.getSkillFiles(skill.path);
      for (const file of files) {
        const safeFile = basename(file);
        const sourcePath = join(skill.path, file);
        const destPath = join(skillDir, safeFile);
        const content = readFileSync(sourcePath, 'utf-8');
        writeFileSync(destPath, content);
      }
    }

    const index = generateWellKnownIndex(wellKnownSkills);
    writeFileSync(join(wellKnownDir, 'index.json'), JSON.stringify(index, null, 2));

    console.log(chalk.green('Generated well-known structure:\n'));
    console.log(chalk.dim(`  ${wellKnownDir}/index.json`));
    for (const skill of wellKnownSkills) {
      console.log(chalk.dim(`  ${wellKnownDir}/${skill.name}/`));
    }

    console.log('');
    console.log(chalk.cyan('Next steps:'));
    console.log(chalk.dim('  1. Deploy the .well-known directory to your web server'));
    console.log(chalk.dim('  2. Users can install via: skillkit add https://your-domain.com'));
    console.log(chalk.dim('  3. Skills auto-discovered from /.well-known/skills/index.json'));

    return 0;
  }

  private discoverSkills(basePath: string): Array<{ name: string; description?: string; path: string }> {
    const skills: Array<{ name: string; description?: string; path: string }> = [];

    const skillMdPath = join(basePath, 'SKILL.md');
    if (existsSync(skillMdPath)) {
      const content = readFileSync(skillMdPath, 'utf-8');
      const frontmatter = this.parseFrontmatter(content);
      skills.push({
        name: frontmatter.name || basename(basePath),
        description: frontmatter.description,
        path: basePath,
      });
      return skills;
    }

    const searchDirs = [
      basePath,
      join(basePath, 'skills'),
      join(basePath, '.claude', 'skills'),
    ];

    for (const searchDir of searchDirs) {
      if (!existsSync(searchDir)) continue;

      const entries = readdirSync(searchDir);
      for (const entry of entries) {
        const entryPath = join(searchDir, entry);
        if (!statSync(entryPath).isDirectory()) continue;

        const entrySkillMd = join(entryPath, 'SKILL.md');
        if (existsSync(entrySkillMd)) {
          const content = readFileSync(entrySkillMd, 'utf-8');
          const frontmatter = this.parseFrontmatter(content);
          skills.push({
            name: frontmatter.name || entry,
            description: frontmatter.description,
            path: entryPath,
          });
        }
      }
    }

    return skills;
  }

  private getSkillFiles(skillPath: string): string[] {
    const files: string[] = [];

    const entries = readdirSync(skillPath);
    for (const entry of entries) {
      const entryPath = join(skillPath, entry);
      if (statSync(entryPath).isFile()) {
        if (entry.startsWith('.') || entry === '.skillkit-metadata.json') continue;
        files.push(entry);
      }
    }

    if (!files.includes('SKILL.md')) {
      files.unshift('SKILL.md');
    }

    return files;
  }

  private parseFrontmatter(content: string): SkillFrontmatter {
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!match) return {};

    const frontmatter: SkillFrontmatter = {};
    const lines = match[1].split(/\r?\n/);
    let inTagsList = false;

    for (const line of lines) {
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
          if (value.startsWith('[')) {
            frontmatter.tags = value
              .slice(1, -1)
              .split(',')
              .map(t => t.trim().replace(/^["']|["']$/g, ''))
              .filter(t => t.length > 0);
          } else if (value === '') {
            inTagsList = true;
            frontmatter.tags = [];
          }
          break;
      }
    }

    return frontmatter;
  }
}

export class PublishSubmitCommand extends Command {
  static override paths = [['publish', 'submit']];

  static override usage = Command.Usage({
    description: 'Submit skill to SkillKit marketplace (requires review)',
    examples: [
      ['Submit skill from current directory', '$0 publish submit'],
      ['Submit with custom name', '$0 publish submit --name my-skill'],
    ],
  });

  skillPath = Option.String({ required: false, name: 'path' });

  name = Option.String('--name,-n', {
    description: 'Custom skill name',
  });

  dryRun = Option.Boolean('--dry-run', false, {
    description: 'Show what would be submitted',
  });

  async execute(): Promise<number> {
    const skillPath = this.skillPath || process.cwd();
    const skillMdPath = this.findSkillMd(skillPath);

    if (!skillMdPath) {
      console.error(chalk.red('No SKILL.md found'));
      console.error(chalk.dim('Run this command from a directory containing SKILL.md'));
      return 1;
    }

    console.log(chalk.cyan('Submitting skill to SkillKit marketplace...\n'));

    const content = readFileSync(skillMdPath, 'utf-8');
    const frontmatter = this.parseFrontmatter(content);
    const skillName = this.name || frontmatter.name || basename(dirname(skillMdPath));

    const repoInfo = this.getRepoInfo(dirname(skillMdPath));
    if (!repoInfo) {
      console.error(chalk.red('Not a git repository or no remote configured'));
      console.error(chalk.dim('Your skill must be in a git repository with a GitHub remote'));
      return 1;
    }

    const skillSlug = this.slugify(skillName);
    if (!skillSlug) {
      console.error(chalk.red('Skill name produces an empty slug.'));
      console.error(chalk.dim('Please pass --name with letters or numbers.'));
      return 1;
    }

    const skillEntry = {
      id: `${repoInfo.owner}/${repoInfo.repo}/${skillSlug}`,
      name: this.formatName(skillName),
      description: frontmatter.description || `Best practices for ${this.formatName(skillName)}`,
      source: `${repoInfo.owner}/${repoInfo.repo}`,
      tags: frontmatter.tags || ['general'],
    };

    console.log(chalk.white('Skill details:'));
    console.log(chalk.dim(`  ID: ${skillEntry.id}`));
    console.log(chalk.dim(`  Name: ${skillEntry.name}`));
    console.log(chalk.dim(`  Description: ${skillEntry.description}`));
    console.log(chalk.dim(`  Source: ${skillEntry.source}`));
    console.log(chalk.dim(`  Tags: ${skillEntry.tags.join(', ')}`));
    console.log();

    if (this.dryRun) {
      console.log(chalk.yellow('Dry run - not submitting'));
      console.log(JSON.stringify(skillEntry, null, 2));
      return 0;
    }

    const issueBody = this.createIssueBody(skillEntry);
    const issueTitle = encodeURIComponent(`[Publish] ${skillEntry.name}`);
    const issueBodyEncoded = encodeURIComponent(issueBody);
    const issueUrl = `https://github.com/rohitg00/skillkit/issues/new?title=${issueTitle}&body=${issueBodyEncoded}&labels=skill-submission,publish`;

    console.log(chalk.green('Opening GitHub to submit your skill...\n'));

    try {
      const { execSync } = await import('node:child_process');
      const openCmd =
        process.platform === 'darwin'
          ? `open "${issueUrl}"`
          : process.platform === 'win32'
            ? `cmd /c start "" "${issueUrl}"`
            : `xdg-open "${issueUrl}"`;
      execSync(openCmd, { stdio: 'ignore' });

      console.log(chalk.green('GitHub issue page opened!'));
      console.log(chalk.dim('Review and submit the issue.'));
    } catch {
      console.log(chalk.yellow('Could not open browser automatically.'));
      console.log(chalk.dim('Please open this URL manually:\n'));
      console.log(chalk.cyan(issueUrl));
    }

    return 0;
  }

  private findSkillMd(basePath: string): string | null {
    if (basePath.endsWith('SKILL.md') && existsSync(basePath)) {
      return basePath;
    }

    const direct = join(basePath, 'SKILL.md');
    if (existsSync(direct)) {
      return direct;
    }

    const locations = [
      join(basePath, 'skills', 'SKILL.md'),
      join(basePath, '.claude', 'skills', 'SKILL.md'),
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

    for (const line of lines) {
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
          if (value.startsWith('[')) {
            frontmatter.tags = value
              .slice(1, -1)
              .split(',')
              .map(t => t.trim().replace(/^["']|["']$/g, ''))
              .filter(t => t.length > 0);
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
      const { execSync } = require('node:child_process');
      const remote = execSync('git remote get-url origin', {
        cwd: dir,
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'ignore'],
      }).trim();

      const match = remote.match(/github\.com[:/]([^/]+)\/(.+?)(?:\.git)?$/);
      if (match) {
        return { owner: match[1], repo: match[2] };
      }
    } catch {
      // Not a git repo
    }

    return null;
  }

  private formatName(name: string): string {
    return name
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
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
Submitted via \`skillkit publish submit\``;
  }
}
