export interface PlanListItem {
  name: string;
  path: string;
  tasks: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  lastModified?: string;
}

export interface StructuredPlan {
  title: string;
  description?: string;
  tasks: PlanTask[];
}

export interface PlanTask {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
}

export interface PlanValidationIssue {
  message: string;
  type?: 'error' | 'warning';
}

export interface PlanValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  issues?: PlanValidationIssue[];
}

export interface PlanExecutionResult {
  success: boolean;
  completedTasks: string[];
  failedTasks: string[];
  totalTasks: number;
  errors: string[];
}

export type PlanEvent = string;

export interface PlanServiceState {
  plans: PlanListItem[];
  current: StructuredPlan | null;
  validation: PlanValidationResult | null;
  execution: PlanExecutionResult | null;
  loading: boolean;
  error: string | null;
}

export async function loadPlansList(_projectPath?: string): Promise<PlanServiceState> {
  return {
    plans: [],
    current: null,
    validation: null,
    execution: null,
    loading: false,
    error: null,
  };
}

export async function loadPlan(_planPath: string): Promise<StructuredPlan | null> {
  return null;
}

export async function validatePlan(_plan: StructuredPlan): Promise<PlanValidationResult> {
  return { valid: true, errors: [], warnings: [], issues: [] };
}

export async function executePlan(
  _plan: StructuredPlan,
  _projectPath?: string,
  _onEvent?: (event: PlanEvent) => void,
  _dryRun?: boolean
): Promise<PlanExecutionResult | null> {
  return { success: true, completedTasks: [], failedTasks: [], totalTasks: 0, errors: [] };
}

export async function executePlanDryRun(
  plan: StructuredPlan,
  projectPath?: string,
  onEvent?: (event: PlanEvent) => void
): Promise<PlanExecutionResult | null> {
  return executePlan(plan, projectPath, onEvent, true);
}

export async function parsePlanFromContent(_content: string): Promise<StructuredPlan | null> {
  return null;
}

export const planService = {
  loadPlansList,
  loadPlan,
  validatePlan,
  executePlan,
  executePlanDryRun,
  parsePlanFromContent,
};
