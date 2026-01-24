/**
 * Team Orchestrator
 *
 * Coordinates multi-agent teams with task assignment, plan approval, and review workflows.
 */

import { randomUUID } from 'node:crypto';
import type { AgentType } from '../types.js';
import type {
  Team,
  OrchestratorTeamConfig,
  AgentInstance,
  Task,
  TaskPlan,
  TaskFilter,
  ReviewStage,
  ReviewResult,
  PlanResult,
  OrchestratorOptions,
  TeamEvent,
  TeamEventListener,
} from './types.js';
import { TaskManager, createTaskManager } from './task.js';
import { TeamMessageBus, createMessageBus } from './messages.js';

/**
 * Default review stages
 */
const DEFAULT_REVIEW_STAGES: ReviewStage[] = [
  {
    name: 'spec-compliance',
    prompt: 'Review the implementation for specification compliance. Verify all requirements are met.',
    required: true,
    reviewer: 'leader',
  },
  {
    name: 'code-quality',
    prompt: 'Review the code quality, style, and best practices. Check for maintainability.',
    required: true,
    reviewer: 'leader',
  },
];

/**
 * TeamOrchestrator - Coordinates multi-agent teams
 */
export class TeamOrchestrator {
  private teams: Map<string, Team> = new Map();
  private taskManagers: Map<string, TaskManager> = new Map();
  private messageBuses: Map<string, TeamMessageBus> = new Map();
  private listeners: Set<TeamEventListener> = new Set();
  private options: Required<OrchestratorOptions>;

  constructor(options: OrchestratorOptions) {
    this.options = {
      projectPath: options.projectPath,
      defaultReviewStages: options.defaultReviewStages || DEFAULT_REVIEW_STAGES,
      requirePlanApproval: options.requirePlanApproval ?? true,
      taskTimeout: options.taskTimeout ?? 300000, // 5 minutes
      enableMethodology: options.enableMethodology ?? true,
      verbose: options.verbose ?? false,
    };
  }

  /**
   * Spawn a new team
   */
  async spawnTeam(config: OrchestratorTeamConfig): Promise<Team> {
    const teamId = randomUUID();
    const now = new Date();

    // Create leader agent
    const leader: AgentInstance = {
      id: randomUUID(),
      role: 'leader',
      agentType: config.leaderAgent,
      status: 'idle',
      spawnedAt: now,
      lastActivityAt: now,
    };

    // Create team
    const team: Team = {
      id: teamId,
      name: config.name,
      leader,
      teammates: [],
      tasks: [],
      status: 'forming',
      createdAt: now,
      config: {
        ...config,
        requirePlanApproval: config.requirePlanApproval ?? this.options.requirePlanApproval,
        reviewStages: config.reviewStages || this.options.defaultReviewStages.map((s) => s.name),
      },
      metadata: config.metadata,
    };

    // Create task manager and message bus for this team
    this.taskManagers.set(teamId, createTaskManager());
    this.messageBuses.set(teamId, createMessageBus());

    this.teams.set(teamId, team);

    // Auto-spawn teammates if configured
    if (config.autoSpawn && config.teammateAgents) {
      for (const agentType of config.teammateAgents) {
        await this.spawnTeammate(teamId, agentType);
      }
    }

    team.status = 'working';
    this.emit('team:created', team);

    return team;
  }

  /**
   * Spawn a teammate agent
   */
  async spawnTeammate(teamId: string, agentType: AgentType): Promise<AgentInstance> {
    const team = this.teams.get(teamId);
    if (!team) throw new Error(`Team not found: ${teamId}`);

    const now = new Date();
    const teammate: AgentInstance = {
      id: randomUUID(),
      role: 'teammate',
      agentType,
      status: 'idle',
      spawnedAt: now,
      lastActivityAt: now,
    };

    team.teammates.push(teammate);
    this.emit('team:teammate_spawned', team, teammate);

    return teammate;
  }

  /**
   * Get a team by ID
   */
  getTeam(teamId: string): Team | undefined {
    return this.teams.get(teamId);
  }

  /**
   * Get all teams
   */
  getAllTeams(): Team[] {
    return Array.from(this.teams.values());
  }

