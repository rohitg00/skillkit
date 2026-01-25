import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import type { AgentAdapter } from './base.js';
import { createSkillXml } from './base.js';
import type { Skill, AgentType } from '@skillkit/core';

export class CursorAdapter implements AgentAdapter {
  readonly type: AgentType = 'cursor';
  readonly name = 'Cursor';
  readonly skillsDir = '.cursor/skills';
  // 2026: Cursor uses .cursor/rules/*.mdc format (MDC with YAML frontmatter)
  readonly configFile = '.cursor/rules/skills.mdc';

  generateConfig(skills: Skill[]): string {
    const enabledSkills = skills.filter(s => s.enabled);

    if (enabledSkills.length === 0) {
      return '';
    }

    const skillsList = enabledSkills
      .map(s => `- **${s.name}**: ${s.description}`)
      .join('\n');

    const skillsXml = enabledSkills.map(createSkillXml).join('\n\n');

    // MDC format with YAML frontmatter (2026 standard)
    return `---
description: SkillKit skills integration - provides specialized capabilities and domain knowledge
globs: "**/*"
alwaysApply: true
---
# Skills System

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
    // 2026: Check for .cursor directory with rules subdirectory
    const cursorDir = join(process.cwd(), '.cursor');
    const cursorRulesDir = join(process.cwd(), '.cursor', 'rules');
    // Legacy .cursorrules file (deprecated but still supported)
    const cursorRulesFile = join(process.cwd(), '.cursorrules');
    // Global Cursor config
    const globalCursor = join(homedir(), '.cursor');

    return existsSync(cursorDir) || existsSync(cursorRulesDir) ||
           existsSync(cursorRulesFile) || existsSync(globalCursor);
  }
}
