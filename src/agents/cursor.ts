import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { AgentAdapter } from './base.js';
import { createSkillXml } from './base.js';
import type { Skill, AgentType } from '../core/types.js';

export class CursorAdapter implements AgentAdapter {
  readonly type: AgentType = 'cursor';
  readonly name = 'Cursor';
  readonly skillsDir = '.cursor/skills';
  readonly configFile = '.cursorrules';

  generateConfig(skills: Skill[]): string {
    const enabledSkills = skills.filter(s => s.enabled);

    if (enabledSkills.length === 0) {
      return '';
    }

    const skillsList = enabledSkills
      .map(s => `- **${s.name}**: ${s.description}`)
      .join('\n');

    const skillsXml = enabledSkills.map(createSkillXml).join('\n\n');

    return `# Skills System

You have access to specialized skills that can help complete tasks. Use the skillkit CLI to load skill instructions when needed.

## Available Skills

${skillsList}

## How to Use Skills

When a task matches a skill's description, load it with:
\`\`\`bash
skillkit read <skill-name>
\`\`\`

The skill will provide detailed instructions for completing the task.

<!-- SKILLS_DATA_START -->
${skillsXml}
<!-- SKILLS_DATA_END -->
`;
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
    const cursorRules = join(process.cwd(), '.cursorrules');
    const cursorDir = join(process.cwd(), '.cursor');

    return existsSync(cursorRules) || existsSync(cursorDir);
  }
}
