import { SessionManager } from './manager.js';
import { ActivityLog } from './activity-log.js';
import { ObservationStore } from '../memory/observation-store.js';
import type {
  SkillLineageEntry,
  FileLineage,
  LineageData,
  LineageOptions,
} from './types.js';

function formatDurationMs(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
}

export class SkillLineage {
  private readonly projectPath: string;
  private readonly sessionManager: SessionManager;
  private readonly activityLog: ActivityLog;

  constructor(projectPath: string) {
    this.projectPath = projectPath;
    this.sessionManager = new SessionManager(projectPath);
    this.activityLog = new ActivityLog(projectPath);
  }

  build(options?: LineageOptions): LineageData {
    const state = this.sessionManager.get();
    const sinceDate = options?.since ? new Date(options.since) : undefined;

    const skillMap = new Map<string, SkillLineageEntry>();
    const fileSkillMap = new Map<string, Set<string>>();
    const fileCommitCount = new Map<string, number>();
    const fileLastModified = new Map<string, string>();

    for (const hist of state?.history ?? []) {
      if (sinceDate && new Date(hist.completedAt) < sinceDate) continue;

      const entry = skillMap.get(hist.skillName) ?? {
        skillName: hist.skillName,
        executions: 0,
        totalDurationMs: 0,
        commits: [],
        filesModified: [],
        observationIds: [],
        firstSeen: hist.completedAt,
        lastSeen: hist.completedAt,
      };

      entry.executions++;
      entry.totalDurationMs += hist.durationMs;
      entry.commits.push(...(hist.commits ?? []));
      entry.filesModified.push(...(hist.filesModified ?? []));

      if (new Date(hist.completedAt) < new Date(entry.firstSeen)) {
        entry.firstSeen = hist.completedAt;
      }
      if (new Date(hist.completedAt) > new Date(entry.lastSeen)) {
        entry.lastSeen = hist.completedAt;
      }

      skillMap.set(hist.skillName, entry);

      for (const f of hist.filesModified ?? []) {
        const skills = fileSkillMap.get(f) ?? new Set();
        skills.add(hist.skillName);
        fileSkillMap.set(f, skills);

        fileCommitCount.set(f, (fileCommitCount.get(f) ?? 0) + (hist.commits?.length ?? 0));
        const existing = fileLastModified.get(f);
        if (!existing || new Date(hist.completedAt) > new Date(existing)) {
          fileLastModified.set(f, hist.completedAt);
        }
      }
    }

    if (state?.currentExecution) {
      const exec = state.currentExecution;
      const startTime = new Date(exec.startedAt);
      if (!sinceDate || startTime >= sinceDate) {
        const entry = skillMap.get(exec.skillName) ?? {
          skillName: exec.skillName,
          executions: 0,
          totalDurationMs: 0,
          commits: [],
          filesModified: [],
          observationIds: [],
          firstSeen: exec.startedAt,
          lastSeen: exec.startedAt,
        };

        entry.executions++;
        entry.totalDurationMs += Date.now() - startTime.getTime();

        for (const task of exec.tasks) {
          if (task.commitSha) entry.commits.push(task.commitSha);
          entry.filesModified.push(...(task.filesModified ?? []));
          for (const f of task.filesModified ?? []) {
            const skills = fileSkillMap.get(f) ?? new Set();
            skills.add(exec.skillName);
            fileSkillMap.set(f, skills);

            if (task.commitSha) {
              fileCommitCount.set(f, (fileCommitCount.get(f) ?? 0) + 1);
            }
            const existing = fileLastModified.get(f);
            if (!existing || new Date(exec.startedAt) > new Date(existing)) {
              fileLastModified.set(f, exec.startedAt);
            }
          }
        }

        if (new Date(exec.startedAt) < new Date(entry.firstSeen)) {
          entry.firstSeen = exec.startedAt;
        }
        entry.lastSeen = new Date().toISOString();

        skillMap.set(exec.skillName, entry);
      }
    }

    try {
      const activities = this.activityLog.getRecent(500);
      for (const activity of activities) {
        if (sinceDate && new Date(activity.committedAt) < sinceDate) continue;
        const countedFiles = new Set<string>();
        for (const skill of activity.activeSkills) {
          const entry = skillMap.get(skill);
          if (entry && !entry.commits.includes(activity.commitSha)) {
            entry.commits.push(activity.commitSha);
          }
          for (const f of activity.filesChanged) {
            const skills = fileSkillMap.get(f) ?? new Set();
            skills.add(skill);
            fileSkillMap.set(f, skills);
            if (!countedFiles.has(f)) {
              fileCommitCount.set(f, (fileCommitCount.get(f) ?? 0) + 1);
              countedFiles.add(f);
            }
            const existing = fileLastModified.get(f);
            if (!existing || new Date(activity.committedAt) > new Date(existing)) {
              fileLastModified.set(f, activity.committedAt);
            }
          }
        }
      }
    } catch {
      // activity log not available
    }

    const errorProneFiles: string[] = [];
    try {
      const observations = ObservationStore.readAll(this.projectPath);
      for (const obs of observations) {
        if (sinceDate && new Date(obs.timestamp) < sinceDate) continue;

        for (const [, entry] of skillMap) {
          const execStart = new Date(entry.firstSeen).getTime();
          const execEnd = new Date(entry.lastSeen).getTime();
          const obsTime = new Date(obs.timestamp).getTime();
          if (obsTime >= execStart && obsTime <= execEnd) {
            if (!entry.observationIds.includes(obs.id)) {
              entry.observationIds.push(obs.id);
            }
          }
        }

        if (obs.type === 'error' && Array.isArray(obs.content?.files)) {
          errorProneFiles.push(...obs.content.files);
        }
      }
    } catch {
      // no observations
    }

    for (const entry of skillMap.values()) {
      entry.commits = [...new Set(entry.commits)];
      entry.filesModified = [...new Set(entry.filesModified)];
    }

    let skills = Array.from(skillMap.values());
    let files: FileLineage[] = Array.from(fileSkillMap.entries()).map(([path, skillSet]) => ({
      path,
      skills: Array.from(skillSet),
      commitCount: fileCommitCount.get(path) ?? 0,
      lastModified: fileLastModified.get(path) ?? '',
    }));

    if (options?.skill) {
      skills = skills.filter((s) => s.skillName === options.skill);
      const skillFiles = new Set(skills.flatMap((s) => s.filesModified));
      files = files.filter((f) => skillFiles.has(f.path));
    }

    if (options?.file) {
      files = files.filter((f) => f.path === options.file || f.path.includes(options.file!));
      const fileSkills = new Set(files.flatMap((f) => f.skills));
      skills = skills.filter((s) => fileSkills.has(s.skillName));
    }

    skills.sort((a, b) => b.filesModified.length - a.filesModified.length);
    files.sort((a, b) => b.skills.length - a.skills.length || b.commitCount - a.commitCount);

    if (options?.limit) {
      skills = skills.slice(0, options.limit);
      files = files.slice(0, options.limit);
    }

    const uniqueErrorFiles = [...new Set(errorProneFiles)];
    const allCommits = new Set(skills.flatMap((s) => s.commits));
    const allFiles = new Set(skills.flatMap((s) => s.filesModified));

    const mostImpactful = skills.length > 0 ? skills[0].skillName : null;
    const mostChanged = files.length > 0 ? files[0].path : null;

    return {
      projectPath: this.projectPath,
      skills,
      files,
      stats: {
        totalSkillExecutions: skills.reduce((sum, s) => sum + s.executions, 0),
        totalCommits: allCommits.size,
        totalFilesChanged: allFiles.size,
        mostImpactfulSkill: mostImpactful,
        mostChangedFile: mostChanged,
        errorProneFiles: uniqueErrorFiles.slice(0, 5),
      },
    };
  }

