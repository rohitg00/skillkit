import { Command, Option } from 'clipanion';
import { resolve } from 'node:path';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import * as prompts from '../onboarding/prompts.js';
import { colors, symbols, formatAgent, progressBar } from '../onboarding/theme.js';
import {
  SkillWizard,
  type WizardStep,
  detectProviders,
  getProviderModels,
  SkillComposer,
  type ProviderName,
  type ContextSourceConfig,
  type ClarificationAnswer,
} from '@skillkit/core';

export class GenerateCommand extends Command {
  static override paths = [['generate'], ['gen']];

  static override usage = Command.Usage({
    description: 'Smart AI-powered skill generation wizard',
    details: `
      Generate skills using AI with multi-source context gathering:

      - Documentation (Context7)
      - Local codebase patterns
      - Marketplace skills (15,000+)
      - Memory observations and learnings

      Supports multiple LLM providers: Claude, GPT-4, Gemini, Ollama, OpenRouter
    `,
    examples: [
      ['Interactive wizard', '$0 generate'],
      ['Use specific provider', '$0 generate --provider openai'],
      ['Compose from existing skills', '$0 generate --compose "testing patterns for vitest"'],
      ['Target specific agents', '$0 generate --agents claude-code,cursor'],
      ['Skip memory context', '$0 generate --no-memory'],
    ],
  });

  provider = Option.String('--provider,-p', {
    description: 'LLM provider: anthropic, openai, google, ollama, openrouter',
  });

  model = Option.String('--model,-m', {
    description: 'Specific model to use (e.g., gpt-4o, gemini-2.0-flash)',
  });

  compose = Option.String('--compose,-c', {
    description: 'Natural language search to find skills to compose',
  });

  agents = Option.String('--agents,-a', {
    description: 'Target agents (comma-separated)',
  });

  noMemory = Option.Boolean('--no-memory', false, {
    description: 'Skip memory context',
  });

  contextSources = Option.String('--context-sources', {
    description: 'Context sources (comma-separated): docs,codebase,skills,memory',
  });

  output = Option.String('--output,-o', {
    description: 'Output directory for generated skill',
  });

  json = Option.Boolean('--json,-j', false, {
    description: 'Output in JSON format',
  });

  async execute(): Promise<number> {
    if (this.json) {
      return this.executeNonInteractive();
    }

    prompts.intro('SkillKit Smart Generate');

    const providerResult = await this.selectProvider();
    if (prompts.isCancel(providerResult)) {
      prompts.cancel('Operation cancelled');
      return 1;
    }

    const wizard = new SkillWizard({
      projectPath: process.cwd(),
      options: {
        provider: providerResult.name as ProviderName,
        model: providerResult.model,
      },
      events: {
        onProgress: (message) => prompts.log(colors.muted(message)),
      },
    });

    const expertiseResult = await this.stepExpertise(wizard);
    if (!expertiseResult) return 1;

    const sourcesResult = await this.stepContextSources(wizard);
    if (!sourcesResult) return 1;

    const compositionResult = await this.stepComposition(wizard);
    if (!compositionResult) return 1;

    const clarificationResult = await this.stepClarification(wizard);
    if (!clarificationResult) return 1;

    const reviewResult = await this.stepReview(wizard);
    if (!reviewResult) return 1;

    const installResult = await this.stepInstall(wizard);
    if (!installResult) return 1;

    prompts.outro('Skill generated and installed successfully!');
    return 0;
  }

  private async executeNonInteractive(): Promise<number> {
    console.error('Non-interactive mode requires --expertise flag (not implemented yet)');
    return 1;
  }

  private async selectProvider(): Promise<{ name: string; model: string } | symbol> {
    if (this.provider) {
      return {
        name: this.provider,
        model: this.model || '',
      };
    }

    const detected = detectProviders();
    const configured = detected.filter((p) => p.configured && p.provider !== 'mock');

    if (configured.length === 0) {
      prompts.warn('No LLM provider configured');
      prompts.note(
        `Set one of these environment variables:
  ANTHROPIC_API_KEY - Claude (Anthropic)
  OPENAI_API_KEY - GPT-4 (OpenAI)
  GOOGLE_AI_KEY - Gemini (Google)
  OPENROUTER_API_KEY - OpenRouter (100+ models)

Or use Ollama for local models (no API key needed)`,
        'Provider Setup'
      );
    }

    const options = configured.map((p) => ({
      value: p.provider,
      label: p.displayName,
      hint: p.envVar ? `via ${p.envVar}` : undefined,
    }));

    if (options.length === 0) {
      options.push({
        value: 'ollama',
        label: 'Ollama (Local)',
        hint: 'No API key needed',
      });
    }

    const selected = await prompts.select({
      message: 'Select LLM provider',
      options: options as Array<{ value: string; label: string; hint?: string }>,
    });

    if (prompts.isCancel(selected)) {
      return selected;
    }

    const models = getProviderModels(selected as ProviderName);
    if (models.length > 1 && !this.model) {
      const modelOptions = models.map((m) => ({
        value: m,
        label: m,
      }));

      const selectedModel = await prompts.select({
        message: 'Select model',
        options: modelOptions as Array<{ value: string; label: string; hint?: string }>,
        initialValue: models[0],
      });

      if (prompts.isCancel(selectedModel)) {
        return selectedModel;
      }

      return { name: selected as string, model: selectedModel as string };
    }

    return { name: selected as string, model: this.model || models[0] || '' };
  }

