import { randomUUID } from 'node:crypto';
import {
  type ExecutionFlow,
  type ExecutionStep,
  type ExecutionFlowConfig,
  type StepDefinition,
  type ExecutionContext,
  type FlowSummary,
  type FlowMetrics,
  ExecutionFlowSchema,
} from './types.js';

const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_RETRY_DELAY = 1000;
const DEFAULT_TIMEOUT = 30000;

export class ExecutionManager {
  private flows: Map<string, ExecutionFlow> = new Map();
  private stepDefinitions: Map<string, Map<string, StepDefinition>> = new Map();
  private config: ExecutionFlowConfig;
  private metrics: FlowMetrics;

  constructor(config: ExecutionFlowConfig = {}) {
    this.config = config;
    this.metrics = {
      totalFlows: 0,
      completedFlows: 0,
      failedFlows: 0,
      averageDuration: 0,
      stepMetrics: new Map(),
    };
  }

  createFlow(
    skillName: string,
    steps: Array<{ name: string; description?: string }>,
    options: {
      mode?: 'standalone' | 'enhanced';
      mcpServers?: string[];
      context?: Record<string, unknown>;
    } = {}
  ): ExecutionFlow {
    const flowId = randomUUID();
    const executionSteps: ExecutionStep[] = steps.map((step, index) => ({
      id: `${flowId}-step-${index}`,
      name: step.name,
      description: step.description,
      status: 'pending',
      retryCount: 0,
    }));

    const flow: ExecutionFlow = ExecutionFlowSchema.parse({
      id: flowId,
      skillName,
      version: 1,
      steps: executionSteps,
      currentStepIndex: -1,
      status: 'pending',
      context: options.context,
      mode: options.mode || 'standalone',
      mcpServers: options.mcpServers,
    });

    this.flows.set(flowId, flow);
    this.metrics.totalFlows++;

    return flow;
  }

  registerStepDefinitions(skillName: string, definitions: StepDefinition[]): void {
    const skillSteps = new Map<string, StepDefinition>();
    for (const def of definitions) {
      skillSteps.set(def.name, def);
    }
    this.stepDefinitions.set(skillName, skillSteps);
  }

  async executeFlow(flowId: string): Promise<ExecutionFlow> {
    const flow = this.flows.get(flowId);
    if (!flow) {
      throw new Error(`Flow ${flowId} not found`);
    }

    flow.status = 'running';
    flow.startedAt = new Date().toISOString();

    const skillSteps = this.stepDefinitions.get(flow.skillName);

    try {
      let previousOutput: Record<string, unknown> = {};

      for (let i = 0; i < flow.steps.length; i++) {
        const step = flow.steps[i];
        flow.currentStepIndex = i;

        const context: ExecutionContext = {
          flow,
          stepIndex: i,
          previousOutput,
          mcpTools: flow.mcpServers,
          isEnhanced: flow.mode === 'enhanced',
        };

        const stepDef = skillSteps?.get(step.name);

        if (stepDef?.condition && !stepDef.condition(context)) {
          step.status = 'skipped';
          continue;
        }

        const result = await this.executeStep(step, stepDef, context);

        if (result.status === 'completed' && result.output) {
          previousOutput = { ...previousOutput, ...result.output };
        }

        if (result.status === 'failed') {
          flow.status = 'failed';
          flow.completedAt = new Date().toISOString();
          flow.totalDuration = this.calculateDuration(flow.startedAt, flow.completedAt);
          this.metrics.failedFlows++;
          this.config.onFlowComplete?.(flow);
          return flow;
        }
      }

      flow.status = 'completed';
      flow.completedAt = new Date().toISOString();
      flow.totalDuration = this.calculateDuration(flow.startedAt, flow.completedAt);
      this.metrics.completedFlows++;
      this.updateAverageDuration(flow.totalDuration);
      this.config.onFlowComplete?.(flow);

      return flow;
    } catch (error) {
      flow.status = 'failed';
      flow.completedAt = new Date().toISOString();
      flow.totalDuration = this.calculateDuration(flow.startedAt, flow.completedAt);
      this.metrics.failedFlows++;
      throw error;
    }
  }

