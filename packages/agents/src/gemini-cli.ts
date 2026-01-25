import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import type { AgentAdapter } from './base.js';
import type { Skill, AgentType } from '@skillkit/core';
import { AGENT_CONFIG } from '@skillkit/core';

const config = AGENT_CONFIG['gemini-cli'];

export class GeminiCliAdapter implements AgentAdapter {
  readonly type: AgentType = 'gemini-cli';
  readonly name = 'Gemini CLI';
  readonly skillsDir = config.skillsDir;
  readonly configFile = config.configFile;

  generateConfig(skills: Skill[]): string {
    const enabledSkills = skills.filter(s => s.enabled);

    if (enabledSkills.length === 0) {
      return '';
    }

    const skillsJson = enabledSkills.map(s => ({
      name: s.name,
      description: s.description,
      invoke: `skillkit read ${s.name}`,
      location: s.location,
    }));

    return `# Skills Configuration

You have access to specialized skills that extend your capabilities.

## Available Skills

${enabledSkills.map(s => `### ${s.name}\n${s.description}\n\nInvoke: \`skillkit read ${s.name}\``).join('\n\n')}

## Skills Data

\`\`\`json
${JSON.stringify(skillsJson, null, 2)}
\`\`\`

## Usage Instructions

1. When a task matches a skill's description, load it using the invoke command
2. Skills provide step-by-step instructions for complex tasks
3. Each skill is self-contained with its own resources
`;
  }

  parseConfig(content: string): string[] {
    const skillNames: string[] = [];

    const jsonMatch = content.match(/```json\s*([\s\S]*?)```/);
    if (jsonMatch) {
      try {
        const skills = JSON.parse(jsonMatch[1]);
        if (Array.isArray(skills)) {
          skills.forEach(s => {
            if (s.name) skillNames.push(s.name);
          });
        }
      } catch {
        // Ignore parse errors
      }
    }

    if (skillNames.length === 0) {
      const headerRegex = /^###\s+(.+?)\s*$/gm;
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
    const geminiMd = join(process.cwd(), 'GEMINI.md');
    const geminiDir = join(process.cwd(), '.gemini');
    const globalGemini = join(homedir(), '.gemini');

    return existsSync(geminiMd) || existsSync(geminiDir) || existsSync(globalGemini);
  }
}
