export type MessagePriority = 'low' | 'normal' | 'high' | 'urgent';
export type MessageType = 'request' | 'response' | 'notification' | 'update';
export type MessageStatus = 'unread' | 'read' | 'archived';

export interface Message {
  id: string;
  from: string;
  to: string;
  type: MessageType;
  priority: MessagePriority;
  subject: string;
  body: unknown;
  replyTo?: string;
  threadId?: string;
  createdAt: string;
  readAt?: string;
  status: MessageStatus;
  metadata?: Record<string, unknown>;
}

export interface MessageCreateInput {
  to: string;
  type?: MessageType;
  priority?: MessagePriority;
  subject: string;
  body: unknown;
  replyTo?: string;
  threadId?: string;
  metadata?: Record<string, unknown>;
}

export interface MessageFilter {
  from?: string;
  to?: string;
  type?: MessageType;
  priority?: MessagePriority;
  status?: MessageStatus;
  threadId?: string;
  since?: string;
  until?: string;
  limit?: number;
}

export interface MessageThread {
  id: string;
  subject: string;
  participants: string[];
  messageCount: number;
  lastMessageAt: string;
  createdAt: string;
}

export interface InboxSummary {
  total: number;
  unread: number;
  byPriority: Record<MessagePriority, number>;
  byType: Record<MessageType, number>;
}

export interface MessageDeliveryResult {
  messageId: string;
  delivered: boolean;
  deliveredAt?: string;
  error?: string;
  via: 'local' | 'remote';
}

export interface MessagingConfig {
  agentId: string;
  storagePath?: string;
  maxInboxSize?: number;
  retentionDays?: number;
}

export const DEFAULT_MESSAGING_CONFIG: Partial<MessagingConfig> = {
  maxInboxSize: 1000,
  retentionDays: 30,
};
