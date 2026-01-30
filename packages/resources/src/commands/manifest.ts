import type { CommandTemplate, CommandManifest } from './types.js';

export const COMMAND_TEMPLATES: CommandTemplate[] = [
  {
    id: 'tdd',
    name: 'TDD Workflow',
    description: 'Test-Driven Development workflow: RED → GREEN → REFACTOR',
    category: 'testing',
    trigger: '/tdd',
    agent: 'tdd-guide',
    prompt: `Start TDD workflow for the requested feature or fix.

Follow the RED → GREEN → REFACTOR cycle:

1. **RED**: Write a failing test that describes the expected behavior
2. **GREEN**: Write the minimum code needed to pass the test
3. **REFACTOR**: Improve the code while keeping tests green

Guidelines:
- One test at a time
- Tests should be small and focused
- Commit after each GREEN phase
- Keep refactoring incremental

Start by asking: What behavior should we test first?`,
    examples: [
      '/tdd add validation to user form',
      '/tdd implement search functionality',
    ],
  },
  {
    id: 'plan',
    name: 'Implementation Planning',
    description: 'Create a detailed implementation plan before coding',
    category: 'planning',
    trigger: '/plan',
    agent: 'planner',
    prompt: `Create an implementation plan for the requested feature or change.

Include:
1. Requirements analysis
2. Current state assessment
3. Proposed approach with alternatives
4. Step-by-step implementation tasks
5. Risk assessment and mitigations
6. Verification criteria

Wait for plan approval before any implementation.`,
    examples: [
      '/plan add user authentication',
      '/plan refactor payment module',
    ],
  },
  {
    id: 'e2e',
    name: 'E2E Test Generation',
    description: 'Generate and run end-to-end tests with Playwright',
    category: 'testing',
    trigger: '/e2e',
    agent: 'e2e-runner',
    prompt: `Generate E2E tests for the specified user journey.

Process:
1. Analyze the user flow to test
2. Generate Playwright test code
3. Run the test
4. Capture screenshots/videos if needed
5. Report results

Focus on testing critical user paths with reliable selectors.`,
    examples: [
      '/e2e test user login flow',
      '/e2e test checkout process',
    ],
  },
  {
    id: 'learn',
    name: 'Extract Learnings',
    description: 'Extract reusable patterns from the current session',
    category: 'learning',
    trigger: '/learn',
    prompt: `Analyze the current session and extract reusable patterns.

Look for:
1. Error fixes that could apply to similar situations
2. Workarounds for library/framework quirks
3. Effective debugging approaches
4. Project-specific conventions discovered

Format each learning as:
- Problem: What issue was encountered
- Solution: How it was resolved
- Context: When this applies
- Example: Code snippet if relevant

Ask for approval before saving patterns.`,
    examples: [
      '/learn from this debugging session',
      '/learn extract patterns from recent fixes',
    ],
  },
  {
    id: 'build-fix',
    name: 'Build Error Resolution',
    description: 'Fix build errors with minimal changes',
    category: 'development',
    trigger: '/build-fix',
    agent: 'build-error-resolver',
    prompt: `Fix the current build/type errors.

Process:
1. Run the build to capture all errors
2. Analyze each error's root cause
3. Apply minimal fixes (no refactoring)
4. Verify the build passes
5. Run tests to ensure no regressions

Focus on getting the build green quickly with the smallest possible changes.`,
    examples: [
      '/build-fix',
      '/build-fix typescript errors',
    ],
  },
  {
    id: 'code-review',
    name: 'Code Review',
    description: 'Review code changes for quality and security',
    category: 'review',
    trigger: '/code-review',
    agent: 'code-reviewer',
    prompt: `Review the specified code changes.

Check for:
1. Correctness and edge cases
2. Security vulnerabilities
3. Performance issues
4. Code quality and maintainability
5. Test coverage

Provide actionable feedback prioritized by severity.`,
    examples: [
      '/code-review recent changes',
      '/code-review src/auth/',
    ],
  },
  {
    id: 'security-review',
    name: 'Security Review',
    description: 'Audit code for security vulnerabilities',
    category: 'review',
    trigger: '/security-review',
    agent: 'security-reviewer',
    prompt: `Perform a security audit of the specified code.

Check for:
1. OWASP Top 10 vulnerabilities
2. Hardcoded secrets or credentials
3. Input validation issues
4. Authentication/authorization flaws
5. Data exposure risks

Report findings with severity and remediation steps.`,
    examples: [
      '/security-review',
      '/security-review src/api/',
    ],
  },
  {
    id: 'checkpoint',
    name: 'Create Checkpoint',
    description: 'Create a verification checkpoint for current state',
    category: 'workflow',
    trigger: '/checkpoint',
    prompt: `Create a checkpoint to verify the current implementation state.

1. Summarize changes made so far
2. Run all relevant tests
3. Check build status
4. Note any pending issues
5. Save context for potential recovery

This helps ensure work can be resumed or rolled back if needed.`,
    examples: [
      '/checkpoint before major refactor',
      '/checkpoint feature complete',
    ],
  },
  {
    id: 'verify',
    name: 'Verification Loop',
    description: 'Run comprehensive verification of recent changes',
    category: 'workflow',
    trigger: '/verify',
    prompt: `Run verification loop for recent changes.

Steps:
1. Type check (tsc --noEmit)
2. Lint check (eslint)
3. Unit tests
4. Build verification
5. Integration tests (if applicable)

Report status and any failures that need attention.`,
    examples: [
      '/verify',
      '/verify all',
    ],
  },
  {
    id: 'cleanup',
    name: 'Code Cleanup',
    description: 'Remove dead code and consolidate duplicates',
    category: 'development',
    trigger: '/cleanup',
    agent: 'refactor-cleaner',
    prompt: `Analyze and clean up the codebase.

1. Run dead code analysis (knip, ts-prune)
2. Identify unused exports and dependencies
3. Find duplicate code patterns
4. Remove with verification
5. Update imports as needed

Make incremental changes with tests passing at each step.`,
    examples: [
      '/cleanup',
      '/cleanup src/utils/',
    ],
  },
];

export const COMMAND_MANIFEST: CommandManifest = {
  version: 1,
  commands: COMMAND_TEMPLATES,
};
