import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import type { AgentAdapter } from './base.js';
import { createSkillXml } from './base.js';
import type { Skill, AgentType } from '@skillkit/core';
import { AGENT_CONFIG } from '@skillkit/core';

const config = AGENT_CONFIG.openclaw;

/**
 * OpenClaw Agent Adapter
 *
 * OpenClaw (formerly Clawdbot) is a local-first AI agent framework with a
 * persistent gateway daemon. Skills use an extended YAML frontmatter schema
 * with `permissions`, `triggers`, and `metadata.openclaw.requires` fields.
 *
 * Key differences from Claude Code:
 * - Skills dir: `skills/` (not `.claude/skills/`)
 * - Global skills: `~/.openclaw/skills/`
 * - Config: `~/.openclaw/openclaw.json`
 * - SKILL.md frontmatter includes: permissions, triggers, metadata.openclaw
 * - Gateway loads skills contextually per-agent at runtime
 * - Skills are organized by department: skills/<dept>/<name>/SKILL.md
 */
export class OpenClawAdapter implements AgentAdapter {
  readonly type: AgentType = 'openclaw';
  readonly name = 'OpenClaw';
  readonly skillsDir = config.skillsDir;
  readonly configFile = config.configFile;

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
    // OpenClaw workspace: skills/ dir at project root
    const projectSkills = join(process.cwd(), 'skills');
    // OpenClaw global config
    const globalOpenClaw = join(homedir(), '.openclaw');
    // OpenClaw config file
    const openclawConfig = join(process.cwd(), 'openclaw.json');

    return (
      (existsSync(projectSkills) && existsSync(globalOpenClaw)) ||
      existsSync(openclawConfig)
    );
  }
}
