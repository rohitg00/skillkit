import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import type { AgentAdapter } from './base.js';
import { createSkillXml } from './base.js';
import type { Skill, AgentType } from '@skillkit/core';
import { AGENT_CONFIG } from '@skillkit/core';

const config = AGENT_CONFIG.opencode;

export class OpenCodeAdapter implements AgentAdapter {
  readonly type: AgentType = 'opencode';
  readonly name = 'OpenCode';
  readonly skillsDir = config.skillsDir;
  readonly configFile = config.configFile;

  generateConfig(skills: Skill[]): string {
    const enabledSkills = skills.filter(s => s.enabled);

    if (enabledSkills.length === 0) {
      return '';
    }

    const skillsXml = enabledSkills.map(createSkillXml).join('\n\n');

    return `<!-- SKILLKIT_START -->
# Skills

The following skills are available to help complete tasks:

<skills>
${skillsXml}
</skills>

## How to Use

When a task matches a skill's description:

\`\`\`bash
skillkit read <skill-name>
\`\`\`

This loads the skill's instructions into context.

<!-- SKILLKIT_END -->`;
  }

  parseConfig(content: string): string[] {
    const skillNames: string[] = [];
    const skillRegex = /<name>([^<]+)<\/name>/g;
    let match;

    while ((match = skillRegex.exec(content)) !== null) {
      skillNames.push(match[1].trim());
    }

    return skillNames;
  }

  getInvokeCommand(skillName: string): string {
    return `skillkit read ${skillName}`;
  }

  async isDetected(): Promise<boolean> {
    const opencodeDir = join(process.cwd(), '.opencode');
    const globalOpencode = join(homedir(), '.config', 'opencode');
    const opencodeJson = join(process.cwd(), 'opencode.json');

    return existsSync(opencodeDir) || existsSync(globalOpencode) ||
           existsSync(opencodeJson);
  }
}
