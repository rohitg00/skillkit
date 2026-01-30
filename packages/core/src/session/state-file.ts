import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

export interface SessionFile {
  date: string;
  agent: string;
  projectPath: string;
  startedAt: string;
  lastUpdated: string;
  completed: string[];
  inProgress: string[];
  notes: string[];
  contextToLoad: string[];
}

export interface SessionSummary {
  date: string;
  projectPath: string;
  agent: string;
  taskCount: number;
  completedCount: number;
  hasNotes: boolean;
}

function getSessionsDir(): string {
  return join(homedir(), '.skillkit', 'sessions');
}

function getSessionFilePath(date?: string): string {
  const d = date || new Date().toISOString().split('T')[0];
  return join(getSessionsDir(), `${d}-session.md`);
}

export function loadSessionFile(date?: string): SessionFile | null {
  const filepath = getSessionFilePath(date);

  if (!existsSync(filepath)) {
    return null;
  }

  try {
    const content = readFileSync(filepath, 'utf-8');
    return parseSessionFile(content);
  } catch {
    return null;
  }
}

export function saveSessionFile(session: SessionFile): string {
  const dir = getSessionsDir();
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  const filepath = getSessionFilePath(session.date);
  const content = formatSessionFile(session);
  writeFileSync(filepath, content);

  return filepath;
}

export function createSessionFile(
  agent: string,
  projectPath: string
): SessionFile {
  const now = new Date();

  return {
    date: now.toISOString().split('T')[0],
    agent,
    projectPath,
    startedAt: now.toISOString(),
    lastUpdated: now.toISOString(),
    completed: [],
    inProgress: [],
    notes: [],
    contextToLoad: [],
  };
}

export function updateSessionFile(
  session: SessionFile,
  updates: Partial<Pick<SessionFile, 'completed' | 'inProgress' | 'notes' | 'contextToLoad'>>
): SessionFile {
  const updated: SessionFile = {
    ...session,
    lastUpdated: new Date().toISOString(),
  };

  if (updates.completed) {
    updated.completed = [...new Set([...session.completed, ...updates.completed])];
  }

  if (updates.inProgress) {
    updated.inProgress = updates.inProgress;
  }

  if (updates.notes) {
    updated.notes = [...session.notes, ...updates.notes];
  }

  if (updates.contextToLoad) {
    updated.contextToLoad = [...new Set([...session.contextToLoad, ...updates.contextToLoad])];
  }

  return updated;
}

function parseSessionFile(content: string): SessionFile {
  const lines = content.split('\n');

  const session: SessionFile = {
    date: '',
    agent: '',
    projectPath: '',
    startedAt: '',
    lastUpdated: '',
    completed: [],
    inProgress: [],
    notes: [],
    contextToLoad: [],
  };

  let currentSection = '';

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('# Session:')) {
      session.date = trimmed.replace('# Session:', '').trim();
    } else if (trimmed.startsWith('**Date:**')) {
      session.date = trimmed.replace('**Date:**', '').trim();
    } else if (trimmed.startsWith('**Started:**')) {
      session.startedAt = trimmed.replace('**Started:**', '').trim();
    } else if (trimmed.startsWith('**Last Updated:**')) {
      session.lastUpdated = trimmed.replace('**Last Updated:**', '').trim();
    } else if (trimmed.startsWith('**Agent:**')) {
      session.agent = trimmed.replace('**Agent:**', '').trim();
    } else if (trimmed.startsWith('**Project:**')) {
      session.projectPath = trimmed.replace('**Project:**', '').trim();
    } else if (trimmed === '### Completed') {
      currentSection = 'completed';
    } else if (trimmed === '### In Progress') {
      currentSection = 'inProgress';
    } else if (trimmed === '### Notes for Next Session') {
      currentSection = 'notes';
    } else if (trimmed === '### Context to Load') {
      currentSection = 'contextToLoad';
    } else if (trimmed.startsWith('- [x]')) {
      if (currentSection === 'completed') {
        session.completed.push(trimmed.replace('- [x]', '').trim());
      }
    } else if (trimmed.startsWith('- [ ]')) {
      if (currentSection === 'inProgress') {
        session.inProgress.push(trimmed.replace('- [ ]', '').trim());
      }
    } else if (trimmed.startsWith('- ')) {
      const item = trimmed.replace('- ', '').trim();
      if (currentSection === 'notes') {
        session.notes.push(item);
      } else if (currentSection === 'contextToLoad') {
        session.contextToLoad.push(item);
      }
    }
  }

  return session;
}

function formatSessionFile(session: SessionFile): string {
  const lines: string[] = [];

  lines.push(`# Session: ${session.date}`);
  lines.push(`**Date:** ${session.date}`);
  lines.push(`**Started:** ${session.startedAt}`);
  lines.push(`**Last Updated:** ${session.lastUpdated}`);
  lines.push(`**Agent:** ${session.agent}`);
  lines.push(`**Project:** ${session.projectPath}`);
  lines.push('');
  lines.push('## Current State');
  lines.push('');

  lines.push('### Completed');
  for (const task of session.completed) {
    lines.push(`- [x] ${task}`);
  }
  lines.push('');

  lines.push('### In Progress');
  for (const task of session.inProgress) {
    lines.push(`- [ ] ${task}`);
  }
  lines.push('');

  lines.push('### Notes for Next Session');
  for (const note of session.notes) {
    lines.push(`- ${note}`);
  }
  lines.push('');

  lines.push('### Context to Load');
  for (const ctx of session.contextToLoad) {
    lines.push(`- ${ctx}`);
  }
  lines.push('');

  return lines.join('\n');
}

export function listSessions(limit = 10): SessionSummary[] {
  const dir = getSessionsDir();

  if (!existsSync(dir)) {
    return [];
  }

  const files = readdirSync(dir)
    .filter(f => f.endsWith('-session.md'))
    .sort()
    .reverse()
    .slice(0, limit);

  const summaries: SessionSummary[] = [];

  for (const file of files) {
    const date = file.replace('-session.md', '');
    const session = loadSessionFile(date);

    if (session) {
      summaries.push({
        date: session.date,
        projectPath: session.projectPath,
        agent: session.agent,
        taskCount: session.completed.length + session.inProgress.length,
        completedCount: session.completed.length,
        hasNotes: session.notes.length > 0,
      });
    }
  }

  return summaries;
}

export function getMostRecentSession(): SessionFile | null {
  const summaries = listSessions(1);
  if (summaries.length === 0) {
    return null;
  }
  return loadSessionFile(summaries[0].date);
}
