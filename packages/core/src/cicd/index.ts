/**
 * CI/CD Integration Module
 *
 * Provides templates and utilities for integrating skill validation
 * into CI/CD pipelines.
 */

export * from './templates.js';

export {
  GITHUB_ACTION_TEMPLATE,
  PRE_COMMIT_HOOK_TEMPLATE,
  PRE_COMMIT_CONFIG_TEMPLATE,
  GITLAB_CI_TEMPLATE,
  CIRCLECI_CONFIG_TEMPLATE,
  getCICDTemplate,
  listCICDTemplates,
} from './templates.js';
