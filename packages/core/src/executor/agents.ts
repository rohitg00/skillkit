/**
 * Agent Execution Module
 *
 * Handles real execution of skills through various AI agent CLIs.
 */

import { spawn, type SpawnOptions } from 'node:child_process';
import type { AgentType } from '../types.js';

/**
 * Agent CLI configuration
 */
export interface AgentCLIConfig {
  /** Agent type */
  type: AgentType;
  /** CLI command name */
  command: string;
  /** Whether the agent supports CLI execution */
  supportsCLI: boolean;
  /** Arguments to pass the prompt/skill content */
  promptArgs?: string[];
  /** Arguments for non-interactive mode */
  nonInteractiveArgs?: string[];
  /** Environment variables needed */
  envVars?: Record<string, string>;
  /** How to check if agent is installed */
  checkCommand?: string;
}

/**
 * Execution result from an agent
 */
export interface AgentExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  exitCode: number;
  duration: number;
}

/**
 * Agent CLI configurations
 */
export const AGENT_CLI_CONFIGS: AgentCLIConfig[] = [
  {
    type: 'claude-code',
    command: 'claude',
    supportsCLI: true,
    promptArgs: ['--print', '-p'],
    nonInteractiveArgs: ['--no-input'],
    checkCommand: 'claude --version',
  },
  {
    type: 'codex',
    command: 'codex',
    supportsCLI: true,
    promptArgs: ['-p'],
    checkCommand: 'codex --version',
  },
  {
    type: 'gemini-cli',
    command: 'gemini',
    supportsCLI: true,
    promptArgs: [],
    checkCommand: 'gemini --version',
  },
  {
    type: 'opencode',
    command: 'opencode',
    supportsCLI: true,
    promptArgs: ['--prompt'],
    checkCommand: 'opencode --version',
  },
  {
    type: 'goose',
    command: 'goose',
    supportsCLI: true,
    promptArgs: ['run'],
    checkCommand: 'goose --version',
  },
  // IDE-based agents (no CLI execution)
  {
    type: 'cursor',
    command: 'cursor',
    supportsCLI: false,
  },
  {
    type: 'windsurf',
    command: 'windsurf',
    supportsCLI: false,
  },
  {
    type: 'github-copilot',
    command: 'gh copilot',
    supportsCLI: false,
  },
];

/**
 * Get CLI config for an agent
 */
export function getAgentCLIConfig(agentType: AgentType): AgentCLIConfig | undefined {
  return AGENT_CLI_CONFIGS.find((c) => c.type === agentType);
}

/**
 * Check if an agent CLI is available
 */
export async function isAgentCLIAvailable(agentType: AgentType): Promise<boolean> {
  const config = getAgentCLIConfig(agentType);
  if (!config || !config.supportsCLI) return false;

  try {
    // Check if command exists
    const checkCmd = config.checkCommand || `which ${config.command}`;
    const result = await executeCommand(checkCmd.split(' ')[0], checkCmd.split(' ').slice(1), {
      timeout: 5000,
    });
    return result.exitCode === 0;
  } catch {
    return false;
  }
}

/**
 * Get all available CLI agents
 */
export async function getAvailableCLIAgents(): Promise<AgentType[]> {
  const available: AgentType[] = [];

  for (const config of AGENT_CLI_CONFIGS) {
    if (config.supportsCLI && (await isAgentCLIAvailable(config.type))) {
      available.push(config.type);
    }
  }

  return available;
}

/**
 * Execute a skill using an agent CLI
 */
