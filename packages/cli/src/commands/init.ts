import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { Command, Option } from 'clipanion';
import type { AgentType } from '@skillkit/core';
import { detectAgent, getAdapter, getAllAdapters } from '@skillkit/agents';
import { initProject } from '../helpers.js';
import {
  welcome,
  header,
  colors,
  symbols,
  formatAgent,
  isCancel,
  spinner,
  select,
  confirm,
  outro,
  cancel,
  step,
  note,
  showNextSteps,
  isOnboardingComplete,
  completeOnboarding,
} from '../onboarding/index.js';

export class InitCommand extends Command {
  static override paths = [['init']];

  static override usage = Command.Usage({
    description: 'Initialize skillkit in a project',
    examples: [
      ['Auto-detect agent and initialize', '$0 init'],
      ['Initialize for specific agent', '$0 init --agent cursor'],
      ['List supported agents', '$0 init --list'],
    ],
  });

  agent = Option.String('--agent,-a', {
    description: 'Target agent type',
  });

  list = Option.Boolean('--list,-l', false, {
    description: 'List supported agents',
  });

  quiet = Option.Boolean('--quiet,-q', false, {
    description: 'Minimal output (no logo)',
  });

  async execute(): Promise<number> {
    const isInteractive = process.stdin.isTTY;

    // List mode
    if (this.list) {
      if (!this.quiet) {
        header('Supported Agents');
      }

      const adapters = getAllAdapters();
      console.log('');

      for (const adapter of adapters) {
        console.log(`  ${formatAgent(adapter.type)}`);
        console.log(`    ${colors.muted('Skills dir:')} ${adapter.skillsDir}`);
        console.log(`    ${colors.muted('Config:')} ${adapter.configFile}`);
        console.log('');
      }

      return 0;
    }

    try {
      // Show welcome for first-time users
      const isFirstRun = !isOnboardingComplete();
      if (isInteractive && isFirstRun && !this.quiet) {
        welcome();
      } else if (!this.quiet) {
        header('Initialize');
      }

      let agentType: AgentType;
      const s = spinner();

      if (this.agent) {
        // Use specified agent
        agentType = this.agent as AgentType;
      } else if (isInteractive) {
        // Auto-detect and let user confirm/change
        s.start('Detecting agent...');
        const detected = await detectAgent();
        s.stop(`Detected: ${formatAgent(detected)}`);

        const allAgents = getAllAdapters().map(a => a.type);

        // Let user confirm or select different agent
        const agentResult = await select({
          message: 'Initialize for which agent?',
          options: allAgents.map(a => ({
            value: a,
            label: formatAgent(a),
            hint: a === detected ? '(detected)' : undefined,
          })),
          initialValue: detected,
        });

        if (isCancel(agentResult)) {
          cancel('Initialization cancelled');
          return 0;
        }

        agentType = agentResult as AgentType;
      } else {
        // Non-interactive: auto-detect
        s.start('Detecting agent...');
        agentType = await detectAgent();
        s.stop(`Detected: ${formatAgent(agentType)}`);
      }

      const adapter = getAdapter(agentType);

      // Initialize project
      s.start(`Initializing for ${adapter.name}...`);
      await initProject(agentType);
      s.stop(`Initialized for ${adapter.name}`);

      // Show what was created
      note(
        [
          `${symbols.success} ${adapter.skillsDir}/ ${colors.muted('(skills directory)')}`,
          `${symbols.success} skillkit.yaml ${colors.muted('(config file)')}`,
          `${symbols.success} ${adapter.configFile} ${colors.muted('(agent config)')}`,
        ].join('\n'),
        'Created'
      );

      // Mark onboarding complete
      if (isFirstRun) {
        completeOnboarding();
      }

      // Check for SKILL.md to offer publishing
      await this.checkAndPromptPublish();

      outro('Initialization complete!');

      showNextSteps({
        skillNames: [],
        agentTypes: [agentType],
      });

      return 0;
    } catch (err) {
      console.log(colors.error('Initialization failed'));
      console.log(colors.muted(err instanceof Error ? err.message : String(err)));
      return 1;
    }
  }

  private async checkAndPromptPublish(): Promise<void> {
    if (!process.stdin.isTTY) return;

    const skillMdLocations = [
      join(process.cwd(), 'SKILL.md'),
      join(process.cwd(), 'skills', 'SKILL.md'),
      join(process.cwd(), '.claude', 'skills', 'SKILL.md'),
      join(process.cwd(), '.cursor', 'skills', 'SKILL.md'),
    ];

    const foundSkillMd = skillMdLocations.find(loc => existsSync(loc));
    if (!foundSkillMd) return;

    console.log('');
    step(`Found SKILL.md in your project`);

    const publishResult = await confirm({
      message: 'Would you like to publish it to the SkillKit marketplace?',
      initialValue: false,
    });

    if (isCancel(publishResult) || !publishResult) {
      return;
    }

    console.log('');
    console.log(colors.cyan('To publish your skill, run:'));
    console.log(`  ${colors.bold(`skillkit publish ${foundSkillMd}`)}`);
    console.log('');
  }
}
