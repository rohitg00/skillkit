import type { Skill, AgentType } from '../core/types.js';

export interface AgentAdapter {
  
  readonly type: AgentType;

  readonly name: string;

  readonly skillsDir: string;

  readonly configFile: string;

  generateConfig(skills: Skill[]): string;

  parseConfig(content: string): string[];

  getInvokeCommand(skillName: string): string;

  isDetected(): Promise<boolean>;
}

export function createSkillXml(skill: Skill): string {
  return `<skill>
<name>${skill.name}</name>
<description>${escapeXml(skill.description)}</description>
<location>${skill.location}</location>
</skill>`;
}

export function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
