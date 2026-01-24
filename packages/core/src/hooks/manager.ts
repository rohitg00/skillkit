/**
 * Hook Manager
 *
 * Manages skill hooks for automatic triggering across all supported agents.
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { randomUUID } from 'node:crypto';
import { minimatch } from 'minimatch';
import type { AgentType } from '../types.js';
import type {
  SkillHook,
  HookEvent,
  HookContext,
  HookConfig,
  HookManagerOptions,
  ActivatedSkill,
  HookTriggerResult,
  HookError,
  HookEventListener,
} from './types.js';

const DEFAULT_CONFIG_PATH = '.skillkit/hooks.json';

/**
 * HookManager - Manages skill hooks for automatic triggering
 */
export class HookManager {
  private hooks: Map<string, SkillHook> = new Map();
  private listeners: Set<HookEventListener> = new Set();
  private options: Required<HookManagerOptions>;

  constructor(options: HookManagerOptions) {
    this.options = {
      projectPath: options.projectPath,
      configPath: options.configPath || join(options.projectPath, DEFAULT_CONFIG_PATH),
      autoLoad: options.autoLoad ?? true,
      defaultInjectionMode: options.defaultInjectionMode || 'reference',
    };

    if (this.options.autoLoad) {
      this.load();
    }
  }

  /**
   * Register a new hook
   */
  registerHook(hook: Omit<SkillHook, 'id'> & { id?: string }): SkillHook {
    const fullHook: SkillHook = {
      ...hook,
      id: hook.id || randomUUID(),
      inject: hook.inject || this.options.defaultInjectionMode,
      enabled: hook.enabled ?? true,
      priority: hook.priority ?? 0,
    };

    this.hooks.set(fullHook.id, fullHook);
    return fullHook;
  }

  /**
   * Unregister a hook by ID
   */
  unregisterHook(id: string): boolean {
    return this.hooks.delete(id);
  }

  /**
   * Get a hook by ID
   */
  getHook(id: string): SkillHook | undefined {
    return this.hooks.get(id);
  }

  /**
   * Get all hooks
   */
  getAllHooks(): SkillHook[] {
    return Array.from(this.hooks.values());
  }

  /**
   * Get hooks for a specific event
   */
  getHooksForEvent(event: HookEvent): SkillHook[] {
    return this.getAllHooks()
      .filter((hook) => hook.event === event && hook.enabled)
      .sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }

