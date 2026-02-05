import type {
  WizardState,
  WizardStep,
  StepResult,
  ExpertiseStepData,
  ContextSourcesStepData,
  CompositionStepData,
  ClarificationStepData,
  ReviewStepData,
  InstallStepData,
  WizardOptions,
} from './types.js';
import type { LLMProvider, ContextSourceConfig } from '../providers/types.js';
import { ContextEngine } from '../context/index.js';
import { SkillComposer } from '../composition/index.js';
import { ClarificationGenerator } from './clarification.js';
import { TrustScorer } from '../security/trust-score.js';
import { CompatibilityScorer } from '../agents/compatibility.js';
import { AgentOptimizer } from '../agents/optimizer.js';
import { MemorySource } from '../context/memory-source.js';

export interface StepHandler<TInput, TOutput> {
  validate(input: TInput, state: WizardState): string | null;
  execute(input: TInput, state: WizardState, options: StepExecutionOptions): Promise<StepResult<TOutput>>;
}

export interface StepExecutionOptions {
  provider?: LLMProvider;
  projectPath: string;
  wizardOptions: WizardOptions;
}

export const ExpertiseStep: StepHandler<ExpertiseStepData, void> = {
  validate(input: ExpertiseStepData): string | null {
    if (!input.expertise || input.expertise.trim().length < 10) {
      return 'Please provide a more detailed description (at least 10 characters)';
    }
    if (input.expertise.length > 2000) {
      return 'Description is too long (max 2000 characters)';
    }
    return null;
  },

  async execute(input: ExpertiseStepData, state: WizardState): Promise<StepResult<void>> {
    state.expertise = input.expertise.trim();
    return { success: true, nextStep: 'context-sources' };
  },
};

export const ContextSourcesStep: StepHandler<{ sources: ContextSourceConfig[] }, ContextSourcesStepData> = {
  validate(input: { sources: ContextSourceConfig[] }): string | null {
    const enabled = input.sources.filter((s) => s.enabled);
    if (enabled.length === 0) {
      return 'Please select at least one context source';
    }
    return null;
  },

  async execute(
    input: { sources: ContextSourceConfig[] },
    state: WizardState,
    options: StepExecutionOptions
  ): Promise<StepResult<ContextSourcesStepData>> {
    state.contextSources = input.sources;

    const contextEngine = new ContextEngine({ projectPath: options.projectPath });
    const aggregated = await contextEngine.gather(state.expertise, input.sources);

    state.gatheredContext = aggregated.chunks;

    const memorySource = new MemorySource(options.projectPath);
    const keywords = state.expertise.toLowerCase().split(/\s+/);
    const memoryPatterns = await memorySource.getMemoryPatterns(keywords);

    return {
      success: true,
      data: {
        sources: input.sources,
        gatheredContext: aggregated.chunks,
        memoryPatterns,
      },
      nextStep: 'composition',
    };
  },
};

export const CompositionStep: StepHandler<CompositionStepData, CompositionStepData> = {
  validate(): string | null {
    return null;
  },

  async execute(
    input: CompositionStepData,
    state: WizardState,
    options: StepExecutionOptions
  ): Promise<StepResult<CompositionStepData>> {
    if (options.wizardOptions.skipComposition) {
      return { success: true, data: { selectedSkills: [] }, nextStep: 'clarification' };
    }

    if (input.searchQuery) {
      const composer = new SkillComposer(options.provider);
      const foundSkills = await composer.findComposable(input.searchQuery, 10);

      return {
        success: true,
        data: {
          selectedSkills: foundSkills,
          searchQuery: input.searchQuery,
        },
      };
    }

    state.composableSkills = input.selectedSkills;

    return {
      success: true,
      data: {
        selectedSkills: input.selectedSkills,
      },
      nextStep: 'clarification',
    };
  },
};

export const ClarificationStep: StepHandler<ClarificationStepData, ClarificationStepData> = {
  validate(input: ClarificationStepData): string | null {
    for (const question of input.questions) {
      const answer = input.answers.find((a) => a.questionId === question.id);
      if (!answer && question.type !== 'text') {
        return `Please answer question: ${question.question}`;
      }
    }
    return null;
  },

  async execute(
    input: ClarificationStepData,
    state: WizardState,
    options: StepExecutionOptions
  ): Promise<StepResult<ClarificationStepData>> {
    if (options.wizardOptions.skipClarification) {
      return { success: true, data: { questions: [], answers: [] }, nextStep: 'review' };
    }

    if (input.questions.length === 0 && options.provider) {
      const generator = new ClarificationGenerator(options.provider);
      const questions = await generator.generate({
        expertise: state.expertise,
        contextSources: state.contextSources,
        composableSkills: state.composableSkills,
        clarifications: [],
        targetAgents: state.targetAgents,
        memoryPersonalization: state.memoryPersonalization,
        gatheredContext: state.gatheredContext,
      });

      state.generatedQuestions = questions;

      return {
        success: true,
        data: { questions, answers: [] },
      };
    }

    state.clarifications = input.answers;

    return {
      success: true,
      data: input,
      nextStep: 'review',
    };
  },
};

