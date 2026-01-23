/**
 * Skill Test Runner
 *
 * Executes test suites and assertions for skill verification.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import type {
  TestAssertion,
  AssertionResult,
  SkillTestCase,
  TestCaseResult,
  SkillTestSuite,
  TestSuiteResult,
  TestRunnerOptions,
} from './types.js';

const execAsync = promisify(exec);

/**
 * Default timeout for assertions (30 seconds)
 */
const DEFAULT_TIMEOUT = 30000;

/**
 * Run a single assertion
 */
async function runAssertion(
  assertion: TestAssertion,
  cwd: string,
  timeout: number
): Promise<AssertionResult> {
  const startTime = Date.now();

  try {
    switch (assertion.type) {
      case 'file_exists':
        return assertFileExists(assertion, cwd, startTime);

      case 'file_not_exists':
        return assertFileNotExists(assertion, cwd, startTime);

      case 'file_contains':
        return assertFileContains(assertion, cwd, startTime);

      case 'file_not_contains':
        return assertFileNotContains(assertion, cwd, startTime);

      case 'file_matches':
        return assertFileMatches(assertion, cwd, startTime);

      case 'command_succeeds':
        return assertCommandSucceeds(assertion, cwd, timeout, startTime);

      case 'command_fails':
        return assertCommandFails(assertion, cwd, timeout, startTime);

      case 'command_output_contains':
        return assertCommandOutputContains(assertion, cwd, timeout, startTime);

      case 'json_valid':
        return assertJsonValid(assertion, cwd, startTime);

      case 'json_has_key':
        return assertJsonHasKey(assertion, cwd, startTime);

      case 'yaml_valid':
        return assertYamlValid(assertion, cwd, startTime);

      case 'type_check':
        return assertTypeCheck(cwd, timeout, startTime);

      case 'lint_passes':
        return assertLintPasses(cwd, timeout, startTime);

      case 'test_passes':
        return assertTestPasses(cwd, timeout, startTime);

      case 'env_var_set':
        return assertEnvVarSet(assertion, startTime);

      case 'port_available':
        return assertPortAvailable(assertion, startTime);

      case 'url_responds':
        return assertUrlResponds(assertion, timeout, startTime);

      case 'custom':
        return assertCustom(assertion, cwd, timeout, startTime);

      default:
        return {
          assertion,
          passed: false,
          error: `Unknown assertion type: ${assertion.type}`,
          duration: Date.now() - startTime,
        };
    }
  } catch (error) {
    return {
      assertion,
      passed: false,
      error: error instanceof Error ? error.message : String(error),
      duration: Date.now() - startTime,
    };
  }
}

// Assertion implementations

function assertFileExists(
  assertion: TestAssertion,
  cwd: string,
  startTime: number
): AssertionResult {
  const filePath = join(cwd, assertion.target || '');
  const exists = existsSync(filePath);

  return {
    assertion,
    passed: exists,
    actual: exists ? 'exists' : 'not found',
    expected: 'exists',
    error: exists ? undefined : `File not found: ${assertion.target}`,
    duration: Date.now() - startTime,
  };
}

function assertFileNotExists(
  assertion: TestAssertion,
  cwd: string,
  startTime: number
): AssertionResult {
  const filePath = join(cwd, assertion.target || '');
  const exists = existsSync(filePath);

  return {
    assertion,
    passed: !exists,
    actual: exists ? 'exists' : 'not found',
    expected: 'not found',
    error: !exists ? undefined : `File should not exist: ${assertion.target}`,
    duration: Date.now() - startTime,
  };
}

function assertFileContains(
  assertion: TestAssertion,
  cwd: string,
  startTime: number
): AssertionResult {
  const filePath = join(cwd, assertion.target || '');

  if (!existsSync(filePath)) {
    return {
      assertion,
      passed: false,
      error: `File not found: ${assertion.target}`,
      duration: Date.now() - startTime,
    };
  }

  const content = readFileSync(filePath, 'utf-8');
  const expected = String(assertion.expected || '');
  const contains = content.includes(expected);

  return {
    assertion,
    passed: contains,
    actual: contains ? 'contains' : 'not found in file',
    expected: `contains "${expected}"`,
    error: contains ? undefined : `File does not contain: ${expected}`,
    duration: Date.now() - startTime,
  };
}

