import type { Message, MessageDeliveryResult } from '../types.js';
import { InboxStorage } from '../storage/inbox.js';

export class LocalTransport {
  private agents: Map<string, InboxStorage> = new Map();

  register(agentId: string, inbox: InboxStorage): void {
    this.agents.set(agentId, inbox);
  }

  unregister(agentId: string): void {
    this.agents.delete(agentId);
  }

  async deliver(message: Message): Promise<MessageDeliveryResult> {
    const inbox = this.agents.get(message.to);

    if (!inbox) {
      return {
        messageId: message.id,
        delivered: false,
        error: `Agent ${message.to} not found locally`,
        via: 'local',
      };
    }

    try {
      await inbox.save(message);

      return {
        messageId: message.id,
        delivered: true,
        deliveredAt: new Date().toISOString(),
        via: 'local',
      };
    } catch (err: any) {
      return {
        messageId: message.id,
        delivered: false,
        error: err.message,
        via: 'local',
      };
    }
  }

  async broadcast(message: Message, excludeFrom = true): Promise<Map<string, MessageDeliveryResult>> {
    const results = new Map<string, MessageDeliveryResult>();

    for (const [agentId] of this.agents) {
      if (excludeFrom && agentId === message.from) continue;

      const targetMessage = { ...message, to: agentId };
      const result = await this.deliver(targetMessage);
      results.set(agentId, result);
    }

    return results;
  }

  getRegisteredAgents(): string[] {
    return Array.from(this.agents.keys());
  }

  isRegistered(agentId: string): boolean {
    return this.agents.has(agentId);
  }
}

let globalTransport: LocalTransport | null = null;

export function getLocalTransport(): LocalTransport {
  if (!globalTransport) {
    globalTransport = new LocalTransport();
  }
  return globalTransport;
}
