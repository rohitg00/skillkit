import type { Guideline, GuidelineManifest } from './types.js';

export const BUILTIN_GUIDELINES: Guideline[] = [
  {
    id: 'security',
    name: 'Security Guidelines',
    description: 'Security best practices and vulnerability prevention',
    category: 'security',
    priority: 10,
    enabled: true,
    scope: 'global',
    content: `## Security Guidelines

### Input Validation
- Validate all user input on the server side
- Use allowlists over denylists when possible
- Sanitize data before use in queries, commands, or output

### Authentication & Authorization
- Never store passwords in plain text
- Use secure session management
- Implement proper authorization checks on every endpoint
- Use HTTPS for all communications

### Data Protection
- Encrypt sensitive data at rest and in transit
- Never log sensitive information
- Use environment variables for secrets
- Implement proper access controls

### Common Vulnerabilities to Prevent
- SQL Injection: Use parameterized queries
- XSS: Encode output, use CSP headers
- CSRF: Use anti-CSRF tokens
- Command Injection: Avoid shell commands with user input`,
  },
  {
    id: 'code-style',
    name: 'Code Style Guidelines',
    description: 'Code formatting and style conventions',
    category: 'code-style',
    priority: 7,
    enabled: true,
    scope: 'global',
    content: `## Code Style Guidelines

### Naming Conventions
- Use descriptive, meaningful names
- camelCase for variables and functions
- PascalCase for classes and types
- SCREAMING_SNAKE_CASE for constants

### Code Organization
- One concept per file
- Group related code together
- Keep files under 300 lines when practical
- Use barrel exports (index.ts) for public APIs

### Functions
- Single responsibility principle
- Keep functions under 30 lines when practical
- Use early returns to reduce nesting
- Avoid side effects in pure functions

### Comments
- Don't comment obvious code
- Explain "why" not "what"
- Keep comments up to date
- Use JSDoc for public APIs`,
  },
  {
    id: 'testing',
    name: 'Testing Guidelines',
    description: 'Testing best practices and coverage requirements',
    category: 'testing',
    priority: 8,
    enabled: true,
    scope: 'global',
    content: `## Testing Guidelines

### Test Coverage
- Aim for 80%+ code coverage
- 100% coverage for critical paths
- Don't sacrifice quality for coverage metrics

### Test Structure
- Arrange, Act, Assert (AAA) pattern
- One concept per test
- Descriptive test names that explain behavior
- Independent tests (no shared state)

### Test Types
- Unit tests for business logic
- Integration tests for component interactions
- E2E tests for critical user flows

### Test Quality
- Tests should be deterministic
- Fast execution (< 100ms for unit tests)
- Easy to understand and maintain
- Test behavior, not implementation`,
  },
  {
    id: 'git',
    name: 'Git Workflow Guidelines',
    description: 'Version control best practices',
    category: 'git',
    priority: 6,
    enabled: true,
    scope: 'global',
    content: `## Git Workflow Guidelines

### Commits
- Write clear, concise commit messages
- Use conventional commits format
- One logical change per commit
- Don't commit generated files or secrets

### Branches
- Use feature branches
- Keep branches short-lived
- Delete branches after merge
- Protect main/master branch

### Pull Requests
- Keep PRs focused and small
- Write meaningful descriptions
- Request reviews from appropriate people
- Address all review comments

### Commit Message Format
\`\`\`
<type>(<scope>): <description>

[optional body]

[optional footer]
\`\`\`

Types: feat, fix, docs, style, refactor, test, chore`,
  },
  {
    id: 'performance',
    name: 'Performance Guidelines',
    description: 'Performance optimization best practices',
    category: 'performance',
    priority: 5,
    enabled: true,
    scope: 'global',
    content: `## Performance Guidelines

### General Principles
- Measure before optimizing
- Optimize critical paths first
- Consider time/space tradeoffs
- Profile in production-like environments

### Database
- Use indexes appropriately
- Avoid N+1 queries
- Paginate large result sets
- Cache frequently accessed data

### Frontend
- Minimize bundle size
- Lazy load when appropriate
- Optimize images and assets
- Use efficient rendering patterns

### Backend
- Use connection pooling
- Implement appropriate caching
- Async operations where beneficial
- Monitor and alert on performance`,
  },
];

export const GUIDELINE_MANIFEST: GuidelineManifest = {
  version: 1,
  guidelines: BUILTIN_GUIDELINES,
};
