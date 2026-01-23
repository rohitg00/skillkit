/**
 * Skill Testing Framework
 *
 * Provides test case definitions and a test runner for skill verification.
 *
 * @example
 * ```yaml
 * # In skill frontmatter
 * tests:
 *   - name: "Creates config file"
 *     assertions:
 *       - type: file_exists
 *         target: config.json
 *   - name: "Valid JSON output"
 *     assertions:
 *       - type: json_valid
 *         target: config.json
 *   - name: "Types check"
 *     assertions:
 *       - type: type_check
 * ```
 */

export * from './types.js';
export * from './runner.js';

export {
  runTestSuite,
  createTestSuiteFromFrontmatter,
} from './runner.js';

export type {
  TestAssertionType,
  TestAssertion,
  SkillTestCase,
  SkillTestSuite,
  AssertionResult,
  TestCaseResult,
  TestSuiteResult,
  TestRunnerOptions,
  TestProgressEvent,
} from './types.js';
