import type { Message, MessageDeliveryResult } from '../types.js';
import { InboxStorage } from '../storage/inbox.js';
import { SentStorage } from '../storage/sent.js';
import { ArchivedStorage } from '../storage/archived.js';

export interface RouterConfig {
  localAgentId: string;
  inboxStorage: InboxStorage;
  sentStorage: SentStorage;
  archivedStorage: ArchivedStorage;
}

export interface RemoteDeliveryHandler {
  (message: Message, hostAddress: string): Promise<MessageDeliveryResult>;
}

export class MessageRouter {
  private config: RouterConfig;
  private localAgents: Map<string, InboxStorage> = new Map();
  private remoteHandler?: RemoteDeliveryHandler;

  constructor(config: RouterConfig) {
    this.config = config;
    this.localAgents.set(config.localAgentId, config.inboxStorage);
  }

  registerLocalAgent(agentId: string, inbox: InboxStorage): void {
    this.localAgents.set(agentId, inbox);
  }

  unregisterLocalAgent(agentId: string): void {
    if (agentId !== this.config.localAgentId) {
      this.localAgents.delete(agentId);
    }
  }

  setRemoteHandler(handler: RemoteDeliveryHandler): void {
    this.remoteHandler = handler;
  }

  async route(message: Message): Promise<MessageDeliveryResult> {
    const recipient = this.parseRecipient(message.to);

    await this.config.sentStorage.save(message);

    if (recipient.isLocal) {
      return this.deliverLocal(message, recipient.agentId);
    }

    return this.deliverRemote(message, recipient.host!, recipient.agentId);
  }

  async deliverLocal(message: Message, agentId: string): Promise<MessageDeliveryResult> {
    const inbox = this.localAgents.get(agentId);

    if (!inbox) {
      return {
        messageId: message.id,
        delivered: false,
        error: `Agent ${agentId} not found locally`,
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

  async deliverRemote(
    message: Message,
    hostAddress: string,
    _agentId: string
  ): Promise<MessageDeliveryResult> {
    if (!this.remoteHandler) {
      return {
        messageId: message.id,
        delivered: false,
        error: 'No remote delivery handler configured',
        via: 'remote',
      };
    }

    try {
      return await this.remoteHandler(message, hostAddress);
    } catch (err: any) {
      return {
        messageId: message.id,
        delivered: false,
        error: err.message,
        via: 'remote',
      };
    }
  }

  async archive(messageId: string): Promise<boolean> {
    const message = await this.config.inboxStorage.get(messageId);
    if (!message) return false;

    await this.config.archivedStorage.save(message);
    await this.config.inboxStorage.delete(messageId);

    return true;
  }

  async unarchive(messageId: string): Promise<boolean> {
    const message = await this.config.archivedStorage.get(messageId);
    if (!message) return false;

    message.status = 'read';
    await this.config.inboxStorage.save(message);
    await this.config.archivedStorage.delete(messageId);

    return true;
  }

  getLocalAgents(): string[] {
    return Array.from(this.localAgents.keys());
  }

  isLocalAgent(agentId: string): boolean {
    return this.localAgents.has(agentId);
  }

  private parseRecipient(to: string): {
    agentId: string;
    host?: string;
    isLocal: boolean;
  } {
    if (to.includes('@')) {
      const [agentId, host] = to.split('@');
      return { agentId, host, isLocal: false };
    }

    return {
      agentId: to,
      isLocal: this.localAgents.has(to),
    };
  }
}
