export type AgentType = string;

export interface ExecutorServiceState {
  availableAgents: AgentType[];
  selectedAgent: AgentType | null;
  selectedSkill: string | null;
  executing: boolean;
  result: unknown | null;
  error: string | null;
}

export interface AgentAvailability {
  agent: AgentType;
  available: boolean;
  version?: string;
  path?: string;
}

export async function getAgentAvailability(): Promise<AgentAvailability[]> {
  return [
    { agent: 'claude-code', available: true },
    { agent: 'cursor', available: false },
    { agent: 'codex', available: false },
  ];
}

export async function listAvailableAgents(): Promise<AgentType[]> {
  return ['claude-code', 'cursor', 'codex'];
}

export async function executeSkill(
  _skillPath: string,
  _agent: AgentType,
  _options?: unknown
): Promise<{ success: boolean; output?: string; error?: string }> {
  return { success: true, output: 'Executed successfully' };
}

export async function executeSkillWithAgent(
  _skillPath: string,
  _agent: AgentType,
  _options?: unknown
): Promise<{ success: boolean; output?: string; error?: string }> {
  return { success: true, output: 'Executed successfully' };
}

export function formatSkillPrompt(_content: string, _agent: AgentType): string {
  return '';
}

export function getExecutionInstructions(_skill: string, _agent: AgentType): string {
  return 'Manual execution instructions';
}

export const executorService = {
  getAgentAvailability,
  listAvailableAgents,
  executeSkill,
  executeSkillWithAgent,
  formatSkillPrompt,
  getExecutionInstructions,
};
