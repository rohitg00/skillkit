import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ProjectDetector } from '../context/detector.js';
import { findAllSkills } from '../skills.js';
import type { Skill } from '../types.js';
import type { AgentsMdConfig, AgentsMdResult, AgentsMdSection } from './types.js';

function escapeTableCell(text: string): string {
  return text.replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

const MANAGED_START = '<!-- skillkit:managed:start -->';
const MANAGED_END = '<!-- skillkit:managed:end -->';

export class AgentsMdGenerator {
  private config: AgentsMdConfig;
  private detector: ProjectDetector;

  constructor(config: AgentsMdConfig) {
    this.config = config;
    this.detector = new ProjectDetector(config.projectPath);
  }

  generate(): AgentsMdResult {
    this.detector.analyze();

    const sections: AgentsMdSection[] = [];

    sections.push({
      id: 'project-overview',
      title: 'Project Overview',
      content: this.generateProjectSection(),
      managed: true,
    });

    sections.push({
      id: 'technology-stack',
      title: 'Technology Stack',
      content: this.generateStackSection(),
      managed: true,
    });

    if (this.config.includeSkills !== false) {
      const skillsContent = this.generateSkillsSection(findAllSkills([join(this.config.projectPath, 'skills')]));
      if (skillsContent) {
        sections.push({
          id: 'installed-skills',
          title: 'Installed Skills',
          content: skillsContent,
          managed: true,
        });
      }
    }

    if (this.config.includeBuildCommands !== false) {
      const buildContent = this.generateBuildSection();
      if (buildContent) {
        sections.push({
          id: 'build-test',
          title: 'Build & Test',
          content: buildContent,
          managed: true,
        });
      }
    }

    if (this.config.includeCodeStyle !== false) {
      const styleContent = this.generateCodeStyleSection();
      if (styleContent) {
        sections.push({
          id: 'code-style',
          title: 'Code Style',
          content: styleContent,
          managed: true,
        });
      }
    }

    const lines: string[] = ['# AGENTS.md', '', MANAGED_START];
    for (const section of sections) {
      lines.push(`## ${section.title}`);
      lines.push(section.content);
      lines.push('');
    }
    lines.push(MANAGED_END, '');

    const content = lines.join('\n');
    return {
      content,
      sections,
      path: join(this.config.projectPath, 'AGENTS.md'),
    };
  }

  generateSkillsSection(skills: Skill[]): string {
    if (skills.length === 0) {
      return '';
    }

    const lines: string[] = [
      '| Skill | Description | Tags |',
      '|-------|-------------|------|',
    ];

    for (const skill of skills) {
      const name = escapeTableCell(skill.name);
      const desc = escapeTableCell(skill.description);
      lines.push(`| ${name} | ${desc} | |`);
    }

    return lines.join('\n');
  }

  generateProjectSection(): string {
    const name = this.detector.getProjectName();
    const description = this.detector.getProjectDescription();
    const projectType = this.detector.detectProjectType();

    const lines: string[] = [];
    lines.push(`- **Name**: ${name}`);
    if (description) {
      lines.push(`- **Description**: ${description}`);
    }
    lines.push(`- **Type**: ${projectType}`);

    return lines.join('\n');
  }

  generateBuildSection(): string {
    const packageJsonPath = join(this.config.projectPath, 'package.json');
    if (!existsSync(packageJsonPath)) {
      return '';
    }

    try {
      const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
      const scripts = pkg.scripts as Record<string, string> | undefined;
      if (!scripts || Object.keys(scripts).length === 0) {
        return '';
      }

      const relevantScripts = ['build', 'dev', 'start', 'test', 'lint', 'format', 'typecheck', 'check'];
      const lines: string[] = ['```bash'];

      for (const key of relevantScripts) {
        if (scripts[key]) {
          lines.push(`# ${key}`);
          lines.push(scripts[key]);
          lines.push('');
        }
      }

      if (lines.length === 1) {
        return '';
      }

      lines.push('```');
      return lines.join('\n');
    } catch {
      return '';
    }
  }

  generateCodeStyleSection(): string {
    const patterns = this.detector.detectPatterns();
    const lines: string[] = [];

    if (patterns.linting) {
      lines.push(`- **Linting**: ${patterns.linting}`);
    }
    if (patterns.formatting) {
      lines.push(`- **Formatting**: ${patterns.formatting}`);
    }
    if (patterns.testing) {
      lines.push(`- **Testing**: ${patterns.testing}`);
    }
    if (patterns.styling) {
      lines.push(`- **Styling**: ${patterns.styling}`);
    }

    return lines.length > 0 ? lines.join('\n') : '';
  }

  private generateStackSection(): string {
    const stack = this.detector.analyze();
    const lines: string[] = [];

    if (stack.languages.length > 0) {
      lines.push(`- **Languages**: ${stack.languages.map(l => l.version ? `${l.name} ${l.version}` : l.name).join(', ')}`);
    }
    if (stack.frameworks.length > 0) {
      lines.push(`- **Frameworks**: ${stack.frameworks.map(f => f.version ? `${f.name} ${f.version}` : f.name).join(', ')}`);
    }
    if (stack.libraries.length > 0) {
      lines.push(`- **Libraries**: ${stack.libraries.map(l => l.name).join(', ')}`);
    }
    if (stack.databases.length > 0) {
      lines.push(`- **Databases**: ${stack.databases.map(d => d.name).join(', ')}`);
    }
    if (stack.runtime.length > 0) {
      lines.push(`- **Runtime**: ${stack.runtime.map(r => r.version ? `${r.name} ${r.version}` : r.name).join(', ')}`);
    }

    return lines.length > 0 ? lines.join('\n') : 'No technology stack detected.';
  }
}
