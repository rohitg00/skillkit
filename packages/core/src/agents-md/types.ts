export interface AgentsMdConfig {
  projectPath: string;
  includeSkills?: boolean;
  includeBuildCommands?: boolean;
  includeCodeStyle?: boolean;
}

export interface AgentsMdSection {
  id: string;
  title: string;
  content: string;
  managed: boolean;
}

export interface AgentsMdResult {
  content: string;
  sections: AgentsMdSection[];
  path: string;
}
