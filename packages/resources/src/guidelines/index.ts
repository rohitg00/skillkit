import { BUILTIN_GUIDELINES, GUIDELINE_MANIFEST } from './manifest.js';
import type { Guideline, GuidelineCategory, GuidelineManifest } from './types.js';

export type { Guideline, GuidelineCategory, GuidelineManifest };
export { BUILTIN_GUIDELINES, GUIDELINE_MANIFEST };

export function getBuiltinGuidelines(): Guideline[] {
  return BUILTIN_GUIDELINES;
}

export function getBuiltinGuideline(id: string): Guideline | null {
  return BUILTIN_GUIDELINES.find(g => g.id === id) || null;
}

export function getGuidelinesByCategory(category: GuidelineCategory): Guideline[] {
  return BUILTIN_GUIDELINES.filter(g => g.category === category);
}

export function getGuidelineIds(): string[] {
  return BUILTIN_GUIDELINES.map(g => g.id);
}

export function getGuidelineContent(id: string): string | null {
  const guideline = getBuiltinGuideline(id);
  return guideline?.content || null;
}

export function getEnabledGuidelines(): Guideline[] {
  return BUILTIN_GUIDELINES.filter(g => g.enabled);
}

export function getGuidelinesSortedByPriority(): Guideline[] {
  return [...BUILTIN_GUIDELINES].sort((a, b) => b.priority - a.priority);
}
