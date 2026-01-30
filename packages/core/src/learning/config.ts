import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { homedir } from 'node:os';
import yaml from 'yaml';

import type { LearningConfig, PatternStore, LearnedPattern, EvolvingPattern } from './types.js';
import { DEFAULT_LEARNING_CONFIG } from './types.js';

export function getDefaultConfigPath(): string {
  return join(homedir(), '.skillkit', 'learning.yaml');
}

export function getDefaultStorePath(): string {
  return join(homedir(), '.skillkit', 'learned', 'patterns.json');
}

export function loadLearningConfig(configPath?: string): LearningConfig {
  const path = configPath || getDefaultConfigPath();

  if (!existsSync(path)) {
    return DEFAULT_LEARNING_CONFIG;
  }

  try {
    const content = readFileSync(path, 'utf-8');
    const config = yaml.parse(content);
    return { ...DEFAULT_LEARNING_CONFIG, ...config };
  } catch {
    return DEFAULT_LEARNING_CONFIG;
  }
}

export function saveLearningConfig(config: LearningConfig, configPath?: string): void {
  const path = configPath || getDefaultConfigPath();
  const dir = dirname(path);

  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  const content = yaml.stringify(config);
  writeFileSync(path, content);
}

export function loadPatternStore(storePath?: string): PatternStore {
  const path = storePath || getDefaultStorePath();

  if (!existsSync(path)) {
    return {
      version: 1,
      updatedAt: new Date().toISOString(),
      patterns: [],
      evolvingPatterns: [],
    };
  }

  try {
    const content = readFileSync(path, 'utf-8');
    return JSON.parse(content);
  } catch {
    return {
      version: 1,
      updatedAt: new Date().toISOString(),
      patterns: [],
      evolvingPatterns: [],
    };
  }
}

export function savePatternStore(store: PatternStore, storePath?: string): void {
  const path = storePath || getDefaultStorePath();
  const dir = dirname(path);

  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  store.updatedAt = new Date().toISOString();
  const content = JSON.stringify(store, null, 2);
  writeFileSync(path, content);
}

export function addPattern(
  pattern: LearnedPattern,
  storePath?: string
): PatternStore {
  const store = loadPatternStore(storePath);

  const existingIndex = store.patterns.findIndex(p => p.id === pattern.id);
  if (existingIndex >= 0) {
    store.patterns[existingIndex] = pattern;
  } else {
    store.patterns.push(pattern);
  }

  savePatternStore(store, storePath);
  return store;
}

export function removePattern(patternId: string, storePath?: string): PatternStore {
  const store = loadPatternStore(storePath);
  store.patterns = store.patterns.filter(p => p.id !== patternId);
  store.evolvingPatterns = store.evolvingPatterns.filter(p => p.id !== patternId);
  savePatternStore(store, storePath);
  return store;
}

export function getPattern(patternId: string, storePath?: string): LearnedPattern | null {
  const store = loadPatternStore(storePath);
  return store.patterns.find(p => p.id === patternId) || null;
}

export function getEvolvingPattern(patternId: string, storePath?: string): EvolvingPattern | null {
  const store = loadPatternStore(storePath);
  return store.evolvingPatterns.find(p => p.id === patternId) || null;
}

export function getAllPatterns(storePath?: string): LearnedPattern[] {
  const store = loadPatternStore(storePath);
  return store.patterns;
}

export function getPatternsByCategory(
  category: string,
  storePath?: string
): LearnedPattern[] {
  const store = loadPatternStore(storePath);
  return store.patterns.filter(p => p.category === category);
}

export function getApprovedPatterns(storePath?: string): LearnedPattern[] {
  const store = loadPatternStore(storePath);
  return store.patterns.filter(p => p.approved);
}
