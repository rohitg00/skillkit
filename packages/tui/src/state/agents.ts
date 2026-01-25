/**
 * Agent state management for SkillKit TUI
 */
import { loadConfig } from '@skillkit/core';
import { detectAgent, getAdapter, getAllAdapters } from '@skillkit/agents';
import type { AgentType } from '@skillkit/core';

/**
 * Agent status information
 */
export interface AgentStatus {
  type: AgentType;
  name: string;
  detected: boolean;
  configured: boolean;
}

/**
 * Agents state
 */
export interface AgentsState {
  agents: AgentStatus[];
  currentAgent: AgentType;
  loading: boolean;
  error: string | null;
}

/**
 * Create initial agents state
 */
export function createAgentsState(): AgentsState {
  return {
    agents: [],
    currentAgent: 'universal',
    loading: true,
    error: null,
  };
}

/**
 * Load all agents with their detection status
 */
export async function loadAgents(): Promise<AgentsState> {
  try {
    const config = loadConfig();
    const currentAgent = config.agent || 'universal';
    const detectedAgent = await detectAgent();
    const allAdapters = getAllAdapters();

    const agents: AgentStatus[] = allAdapters.map((adapter) => ({
      type: adapter.type,
      name: adapter.name,
      detected: adapter.type === detectedAgent,
      configured: adapter.type === currentAgent,
    }));

    return {
      agents,
      currentAgent,
      loading: false,
      error: null,
    };
  } catch (err) {
    return {
      agents: [],
      currentAgent: 'universal',
      loading: false,
      error: err instanceof Error ? err.message : 'Failed to load agents',
    };
  }
}

/**
 * Get count of detected agents
 */
export function getDetectedAgentCount(state: AgentsState): number {
  return state.agents.filter((a) => a.detected).length;
}

/**
 * Get list of detected agents
 */
export function getDetectedAgents(state: AgentsState): AgentStatus[] {
  return state.agents.filter((a) => a.detected);
}

/**
 * Get agent adapter by type
 */
export function getAgentAdapter(type: AgentType) {
  return getAdapter(type);
}

/**
 * Total number of supported agents
 */
export const TOTAL_AGENTS = 17;
