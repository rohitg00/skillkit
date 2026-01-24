import { promises as fs } from 'fs';
import path from 'path';
import type {
  AuditEvent,
  AuditEventType,
  AuditQuery,
  AuditStats,
  AuditExportOptions,
} from './types.js';

export class AuditLogger {
  private logFile: string;
  private buffer: AuditEvent[] = [];
  private flushInterval: NodeJS.Timeout | null = null;

  constructor(logDir: string) {
    this.logFile = path.join(logDir, 'audit.log');
    this.startAutoFlush();
  }

  async log(
    type: AuditEventType,
    action: string,
    resource: string,
    details?: Record<string, unknown>,
    success: boolean = true,
    error?: string,
    duration?: number
  ): Promise<void> {
    const event: AuditEvent = {
      id: this.generateId(),
      timestamp: new Date(),
      type,
      user: process.env.USER || 'unknown',
      action,
      resource,
      details,
      success,
      error,
      duration,
    };

    this.buffer.push(event);

    if (this.buffer.length >= 10) {
      await this.flush();
    }
  }

  async query(query: AuditQuery = {}): Promise<AuditEvent[]> {
    const events = await this.loadEvents();
    return this.filterEvents(events, query);
  }

  async stats(): Promise<AuditStats> {
    const events = await this.loadEvents();

    const totalEvents = events.length;
    const successEvents = events.filter((e) => e.success).length;
    const successRate = totalEvents > 0 ? successEvents / totalEvents : 0;

    const eventsByType: Record<AuditEventType, number> = {} as any;
    events.forEach((e) => {
      eventsByType[e.type] = (eventsByType[e.type] || 0) + 1;
    });

    const recentErrors = events
      .filter((e) => !e.success)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);

    const resourceCounts = new Map<string, number>();
    events.forEach((e) => {
      resourceCounts.set(e.resource, (resourceCounts.get(e.resource) || 0) + 1);
    });

    const topResources = Array.from(resourceCounts.entries())
      .map(([resource, count]) => ({ resource, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalEvents,
      successRate,
      eventsByType,
      recentErrors,
      topResources,
    };
  }

  async export(options: AuditExportOptions): Promise<string> {
    const events = await this.query(options.query);

    switch (options.format) {
      case 'json':
        return JSON.stringify(events, null, 2);
      case 'csv':
        return this.toCsv(events);
      case 'text':
        return this.toText(events);
      default:
        return JSON.stringify(events, null, 2);
    }
  }

  async clear(olderThan?: Date): Promise<number> {
    const events = await this.loadEvents();

    const filtered = olderThan
      ? events.filter((e) => e.timestamp >= olderThan)
      : [];

    await this.saveEvents(filtered);

    return events.length - filtered.length;
  }

  async flush(): Promise<void> {
    if (this.buffer.length === 0) {
      return;
    }

    try {
      const events = await this.loadEvents();
      events.push(...this.buffer);
      await this.saveEvents(events);
      this.buffer = [];
    } catch (error) {
      console.error('Failed to flush audit log:', error);
    }
  }

  async destroy(): Promise<void> {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    await this.flush();
  }

  private startAutoFlush(): void {
    this.flushInterval = setInterval(
      () => {
        this.flush().catch(console.error);
      },
      30000
    );
  }

  private async loadEvents(): Promise<AuditEvent[]> {
    try {
      const content = await fs.readFile(this.logFile, 'utf-8');
      return content
        .split('\n')
        .filter((line) => line.trim())
        .map((line) => {
          const event = JSON.parse(line);
          event.timestamp = new Date(event.timestamp);
          return event;
        });
    } catch {
      return [];
    }
  }

  private async saveEvents(events: AuditEvent[]): Promise<void> {
    const dir = path.dirname(this.logFile);
    await fs.mkdir(dir, { recursive: true });
    const content = events.map((e) => JSON.stringify(e)).join('\n');
    await fs.writeFile(this.logFile, content, 'utf-8');
  }

  private filterEvents(events: AuditEvent[], query: AuditQuery): AuditEvent[] {
    let filtered = events;

    if (query.types && query.types.length > 0) {
      filtered = filtered.filter((e) => query.types!.includes(e.type));
    }

    if (query.user) {
      filtered = filtered.filter((e) => e.user === query.user);
    }

    if (query.resource) {
      filtered = filtered.filter((e) =>
        e.resource.toLowerCase().includes(query.resource!.toLowerCase())
      );
    }

    if (query.startDate) {
      filtered = filtered.filter((e) => e.timestamp >= query.startDate!);
    }

    if (query.endDate) {
      filtered = filtered.filter((e) => e.timestamp <= query.endDate!);
    }

    if (query.success !== undefined) {
      filtered = filtered.filter((e) => e.success === query.success);
    }

    filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    if (query.offset) {
      filtered = filtered.slice(query.offset);
    }

    if (query.limit) {
      filtered = filtered.slice(0, query.limit);
    }

    return filtered;
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  private toCsv(events: AuditEvent[]): string {
    const headers = [
      'ID',
      'Timestamp',
      'Type',
      'User',
      'Action',
      'Resource',
      'Success',
      'Error',
      'Duration',
    ];

    const rows = events.map((e) => [
      e.id,
      e.timestamp.toISOString(),
      e.type,
      e.user || '',
      e.action,
      e.resource,
      e.success ? 'true' : 'false',
      e.error || '',
      e.duration?.toString() || '',
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  private toText(events: AuditEvent[]): string {
    return events
      .map((e) => {
        let text = `[${e.timestamp.toISOString()}] ${e.type} - ${e.action} on ${e.resource}`;
        if (e.user) text += ` by ${e.user}`;
        text += ` (${e.success ? 'SUCCESS' : 'FAILED'})`;
        if (e.error) text += `\n  Error: ${e.error}`;
        if (e.duration) text += `\n  Duration: ${e.duration}ms`;
        return text;
      })
      .join('\n\n');
  }
}
