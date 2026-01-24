/**
 * Hooks System Tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { HookManager, createHookManager } from '../manager.js';
import { SkillTriggerEngine, createTriggerEngine } from '../triggers.js';
import type { SkillHook, HookEvent, HookContext } from '../types.js';

describe('HookManager', () => {
  let tempDir: string;
  let manager: HookManager;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'skillkit-hooks-test-'));
    manager = createHookManager({ projectPath: tempDir, autoLoad: false });
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  describe('registerHook', () => {
    it('should register a hook with generated ID', () => {
      const hook = manager.registerHook({
        event: 'session:start',
        skills: ['tdd-workflow'],
        inject: 'reference',
        enabled: true,
      });

      expect(hook.id).toBeDefined();
      expect(hook.event).toBe('session:start');
      expect(hook.skills).toEqual(['tdd-workflow']);
      expect(hook.inject).toBe('reference');
      expect(hook.enabled).toBe(true);
    });

    it('should register a hook with custom ID', () => {
      const hook = manager.registerHook({
        id: 'my-hook',
        event: 'file:save',
        skills: ['code-review'],
        inject: 'content',
        enabled: true,
      });

      expect(hook.id).toBe('my-hook');
    });

    it('should set default values', () => {
      const hook = manager.registerHook({
        event: 'session:start',
        skills: ['test'],
        inject: 'reference',
        enabled: true,
      });

      expect(hook.priority).toBe(0);
    });
  });

  describe('unregisterHook', () => {
    it('should remove a registered hook', () => {
      const hook = manager.registerHook({
        event: 'session:start',
        skills: ['test'],
        inject: 'reference',
        enabled: true,
      });

      expect(manager.getHook(hook.id)).toBeDefined();
      expect(manager.unregisterHook(hook.id)).toBe(true);
      expect(manager.getHook(hook.id)).toBeUndefined();
    });

    it('should return false for non-existent hook', () => {
      expect(manager.unregisterHook('non-existent')).toBe(false);
    });
  });

  describe('getHooksForEvent', () => {
    it('should return hooks for a specific event', () => {
      manager.registerHook({
        event: 'session:start',
        skills: ['skill1'],
        inject: 'reference',
        enabled: true,
      });
      manager.registerHook({
        event: 'session:start',
        skills: ['skill2'],
        inject: 'reference',
        enabled: true,
      });
      manager.registerHook({
        event: 'file:save',
        skills: ['skill3'],
        inject: 'reference',
        enabled: true,
      });

      const sessionHooks = manager.getHooksForEvent('session:start');
      expect(sessionHooks).toHaveLength(2);
      expect(sessionHooks.every((h) => h.event === 'session:start')).toBe(true);
    });

    it('should only return enabled hooks', () => {
      manager.registerHook({
        event: 'session:start',
        skills: ['skill1'],
        inject: 'reference',
        enabled: true,
      });
      manager.registerHook({
        event: 'session:start',
        skills: ['skill2'],
        inject: 'reference',
        enabled: false,
      });

      const hooks = manager.getHooksForEvent('session:start');
      expect(hooks).toHaveLength(1);
    });

    it('should sort by priority (higher first)', () => {
      manager.registerHook({
        event: 'session:start',
        skills: ['low'],
        inject: 'reference',
        enabled: true,
        priority: 1,
      });
      manager.registerHook({
        event: 'session:start',
        skills: ['high'],
        inject: 'reference',
        enabled: true,
        priority: 10,
      });
      manager.registerHook({
        event: 'session:start',
        skills: ['medium'],
        inject: 'reference',
        enabled: true,
        priority: 5,
      });

      const hooks = manager.getHooksForEvent('session:start');
      expect(hooks[0].skills).toEqual(['high']);
      expect(hooks[1].skills).toEqual(['medium']);
      expect(hooks[2].skills).toEqual(['low']);
    });
  });

  describe('enableHook/disableHook', () => {
    it('should enable a disabled hook', () => {
      const hook = manager.registerHook({
        event: 'session:start',
        skills: ['test'],
        inject: 'reference',
        enabled: false,
      });

      expect(manager.enableHook(hook.id)).toBe(true);
      expect(manager.getHook(hook.id)?.enabled).toBe(true);
    });

    it('should disable an enabled hook', () => {
      const hook = manager.registerHook({
        event: 'session:start',
        skills: ['test'],
        inject: 'reference',
        enabled: true,
      });

      expect(manager.disableHook(hook.id)).toBe(true);
      expect(manager.getHook(hook.id)?.enabled).toBe(false);
    });
  });

  describe('trigger', () => {
    it('should trigger hooks for an event', async () => {
      manager.registerHook({
        event: 'session:start',
        skills: ['skill1', 'skill2'],
        inject: 'reference',
        enabled: true,
      });

      const context: HookContext = {
        event: 'session:start',
        trigger: 'test',
        projectPath: tempDir,
        agent: 'claude-code',
        timestamp: new Date(),
      };

      const result = await manager.trigger('session:start', context);

      expect(result.event).toBe('session:start');
      expect(result.matchedHooks).toHaveLength(1);
      expect(result.activatedSkills).toHaveLength(2);
      expect(result.errors).toHaveLength(0);
    });

    it('should filter by matcher pattern', async () => {
      manager.registerHook({
        event: 'file:save',
        skills: ['test-skill'],
        inject: 'reference',
        matcher: '*.test.ts',
        enabled: true,
      });

      const matchContext: HookContext = {
        event: 'file:save',
        trigger: 'foo.test.ts',
        projectPath: tempDir,
        agent: 'claude-code',
        timestamp: new Date(),
      };

      const noMatchContext: HookContext = {
        event: 'file:save',
        trigger: 'foo.ts',
        projectPath: tempDir,
        agent: 'claude-code',
        timestamp: new Date(),
      };

      const matchResult = await manager.trigger('file:save', matchContext);
      expect(matchResult.matchedHooks).toHaveLength(1);

      const noMatchResult = await manager.trigger('file:save', noMatchContext);
      expect(noMatchResult.matchedHooks).toHaveLength(0);
    });

    it('should handle injection modes', async () => {
      manager.registerHook({
        event: 'session:start',
        skills: ['ref-skill'],
        inject: 'reference',
        enabled: true,
      });
      manager.registerHook({
        event: 'session:start',
        skills: ['content-skill'],
        inject: 'content',
        enabled: true,
      });
      manager.registerHook({
        event: 'session:start',
        skills: ['prompt-skill'],
        inject: 'prompt',
        enabled: true,
      });

      const context: HookContext = {
        event: 'session:start',
        trigger: 'test',
        projectPath: tempDir,
        agent: 'claude-code',
        timestamp: new Date(),
      };

      const result = await manager.trigger('session:start', context);

      const refSkill = result.activatedSkills.find((s) => s.skillId === 'ref-skill');
      expect(refSkill?.reference).toBe('@ref-skill');

      const contentSkill = result.activatedSkills.find((s) => s.skillId === 'content-skill');
      expect(contentSkill?.content).toBeDefined();

      const promptSkill = result.activatedSkills.find((s) => s.skillId === 'prompt-skill');
      expect(promptSkill?.content).toContain('prompt-skill');
    });
  });

  describe('save/load', () => {
    it('should save and load hooks', () => {
      manager.registerHook({
        event: 'session:start',
        skills: ['skill1'],
        inject: 'reference',
        enabled: true,
      });
      manager.registerHook({
        event: 'file:save',
        skills: ['skill2'],
        inject: 'content',
        enabled: false,
        matcher: '*.ts',
      });

      manager.save();

      // Create new manager to load
      const newManager = createHookManager({ projectPath: tempDir, autoLoad: true });
      const hooks = newManager.getAllHooks();

      expect(hooks).toHaveLength(2);
      expect(hooks.find((h) => h.skills[0] === 'skill1')).toBeDefined();
      expect(hooks.find((h) => h.skills[0] === 'skill2')).toBeDefined();
    });
  });

  describe('generateAgentHooks', () => {
    it('should generate Claude Code hooks format', () => {
      manager.registerHook({
        event: 'session:start',
        skills: ['tdd'],
        inject: 'reference',
        enabled: true,
      });

      const hooks = manager.generateAgentHooks('claude-code');
      expect(hooks).toHaveProperty('hooks');
      expect((hooks as any).hooks).toBeInstanceOf(Array);
    });

    it('should generate Cursor rules format', () => {
      manager.registerHook({
        event: 'session:start',
        skills: ['tdd'],
        inject: 'reference',
        enabled: true,
      });

      const rules = manager.generateAgentHooks('cursor');
      expect(typeof rules).toBe('string');
      expect(rules).toContain('session start');
    });

    it('should generate generic format for other agents', () => {
      manager.registerHook({
        event: 'session:start',
        skills: ['tdd'],
        inject: 'reference',
        enabled: true,
      });

      const content = manager.generateAgentHooks('gemini-cli');
      expect(typeof content).toBe('string');
      expect(content).toContain('Skill Activation Triggers');
    });
  });

  describe('listeners', () => {
    it('should notify listeners on trigger', async () => {
      let notified = false;
      manager.addListener((event, context, result) => {
        notified = true;
        expect(event).toBe('session:start');
      });

      manager.registerHook({
        event: 'session:start',
        skills: ['test'],
        inject: 'reference',
        enabled: true,
      });

      await manager.trigger('session:start', {
        event: 'session:start',
        trigger: 'test',
        projectPath: tempDir,
        agent: 'claude-code',
        timestamp: new Date(),
      });

      expect(notified).toBe(true);
    });

    it('should remove listeners', async () => {
      let callCount = 0;
      const listener = () => {
        callCount++;
      };

      manager.addListener(listener);
      manager.registerHook({
        event: 'session:start',
        skills: ['test'],
        inject: 'reference',
        enabled: true,
      });

      const context: HookContext = {
        event: 'session:start',
        trigger: 'test',
        projectPath: tempDir,
        agent: 'claude-code',
        timestamp: new Date(),
      };

      await manager.trigger('session:start', context);
      expect(callCount).toBe(1);

      manager.removeListener(listener);
      await manager.trigger('session:start', context);
      expect(callCount).toBe(1); // Should not increase
    });
  });
});

describe('SkillTriggerEngine', () => {
  let tempDir: string;
  let manager: HookManager;
  let engine: SkillTriggerEngine;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'skillkit-trigger-test-'));
    manager = createHookManager({ projectPath: tempDir, autoLoad: false });
    engine = createTriggerEngine(manager, { projectPath: tempDir, watchFiles: false });
  });

  afterEach(() => {
    engine.stop();
    rmSync(tempDir, { recursive: true, force: true });
  });

  describe('lifecycle', () => {
    it('should start and stop', async () => {
      let sessionStartTriggered = false;
      let sessionEndTriggered = false;

      manager.registerHook({
        event: 'session:start',
        skills: ['start-skill'],
        inject: 'reference',
        enabled: true,
      });
      manager.registerHook({
        event: 'session:end',
        skills: ['end-skill'],
        inject: 'reference',
        enabled: true,
      });

      manager.addListener((event) => {
        if (event === 'session:start') sessionStartTriggered = true;
        if (event === 'session:end') sessionEndTriggered = true;
      });

      engine.start('claude-code');
      // Give it a moment to process
      await new Promise((r) => setTimeout(r, 10));
      expect(sessionStartTriggered).toBe(true);
      expect(engine.isActive()).toBe(true);

      engine.stop();
      await new Promise((r) => setTimeout(r, 10));
      expect(sessionEndTriggered).toBe(true);
      expect(engine.isActive()).toBe(false);
    });
  });

  describe('event triggering', () => {
    beforeEach(() => {
      manager.registerHook({
        event: 'file:save',
        skills: ['save-skill'],
        inject: 'reference',
        enabled: true,
      });
      manager.registerHook({
        event: 'task:start',
        skills: ['task-skill'],
        inject: 'reference',
        enabled: true,
      });
      manager.registerHook({
        event: 'commit:pre',
        skills: ['commit-skill'],
        inject: 'reference',
        enabled: true,
      });
      manager.registerHook({
        event: 'error:occur',
        skills: ['error-skill'],
        inject: 'reference',
        enabled: true,
      });
      manager.registerHook({
        event: 'test:fail',
        skills: ['test-skill'],
        inject: 'reference',
        enabled: true,
      });
      manager.registerHook({
        event: 'build:fail',
        skills: ['build-skill'],
        inject: 'reference',
        enabled: true,
      });
    });

    it('should trigger file save event', async () => {
      const result = await engine.triggerFileSave('src/index.ts');
      expect(result.matchedHooks).toHaveLength(1);
      expect(result.activatedSkills[0].skillId).toBe('save-skill');
    });

    it('should trigger task start event', async () => {
      const result = await engine.triggerTaskStart('implement-feature', 'task-123');
      expect(result.matchedHooks).toHaveLength(1);
      expect(result.activatedSkills[0].skillId).toBe('task-skill');
    });

    it('should trigger pre-commit event', async () => {
      const result = await engine.triggerPreCommit('feat: add new feature');
      expect(result.matchedHooks).toHaveLength(1);
      expect(result.activatedSkills[0].skillId).toBe('commit-skill');
    });

    it('should trigger error event', async () => {
      const result = await engine.triggerError(new Error('Something went wrong'), 'test-context');
      expect(result.matchedHooks).toHaveLength(1);
      expect(result.activatedSkills[0].skillId).toBe('error-skill');
    });

    it('should trigger test fail event', async () => {
      const result = await engine.triggerTestFail('should add numbers', 'Expected 4 but got 5');
      expect(result.matchedHooks).toHaveLength(1);
      expect(result.activatedSkills[0].skillId).toBe('test-skill');
    });

    it('should trigger build fail event', async () => {
      const result = await engine.triggerBuildFail('TypeScript error');
      expect(result.matchedHooks).toHaveLength(1);
      expect(result.activatedSkills[0].skillId).toBe('build-skill');
    });
  });

  describe('agent setting', () => {
    it('should use the set agent in context', async () => {
      manager.registerHook({
        event: 'session:start',
        skills: ['test'],
        inject: 'reference',
        enabled: true,
      });

      let capturedAgent: string | null = null;
      manager.addListener((event, context) => {
        capturedAgent = context.agent;
      });

      engine.setAgent('cursor');
      await engine.triggerEvent('session:start', 'test');

      expect(capturedAgent).toBe('cursor');
    });
  });

  describe('listeners', () => {
    it('should notify engine listeners', async () => {
      let notified = false;
      engine.addListener((event) => {
        notified = true;
        expect(event).toBe('task:start');
      });

      manager.registerHook({
        event: 'task:start',
        skills: ['test'],
        inject: 'reference',
        enabled: true,
      });

      await engine.triggerTaskStart('test-task');
      expect(notified).toBe(true);
    });
  });
});

describe('Hook Event Types', () => {
  it('should support all documented events', () => {
    const events: HookEvent[] = [
      'session:start',
      'session:resume',
      'session:end',
      'file:open',
      'file:save',
      'file:create',
      'file:delete',
      'task:start',
      'task:complete',
      'commit:pre',
      'commit:post',
      'error:occur',
      'test:fail',
      'test:pass',
      'build:start',
      'build:fail',
      'build:success',
    ];

    // Just verify all events are valid strings
    expect(events).toHaveLength(17);
    events.forEach((event) => {
      expect(typeof event).toBe('string');
      expect(event).toContain(':');
    });
  });
});
