/**
 * Agent Discovery
 *
 * Discovers custom agent definitions across all supported locations.
 */

import { existsSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { homedir } from 'node:os';
import {
  ALL_AGENT_DISCOVERY_PATHS,
  AGENT_DISCOVERY_PATHS,
  type CustomAgent,
  type AgentLocation,
} from './types.js';
import { parseAgentFile, parseAgentDir } from './parser.js';
import type { AgentType } from '../types.js';

/**
 * Discover agents in a specific directory
 */
function discoverAgentsInDir(
  dir: string,
  location: AgentLocation
): CustomAgent[] {
  const agents: CustomAgent[] = [];

  if (!existsSync(dir)) {
    return agents;
  }

  try {
    const entries = readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const entryPath = join(dir, entry.name);

      if (entry.isFile() && extname(entry.name) === '.md') {
        // Parse markdown file directly
        const agent = parseAgentFile(entryPath, location);
        if (agent) {
          agents.push(agent);
        }
      } else if (entry.isDirectory()) {
        // Parse directory with AGENT.md inside
        const agent = parseAgentDir(entryPath, location);
        if (agent) {
          agents.push(agent);
        }
      }
    }
  } catch {
    // Ignore errors (permission denied, etc.)
  }

  return agents;
}

/**
 * Discover all agents in a project directory
 */
export function discoverAgents(rootDir: string): CustomAgent[] {
  const agents: CustomAgent[] = [];
  const seen = new Set<string>();

  // Search all standard paths
  for (const searchPath of ALL_AGENT_DISCOVERY_PATHS) {
    const fullPath = join(rootDir, searchPath);
    if (existsSync(fullPath)) {
      for (const agent of discoverAgentsInDir(fullPath, 'project')) {
        if (!seen.has(agent.name)) {
          seen.add(agent.name);
          agents.push(agent);
        }
      }
    }
  }

  return agents;
}

/**
 * Discover agents for a specific AI coding agent
 */
export function discoverAgentsForAgent(
  rootDir: string,
  agentType: AgentType
): CustomAgent[] {
  const agents: CustomAgent[] = [];
  const seen = new Set<string>();
  const paths = AGENT_DISCOVERY_PATHS[agentType] || [];

  for (const searchPath of paths) {
    const fullPath = join(rootDir, searchPath);
    if (existsSync(fullPath)) {
      for (const agent of discoverAgentsInDir(fullPath, 'project')) {
        if (!seen.has(agent.name)) {
          seen.add(agent.name);
          agents.push(agent);
        }
      }
    }
  }

  return agents;
}

/**
 * Discover global agents (in ~/.claude/agents, etc.)
 */
export function discoverGlobalAgents(): CustomAgent[] {
  const agents: CustomAgent[] = [];
  const seen = new Set<string>();
  const home = homedir();

  // Global agent paths
  const globalPaths = [
    join(home, '.claude', 'agents'),
    join(home, '.skillkit', 'agents'),
    join(home, '.config', 'skillkit', 'agents'),
  ];

  for (const searchPath of globalPaths) {
    if (existsSync(searchPath)) {
      for (const agent of discoverAgentsInDir(searchPath, 'global')) {
        if (!seen.has(agent.name)) {
          seen.add(agent.name);
          agents.push(agent);
        }
      }
    }
  }

  return agents;
}

/**
 * Find all agents (project + global)
 */
export function findAllAgents(searchDirs: string[]): CustomAgent[] {
  const agents: CustomAgent[] = [];
  const seen = new Set<string>();

  // Search provided directories
  for (const dir of searchDirs) {
    if (!existsSync(dir)) continue;

    const discovered = discoverAgents(dir);
    for (const agent of discovered) {
      if (!seen.has(agent.name)) {
        seen.add(agent.name);
        agents.push(agent);
      }
    }
  }

  // Add global agents
  for (const agent of discoverGlobalAgents()) {
    if (!seen.has(agent.name)) {
      seen.add(agent.name);
      agents.push(agent);
    }
  }

  return agents;
}

/**
 * Find a specific agent by name
 */
