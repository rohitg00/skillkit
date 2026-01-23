import { Command, Option } from 'clipanion';
import chalk from 'chalk';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

type CICDProvider = 'github' | 'gitlab' | 'circleci';

const GITHUB_ACTIONS_WORKFLOW = `name: SkillKit CI

on:
  push:
    branches: [main, master]
    paths:
      - '.skillkit/**'
      - 'skills/**'
      - '.claude/skills/**'
      - '.cursor/skills/**'
  pull_request:
    branches: [main, master]
    paths:
      - '.skillkit/**'
      - 'skills/**'
      - '.claude/skills/**'
      - '.cursor/skills/**'

jobs:
  validate:
    name: Validate Skills
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install SkillKit
        run: npm install -g skillkit

      - name: Validate Skills
        run: skillkit validate --all

      - name: List Skills
        run: skillkit list

  test:
    name: Test Skills
    runs-on: ubuntu-latest
    needs: validate
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install SkillKit
        run: npm install -g skillkit

      - name: Run Skill Tests
        run: skillkit test --all
        continue-on-error: true

  sync:
    name: Sync Skills
    runs-on: ubuntu-latest
    needs: validate
    if: github.event_name == 'push'
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install SkillKit
        run: npm install -g skillkit

      - name: Sync Skills to All Agents
        run: skillkit sync --yes
`;

const GITLAB_CI = `stages:
  - validate
  - test
  - sync

variables:
  NODE_VERSION: "20"

.skillkit-base:
  image: node:\${NODE_VERSION}
  before_script:
    - npm install -g skillkit
  rules:
    - changes:
        - .skillkit/**/*
        - skills/**/*
        - .claude/skills/**/*
        - .cursor/skills/**/*

validate:
  extends: .skillkit-base
  stage: validate
  script:
    - skillkit validate --all
    - skillkit list

test:
  extends: .skillkit-base
  stage: test
  script:
    - skillkit test --all
  allow_failure: true
  needs:
    - validate

sync:
  extends: .skillkit-base
  stage: sync
  script:
    - skillkit sync --yes
  needs:
    - validate
  only:
    - main
    - master
`;

const CIRCLECI_CONFIG = `version: 2.1

executors:
  node:
    docker:
      - image: cimg/node:20.0

jobs:
  validate:
    executor: node
    steps:
      - checkout
      - run:
          name: Install SkillKit
          command: npm install -g skillkit
      - run:
          name: Validate Skills
          command: skillkit validate --all
      - run:
          name: List Skills
          command: skillkit list

  test:
    executor: node
    steps:
      - checkout
      - run:
          name: Install SkillKit
          command: npm install -g skillkit
      - run:
          name: Run Skill Tests
          command: skillkit test --all || true

  sync:
    executor: node
    steps:
      - checkout
      - run:
          name: Install SkillKit
          command: npm install -g skillkit
      - run:
          name: Sync Skills
          command: skillkit sync --yes

workflows:
  skillkit:
    jobs:
      - validate:
          filters:
            branches:
              only:
                - main
                - master
      - test:
          requires:
            - validate
      - sync:
          requires:
            - validate
          filters:
            branches:
              only:
                - main
                - master
`;

/**
 * CICD command - initialize CI/CD workflows for skill validation and testing
 */
export class CICDCommand extends Command {
  static override paths = [['cicd', 'init']];

  static override usage = Command.Usage({
    description: 'Initialize CI/CD workflows for skill validation',
    details: `
      The cicd command sets up continuous integration workflows to automatically
      validate and test skills on every push or pull request.

      Supported providers: github, gitlab, circleci
    `,
    examples: [
      ['Initialize GitHub Actions workflow', '$0 cicd init'],
      ['Initialize GitLab CI', '$0 cicd init --provider gitlab'],
      ['Initialize CircleCI', '$0 cicd init --provider circleci'],
      ['Initialize all providers', '$0 cicd init --all'],
      ['Force overwrite existing files', '$0 cicd init --force'],
    ],
  });

  // Provider selection
  provider = Option.String('--provider,-p', 'github', {
    description: 'CI/CD provider (github, gitlab, circleci)',
  });

  // Generate for all providers
  all = Option.Boolean('--all,-a', false, {
    description: 'Generate workflows for all supported providers',
  });

