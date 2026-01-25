import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import type { AgentAdapter } from './base.js';
import { createSkillXml } from './base.js';
import type { Skill, AgentType } from '@skillkit/core';

export class KiloAdapter implements AgentAdapter {
  readonly type: AgentType = 'kilo';
  readonly name = 'Kilo Code';
  readonly skillsDir = '.kilocode/skills';
  readonly configFile = 'AGENTS.md';

  generateConfig(skills: Skill[]): string {
    const enabledSkills = skills.filter(s => s.enabled);

    if (enabledSkills.length === 0) {
      return '';
    }

    const skillsXml = enabledSkills.map(createSkillXml).join('\n\n');

    return `<skills_system priority="1">

## Available Skills

<!-- SKILLS_TABLE_START -->
<usage>
When users ask you to perform tasks, check if any of the available skills below can help complete the task more effectively. Skills provide specialized capabilities and domain knowledge.

How to use skills:
- Invoke: \`skillkit read <skill-name>\` or \`npx skillkit read <skill-name>\`
- The skill content will load with detailed instructions on how to complete the task
- Base directory provided in output for resolving bundled resources (references/, scripts/, assets/)

Usage notes:
- Only use skills listed in <available_skills> below
- Do not invoke a skill that is already loaded in your context
- Each skill invocation is stateless
</usage>

<available_skills>

${skillsXml}

</available_skills>
<!-- SKILLS_TABLE_END -->

</skills_system>`;
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
    const projectKilo = join(process.cwd(), '.kilocode');
    const globalKilo = join(homedir(), '.kilocode');
    const agentsMd = join(process.cwd(), 'AGENTS.md');
    const kiloModes = join(process.cwd(), '.kilocode', 'modes');

    return existsSync(projectKilo) || existsSync(globalKilo) ||
           existsSync(agentsMd) || existsSync(kiloModes);
  }
}
