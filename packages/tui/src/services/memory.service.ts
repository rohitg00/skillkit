export interface MemoryEntry {
  key: string;
  type: 'index' | 'learning' | 'observation';
  size: string;
  updated: string;
}

export interface MemoryServiceState {
  entries: MemoryEntry[];
  status: { projectMemoryExists: boolean; globalMemoryExists: boolean } | null;
  paths: { projectMemoryDir: string; globalMemoryDir: string } | null;
  loading: boolean;
  error: string | null;
}

export async function loadMemories(): Promise<MemoryServiceState> {
  return {
    entries: [],
    status: { projectMemoryExists: false, globalMemoryExists: true },
    paths: { projectMemoryDir: '.skillkit/memory', globalMemoryDir: '~/.skillkit/memory' },
    loading: false,
    error: null,
  };
}

export async function deleteMemoryEntry(_key: string): Promise<boolean> {
  return true;
}

export async function clearMemory(_path?: string, _scope?: string): Promise<boolean> {
  return true;
}

export async function initializeMemory(): Promise<boolean> {
  return true;
}

export const memoryService = {
  loadMemories,
  deleteMemoryEntry,
  clearMemory,
  initializeMemory,
};
