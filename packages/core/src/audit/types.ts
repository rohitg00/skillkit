export type AuditEventType =
  | 'skill.install'
  | 'skill.uninstall'
  | 'skill.sync'
  | 'skill.translate'
  | 'skill.execute'
  | 'team.create'
  | 'team.share'
  | 'team.import'
  | 'team.sync'
  | 'bundle.create'
  | 'bundle.export'
  | 'bundle.import'
  | 'plugin.install'
  | 'plugin.uninstall'
  | 'plugin.enable'
  | 'plugin.disable'
  | 'workflow.execute'
  | 'ai.search'
  | 'ai.generate';

export interface AuditEvent {
  id: string;
  timestamp: Date;
  type: AuditEventType;
  user?: string;
  action: string;
  resource: string;
  details?: Record<string, unknown>;
  success: boolean;
  error?: string;
  duration?: number;
}

export interface AuditQuery {
  types?: AuditEventType[];
  user?: string;
  resource?: string;
  startDate?: Date;
  endDate?: Date;
  success?: boolean;
  limit?: number;
  offset?: number;
}

export interface AuditStats {
  totalEvents: number;
  successRate: number;
  eventsByType: Record<AuditEventType, number>;
  recentErrors: AuditEvent[];
  topResources: Array<{ resource: string; count: number }>;
}

export interface AuditExportOptions {
  format: 'json' | 'csv' | 'text';
  query?: AuditQuery;
}
