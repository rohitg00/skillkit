export * from './types.js';

export { InboxStorage } from './storage/inbox.js';
export { SentStorage } from './storage/sent.js';
export { ArchivedStorage } from './storage/archived.js';

export {
  MessageBuilder,
  createMessage,
  createReply,
  createForward,
} from './message/builder.js';

export {
  MessageRouter,
  type RouterConfig,
  type RemoteDeliveryHandler,
} from './message/router.js';

export { LocalTransport, getLocalTransport } from './transport/local.js';
export { RemoteTransport, type RemoteTransportOptions } from './transport/remote.js';

import { InboxStorage } from './storage/inbox.js';
import { SentStorage } from './storage/sent.js';
import { ArchivedStorage } from './storage/archived.js';
import { MessageRouter } from './message/router.js';
import { createMessage as _createMessage, createReply as _createReply, createForward as _createForward } from './message/builder.js';
import type { MessageCreateInput, MessageDeliveryResult, Message, MessageFilter, InboxSummary } from './types.js';

export interface MessagingServiceConfig {
  agentId: string;
  storagePath?: string;
}

export class MessagingService {
  private config: MessagingServiceConfig;
  private inbox: InboxStorage;
  private sent: SentStorage;
  private archived: ArchivedStorage;
  private router: MessageRouter;

  constructor(config: MessagingServiceConfig) {
    this.config = config;

    this.inbox = new InboxStorage(config.agentId, config.storagePath);
    this.sent = new SentStorage(config.agentId, config.storagePath);
    this.archived = new ArchivedStorage(config.agentId, config.storagePath);

    this.router = new MessageRouter({
      localAgentId: config.agentId,
      inboxStorage: this.inbox,
      sentStorage: this.sent,
      archivedStorage: this.archived,
    });
  }

  async initialize(): Promise<void> {
    await this.inbox.initialize();
    await this.sent.initialize();
    await this.archived.initialize();
  }

  async send(input: MessageCreateInput): Promise<MessageDeliveryResult> {
    const message = _createMessage(this.config.agentId, input);
    return this.router.route(message);
  }

  async reply(messageId: string, body: unknown): Promise<MessageDeliveryResult> {
    const original = await this.inbox.get(messageId);
    if (!original) {
      throw new Error(`Message ${messageId} not found`);
    }

    const reply = _createReply(original, this.config.agentId, body);
    return this.router.route(reply);
  }

  async forward(messageId: string, to: string, note?: unknown): Promise<MessageDeliveryResult> {
    const original = await this.inbox.get(messageId);
    if (!original) {
      throw new Error(`Message ${messageId} not found`);
    }

    const forwarded = _createForward(original, this.config.agentId, to, note);
    return this.router.route(forwarded);
  }

  async getInbox(filter?: MessageFilter): Promise<Message[]> {
    return this.inbox.list(filter);
  }

  async getSent(filter?: MessageFilter): Promise<Message[]> {
    return this.sent.list(filter);
  }

  async getArchived(filter?: MessageFilter): Promise<Message[]> {
    return this.archived.list(filter);
  }

  async getMessage(messageId: string): Promise<Message | null> {
    return this.inbox.get(messageId);
  }

  async markAsRead(messageId: string): Promise<Message | null> {
    return this.inbox.markAsRead(messageId);
  }

  async archive(messageId: string): Promise<boolean> {
    return this.router.archive(messageId);
  }

  async deleteMessage(messageId: string): Promise<boolean> {
    return this.inbox.delete(messageId);
  }

  async getInboxSummary(): Promise<InboxSummary> {
    return this.inbox.getSummary();
  }

  getRouter(): MessageRouter {
    return this.router;
  }
}

export async function createMessagingService(
  agentId: string,
  storagePath?: string
): Promise<MessagingService> {
  const service = new MessagingService({ agentId, storagePath });
  await service.initialize();
  return service;
}
