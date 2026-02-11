import type { SessionExplanation } from './types.js';
import { SessionManager } from './manager.js';
import { ObservationStore } from '../memory/observation-store.js';
import { getGitCommits } from '../learning/git-analyzer.js';
import { loadConfig } from '../config.js';

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    const remainMinutes = minutes % 60;
    return `${hours}h ${remainMinutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m`;
  }
  return `${seconds}s`;
}

export class SessionExplainer {
  private readonly projectPath: string;
  private readonly sessionManager: SessionManager;

  constructor(projectPath: string) {
    this.projectPath = projectPath;
    this.sessionManager = new SessionManager(projectPath);
  }

  explain(options?: { includeGit?: boolean }): SessionExplanation {
    const state = this.sessionManager.get();
    const includeGit = options?.includeGit !== false;

    const explanation: SessionExplanation = {
      date: new Date().toISOString().split('T')[0],
      agent: 'unknown',
      skillsUsed: [],
      tasks: [],
      filesModified: [],
      decisions: [],
      observationCounts: { errors: 0, solutions: 0, patterns: 0, total: 0 },
      gitCommits: 0,
    };

    if (!state) {
      return explanation;
    }

    try {
      const configAgent = loadConfig().agent;
      if (configAgent && configAgent !== 'universal') {
        explanation.agent = configAgent;
      } else if (state.currentExecution?.skillSource) {
        explanation.agent = state.currentExecution.skillSource;
      }
    } catch {
      if (state.currentExecution?.skillSource) {
        explanation.agent = state.currentExecution.skillSource;
      }
    }

    if (state.currentExecution) {
      const exec = state.currentExecution;

      const startTime = new Date(exec.startedAt).getTime();
      explanation.duration = formatDuration(Date.now() - startTime);

      explanation.skillsUsed.push({
        name: exec.skillName,
        status: exec.status,
      });

      for (const task of exec.tasks) {
        const taskEntry: { name: string; status: string; duration?: string } = {
          name: task.name,
          status: task.status,
        };

        if (task.startedAt && task.completedAt) {
          const dur =
            new Date(task.completedAt).getTime() -
            new Date(task.startedAt).getTime();
          taskEntry.duration = formatDuration(dur);
        }

        explanation.tasks.push(taskEntry);

        if (task.filesModified) {
          explanation.filesModified.push(...task.filesModified);
        }
      }
    }

    for (const hist of state.history ?? []) {
      const alreadyListed = explanation.skillsUsed.some(
        (s) => s.name === hist.skillName
      );
      if (!alreadyListed) {
        explanation.skillsUsed.push({
          name: hist.skillName,
          status: hist.status,
        });
      }
      if (hist.filesModified) {
        explanation.filesModified.push(...hist.filesModified);
      }
    }

    explanation.filesModified = [...new Set(explanation.filesModified)];

    explanation.decisions = (state.decisions ?? []).map(({ key, value }) => ({ key, value }));

    try {
      const observations = ObservationStore.readAll(this.projectPath);
      const countByType = (type: string) => observations.filter((o) => o.type === type).length;
      explanation.observationCounts = {
        total: observations.length,
        errors: countByType('error'),
        solutions: countByType('solution'),
        patterns: countByType('pattern'),
      };
    } catch {
      // No observation store available
    }

    if (includeGit) {
      try {
        const commits = getGitCommits(this.projectPath, { commits: 50 });
        const today = new Date().toISOString().split('T')[0];
        explanation.gitCommits = commits.filter((c) =>
          c.date.startsWith(today)
        ).length;
      } catch {
        // Git not available
      }
    }

    return explanation;
  }

  formatText(explanation: SessionExplanation): string {
    const lines: string[] = [];

    lines.push('  Session Summary\n');

    if (explanation.duration) {
      lines.push(`  Duration:   ${explanation.duration}`);
    }
    lines.push(`  Agent:      ${explanation.agent}`);
    lines.push('');

    if (explanation.skillsUsed.length > 0) {
      lines.push('  Skills Used');
      for (const skill of explanation.skillsUsed) {
        const icon = skill.status === 'completed' ? '\u2713' : '\u25CB';
        lines.push(`    ${icon} ${skill.name} (${skill.status})`);
      }
      lines.push('');
    }

    if (explanation.tasks.length > 0) {
      lines.push(`  Tasks (${explanation.tasks.length} total)`);
      for (const task of explanation.tasks) {
        const icon = task.status === 'completed' ? '\u2713' : '\u25CB';
        const dur = task.duration ? ` (${task.duration})` : '';
        lines.push(`    ${icon} ${task.name}${dur}`);
      }
      lines.push('');
    }

    lines.push(`  Files Modified: ${explanation.filesModified.length} files`);
    lines.push(`  Git Commits: ${explanation.gitCommits}`);
    lines.push('');

    if (explanation.decisions.length > 0) {
      lines.push('  Decisions');
      for (const d of explanation.decisions) {
        lines.push(`    ${d.key} \u2192 ${d.value}`);
      }
      lines.push('');
    }

    const obs = explanation.observationCounts;
    lines.push(
      `  Observations: ${obs.errors} errors, ${obs.solutions} solutions, ${obs.patterns} patterns`
    );

    return lines.join('\n');
  }

  formatJson(explanation: SessionExplanation): string {
    return JSON.stringify(explanation, null, 2);
  }
}
