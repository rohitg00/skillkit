import { SessionManager } from './manager.js';
import { ActivityLog } from './activity-log.js';
import { SnapshotManager } from './snapshot-manager.js';
import { ObservationStore } from '../memory/observation-store.js';
import { getGitCommits } from '../learning/git-analyzer.js';
import type {
  TimelineEvent,
  TimelineData,
  TimelineOptions,
  TimelineEventType,
} from './types.js';

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export class SessionTimeline {
  private readonly projectPath: string;
  private readonly sessionManager: SessionManager;
  private readonly activityLog: ActivityLog;
  private readonly snapshotManager: SnapshotManager;

  constructor(projectPath: string) {
    this.projectPath = projectPath;
    this.sessionManager = new SessionManager(projectPath);
    this.activityLog = new ActivityLog(projectPath);
    this.snapshotManager = new SnapshotManager(projectPath);
  }

  build(options?: TimelineOptions): TimelineData {
    const events: TimelineEvent[] = [];
    const state = this.sessionManager.get();
    const limit = options?.limit ?? 50;
    const includeGit = options?.includeGit !== false;
    const sinceDate = options?.since ? new Date(options.since) : undefined;
    if (sinceDate && isNaN(sinceDate.getTime())) {
      return { projectPath: this.projectPath, sessionDate: new Date().toISOString().split('T')[0], events: [], totalCount: 0 };
    }

    if (state?.currentExecution) {
      const exec = state.currentExecution;
      events.push({
        timestamp: exec.startedAt,
        type: 'skill_start',
        source: exec.skillName,
        summary: `${exec.skillName} started`,
        details: { status: exec.status, totalSteps: exec.totalSteps },
      });

      const activeStatuses = new Set(['in_progress', 'completed', 'failed']);
      for (const task of exec.tasks) {
        if (task.startedAt && activeStatuses.has(task.status)) {
          events.push({
            timestamp: task.completedAt ?? task.startedAt,
            type: 'task_progress',
            source: exec.skillName,
            summary: `${task.name} (${task.status})`,
            details: { taskId: task.id, error: task.error },
          });
        }
      }
    }

    for (const hist of state?.history ?? []) {
      events.push({
        timestamp: hist.completedAt,
        type: 'skill_complete',
        source: hist.skillName,
        summary: `${hist.skillName} ${hist.status} (${formatDuration(hist.durationMs)})`,
        details: {
          durationMs: hist.durationMs,
          commits: hist.commits,
          filesModified: hist.filesModified,
        },
      });
    }

    if (includeGit) {
      try {
        const commits = getGitCommits(this.projectPath, {
          commits: 50,
          since: options?.since,
        });
        for (const commit of commits) {
          const activity = this.activityLog.getByCommit(commit.shortHash);
          events.push({
            timestamp: commit.date,
            type: 'git_commit',
            source: activity?.activeSkills?.join(', ') ?? 'git',
            summary: `${commit.shortHash} — ${commit.message} (${commit.files.length} files)`,
            details: {
              sha: commit.hash,
              author: commit.author,
              skills: activity?.activeSkills,
            },
          });
        }
      } catch {
        // git not available
      }
    }

    try {
      const observations = ObservationStore.readAll(this.projectPath);
      for (const obs of observations) {
        events.push({
          timestamp: obs.timestamp,
          type: 'observation',
          source: String(obs.agent),
          summary: `${obs.type}: ${obs.content?.action ?? 'unknown'}`,
          details: { observationId: obs.id, ...obs.content },
        });
      }
    } catch {
      // no observations
    }

    for (const decision of state?.decisions ?? []) {
      events.push({
        timestamp: decision.madeAt,
        type: 'decision',
        source: decision.skillName ?? 'user',
        summary: `${decision.key} → ${decision.value}`,
      });
    }

    try {
      const snapshots = this.snapshotManager.list();
      for (const snap of snapshots) {
        events.push({
          timestamp: snap.createdAt,
          type: 'snapshot',
          source: 'snapshot',
          summary: `snapshot: ${snap.name}${snap.description ? ` — ${snap.description}` : ''}`,
          details: { skillCount: snap.skillCount },
        });
      }
    } catch {
      // no snapshots
    }

    let filtered = events;

    if (sinceDate) {
      filtered = filtered.filter((e) => new Date(e.timestamp) >= sinceDate);
    }

    if (options?.types && options.types.length > 0) {
      const typeSet = new Set<TimelineEventType>(options.types);
      filtered = filtered.filter((e) => typeSet.has(e.type));
    }

    if (options?.skillFilter) {
      const skill = options.skillFilter;
      filtered = filtered.filter(
        (e) => e.source.includes(skill) || (e.details?.skills as string[] | undefined)?.includes(skill)
      );
    }

    filtered.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    const totalCount = filtered.length;
    const limited = filtered.slice(-limit);

    return {
      projectPath: this.projectPath,
      sessionDate: new Date().toISOString().split('T')[0],
      events: limited,
      totalCount,
    };
  }

  formatText(data: TimelineData): string {
    const lines: string[] = [];
    lines.push('  Session Timeline\n');

    if (data.events.length === 0) {
      lines.push('  No events found.\n');
      return lines.join('\n');
    }

    const icons: Record<TimelineEventType, string> = {
      skill_start: '>',
      skill_complete: '\u2713',
      task_progress: '\u2022',
      git_commit: '*',
      observation: '!',
      decision: '?',
      snapshot: '\u25C9',
    };

    let lastTimeBlock = '';

    for (const event of data.events) {
      const time = formatTime(event.timestamp);

      if (time !== lastTimeBlock) {
        if (lastTimeBlock) lines.push('');
        lines.push(`  ${time}`);
        lastTimeBlock = time;
      }

      const icon = icons[event.type] ?? '\u2022';
      lines.push(`    ${icon} ${event.summary}`);
    }

    lines.push('');
    if (data.totalCount > data.events.length) {
      lines.push(`  Showing ${data.events.length} of ${data.totalCount} events`);
    } else {
      lines.push(`  ${data.totalCount} ${data.totalCount === 1 ? 'event' : 'events'} total`);
    }

    return lines.join('\n');
  }

  formatJson(data: TimelineData): string {
    return JSON.stringify(data, null, 2);
  }
}