export const ReviewStep: StepHandler<{ action?: 'approve' | 'edit' | 'regenerate' }, ReviewStepData> = {
  validate(): string | null {
    return null;
  },

  async execute(
    input: { action?: 'approve' | 'edit' | 'regenerate' },
    state: WizardState,
    options: StepExecutionOptions
  ): Promise<StepResult<ReviewStepData>> {
    if (!state.generatedSkill || input.action === 'regenerate') {
      if (!options.provider) {
        return { success: false, error: 'No AI provider configured' };
      }

      const memorySource = new MemorySource(options.projectPath);
      const keywords = state.expertise.toLowerCase().split(/\s+/);
      const memoryPatterns = await memorySource.getMemoryPatterns(keywords);

      const result = await options.provider.generateSkill({
        expertise: state.expertise,
        contextChunks: state.gatheredContext,
        clarifications: state.clarifications,
        targetAgents: state.targetAgents,
        composedFrom: state.composableSkills.map((s) => s.name),
        memoryPatterns,
      });

      state.generatedSkill = {
        name: result.name,
        description: result.description,
        content: result.content,
        tags: result.tags,
        confidence: result.confidence,
        composedFrom: result.composedFrom || [],
        estimatedTokens: Math.ceil(result.content.length / 4),
      };
    }

    const trustScorer = new TrustScorer();
    state.trustScore = trustScorer.score(state.generatedSkill.content);

    const compatScorer = new CompatibilityScorer();
    state.compatibilityMatrix = compatScorer.generateMatrix(
      state.generatedSkill.content,
      state.targetAgents.length > 0 ? state.targetAgents : undefined
    );

    if (input.action === 'approve') {
      return {
        success: true,
        data: {
          skill: state.generatedSkill,
          trustScore: state.trustScore,
          compatibility: state.compatibilityMatrix,
          action: 'approve',
        },
        nextStep: 'install',
      };
    }

    return {
      success: true,
      data: {
        skill: state.generatedSkill,
        trustScore: state.trustScore,
        compatibility: state.compatibilityMatrix,
        action: input.action || 'approve',
      },
    };
  },
};

export const InstallStep: StepHandler<InstallStepData, InstallStepData> = {
  validate(input: InstallStepData): string | null {
    if (input.targetAgents.length === 0) {
      return 'Please select at least one target agent';
    }
    return null;
  },

  async execute(
    input: InstallStepData,
    state: WizardState,
    options: StepExecutionOptions
  ): Promise<StepResult<InstallStepData>> {
    if (!state.generatedSkill) {
      return { success: false, error: 'No skill generated' };
    }

    state.targetAgents = input.targetAgents;

    const optimizer = new AgentOptimizer(options.provider);
    const results = await optimizer.optimizeForMultipleAgents(
      state.generatedSkill.content,
      input.targetAgents
    );

    const installResults: InstallStepData['results'] = [];

    for (const [agentId, optimized] of results) {
      installResults.push({
        agentId,
        success: true,
        path: `~/.${agentId}/skills/${state.generatedSkill.name}/`,
        optimized: optimized.changes.length > 0,
        changes: optimized.changes,
      });
    }

    state.installResults = installResults;

    return {
      success: true,
      data: {
        targetAgents: input.targetAgents,
        results: installResults,
      },
    };
  },
};

export const STEP_HANDLERS: Record<WizardStep, StepHandler<unknown, unknown>> = {
  expertise: ExpertiseStep as StepHandler<unknown, unknown>,
  'context-sources': ContextSourcesStep as StepHandler<unknown, unknown>,
  composition: CompositionStep as StepHandler<unknown, unknown>,
  clarification: ClarificationStep as StepHandler<unknown, unknown>,
  review: ReviewStep as StepHandler<unknown, unknown>,
  install: InstallStep as StepHandler<unknown, unknown>,
};
