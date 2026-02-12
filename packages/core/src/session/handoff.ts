import { SessionManager } from './manager.js';
import { ActivityLog } from './activity-log.js';
import { ObservationStore } from '../memory/observation-store.js';
import { getGitCommits } from '../learning/git-analyzer.js';
import { loadConfig } from '../config.js';
import type {
  HandoffDocument,
  HandoffSection,
  HandoffOptions,
  SessionTask,
  ExecutionHistory,
} from './types.js';

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
}

export class SessionHandoff {
  private readonly projectPath: string;
  private readonly sessionManager: SessionManager;
  private readonly activityLog: ActivityLog;

  constructor(projectPath: string) {
    this.projectPath = projectPath;
    this.sessionManager = new SessionManager(projectPath);
    this.activityLog = new ActivityLog(projectPath);
  }

  generate(options?: HandoffOptions): HandoffDocument {
    const state = this.sessionManager.get();
    const includeGit = options?.includeGit !== false;
    const includeObservations = options?.includeObservations !== false;
    const maxObservations = options?.maxObservations ?? 20;

    let agent = 'unknown';
    try {
      const configAgent = loadConfig().agent;
      if (configAgent && configAgent !== 'universal') {
        agent = configAgent;
      }
    } catch {
      // use default
    }

    if (agent === 'unknown' && state?.currentExecution?.skillSource) {
      agent = state.currentExecution.skillSource;
    }

    const accomplished = this.buildAccomplished(state?.currentExecution?.tasks, state?.history ?? [], includeGit);
    const pending = this.buildPending(state?.currentExecution?.tasks);
    const keyFiles = this.buildKeyFiles(state?.currentExecution?.tasks, state?.history ?? []);
    const observations = includeObservations
      ? this.buildObservations(maxObservations)
      : { errors: [], solutions: [], patterns: [] };
    const recommendations = this.buildRecommendations(pending, observations, includeGit);

    return {
      generatedAt: new Date().toISOString(),
      fromAgent: agent,
      projectPath: this.projectPath,
      accomplished,
      pending,
      keyFiles,
      observations,
      recommendations,
    };
  }

  private buildAccomplished(
    tasks: SessionTask[] | undefined,
    history: ExecutionHistory[],
    includeGit: boolean
  ): HandoffSection {
    const section: HandoffSection = { tasks: [], commits: [] };

    for (const task of tasks ?? []) {
      if (task.status === 'completed') {
        let duration: string | undefined;
        if (task.startedAt && task.completedAt) {
          duration = formatDuration(
            new Date(task.completedAt).getTime() - new Date(task.startedAt).getTime()
          );
        }
        section.tasks.push({
          name: task.name,
          duration,
          commitSha: task.commitSha,
        });
      }
    }

    for (const hist of history) {
      if (hist.status === 'completed') {
        section.tasks.push({
          name: hist.skillName,
          duration: Number.isFinite(hist.durationMs) ? formatDuration(hist.durationMs) : undefined,
          commitSha: hist.commits?.[0],
        });
      }
    }

    if (includeGit) {
      try {
        const today = new Date().toISOString().split('T')[0];
        const commits = getGitCommits(this.projectPath, { commits: 50 });
        for (const commit of commits) {
          if (commit.date.startsWith(today)) {
            section.commits.push({
              sha: commit.shortHash,
              message: commit.message,
              filesCount: commit.files.length,
            });
          }
        }
      } catch {
        // git not available
      }
    }

    return section;
  }

  private buildPending(tasks: SessionTask[] | undefined): HandoffSection {
    const section: HandoffSection = { tasks: [], commits: [] };

    const pendingStatuses = new Set(['pending', 'in_progress', 'paused']);
    for (const task of tasks ?? []) {
      if (pendingStatuses.has(task.status)) {
        section.tasks.push({ name: task.name });
      }
    }

    return section;
  }

  private buildKeyFiles(
    tasks: SessionTask[] | undefined,
    history: ExecutionHistory[]
  ): Array<{ path: string; changeType: string }> {
    const fileMap = new Map<string, string>();

    for (const task of tasks ?? []) {
      for (const f of task.filesModified ?? []) {
        fileMap.set(f, task.status === 'completed' ? 'modified' : 'in-progress');
      }
    }

    for (const hist of history) {
      for (const f of hist.filesModified ?? []) {
        if (!fileMap.has(f)) {
          fileMap.set(f, 'modified');
        }
      }
    }

    return Array.from(fileMap.entries())
      .map(([path, changeType]) => ({ path, changeType }))
      .sort((a, b) => a.path.localeCompare(b.path));
  }

