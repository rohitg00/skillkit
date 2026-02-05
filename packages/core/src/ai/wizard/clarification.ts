import type { LLMProvider, WizardContext, ClarificationQuestion } from '../providers/types.js';

export interface ClarificationOptions {
  maxQuestions?: number;
  includeCodeExamples?: boolean;
  focusAreas?: string[];
}

export class ClarificationGenerator {
  private provider: LLMProvider;

  constructor(provider: LLMProvider) {
    this.provider = provider;
  }

  async generate(
    context: WizardContext,
    options: ClarificationOptions = {}
  ): Promise<ClarificationQuestion[]> {
    const { maxQuestions = 4 } = options;

    try {
      const questions = await this.provider.generateClarifications(context);

      const relevantQuestions = this.filterRelevantQuestions(questions, context);

      return relevantQuestions.slice(0, maxQuestions);
    } catch (error) {
      return this.getFallbackQuestions(context, maxQuestions);
    }
  }

  private filterRelevantQuestions(
    questions: ClarificationQuestion[],
    _context: WizardContext
  ): ClarificationQuestion[] {
    return questions.filter((q) => {
      if (!q.question || q.question.length < 10) return false;

      if (q.type === 'select' || q.type === 'multiselect') {
        if (!q.options || q.options.length < 2) return false;
      }

      return true;
    });
  }

  private getFallbackQuestions(context: WizardContext, maxQuestions: number): ClarificationQuestion[] {
    const questions: ClarificationQuestion[] = [];
    const expertise = context.expertise.toLowerCase();

    if (expertise.includes('test') || expertise.includes('testing')) {
      questions.push({
        id: 'test-framework',
        question: 'Which testing framework should this skill focus on?',
        type: 'select',
        options: ['vitest', 'jest', 'mocha', 'playwright', 'framework-agnostic'],
        context: 'Different frameworks have different best practices',
      });

      questions.push({
        id: 'test-coverage',
        question: 'What coverage threshold should be targeted?',
        type: 'select',
        options: ['80%', '90%', '100%', 'no specific threshold'],
        context: 'Coverage requirements affect testing strategies',
      });
    }

    if (expertise.includes('react') || expertise.includes('component')) {
      questions.push({
        id: 'react-patterns',
        question: 'Which React patterns should be emphasized?',
        type: 'multiselect',
        options: ['hooks', 'context', 'server components', 'suspense', 'error boundaries'],
        context: 'Focus areas for React development',
      });
    }

    if (expertise.includes('api') || expertise.includes('backend')) {
      questions.push({
        id: 'api-style',
        question: 'What API style should this skill target?',
        type: 'select',
        options: ['REST', 'GraphQL', 'tRPC', 'gRPC', 'any'],
        context: 'API styles have different patterns and tools',
      });
    }

    questions.push({
      id: 'use-cases',
      question: 'What specific use cases should this skill prioritize?',
      type: 'text',
      context: 'Helps narrow down the scope for more targeted instructions',
    });

    questions.push({
      id: 'edge-cases',
      question: 'Are there any edge cases or scenarios that should be specifically addressed?',
      type: 'text',
      context: 'Edge cases often need explicit handling',
    });

    questions.push({
      id: 'output-format',
      question: 'What output format do you prefer for examples?',
      type: 'select',
      options: ['code blocks with comments', 'step-by-step instructions', 'minimal examples', 'detailed explanations'],
      context: 'Affects how the skill presents information',
    });

    return questions.slice(0, maxQuestions);
  }

  async refineQuestions(
    questions: ClarificationQuestion[],
    answers: Record<string, string | string[] | boolean>,
    _context: WizardContext
  ): Promise<ClarificationQuestion[]> {
    const followUpQuestions: ClarificationQuestion[] = [];

    for (const [questionId, answer] of Object.entries(answers)) {
      const originalQuestion = questions.find((q) => q.id === questionId);
      if (!originalQuestion) continue;

      if (originalQuestion.type === 'text' && typeof answer === 'string' && answer.length > 50) {
        followUpQuestions.push({
          id: `${questionId}-clarify`,
          question: 'Can you be more specific about the most important aspect?',
          type: 'text',
          context: `Based on: "${answer.slice(0, 50)}..."`,
        });
      }

      if (originalQuestion.type === 'multiselect' && Array.isArray(answer) && answer.length > 3) {
        followUpQuestions.push({
          id: `${questionId}-priority`,
          question: 'Which of your selections is most important?',
          type: 'select',
          options: answer as string[],
          context: 'Helps prioritize when multiple options are selected',
        });
      }
    }

    return followUpQuestions.slice(0, 2);
  }
}

export function createQuestionFromPattern(
  id: string,
  pattern: 'framework' | 'coverage' | 'style' | 'scope',
  customOptions?: string[]
): ClarificationQuestion {
  const patterns: Record<string, Omit<ClarificationQuestion, 'id'>> = {
    framework: {
      question: 'Which framework or library should this skill focus on?',
      type: 'select',
      options: customOptions || ['react', 'vue', 'svelte', 'angular', 'framework-agnostic'],
      context: 'Different frameworks have different conventions',
    },
    coverage: {
      question: 'What level of detail should the skill provide?',
      type: 'select',
      options: customOptions || ['comprehensive', 'balanced', 'minimal'],
      context: 'Affects the depth of instructions',
    },
    style: {
      question: 'What coding style should the skill promote?',
      type: 'select',
      options: customOptions || ['functional', 'object-oriented', 'declarative', 'pragmatic'],
      context: 'Influences code patterns and examples',
    },
    scope: {
      question: 'What should be the scope of this skill?',
      type: 'select',
      options: customOptions || ['specific task', 'workflow', 'comprehensive guide'],
      context: 'Determines how broad or narrow the skill should be',
    },
  };

  return {
    id,
    ...patterns[pattern],
  } as ClarificationQuestion;
}
