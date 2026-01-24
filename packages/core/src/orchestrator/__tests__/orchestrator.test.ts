/**
 * Team Orchestration Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TaskManager, createTaskManager } from '../task.js';
import { TeamMessageBus, createMessageBus } from '../messages.js';
import { TeamOrchestrator, createTeamOrchestrator } from '../team.js';
import type { Task, TaskPlan, TeamMessage } from '../types.js';

describe('TaskManager', () => {
  let manager: TaskManager;

  beforeEach(() => {
    manager = createTaskManager();
  });

  describe('createTask', () => {
    it('should create a task with generated ID', () => {
      const task = manager.createTask(
        'Implement feature',
        'Add login functionality',
        'Full specification here...'
      );

      expect(task.id).toBeDefined();
      expect(task.name).toBe('Implement feature');
      expect(task.description).toBe('Add login functionality');
      expect(task.spec).toBe('Full specification here...');
      expect(task.status).toBe('pending');
    });

    it('should create a task with options', () => {
      const task = manager.createTask(
        'Test task',
        'Description',
        'Spec',
        {
          files: { create: ['src/new.ts'], modify: ['src/existing.ts'] },
          priority: 5,
          dependencies: ['dep-1'],
        }
      );

      expect(task.files.create).toEqual(['src/new.ts']);
      expect(task.files.modify).toEqual(['src/existing.ts']);
      expect(task.priority).toBe(5);
      expect(task.dependencies).toEqual(['dep-1']);
    });
  });

  describe('assignTask', () => {
    it('should assign a task to an agent', () => {
      const task = manager.createTask('Task', 'Desc', 'Spec');
      const assigned = manager.assignTask(task.id, 'agent-1');

      expect(assigned?.assignee).toBe('agent-1');
      expect(assigned?.status).toBe('assigned');
    });

    it('should fail if task has unfinished dependencies', () => {
      const dep = manager.createTask('Dependency', 'Desc', 'Spec');
      const task = manager.createTask('Task', 'Desc', 'Spec', {
        dependencies: [dep.id],
      });

      expect(() => manager.assignTask(task.id, 'agent-1')).toThrow('unfinished dependencies');
    });

    it('should allow assignment when dependencies are complete', () => {
      const dep = manager.createTask('Dependency', 'Desc', 'Spec');
      manager.completeTask(dep.id, {
        success: true,
        output: 'Done',
        completedAt: new Date(),
      });

      const task = manager.createTask('Task', 'Desc', 'Spec', {
        dependencies: [dep.id],
      });
      const assigned = manager.assignTask(task.id, 'agent-1');

      expect(assigned?.status).toBe('assigned');
    });
  });

  describe('submitPlan', () => {
    it('should submit a plan for a task', () => {
      const task = manager.createTask('Task', 'Desc', 'Spec');
      manager.assignTask(task.id, 'agent-1');

      const plan: Omit<TaskPlan, 'submittedAt'> = {
        steps: [
          { number: 1, description: 'Write tests', type: 'test' },
          { number: 2, description: 'Implement', type: 'implement' },
        ],
        estimatedMinutes: 10,
      };

      const updated = manager.submitPlan(task.id, plan);

      expect(updated?.plan).toBeDefined();
      expect(updated?.plan?.steps).toHaveLength(2);
      expect(updated?.status).toBe('plan_pending');
    });
  });

  describe('approvePlan / rejectPlan', () => {
    it('should approve a plan', () => {
      const task = manager.createTask('Task', 'Desc', 'Spec');
      manager.assignTask(task.id, 'agent-1');
      manager.submitPlan(task.id, {
        steps: [{ number: 1, description: 'Step', type: 'implement' }],
      });

      const approved = manager.approvePlan(task.id, 'leader-1');

      expect(approved?.status).toBe('approved');
      expect(approved?.plan?.approvedBy).toBe('leader-1');
      expect(approved?.plan?.approvedAt).toBeDefined();
    });

    it('should reject a plan with reason', () => {
      const task = manager.createTask('Task', 'Desc', 'Spec');
      manager.assignTask(task.id, 'agent-1');
      manager.submitPlan(task.id, {
        steps: [{ number: 1, description: 'Step', type: 'implement' }],
      });

      const rejected = manager.rejectPlan(task.id, 'Missing tests');

      expect(rejected?.status).toBe('planning');
      expect(rejected?.plan?.rejectionReason).toBe('Missing tests');
    });
  });

  describe('completeTask / failTask', () => {
    it('should complete a task successfully', () => {
      const task = manager.createTask('Task', 'Desc', 'Spec');
      manager.assignTask(task.id, 'agent-1');
      manager.startTask(task.id);

      const completed = manager.completeTask(task.id, {
        success: true,
        output: 'Feature implemented',
        filesCreated: ['src/feature.ts'],
        completedAt: new Date(),
      });

      expect(completed?.status).toBe('completed');
      expect(completed?.result?.success).toBe(true);
    });

    it('should fail a task', () => {
      const task = manager.createTask('Task', 'Desc', 'Spec');
      const failed = manager.failTask(task.id, ['Build failed', 'Tests failed']);

      expect(failed?.status).toBe('failed');
      expect(failed?.result?.success).toBe(false);
      expect(failed?.result?.errors).toEqual(['Build failed', 'Tests failed']);
    });
  });

  describe('getNextTask', () => {
    it('should return highest priority pending task', () => {
      manager.createTask('Low priority', 'Desc', 'Spec', { priority: 1 });
      manager.createTask('High priority', 'Desc', 'Spec', { priority: 10 });
      manager.createTask('Medium priority', 'Desc', 'Spec', { priority: 5 });

      const next = manager.getNextTask();
      expect(next?.name).toBe('High priority');
    });

    it('should respect dependencies', () => {
      const dep = manager.createTask('Dependency', 'Desc', 'Spec', { priority: 1 });
      manager.createTask('Blocked task', 'Desc', 'Spec', {
        priority: 10,
        dependencies: [dep.id],
      });

      const next = manager.getNextTask();
      expect(next?.name).toBe('Dependency');
    });
  });

  describe('getStats', () => {
    it('should return correct stats', () => {
      manager.createTask('Task 1', 'Desc', 'Spec');
      manager.createTask('Task 2', 'Desc', 'Spec');
      const task3 = manager.createTask('Task 3', 'Desc', 'Spec');
      manager.completeTask(task3.id, {
        success: true,
        output: 'Done',
        completedAt: new Date(),
      });

      const stats = manager.getStats();

      expect(stats.total).toBe(3);
      expect(stats.pending).toBe(2);
      expect(stats.completed).toBe(1);
    });
  });

  describe('event listeners', () => {
    it('should emit task events', () => {
      const events: string[] = [];
      manager.addListener((event) => {
        events.push(event);
      });

      const task = manager.createTask('Task', 'Desc', 'Spec');
      manager.assignTask(task.id, 'agent-1');
      manager.submitPlan(task.id, { steps: [] });
      manager.approvePlan(task.id, 'leader');
      manager.startTask(task.id);
      manager.completeTask(task.id, { success: true, output: '', completedAt: new Date() });

      expect(events).toContain('task:created');
      expect(events).toContain('task:assigned');
      expect(events).toContain('task:plan_submitted');
      expect(events).toContain('task:plan_approved');
      expect(events).toContain('task:started');
      expect(events).toContain('task:completed');
    });
  });
});

describe('TeamMessageBus', () => {
  let bus: TeamMessageBus;

  beforeEach(() => {
    bus = createMessageBus();
  });

  describe('send', () => {
    it('should send a direct message', async () => {
      const message = await bus.send('agent-1', 'agent-2', 'Hello');

      expect(message.type).toBe('direct');
      expect(message.from).toBe('agent-1');
      expect(message.to).toBe('agent-2');
      expect(message.content).toBe('Hello');
    });

    it('should notify registered handlers', async () => {
      let received: TeamMessage | null = null;
      bus.registerHandler('agent-2', (msg) => {
        received = msg;
      });

      await bus.send('agent-1', 'agent-2', 'Test message');

      expect(received).not.toBeNull();
      expect(received?.content).toBe('Test message');
    });
  });

  describe('broadcast', () => {
    it('should broadcast to all agents', async () => {
      const messages: TeamMessage[] = [];
      bus.registerHandler('agent-1', (msg) => messages.push(msg));
      bus.registerHandler('agent-2', (msg) => messages.push(msg));
      bus.registerHandler('agent-3', (msg) => messages.push(msg));

      await bus.broadcast('leader', 'Team announcement');

      expect(messages.length).toBe(3);
      expect(messages.every((m) => m.type === 'broadcast')).toBe(true);
    });

    it('should not send to the sender', async () => {
      let received = false;
      bus.registerHandler('leader', () => {
        received = true;
      });

      await bus.broadcast('leader', 'Message');

      expect(received).toBe(false);
    });
  });

  describe('plan workflow', () => {
    it('should submit and approve plans', async () => {
      const messages: TeamMessage[] = [];
      bus.registerGlobalHandler((msg) => messages.push(msg));

      await bus.submitPlan('agent-1', 'leader', 'task-1', 'Plan summary');
      await bus.approvePlan('leader', 'agent-1', 'task-1', 'Looks good');

      expect(messages.length).toBe(2);
      expect(messages[0].type).toBe('plan_submit');
      expect(messages[1].type).toBe('plan_approve');
    });

    it('should reject plans with reason', async () => {
      const messages: TeamMessage[] = [];
      bus.registerGlobalHandler((msg) => messages.push(msg));

      await bus.submitPlan('agent-1', 'leader', 'task-1', 'Plan');
      await bus.rejectPlan('leader', 'agent-1', 'task-1', 'Missing tests');

      expect(messages[1].type).toBe('plan_reject');
      expect(messages[1].content).toBe('Missing tests');
    });
  });

  describe('shutdown workflow', () => {
    it('should request and approve shutdown', async () => {
      const messages: TeamMessage[] = [];
      bus.registerGlobalHandler((msg) => messages.push(msg));

      await bus.requestShutdown('agent-1', 'leader', 'Work complete');
      await bus.approveShutdown('leader', 'agent-1');

      expect(messages[0].type).toBe('shutdown_request');
      expect(messages[1].type).toBe('shutdown_approve');
    });
  });

  describe('getMessages', () => {
    it('should get messages for an agent', async () => {
      await bus.send('agent-1', 'agent-2', 'Hello');
      await bus.send('agent-3', 'agent-2', 'Hi there');
      await bus.send('agent-1', 'agent-3', 'Not for agent-2');

      const messages = bus.getMessagesForAgent('agent-2');
      expect(messages.length).toBe(2);
    });

    it('should get messages for a task', async () => {
      await bus.send('agent-1', 'agent-2', 'Message 1', { taskId: 'task-1' });
      await bus.send('agent-1', 'agent-2', 'Message 2', { taskId: 'task-1' });
      await bus.send('agent-1', 'agent-2', 'Message 3', { taskId: 'task-2' });

      const messages = bus.getMessagesForTask('task-1');
      expect(messages.length).toBe(2);
    });
  });
});

describe('TeamOrchestrator', () => {
  let orchestrator: TeamOrchestrator;

  beforeEach(() => {
    orchestrator = createTeamOrchestrator({
      projectPath: '/test/project',
      requirePlanApproval: true,
    });
  });

  describe('spawnTeam', () => {
    it('should create a team with a leader', async () => {
      const team = await orchestrator.spawnTeam({
        name: 'Test Team',
        leaderAgent: 'claude-code',
      });

      expect(team.id).toBeDefined();
      expect(team.name).toBe('Test Team');
      expect(team.leader.role).toBe('leader');
      expect(team.leader.agentType).toBe('claude-code');
      expect(team.status).toBe('working');
    });

    it('should auto-spawn teammates', async () => {
      const team = await orchestrator.spawnTeam({
        name: 'Full Team',
        leaderAgent: 'claude-code',
        teammateAgents: ['cursor', 'copilot'],
        autoSpawn: true,
      });

      expect(team.teammates.length).toBe(2);
      expect(team.teammates[0].agentType).toBe('cursor');
      expect(team.teammates[1].agentType).toBe('copilot');
    });
  });

  describe('spawnTeammate', () => {
    it('should add a teammate to an existing team', async () => {
      const team = await orchestrator.spawnTeam({
        name: 'Team',
        leaderAgent: 'claude-code',
      });

      const teammate = await orchestrator.spawnTeammate(team.id, 'cursor');

      expect(teammate.role).toBe('teammate');
      expect(teammate.agentType).toBe('cursor');

      const updatedTeam = orchestrator.getTeam(team.id);
      expect(updatedTeam?.teammates.length).toBe(1);
    });
  });

  describe('createTask', () => {
    it('should create a task in a team', async () => {
      const team = await orchestrator.spawnTeam({
        name: 'Team',
        leaderAgent: 'claude-code',
      });

      const task = await orchestrator.createTask(
        team.id,
        'Implement feature',
        'Add login',
        'Full spec'
      );

      expect(task.id).toBeDefined();
      expect(task.name).toBe('Implement feature');
    });
  });

  describe('assignTask', () => {
    it('should assign a task to a teammate', async () => {
      const team = await orchestrator.spawnTeam({
        name: 'Team',
        leaderAgent: 'claude-code',
        teammateAgents: ['cursor'],
        autoSpawn: true,
      });

      const task = await orchestrator.createTask(team.id, 'Task', 'Desc', 'Spec');
      const assigned = await orchestrator.assignTask(team.id, task.id, team.teammates[0].id);

      expect(assigned?.assignee).toBe(team.teammates[0].id);
      expect(team.teammates[0].status).toBe('planning');
    });
  });

  describe('plan approval workflow', () => {
    it('should submit and approve plans', async () => {
      const team = await orchestrator.spawnTeam({
        name: 'Team',
        leaderAgent: 'claude-code',
        teammateAgents: ['cursor'],
        autoSpawn: true,
      });

      const task = await orchestrator.createTask(team.id, 'Task', 'Desc', 'Spec');
      await orchestrator.assignTask(team.id, task.id, team.teammates[0].id);

      await orchestrator.submitPlan(team.id, task.id, {
        steps: [{ number: 1, description: 'Implement', type: 'implement' }],
      });

      const taskManager = orchestrator.getTaskManager(team.id);
      let updated = taskManager?.getTask(task.id);
      expect(updated?.status).toBe('plan_pending');

      await orchestrator.approvePlan(team.id, task.id);
      updated = taskManager?.getTask(task.id);
      expect(updated?.status).toBe('approved');
    });

    it('should reject plans with feedback', async () => {
      const team = await orchestrator.spawnTeam({
        name: 'Team',
        leaderAgent: 'claude-code',
        teammateAgents: ['cursor'],
        autoSpawn: true,
      });

      const task = await orchestrator.createTask(team.id, 'Task', 'Desc', 'Spec');
      await orchestrator.assignTask(team.id, task.id, team.teammates[0].id);
      await orchestrator.submitPlan(team.id, task.id, { steps: [] });

      await orchestrator.rejectPlan(team.id, task.id, 'Need more detail');

      const taskManager = orchestrator.getTaskManager(team.id);
      const updated = taskManager?.getTask(task.id);
      expect(updated?.status).toBe('planning');
      expect(updated?.plan?.rejectionReason).toBe('Need more detail');
    });
  });

  describe('shutdown workflow', () => {
    it('should request and approve agent shutdown', async () => {
      const team = await orchestrator.spawnTeam({
        name: 'Team',
        leaderAgent: 'claude-code',
        teammateAgents: ['cursor'],
        autoSpawn: true,
      });

      const teammate = team.teammates[0];

      await orchestrator.requestShutdown(team.id, teammate.id, 'Work complete');
      expect(teammate.status).toBe('shutdown_requested');

      await orchestrator.approveShutdown(team.id, teammate.id);
      expect(teammate.status).toBe('shutdown');
    });
  });

  describe('messaging', () => {
    it('should send direct messages', async () => {
      const team = await orchestrator.spawnTeam({
        name: 'Team',
        leaderAgent: 'claude-code',
        teammateAgents: ['cursor'],
        autoSpawn: true,
      });

      await orchestrator.send(
        team.id,
        team.leader.id,
        team.teammates[0].id,
        'Start working on task'
      );

      const bus = orchestrator.getMessageBus(team.id);
      const messages = bus?.getMessagesFromAgent(team.leader.id);
      expect(messages?.length).toBe(1);
    });

    it('should broadcast messages', async () => {
      const team = await orchestrator.spawnTeam({
        name: 'Team',
        leaderAgent: 'claude-code',
        teammateAgents: ['cursor', 'copilot'],
        autoSpawn: true,
      });

      await orchestrator.broadcast(team.id, team.leader.id, 'Team update');

      const bus = orchestrator.getMessageBus(team.id);
      expect(bus?.messageCount).toBe(1);
    });
  });

  describe('shutdownTeam', () => {
    it('should shutdown a team', async () => {
      const team = await orchestrator.spawnTeam({
        name: 'Team',
        leaderAgent: 'claude-code',
        teammateAgents: ['cursor'],
        autoSpawn: true,
      });

      await orchestrator.shutdownTeam(team.id);

      expect(orchestrator.getTeam(team.id)).toBeUndefined();
      expect(orchestrator.getTaskManager(team.id)).toBeUndefined();
      expect(orchestrator.getMessageBus(team.id)).toBeUndefined();
    });
  });

  describe('getTeamStats', () => {
    it('should return team statistics', async () => {
      const team = await orchestrator.spawnTeam({
        name: 'Team',
        leaderAgent: 'claude-code',
        teammateAgents: ['cursor', 'copilot'],
        autoSpawn: true,
      });

      await orchestrator.createTask(team.id, 'Task 1', 'Desc', 'Spec');
      await orchestrator.createTask(team.id, 'Task 2', 'Desc', 'Spec');

      const stats = orchestrator.getTeamStats(team.id);

      expect(stats?.agents.total).toBe(3); // leader + 2 teammates
      expect(stats?.tasks.total).toBe(2);
    });
  });

  describe('event listeners', () => {
    it('should emit team events', async () => {
      const events: string[] = [];
      orchestrator.addListener((event) => {
        events.push(event);
      });

      const team = await orchestrator.spawnTeam({
        name: 'Team',
        leaderAgent: 'claude-code',
      });

      await orchestrator.spawnTeammate(team.id, 'cursor');
      await orchestrator.shutdownTeam(team.id);

      expect(events).toContain('team:created');
      expect(events).toContain('team:teammate_spawned');
      expect(events).toContain('team:shutdown');
    });
  });
});
