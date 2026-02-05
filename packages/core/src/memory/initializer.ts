import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

export interface MemoryPaths {
  projectMemoryDir: string;
  globalMemoryDir: string;
  observationsFile: string;
  learningsFile: string;
  indexFile: string;
  globalLearningsFile: string;
  globalIndexFile: string;
}

export function getMemoryPaths(projectPath: string): MemoryPaths {
  const projectMemoryDir = join(projectPath, '.skillkit', 'memory');
  const globalMemoryDir = join(homedir(), '.skillkit', 'memory');

  return {
    projectMemoryDir,
    globalMemoryDir,
    observationsFile: join(projectMemoryDir, 'observations.yaml'),
    learningsFile: join(projectMemoryDir, 'learnings.yaml'),
    indexFile: join(projectMemoryDir, 'index.yaml'),
    globalLearningsFile: join(globalMemoryDir, 'global.yaml'),
    globalIndexFile: join(globalMemoryDir, 'index.yaml'),
  };
}

export function initializeMemoryDirectory(projectPath: string): MemoryPaths {
  const paths = getMemoryPaths(projectPath);

  if (!existsSync(paths.projectMemoryDir)) {
    mkdirSync(paths.projectMemoryDir, { recursive: true });
  }

  if (!existsSync(paths.globalMemoryDir)) {
    mkdirSync(paths.globalMemoryDir, { recursive: true });
  }

  return paths;
}

export function memoryDirectoryExists(projectPath: string): boolean {
  const paths = getMemoryPaths(projectPath);
  return existsSync(paths.projectMemoryDir);
}

export function globalMemoryDirectoryExists(): boolean {
  const globalMemoryDir = join(homedir(), '.skillkit', 'memory');
  return existsSync(globalMemoryDir);
}

export interface MemoryStatus {
  projectMemoryExists: boolean;
  globalMemoryExists: boolean;
  hasObservations: boolean;
  hasLearnings: boolean;
  hasGlobalLearnings: boolean;
  hasIndex: boolean;
  hasGlobalIndex: boolean;
}

export function getMemoryStatus(projectPath: string): MemoryStatus {
  const paths = getMemoryPaths(projectPath);

  return {
    projectMemoryExists: existsSync(paths.projectMemoryDir),
    globalMemoryExists: existsSync(paths.globalMemoryDir),
    hasObservations: existsSync(paths.observationsFile),
    hasLearnings: existsSync(paths.learningsFile),
    hasGlobalLearnings: existsSync(paths.globalLearningsFile),
    hasIndex: existsSync(paths.indexFile),
    hasGlobalIndex: existsSync(paths.globalIndexFile),
  };
}