export async function executeWithAgent(
  agentType: AgentType,
  prompt: string,
  options: {
    cwd?: string;
    timeout?: number;
    env?: Record<string, string>;
  } = {}
): Promise<AgentExecutionResult> {
  const config = getAgentCLIConfig(agentType);

  if (!config) {
    return {
      success: false,
      output: '',
      error: `Unknown agent type: ${agentType}`,
      exitCode: 1,
      duration: 0,
    };
  }

  if (!config.supportsCLI) {
    return {
      success: false,
      output: '',
      error: `Agent ${agentType} does not support CLI execution. Please use IDE integration.`,
      exitCode: 1,
      duration: 0,
    };
  }

  const isAvailable = await isAgentCLIAvailable(agentType);
  if (!isAvailable) {
    return {
      success: false,
      output: '',
      error: `Agent CLI '${config.command}' is not installed or not in PATH`,
      exitCode: 1,
      duration: 0,
    };
  }

  // Build command arguments
  const args: string[] = [...(config.promptArgs || [])];

  // For Claude Code, use --print mode with the prompt
  if (agentType === 'claude-code') {
    args.push(prompt);
  } else {
    // For other agents, pass prompt as argument
    args.push(prompt);
  }

  // Add non-interactive flags if available
  if (config.nonInteractiveArgs) {
    args.push(...config.nonInteractiveArgs);
  }

  return executeCommand(config.command, args, {
    cwd: options.cwd || process.cwd(),
    timeout: options.timeout || 300000, // 5 minutes default
    env: {
      ...process.env,
      ...config.envVars,
      ...options.env,
    },
  });
}

/**
 * Execute a command and capture output
 */
async function executeCommand(
  command: string,
  args: string[],
  options: {
    cwd?: string;
    timeout?: number;
    env?: NodeJS.ProcessEnv;
  } = {}
): Promise<AgentExecutionResult> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    let stdout = '';
    let stderr = '';
    let timedOut = false;

    const spawnOptions: SpawnOptions = {
      cwd: options.cwd,
      env: options.env as NodeJS.ProcessEnv,
      // shell: false (default) - prevents shell injection when passing untrusted input
    };

    const child = spawn(command, args, spawnOptions);

    // Set up timeout
    const timeoutId = options.timeout
      ? setTimeout(() => {
          timedOut = true;
          child.kill('SIGTERM');
        }, options.timeout)
      : null;

    child.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('error', (error) => {
      if (timeoutId) clearTimeout(timeoutId);
      resolve({
        success: false,
        output: stdout,
        error: error.message,
        exitCode: 1,
        duration: Date.now() - startTime,
      });
    });

    child.on('close', (code) => {
      if (timeoutId) clearTimeout(timeoutId);
      resolve({
        success: code === 0 && !timedOut,
        output: stdout,
        error: timedOut ? 'Execution timed out' : stderr || undefined,
        exitCode: code ?? 1,
        duration: Date.now() - startTime,
      });
    });
  });
}

/**
 * Format skill content as a prompt for an agent
 */
export function formatSkillAsPrompt(
  skillName: string,
  skillContent: string,
  taskDescription?: string
): string {
  let prompt = `Execute the following skill: ${skillName}\n\n`;

  if (taskDescription) {
    prompt += `Task: ${taskDescription}\n\n`;
  }

  prompt += `Skill Content:\n${skillContent}`;

  return prompt;
}

/**
 * Agent execution strategy
 */
export type ExecutionStrategy = 'cli' | 'ide' | 'api' | 'manual';

/**
 * Get recommended execution strategy for an agent
 */
export function getExecutionStrategy(agentType: AgentType): ExecutionStrategy {
  const config = getAgentCLIConfig(agentType);

  if (config?.supportsCLI) {
    return 'cli';
  }

  // IDE-based agents
  if (['cursor', 'windsurf', 'github-copilot', 'kilo'].includes(agentType)) {
    return 'ide';
  }

  return 'manual';
}

/**
 * Get instructions for manual/IDE execution
 */
export function getManualExecutionInstructions(
  agentType: AgentType,
  skillPath: string
): string {
  const strategy = getExecutionStrategy(agentType);

  if (strategy === 'ide') {
    return `
To execute this skill with ${agentType}:
1. Open your project in ${agentType}
2. The skill has been synced to the agent's skills directory
3. Open the AI assistant/chat
4. Reference the skill or ask the assistant to follow the instructions

Skill location: ${skillPath}
`;
  }

  return `
To execute this skill manually:
1. Open the skill file: ${skillPath}
2. Copy the skill content
3. Paste it into your AI coding assistant
4. Follow the instructions in the skill
`;
}