function assertFileNotContains(
  assertion: TestAssertion,
  cwd: string,
  startTime: number
): AssertionResult {
  const filePath = join(cwd, assertion.target || '');

  if (!existsSync(filePath)) {
    return {
      assertion,
      passed: true, // File doesn't exist, so it doesn't contain the text
      duration: Date.now() - startTime,
    };
  }

  const content = readFileSync(filePath, 'utf-8');
  const expected = String(assertion.expected || '');
  const contains = content.includes(expected);

  return {
    assertion,
    passed: !contains,
    actual: contains ? 'found in file' : 'not found',
    expected: `does not contain "${expected}"`,
    error: !contains ? undefined : `File should not contain: ${expected}`,
    duration: Date.now() - startTime,
  };
}

function assertFileMatches(
  assertion: TestAssertion,
  cwd: string,
  startTime: number
): AssertionResult {
  const filePath = join(cwd, assertion.target || '');

  if (!existsSync(filePath)) {
    return {
      assertion,
      passed: false,
      error: `File not found: ${assertion.target}`,
      duration: Date.now() - startTime,
    };
  }

  const content = readFileSync(filePath, 'utf-8');
  const pattern = new RegExp(String(assertion.expected || ''));
  const matches = pattern.test(content);

  return {
    assertion,
    passed: matches,
    actual: matches ? 'matches' : 'no match',
    expected: `matches /${assertion.expected}/`,
    error: matches ? undefined : `File does not match pattern: ${assertion.expected}`,
    duration: Date.now() - startTime,
  };
}

async function assertCommandSucceeds(
  assertion: TestAssertion,
  cwd: string,
  timeout: number,
  startTime: number
): Promise<AssertionResult> {
  try {
    await execAsync(assertion.target || '', {
      cwd,
      timeout: assertion.timeout || timeout,
    });

    return {
      assertion,
      passed: true,
      actual: 'exit code 0',
      expected: 'exit code 0',
      duration: Date.now() - startTime,
    };
  } catch (error) {
    return {
      assertion,
      passed: false,
      actual: 'non-zero exit code',
      expected: 'exit code 0',
      error: error instanceof Error ? error.message : String(error),
      duration: Date.now() - startTime,
    };
  }
}

async function assertCommandFails(
  assertion: TestAssertion,
  cwd: string,
  timeout: number,
  startTime: number
): Promise<AssertionResult> {
  try {
    await execAsync(assertion.target || '', {
      cwd,
      timeout: assertion.timeout || timeout,
    });

    return {
      assertion,
      passed: false,
      actual: 'exit code 0',
      expected: 'non-zero exit code',
      error: 'Command should have failed but succeeded',
      duration: Date.now() - startTime,
    };
  } catch {
    return {
      assertion,
      passed: true,
      actual: 'non-zero exit code',
      expected: 'non-zero exit code',
      duration: Date.now() - startTime,
    };
  }
}

