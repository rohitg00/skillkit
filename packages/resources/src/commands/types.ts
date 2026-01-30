export type CommandCategory = 'development' | 'testing' | 'planning' | 'review' | 'learning' | 'workflow';

export interface CommandTemplate {
  id: string;
  name: string;
  description: string;
  category: CommandCategory;
  trigger: string;
  agent?: string;
  prompt: string;
  examples?: string[];
}

export interface CommandManifest {
  version: number;
  commands: CommandTemplate[];
}
