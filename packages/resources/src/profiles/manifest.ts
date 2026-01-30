import type { OperationalProfile, ProfileManifest } from './types.js';

export const BUILTIN_PROFILES: OperationalProfile[] = [
  {
    name: 'dev',
    description: 'Active development mode',
    focus: 'Implementation speed and working solutions',
    behaviors: [
      'Prefer working code over perfect code',
      'Quick iterations with frequent testing',
      'Minimize context switching',
      'Focus on the current task',
    ],
    priorities: ['Functionality', 'Simplicity', 'Testability', 'Speed'],
    preferredTools: ['Edit', 'Write', 'Bash', 'Read'],
    injectedContext: `You are in DEVELOPMENT mode. Focus on:
- Getting working code quickly
- Writing minimal tests for new functionality
- Keeping changes small and focused
- Committing frequently`,
  },
  {
    name: 'review',
    description: 'Code review mode',
    focus: 'Quality, security, and maintainability',
    behaviors: [
      'Thorough analysis before suggesting changes',
      'Security-first mindset',
      'Consider edge cases and failure modes',
      'Provide constructive feedback',
    ],
    priorities: ['Security', 'Code quality', 'Best practices', 'Maintainability'],
    preferredTools: ['Read', 'Grep', 'Glob'],
    avoidTools: ['Edit', 'Write'],
    injectedContext: `You are in REVIEW mode. Focus on:
- Identifying potential bugs and security issues
- Checking code against best practices
- Verifying test coverage
- Suggesting improvements without making changes`,
  },
  {
    name: 'research',
    description: 'Exploration and discovery mode',
    focus: 'Understanding and analysis',
    behaviors: [
      'Deep exploration of codebase',
      'Document findings thoroughly',
      'Consider multiple approaches',
      'Ask clarifying questions',
    ],
    priorities: ['Understanding', 'Documentation', 'Options analysis', 'Learning'],
    preferredTools: ['Read', 'Grep', 'Glob', 'WebSearch', 'WebFetch'],
    avoidTools: ['Edit', 'Write'],
    injectedContext: `You are in RESEARCH mode. Focus on:
- Understanding the codebase structure
- Finding relevant documentation
- Exploring different approaches
- Creating summaries of findings`,
  },
  {
    name: 'security',
    description: 'Security audit mode',
    focus: 'Vulnerability detection and hardening',
    behaviors: [
      'Assume hostile input',
      'Check all authentication and authorization',
      'Look for common vulnerability patterns',
      'Verify encryption and data protection',
    ],
    priorities: ['Security', 'Data protection', 'Authentication', 'Authorization'],
    preferredTools: ['Read', 'Grep', 'Glob', 'Bash'],
    injectedContext: `You are in SECURITY AUDIT mode. Focus on:
- OWASP Top 10 vulnerabilities
- Authentication and authorization flaws
- Data exposure risks
- Injection vulnerabilities
- Secrets and credentials in code`,
  },
];

export const PROFILE_MANIFEST: ProfileManifest = {
  version: 1,
  profiles: BUILTIN_PROFILES,
};
