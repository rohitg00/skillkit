import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { AgentAdapter } from './base.js';
import { createSkillXml } from './base.js';
import type { Skill, AgentType } from '@skillkit/core';
import { AGENT_CONFIG } from '@skillkit/core';

const config = AGENT_CONFIG.universal;

export class UniversalAdapter implements AgentAdapter {
  readonly type: AgentType = 'universal';
  readonly name = 'Universal (Any Agent)';
  readonly skillsDir = config.skillsDir;
  readonly configFile = config.configFile;

  generateConfig(skills: Skill[]): string {
    const enabledSkills = skills.filter(s => s.enabled);

    if (enabledSkills.length === 0) {
      return '';
    }

    const skillsXml = enabledSkills.map(createSkillXml).join('\n\n');
    const skillsList = enabledSkills
      .map(s => `- **${s.name}**: ${s.description}`)
      .join('\n');

    return `# Skills System

<!-- SKILLKIT_SKILLS_START -->

## Available Skills

${skillsList}

## How to Use Skills

When a task matches one of the available skills, load it to get detailed instructions:

\`\`\`bash
skillkit read <skill-name>
\`\`\`

Or with npx:

\`\`\`bash
npx skillkit read <skill-name>
\`\`\`

## Skills Data

<skills_system>
<usage>
Skills provide specialized capabilities and domain knowledge.
- Invoke: \`skillkit read <skill-name>\`
- Base directory provided in output for resolving resources
- Only use skills listed below
- Each invocation is stateless
</usage>

<available_skills>

${skillsXml}

</available_skills>
</skills_system>

<!-- SKILLKIT_SKILLS_END -->
`;
  }

  parseConfig(content: string): string[] {
    const skillNames: string[] = [];

    const skillRegex = /<name>([^<]+)<\/name>/g;
    let match;
    while ((match = skillRegex.exec(content)) !== null) {
      skillNames.push(match[1].trim());
    }

    if (skillNames.length === 0) {
      const listRegex = /^- \*\*([a-z0-9-]+)\*\*:/gm;
      while ((match = listRegex.exec(content)) !== null) {
        skillNames.push(match[1].trim());
      }
    }

    return skillNames;
  }

  getInvokeCommand(skillName: string): string {
    return `skillkit read ${skillName}`;
  }

  async isDetected(): Promise<boolean> {
    const agentDir = join(process.cwd(), '.agent');
    const agentsMd = join(process.cwd(), 'AGENTS.md');

    return existsSync(agentDir) || existsSync(agentsMd);
  }
}
