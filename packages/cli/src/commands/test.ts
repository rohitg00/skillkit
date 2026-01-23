import { Command, Option } from 'clipanion';
import { resolve, join } from 'node:path';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import chalk from 'chalk';
import {
  runTestSuite,
  createTestSuiteFromFrontmatter,
  type SkillTestSuite,
  type TestSuiteResult,
} from '@skillkit/core';
import { parse as parseYaml } from 'yaml';

/**
 * Test command - run skill tests
 */
export class TestCommand extends Command {
  static override paths = [['test']];

  static override usage = Command.Usage({
    description: 'Run skill tests',
    details: `
      The test command runs test cases defined in skill frontmatter.

      Tests are defined in the skill's YAML frontmatter using the 'tests' key.

      Example skill with tests:
      \`\`\`yaml
      ---
      name: my-skill
      tests:
        - name: "Creates config file"
          assertions:
            - type: file_exists
              target: config.json
        - name: "Types check"
          assertions:
            - type: type_check
      ---
      \`\`\`
    `,
    examples: [
      ['Run all skill tests', '$0 test'],
      ['Run tests for a specific skill', '$0 test my-skill'],
      ['Run with verbose output', '$0 test --verbose'],
      ['Stop on first failure', '$0 test --bail'],
      ['Run tests with specific tags', '$0 test --tags unit,integration'],
    ],
  });

  skill = Option.String({ required: false });

  verbose = Option.Boolean('--verbose,-v', false, {
    description: 'Verbose output',
  });

  bail = Option.Boolean('--bail,-b', false, {
    description: 'Stop on first failure',
  });

  tags = Option.String('--tags,-t', {
    description: 'Only run tests with these tags (comma-separated)',
  });

  skipTags = Option.String('--skip-tags', {
    description: 'Skip tests with these tags (comma-separated)',
  });

  json = Option.Boolean('--json,-j', false, {
    description: 'Output results as JSON',
  });

  projectPath = Option.String('--path,-p', {
    description: 'Project path',
  });

  timeout = Option.String('--timeout', {
    description: 'Test timeout in milliseconds',
  });

