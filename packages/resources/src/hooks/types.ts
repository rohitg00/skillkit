export type HookTemplateCategory = 'security' | 'quality' | 'workflow' | 'productivity';

export type HookEvent =
  | 'session:start'
  | 'session:resume'
  | 'session:end'
  | 'file:open'
  | 'file:save'
  | 'file:create'
  | 'file:delete'
  | 'task:start'
  | 'task:complete'
  | 'commit:pre'
  | 'commit:post'
  | 'error:occur'
  | 'test:fail'
  | 'test:pass'
  | 'build:start'
  | 'build:fail'
  | 'build:success';

export interface HookTemplate {
  id: string;
  name: string;
  description: string;
  category: HookTemplateCategory;
  event: HookEvent;
  matcher?: string;
  command: string;
  timeout?: number;
  blocking?: boolean;
  variables?: Record<string, string>;
}

export interface HookTemplateManifest {
  version: number;
  templates: HookTemplate[];
}