  private async stepExpertise(wizard: SkillWizard): Promise<boolean> {
    this.showStepHeader('expertise', 'Describe Your Expertise');

    const expertise = await prompts.text({
      message: 'What should this skill help with?',
      placeholder: 'e.g., Write comprehensive unit tests using vitest',
      validate: (value) => {
        if (value.length < 10) {
          return 'Please provide more detail (at least 10 characters)';
        }
        return undefined;
      },
    });

    if (prompts.isCancel(expertise)) {
      prompts.cancel('Operation cancelled');
      return false;
    }

    const result = await wizard.setExpertise(expertise as string);
    if (!result.success) {
      prompts.error(result.error || 'Failed to set expertise');
      return false;
    }

    return true;
  }

  private async stepContextSources(wizard: SkillWizard): Promise<boolean> {
    this.showStepHeader('context-sources', 'Context Sources');

    if (this.contextSources) {
      const sourceNames = this.contextSources.split(',').map((s) => s.trim());
      const sources: ContextSourceConfig[] = [
        { name: 'docs', enabled: sourceNames.includes('docs'), weight: 1.0 },
        { name: 'codebase', enabled: sourceNames.includes('codebase'), weight: 0.9 },
        { name: 'skills', enabled: sourceNames.includes('skills'), weight: 0.8 },
        { name: 'memory', enabled: sourceNames.includes('memory') && !this.noMemory, weight: 0.7 },
      ];

      const result = await wizard.setContextSources(sources);
      if (!result.success) {
        prompts.error(result.error || 'Failed to gather context');
        return false;
      }
      return true;
    }

    const sourceOptions = [
      { value: 'docs', label: 'Documentation (Context7)', hint: 'Library docs & guides' },
      { value: 'codebase', label: 'Codebase (local)', hint: 'Project patterns & configs' },
      { value: 'skills', label: 'Marketplace Skills', hint: '15,000+ skills' },
      { value: 'memory', label: 'Memory & Learnings', hint: 'Your corrections & patterns' },
    ];

    const selectedSources = await prompts.groupMultiselect({
      message: 'Select context sources',
      options: {
        'Context Sources': sourceOptions,
      },
      required: true,
    });

    if (prompts.isCancel(selectedSources)) {
      prompts.cancel('Operation cancelled');
      return false;
    }

    const sources: ContextSourceConfig[] = [
      { name: 'docs', enabled: (selectedSources as string[]).includes('docs'), weight: 1.0 },
      { name: 'codebase', enabled: (selectedSources as string[]).includes('codebase'), weight: 0.9 },
      { name: 'skills', enabled: (selectedSources as string[]).includes('skills'), weight: 0.8 },
      { name: 'memory', enabled: (selectedSources as string[]).includes('memory') && !this.noMemory, weight: 0.7 },
    ];

    const spinner = prompts.spinner();
    spinner.start('Gathering context...');

    const result = await wizard.setContextSources(sources);

    if (!result.success) {
      spinner.stop('Context gathering failed');
      prompts.error(result.error || 'Failed to gather context');
      return false;
    }

    const state = wizard.getState();
    spinner.stop(`Gathered ${state.gatheredContext.length} context chunks`);

    const sourceSummary = sources
      .filter((s) => s.enabled)
      .map((s) => {
        const chunks = state.gatheredContext.filter((c) => c.source === s.name);
        return `  ${colors.success(symbols.success)} ${s.name}: ${chunks.length} chunks`;
      })
      .join('\n');

    prompts.note(sourceSummary, 'Context Summary');

    return true;
  }

