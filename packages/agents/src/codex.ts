import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import type { AgentAdapter } from './base.js';
import type { Skill, AgentType } from '@skillkit/core';
import { AGENT_CONFIG } from '@skillkit/core';

const config = AGENT_CONFIG.codex;

export class CodexAdapter implements AgentAdapter {
  readonly type: AgentType = 'codex';
  readonly name = 'OpenAI Codex CLI';
  readonly skillsDir = config.skillsDir;
  readonly configFile = config.configFile;

  generateConfig(skills: Skill[]): string {
    const enabledSkills = skills.filter(s => s.enabled);

    if (enabledSkills.length === 0) {
      return '';
    }

    const skillsList = enabledSkills
      .map(s => `| ${s.name} | ${s.description} | \`skillkit read ${s.name}\` |`)
      .join('\n');

    return `# Skills

You have access to specialized skills for completing complex tasks.

| Skill | Description | Command |
|-------|-------------|---------|
${skillsList}

## Usage

When a task matches a skill's capability, run the command to load detailed instructions:

\`\`\`bash
skillkit read <skill-name>
\`\`\`

Skills are loaded on-demand to keep context clean. Only load skills when relevant to the current task.
`;
  }

  parseConfig(content: string): string[] {
    const skillNames: string[] = [];
    const tableRegex = /^\|\s*([a-z0-9-]+)\s*\|/gm;
    let match;

    while ((match = tableRegex.exec(content)) !== null) {
      const name = match[1].trim();
      if (name && name !== 'Skill' && name !== '-------') {
        skillNames.push(name);
      }
    }

    return skillNames;
  }

  getInvokeCommand(skillName: string): string {
    return `skillkit read ${skillName}`;
  }

  async isDetected(): Promise<boolean> {
    const codexDir = join(process.cwd(), '.codex');
    const globalCodex = join(homedir(), '.codex');

    return existsSync(codexDir) || existsSync(globalCodex);
  }
}