  async execute(): Promise<number> {
    const targetPath = resolve(this.projectPath || process.cwd());

    // Find skills to test
    const skillFiles = this.findSkillFiles(targetPath);

    if (skillFiles.length === 0) {
      if (!this.json) {
        console.log(chalk.yellow('No skills found with tests.'));
        console.log(chalk.dim('Add tests to your skills using YAML frontmatter.'));
      } else {
        console.log(JSON.stringify({ results: [], passed: true, total: 0 }));
      }
      return 0;
    }

    // Filter by skill name if provided
    const filesToTest = this.skill
      ? skillFiles.filter((f) => f.name.includes(this.skill!))
      : skillFiles;

    if (filesToTest.length === 0) {
      if (!this.json) {
        console.log(chalk.yellow(`No skills found matching "${this.skill}"`));
      }
      return 1;
    }

    if (!this.json) {
      console.log(chalk.bold('Running skill tests...\n'));
    }

    // Parse tags
    const tags = this.tags?.split(',').map((t) => t.trim());
    const skipTags = this.skipTags?.split(',').map((t) => t.trim());
    const timeout = this.timeout ? parseInt(this.timeout, 10) : undefined;

    // Run tests for each skill
    const results: TestSuiteResult[] = [];
    let allPassed = true;

    for (const file of filesToTest) {
      const suite = this.parseSkillTests(file.path, file.name);

      if (!suite || suite.tests.length === 0) {
        continue;
      }

      if (!this.json) {
        console.log(chalk.blue(`Testing: ${suite.skillName}`));
      }

      const result = await runTestSuite(suite, {
        cwd: targetPath,
        verbose: this.verbose,
        bail: this.bail,
        tags,
        skipTags,
        timeout,
        onProgress: (event) => {
          if (this.json || !this.verbose) return;

          switch (event.type) {
            case 'test_start':
              console.log(chalk.dim(`  Running: ${event.testName}`));
              break;
            case 'test_end':
              if (event.passed) {
                console.log(chalk.green(`  ✓ ${event.testName}`));
              } else {
                console.log(chalk.red(`  ✗ ${event.testName}`));
                if (event.error) {
                  console.log(chalk.red(`    ${event.error}`));
                }
              }
              break;
            case 'assertion_end':
              if (this.verbose && !event.passed) {
                console.log(chalk.red(`    - ${event.assertionType}: ${event.error}`));
              }
              break;
          }
        },
      });

      results.push(result);

      if (!result.passed) {
        allPassed = false;
      }

      if (!this.json) {
        const icon = result.passed ? chalk.green('✓') : chalk.red('✗');
        const status = result.passed ? 'PASSED' : 'FAILED';
        console.log(
          `${icon} ${suite.skillName}: ${result.passedCount}/${result.tests.length} tests ${status} (${result.duration}ms)\n`
        );
      }

      if (this.bail && !result.passed) {
        break;
      }
    }

    // Summary
    if (this.json) {
      console.log(
        JSON.stringify({
          results: results.map((r) => ({
            skill: r.skillName,
            passed: r.passed,
            tests: r.passedCount,
            failed: r.failedCount,
            skipped: r.skippedCount,
            duration: r.duration,
          })),
          passed: allPassed,
          total: results.length,
        })
      );
    } else {
      const totalTests = results.reduce((acc, r) => acc + r.tests.length, 0);
      const passedTests = results.reduce((acc, r) => acc + r.passedCount, 0);
      const failedTests = results.reduce((acc, r) => acc + r.failedCount, 0);
      const skippedTests = results.reduce((acc, r) => acc + r.skippedCount, 0);

      console.log(chalk.bold('Summary:'));
      console.log(`  Skills tested: ${results.length}`);
      console.log(`  Total tests: ${totalTests}`);
      console.log(chalk.green(`  Passed: ${passedTests}`));
      if (failedTests > 0) {
        console.log(chalk.red(`  Failed: ${failedTests}`));
      }
      if (skippedTests > 0) {
        console.log(chalk.yellow(`  Skipped: ${skippedTests}`));
      }

      if (allPassed) {
        console.log(chalk.green('\n✓ All tests passed!'));
      } else {
        console.log(chalk.red('\n✗ Some tests failed.'));
      }
    }

    return allPassed ? 0 : 1;
  }

  /**
   * Find skill files with tests
   */
  private findSkillFiles(projectPath: string): { name: string; path: string }[] {
    const files: { name: string; path: string }[] = [];

    // Check common skill directories
    const skillDirs = [
      '.claude/skills',
      '.cursor/skills',
      '.skillkit/skills',
      'skills',
    ];

    for (const dir of skillDirs) {
      const fullDir = join(projectPath, dir);
      if (!existsSync(fullDir)) continue;

      try {
        const entries = readdirSync(fullDir, { withFileTypes: true });

        for (const entry of entries) {
          if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.mdc'))) {
            files.push({
              name: entry.name.replace(/\.(md|mdc)$/, ''),
              path: join(fullDir, entry.name),
            });
          }
        }
      } catch {
        // Directory not readable
      }
    }

    return files;
  }

  /**
   * Parse skill file for tests
   */
  private parseSkillTests(filePath: string, skillName: string): SkillTestSuite | null {
    try {
      const content = readFileSync(filePath, 'utf-8');

      // Extract frontmatter
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (!frontmatterMatch) {
        return null;
      }

      const frontmatter = parseYaml(frontmatterMatch[1]) as Record<string, unknown>;

      if (!frontmatter.tests) {
        return null;
      }

      return createTestSuiteFromFrontmatter(skillName, frontmatter);
    } catch {
      return null;
    }
  }
}
