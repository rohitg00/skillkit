import type { LLMProvider, ContextSourceConfig, ComposableSkill, ClarificationAnswer } from '../providers/types.js';
import type {
  WizardState,
  WizardStep,
  WizardOptions,
  WizardEvents,
  StepResult,
  GeneratedSkillPreview,
} from './types.js';
import { createInitialState, getPreviousStep, getStepNumber, getTotalSteps } from './types.js';
import { STEP_HANDLERS, type StepExecutionOptions } from './steps.js';
import { createProvider } from '../providers/factory.js';

export interface WizardConfig {
  provider?: LLMProvider;
  projectPath?: string;
  options?: WizardOptions;
  events?: WizardEvents;
}

export class SkillWizard {
  private state: WizardState;
  private provider: LLMProvider | undefined;
  private projectPath: string;
  private options: WizardOptions;
  private events: WizardEvents;

  constructor(config: WizardConfig = {}) {
    this.state = createInitialState();
    this.provider = config.provider;
    this.projectPath = config.projectPath || process.cwd();
    this.options = config.options || {};
    this.events = config.events || {};

    if (!this.provider && !this.options.provider) {
      this.provider = createProvider();
    } else if (this.options.provider) {
      this.provider = createProvider(
        this.options.provider as Parameters<typeof createProvider>[0],
        { model: this.options.model }
      );
    }
  }

  getState(): Readonly<WizardState> {
    return { ...this.state };
  }

  getCurrentStep(): WizardStep {
    return this.state.currentStep;
  }

  getProgress(): { current: number; total: number; percentage: number } {
    const current = getStepNumber(this.state.currentStep);
    const total = getTotalSteps();
    return {
      current,
      total,
      percentage: Math.round((current / total) * 100),
    };
  }

  async executeStep<T>(input: T): Promise<StepResult<unknown>> {
    const handler = STEP_HANDLERS[this.state.currentStep];

    if (!handler) {
      return { success: false, error: `Unknown step: ${this.state.currentStep}` };
    }

    const validationError = handler.validate(input, this.state);
    if (validationError) {
      this.emitError(validationError, true);
      return { success: false, error: validationError };
    }

    try {
      this.emitProgress(`Executing ${this.state.currentStep}...`);

      const executionOptions: StepExecutionOptions = {
        provider: this.provider,
        projectPath: this.projectPath,
        wizardOptions: this.options,
      };

      const result = await handler.execute(input, this.state, executionOptions);

      if (result.success && result.nextStep) {
        this.state.currentStep = result.nextStep;
        this.emitStepChange(result.nextStep);
      }

      if (this.state.currentStep === 'install' && result.success) {
        this.emitComplete();
      }

      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.emitError(message, false);
      return { success: false, error: message };
    }
  }

  async setExpertise(expertise: string): Promise<StepResult<unknown>> {
    return this.executeStep({ expertise });
  }

  async setContextSources(sources: ContextSourceConfig[]): Promise<StepResult<unknown>> {
    return this.executeStep({ sources });
  }

  async selectSkillsForComposition(
    skills: ComposableSkill[],
    searchQuery?: string
  ): Promise<StepResult<unknown>> {
    return this.executeStep({ selectedSkills: skills, searchQuery });
  }

  async answerClarifications(answers: ClarificationAnswer[]): Promise<StepResult<unknown>> {
    return this.executeStep({
      questions: this.state.generatedQuestions,
      answers,
    });
  }

  async generateSkill(): Promise<StepResult<unknown>> {
    return this.executeStep({ action: 'regenerate' });
  }

  async approveSkill(): Promise<StepResult<unknown>> {
    return this.executeStep({ action: 'approve' });
  }

  async installToAgents(agentIds: string[]): Promise<StepResult<unknown>> {
    return this.executeStep({ targetAgents: agentIds, results: [] });
  }

  goBack(): boolean {
    const previous = getPreviousStep(this.state.currentStep);
    if (previous) {
      this.state.currentStep = previous;
      this.emitStepChange(previous);
      return true;
    }
    return false;
  }

  canGoBack(): boolean {
    return getPreviousStep(this.state.currentStep) !== null;
  }

  reset(): void {
    this.state = createInitialState();
    this.emitStepChange('expertise');
  }

  getGeneratedSkill(): GeneratedSkillPreview | null {
    return this.state.generatedSkill;
  }

  setTargetAgents(agentIds: string[]): void {
    this.state.targetAgents = agentIds;
  }

  setMemoryPersonalization(enabled: boolean): void {
    this.state.memoryPersonalization = enabled;
  }

  updateSkillContent(content: string): void {
    if (this.state.generatedSkill) {
      this.state.generatedSkill.content = content;
      this.state.generatedSkill.estimatedTokens = Math.ceil(content.length / 4);
    }
  }

  private emitStepChange(step: WizardStep): void {
    if (this.events.onStepChange) {
      this.events.onStepChange(step, this.getState());
    }
  }

  private emitProgress(message: string, progress?: number): void {
    if (this.events.onProgress) {
      this.events.onProgress(message, progress);
    }
  }

  private emitError(message: string, recoverable: boolean): void {
    const error = {
      step: this.state.currentStep,
      message,
      recoverable,
    };

    this.state.errors.push(error);

    if (this.events.onError) {
      this.events.onError(error);
    }
  }

  private emitComplete(): void {
    if (this.events.onComplete) {
      this.events.onComplete(this.getState());
    }
  }
}

export { createInitialState, getStepOrder, getNextStep, getPreviousStep, getStepNumber, getTotalSteps } from './types.js';
export type {
  WizardState,
  WizardStep,
  WizardOptions,
  WizardEvents,
  StepResult,
  GeneratedSkillPreview,
  InstallResult,
  WizardError,
} from './types.js';
export { ClarificationGenerator, createQuestionFromPattern } from './clarification.js';
export { STEP_HANDLERS } from './steps.js';
