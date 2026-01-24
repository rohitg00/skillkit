/**
 * Agent Discovery Tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  discoverAgents,
  discoverAgentsForAgent,
  findAllAgents,
  findAgent,
  getAgentsDirectory,
  agentExists,
  getAgentStats,
} from '../discovery.js';

describe('Agent Discovery', () => {
  let testDir: string;

  beforeEach(() => {
    // Create a temporary test directory
    testDir = join(tmpdir(), `agent-test-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    // Clean up
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('discoverAgents', () => {
    it('should discover agents in .claude/agents directory', () => {
      const agentsDir = join(testDir, '.claude', 'agents');
      mkdirSync(agentsDir, { recursive: true });

      writeFileSync(
        join(agentsDir, 'test-agent.md'),
        `---
name: test-agent
description: A test agent
---

Agent content here.`
      );

      const agents = discoverAgents(testDir);

      expect(agents).toHaveLength(1);
      expect(agents[0].name).toBe('test-agent');
      expect(agents[0].description).toBe('A test agent');
      expect(agents[0].location).toBe('project');
    });

    it('should discover multiple agents', () => {
      const agentsDir = join(testDir, '.claude', 'agents');
      mkdirSync(agentsDir, { recursive: true });

      writeFileSync(
        join(agentsDir, 'agent-one.md'),
        `---
name: agent-one
description: First agent
---
Content.`
      );

      writeFileSync(
        join(agentsDir, 'agent-two.md'),
        `---
name: agent-two
description: Second agent
---
Content.`
      );

      const agents = discoverAgents(testDir);

      expect(agents).toHaveLength(2);
      const names = agents.map((a) => a.name);
      expect(names).toContain('agent-one');
      expect(names).toContain('agent-two');
    });

    it('should return empty array when no agents directory exists', () => {
      const agents = discoverAgents(testDir);
      expect(agents).toHaveLength(0);
    });

    it('should discover agents in alternative directories', () => {
      const agentsDir = join(testDir, 'agents');
      mkdirSync(agentsDir, { recursive: true });

      writeFileSync(
        join(agentsDir, 'my-agent.md'),
        `---
name: my-agent
description: An agent in universal location
---
Content.`
      );

      const agents = discoverAgents(testDir);

      expect(agents).toHaveLength(1);
      expect(agents[0].name).toBe('my-agent');
    });
  });

  describe('discoverAgentsForAgent', () => {
    it('should discover agents for specific AI agent type', () => {
      const claudeAgentsDir = join(testDir, '.claude', 'agents');
      const cursorAgentsDir = join(testDir, '.cursor', 'agents');
      mkdirSync(claudeAgentsDir, { recursive: true });
      mkdirSync(cursorAgentsDir, { recursive: true });

      writeFileSync(
        join(claudeAgentsDir, 'claude-agent.md'),
        `---
name: claude-agent
description: Claude specific
---
Content.`
      );

      writeFileSync(
        join(cursorAgentsDir, 'cursor-agent.md'),
        `---
name: cursor-agent
description: Cursor specific
---
Content.`
      );

      const claudeAgents = discoverAgentsForAgent(testDir, 'claude-code');
      expect(claudeAgents).toHaveLength(1);
      expect(claudeAgents[0].name).toBe('claude-agent');

      const cursorAgents = discoverAgentsForAgent(testDir, 'cursor');
      expect(cursorAgents).toHaveLength(1);
      expect(cursorAgents[0].name).toBe('cursor-agent');
    });
  });

  describe('findAllAgents', () => {
    it('should find agents in multiple search directories', () => {
      const dir1 = join(testDir, 'project1');
      const dir2 = join(testDir, 'project2');
      mkdirSync(join(dir1, '.claude', 'agents'), { recursive: true });
      mkdirSync(join(dir2, '.claude', 'agents'), { recursive: true });

      writeFileSync(
        join(dir1, '.claude', 'agents', 'agent-a.md'),
        `---
name: agent-a
description: Agent A
---
Content.`
      );

      writeFileSync(
        join(dir2, '.claude', 'agents', 'agent-b.md'),
        `---
name: agent-b
description: Agent B
---
Content.`
      );

      const agents = findAllAgents([dir1, dir2]);

      expect(agents).toHaveLength(2);
      const names = agents.map((a) => a.name);
      expect(names).toContain('agent-a');
      expect(names).toContain('agent-b');
    });

    it('should deduplicate agents by name', () => {
      const dir1 = join(testDir, 'project1');
      const dir2 = join(testDir, 'project2');
      mkdirSync(join(dir1, '.claude', 'agents'), { recursive: true });
      mkdirSync(join(dir2, '.claude', 'agents'), { recursive: true });

      // Same agent name in both directories
      writeFileSync(
        join(dir1, '.claude', 'agents', 'shared-agent.md'),
        `---
name: shared-agent
description: Shared agent (dir1)
---
Content.`
      );

      writeFileSync(
        join(dir2, '.claude', 'agents', 'shared-agent.md'),
        `---
name: shared-agent
description: Shared agent (dir2)
---
Content.`
      );

      const agents = findAllAgents([dir1, dir2]);

      expect(agents).toHaveLength(1);
      expect(agents[0].name).toBe('shared-agent');
    });
  });

  describe('findAgent', () => {
    it('should find a specific agent by name', () => {
      const agentsDir = join(testDir, '.claude', 'agents');
      mkdirSync(agentsDir, { recursive: true });

      writeFileSync(
        join(agentsDir, 'target-agent.md'),
        `---
name: target-agent
description: The target agent
---
Content.`
      );

      writeFileSync(
        join(agentsDir, 'other-agent.md'),
        `---
name: other-agent
description: Another agent
---
Content.`
      );

      const agent = findAgent('target-agent', [testDir]);

      expect(agent).not.toBeNull();
      expect(agent?.name).toBe('target-agent');
      expect(agent?.description).toBe('The target agent');
    });

    it('should return null when agent not found', () => {
      const agentsDir = join(testDir, '.claude', 'agents');
      mkdirSync(agentsDir, { recursive: true });

      const agent = findAgent('non-existent', [testDir]);

      expect(agent).toBeNull();
    });
  });

  describe('getAgentsDirectory', () => {
    it('should return correct directory for different agent types', () => {
      expect(getAgentsDirectory(testDir, 'claude-code')).toBe(join(testDir, '.claude', 'agents'));
      expect(getAgentsDirectory(testDir, 'cursor')).toBe(join(testDir, '.cursor', 'agents'));
      expect(getAgentsDirectory(testDir, 'universal')).toBe(join(testDir, 'agents'));
    });
  });

  describe('agentExists', () => {
    it('should return true when agent exists', () => {
      const agentsDir = join(testDir, '.claude', 'agents');
      mkdirSync(agentsDir, { recursive: true });

      writeFileSync(
        join(agentsDir, 'existing-agent.md'),
        `---
name: existing-agent
description: Exists
---
Content.`
      );

      expect(agentExists('existing-agent', [testDir])).toBe(true);
    });

    it('should return false when agent does not exist', () => {
      expect(agentExists('non-existent', [testDir])).toBe(false);
    });
  });

  describe('getAgentStats', () => {
    it('should return correct stats', () => {
      const agentsDir = join(testDir, '.claude', 'agents');
      mkdirSync(agentsDir, { recursive: true });

      writeFileSync(
        join(agentsDir, 'agent-one.md'),
        `---
name: agent-one
description: First
---
Content.`
      );

      writeFileSync(
        join(agentsDir, 'agent-two.md'),
        `---
name: agent-two
description: Second
---
Content.`
      );

      const stats = getAgentStats([testDir]);

      expect(stats.total).toBe(2);
      expect(stats.project).toBe(2);
      expect(stats.global).toBe(0);
      expect(stats.enabled).toBe(2);
      expect(stats.disabled).toBe(0);
    });
  });
});