  private async stepComposition(wizard: SkillWizard): Promise<boolean> {
    this.showStepHeader('composition', 'Compose from Skills (optional)');

    const searchQuery = this.compose;

    if (!searchQuery) {
      const wantCompose = await prompts.confirm({
        message: 'Search marketplace skills to compose from?',
        initialValue: false,
      });

      if (prompts.isCancel(wantCompose)) {
        prompts.cancel('Operation cancelled');
        return false;
      }

      if (!wantCompose) {
        await wizard.selectSkillsForComposition([]);
        return true;
      }
    }

    const query = searchQuery || await prompts.text({
      message: 'Search for skills to compose',
      placeholder: 'e.g., testing patterns for vitest',
    });

    if (prompts.isCancel(query)) {
      prompts.cancel('Operation cancelled');
      return false;
    }

    const spinner = prompts.spinner();
    spinner.start('Searching marketplace...');

    const composer = new SkillComposer();
    const foundSkills = await composer.findComposable(query as string, 10);

    spinner.stop(`Found ${foundSkills.length} relevant skills`);

    if (foundSkills.length === 0) {
      prompts.warn('No matching skills found');
      await wizard.selectSkillsForComposition([]);
      return true;
    }

    const skillOptions = foundSkills.map((skill) => ({
      name: skill.name,
      description: skill.description,
      score: Math.round(skill.trustScore * 10),
      source: skill.source,
    }));

    const selectedSkills = await prompts.skillMultiselect({
      message: 'Select skills to compose from',
      skills: skillOptions,
      required: false,
    });

    if (prompts.isCancel(selectedSkills)) {
      prompts.cancel('Operation cancelled');
      return false;
    }

    const selected = foundSkills.filter((s) => (selectedSkills as string[]).includes(s.name));
    await wizard.selectSkillsForComposition(selected);

    return true;
  }

  private async stepClarification(wizard: SkillWizard): Promise<boolean> {
    this.showStepHeader('clarification', 'Clarification Questions');

    const result = await wizard.answerClarifications([]);

    if (!result.success) {
      prompts.error(result.error || 'Failed to generate questions');
      return false;
    }

    const state = wizard.getState();
    const questions = state.generatedQuestions;

    if (questions.length === 0) {
      prompts.log(colors.muted('No clarification questions needed'));
      return true;
    }

    const answers: ClarificationAnswer[] = [];

    for (const question of questions) {
      let answer: string | string[] | boolean | symbol;

      if (question.type === 'select' && question.options) {
        answer = await prompts.select({
          message: question.question,
          options: question.options.map((opt) => ({
            value: opt,
            label: opt,
          })),
        });
      } else if (question.type === 'multiselect' && question.options) {
        answer = await prompts.groupMultiselect({
          message: question.question,
          options: {
            Options: question.options.map((opt) => ({
              value: opt,
              label: opt,
            })),
          },
        });
      } else if (question.type === 'confirm') {
        answer = await prompts.confirm({
          message: question.question,
        });
      } else {
        answer = await prompts.text({
          message: question.question,
          placeholder: question.context,
        });
      }

      if (prompts.isCancel(answer)) {
        prompts.cancel('Operation cancelled');
        return false;
      }

      answers.push({
        questionId: question.id,
        answer: answer as string | string[] | boolean,
      });
    }

    const finalResult = await wizard.answerClarifications(answers);
    return finalResult.success;
  }

