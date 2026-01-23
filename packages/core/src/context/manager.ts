import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import {
  type ProjectContext,
  type ProjectStack,
  type SkillPreferences,
  type AgentConfig,
  type ContextExportOptions,
  type ContextImportOptions,
  type Detection,
  ProjectContext as ProjectContextSchema,
  CONTEXT_FILE,
  CONTEXT_DIR,
} from './types.js';
import { ProjectDetector, getStackTags } from './detector.js';
import type { AgentType } from '../types.js';

/**
 * Context Manager
 *
 * Handles loading, saving, and managing project contexts.
 * The context is stored in .skillkit/context.yaml
 */
export class ContextManager {
  private projectPath: string;
  private context: ProjectContext | null = null;

  constructor(projectPath: string = process.cwd()) {
    this.projectPath = projectPath;
  }

  /**
   * Get the context file path
   */
  getContextPath(): string {
    return join(this.projectPath, CONTEXT_FILE);
  }

  /**
   * Check if context exists
   */
  exists(): boolean {
    return existsSync(this.getContextPath());
  }

  /**
   * Load context from file
   */
  load(): ProjectContext | null {
    const contextPath = this.getContextPath();

    if (!existsSync(contextPath)) {
      return null;
    }

    try {
      const content = readFileSync(contextPath, 'utf-8');
      const data = parseYaml(content);
      const parsed = ProjectContextSchema.safeParse(data);

      if (parsed.success) {
        this.context = parsed.data;
        return this.context;
      }

      // Return raw data if schema validation fails but file exists
      console.warn('Context file exists but failed schema validation');
      return null;
    } catch (error) {
      console.warn('Failed to load context:', error);
      return null;
    }
  }

  /**
   * Save context to file
   */
  save(context: ProjectContext): void {
    const contextPath = this.getContextPath();
    const contextDir = join(this.projectPath, CONTEXT_DIR);

    // Ensure directory exists
    if (!existsSync(contextDir)) {
      mkdirSync(contextDir, { recursive: true });
    }

    // Update timestamp
    context.updatedAt = new Date().toISOString();

    // Stringify with nice formatting
    const content = stringifyYaml(context, {
      lineWidth: 0,
      defaultKeyType: 'PLAIN',
    });

    writeFileSync(contextPath, content, 'utf-8');
    this.context = context;
  }

