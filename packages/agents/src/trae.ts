import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import type { AgentAdapter } from './base.js';
import type { Skill, AgentType } from '@skillkit/core';

export class TraeAdapter implements AgentAdapter {
  readonly type: AgentType = 'trae';
  readonly name = 'Trae';
  readonly skillsDir = '.trae/skills';
  readonly configFile = '.trae/rules/project_rules.md';

  generateConfig(skills: Skill[]): string {
    const enabledSkills = skills.filter(s => s.enabled);

    if (enabledSkills.length === 0) {
      return '';
    }

    const skillsList = enabledSkills
      .map(s => `### ${s.name}\n\n${s.description}\n\n**Invoke:** \`skillkit read ${s.name}\``)
      .join('\n\n');

    return `---
alwaysApply: true
description: SkillKit skills integration for Trae
globs: ["**/*"]
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
`;
  }

  parseConfig(content: string): string[] {
    const skillNames: string[] = [];
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
    const projectTrae = join(process.cwd(), '.trae');
    const traeRulesDir = join(process.cwd(), '.trae', 'rules');
    const globalTrae = join(homedir(), '.trae');
    const agentsMd = join(process.cwd(), 'AGENTS.md');

    return existsSync(projectTrae) || existsSync(traeRulesDir) ||
           existsSync(globalTrae) || existsSync(agentsMd);
  }
}
