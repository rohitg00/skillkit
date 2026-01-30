import { randomUUID } from 'node:crypto';
import type {
  Message,
  MessageCreateInput,
  MessageType,
  MessagePriority,
} from '../types.js';

export class MessageBuilder {
  private message: Partial<Message>;

  constructor() {
    this.message = {
      id: randomUUID(),
      type: 'notification',
      priority: 'normal',
      status: 'unread',
      createdAt: new Date().toISOString(),
    };
  }

  static create(): MessageBuilder {
    return new MessageBuilder();
  }

  from(agentId: string): this {
    this.message.from = agentId;
    return this;
  }

  to(recipient: string): this {
    this.message.to = recipient;
    return this;
  }

  subject(subject: string): this {
    this.message.subject = subject;
    return this;
  }

  body(body: unknown): this {
    this.message.body = body;
    return this;
  }

  type(type: MessageType): this {
    this.message.type = type;
    return this;
  }

  priority(priority: MessagePriority): this {
    this.message.priority = priority;
    return this;
  }

  replyTo(messageId: string): this {
    this.message.replyTo = messageId;
    return this;
  }

  threadId(threadId: string): this {
    this.message.threadId = threadId;
    return this;
  }

  metadata(metadata: Record<string, unknown>): this {
    this.message.metadata = metadata;
    return this;
  }

  request(): this {
    this.message.type = 'request';
    return this;
  }

  response(): this {
    this.message.type = 'response';
    return this;
  }

  notification(): this {
    this.message.type = 'notification';
    return this;
  }

  update(): this {
    this.message.type = 'update';
    return this;
  }

  low(): this {
    this.message.priority = 'low';
    return this;
  }

  normal(): this {
    this.message.priority = 'normal';
    return this;
  }

  high(): this {
    this.message.priority = 'high';
    return this;
  }

  urgent(): this {
    this.message.priority = 'urgent';
    return this;
  }

  build(): Message {
    if (!this.message.from) {
      throw new Error('Message must have a "from" field');
    }
    if (!this.message.to) {
      throw new Error('Message must have a "to" field');
    }
    if (!this.message.subject) {
      throw new Error('Message must have a subject');
    }
    if (this.message.body === undefined) {
      throw new Error('Message must have a body');
    }

    return this.message as Message;
  }
}

export function createMessage(from: string, input: MessageCreateInput): Message {
  const builder = MessageBuilder.create()
    .from(from)
    .to(input.to)
    .subject(input.subject)
    .body(input.body);

  if (input.type) builder.type(input.type);
  if (input.priority) builder.priority(input.priority);
  if (input.replyTo) builder.replyTo(input.replyTo);
  if (input.threadId) builder.threadId(input.threadId);
  if (input.metadata) builder.metadata(input.metadata);

  return builder.build();
}

export function createReply(
  originalMessage: Message,
  from: string,
  body: unknown
): Message {
  return MessageBuilder.create()
    .from(from)
    .to(originalMessage.from)
    .subject(`Re: ${originalMessage.subject}`)
    .body(body)
    .type('response')
    .priority(originalMessage.priority)
    .replyTo(originalMessage.id)
    .threadId(originalMessage.threadId ?? originalMessage.id)
    .build();
}

export function createForward(
  originalMessage: Message,
  from: string,
  to: string,
  additionalBody?: unknown
): Message {
  const forwardBody = {
    forwardedFrom: originalMessage.from,
    originalSubject: originalMessage.subject,
    originalBody: originalMessage.body,
    ...(additionalBody ? { note: additionalBody } : {}),
  };

  return MessageBuilder.create()
    .from(from)
    .to(to)
    .subject(`Fwd: ${originalMessage.subject}`)
    .body(forwardBody)
    .type(originalMessage.type)
    .priority(originalMessage.priority)
    .build();
}
