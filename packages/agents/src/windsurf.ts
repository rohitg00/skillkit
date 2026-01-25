import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import type { AgentAdapter } from './base.js';
import type { Skill, AgentType } from '@skillkit/core';

export class WindsurfAdapter implements AgentAdapter {
  readonly type: AgentType = 'windsurf';
  readonly name = 'Windsurf';
  readonly skillsDir = '.windsurf/skills';
  // 2026: Windsurf uses .windsurf/rules/*.md format with YAML frontmatter
  readonly configFile = '.windsurf/rules/skills.md';

  generateConfig(skills: Skill[]): string {
    const enabledSkills = skills.filter(s => s.enabled);

    if (enabledSkills.length === 0) {
      return '';
    }

    const skillsList = enabledSkills
      .map(s => `### ${s.name}\n\n${s.description}\n\n**Invoke:** \`skillkit read ${s.name}\``)
      .join('\n\n');

    // Windsurf uses Markdown rules with YAML frontmatter (2026 standard)
    // Mode: "always-on" | "model-decision" | "manual"
    return `---
name: "skillkit-skills"
mode: "model-decision"
---
# Skills System

You have access to specialized skills that can help complete tasks.
When a task matches a skill's description, load it using the skillkit CLI.

## Available Skills

${skillsList}

## How to Use Skills

When a task matches a skill's description, load it:

\`\`\`bash
skillkit read <skill-name>
\`\`\`

Skills provide detailed instructions for completing complex tasks.
Each skill is self-contained with its own resources.
`;
  }

  parseConfig(content: string): string[] {
    const skillNames: string[] = [];
    // Parse from ### headers
    const headerRegex = /^### ([a-z0-9-]+)$/gm;
    let match;

    while ((match = headerRegex.exec(content)) !== null) {
      skillNames.push(match[1].trim());
    }

    return skillNames;
  }

  getInvokeCommand(skillName: string): string {
    return `skillkit read ${skillName}`;
  }

  async isDetected(): Promise<boolean> {
    // 2026: Check project and global paths
    const projectWindsurf = join(process.cwd(), '.windsurf');
    const projectRulesDir = join(process.cwd(), '.windsurf', 'rules');
    // Global Windsurf config (Codeium)
    const globalWindsurf = join(homedir(), '.codeium', 'windsurf');

    return existsSync(projectWindsurf) || existsSync(projectRulesDir) ||
           existsSync(globalWindsurf);
  }
}