export function findAgent(
  name: string,
  searchDirs: string[]
): CustomAgent | null {
  // Search in provided directories first
  for (const dir of searchDirs) {
    if (!existsSync(dir)) continue;

    // Check all discovery paths
    for (const searchPath of ALL_AGENT_DISCOVERY_PATHS) {
      const agentsDir = join(dir, searchPath);
      if (!existsSync(agentsDir)) continue;

      // Try as file
      const agentFile = join(agentsDir, `${name}.md`);
      if (existsSync(agentFile)) {
        return parseAgentFile(agentFile, 'project');
      }

      // Try as directory
      const agentDir = join(agentsDir, name);
      if (existsSync(agentDir) && statSync(agentDir).isDirectory()) {
        return parseAgentDir(agentDir, 'project');
      }
    }
  }

  // Check global agents
  const home = homedir();
  const globalPaths = [
    join(home, '.claude', 'agents'),
    join(home, '.skillkit', 'agents'),
  ];

  for (const agentsDir of globalPaths) {
    if (!existsSync(agentsDir)) continue;

    const agentFile = join(agentsDir, `${name}.md`);
    if (existsSync(agentFile)) {
      return parseAgentFile(agentFile, 'global');
    }

    const agentDir = join(agentsDir, name);
    if (existsSync(agentDir) && statSync(agentDir).isDirectory()) {
      return parseAgentDir(agentDir, 'global');
    }
  }

  return null;
}

/**
 * Get the agents directory for a specific AI coding agent
 */
export function getAgentsDirectory(
  rootDir: string,
  agentType: AgentType
): string {
  const paths = AGENT_DISCOVERY_PATHS[agentType];
  if (paths && paths.length > 0) {
    return join(rootDir, paths[0]);
  }
  return join(rootDir, 'agents');
}

/**
 * Check if an agent exists
 */
export function agentExists(
  name: string,
  searchDirs: string[]
): boolean {
  return findAgent(name, searchDirs) !== null;
}

/**
 * Get agent count statistics
 */
export function getAgentStats(searchDirs: string[]): {
  total: number;
  project: number;
  global: number;
  enabled: number;
  disabled: number;
} {
  const allAgents = findAllAgents(searchDirs);

  return {
    total: allAgents.length,
    project: allAgents.filter(a => a.location === 'project').length,
    global: allAgents.filter(a => a.location === 'global').length,
    enabled: allAgents.filter(a => a.enabled).length,
    disabled: allAgents.filter(a => !a.enabled).length,
  };
}

/**
 * Recursively discover all agents in a directory tree
 * This finds agents at any depth, useful for batch translation
 */
export function discoverAgentsRecursive(
  rootDir: string,
  location: AgentLocation = 'project'
): CustomAgent[] {
  const agents: CustomAgent[] = [];
  const seen = new Set<string>();

  if (!existsSync(rootDir)) {
    return agents;
  }

  function scanDirectory(dir: string): void {
    try {
      const entries = readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const entryPath = join(dir, entry.name);

        if (entry.isFile() && extname(entry.name) === '.md') {
          // Parse markdown file directly
          const agent = parseAgentFile(entryPath, location);
          if (agent && !seen.has(agent.name)) {
            seen.add(agent.name);
            agents.push(agent);
          }
        } else if (entry.isDirectory()) {
          // Skip hidden directories except standard agent paths
          if (entry.name.startsWith('.') && !entry.name.startsWith('.claude') &&
              !entry.name.startsWith('.cursor') && !entry.name.startsWith('.codex')) {
            continue;
          }

          // Try to parse as agent directory first
          const agent = parseAgentDir(entryPath, location);
          if (agent && !seen.has(agent.name)) {
            seen.add(agent.name);
            agents.push(agent);
          } else {
            // If not an agent directory, recurse into it
            scanDirectory(entryPath);
          }
        }
      }
    } catch {
      // Ignore errors (permission denied, etc.)
    }
  }

  scanDirectory(rootDir);
  return agents;
}

/**
 * Discover agents from a custom source path
 * Handles both file paths and directories
 */
export function discoverAgentsFromPath(
  sourcePath: string,
  recursive: boolean = false,
  location: AgentLocation = 'project'
): CustomAgent[] {
  if (!existsSync(sourcePath)) {
    return [];
  }

  const stats = statSync(sourcePath);

  // Single file
  if (stats.isFile()) {
    if (extname(sourcePath) === '.md') {
      const agent = parseAgentFile(sourcePath, location);
      return agent ? [agent] : [];
    }
    return [];
  }

  // Directory
  if (stats.isDirectory()) {
    if (recursive) {
      return discoverAgentsRecursive(sourcePath, location);
    }

    // Non-recursive: only check immediate directory
    // First try as agent directory
    const agent = parseAgentDir(sourcePath, location);
    if (agent) {
      return [agent];
    }

    // Otherwise scan directory contents (one level)
    const agents: CustomAgent[] = [];
    try {
      const entries = readdirSync(sourcePath, { withFileTypes: true });

      for (const entry of entries) {
        const entryPath = join(sourcePath, entry.name);

        if (entry.isFile() && extname(entry.name) === '.md') {
          const a = parseAgentFile(entryPath, location);
          if (a) agents.push(a);
        } else if (entry.isDirectory()) {
          const a = parseAgentDir(entryPath, location);
          if (a) agents.push(a);
        }
      }
    } catch {
      // Ignore errors
    }
    return agents;
  }

  return [];
}