  /**
   * Get task manager for a team
   */
  getTaskManager(teamId: string): TaskManager | undefined {
    return this.taskManagers.get(teamId);
  }

  /**
   * Get message bus for a team
   */
  getMessageBus(teamId: string): TeamMessageBus | undefined {
    return this.messageBuses.get(teamId);
  }

  /**
   * Create a task in a team
   */
  async createTask(
    teamId: string,
    name: string,
    description: string,
    spec: string,
    options?: Parameters<TaskManager['createTask']>[3]
  ): Promise<Task> {
    const taskManager = this.taskManagers.get(teamId);
    if (!taskManager) throw new Error(`Team not found: ${teamId}`);

    const task = taskManager.createTask(name, description, spec, options);

    // Update team's task list
    const team = this.teams.get(teamId);
    if (team) {
      team.tasks.push(task);
    }

    return task;
  }

  /**
   * Assign a task to an agent
   */
  async assignTask(teamId: string, taskId: string, agentId: string): Promise<Task | undefined> {
    const taskManager = this.taskManagers.get(teamId);
    const messageBus = this.messageBuses.get(teamId);
    const team = this.teams.get(teamId);

    if (!taskManager || !messageBus || !team) {
      throw new Error(`Team not found: ${teamId}`);
    }

    // Verify agent exists in team
    const agent = this.findAgent(team, agentId);
    if (!agent) throw new Error(`Agent not found in team: ${agentId}`);

    const task = taskManager.assignTask(taskId, agentId);
    if (!task) return undefined;

    // Update agent status
    agent.currentTask = taskId;
    agent.status = 'planning';
    agent.lastActivityAt = new Date();

    // Notify agent
    await messageBus.notifyTaskAssignment(
      team.leader.id,
      agentId,
      taskId,
      `Assigned: ${task.name}\n\n${task.description}`
    );

    return task;
  }

  /**
   * List tasks in a team
   */
  listTasks(teamId: string, filter?: TaskFilter): Task[] {
    const taskManager = this.taskManagers.get(teamId);
    if (!taskManager) throw new Error(`Team not found: ${teamId}`);

    return taskManager.listTasks(filter);
  }

  /**
   * Submit a plan for a task
   */
  async submitPlan(
    teamId: string,
    taskId: string,
    plan: Omit<TaskPlan, 'submittedAt'>
  ): Promise<Task | undefined> {
    const taskManager = this.taskManagers.get(teamId);
    const messageBus = this.messageBuses.get(teamId);
    const team = this.teams.get(teamId);

    if (!taskManager || !messageBus || !team) {
      throw new Error(`Team not found: ${teamId}`);
    }

    const task = taskManager.submitPlan(taskId, plan);
    if (!task) return undefined;

    // Update agent status
    if (task.assignee) {
      const agent = this.findAgent(team, task.assignee);
      if (agent) {
        agent.status = 'reviewing';
        agent.lastActivityAt = new Date();
      }
    }

    // Notify leader
    const planSummary = plan.steps.map((s) => `${s.number}. ${s.description}`).join('\n');
    await messageBus.submitPlan(
      task.assignee || 'unknown',
      team.leader.id,
      taskId,
      `Plan submitted for: ${task.name}\n\n${planSummary}`
    );

    // If plan approval not required, auto-approve
    if (!team.config.requirePlanApproval) {
      return this.approvePlan(teamId, taskId);
    }

    return task;
  }

  /**
   * Approve a task plan
   */
  async approvePlan(teamId: string, taskId: string): Promise<Task | undefined> {
    const taskManager = this.taskManagers.get(teamId);
    const messageBus = this.messageBuses.get(teamId);
    const team = this.teams.get(teamId);

    if (!taskManager || !messageBus || !team) {
      throw new Error(`Team not found: ${teamId}`);
    }

    const task = taskManager.approvePlan(taskId, team.leader.id);
    if (!task) return undefined;

    // Update agent status
    if (task.assignee) {
      const agent = this.findAgent(team, task.assignee);
      if (agent) {
        agent.status = 'executing';
        agent.lastActivityAt = new Date();
      }
    }

    // Notify agent
    await messageBus.approvePlan(team.leader.id, task.assignee || 'unknown', taskId, 'Plan approved. Proceed with implementation.');

    return task;
  }

