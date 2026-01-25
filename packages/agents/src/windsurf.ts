import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import type { AgentAdapter } from './base.js';
import type { Skill, AgentType } from '@skillkit/core';
import { AGENT_CONFIG } from '@skillkit/core';

const config = AGENT_CONFIG.windsurf;

export class WindsurfAdapter implements AgentAdapter {
  readonly type: AgentType = 'windsurf';
  readonly name = 'Windsurf';
  readonly skillsDir = config.skillsDir;
  readonly configFile = config.configFile;

  generateConfig(skills: Skill[]): string {
    const enabledSkills = skills.filter(s => s.enabled);

    if (enabledSkills.length === 0) {
      return '';
    }

    const skillsList = enabledSkills
      .map(s => `### ${s.name}\n\n${s.description}\n\n**Invoke:** \`skillkit read ${s.name}\``)
      .join('\n\n');

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
    const projectWindsurf = join(process.cwd(), '.windsurf');
    const projectRulesDir = join(process.cwd(), '.windsurf', 'rules');
    const globalWindsurf = join(homedir(), '.codeium', 'windsurf');

    return existsSync(projectWindsurf) || existsSync(projectRulesDir) ||
           existsSync(globalWindsurf);
  }
}
