import type {
  LearnedPattern,
  PatternCategory,
  PatternExtractionResult,
} from './types.js';

export interface SessionMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export interface SessionContext {
  messages: SessionMessage[];
  projectPath: string;
  startTime: string;
  endTime?: string;
}

export function extractPatternsFromSession(
  session: SessionContext
): PatternExtractionResult {
  const patterns: LearnedPattern[] = [];
  const skipped: { reason: string; commit?: string }[] = [];
  const errors: string[] = [];

  if (session.messages.length < 5) {
    skipped.push({ reason: 'Session too short for pattern extraction' });
    return { patterns, skipped, errors };
  }

  try {
    const errorFixPatterns = findErrorFixPatterns(session);
    patterns.push(...errorFixPatterns);

    const workaroundPatterns = findWorkaroundPatterns(session);
    patterns.push(...workaroundPatterns);

    const conventionPatterns = findConventionPatterns(session);
    patterns.push(...conventionPatterns);

    const debuggingPatterns = findDebuggingPatterns(session);
    patterns.push(...debuggingPatterns);
  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'Unknown extraction error');
  }

  return { patterns, skipped, errors };
}

function findErrorFixPatterns(session: SessionContext): LearnedPattern[] {
  const patterns: LearnedPattern[] = [];
  const messages = session.messages;

  for (let i = 0; i < messages.length - 1; i++) {
    const current = messages[i];
    const next = messages[i + 1];

    if (isErrorDescription(current.content) && isSolution(next.content)) {
      const pattern = createPatternFromErrorFix(
        current.content,
        next.content,
        session,
        i
      );
      if (pattern) {
        patterns.push(pattern);
      }
    }
  }

  return patterns;
}

function findWorkaroundPatterns(session: SessionContext): LearnedPattern[] {
  const patterns: LearnedPattern[] = [];
  const messages = session.messages;

  const workaroundKeywords = [
    'workaround',
    'instead of',
    'alternative',
    'hack',
    'temporary fix',
    'for now',
    'until',
  ];

  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    if (message.role !== 'assistant') continue;

    const content = message.content.toLowerCase();
    if (workaroundKeywords.some(kw => content.includes(kw))) {
      const problem = findPrecedingProblem(messages, i);
      if (problem) {
        const pattern = createPattern(
          'workaround',
          problem,
          message.content,
          session,
          i
        );
        if (pattern) {
          patterns.push(pattern);
        }
      }
    }
  }

  return patterns;
}

function findConventionPatterns(session: SessionContext): LearnedPattern[] {
  const patterns: LearnedPattern[] = [];
  const messages = session.messages;

  const conventionKeywords = [
    'naming convention',
    'pattern we use',
    'standard',
    'best practice',
    'we always',
    'convention',
    'style guide',
  ];

  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    if (message.role !== 'assistant') continue;

    const content = message.content.toLowerCase();
    if (conventionKeywords.some(kw => content.includes(kw))) {
      const pattern = createPattern(
        'convention',
        'Project convention discovered',
        message.content,
        session,
        i
      );
      if (pattern) {
        patterns.push(pattern);
      }
    }
  }

  return patterns;
}

function findDebuggingPatterns(session: SessionContext): LearnedPattern[] {
  const patterns: LearnedPattern[] = [];
  const messages = session.messages;

  const debugKeywords = [
    'to debug this',
    'debugging',
    'to find the issue',
    'trace',
    'breakpoint',
    'logging',
    'to diagnose',
  ];

  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    if (message.role !== 'assistant') continue;

    const content = message.content.toLowerCase();
    if (debugKeywords.some(kw => content.includes(kw))) {
      const problem = findPrecedingProblem(messages, i);
      if (problem) {
        const pattern = createPattern(
          'debugging',
          problem,
          message.content,
          session,
          i
        );
        if (pattern) {
          patterns.push(pattern);
        }
      }
    }
  }

  return patterns;
}

function isErrorDescription(content: string): boolean {
  const errorKeywords = [
    'error',
    'fail',
    'exception',
    'crash',
    'not working',
    'broken',
    'bug',
    'issue',
    'problem',
    'does not',
    "doesn't",
    "can't",
    'cannot',
  ];

  const lower = content.toLowerCase();
  return errorKeywords.some(kw => lower.includes(kw));
}

function isSolution(content: string): boolean {
  const solutionKeywords = [
    'fix',
    'solution',
    'resolve',
    'change',
    'update',
    'modify',
    'replace',
    'should be',
    'try this',
    'use instead',
  ];

  const lower = content.toLowerCase();
  return solutionKeywords.some(kw => lower.includes(kw));
}

function findPrecedingProblem(
  messages: SessionMessage[],
  currentIndex: number
): string | null {
  for (let i = currentIndex - 1; i >= 0 && i > currentIndex - 5; i--) {
    const message = messages[i];
    if (message.role === 'user' && message.content.length > 20) {
      return message.content;
    }
  }
  return null;
}

function createPatternFromErrorFix(
  errorDescription: string,
  solution: string,
  session: SessionContext,
  messageIndex: number
): LearnedPattern | null {
  return createPattern('error_fix', errorDescription, solution, session, messageIndex);
}

function createPattern(
  category: PatternCategory,
  problem: string,
  solution: string,
  session: SessionContext,
  messageIndex: number
): LearnedPattern | null {
  if (problem.length < 20 || solution.length < 20) {
    return null;
  }

  const id = `session-${Date.now()}-${messageIndex}`;
  const title = extractTitle(problem, category);

  return {
    id,
    category,
    title,
    problem: truncate(problem, 500),
    solution: truncate(solution, 1000),
    context: session.projectPath,
    extractedAt: new Date().toISOString(),
    source: 'session',
    approved: false,
    confidence: calculateSessionConfidence(problem, solution, session),
  };
}

function extractTitle(problem: string, category: PatternCategory): string {
  const firstSentence = problem.split(/[.!?]/)[0].trim();

  if (firstSentence.length > 80) {
    return `${category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')} pattern`;
  }

  return firstSentence;
}

function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + '...';
}

function calculateSessionConfidence(
  problem: string,
  solution: string,
  _session: SessionContext
): number {
  let confidence = 0.4;

  if (problem.length > 50 && problem.length < 500) {
    confidence += 0.1;
  }

  if (solution.length > 100 && solution.length < 1000) {
    confidence += 0.1;
  }

  if (solution.includes('```')) {
    confidence += 0.15;
  }

  return Math.min(0.85, confidence);
}

export function mergePatterns(
  existing: LearnedPattern[],
  newPatterns: LearnedPattern[]
): LearnedPattern[] {
  const merged = [...existing];

  for (const pattern of newPatterns) {
    const existingIndex = merged.findIndex(p =>
      p.problem === pattern.problem || p.id === pattern.id
    );

    if (existingIndex >= 0) {
      if (pattern.confidence > merged[existingIndex].confidence) {
        merged[existingIndex] = pattern;
      }
    } else {
      merged.push(pattern);
    }
  }

  return merged;
}