  private async stepReview(wizard: SkillWizard): Promise<boolean> {
    this.showStepHeader('review', 'Review Generated Skill');

    const spinner = prompts.spinner();
    spinner.start('Generating skill...');

    const result = await wizard.generateSkill();

    if (!result.success) {
      spinner.stop('Generation failed');
      prompts.error(result.error || 'Failed to generate skill');
      return false;
    }

    spinner.stop('Skill generated');

    const state = wizard.getState();
    const skill = state.generatedSkill!;
    const trustScore = state.trustScore!;
    const compatibility = state.compatibilityMatrix!;

    prompts.note(
      `Name: ${colors.bold(skill.name)}
Description: ${skill.description}
Tags: ${skill.tags.join(', ')}
Confidence: ${Math.round(skill.confidence * 100)}%
Tokens: ~${skill.estimatedTokens}`,
      'Generated Skill'
    );

    const trustBar = progressBar(trustScore.score, 10, 10);
    const trustColor = getTrustGradeColor(trustScore.grade);

    prompts.note(
      `Score: ${trustColor(`${trustScore.score.toFixed(1)}/10`)} ${colors.dim(trustBar)}
Grade: ${trustColor(trustScore.grade.toUpperCase())}
${trustScore.warnings.length > 0 ? `\nWarnings:\n${trustScore.warnings.map((w) => `  ${colors.warning(symbols.warning)} ${w}`).join('\n')}` : ''}`,
      'Trust Score'
    );

    const topAgents = Object.entries(compatibility)
      .sort(([, a], [, b]) => b.score - a.score)
      .slice(0, 5);

    const compatLines = topAgents.map(([agentId, score]) => {
      const bar = progressBar(score.score, 10, 10);
      const color = getCompatGradeColor(score.grade);
      return `  ${formatAgent(agentId)}: ${color(`${score.score.toFixed(1)}/10`)} ${colors.dim(bar)}`;
    });

    prompts.note(compatLines.join('\n'), 'Agent Compatibility');

    const action = await prompts.select({
      message: 'What would you like to do?',
      options: [
        { value: 'approve', label: 'Approve and continue', hint: 'Install to agents' },
        { value: 'view', label: 'View full content' },
        { value: 'regenerate', label: 'Regenerate', hint: 'Try again with same inputs' },
      ],
    });

    if (prompts.isCancel(action)) {
      prompts.cancel('Operation cancelled');
      return false;
    }

    if (action === 'view') {
      console.log('\n' + colors.dim('─'.repeat(60)));
      console.log(skill.content);
      console.log(colors.dim('─'.repeat(60)) + '\n');

      const afterView = await prompts.select({
        message: 'Continue?',
        options: [
          { value: 'approve', label: 'Approve and install' },
          { value: 'regenerate', label: 'Regenerate' },
        ],
      });

      if (prompts.isCancel(afterView)) {
        prompts.cancel('Operation cancelled');
        return false;
      }

      if (afterView === 'regenerate') {
        return this.stepReview(wizard);
      }
    }

    if (action === 'regenerate') {
      return this.stepReview(wizard);
    }

    const approveResult = await wizard.approveSkill();
    return approveResult.success;
  }

  private async stepInstall(wizard: SkillWizard): Promise<boolean> {
    this.showStepHeader('install', 'Install to Agents');

    const state = wizard.getState();

    let targetAgents: string[];

    if (this.agents) {
      targetAgents = this.agents.split(',').map((a) => a.trim());
    } else {
      const agentOptions = [
        'claude-code',
        'cursor',
        'codex',
        'gemini-cli',
        'opencode',
        'github-copilot',
        'windsurf',
        'cline',
        'roo',
        'universal',
      ];

      const selected = await prompts.agentMultiselect({
        message: 'Select target agents',
        agents: agentOptions,
        initialValues: ['claude-code'],
        required: true,
      });

      if (prompts.isCancel(selected)) {
        prompts.cancel('Operation cancelled');
        return false;
      }

      targetAgents = selected as string[];
    }

    const spinner = prompts.spinner();
    spinner.start('Installing with agent-specific optimizations...');

    const result = await wizard.installToAgents(targetAgents);

    if (!result.success) {
      spinner.stop('Installation failed');
      prompts.error(result.error || 'Failed to install skill');
      return false;
    }

    spinner.stop('Installation complete');

    const installState = wizard.getState();
    const successCount = installState.installResults.filter((r) => r.success).length;

    const resultLines = installState.installResults.map((r) => {
      const icon = r.success ? colors.success(symbols.success) : colors.error(symbols.error);
      const agent = formatAgent(r.agentId);
      const changes = r.changes.length > 0 ? colors.dim(` (${r.changes.join(', ')})`) : '';
      return `  ${icon} ${agent}${changes}`;
    });

    prompts.note(resultLines.join('\n'), `Installed to ${successCount} agents`);

    if (this.output) {
      const outputDir = resolve(this.output);
      if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
      }
      const skillPath = resolve(outputDir, 'SKILL.md');
      writeFileSync(skillPath, state.generatedSkill!.content, 'utf-8');
      prompts.success(`Saved to: ${skillPath}`);
    }

    return true;
  }

  private showStepHeader(step: WizardStep, title: string): void {
    const stepOrder = ['expertise', 'context-sources', 'composition', 'clarification', 'review', 'install'];
    const current = stepOrder.indexOf(step) + 1;
    const total = stepOrder.length;

    console.log();
    prompts.log(`${colors.dim(`Step ${current}/${total}:`)} ${colors.bold(title)}`);
  }
}

function getTrustGradeColor(grade: string): typeof colors.success {
  switch (grade) {
    case 'trusted':
      return colors.success;
    case 'review':
      return colors.warning;
    default:
      return colors.error;
  }
}

function getCompatGradeColor(grade: string): typeof colors.success {
  switch (grade) {
    case 'A':
    case 'B':
      return colors.success;
    case 'C':
      return colors.warning;
    default:
      return colors.error;
  }
}