  private async executeStep(
    step: ExecutionStep,
    stepDef: StepDefinition | undefined,
    context: ExecutionContext
  ): Promise<ExecutionStep> {
    const maxRetries = this.config.maxRetries ?? DEFAULT_MAX_RETRIES;
    const retryDelay = this.config.retryDelay ?? DEFAULT_RETRY_DELAY;
    const timeout = stepDef?.timeout ?? this.config.timeout ?? DEFAULT_TIMEOUT;

    step.status = 'running';
    step.startedAt = new Date().toISOString();
    this.config.onStepStart?.(step, context.flow);

    let lastError: Error | null = null;

    while (step.retryCount <= maxRetries) {
      let timeoutId: ReturnType<typeof setTimeout> | undefined;
      try {
        if (stepDef) {
          const timeoutPromise = new Promise<never>((_, reject) => {
            timeoutId = setTimeout(
              () => reject(new Error(`Step ${step.name} timed out`)),
              timeout
            );
          });

          const executePromise = stepDef.execute(step.input || {}, context);
          try {
            step.output = await Promise.race([executePromise, timeoutPromise]);
          } finally {
            if (timeoutId) clearTimeout(timeoutId);
          }
        }

        step.status = 'completed';
        step.completedAt = new Date().toISOString();
        step.duration = this.calculateDuration(step.startedAt, step.completedAt);
        this.config.onStepComplete?.(step, context.flow);
        this.updateStepMetrics(step.name, true, step.duration);

        return step;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        step.retryCount++;

        if (stepDef?.retryable !== false && step.retryCount <= maxRetries) {
          await this.delay(retryDelay * step.retryCount);
        } else {
          break;
        }
      }
    }

    step.status = 'failed';
    step.error = lastError?.message || 'Unknown error';
    step.completedAt = new Date().toISOString();
    step.duration = this.calculateDuration(step.startedAt, step.completedAt);
    this.config.onStepError?.(step, lastError || new Error('Unknown error'), context.flow);
    this.updateStepMetrics(step.name, false, step.duration);

    return step;
  }

  getFlow(flowId: string): ExecutionFlow | undefined {
    return this.flows.get(flowId);
  }

  getFlowSummary(flowId: string): FlowSummary | null {
    const flow = this.flows.get(flowId);
    if (!flow) return null;

    const completedSteps = flow.steps.filter(
      (s) => s.status === 'completed' || s.status === 'skipped'
    ).length;

    const currentStep =
      flow.currentStepIndex >= 0 ? flow.steps[flow.currentStepIndex]?.name : undefined;

    return {
      id: flow.id,
      skillName: flow.skillName,
      status: flow.status,
      progress: flow.steps.length > 0 ? (completedSteps / flow.steps.length) * 100 : 0,
      currentStep,
      startedAt: flow.startedAt,
      completedAt: flow.completedAt,
      totalDuration: flow.totalDuration,
      stepsCompleted: completedSteps,
      totalSteps: flow.steps.length,
      mode: flow.mode,
    };
  }

  getAllFlowSummaries(): FlowSummary[] {
    return [...this.flows.keys()]
      .map((id) => this.getFlowSummary(id))
      .filter((s): s is FlowSummary => s !== null);
  }

  getMetrics(): FlowMetrics {
    return { ...this.metrics };
  }

  cancelFlow(flowId: string): boolean {
    const flow = this.flows.get(flowId);
    if (!flow || flow.status !== 'running') return false;

    flow.status = 'failed';
    flow.completedAt = new Date().toISOString();

    const currentStep = flow.steps[flow.currentStepIndex];
    if (currentStep && currentStep.status === 'running') {
      currentStep.status = 'failed';
      currentStep.error = 'Cancelled';
      currentStep.completedAt = new Date().toISOString();
    }

    return true;
  }

  clearCompletedFlows(): number {
    let cleared = 0;
    for (const [id, flow] of this.flows) {
      if (flow.status === 'completed' || flow.status === 'failed') {
        this.flows.delete(id);
        cleared++;
      }
    }
    return cleared;
  }

  private calculateDuration(start?: string, end?: string): number {
    if (!start || !end) return 0;
    return new Date(end).getTime() - new Date(start).getTime();
  }

  private updateAverageDuration(duration: number): void {
    const completedCount = this.metrics.completedFlows;
    this.metrics.averageDuration =
      (this.metrics.averageDuration * (completedCount - 1) + duration) / completedCount;
  }

  private updateStepMetrics(stepName: string, success: boolean, duration: number): void {
    const existing = this.metrics.stepMetrics.get(stepName) || {
      executionCount: 0,
      successCount: 0,
      failureCount: 0,
      averageDuration: 0,
    };

    existing.executionCount++;
    if (success) {
      existing.successCount++;
    } else {
      existing.failureCount++;
    }
    existing.averageDuration =
      (existing.averageDuration * (existing.executionCount - 1) + duration) /
      existing.executionCount;

    this.metrics.stepMetrics.set(stepName, existing);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export function createExecutionManager(config?: ExecutionFlowConfig): ExecutionManager {
  return new ExecutionManager(config);
}
