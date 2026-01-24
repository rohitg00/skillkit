/**
 * Team Message Bus
 *
 * Handles inter-agent communication within a team.
 */

import { randomUUID } from 'node:crypto';
import type { TeamMessage, MessageType, MessageHandler } from './types.js';

/**
 * TeamMessageBus - Handles team communication
 */
export class TeamMessageBus {
  private messages: TeamMessage[] = [];
  private handlers: Map<string, Set<MessageHandler>> = new Map();
  private globalHandlers: Set<MessageHandler> = new Set();
  private maxMessages: number;

  constructor(options?: { maxMessages?: number }) {
    this.maxMessages = options?.maxMessages ?? 1000;
  }

  /**
   * Send a direct message to a specific agent
   */
  async send(
    from: string,
    to: string,
    content: string,
    options?: {
      type?: MessageType;
      taskId?: string;
      metadata?: Record<string, unknown>;
    }
  ): Promise<TeamMessage> {
    const message: TeamMessage = {
      id: randomUUID(),
      type: options?.type || 'direct',
      from,
      to,
      content,
      taskId: options?.taskId,
      metadata: options?.metadata,
      timestamp: new Date(),
    };

    this.addMessage(message);
    await this.notifyHandlers(to, message);
    await this.notifyGlobalHandlers(message);

    return message;
  }

  /**
   * Broadcast a message to all agents
   */
  async broadcast(
    from: string,
    content: string,
    options?: {
      taskId?: string;
      metadata?: Record<string, unknown>;
    }
  ): Promise<TeamMessage> {
    const message: TeamMessage = {
      id: randomUUID(),
      type: 'broadcast',
      from,
      content,
      taskId: options?.taskId,
      metadata: options?.metadata,
      timestamp: new Date(),
    };

    this.addMessage(message);

    // Notify all registered handlers
    for (const [agentId, handlers] of this.handlers) {
      if (agentId !== from) {
        for (const handler of handlers) {
          try {
            await handler(message);
          } catch {
            // Ignore handler errors
          }
        }
      }
    }

    await this.notifyGlobalHandlers(message);

    return message;
  }

  /**
   * Submit a plan for approval
   */
  async submitPlan(
    from: string,
    leaderId: string,
    taskId: string,
    planSummary: string
  ): Promise<TeamMessage> {
    return this.send(from, leaderId, planSummary, {
      type: 'plan_submit',
      taskId,
      metadata: { action: 'submit_plan' },
    });
  }

  /**
   * Approve a plan
   */
  async approvePlan(
    leaderId: string,
    teammateId: string,
    taskId: string,
    feedback?: string
  ): Promise<TeamMessage> {
    return this.send(leaderId, teammateId, feedback || 'Plan approved', {
      type: 'plan_approve',
      taskId,
      metadata: { action: 'approve_plan' },
    });
  }

  /**
   * Reject a plan
   */
  async rejectPlan(
    leaderId: string,
    teammateId: string,
    taskId: string,
    reason: string
  ): Promise<TeamMessage> {
    return this.send(leaderId, teammateId, reason, {
      type: 'plan_reject',
      taskId,
      metadata: { action: 'reject_plan' },
    });
  }

  /**
   * Request shutdown
   */
  async requestShutdown(
    from: string,
    leaderId: string,
    reason?: string
  ): Promise<TeamMessage> {
    return this.send(from, leaderId, reason || 'Requesting shutdown', {
      type: 'shutdown_request',
      metadata: { action: 'shutdown_request' },
    });
  }

  /**
   * Approve shutdown
   */
  async approveShutdown(
    leaderId: string,
    agentId: string
  ): Promise<TeamMessage> {
    return this.send(leaderId, agentId, 'Shutdown approved', {
      type: 'shutdown_approve',
      metadata: { action: 'shutdown_approve' },
    });
  }

  /**
   * Send task assignment notification
   */
  async notifyTaskAssignment(
    leaderId: string,
    agentId: string,
    taskId: string,
    taskSummary: string
  ): Promise<TeamMessage> {
    return this.send(leaderId, agentId, taskSummary, {
      type: 'task_assign',
      taskId,
      metadata: { action: 'assign_task' },
    });
  }

