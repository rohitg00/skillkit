/**
 * Skill Executor for Workflows
 *
 * Provides a real skill executor that finds skills by name
 * and executes them using available agent CLIs.
 */

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { findSkill, readSkillContent, SKILL_DISCOVERY_PATHS } from '../skills.js';
import type { AgentType } from '../types.js';
import {
  executeWithAgent,
  getAvailableCLIAgents,
  formatSkillAsPrompt,
  getExecutionStrategy,
  getManualExecutionInstructions,
} from './agents.js';
import type { SkillExecutor } from '../workflow/orchestrator.js';

/**
 * Options for creating a skill executor
 */
export interface SkillExecutorOptions {
  /** Project path to search for skills */
  projectPath?: string;
  /** Preferred agent to use for execution */
  preferredAgent?: AgentType;
  /** Timeout for skill execution (ms) */
  timeout?: number;
  /** Whether to fall back to other agents if preferred is unavailable */
  fallbackToAvailable?: boolean;
  /** Callback for execution events */
  onExecutionEvent?: (event: SkillExecutionEvent) => void;
}

/**
 * Skill execution event
 */
export interface SkillExecutionEvent {
  type: 'skill_found' | 'skill_not_found' | 'agent_selected' | 'execution_start' | 'execution_complete';
  skillName: string;
  agent?: AgentType;
  message?: string;
  success?: boolean;
  error?: string;
}

/**
 * Get search directories for skills
 */
function getSearchDirs(projectPath: string): string[] {
  const dirs: string[] = [];

  // Project-local paths
  for (const searchPath of SKILL_DISCOVERY_PATHS) {
    const fullPath = join(projectPath, searchPath);
    if (existsSync(fullPath)) {
      dirs.push(fullPath);
    }
  }

  // Global paths
  const home = homedir();
  const globalPaths = [
    join(home, '.claude', 'skills'),
    join(home, '.cursor', 'skills'),
    join(home, '.codex', 'skills'),
    join(home, '.skillkit', 'skills'),
  ];

  for (const globalPath of globalPaths) {
    if (existsSync(globalPath)) {
      dirs.push(globalPath);
    }
  }

  return dirs;
}

/**
 * Create a skill executor for workflow orchestration
 *
 * This returns a function compatible with the WorkflowOrchestrator's SkillExecutor type.
 */
export function createSkillExecutor(options: SkillExecutorOptions = {}): SkillExecutor {
  const {
    projectPath = process.cwd(),
    preferredAgent,
    timeout = 300000, // 5 minutes
    fallbackToAvailable = true,
    onExecutionEvent,
  } = options;

  return async (skillName: string, config?: Record<string, unknown>): Promise<{ success: boolean; error?: string }> => {
    // Find the skill
    const searchDirs = getSearchDirs(projectPath);
    const skill = findSkill(skillName, searchDirs);

    if (!skill) {
      onExecutionEvent?.({
        type: 'skill_not_found',
        skillName,
        message: `Skill "${skillName}" not found in any search directory`,
      });

      return {
        success: false,
        error: `Skill "${skillName}" not found. Search paths: ${searchDirs.join(', ')}`,
      };
    }

    onExecutionEvent?.({
      type: 'skill_found',
      skillName,
      message: `Found skill at: ${skill.path}`,
    });

    // Read skill content
    const content = readSkillContent(skill.path);
    if (!content) {
      return {
        success: false,
        error: `Could not read skill content from: ${skill.path}`,
      };
    }

    // Determine which agent to use
    let agentToUse: AgentType | undefined = preferredAgent;

    if (!agentToUse || fallbackToAvailable) {
      const availableAgents = await getAvailableCLIAgents();

      if (preferredAgent && availableAgents.includes(preferredAgent)) {
        agentToUse = preferredAgent;
      } else if (availableAgents.length > 0) {
        // Prefer claude-code if available, otherwise use first available
        agentToUse = availableAgents.includes('claude-code') ? 'claude-code' : availableAgents[0];
      }
    }

    // If no CLI agent available, provide manual instructions
    if (!agentToUse) {
      const strategy = getExecutionStrategy(preferredAgent || 'universal');

      if (strategy === 'ide' || strategy === 'manual') {
        const instructions = getManualExecutionInstructions(preferredAgent || 'universal', skill.path);

        onExecutionEvent?.({
          type: 'execution_complete',
          skillName,
          success: false,
          message: 'No CLI agent available',
          error: `No CLI agent available for execution.\n${instructions}`,
        });

        return {
          success: false,
          error: `No CLI agent available for automated execution. ${instructions}`,
        };
      }
    }

    onExecutionEvent?.({
      type: 'agent_selected',
      skillName,
      agent: agentToUse,
      message: `Using agent: ${agentToUse}`,
    });

    // Format the prompt with skill content and any config
    let taskDescription: string | undefined;
    if (config?.task) {
      taskDescription = String(config.task);
    }

    const prompt = formatSkillAsPrompt(skillName, content, taskDescription);

    onExecutionEvent?.({
      type: 'execution_start',
      skillName,
      agent: agentToUse,
      message: `Starting execution with ${agentToUse}`,
    });

    // Execute with the agent
    const result = await executeWithAgent(agentToUse!, prompt, {
      cwd: projectPath,
      timeout,
    });

    onExecutionEvent?.({
      type: 'execution_complete',
      skillName,
      agent: agentToUse,
      success: result.success,
      error: result.error,
      message: result.success ? 'Execution completed successfully' : `Execution failed: ${result.error}`,
    });

    return {
      success: result.success,
      error: result.error,
    };
  };
}

/**
 * Create a simulated skill executor for testing/dry-run
 *
 * This executor doesn't actually run skills but simulates execution.
 */
export function createSimulatedSkillExecutor(options: {
  delay?: number;
  shouldFail?: (skillName: string) => boolean;
  onExecute?: (skillName: string) => void;
} = {}): SkillExecutor {
  const { delay = 100, shouldFail, onExecute } = options;

  return async (skillName: string, _config?: Record<string, unknown>): Promise<{ success: boolean; error?: string }> => {
    onExecute?.(skillName);

    // Simulate execution time
    await new Promise((resolve) => setTimeout(resolve, delay));

    const failed = shouldFail?.(skillName) ?? false;

    return {
      success: !failed,
      error: failed ? `Simulated failure for skill: ${skillName}` : undefined,
    };
  };
}
