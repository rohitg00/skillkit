/**
 * Memory Observer
 *
 * Captures observations during skill execution and stores them in the ObservationStore.
 * Provides intelligent filtering to capture only significant events.
 */

import type { AgentType } from '../types.js';
import type { ExecutionProgressEvent } from '../executor/engine.js';
import type { ObservationType, ObservationContent, Observation } from './types.js';
import { ObservationStore } from './observation-store.js';

/**
 * Event types that can be observed
 */
export type ObservableEventType =
  | 'task_start'
  | 'task_complete'
  | 'task_failed'
  | 'checkpoint_reached'
  | 'checkpoint_decision'
  | 'verification_passed'
  | 'verification_failed'
  | 'file_modified'
  | 'error_encountered'
  | 'solution_applied'
  | 'execution_start'
  | 'execution_complete'
  | 'execution_paused';

/**
 * Observable event structure
 */
export interface ObservableEvent {
  type: ObservableEventType;
  timestamp: string;
  skillName?: string;
  taskId?: string;
  taskName?: string;
  taskAction?: string;
  files?: string[];
  error?: string;
  output?: string;
  decision?: string;
  context?: string;
}

/**
 * Observer configuration
 */
export interface MemoryObserverConfig {
  /** Minimum relevance score to store (0-100) */
  minRelevance?: number;
  /** Whether to capture task starts */
  captureTaskStarts?: boolean;
  /** Whether to capture checkpoints */
  captureCheckpoints?: boolean;
  /** Whether to capture file modifications */
  captureFileModifications?: boolean;
  /** Whether to capture errors */
  captureErrors?: boolean;
  /** Whether to capture solutions */
  captureSolutions?: boolean;
  /** Custom relevance scorer */
  relevanceScorer?: (event: ObservableEvent) => number;
}

const DEFAULT_CONFIG: Required<Omit<MemoryObserverConfig, 'relevanceScorer'>> = {
  minRelevance: 30,
  captureTaskStarts: false, // Task starts are usually low-value
  captureCheckpoints: true,
  captureFileModifications: true,
  captureErrors: true,
  captureSolutions: true,
};

/**
 * Memory Observer
 *
 * Captures and filters observations during skill execution.
 */
export class MemoryObserver {
  private store: ObservationStore;
  private config: Required<Omit<MemoryObserverConfig, 'relevanceScorer'>> & {
    relevanceScorer?: (event: ObservableEvent) => number;
  };
  private currentAgent: AgentType = 'claude-code';
  private currentSkillName?: string;
  private pendingErrors: Map<string, ObservableEvent> = new Map();

