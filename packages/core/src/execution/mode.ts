import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { ConnectorMapping } from '../connectors/types.js';
import { suggestMappingsFromMcp } from '../connectors/utils.js';

export type ExecutionMode = 'standalone' | 'enhanced';

export interface ModeDetectionResult {
  mode: ExecutionMode;
  availableServers: string[];
  missingServers: string[];
  capabilities: ModeCapabilities;
  connectorMappings: ConnectorMapping[];
}

export interface ModeCapabilities {
  canAccessCRM: boolean;
  canSendEmails: boolean;
  canAccessCalendar: boolean;
  canAccessDocs: boolean;
  canQueryData: boolean;
  canEnrichData: boolean;
  canSendNotifications: boolean;
  canUseAI: boolean;
  hasChat: boolean;
  hasStorage: boolean;
  hasSearch: boolean;
  hasAnalytics: boolean;
}

export interface ExecutionModeConfig {
  requiredServers?: string[];
  optionalServers?: string[];
  mcpConfigPaths?: string[];
  fallbackToStandalone?: boolean;
}

const DEFAULT_MCP_CONFIG_PATHS = [
  join(process.env.HOME || '~', '.mcp.json'),
  join(process.env.HOME || '~', '.config', 'claude', 'mcp.json'),
  '.mcp.json',
  'mcp.json',
];

const CAPABILITY_SERVERS: Record<keyof ModeCapabilities, string[]> = {
  canAccessCRM: ['salesforce', 'hubspot', 'pipedrive', 'zoho'],
  canSendEmails: ['gmail', 'outlook', 'sendgrid', 'mailgun', 'ses'],
  canAccessCalendar: ['google-calendar', 'outlook', 'calendly'],
  canAccessDocs: ['notion', 'confluence', 'google-docs', 'coda'],
  canQueryData: ['postgres', 'mysql', 'bigquery', 'snowflake', 'supabase', 'mongodb'],
  canEnrichData: ['clearbit', 'zoominfo', 'apollo', 'hunter'],
  canSendNotifications: ['slack', 'teams', 'discord', 'pagerduty', 'opsgenie'],
  canUseAI: ['openai', 'anthropic', 'ollama', 'huggingface'],
  hasChat: ['slack', 'teams', 'discord'],
  hasStorage: ['s3', 'gcs', 'dropbox', 'drive', 'box'],
  hasSearch: ['glean', 'elastic', 'algolia', 'typesense'],
  hasAnalytics: ['mixpanel', 'amplitude', 'posthog', 'segment'],
};

export function detectExecutionMode(config: ExecutionModeConfig = {}): ModeDetectionResult {
  const { requiredServers = [], optionalServers = [], mcpConfigPaths, fallbackToStandalone = true } = config;

  const configPaths = mcpConfigPaths || DEFAULT_MCP_CONFIG_PATHS;
  const availableServers = detectMcpServers(configPaths);

  const missingRequired = requiredServers.filter(
    (server) => !availableServers.some((s) => s.toLowerCase().includes(server.toLowerCase()))
  );

  const capabilities = detectCapabilities(availableServers);
  const connectorMappings = suggestMappingsFromMcp(availableServers);

  let mode: ExecutionMode = 'standalone';
  if (missingRequired.length === 0 && availableServers.length > 0) {
    mode = 'enhanced';
  } else if (missingRequired.length > 0 && !fallbackToStandalone) {
    throw new Error(`Missing required MCP servers: ${missingRequired.join(', ')}`);
  }

  const missingOptional = optionalServers.filter(
    (server) => !availableServers.some((s) => s.toLowerCase().includes(server.toLowerCase()))
  );

  return {
    mode,
    availableServers,
    missingServers: [...missingRequired, ...missingOptional],
    capabilities,
    connectorMappings,
  };
}

function detectMcpServers(configPaths: string[]): string[] {
  const servers: string[] = [];

  for (const configPath of configPaths) {
    try {
      const fullPath = configPath.startsWith('~')
        ? configPath.replace('~', process.env.HOME || '')
        : configPath;

      if (existsSync(fullPath)) {
        const content = readFileSync(fullPath, 'utf-8');
        const config = JSON.parse(content);

        if (config.mcpServers) {
          servers.push(...Object.keys(config.mcpServers));
        }

        if (config.servers) {
          servers.push(...Object.keys(config.servers));
        }
      }
    } catch {
      continue;
    }
  }

  return [...new Set(servers)];
}