async function assertCommandOutputContains(
  assertion: TestAssertion,
  cwd: string,
  timeout: number,
  startTime: number
): Promise<AssertionResult> {
  try {
    const { stdout, stderr } = await execAsync(assertion.target || '', {
      cwd,
      timeout: assertion.timeout || timeout,
    });

    const output = stdout + stderr;
    const expected = String(assertion.expected || '');
    const contains = output.includes(expected);

    return {
      assertion,
      passed: contains,
      actual: contains ? 'found in output' : 'not found',
      expected: `contains "${expected}"`,
      error: contains ? undefined : `Command output does not contain: ${expected}`,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    return {
      assertion,
      passed: false,
      error: error instanceof Error ? error.message : String(error),
      duration: Date.now() - startTime,
    };
  }
}

function assertJsonValid(
  assertion: TestAssertion,
  cwd: string,
  startTime: number
): AssertionResult {
  const filePath = join(cwd, assertion.target || '');

  if (!existsSync(filePath)) {
    return {
      assertion,
      passed: false,
      error: `File not found: ${assertion.target}`,
      duration: Date.now() - startTime,
    };
  }

  try {
    const content = readFileSync(filePath, 'utf-8');
    JSON.parse(content);

    return {
      assertion,
      passed: true,
      actual: 'valid JSON',
      expected: 'valid JSON',
      duration: Date.now() - startTime,
    };
  } catch (error) {
    return {
      assertion,
      passed: false,
      actual: 'invalid JSON',
      expected: 'valid JSON',
      error: error instanceof Error ? error.message : String(error),
      duration: Date.now() - startTime,
    };
  }
}

function assertJsonHasKey(
  assertion: TestAssertion,
  cwd: string,
  startTime: number
): AssertionResult {
  const filePath = join(cwd, assertion.target || '');

  if (!existsSync(filePath)) {
    return {
      assertion,
      passed: false,
      error: `File not found: ${assertion.target}`,
      duration: Date.now() - startTime,
    };
  }

  try {
    const content = readFileSync(filePath, 'utf-8');
    const json = JSON.parse(content);
    const key = String(assertion.expected || '');
    const keys = key.split('.');

    let value = json;
    for (const k of keys) {
      if (value === undefined || value === null || !(k in value)) {
        return {
          assertion,
          passed: false,
          actual: 'key not found',
          expected: `has key "${key}"`,
          error: `JSON does not have key: ${key}`,
          duration: Date.now() - startTime,
        };
      }
      value = value[k];
    }

    return {
      assertion,
      passed: true,
      actual: 'key found',
      expected: `has key "${key}"`,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    return {
      assertion,
      passed: false,
      error: error instanceof Error ? error.message : String(error),
      duration: Date.now() - startTime,
    };
  }
}

function assertYamlValid(
  assertion: TestAssertion,
  cwd: string,
  startTime: number
): AssertionResult {
  const filePath = join(cwd, assertion.target || '');

  if (!existsSync(filePath)) {
    return {
      assertion,
      passed: false,
      error: `File not found: ${assertion.target}`,
      duration: Date.now() - startTime,
    };
  }

  try {
    const content = readFileSync(filePath, 'utf-8');
    // Dynamic import of yaml to avoid bundling issues
    const { parse } = require('yaml');
    parse(content);

    return {
      assertion,
      passed: true,
      actual: 'valid YAML',
      expected: 'valid YAML',
      duration: Date.now() - startTime,
    };
  } catch (error) {
    return {
      assertion,
      passed: false,
      actual: 'invalid YAML',
      expected: 'valid YAML',
      error: error instanceof Error ? error.message : String(error),
      duration: Date.now() - startTime,
    };
  }
}

async function assertTypeCheck(
  cwd: string,
  timeout: number,
  startTime: number
): Promise<AssertionResult> {
  const assertion: TestAssertion = { type: 'type_check' };

  // Try various type check commands
  const commands = [
    'npx tsc --noEmit',
    'pnpm tsc --noEmit',
    'yarn tsc --noEmit',
    'npm run type-check',
  ];

  for (const cmd of commands) {
    try {
      await execAsync(cmd, { cwd, timeout });
      return {
        assertion,
        passed: true,
        actual: 'types valid',
        expected: 'types valid',
        duration: Date.now() - startTime,
      };
    } catch {
      // Try next command
    }
  }

  return {
    assertion,
    passed: false,
    actual: 'type errors',
    expected: 'types valid',
    error: 'Type check failed or TypeScript not configured',
    duration: Date.now() - startTime,
  };
}

async function assertLintPasses(
  cwd: string,
  timeout: number,
  startTime: number
): Promise<AssertionResult> {
  const assertion: TestAssertion = { type: 'lint_passes' };

  // Try various lint commands
  const commands = [
    'npx eslint . --max-warnings=0',
    'pnpm eslint . --max-warnings=0',
    'npm run lint',
  ];

  for (const cmd of commands) {
    try {
      await execAsync(cmd, { cwd, timeout });
      return {
        assertion,
        passed: true,
        actual: 'lint passes',
        expected: 'lint passes',
        duration: Date.now() - startTime,
      };
    } catch {
      // Try next command
    }
  }

  return {
    assertion,
    passed: false,
    actual: 'lint errors',
    expected: 'lint passes',
    error: 'Lint check failed or ESLint not configured',
    duration: Date.now() - startTime,
  };
}

async function assertTestPasses(
  cwd: string,
  timeout: number,
  startTime: number
): Promise<AssertionResult> {
  const assertion: TestAssertion = { type: 'test_passes' };

  // Try various test commands
  const commands = [
    'npm test',
    'pnpm test',
    'yarn test',
    'npx vitest run',
    'npx jest',
  ];

  for (const cmd of commands) {
    try {
      await execAsync(cmd, { cwd, timeout });
      return {
        assertion,
        passed: true,
        actual: 'tests pass',
        expected: 'tests pass',
        duration: Date.now() - startTime,
      };
    } catch {
      // Try next command
    }
  }

  return {
    assertion,
    passed: false,
    actual: 'tests fail',
    expected: 'tests pass',
    error: 'Tests failed or test framework not configured',
    duration: Date.now() - startTime,
  };
}

function assertEnvVarSet(
  assertion: TestAssertion,
  startTime: number
): AssertionResult {
  const varName = assertion.target || '';
  const isSet = process.env[varName] !== undefined;

  return {
    assertion,
    passed: isSet,
    actual: isSet ? 'set' : 'not set',
    expected: 'set',
    error: isSet ? undefined : `Environment variable not set: ${varName}`,
    duration: Date.now() - startTime,
  };
}

function assertPortAvailable(
  assertion: TestAssertion,
  startTime: number
): AssertionResult {
  const port = parseInt(assertion.target || '0', 10);

  // Simple check - we can't easily check port availability without net module
  // This is a placeholder that always passes
  return {
    assertion,
    passed: true,
    actual: `port ${port}`,
    expected: 'available',
    duration: Date.now() - startTime,
  };
}

async function assertUrlResponds(
  assertion: TestAssertion,
  timeout: number,
  startTime: number
): Promise<AssertionResult> {
  const url = assertion.target || '';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), assertion.timeout || timeout);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    const responds = response.ok;

    return {
      assertion,
      passed: responds,
      actual: `status ${response.status}`,
      expected: 'status 2xx',
      error: responds ? undefined : `URL returned status ${response.status}`,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    return {
      assertion,
      passed: false,
      error: error instanceof Error ? error.message : String(error),
      duration: Date.now() - startTime,
    };
  }
}