  /**
   * Reject a task plan
   */
  async rejectPlan(teamId: string, taskId: string, reason: string): Promise<Task | undefined> {
    const taskManager = this.taskManagers.get(teamId);
    const messageBus = this.messageBuses.get(teamId);
    const team = this.teams.get(teamId);

    if (!taskManager || !messageBus || !team) {
      throw new Error(`Team not found: ${teamId}`);
    }

    const task = taskManager.rejectPlan(taskId, reason);
    if (!task) return undefined;

    // Update agent status back to planning
    if (task.assignee) {
      const agent = this.findAgent(team, task.assignee);
      if (agent) {
        agent.status = 'planning';
        agent.lastActivityAt = new Date();
      }
    }

    // Notify agent
    await messageBus.rejectPlan(team.leader.id, task.assignee || 'unknown', taskId, reason);

    return task;
  }

  /**
   * Request agent shutdown
   */
  async requestShutdown(teamId: string, agentId: string, reason?: string): Promise<void> {
    const messageBus = this.messageBuses.get(teamId);
    const team = this.teams.get(teamId);

    if (!messageBus || !team) {
      throw new Error(`Team not found: ${teamId}`);
    }

    const agent = this.findAgent(team, agentId);
    if (!agent) throw new Error(`Agent not found: ${agentId}`);

    agent.status = 'shutdown_requested';
    agent.lastActivityAt = new Date();

    // Notify leader
    await messageBus.requestShutdown(agentId, team.leader.id, reason);
  }

  /**
   * Approve agent shutdown
   */
  async approveShutdown(teamId: string, agentId: string): Promise<void> {
    const messageBus = this.messageBuses.get(teamId);
    const team = this.teams.get(teamId);

    if (!messageBus || !team) {
      throw new Error(`Team not found: ${teamId}`);
    }

    const agent = this.findAgent(team, agentId);
    if (!agent) throw new Error(`Agent not found: ${agentId}`);

    agent.status = 'shutdown';
    agent.lastActivityAt = new Date();
    agent.currentTask = undefined;

    // Notify agent
    await messageBus.approveShutdown(team.leader.id, agentId);

    this.emit('team:teammate_shutdown', team, agent);
  }

  /**
   * Send a message
   */
  async send(
    teamId: string,
    from: string,
    to: string,
    content: string,
    taskId?: string
  ): Promise<void> {
    const messageBus = this.messageBuses.get(teamId);
    if (!messageBus) throw new Error(`Team not found: ${teamId}`);

    await messageBus.send(from, to, content, { taskId });
  }

  /**
   * Broadcast a message
   */
  async broadcast(teamId: string, from: string, content: string): Promise<void> {
    const messageBus = this.messageBuses.get(teamId);
    if (!messageBus) throw new Error(`Team not found: ${teamId}`);

    await messageBus.broadcast(from, content);
  }

  /**
   * Run review on a task
   */
  async runReview(
    teamId: string,
    taskId: string,
    stage: ReviewStage,
    _implementation: string
  ): Promise<ReviewResult> {
    const team = this.teams.get(teamId);
    const taskManager = this.taskManagers.get(teamId);

    if (!team || !taskManager) {
      throw new Error(`Team not found: ${teamId}`);
    }

    const task = taskManager.getTask(taskId);
    if (!task) throw new Error(`Task not found: ${taskId}`);

    // Mark task as under review
    taskManager.markForReview(taskId);

    // Simulate review (in production, this would invoke the reviewer agent)
    const result: ReviewResult = {
      passed: true,
      issues: [],
      summary: `${stage.name} review passed`,
      reviewerId: team.leader.id,
      reviewedAt: new Date(),
    };

    return result;
  }