  getSkillLineage(skillName: string): SkillLineageEntry | undefined {
    const data = this.build({ skill: skillName });
    return data.skills.find((s) => s.skillName === skillName);
  }

  getFileLineage(filePath: string): FileLineage | undefined {
    const data = this.build({ file: filePath });
    return data.files.find((f) => f.path === filePath || f.path.includes(filePath));
  }

  formatText(data: LineageData): string {
    const lines: string[] = [];
    lines.push('  Skill Lineage\n');

    if (data.skills.length === 0) {
      lines.push('  No skill executions found.\n');
      return lines.join('\n');
    }

    lines.push('  Skills');
    for (const skill of data.skills) {
      const duration = formatDurationMs(skill.totalDurationMs);
      lines.push(
        `    ${skill.skillName.padEnd(24)} ${skill.executions} runs   ${skill.commits.length} commits   ${skill.filesModified.length} files   ${duration} total`
      );
    }
    lines.push('');

    const hotspots = data.files.filter((f) => f.skills.length >= 2);
    if (hotspots.length > 0) {
      lines.push('  File Hotspots (touched by 2+ skills)');
      for (const f of hotspots.slice(0, 10)) {
        lines.push(`    ${f.path.padEnd(40)} ${f.skills.join(', ')}`);
      }
      lines.push('');
    }

    lines.push('  Stats');
    lines.push(`    Total executions: ${data.stats.totalSkillExecutions} | Commits: ${data.stats.totalCommits}`);
    if (data.stats.mostImpactfulSkill) {
      const skill = data.skills.find((s) => s.skillName === data.stats.mostImpactfulSkill);
      lines.push(`    Most impactful: ${data.stats.mostImpactfulSkill} (${skill?.filesModified.length ?? 0} files)`);
    }
    if (data.stats.errorProneFiles.length > 0) {
      lines.push(`    Error-prone: ${data.stats.errorProneFiles.join(', ')}`);
    }

    return lines.join('\n');
  }

  formatJson(data: LineageData): string {
    return JSON.stringify(data, null, 2);
  }
}
