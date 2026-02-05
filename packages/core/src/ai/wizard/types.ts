import type {
  ContextSourceConfig,
  ComposableSkill,
  ClarificationQuestion,
  ClarificationAnswer,
  ContextChunk,
  MemoryPattern,
} from '../providers/types.js';
import type { TrustScore } from '../security/trust-score.js';
import type { CompatibilityMatrix } from '../agents/compatibility.js';

export type WizardStep =
  | 'expertise'
  | 'context-sources'
  | 'composition'
  | 'clarification'
  | 'review'
  | 'install';

export interface WizardState {
  currentStep: WizardStep;
  expertise: string;
  contextSources: ContextSourceConfig[];
  composableSkills: ComposableSkill[];
  clarifications: ClarificationAnswer[];
  targetAgents: string[];
  memoryPersonalization: boolean;
  gatheredContext: ContextChunk[];
  generatedQuestions: ClarificationQuestion[];
  generatedSkill: GeneratedSkillPreview | null;
  trustScore: TrustScore | null;
  compatibilityMatrix: CompatibilityMatrix | null;
  installResults: InstallResult[];
  errors: WizardError[];
}

export interface GeneratedSkillPreview {
  name: string;
  description: string;
  content: string;
  tags: string[];
  confidence: number;
  composedFrom: string[];
  estimatedTokens: number;
}

export interface InstallResult {
  agentId: string;
  success: boolean;
  path: string;
  optimized: boolean;
  changes: string[];
  error?: string;
}

export interface WizardError {
  step: WizardStep;
  message: string;
  recoverable: boolean;
}

export interface WizardOptions {
  projectPath?: string;
  provider?: string;
  model?: string;
  skipClarification?: boolean;
  skipComposition?: boolean;
  autoInstall?: boolean;
}

export interface StepResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  nextStep?: WizardStep;
}

export interface ExpertiseStepData {
  expertise: string;
}

export interface ContextSourcesStepData {
  sources: ContextSourceConfig[];
  gatheredContext: ContextChunk[];
  memoryPatterns: MemoryPattern[];
}

export interface CompositionStepData {
  selectedSkills: ComposableSkill[];
  searchQuery?: string;
}

export interface ClarificationStepData {
  questions: ClarificationQuestion[];
  answers: ClarificationAnswer[];
}

export interface ReviewStepData {
  skill: GeneratedSkillPreview;
  trustScore: TrustScore;
  compatibility: CompatibilityMatrix;
  action: 'approve' | 'edit' | 'regenerate';
}

export interface InstallStepData {
  targetAgents: string[];
  results: InstallResult[];
}

export interface WizardEvents {
  onStepChange?: (step: WizardStep, state: WizardState) => void;
  onProgress?: (message: string, progress?: number) => void;
  onError?: (error: WizardError) => void;
  onComplete?: (state: WizardState) => void;
}

export function createInitialState(): WizardState {
  return {
    currentStep: 'expertise',
    expertise: '',
    contextSources: [
      { name: 'docs', enabled: true, weight: 1.0 },
      { name: 'codebase', enabled: true, weight: 0.9 },
      { name: 'skills', enabled: true, weight: 0.8 },
      { name: 'memory', enabled: true, weight: 0.7 },
    ],
    composableSkills: [],
    clarifications: [],
    targetAgents: [],
    memoryPersonalization: true,
    gatheredContext: [],
    generatedQuestions: [],
    generatedSkill: null,
    trustScore: null,
    compatibilityMatrix: null,
    installResults: [],
    errors: [],
  };
}

export function getStepOrder(): WizardStep[] {
  return ['expertise', 'context-sources', 'composition', 'clarification', 'review', 'install'];
}

export function getNextStep(current: WizardStep): WizardStep | null {
  const order = getStepOrder();
  const index = order.indexOf(current);

  if (index === -1 || index === order.length - 1) {
    return null;
  }

  return order[index + 1];
}

export function getPreviousStep(current: WizardStep): WizardStep | null {
  const order = getStepOrder();
  const index = order.indexOf(current);

  if (index <= 0) {
    return null;
  }

  return order[index - 1];
}

export function getStepNumber(step: WizardStep): number {
  const order = getStepOrder();
  return order.indexOf(step) + 1;
}

export function getTotalSteps(): number {
  return getStepOrder().length;
}
