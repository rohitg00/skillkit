import { Command, Option } from 'clipanion';
import { resolve } from 'node:path';
import chalk from 'chalk';
import {
  type AgentType,
  AgentType as AgentTypeSchema,
  generatePrimer,
  analyzePrimer,
  AGENT_CONFIG,
} from '@skillkit/core';

export class PrimerCommand extends Command {
  static override paths = [['primer']];

  static override usage = Command.Usage({
    description: 'Analyze codebase and generate AI instruction files for agents',
    details: `
      The primer command analyzes your codebase to detect languages, frameworks,
      patterns, and conventions, then generates customized instruction files
      for AI coding agents.

      By default, it generates instructions for detected agents in your project.
      Use --all-agents to generate for all 32 supported agents.

      Inspired by github.com/pierceboggan/primer but extended for all SkillKit agents.
    `,
    examples: [
      ['Generate for detected agents', '$0 primer'],
      ['Generate for all 32 agents', '$0 primer --all-agents'],
      ['Generate for specific agents', '$0 primer --agent claude-code,cursor,github-copilot'],
      ['Custom output directory', '$0 primer --output ./instructions'],
      ['Preview without writing files', '$0 primer --dry-run'],
      ['Only show analysis', '$0 primer --analyze-only'],
      ['Verbose output', '$0 primer --verbose'],
    ],
  });

  agent = Option.String('--agent,-a', {
    description: 'Comma-separated list of agents to generate for',
  });

  allAgents = Option.Boolean('--all-agents,-A', false, {
    description: 'Generate for all 32 supported agents',
  });

  output = Option.String('--output,-o', {
    description: 'Output directory for generated files',
  });

  dryRun = Option.Boolean('--dry-run,-n', false, {
    description: 'Preview what would be generated without writing files',
  });

  analyzeOnly = Option.Boolean('--analyze-only', false, {
    description: 'Only show codebase analysis, do not generate files',
  });

  verbose = Option.Boolean('--verbose,-v', false, {
    description: 'Show detailed output',
  });

  includeExamples = Option.Boolean('--examples', false, {
    description: 'Include code examples in generated instructions',
  });

  json = Option.Boolean('--json,-j', false, {
    description: 'Output analysis in JSON format',
  });

  directory = Option.String('--dir,-d', {
    description: 'Project directory to analyze (default: current directory)',
  });

  async execute(): Promise<number> {
    const projectPath = resolve(this.directory || process.cwd());

    if (this.analyzeOnly) {
      return this.runAnalysis(projectPath);
    }

    return this.runGenerate(projectPath);
  }

  private async runAnalysis(projectPath: string): Promise<number> {
    console.log(chalk.cyan('Analyzing codebase...\n'));

    try {
      const analysis = analyzePrimer(projectPath);

      if (this.json) {
        console.log(JSON.stringify(analysis, null, 2));
        return 0;
      }

      this.printAnalysis(analysis);
      return 0;
    } catch (error) {
      console.error(chalk.red('Analysis failed:'), error instanceof Error ? error.message : error);
      return 1;
    }
  }

  private async runGenerate(projectPath: string): Promise<number> {
    const agents = this.parseAgents();

    console.log(chalk.cyan('Analyzing codebase and generating AI instructions...\n'));

    try {
      const result = generatePrimer(projectPath, {
        agents,
        allAgents: this.allAgents,
        outputDir: this.output ? resolve(this.output) : undefined,
        dryRun: this.dryRun,
        verbose: this.verbose,
        includeExamples: this.includeExamples,
      });

      if (this.verbose) {
        this.printAnalysis(result.analysis);
        console.log();
      }

      if (result.generated.length === 0) {
        console.log(chalk.yellow('No instruction files generated.'));
        if (result.errors.length > 0) {
          for (const error of result.errors) {
            console.log(chalk.red(`  Error: ${error}`));
          }
        }
        return 1;
      }

      console.log(chalk.bold('Generated Instruction Files:\n'));

      for (const instruction of result.generated) {
        const status = this.dryRun ? chalk.yellow('(dry-run)') : chalk.green('created');
        console.log(`  ${chalk.green('●')} ${chalk.bold(instruction.agent)}`);
        console.log(`    ${chalk.gray(instruction.filepath)} ${status}`);
      }

      console.log();

      if (result.warnings.length > 0) {
        console.log(chalk.yellow('Warnings:'));
        for (const warning of result.warnings) {
          console.log(`  ${chalk.yellow('⚠')} ${warning}`);
        }
        console.log();
      }

      if (result.errors.length > 0) {
        console.log(chalk.red('Errors:'));
        for (const error of result.errors) {
          console.log(`  ${chalk.red('✗')} ${error}`);
        }
        console.log();
      }

      const summary = this.dryRun
        ? `Would generate ${result.generated.length} instruction file(s)`
        : `Generated ${result.generated.length} instruction file(s)`;

      console.log(chalk.bold(summary));

      if (this.dryRun) {
        console.log(chalk.gray('\n(Dry run - no files were written)'));
      }

      return result.success ? 0 : 1;
    } catch (error) {
      console.error(chalk.red('Generation failed:'), error instanceof Error ? error.message : error);
      return 1;
    }
  }

  private parseAgents(): AgentType[] | undefined {
    if (!this.agent) return undefined;

    const agents: AgentType[] = [];
    const parts = this.agent.split(',').map(s => s.trim());

    for (const part of parts) {
      const result = AgentTypeSchema.safeParse(part);
      if (result.success) {
        agents.push(result.data);
      } else {
        console.warn(chalk.yellow(`Unknown agent: ${part}`));
      }
    }

    return agents.length > 0 ? agents : undefined;
  }

