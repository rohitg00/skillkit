import { z } from 'zod';

export const ExecutionStepStatusSchema = z.enum([
  'pending',
  'running',
  'completed',
  'failed',
  'skipped',
]);

export type ExecutionStepStatus = z.infer<typeof ExecutionStepStatusSchema>;

export const ExecutionStepSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  status: ExecutionStepStatusSchema.default('pending'),
  startedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  duration: z.number().optional(),
  input: z.record(z.unknown()).optional(),
  output: z.record(z.unknown()).optional(),
  error: z.string().optional(),
  retryCount: z.number().default(0),
  metadata: z.record(z.unknown()).optional(),
});

export type ExecutionStep = z.infer<typeof ExecutionStepSchema>;

export const ExecutionFlowSchema = z.object({
  id: z.string(),
  skillName: z.string(),
  version: z.number().default(1),
  steps: z.array(ExecutionStepSchema),
  currentStepIndex: z.number().default(-1),
  status: ExecutionStepStatusSchema.default('pending'),
  startedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  totalDuration: z.number().optional(),
  context: z.record(z.unknown()).optional(),
  mode: z.enum(['standalone', 'enhanced']).default('standalone'),
  mcpServers: z.array(z.string()).optional(),
});

export type ExecutionFlow = z.infer<typeof ExecutionFlowSchema>;

export interface ExecutionFlowConfig {
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
  onStepStart?: (step: ExecutionStep, flow: ExecutionFlow) => void;
  onStepComplete?: (step: ExecutionStep, flow: ExecutionFlow) => void;
  onStepError?: (step: ExecutionStep, error: Error, flow: ExecutionFlow) => void;
  onFlowComplete?: (flow: ExecutionFlow) => void;
}

export interface StepDefinition {
  name: string;
  description?: string;
  execute: (
    input: Record<string, unknown>,
    context: ExecutionContext
  ) => Promise<Record<string, unknown>>;
  rollback?: (context: ExecutionContext) => Promise<void>;
  condition?: (context: ExecutionContext) => boolean;
  retryable?: boolean;
  timeout?: number;
}

export interface ExecutionContext {
  flow: ExecutionFlow;
  stepIndex: number;
  previousOutput?: Record<string, unknown>;
  mcpTools?: string[];
  isEnhanced: boolean;
}

export interface FlowSummary {
  id: string;
  skillName: string;
  status: ExecutionStepStatus;
  progress: number;
  currentStep?: string;
  startedAt?: string;
  completedAt?: string;
  totalDuration?: number;
  stepsCompleted: number;
  totalSteps: number;
  mode: 'standalone' | 'enhanced';
}

export interface FlowMetrics {
  totalFlows: number;
  completedFlows: number;
  failedFlows: number;
  averageDuration: number;
  stepMetrics: Map<
    string,
    {
      executionCount: number;
      successCount: number;
      failureCount: number;
      averageDuration: number;
    }
  >;
}
