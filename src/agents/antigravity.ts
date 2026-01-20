import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import type { AgentAdapter } from './base.js';
import type { Skill, AgentType } from '../core/types.js';

export class AntigravityAdapter implements AgentAdapter {
  readonly type: AgentType = 'antigravity';
  readonly name = 'Antigravity';
  readonly skillsDir = '.antigravity/skills';
  readonly configFile = 'AGENTS.md';

  generateConfig(skills: Skill[]): string {
    const enabledSkills = skills.filter(s => s.enabled);

    if (enabledSkills.length === 0) {
      return '';
    }

    const skillsYaml = enabledSkills
      .map(s => `  - name: ${s.name}\n    description: "${s.description}"\n    invoke: skillkit read ${s.name}`)
      .join('\n');

    return `# Antigravity Skills Configuration

<!-- skills:
${skillsYaml}
-->

## Available Skills

${enabledSkills.map(s => `### ${s.name}

${s.description}

**Usage:** \`skillkit read ${s.name}\`
`).join('\n')}

## How Skills Work

1. Skills provide specialized knowledge for specific tasks
2. Load a skill when the current task matches its description
3. Skills are loaded on-demand to preserve context window
`;
  }

  parseConfig(content: string): string[] {
    const skillNames: string[] = [];

    const yamlMatch = content.match(/<!-- skills:\s*([\s\S]*?)-->/);
    if (yamlMatch) {
      const nameRegex = /name:\s*([a-z0-9-]+)/g;
      let match;
      while ((match = nameRegex.exec(yamlMatch[1])) !== null) {
        skillNames.push(match[1].trim());
      }
    }

    if (skillNames.length === 0) {
      const headerRegex = /^### ([a-z0-9-]+)$/gm;
      let match;
      while ((match = headerRegex.exec(content)) !== null) {
        skillNames.push(match[1].trim());
      }
    }

    return skillNames;
  }

  getInvokeCommand(skillName: string): string {
    return `skillkit read ${skillName}`;
  }

  async isDetected(): Promise<boolean> {
    const agDir = join(process.cwd(), '.antigravity');
    const globalAg = join(homedir(), '.antigravity');

    return existsSync(agDir) || existsSync(globalAg);
  }
}
