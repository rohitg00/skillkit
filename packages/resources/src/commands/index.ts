import { COMMAND_TEMPLATES, COMMAND_MANIFEST } from './manifest.js';
import type { CommandTemplate, CommandCategory, CommandManifest } from './types.js';

export type { CommandTemplate, CommandCategory, CommandManifest };
export { COMMAND_TEMPLATES, COMMAND_MANIFEST };

export function getCommandTemplates(): CommandTemplate[] {
  return COMMAND_TEMPLATES;
}

export function getCommandTemplate(id: string): CommandTemplate | null {
  return COMMAND_TEMPLATES.find(c => c.id === id) || null;
}

export function getCommandByTrigger(trigger: string): CommandTemplate | null {
  const normalizedTrigger = trigger.startsWith('/') ? trigger : `/${trigger}`;
  return COMMAND_TEMPLATES.find(c => c.trigger === normalizedTrigger) || null;
}

export function getCommandTemplatesByCategory(category: CommandCategory): CommandTemplate[] {
  return COMMAND_TEMPLATES.filter(c => c.category === category);
}

export function getCommandTemplateIds(): string[] {
  return COMMAND_TEMPLATES.map(c => c.id);
}

export function getCommandTriggers(): string[] {
  return COMMAND_TEMPLATES.map(c => c.trigger);
}