  private printAnalysis(analysis: ReturnType<typeof analyzePrimer>): void {
    const { project, languages, packageManagers, stack, structure, conventions, ci, docker, buildCommands, importantFiles } = analysis;

    console.log(chalk.bold('Project Information'));
    console.log(`  Name: ${chalk.cyan(project.name)}`);
    if (project.description) {
      console.log(`  Description: ${project.description}`);
    }
    if (project.type) {
      console.log(`  Type: ${project.type}`);
    }
    if (project.version) {
      console.log(`  Version: ${project.version}`);
    }
    console.log();

    if (languages.length > 0) {
      console.log(chalk.bold('Languages'));
      for (const lang of languages) {
        const version = lang.version ? ` (${lang.version})` : '';
        console.log(`  ${chalk.green('●')} ${lang.name}${version}`);
      }
      console.log();
    }

    if (packageManagers.length > 0) {
      console.log(chalk.bold('Package Managers'));
      console.log(`  ${chalk.cyan(packageManagers.join(', '))}`);
      console.log();
    }

    if (stack.frameworks.length > 0) {
      console.log(chalk.bold('Frameworks'));
      for (const fw of stack.frameworks) {
        const version = fw.version ? ` (${fw.version})` : '';
        console.log(`  ${chalk.green('●')} ${fw.name}${version}`);
      }
      console.log();
    }

    if (stack.libraries.length > 0) {
      console.log(chalk.bold('Libraries'));
      for (const lib of stack.libraries.slice(0, 10)) {
        const version = lib.version ? ` (${lib.version})` : '';
        console.log(`  ${chalk.green('●')} ${lib.name}${version}`);
      }
      if (stack.libraries.length > 10) {
        console.log(`  ${chalk.gray(`...and ${stack.libraries.length - 10} more`)}`);
      }
      console.log();
    }

    if (stack.styling.length > 0) {
      console.log(chalk.bold('Styling'));
      for (const style of stack.styling) {
        console.log(`  ${chalk.green('●')} ${style.name}`);
      }
      console.log();
    }

    if (stack.testing.length > 0) {
      console.log(chalk.bold('Testing'));
      for (const test of stack.testing) {
        console.log(`  ${chalk.green('●')} ${test.name}`);
      }
      console.log();
    }

    if (stack.databases.length > 0) {
      console.log(chalk.bold('Databases'));
      for (const db of stack.databases) {
        console.log(`  ${chalk.green('●')} ${db.name}`);
      }
      console.log();
    }

    if (structure) {
      console.log(chalk.bold('Project Structure'));
      if (structure.type) {
        console.log(`  Type: ${structure.type}`);
      }
      if (structure.srcDir) {
        console.log(`  Source: ${structure.srcDir}/`);
      }
      if (structure.testDir) {
        console.log(`  Tests: ${structure.testDir}/`);
      }
      if (structure.hasWorkspaces) {
        console.log(`  Monorepo: Yes`);
        if (structure.workspaces) {
          console.log(`  Workspaces: ${structure.workspaces.join(', ')}`);
        }
      }
      console.log();
    }

    if (conventions && Object.keys(conventions).some(k => conventions[k as keyof typeof conventions] !== undefined)) {
      console.log(chalk.bold('Code Conventions'));
      if (conventions.indentation) {
        console.log(`  Indentation: ${conventions.indentation}`);
      }
      if (conventions.quotes) {
        console.log(`  Quotes: ${conventions.quotes}`);
      }
      if (conventions.semicolons !== undefined) {
        console.log(`  Semicolons: ${conventions.semicolons ? 'yes' : 'no'}`);
      }
      if (conventions.trailingCommas) {
        console.log(`  Trailing Commas: ${conventions.trailingCommas}`);
      }
      console.log();
    }

    if (ci && ci.hasCI) {
      console.log(chalk.bold('CI/CD'));
      console.log(`  Provider: ${ci.provider}`);
      if (ci.hasCD) {
        console.log(`  Deployment: Yes`);
      }
      console.log();
    }

    if (docker && (docker.hasDockerfile || docker.hasCompose)) {
      console.log(chalk.bold('Docker'));
      if (docker.hasDockerfile) {
        console.log(`  Dockerfile: Yes`);
        if (docker.baseImage) {
          console.log(`  Base Image: ${docker.baseImage}`);
        }
      }
      if (docker.hasCompose) {
        console.log(`  Docker Compose: Yes`);
      }
      console.log();
    }

    if (buildCommands && Object.keys(buildCommands).some(k => buildCommands[k as keyof typeof buildCommands])) {
      console.log(chalk.bold('Build Commands'));
      if (buildCommands.install) {
        console.log(`  Install: ${chalk.gray(buildCommands.install)}`);
      }
      if (buildCommands.dev) {
        console.log(`  Dev: ${chalk.gray(buildCommands.dev)}`);
      }
      if (buildCommands.build) {
        console.log(`  Build: ${chalk.gray(buildCommands.build)}`);
      }
      if (buildCommands.test) {
        console.log(`  Test: ${chalk.gray(buildCommands.test)}`);
      }
      console.log();
    }

    if (importantFiles.length > 0 && this.verbose) {
      console.log(chalk.bold('Important Files'));
      for (const file of importantFiles.slice(0, 15)) {
        console.log(`  ${chalk.gray(file)}`);
      }
      if (importantFiles.length > 15) {
        console.log(`  ${chalk.gray(`...and ${importantFiles.length - 15} more`)}`);
      }
      console.log();
    }

    console.log(chalk.bold('Available Agents'));
    console.log(chalk.gray(`  Use --all-agents to generate for all ${Object.keys(AGENT_CONFIG).length} agents`));
    console.log(chalk.gray(`  Use --agent <name> to generate for specific agents`));
  }
}