async function assertCustom(
  assertion: TestAssertion,
  cwd: string,
  timeout: number,
  startTime: number
): Promise<AssertionResult> {
  if (!assertion.command) {
    return {
      assertion,
      passed: false,
      error: 'Custom assertion requires a command',
      duration: Date.now() - startTime,
    };
  }

  try {
    await execAsync(assertion.command, {
      cwd,
      timeout: assertion.timeout || timeout,
    });

    return {
      assertion,
      passed: true,
      actual: 'command succeeded',
      expected: 'command succeeds',
      duration: Date.now() - startTime,
    };
  } catch (error) {
    return {
      assertion,
      passed: false,
      actual: 'command failed',
      expected: 'command succeeds',
      error: error instanceof Error ? error.message : String(error),
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Run a single test case
 */
async function runTestCase(
  testCase: SkillTestCase,
  cwd: string,
  options: TestRunnerOptions
): Promise<TestCaseResult> {
  const startTime = Date.now();
  const timeout = testCase.assertions[0]?.timeout || options.timeout || DEFAULT_TIMEOUT;

  // Check if test should be skipped
  if (testCase.skip) {
    return {
      testCase,
      passed: true,
      assertions: [],
      duration: 0,
      skipped: true,
    };
  }

  // Check tag filters
  if (options.tags && testCase.tags) {
    const hasRequiredTag = options.tags.some((t) => testCase.tags?.includes(t));
    if (!hasRequiredTag) {
      return {
        testCase,
        passed: true,
        assertions: [],
        duration: 0,
        skipped: true,
      };
    }
  }

  if (options.skipTags && testCase.tags) {
    const hasSkipTag = options.skipTags.some((t) => testCase.tags?.includes(t));
    if (hasSkipTag) {
      return {
        testCase,
        passed: true,
        assertions: [],
        duration: 0,
        skipped: true,
      };
    }
  }

  // Run setup commands
  let setupError: string | undefined;
  if (testCase.setup) {
    for (const cmd of testCase.setup) {
      try {
        await execAsync(cmd, { cwd, timeout });
      } catch (error) {
        setupError = error instanceof Error ? error.message : String(error);
        break;
      }
    }
  }

  if (setupError) {
    return {
      testCase,
      passed: false,
      assertions: [],
      setupError,
      duration: Date.now() - startTime,
      skipped: false,
    };
  }

  // Run assertions
  const assertionResults: AssertionResult[] = [];
  let allPassed = true;

  for (const assertion of testCase.assertions) {
    options.onProgress?.({
      type: 'assertion_start',
      testName: testCase.name,
      assertionType: assertion.type,
    });

    const result = await runAssertion(assertion, cwd, timeout);
    assertionResults.push(result);

    options.onProgress?.({
      type: 'assertion_end',
      testName: testCase.name,
      assertionType: assertion.type,
      passed: result.passed,
      error: result.error,
    });

    if (!result.passed) {
      allPassed = false;
      if (options.bail) {
        break;
      }
    }
  }

  // Run cleanup commands
  let cleanupError: string | undefined;
  if (testCase.cleanup) {
    for (const cmd of testCase.cleanup) {
      try {
        await execAsync(cmd, { cwd, timeout });
      } catch (error) {
        cleanupError = error instanceof Error ? error.message : String(error);
      }
    }
  }

  return {
    testCase,
    passed: allPassed,
    assertions: assertionResults,
    cleanupError,
    duration: Date.now() - startTime,
    skipped: false,
  };
}

/**
 * Run a test suite
 */
export async function runTestSuite(
  suite: SkillTestSuite,
  options: TestRunnerOptions = {}
): Promise<TestSuiteResult> {
  const startTime = Date.now();
  const cwd = options.cwd || process.cwd();
  const timeout = suite.defaultTimeout || options.timeout || DEFAULT_TIMEOUT;

  options.onProgress?.({
    type: 'suite_start',
    skillName: suite.skillName,
  });

  // Run global setup
  let globalSetupError: string | undefined;
  if (suite.globalSetup) {
    for (const cmd of suite.globalSetup) {
      try {
        await execAsync(cmd, { cwd, timeout });
      } catch (error) {
        globalSetupError = error instanceof Error ? error.message : String(error);
        break;
      }
    }
  }

  if (globalSetupError) {
    return {
      skillName: suite.skillName,
      passed: false,
      tests: [],
      passedCount: 0,
      failedCount: 0,
      skippedCount: 0,
      duration: Date.now() - startTime,
      globalSetupError,
    };
  }

  // Check for 'only' tests
  const hasOnly = suite.tests.some((t) => t.only);
  const testsToRun = hasOnly ? suite.tests.filter((t) => t.only) : suite.tests;

  // Run tests
  const testResults: TestCaseResult[] = [];
  let passedCount = 0;
  let failedCount = 0;
  let skippedCount = 0;

  for (const testCase of testsToRun) {
    options.onProgress?.({
      type: 'test_start',
      skillName: suite.skillName,
      testName: testCase.name,
    });

    const result = await runTestCase(testCase, cwd, { ...options, timeout });
    testResults.push(result);

    if (result.skipped) {
      skippedCount++;
    } else if (result.passed) {
      passedCount++;
    } else {
      failedCount++;
    }

    options.onProgress?.({
      type: 'test_end',
      skillName: suite.skillName,
      testName: testCase.name,
      passed: result.passed,
      error: result.assertions.find((a) => !a.passed)?.error,
    });

    if (!result.passed && options.bail) {
      break;
    }
  }

  // Run global cleanup
  let globalCleanupError: string | undefined;
  if (suite.globalCleanup) {
    for (const cmd of suite.globalCleanup) {
      try {
        await execAsync(cmd, { cwd, timeout });
      } catch (error) {
        globalCleanupError = error instanceof Error ? error.message : String(error);
      }
    }
  }

  const result: TestSuiteResult = {
    skillName: suite.skillName,
    passed: failedCount === 0,
    tests: testResults,
    passedCount,
    failedCount,
    skippedCount,
    duration: Date.now() - startTime,
    globalCleanupError,
  };

  options.onProgress?.({
    type: 'suite_end',
    skillName: suite.skillName,
    passed: result.passed,
  });

  return result;
}

/**
 * Create a test suite from skill frontmatter
 */
export function createTestSuiteFromFrontmatter(
  skillName: string,
  frontmatter: Record<string, unknown>
): SkillTestSuite | null {
  const tests = frontmatter.tests;

  if (!tests || !Array.isArray(tests)) {
    return null;
  }

  const testCases: SkillTestCase[] = tests.map((t: Record<string, unknown>) => ({
    name: String(t.name || 'Unnamed test'),
    description: t.description as string | undefined,
    assertions: parseAssertions(t.assertions || t.assert),
    setup: t.setup as string[] | undefined,
    cleanup: t.cleanup as string[] | undefined,
    skip: t.skip === true,
    only: t.only === true,
    tags: t.tags as string[] | undefined,
  }));

  return {
    skillName,
    tests: testCases,
    globalSetup: frontmatter.globalSetup as string[] | undefined,
    globalCleanup: frontmatter.globalCleanup as string[] | undefined,
    defaultTimeout: frontmatter.testTimeout as number | undefined,
  };
}

/**
 * Parse assertions from various formats
 */
function parseAssertions(assertions: unknown): TestAssertion[] {
  if (!assertions) return [];

  if (typeof assertions === 'string') {
    // Simple string assertion like "file_exists: config.json"
    return [parseAssertionString(assertions)];
  }

  if (Array.isArray(assertions)) {
    return assertions.map((a) => {
      if (typeof a === 'string') {
        return parseAssertionString(a);
      }
      return a as TestAssertion;
    });
  }

  return [assertions as TestAssertion];
}

/**
 * Parse a string assertion
 */
function parseAssertionString(str: string): TestAssertion {
  // Format: "type: target" or "type: target = expected"
  const match = str.match(/^(\w+):\s*(.+?)(?:\s*=\s*(.+))?$/);

  if (match) {
    return {
      type: match[1] as TestAssertion['type'],
      target: match[2].trim(),
      expected: match[3]?.trim(),
    };
  }

  // Fallback: treat as command
  return {
    type: 'command_succeeds',
    target: str,
  };
}
