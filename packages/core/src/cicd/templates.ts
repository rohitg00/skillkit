/**
 * CI/CD Templates
 *
 * Provides templates for GitHub Actions, pre-commit hooks, and other CI/CD integrations.
 */

/**
 * GitHub Action workflow for skill validation
 */
export const GITHUB_ACTION_TEMPLATE = `# Skill Validation Workflow
# This workflow validates skills in your repository

name: Validate Skills

on:
  push:
    paths:
      - '.claude/skills/**'
      - '.cursor/skills/**'
      - 'skills/**'
  pull_request:
    paths:
      - '.claude/skills/**'
      - '.cursor/skills/**'
      - 'skills/**'

jobs:
  validate:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install SkillKit
        run: npm install -g skillkit

      - name: Validate Skills
        run: skillkit validate

      - name: Run Skill Tests
        run: skillkit test --json > test-results.json
        continue-on-error: true

      - name: Upload Test Results
        uses: actions/upload-artifact@v4
        with:
          name: skill-test-results
          path: test-results.json
          retention-days: 30

      - name: Check Test Results
        run: |
          if [ -f test-results.json ]; then
            passed=$(cat test-results.json | jq -r '.passed')
            if [ "$passed" = "false" ]; then
              echo "Some skill tests failed"
              exit 1
            fi
          fi
`;

/**
 * Pre-commit hook script for skill validation
 */
export const PRE_COMMIT_HOOK_TEMPLATE = `#!/bin/bash
# SkillKit Pre-commit Hook
# Validates skills before commit

# Colors for output
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[0;33m'
NC='\\033[0m' # No Color

echo -e "\${YELLOW}Running SkillKit validation...\${NC}"

# Check if skillkit is installed
if ! command -v skillkit &> /dev/null; then
    echo -e "\${RED}SkillKit not found. Install with: npm install -g skillkit\${NC}"
    exit 1
fi

# Get list of staged skill files
SKILL_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\\.(md|mdc)$' | grep -E '(skills|.claude|.cursor)')

if [ -z "$SKILL_FILES" ]; then
    echo -e "\${GREEN}No skill files staged, skipping validation.\${NC}"
    exit 0
fi

echo "Validating skill files:"
echo "$SKILL_FILES"

# Run validation
if ! skillkit validate; then
    echo -e "\${RED}Skill validation failed. Please fix the errors and try again.\${NC}"
    exit 1
fi

# Run tests if any
if skillkit test --json 2>/dev/null | jq -e '.passed == false' > /dev/null 2>&1; then
    echo -e "\${RED}Skill tests failed. Please fix the failing tests.\${NC}"
    exit 1
fi

echo -e "\${GREEN}All skills validated successfully!\${NC}"
exit 0
`;

/**
 * Pre-commit config for .pre-commit-config.yaml
 */
export const PRE_COMMIT_CONFIG_TEMPLATE = `# SkillKit Pre-commit Configuration
# Add this to your .pre-commit-config.yaml

repos:
  - repo: local
    hooks:
      - id: skillkit-validate
        name: SkillKit Validate
        entry: skillkit validate
        language: system
        files: \\.(md|mdc)$
        pass_filenames: false

      - id: skillkit-test
        name: SkillKit Test
        entry: skillkit test
        language: system
        files: \\.(md|mdc)$
        pass_filenames: false
`;

/**
 * GitLab CI template
 */
export const GITLAB_CI_TEMPLATE = `# SkillKit GitLab CI Configuration
# Add this to your .gitlab-ci.yml

skill-validation:
  image: node:20
  stage: test
  before_script:
    - npm install -g skillkit
  script:
    - skillkit validate
    - skillkit test --json > test-results.json
  artifacts:
    reports:
      junit: test-results.json
    paths:
      - test-results.json
    expire_in: 30 days
  rules:
    - changes:
        - ".claude/skills/**"
        - ".cursor/skills/**"
        - "skills/**"
`;

/**
 * CircleCI config template
 */
export const CIRCLECI_CONFIG_TEMPLATE = `# SkillKit CircleCI Configuration
# Add this to your .circleci/config.yml

version: 2.1

jobs:
  validate-skills:
    docker:
      - image: cimg/node:20.0
    steps:
      - checkout
      - run:
          name: Install SkillKit
          command: npm install -g skillkit
      - run:
          name: Validate Skills
          command: skillkit validate
      - run:
          name: Run Skill Tests
          command: skillkit test --json > test-results.json
      - store_artifacts:
          path: test-results.json
          destination: skill-tests

workflows:
  skill-validation:
    jobs:
      - validate-skills:
          filters:
            branches:
              only: /.*/
`;

/**
 * Get a CI/CD template by name
 */
export function getCICDTemplate(name: string): string | null {
  switch (name.toLowerCase()) {
    case 'github':
    case 'github-action':
    case 'github-actions':
      return GITHUB_ACTION_TEMPLATE;
    case 'pre-commit':
    case 'pre-commit-hook':
      return PRE_COMMIT_HOOK_TEMPLATE;
    case 'pre-commit-config':
      return PRE_COMMIT_CONFIG_TEMPLATE;
    case 'gitlab':
    case 'gitlab-ci':
      return GITLAB_CI_TEMPLATE;
    case 'circleci':
    case 'circle-ci':
      return CIRCLECI_CONFIG_TEMPLATE;
    default:
      return null;
  }
}

/**
 * List available CI/CD templates
 */
export function listCICDTemplates(): { name: string; description: string }[] {
  return [
    { name: 'github-action', description: 'GitHub Actions workflow for skill validation' },
    { name: 'pre-commit-hook', description: 'Git pre-commit hook script' },
    { name: 'pre-commit-config', description: 'pre-commit framework configuration' },
    { name: 'gitlab-ci', description: 'GitLab CI configuration' },
    { name: 'circleci', description: 'CircleCI configuration' },
  ];
}
