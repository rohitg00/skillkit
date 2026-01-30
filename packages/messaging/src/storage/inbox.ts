import { readFile, writeFile, mkdir, readdir, unlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { homedir } from 'node:os';
import type { Message, MessageFilter, InboxSummary } from '../types.js';

export class InboxStorage {
  private basePath: string;

  constructor(agentId: string, basePath?: string) {
    this.basePath = basePath ?? join(homedir(), '.skillkit', 'messages', 'inbox', agentId);
  }

  async initialize(): Promise<void> {
    await mkdir(this.basePath, { recursive: true });
  }

  async save(message: Message): Promise<void> {
    const filePath = this.getMessagePath(message.id);
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, JSON.stringify(message, null, 2), 'utf-8');
  }

  async get(messageId: string): Promise<Message | null> {
    const filePath = this.getMessagePath(messageId);

    if (!existsSync(filePath)) {
      return null;
    }

    try {
      const content = await readFile(filePath, 'utf-8');
      return JSON.parse(content) as Message;
    } catch {
      return null;
    }
  }

  async delete(messageId: string): Promise<boolean> {
    const filePath = this.getMessagePath(messageId);

    if (!existsSync(filePath)) {
      return false;
    }

    try {
      await unlink(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async list(filter: MessageFilter = {}): Promise<Message[]> {
    if (!existsSync(this.basePath)) {
      return [];
    }

    const files = await readdir(this.basePath);
    const messages: Message[] = [];

    for (const file of files) {
      if (!file.endsWith('.json')) continue;

      const filePath = join(this.basePath, file);
      try {
        const content = await readFile(filePath, 'utf-8');
        const message = JSON.parse(content) as Message;

        if (this.matchesFilter(message, filter)) {
          messages.push(message);
        }
      } catch {
      }
    }

    messages.sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return filter.limit ? messages.slice(0, filter.limit) : messages;
  }

  async markAsRead(messageId: string): Promise<Message | null> {
    const message = await this.get(messageId);
    if (!message) return null;

    message.status = 'read';
    message.readAt = new Date().toISOString();
    await this.save(message);

    return message;
  }

  async getUnread(): Promise<Message[]> {
    return this.list({ status: 'unread' });
  }

  async getSummary(): Promise<InboxSummary> {
    const messages = await this.list();

    const summary: InboxSummary = {
      total: messages.length,
      unread: 0,
      byPriority: { low: 0, normal: 0, high: 0, urgent: 0 },
      byType: { request: 0, response: 0, notification: 0, update: 0 },
    };

    for (const message of messages) {
      if (message.status === 'unread') {
        summary.unread++;
      }
      summary.byPriority[message.priority]++;
      summary.byType[message.type]++;
    }

    return summary;
  }

  async count(): Promise<number> {
    if (!existsSync(this.basePath)) return 0;

    const files = await readdir(this.basePath);
    return files.filter(f => f.endsWith('.json')).length;
  }

  async clear(): Promise<number> {
    if (!existsSync(this.basePath)) return 0;

    const files = await readdir(this.basePath);
    let deleted = 0;

    for (const file of files) {
      if (!file.endsWith('.json')) continue;

      try {
        await unlink(join(this.basePath, file));
        deleted++;
      } catch {
      }
    }

    return deleted;
  }

  private getMessagePath(messageId: string): string {
    return join(this.basePath, `${messageId}.json`);
  }

  private matchesFilter(message: Message, filter: MessageFilter): boolean {
    if (filter.from && message.from !== filter.from) return false;
    if (filter.to && message.to !== filter.to) return false;
    if (filter.type && message.type !== filter.type) return false;
    if (filter.priority && message.priority !== filter.priority) return false;
    if (filter.status && message.status !== filter.status) return false;
    if (filter.threadId && message.threadId !== filter.threadId) return false;

    if (filter.since) {
      const since = new Date(filter.since).getTime();
      const created = new Date(message.createdAt).getTime();
      if (created < since) return false;
    }

    if (filter.until) {
      const until = new Date(filter.until).getTime();
      const created = new Date(message.createdAt).getTime();
      if (created > until) return false;
    }

    return true;
  }
}
