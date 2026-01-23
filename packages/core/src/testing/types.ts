/**
 * Skill Testing Framework Types
 *
 * Define test cases in skill frontmatter for automated verification.
 */

/**
 * Test assertion types
 */
export type TestAssertionType =
  | 'file_exists'
  | 'file_not_exists'
  | 'file_contains'
  | 'file_not_contains'
  | 'file_matches'
  | 'command_succeeds'
  | 'command_fails'
  | 'command_output_contains'
  | 'json_valid'
  | 'json_has_key'
  | 'yaml_valid'
  | 'type_check'
  | 'lint_passes'
  | 'test_passes'
  | 'env_var_set'
  | 'port_available'
  | 'url_responds'
  | 'custom';

/**
 * Test assertion definition
 */
export interface TestAssertion {
  /** Assertion type */
  type: TestAssertionType;
  /** Target file, command, or URL */
  target?: string;
  /** Expected value or pattern */
  expected?: string | boolean | number;
  /** Custom command for 'custom' type */
  command?: string;
  /** Timeout in milliseconds */
  timeout?: number;
  /** Error message on failure */
  message?: string;
}

/**
 * Test case definition
 */
export interface SkillTestCase {
  /** Test name */
  name: string;
  /** Test description */
  description?: string;
  /** Assertions to run */
  assertions: TestAssertion[];
  /** Setup commands to run before test */
  setup?: string[];
  /** Cleanup commands to run after test */
  cleanup?: string[];
  /** Skip this test */
  skip?: boolean;
  /** Only run this test */
  only?: boolean;
  /** Tags for filtering */
  tags?: string[];
}

/**
 * Test suite for a skill
 */
export interface SkillTestSuite {
  /** Skill name */
  skillName: string;
  /** Test cases */
  tests: SkillTestCase[];
  /** Global setup commands */
  globalSetup?: string[];
  /** Global cleanup commands */
  globalCleanup?: string[];
  /** Default timeout for all tests */
  defaultTimeout?: number;
}

/**
 * Individual assertion result
 */
export interface AssertionResult {
  /** Assertion that was run */
  assertion: TestAssertion;
  /** Whether assertion passed */
  passed: boolean;
  /** Actual value found */
  actual?: string;
  /** Expected value */
  expected?: string;
  /** Error message if failed */
  error?: string;
  /** Duration in milliseconds */
  duration: number;
}

/**
 * Test case result
 */
export interface TestCaseResult {
  /** Test case that was run */
  testCase: SkillTestCase;
  /** Whether all assertions passed */
  passed: boolean;
  /** Individual assertion results */
  assertions: AssertionResult[];
  /** Setup error if any */
  setupError?: string;
  /** Cleanup error if any */
  cleanupError?: string;
  /** Total duration in milliseconds */
  duration: number;
  /** Whether test was skipped */
  skipped: boolean;
}

/**
 * Test suite result
 */
export interface TestSuiteResult {
  /** Skill name */
  skillName: string;
  /** Whether all tests passed */
  passed: boolean;
  /** Individual test results */
  tests: TestCaseResult[];
  /** Number of tests passed */
  passedCount: number;
  /** Number of tests failed */
  failedCount: number;
  /** Number of tests skipped */
  skippedCount: number;
  /** Total duration in milliseconds */
  duration: number;
  /** Global setup error if any */
  globalSetupError?: string;
  /** Global cleanup error if any */
  globalCleanupError?: string;
}

/**
 * Test runner options
 */
export interface TestRunnerOptions {
  /** Working directory */
  cwd?: string;
  /** Default timeout in milliseconds */
  timeout?: number;
  /** Only run tests with these tags */
  tags?: string[];
  /** Skip tests with these tags */
  skipTags?: string[];
  /** Verbose output */
  verbose?: boolean;
  /** Stop on first failure */
  bail?: boolean;
  /** Run tests in parallel */
  parallel?: boolean;
  /** Progress callback */
  onProgress?: (event: TestProgressEvent) => void;
}

/**
 * Test progress event
 */
export interface TestProgressEvent {
  type: 'suite_start' | 'suite_end' | 'test_start' | 'test_end' | 'assertion_start' | 'assertion_end';
  skillName?: string;
  testName?: string;
  assertionType?: TestAssertionType;
  passed?: boolean;
  error?: string;
}
