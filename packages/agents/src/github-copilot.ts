import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import type { AgentAdapter } from './base.js';
import type { Skill, AgentType } from '@skillkit/core';
import { AGENT_CONFIG } from '@skillkit/core';

const config = AGENT_CONFIG['github-copilot'];

export class GitHubCopilotAdapter implements AgentAdapter {
  readonly type: AgentType = 'github-copilot';
  readonly name = 'GitHub Copilot';
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

    return `# Skills System

You have access to specialized skills that can help complete tasks.
Skills provide domain-specific knowledge and step-by-step instructions.

## Available Skills

${skillsList}

## How to Use Skills

When a task matches a skill's description, load it using the terminal:

\`\`\`bash
skillkit read <skill-name>
\`\`\`

The skill content will load with detailed instructions.
Each skill is self-contained with its own resources.
`;
  }

  parseConfig(content: string): string[] {
    const skillNames: string[] = [];
    const headerRegex = /^###\s+(.+?)\s*$/gm;
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
    const copilotInstructions = join(process.cwd(), '.github', 'copilot-instructions.md');
    const githubInstructions = join(process.cwd(), '.github', 'instructions');
    const globalCopilot = join(homedir(), '.copilot');

    return existsSync(copilotInstructions) ||
           existsSync(githubInstructions) || existsSync(globalCopilot);
  }
}