  // Force overwrite
  force = Option.Boolean('--force,-f', false, {
    description: 'Overwrite existing workflow files',
  });

  // Project path
  targetPath = Option.String('--path', {
    description: 'Project path (default: current directory)',
  });

  async execute(): Promise<number> {
    const projectPath = this.targetPath || process.cwd();

    const providers: CICDProvider[] = this.all
      ? ['github', 'gitlab', 'circleci']
      : [this.provider as CICDProvider];

    console.log(chalk.cyan('Initializing CI/CD workflows...'));
    console.log();

    let success = true;
    let created = false;

    for (const provider of providers) {
      const result = this.createWorkflow(projectPath, provider);
      if (result.skipped) {
        console.log(chalk.yellow(`  ${result.message}`));
        continue;
      }
      if (!result.success) {
        success = false;
        console.error(chalk.red(`  ${result.message}`));
        continue;
      }
      created = true;
      console.log(chalk.green(`  ✓ ${result.message}`));
    }

    if (success) {
      console.log();
      console.log(
        created
          ? chalk.green('CI/CD workflows initialized successfully!')
          : chalk.yellow('CI/CD workflows already exist; nothing to do.')
      );
      console.log();
      if (created) {
        console.log(chalk.dim('The workflows will run on push/PR to validate your skills.'));
        console.log(chalk.dim('Commit the generated files to enable CI/CD.'));
      }
    }

    return success ? 0 : 1;
  }

  private createWorkflow(
    projectPath: string,
    provider: CICDProvider
  ): { success: boolean; message: string; skipped?: boolean } {
    switch (provider) {
      case 'github':
        return this.createGitHubActions(projectPath);
      case 'gitlab':
        return this.createGitLabCI(projectPath);
      case 'circleci':
        return this.createCircleCI(projectPath);
      default:
        return { success: false, message: `Unknown provider: ${provider}` };
    }
  }

  private createGitHubActions(projectPath: string): { success: boolean; message: string; skipped?: boolean } {
    const workflowDir = join(projectPath, '.github', 'workflows');
    const workflowFile = join(workflowDir, 'skillkit.yml');

    if (existsSync(workflowFile) && !this.force) {
      return {
        success: true,
        message: `GitHub Actions workflow already exists (use --force to overwrite)`,
        skipped: true,
      };
    }

    try {
      mkdirSync(workflowDir, { recursive: true });
      writeFileSync(workflowFile, GITHUB_ACTIONS_WORKFLOW);
      return { success: true, message: `Created ${workflowFile}` };
    } catch (error) {
      return { success: false, message: `Failed to create GitHub workflow: ${error}` };
    }
  }

  private createGitLabCI(projectPath: string): { success: boolean; message: string; skipped?: boolean } {
    const ciFile = join(projectPath, '.gitlab-ci.yml');

    if (existsSync(ciFile) && !this.force) {
      // Check if skillkit jobs already exist for better messaging
      try {
        const content = readFileSync(ciFile, 'utf-8');
        if (content.includes('skillkit')) {
          return {
            success: true,
            message: `.gitlab-ci.yml already contains SkillKit config (use --force to overwrite)`,
            skipped: true,
          };
        }
        return {
          success: true,
          message: `.gitlab-ci.yml already exists (use --force to overwrite)`,
          skipped: true,
        };
      } catch (error) {
        return {
          success: false,
          message: `Failed to read .gitlab-ci.yml: ${error}`,
        };
      }
    }

    try {
      writeFileSync(ciFile, GITLAB_CI);
      return { success: true, message: `Created ${ciFile}` };
    } catch (error) {
      return { success: false, message: `Failed to create GitLab CI config: ${error}` };
    }
  }

  private createCircleCI(projectPath: string): { success: boolean; message: string; skipped?: boolean } {
    const circleDir = join(projectPath, '.circleci');
    const configFile = join(circleDir, 'config.yml');

    if (existsSync(configFile) && !this.force) {
      return {
        success: true,
        message: `CircleCI config already exists (use --force to overwrite)`,
        skipped: true,
      };
    }

    try {
      mkdirSync(circleDir, { recursive: true });
      writeFileSync(configFile, CIRCLECI_CONFIG);
      return { success: true, message: `Created ${configFile}` };
    } catch (error) {
      return { success: false, message: `Failed to create CircleCI config: ${error}` };
    }
  }
}