  /**
   * Update a hook
   */
  updateHook(id: string, updates: Partial<SkillHook>): SkillHook | undefined {
    const existing = this.hooks.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...updates, id };
    this.hooks.set(id, updated);
    return updated;
  }

  /**
   * Enable a hook
   */
  enableHook(id: string): boolean {
    const hook = this.hooks.get(id);
    if (!hook) return false;
    hook.enabled = true;
    return true;
  }

  /**
   * Disable a hook
   */
  disableHook(id: string): boolean {
    const hook = this.hooks.get(id);
    if (!hook) return false;
    hook.enabled = false;
    return true;
  }

  /**
   * Trigger hooks for an event
   */
  async trigger(event: HookEvent, context: HookContext): Promise<HookTriggerResult> {
    const startTime = Date.now();
    const matchedHooks: SkillHook[] = [];
    const activatedSkills: ActivatedSkill[] = [];
    const errors: HookError[] = [];

    const hooks = this.getHooksForEvent(event);

    for (const hook of hooks) {
      try {
        // Check if matcher matches
        if (hook.matcher && !this.matchesTrigger(hook.matcher, context.trigger)) {
          continue;
        }

        // Check condition if present
        if (hook.condition && !this.evaluateCondition(hook.condition, context)) {
          continue;
        }

        matchedHooks.push(hook);

        // Apply agent-specific overrides
        const effectiveHook = this.applyAgentOverrides(hook, context.agent);

        // Activate each skill
        for (const skillId of effectiveHook.skills) {
          try {
            const activated = await this.activateSkill(skillId, effectiveHook, context);
            activatedSkills.push(activated);
          } catch (err) {
            errors.push({
              hookId: hook.id,
              skillId,
              message: err instanceof Error ? err.message : 'Unknown error',
              stack: err instanceof Error ? err.stack : undefined,
            });
          }
        }
      } catch (err) {
        errors.push({
          hookId: hook.id,
          message: err instanceof Error ? err.message : 'Unknown error',
          stack: err instanceof Error ? err.stack : undefined,
        });
      }
    }

    const result: HookTriggerResult = {
      event,
      matchedHooks,
      activatedSkills,
      errors,
      executionTimeMs: Date.now() - startTime,
    };

    // Notify listeners
    await this.notifyListeners(event, context, result);

    return result;
  }

  /**
   * Add event listener
   */
  addListener(listener: HookEventListener): void {
    this.listeners.add(listener);
  }

  /**
   * Remove event listener
   */
  removeListener(listener: HookEventListener): void {
    this.listeners.delete(listener);
  }

  /**
   * Load hooks from config file
   */
  load(): void {
    if (!existsSync(this.options.configPath)) {
      return;
    }

    try {
      const content = readFileSync(this.options.configPath, 'utf-8');
      const config: HookConfig = JSON.parse(content);

      this.hooks.clear();
      for (const hook of config.hooks) {
        this.hooks.set(hook.id, {
          ...hook,
          inject: hook.inject || config.defaults?.inject || this.options.defaultInjectionMode,
          priority: hook.priority ?? config.defaults?.priority ?? 0,
          enabled: hook.enabled ?? config.defaults?.enabled ?? true,
        });
      }
    } catch {
      // Ignore parse errors, start with empty hooks
    }
  }

  /**
   * Save hooks to config file
   */
  save(): void {
    const config: HookConfig = {
      version: 1,
      hooks: this.getAllHooks(),
      defaults: {
        inject: this.options.defaultInjectionMode,
        priority: 0,
        enabled: true,
      },
    };

    const dir = dirname(this.options.configPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    writeFileSync(this.options.configPath, JSON.stringify(config, null, 2));
  }

  /**
   * Generate agent-specific hook configuration
   */
  generateAgentHooks(agent: AgentType): string | Record<string, unknown> {
    const hooks = this.getAllHooks().filter((h) => h.enabled);

    switch (agent) {
      case 'claude-code':
        return this.generateClaudeCodeHooks(hooks);
      case 'cursor':
        return this.generateCursorHooks(hooks);
      case 'opencode':
        return this.generateOpenCodeHooks(hooks);
      default:
        return this.generateGenericHooks(hooks);
    }
  }

  /**
   * Generate Claude Code hooks.json format
   */
  private generateClaudeCodeHooks(hooks: SkillHook[]): Record<string, unknown> {
    const hookEntries: Record<string, unknown>[] = [];

    for (const hook of hooks) {
      // Map our events to Claude Code hook events
      const claudeEvent = this.mapToClaudeCodeEvent(hook.event);
      if (!claudeEvent) continue;

      hookEntries.push({
        event: claudeEvent,
        command: this.generateClaudeCommand(hook),
        matcher: hook.matcher ? String(hook.matcher) : undefined,
      });
    }

    return { hooks: hookEntries };
  }

  /**
   * Map SkillKit events to Claude Code events
   */
  private mapToClaudeCodeEvent(event: HookEvent): string | null {
    const mapping: Record<HookEvent, string | null> = {
      'session:start': 'SessionStart',
      'session:resume': 'SessionResume',
      'session:end': 'SessionEnd',
      'file:open': null,
      'file:save': 'PreToolUse',
      'file:create': 'PostToolUse',
      'file:delete': 'PostToolUse',
      'task:start': null,
      'task:complete': null,
      'commit:pre': 'PreToolUse',
      'commit:post': 'PostToolUse',
      'error:occur': null,
      'test:fail': 'PostToolUse',
      'test:pass': 'PostToolUse',
      'build:start': 'PreToolUse',
      'build:fail': 'PostToolUse',
      'build:success': 'PostToolUse',
    };
    return mapping[event];
  }

  /**
   * Generate Claude Code command for a hook
   */
  private generateClaudeCommand(hook: SkillHook): string {
    const skillRefs = hook.skills.map((s) => `@${s}`).join(' ');
    return `echo "Activating skills: ${skillRefs}"`;
  }

  /**
   * Generate Cursor rules with hooks
   */
  private generateCursorHooks(hooks: SkillHook[]): string {
    const lines: string[] = ['# Auto-generated skill activation rules', ''];

    for (const hook of hooks) {
      lines.push(`## ${hook.event} Hook`);
      lines.push(`When ${hook.event.replace(':', ' ')} occurs:`);
      for (const skill of hook.skills) {
        lines.push(`- Apply skill: ${skill}`);
      }
      if (hook.matcher) {
        lines.push(`- Pattern: ${hook.matcher}`);
      }
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Generate OpenCode hooks
   */
  private generateOpenCodeHooks(hooks: SkillHook[]): Record<string, unknown> {
    return {
      triggers: hooks.map((hook) => ({
        event: hook.event,
        skills: hook.skills,
        matcher: hook.matcher ? String(hook.matcher) : undefined,
        enabled: hook.enabled,
      })),
    };
  }

  /**
   * Generate generic AGENTS.md injection for unsupported agents
   */
  private generateGenericHooks(hooks: SkillHook[]): string {
    const lines: string[] = [
      '# Skill Activation Triggers',
      '',
      'The following skills should be activated based on events:',
      '',
    ];

    const eventGroups = new Map<HookEvent, SkillHook[]>();
    for (const hook of hooks) {
      const group = eventGroups.get(hook.event) || [];
      group.push(hook);
      eventGroups.set(hook.event, group);
    }

    for (const [event, eventHooks] of eventGroups) {
      lines.push(`## On ${event.replace(':', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}`);
      for (const hook of eventHooks) {
        lines.push(`- Activate: ${hook.skills.join(', ')}`);
        if (hook.matcher) {
          lines.push(`  - When matching: ${hook.matcher}`);
        }
      }
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Check if trigger matches the pattern
   */
  private matchesTrigger(matcher: string | RegExp, trigger: string): boolean {
    if (matcher instanceof RegExp) {
      return matcher.test(trigger);
    }
    // Use minimatch for glob patterns
    return minimatch(trigger, matcher);
  }

  /**
   * Evaluate condition expression
   */
  private evaluateCondition(condition: string, context: HookContext): boolean {
    // Simple condition evaluation
    // Supports: event == 'x', trigger.includes('y'), metadata.key == 'value'
    try {
      const safeContext = {
        event: context.event,
        trigger: context.trigger,
        agent: context.agent,
        metadata: context.metadata || {},
      };

      // Very basic expression evaluation
      if (condition.includes('==')) {
        const [left, right] = condition.split('==').map((s) => s.trim());
        const leftVal = this.resolveValue(left, safeContext);
        const rightVal = right.replace(/['"]/g, '');
        return leftVal === rightVal;
      }

      if (condition.includes('.includes(')) {
        const match = condition.match(/(\w+)\.includes\(['"](.+)['"]\)/);
        if (match) {
          const [, prop, search] = match;
          const val = this.resolveValue(prop, safeContext);
          return typeof val === 'string' && val.includes(search);
        }
      }

      return true;
    } catch {
      return true;
    }
  }

  /**
   * Resolve a value from context
   */
  private resolveValue(path: string, context: Record<string, unknown>): unknown {
    const parts = path.split('.');
    let current: unknown = context;

    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = (current as Record<string, unknown>)[part];
      } else {
        return undefined;
      }
    }

    return current;
  }

  /**
   * Apply agent-specific overrides to a hook
   */
  private applyAgentOverrides(hook: SkillHook, agent: AgentType): SkillHook {
    if (!hook.agentOverrides || !hook.agentOverrides[agent]) {
      return hook;
    }

    return {
      ...hook,
      ...hook.agentOverrides[agent],
      id: hook.id,
      event: hook.event,
    };
  }

  /**
   * Activate a skill from a hook
   */
  private async activateSkill(
    skillId: string,
    hook: SkillHook,
    context: HookContext
  ): Promise<ActivatedSkill> {
    const activated: ActivatedSkill = {
      skillId,
      hookId: hook.id,
      injectionMode: hook.inject,
      activatedAt: new Date(),
    };

    switch (hook.inject) {
      case 'content':
        // Load skill content
        activated.content = await this.loadSkillContent(skillId, context);
        break;
      case 'reference':
        // Create reference
        activated.reference = `@${skillId}`;
        break;
      case 'prompt':
        // Create prompt injection
        activated.content = `Please apply the "${skillId}" skill to this task.`;
        break;
    }

    return activated;
  }

  /**
   * Load skill content (placeholder - integrates with skill loader)
   */
  private async loadSkillContent(skillId: string, _context: HookContext): Promise<string> {
    // This would integrate with the methodology loader or skill manager
    // For now, return a placeholder
    return `# Skill: ${skillId}\n\nThis skill was auto-activated by a hook.`;
  }

  /**
   * Notify all listeners of a trigger event
   */
  private async notifyListeners(
    event: HookEvent,
    context: HookContext,
    result: HookTriggerResult
  ): Promise<void> {
    for (const listener of this.listeners) {
      try {
        await listener(event, context, result);
      } catch {
        // Ignore listener errors
      }
    }
  }
}

/**
 * Create a HookManager instance
 */
export function createHookManager(options: HookManagerOptions): HookManager {
  return new HookManager(options);
}