  /**
   * Execute a full plan with all tasks
   */
  async executePlan(teamId: string): Promise<PlanResult> {
    const team = this.teams.get(teamId);
    const taskManager = this.taskManagers.get(teamId);

    if (!team || !taskManager) {
      throw new Error(`Team not found: ${teamId}`);
    }

    const startTime = Date.now();
    const taskResults = new Map();
    const failedTasks: string[] = [];

    // Process tasks in order, respecting dependencies
    while (!taskManager.allTasksComplete()) {
      const nextTask = taskManager.getNextTask();
      if (!nextTask) {
        // No more tasks can be executed (might be blocked by dependencies)
        break;
      }

      // Find an idle agent to assign
      const idleAgent = team.teammates.find((a) => a.status === 'idle') || team.leader;

      // Assign and execute
      await this.assignTask(teamId, nextTask.id, idleAgent.id);

      // Start task
      taskManager.startTask(nextTask.id);

      // Simulate execution (in production, agent would do the work)
      const result = {
        success: true,
        output: `Completed: ${nextTask.name}`,
        completedAt: new Date(),
      };

      taskManager.completeTask(nextTask.id, result);
      taskResults.set(nextTask.id, result);

      // Mark agent as idle
      idleAgent.status = 'idle';
      idleAgent.currentTask = undefined;
    }

    // Check for failed or incomplete tasks
    const allTasks = taskManager.getAllTasks();
    for (const task of allTasks) {
      if (task.status === 'failed') {
        failedTasks.push(task.id);
      }
    }

    // Also check for incomplete tasks (pending, in_progress, etc.)
    const incomplete = allTasks.filter(
      (task) => task.status !== 'completed' && task.status !== 'failed'
    );
    if (incomplete.length > 0) {
      failedTasks.push(...incomplete.map((task) => task.id));
    }

    return {
      success: failedTasks.length === 0,
      taskResults,
      failedTasks,
      durationMs: Date.now() - startTime,
    };
  }

  /**
   * Shutdown a team
   */
  async shutdownTeam(teamId: string): Promise<void> {
    const team = this.teams.get(teamId);
    if (!team) throw new Error(`Team not found: ${teamId}`);

    // Request shutdown for all teammates
    for (const teammate of team.teammates) {
      if (teammate.status !== 'shutdown') {
        teammate.status = 'shutdown';
      }
    }

    // Mark leader as shutdown
    team.leader.status = 'shutdown';
    team.status = 'shutdown';

    this.emit('team:shutdown', team);

    // Clean up resources
    this.taskManagers.delete(teamId);
    this.messageBuses.delete(teamId);
    this.teams.delete(teamId);
  }

  /**
   * Get team stats
   */
  getTeamStats(teamId: string): {
    agents: { total: number; active: number; idle: number };
    tasks: ReturnType<TaskManager['getStats']>;
    messages: number;
  } | undefined {
    const team = this.teams.get(teamId);
    const taskManager = this.taskManagers.get(teamId);
    const messageBus = this.messageBuses.get(teamId);

    if (!team || !taskManager || !messageBus) return undefined;

    const allAgents = [team.leader, ...team.teammates];

    return {
      agents: {
        total: allAgents.length,
        active: allAgents.filter((a) => a.status !== 'idle' && a.status !== 'shutdown').length,
        idle: allAgents.filter((a) => a.status === 'idle').length,
      },
      tasks: taskManager.getStats(),
      messages: messageBus.messageCount,
    };
  }

  /**
   * Add event listener
   */
  addListener(listener: TeamEventListener): void {
    this.listeners.add(listener);
  }

  /**
   * Remove event listener
   */
  removeListener(listener: TeamEventListener): void {
    this.listeners.delete(listener);
  }

  /**
   * Find an agent in a team
   */
  private findAgent(team: Team, agentId: string): AgentInstance | undefined {
    if (team.leader.id === agentId) return team.leader;
    return team.teammates.find((t) => t.id === agentId);
  }

  /**
   * Emit team event
   */
  private emit(event: TeamEvent, team: Team, agent?: AgentInstance): void {
    for (const listener of this.listeners) {
      try {
        // Call listener (may return Promise or void)
        const result = listener(event, team, agent);
        // If it returns a Promise, catch rejections
        if (result instanceof Promise) {
          result.catch(() => {
            // Ignore async listener errors
          });
        }
      } catch {
        // Ignore sync listener errors
      }
    }
  }
}

/**
 * Create a TeamOrchestrator instance
 */
export function createTeamOrchestrator(options: OrchestratorOptions): TeamOrchestrator {
  return new TeamOrchestrator(options);
}