  /**
   * Initialize a new context from project detection
   */
  init(options: { force?: boolean; skipDetection?: boolean } = {}): ProjectContext {
    // Check if context already exists
    if (this.exists() && !options.force) {
      const existing = this.load();
      if (existing) {
        return existing;
      }
    }

    // Detect project
    const detector = new ProjectDetector(this.projectPath);
    const stack = options.skipDetection ? this.getEmptyStack() : detector.analyze();
    const patterns = options.skipDetection ? {} : detector.detectPatterns();
    const projectType = options.skipDetection ? 'unknown' : detector.detectProjectType();
    const projectName = detector.getProjectName();
    const projectDescription = detector.getProjectDescription();

    // Create new context
    const context: ProjectContext = {
      version: 1,
      project: {
        name: projectName,
        description: projectDescription,
        type: projectType,
        path: this.projectPath,
      },
      stack,
      patterns,
      skills: {
        installed: [],
        recommended: [],
        excluded: [],
        autoSync: true,
        securityLevel: 'medium',
        testingRequired: false,
      },
      agents: {
        primary: undefined,
        detected: [],
        synced: [],
        disabled: [],
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save and return
    this.save(context);
    return context;
  }

  /**
   * Update context with new detection
   */
  refresh(): ProjectContext {
    const existing = this.load();
    const detector = new ProjectDetector(this.projectPath);
    const stack = detector.analyze();
    const patterns = detector.detectPatterns();
    const projectType = detector.detectProjectType();

    if (existing) {
      // Merge with existing
      const merged: ProjectContext = {
        ...existing,
        stack,
        patterns,
        project: {
          ...existing.project,
          type: projectType,
        },
        updatedAt: new Date().toISOString(),
      };

      this.save(merged);
      return merged;
    }

    // No existing context, initialize new
    return this.init();
  }

  /**
   * Get current context (load if not loaded)
   */
  get(): ProjectContext | null {
    if (this.context) {
      return this.context;
    }
    return this.load();
  }

  /**
   * Update skills in context
   */
  updateSkills(skills: Partial<SkillPreferences>): void {
    const context = this.get();
    if (!context) {
      throw new Error('No context found. Run `skillkit context init` first.');
    }

    context.skills = {
      ...context.skills,
      ...skills,
    } as SkillPreferences;

    this.save(context);
  }

  /**
   * Update agents in context
   */
  updateAgents(agents: Partial<AgentConfig>): void {
    const context = this.get();
    if (!context) {
      throw new Error('No context found. Run `skillkit context init` first.');
    }

    context.agents = {
      ...context.agents,
      ...agents,
    } as AgentConfig;

    this.save(context);
  }

  /**
   * Set primary agent
   */
  setPrimaryAgent(agent: AgentType): void {
    this.updateAgents({ primary: agent });
  }

  /**
   * Add agent to synced list
   */
  addSyncedAgent(agent: AgentType): void {
    const context = this.get();
    if (!context) {
      throw new Error('No context found');
    }

    const synced = new Set(context.agents?.synced || []);
    synced.add(agent);

    this.updateAgents({ synced: Array.from(synced) });
  }

  /**
   * Remove agent from synced list
   */
  removeSyncedAgent(agent: AgentType): void {
    const context = this.get();
    if (!context) {
      throw new Error('No context found');
    }

    const synced = new Set(context.agents?.synced || []);
    synced.delete(agent);

    this.updateAgents({ synced: Array.from(synced) });
  }

  /**
   * Add installed skill
   */
  addInstalledSkill(skillName: string): void {
    const context = this.get();
    if (!context) return;

    const installed = new Set(context.skills?.installed || []);
    installed.add(skillName);

    this.updateSkills({ installed: Array.from(installed) });
  }

  /**
   * Remove installed skill
   */
  removeInstalledSkill(skillName: string): void {
    const context = this.get();
    if (!context) return;

    const installed = new Set(context.skills?.installed || []);
    installed.delete(skillName);

    this.updateSkills({ installed: Array.from(installed) });
  }

  /**
   * Export context to file
   */
  export(options: ContextExportOptions = {}): string {
    const context = this.get();
    if (!context) {
      throw new Error('No context found');
    }

    // Clone and optionally filter
    const exported = { ...context };

    if (!options.includeSkills) {
      delete (exported as Record<string, unknown>).skills;
    }
    if (!options.includeAgents) {
      delete (exported as Record<string, unknown>).agents;
    }

    // Format
    if (options.format === 'json') {
      return JSON.stringify(exported, null, 2);
    }

    return stringifyYaml(exported, {
      lineWidth: 0,
      defaultKeyType: 'PLAIN',
    });
  }

  /**
   * Import context from content
   */
  import(content: string, options: ContextImportOptions = {}): ProjectContext {
    // Parse content
    let data: unknown;
    try {
      // Try JSON first
      data = JSON.parse(content);
    } catch {
      // Try YAML
      data = parseYaml(content);
    }

    const parsed = ProjectContextSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error(`Invalid context format: ${parsed.error.message}`);
    }

    const imported = parsed.data;

    if (options.merge && this.exists()) {
      const existing = this.load()!;
      const merged = this.mergeContexts(existing, imported);
      this.save(merged);
      return merged;
    }

    if (!options.overwrite && this.exists()) {
      throw new Error('Context already exists. Use --merge or --overwrite.');
    }

    this.save(imported);
    return imported;
  }

  /**
   * Merge two contexts
   */
  private mergeContexts(existing: ProjectContext, imported: ProjectContext): ProjectContext {
    return {
      version: 1,
      project: {
        ...existing.project,
        ...imported.project,
      },
      stack: this.mergeStacks(existing.stack, imported.stack),
      patterns: {
        ...existing.patterns,
        ...imported.patterns,
      },
      skills: {
        installed: [...new Set([...(existing.skills?.installed || []), ...(imported.skills?.installed || [])])],
        recommended: [...new Set([...(existing.skills?.recommended || []), ...(imported.skills?.recommended || [])])],
        excluded: [...new Set([...(existing.skills?.excluded || []), ...(imported.skills?.excluded || [])])],
        autoSync: imported.skills?.autoSync ?? existing.skills?.autoSync ?? true,
        securityLevel: imported.skills?.securityLevel ?? existing.skills?.securityLevel ?? 'medium',
        testingRequired: imported.skills?.testingRequired ?? existing.skills?.testingRequired ?? false,
      },
      agents: {
        primary: imported.agents?.primary ?? existing.agents?.primary,
        detected: [...new Set([...(existing.agents?.detected || []), ...(imported.agents?.detected || [])])],
        synced: [...new Set([...(existing.agents?.synced || []), ...(imported.agents?.synced || [])])],
        disabled: [...new Set([...(existing.agents?.disabled || []), ...(imported.agents?.disabled || [])])],
      },
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Merge two stacks
   */
  private mergeStacks(existing: ProjectStack, imported: ProjectStack): ProjectStack {
    const mergeArrays = (a: Detection[], b: Detection[]): Detection[] => {
      const names = new Set(a.map((item) => item.name));
      const result: Detection[] = [...a];
      for (const item of b) {
        if (!names.has(item.name)) {
          result.push(item);
        }
      }
      return result;
    };

    return {
      languages: mergeArrays(existing.languages, imported.languages),
      frameworks: mergeArrays(existing.frameworks, imported.frameworks),
      libraries: mergeArrays(existing.libraries, imported.libraries),
      styling: mergeArrays(existing.styling, imported.styling),
      testing: mergeArrays(existing.testing, imported.testing),
      databases: mergeArrays(existing.databases, imported.databases),
      tools: mergeArrays(existing.tools, imported.tools),
      runtime: mergeArrays(existing.runtime, imported.runtime),
    };
  }

  /**
   * Get empty stack
   */
  private getEmptyStack(): ProjectStack {
    return {
      languages: [],
      frameworks: [],
      libraries: [],
      styling: [],
      testing: [],
      databases: [],
      tools: [],
      runtime: [],
    };
  }

  /**
   * Get recommended skill tags based on stack
   */
  getRecommendedTags(): string[] {
    const context = this.get();
    if (!context) return [];

    return getStackTags(context.stack);
  }
}

/**
 * Create a context manager for the current directory
 */
export function createContextManager(projectPath?: string): ContextManager {
  return new ContextManager(projectPath);
}

/**
 * Load context from the current directory
 */
export function loadContext(projectPath?: string): ProjectContext | null {
  const manager = new ContextManager(projectPath);
  return manager.load();
}

/**
 * Initialize context in the current directory
 */
export function initContext(projectPath?: string, options?: { force?: boolean }): ProjectContext {
  const manager = new ContextManager(projectPath);
  return manager.init(options);
}
