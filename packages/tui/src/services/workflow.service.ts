export interface WorkflowListItem {
  name: string;
  description: string;
  skills: number;
  waves: number;
  lastRun?: string;
  status: 'ready' | 'running' | 'completed' | 'failed';
}

export interface Workflow {
  name: string;
  description?: string;
  waves: WorkflowWave[];
  metadata?: {
    lastRun?: string;
  };
}

export interface WorkflowWave {
  name: string;
  skills: string[];
  parallel?: boolean;
}

export interface WorkflowResult {
  success: boolean;
  completedWaves: number;
  totalWaves: number;
  errors: string[];
}

export interface WorkflowProgress {
  currentWave: number;
  totalWaves: number;
  currentSkill?: string;
  totalSkills?: number;
  completedSkills?: number;
  status: 'running' | 'completed' | 'failed';
}

export interface WorkflowServiceState {
  workflows: WorkflowListItem[];
  current: Workflow | null;
  progress: WorkflowProgress | null;
  loading: boolean;
  error: string | null;
}

export async function loadWorkflowsList(_projectPath?: string): Promise<WorkflowServiceState> {
  return {
    workflows: [],
    current: null,
    progress: null,
    loading: false,
    error: null,
  };
}

export async function loadWorkflow(_name: string, _projectPath?: string): Promise<Workflow | null> {
  return null;
}

export async function executeWorkflow(
  _name: string,
  _projectPath?: string,
  _onProgress?: (progress: WorkflowProgress) => void
): Promise<WorkflowResult | null> {
  return { success: true, completedWaves: 0, totalWaves: 0, errors: [] };
}

export async function createNewWorkflow(
  _name: string,
  _description: string,
  _projectPath?: string
): Promise<boolean> {
  return true;
}

export async function validateWorkflowByName(
  _name: string,
  _projectPath?: string
): Promise<{ valid: boolean; errors: string[] }> {
  return { valid: true, errors: [] };
}

export const workflowService = {
  loadWorkflowsList,
  loadWorkflow,
  executeWorkflow,
  createNewWorkflow,
  validateWorkflowByName,
};