function detectCapabilities(servers: string[]): ModeCapabilities {
  const serverLower = servers.map((s) => s.toLowerCase());

  const capabilities: ModeCapabilities = {
    canAccessCRM: false,
    canSendEmails: false,
    canAccessCalendar: false,
    canAccessDocs: false,
    canQueryData: false,
    canEnrichData: false,
    canSendNotifications: false,
    canUseAI: false,
    hasChat: false,
    hasStorage: false,
    hasSearch: false,
    hasAnalytics: false,
  };

  for (const [capability, keywords] of Object.entries(CAPABILITY_SERVERS)) {
    for (const keyword of keywords) {
      if (serverLower.some((server) => server.includes(keyword))) {
        capabilities[capability as keyof ModeCapabilities] = true;
        break;
      }
    }
  }

  return capabilities;
}

export function getModeDescription(result: ModeDetectionResult): string {
  const lines: string[] = [];

  lines.push(`Mode: ${result.mode.toUpperCase()}`);
  lines.push('');

  if (result.availableServers.length > 0) {
    lines.push(`Available MCP Servers (${result.availableServers.length}):`);
    for (const server of result.availableServers.slice(0, 10)) {
      lines.push(`  - ${server}`);
    }
    if (result.availableServers.length > 10) {
      lines.push(`  ... and ${result.availableServers.length - 10} more`);
    }
    lines.push('');
  }

  if (result.missingServers.length > 0) {
    lines.push(`Missing Servers:`);
    for (const server of result.missingServers) {
      lines.push(`  - ${server}`);
    }
    lines.push('');
  }

  lines.push('Capabilities:');
  const capabilityLabels: Record<keyof ModeCapabilities, string> = {
    canAccessCRM: 'CRM Access',
    canSendEmails: 'Email',
    canAccessCalendar: 'Calendar',
    canAccessDocs: 'Documents',
    canQueryData: 'Data Queries',
    canEnrichData: 'Data Enrichment',
    canSendNotifications: 'Notifications',
    canUseAI: 'AI Services',
    hasChat: 'Chat',
    hasStorage: 'Storage',
    hasSearch: 'Search',
    hasAnalytics: 'Analytics',
  };

  for (const [key, label] of Object.entries(capabilityLabels)) {
    const enabled = result.capabilities[key as keyof ModeCapabilities];
    lines.push(`  ${enabled ? '✓' : '✗'} ${label}`);
  }

  if (result.connectorMappings.length > 0) {
    lines.push('');
    lines.push('Suggested Connector Mappings:');
    for (const mapping of result.connectorMappings.slice(0, 5)) {
      lines.push(`  ${mapping.placeholder} → ${mapping.tool}`);
    }
  }

  return lines.join('\n');
}

export function requireEnhancedMode(result: ModeDetectionResult): void {
  if (result.mode !== 'enhanced') {
    throw new Error(
      `This skill requires enhanced mode with MCP servers. Missing: ${result.missingServers.join(', ')}`
    );
  }
}

export function requireCapability(
  result: ModeDetectionResult,
  capability: keyof ModeCapabilities
): void {
  if (!result.capabilities[capability]) {
    throw new Error(`This skill requires the ${capability} capability which is not available.`);
  }
}

export function getStandaloneAlternative(capability: keyof ModeCapabilities): string {
  const alternatives: Record<keyof ModeCapabilities, string> = {
    canAccessCRM: 'Use a local JSON file to store contact information',
    canSendEmails: 'Output email content to the terminal for manual sending',
    canAccessCalendar: 'Use a local iCal file for scheduling',
    canAccessDocs: 'Use local markdown files for documentation',
    canQueryData: 'Use a local SQLite database or JSON files',
    canEnrichData: 'Skip enrichment or use cached data',
    canSendNotifications: 'Output notifications to the terminal',
    canUseAI: 'Use simpler rule-based logic or skip AI features',
    hasChat: 'Output messages to the terminal',
    hasStorage: 'Use the local filesystem',
    hasSearch: 'Use grep or local file search',
    hasAnalytics: 'Skip analytics or use local logging',
  };

  return alternatives[capability];
}

export function createModeAwareExecutor<T>(
  enhancedFn: () => Promise<T>,
  standaloneFn: () => Promise<T>,
  modeResult: ModeDetectionResult
): () => Promise<T> {
  return async () => {
    if (modeResult.mode === 'enhanced') {
      return enhancedFn();
    }
    return standaloneFn();
  };
}