  private buildObservations(max: number): HandoffDocument['observations'] {
    const result: HandoffDocument['observations'] = {
      errors: [],
      solutions: [],
      patterns: [],
    };

    try {
      const observations = ObservationStore.readAll(this.projectPath);
      const sorted = [...observations].sort((a, b) => b.relevance - a.relevance);
      let count = 0;

      for (const obs of sorted) {
        if (count >= max) break;
        if (obs.type === 'error' && obs.content.error) {
          result.errors.push({ action: obs.content.action, error: obs.content.error });
          count++;
        } else if (obs.type === 'solution' && obs.content.solution) {
          result.solutions.push({ action: obs.content.action, solution: obs.content.solution });
          count++;
        } else if (obs.type === 'pattern' && obs.content.context) {
          result.patterns.push({ action: obs.content.action, context: obs.content.context });
          count++;
        }
      }
    } catch {
      // no observations
    }

    return result;
  }

  private buildRecommendations(
    pending: HandoffSection,
    observations: HandoffDocument['observations'],
    includeGit: boolean
  ): string[] {
    const recs: string[] = [];

    if (pending.tasks.length > 0) {
      recs.push(`Complete pending tasks: ${pending.tasks.map((t) => t.name).join(', ')}`);
    }

    if (observations.errors.length > 0) {
      const unresolved = observations.errors.filter(
        (e) => !observations.solutions.some((s) => s.action === e.action)
      );
      if (unresolved.length > 0) {
        recs.push(`Resolve ${unresolved.length} unresolved error(s)`);
      }
    }

    if (includeGit) {
      try {
        const activities = this.activityLog.getRecent(50);
        const fileCounts = new Map<string, number>();
        for (const activity of activities) {
          for (const f of activity.filesChanged) {
            fileCounts.set(f, (fileCounts.get(f) ?? 0) + 1);
          }
        }
        const highChurn = Array.from(fileCounts.entries())
          .filter(([, count]) => count >= 3)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3);

        for (const [file, count] of highChurn) {
          recs.push(`Review high-churn file: ${file} (${count} changes)`);
        }
      } catch {
        // activity log not available
      }
    }

    return recs;
  }

  toMarkdown(doc: HandoffDocument): string {
    const lines: string[] = [];
    lines.push(`# Session Handoff`);
    lines.push(`Agent: ${doc.fromAgent} | ${doc.generatedAt.split('T')[0]}\n`);

    lines.push(`## Accomplished`);
    if (doc.accomplished.tasks.length === 0 && doc.accomplished.commits.length === 0) {
      lines.push('No completed tasks.\n');
    } else {
      for (const task of doc.accomplished.tasks) {
        const dur = task.duration ? ` (${task.duration})` : '';
        const sha = task.commitSha ? ` [${task.commitSha.slice(0, 7)}]` : '';
        lines.push(`- ${task.name}${dur}${sha}`);
      }
      for (const commit of doc.accomplished.commits) {
        lines.push(`- ${commit.sha} — ${commit.message} (${commit.filesCount} files)`);
      }
      lines.push('');
    }

    lines.push(`## Pending`);
    if (doc.pending.tasks.length === 0) {
      lines.push('No pending tasks.\n');
    } else {
      for (const task of doc.pending.tasks) {
        lines.push(`- ${task.name}`);
      }
      lines.push('');
    }

    if (doc.keyFiles.length > 0) {
      lines.push(`## Key Files`);
      for (const f of doc.keyFiles) {
        lines.push(`- \`${f.path}\` (${f.changeType})`);
      }
      lines.push('');
    }

    const hasObs =
      doc.observations.errors.length > 0 ||
      doc.observations.solutions.length > 0 ||
      doc.observations.patterns.length > 0;

    if (hasObs) {
      lines.push(`## Observations`);
      for (const e of doc.observations.errors) {
        lines.push(`- Error: ${e.error} (${e.action})`);
      }
      for (const s of doc.observations.solutions) {
        lines.push(`- Solution: ${s.solution} (${s.action})`);
      }
      for (const p of doc.observations.patterns) {
        lines.push(`- Pattern: ${p.action} — ${p.context}`);
      }
      lines.push('');
    }

    if (doc.recommendations.length > 0) {
      lines.push(`## Recommendations`);
      doc.recommendations.forEach((r, i) => {
        lines.push(`${i + 1}. ${r}`);
      });
      lines.push('');
    }

    return lines.join('\n');
  }

  toJson(doc: HandoffDocument): string {
    return JSON.stringify(doc, null, 2);
  }
}
