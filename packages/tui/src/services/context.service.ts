export interface ContextDisplay {
  projectName: string;
  rootPath: string;
  languages: string[];
  frameworks: string[];
  libraries: string[];
  patterns: Record<string, unknown>;
  lastUpdated?: string;
}

export interface ContextServiceState {
  context: ContextDisplay | null;
  stack: unknown | null;
  loading: boolean;
  analyzing: boolean;
  error: string | null;
}

export async function loadProjectContext(): Promise<ContextServiceState> {
  return {
    context: {
      projectName: 'skillkit',
      rootPath: process.cwd(),
      languages: ['TypeScript', 'JavaScript'],
      frameworks: ['Solid.js', 'React'],
      libraries: ['@opentui/solid'],
      patterns: {},
      lastUpdated: new Date().toISOString(),
    },
    stack: null,
    loading: false,
    analyzing: false,
    error: null,
  };
}

export async function analyzeProjectContext(): Promise<ContextServiceState> {
  return loadProjectContext();
}

export async function refreshContext(): Promise<ContextServiceState> {
  return loadProjectContext();
}

export async function exportContext(_path?: string, _format?: string): Promise<boolean> {
  return true;
}

export async function getStackTags(): Promise<string[]> {
  return ['typescript', 'solid-js', 'cli'];
}

export const contextService = {
  loadProjectContext,
  analyzeProjectContext,
  refreshContext,
  exportContext,
  getStackTags,
};