  /**
   * Request review
   */
  async requestReview(
    from: string,
    reviewerId: string,
    taskId: string,
    details: string
  ): Promise<TeamMessage> {
    return this.send(from, reviewerId, details, {
      type: 'review_request',
      taskId,
      metadata: { action: 'request_review' },
    });
  }

  /**
   * Complete review
   */
  async completeReview(
    reviewerId: string,
    agentId: string,
    taskId: string,
    result: string,
    passed: boolean
  ): Promise<TeamMessage> {
    return this.send(reviewerId, agentId, result, {
      type: 'review_complete',
      taskId,
      metadata: { action: 'complete_review', passed },
    });
  }

  /**
   * Register a message handler for an agent
   */
  registerHandler(agentId: string, handler: MessageHandler): void {
    if (!this.handlers.has(agentId)) {
      this.handlers.set(agentId, new Set());
    }
    this.handlers.get(agentId)!.add(handler);
  }

  /**
   * Unregister a message handler
   */
  unregisterHandler(agentId: string, handler: MessageHandler): void {
    const handlers = this.handlers.get(agentId);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /**
   * Register a global message handler (receives all messages)
   */
  registerGlobalHandler(handler: MessageHandler): void {
    this.globalHandlers.add(handler);
  }

  /**
   * Unregister a global handler
   */
  unregisterGlobalHandler(handler: MessageHandler): void {
    this.globalHandlers.delete(handler);
  }

  /**
   * Get messages for an agent
   */
  getMessagesForAgent(agentId: string): TeamMessage[] {
    return this.messages.filter((m) => m.to === agentId || (m.type === 'broadcast' && m.from !== agentId));
  }

  /**
   * Get messages from an agent
   */
  getMessagesFromAgent(agentId: string): TeamMessage[] {
    return this.messages.filter((m) => m.from === agentId);
  }

  /**
   * Get messages for a task
   */
  getMessagesForTask(taskId: string): TeamMessage[] {
    return this.messages.filter((m) => m.taskId === taskId);
  }

  /**
   * Get all messages
   */
  getAllMessages(): TeamMessage[] {
    return [...this.messages];
  }

  /**
   * Get recent messages
   */
  getRecentMessages(count: number): TeamMessage[] {
    return this.messages.slice(-count);
  }

  /**
   * Get messages by type
   */
  getMessagesByType(type: MessageType): TeamMessage[] {
    return this.messages.filter((m) => m.type === type);
  }

  /**
   * Get conversation between two agents
   */
  getConversation(agent1: string, agent2: string): TeamMessage[] {
    return this.messages.filter(
      (m) =>
        m.type === 'direct' &&
        ((m.from === agent1 && m.to === agent2) || (m.from === agent2 && m.to === agent1))
    );
  }

  /**
   * Clear all messages
   */
  clear(): void {
    this.messages = [];
  }

  /**
   * Add a message to the history
   */
  private addMessage(message: TeamMessage): void {
    this.messages.push(message);

    // Trim if exceeds max
    if (this.messages.length > this.maxMessages) {
      this.messages = this.messages.slice(-this.maxMessages);
    }
  }

  /**
   * Notify handlers for a specific agent
   */
  private async notifyHandlers(agentId: string, message: TeamMessage): Promise<void> {
    const handlers = this.handlers.get(agentId);
    if (!handlers) return;

    for (const handler of handlers) {
      try {
        await handler(message);
      } catch {
        // Ignore handler errors
      }
    }
  }

  /**
   * Notify global handlers
   */
  private async notifyGlobalHandlers(message: TeamMessage): Promise<void> {
    for (const handler of this.globalHandlers) {
      try {
        await handler(message);
      } catch {
        // Ignore handler errors
      }
    }
  }

  /**
   * Get message count
   */
  get messageCount(): number {
    return this.messages.length;
  }
}

/**
 * Create a TeamMessageBus instance
 */
export function createMessageBus(options?: { maxMessages?: number }): TeamMessageBus {
  return new TeamMessageBus(options);
}
