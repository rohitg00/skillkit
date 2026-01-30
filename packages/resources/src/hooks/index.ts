import { HOOK_TEMPLATES, HOOK_TEMPLATE_MANIFEST } from './manifest.js';
import type {
  HookTemplate,
  HookTemplateCategory,
  HookEvent,
  HookTemplateManifest,
} from './types.js';

export type { HookTemplate, HookTemplateCategory, HookEvent, HookTemplateManifest };
export { HOOK_TEMPLATES, HOOK_TEMPLATE_MANIFEST };

export function getHookTemplates(): HookTemplate[] {
  return HOOK_TEMPLATES;
}

export function getHookTemplate(id: string): HookTemplate | null {
  return HOOK_TEMPLATES.find(t => t.id === id) || null;
}

export function getHookTemplatesByCategory(category: HookTemplateCategory): HookTemplate[] {
  return HOOK_TEMPLATES.filter(t => t.category === category);
}

export function getHookTemplatesByEvent(event: HookEvent): HookTemplate[] {
  return HOOK_TEMPLATES.filter(t => t.event === event);
}

export function getHookTemplateIds(): string[] {
  return HOOK_TEMPLATES.map(t => t.id);
}

export function formatHookCommand(template: HookTemplate, variables?: Record<string, string>): string {
  let command = template.command;
  const vars = { ...template.variables, ...variables };

  for (const [key, value] of Object.entries(vars)) {
    command = command.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
  }

  return command;
}