  constructor(projectPath: string, sessionId?: string, config?: MemoryObserverConfig) {
    this.store = new ObservationStore(projectPath, sessionId);
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Set the current agent being used
   */
  setAgent(agent: AgentType): void {
    this.currentAgent = agent;
  }

  /**
   * Set the current skill being executed
   */
  setSkillName(skillName: string): void {
    this.currentSkillName = skillName;
  }

  /**
   * Get the underlying observation store
   */
  getStore(): ObservationStore {
    return this.store;
  }

  /**
   * Observe an event and potentially store it
   */
  observe(event: ObservableEvent): Observation | null {
    // Check if we should capture this event type
    if (!this.shouldCapture(event)) {
      return null;
    }

    // Classify the event into an observation type
    const observationType = this.classifyEvent(event);

    // Extract content from the event
    const content = this.extractContent(event);

    // Score relevance
    const relevance = this.scoreRelevance(event);

    // Check minimum relevance threshold
    if (relevance < this.config.minRelevance) {
      return null;
    }

    // Store the observation
    return this.store.add(observationType, content, this.currentAgent, relevance);
  }

  /**
   * Create an observation callback for the SkillExecutionEngine
   */
  createProgressCallback(): (event: ExecutionProgressEvent) => void {
    return (progressEvent: ExecutionProgressEvent) => {
      const observableEvent = this.convertProgressEvent(progressEvent);
      if (observableEvent) {
        this.observe(observableEvent);
      }
    };
  }

  /**
   * Convert ExecutionProgressEvent to ObservableEvent
   */
  private convertProgressEvent(event: ExecutionProgressEvent): ObservableEvent | null {
    const baseEvent = {
      timestamp: new Date().toISOString(),
      skillName: this.currentSkillName,
      taskId: event.taskId,
      taskName: event.taskName,
    };

    switch (event.type) {
      case 'task_start':
        return {
          ...baseEvent,
          type: 'task_start',
          context: `Starting task ${event.taskIndex !== undefined ? event.taskIndex + 1 : ''} of ${event.totalTasks || '?'}`,
        };

      case 'task_complete':
        if (event.status === 'failed') {
          return {
            ...baseEvent,
            type: 'task_failed',
            error: event.error,
            context: event.message,
          };
        }
        return {
          ...baseEvent,
          type: 'task_complete',
          output: event.message,
          context: `Completed task ${event.taskIndex !== undefined ? event.taskIndex + 1 : ''} of ${event.totalTasks || '?'}`,
        };

      case 'checkpoint':
        return {
          ...baseEvent,
          type: 'checkpoint_reached',
          context: event.message,
        };

      case 'verification':
        const passed = event.message?.includes('passed');
        return {
          ...baseEvent,
          type: passed ? 'verification_passed' : 'verification_failed',
          context: event.message,
          error: passed ? undefined : event.message,
        };

      case 'complete':
        return {
          ...baseEvent,
          type: 'execution_complete',
          context: event.message,
          error: event.status === 'failed' ? event.message : undefined,
        };

      default:
        return null;
    }
  }

  /**
   * Record a file modification event
   */
  recordFileModification(files: string[], context: string): Observation | null {
    return this.observe({
      type: 'file_modified',
      timestamp: new Date().toISOString(),
      skillName: this.currentSkillName,
      files,
      context,
    });
  }

  /**
   * Record an error event
   */
  recordError(error: string, context: string, taskId?: string): Observation | null {
    const event: ObservableEvent = {
      type: 'error_encountered',
      timestamp: new Date().toISOString(),
      skillName: this.currentSkillName,
      taskId,
      error,
      context,
    };

    // Store pending error for potential solution matching
    const errorKey = this.generateErrorKey(error);
    this.pendingErrors.set(errorKey, event);

    return this.observe(event);
  }

  /**
   * Record a solution event (potentially matching a previous error)
   */
  recordSolution(solution: string, context: string, relatedError?: string): Observation | null {
    const event: ObservableEvent = {
      type: 'solution_applied',
      timestamp: new Date().toISOString(),
      skillName: this.currentSkillName,
      output: solution,
      context,
      error: relatedError,
    };

    // If we can match this to a pending error, increase relevance
    if (relatedError) {
      const errorKey = this.generateErrorKey(relatedError);
      this.pendingErrors.delete(errorKey);
    }

    return this.observe(event);
  }

  /**
   * Record a decision event
   */
  recordDecision(decision: string, options: string[], context: string): Observation | null {
    return this.observe({
      type: 'checkpoint_decision',
      timestamp: new Date().toISOString(),
      skillName: this.currentSkillName,
      decision,
      context: `Decision: ${decision} (options: ${options.join(', ')}). Context: ${context}`,
    });
  }

  /**
   * Record execution start
   */
  recordExecutionStart(skillName: string, agent: AgentType): Observation | null {
    this.currentSkillName = skillName;
    this.currentAgent = agent;

    return this.observe({
      type: 'execution_start',
      timestamp: new Date().toISOString(),
      skillName,
      context: `Started execution of skill "${skillName}" with agent "${agent}"`,
    });
  }

  /**
   * Record execution pause
   */
  recordExecutionPause(reason?: string): Observation | null {
    return this.observe({
      type: 'execution_paused',
      timestamp: new Date().toISOString(),
      skillName: this.currentSkillName,
      context: reason || 'Execution paused',
    });
  }

  /**
   * Check if we should capture this event type
   */
  private shouldCapture(event: ObservableEvent): boolean {
    switch (event.type) {
      case 'task_start':
        return this.config.captureTaskStarts;
      case 'checkpoint_reached':
      case 'checkpoint_decision':
        return this.config.captureCheckpoints;
      case 'file_modified':
        return this.config.captureFileModifications;
      case 'error_encountered':
      case 'task_failed':
      case 'verification_failed':
        return this.config.captureErrors;
      case 'solution_applied':
        return this.config.captureSolutions;
      default:
        return true;
    }
  }

  /**
   * Classify event into observation type
   */
  private classifyEvent(event: ObservableEvent): ObservationType {
    switch (event.type) {
      case 'error_encountered':
      case 'task_failed':
      case 'verification_failed':
        return 'error';

      case 'solution_applied':
        return 'solution';

      case 'checkpoint_decision':
        return 'decision';

      case 'file_modified':
        return 'file_change';

      case 'execution_paused':
      case 'checkpoint_reached':
        return 'checkpoint';

      case 'task_start':
      case 'task_complete':
      case 'verification_passed':
      case 'execution_start':
      case 'execution_complete':
      default:
        return 'tool_use';
    }
  }

  /**
   * Extract content from event
   */
  private extractContent(event: ObservableEvent): ObservationContent {
    const content: ObservationContent = {
      action: this.getActionDescription(event),
      context: event.context || this.generateContext(event),
    };

    if (event.output) {
      content.result = event.output;
    }

    if (event.files && event.files.length > 0) {
      content.files = event.files;
    }

    if (event.error) {
      content.error = event.error;
    }

    if (event.type === 'solution_applied' && event.output) {
      content.solution = event.output;
    }

    // Generate tags based on event
    content.tags = this.generateTags(event);

    return content;
  }

  /**
   * Get action description from event
   */
  private getActionDescription(event: ObservableEvent): string {
    switch (event.type) {
      case 'task_start':
        return `Started task: ${event.taskName || 'unknown'}`;
      case 'task_complete':
        return `Completed task: ${event.taskName || 'unknown'}`;
      case 'task_failed':
        return `Task failed: ${event.taskName || 'unknown'}`;
      case 'checkpoint_reached':
        return `Checkpoint: ${event.taskName || 'unknown'}`;
      case 'checkpoint_decision':
        return `Decision made: ${event.decision || 'unknown'}`;
      case 'verification_passed':
        return `Verification passed: ${event.taskName || 'unknown'}`;
      case 'verification_failed':
        return `Verification failed: ${event.taskName || 'unknown'}`;
      case 'file_modified':
        return `Modified files: ${event.files?.join(', ') || 'unknown'}`;
      case 'error_encountered':
        return `Error: ${event.error?.slice(0, 100) || 'unknown'}`;
      case 'solution_applied':
        return `Solution applied: ${event.output?.slice(0, 100) || 'unknown'}`;
      case 'execution_start':
        return `Started skill: ${event.skillName || 'unknown'}`;
      case 'execution_complete':
        return `Completed skill: ${event.skillName || 'unknown'}`;
      case 'execution_paused':
        return `Paused skill: ${event.skillName || 'unknown'}`;
      default:
        return 'Unknown action';
    }
  }

  /**
   * Generate context if not provided
   */
  private generateContext(event: ObservableEvent): string {
    const parts: string[] = [];

    if (event.skillName) {
      parts.push(`Skill: ${event.skillName}`);
    }

    if (event.taskName) {
      parts.push(`Task: ${event.taskName}`);
    }

    if (event.taskAction) {
      parts.push(`Action: ${event.taskAction}`);
    }

    return parts.join(' | ') || 'No context available';
  }

  /**
   * Generate tags for event
   */
  private generateTags(event: ObservableEvent): string[] {
    const tags: string[] = [];

    // Add event type as tag
    tags.push(event.type.replace(/_/g, '-'));

    // Add skill name if present
    if (event.skillName) {
      tags.push(event.skillName.toLowerCase().replace(/[^a-z0-9-]/g, '-'));
    }

    // Add error-related tags
    if (event.error) {
      if (event.error.toLowerCase().includes('type')) tags.push('typescript');
      if (event.error.toLowerCase().includes('import')) tags.push('imports');
      if (event.error.toLowerCase().includes('null') || event.error.toLowerCase().includes('undefined'))
        tags.push('null-check');
      if (event.error.toLowerCase().includes('async') || event.error.toLowerCase().includes('await'))
        tags.push('async');
    }

    // Add file-related tags
    if (event.files) {
      for (const file of event.files) {
        if (file.endsWith('.ts') || file.endsWith('.tsx')) tags.push('typescript');
        if (file.endsWith('.js') || file.endsWith('.jsx')) tags.push('javascript');
        if (file.endsWith('.css') || file.endsWith('.scss')) tags.push('styles');
        if (file.includes('test') || file.includes('spec')) tags.push('testing');
        if (file.includes('component')) tags.push('components');
      }
    }

    return [...new Set(tags)];
  }

  /**
   * Score relevance of event
   */
  private scoreRelevance(event: ObservableEvent): number {
    // Use custom scorer if provided
    if (this.config.relevanceScorer) {
      return this.config.relevanceScorer(event);
    }

    // Default relevance scoring
    let score = 50; // Base score

    switch (event.type) {
      // High relevance events
      case 'error_encountered':
      case 'task_failed':
        score = 85;
        break;

      case 'solution_applied':
        score = 90;
        // Bonus if it matches a pending error
        if (event.error) {
          const errorKey = this.generateErrorKey(event.error);
          if (this.pendingErrors.has(errorKey)) {
            score = 95;
          }
        }
        break;

      case 'checkpoint_decision':
        score = 75;
        break;

      case 'verification_failed':
        score = 80;
        break;

      // Medium relevance events
      case 'file_modified':
        score = 60;
        // More files = higher relevance
        if (event.files && event.files.length > 3) {
          score = 70;
        }
        break;

      case 'checkpoint_reached':
        score = 55;
        break;

      case 'task_complete':
      case 'verification_passed':
        score = 50;
        break;

      // Lower relevance events
      case 'task_start':
        score = 30;
        break;

      case 'execution_start':
      case 'execution_complete':
        score = 40;
        break;

      case 'execution_paused':
        score = 60;
        break;

      default:
        score = 50;
    }

    // Adjust based on content richness
    if (event.context && event.context.length > 100) {
      score += 5;
    }

    if (event.files && event.files.length > 0) {
      score += 5;
    }

    // Cap at 100
    return Math.min(score, 100);
  }

  /**
   * Generate a key for matching errors to solutions
   */
  private generateErrorKey(error: string): string {
    // Normalize error string for matching
    return error
      .toLowerCase()
      .replace(/[0-9]+/g, 'N') // Replace numbers
      .replace(/['"`]/g, '') // Remove quotes
      .replace(/\s+/g, ' ') // Normalize whitespace
      .slice(0, 100); // Limit length
  }

  /**
   * Get session ID
   */
  getSessionId(): string {
    return this.store.getSessionId();
  }

  /**
   * Get all observations
   */
  getObservations(): Observation[] {
    return this.store.getAll();
  }

  /**
   * Get observation count
   */
  getObservationCount(): number {
    return this.store.count();
  }

  /**
   * Clear all observations
   */
  clear(): void {
    this.store.clear();
    this.pendingErrors.clear();
  }
}

/**
 * Create a MemoryObserver instance
 */
export function createMemoryObserver(
  projectPath: string,
  sessionId?: string,
  config?: MemoryObserverConfig
): MemoryObserver {
  return new MemoryObserver(projectPath, sessionId, config);
}
