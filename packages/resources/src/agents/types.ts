export interface BundledAgent {
  id: string;
  name: string;
  description: string;
  category: AgentCategory;
  model?: 'opus' | 'sonnet' | 'haiku';
  permissionMode?: 'default' | 'full' | 'strict';
  tools?: string[];
  disallowedTools?: string[];
  tags: string[];
  version: string;
}

export type AgentCategory =
  | 'planning'
  | 'development'
  | 'testing'
  | 'review'
  | 'documentation'
  | 'security'
  | 'refactoring';

export interface AgentManifest {
  version: number;
  agents: BundledAgent[];
}

export interface AgentInstallOptions {
  global?: boolean;
  force?: boolean;
  targetDir?: string;
}

export interface AgentInstallResult {
  success: boolean;
  agentId: string;
  path: string;
  message: string;
}
