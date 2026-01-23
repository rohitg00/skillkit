# Contributing to SkillKit

Thank you for your interest in contributing to SkillKit! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+ (recommended) or npm/yarn
- Git

### Setting Up the Development Environment

1. **Fork the repository**

   Click the "Fork" button on GitHub to create your own copy.

2. **Clone your fork**

   ```bash
   git clone https://github.com/YOUR_USERNAME/skillkit.git
   cd skillkit
   ```

3. **Install dependencies**

   ```bash
   pnpm install
   ```

4. **Build the project**

   ```bash
   pnpm build
   ```

5. **Run tests**

   ```bash
   pnpm test
   ```

6. **Link for local development**

   ```bash
   cd apps/skillkit
   pnpm link --global
   ```

   Now you can use `skillkit` command globally to test your changes.

## Project Structure

```
skillkit/
├── apps/
│   └── skillkit/          # Main CLI entry point
├── packages/
│   ├── core/              # @skillkit/core - Shared logic
│   │   ├── discovery/     # Skill discovery
│   │   ├── parser/        # SKILL.md parsing
│   │   ├── translator/    # Cross-agent translation
│   │   ├── context/       # Project context sync
│   │   └── recommend/     # Recommendation engine
│   ├── cli/               # @skillkit/cli - Commands
│   ├── tui/               # @skillkit/tui - Terminal UI
│   └── agents/            # @skillkit/agents - Agent adapters
├── docs/                  # Documentation
└── README.md
```

## Development Workflow

### Branch Naming

Use descriptive branch names:

- `feature/skill-translation` - New features
- `fix/cursor-adapter-path` - Bug fixes
- `docs/api-reference` - Documentation
- `refactor/core-types` - Code refactoring

### Making Changes

1. **Create a new branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**

   - Follow the existing code style
   - Add tests for new functionality
   - Update documentation as needed

3. **Run checks locally**

   ```bash
   # Build all packages
   pnpm build

   # Run tests
   pnpm test

   # Type check
   pnpm typecheck

   # Lint (if configured)
   pnpm lint
   ```

4. **Commit your changes**

   Write clear, descriptive commit messages:

   ```bash
   git commit -m "feat: add skill translation for Windsurf agent"
   git commit -m "fix: resolve path resolution in Windows"
   git commit -m "docs: add API reference for RecommendationEngine"
   ```

   We follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` - New features
   - `fix:` - Bug fixes
   - `docs:` - Documentation changes
   - `refactor:` - Code refactoring
   - `test:` - Adding or updating tests
   - `chore:` - Maintenance tasks

5. **Push your branch**

   ```bash
   git push origin feature/your-feature-name
   ```

6. **Open a Pull Request**

   - Provide a clear description of the changes
   - Reference any related issues
   - Ensure CI checks pass

## Types of Contributions

### Bug Reports

When reporting bugs, please include:

- SkillKit version (`skillkit --version`)
- Node.js version (`node --version`)
- Operating system
- Steps to reproduce
- Expected vs actual behavior
- Relevant error messages or logs

### Feature Requests

For feature requests, please describe:

- The problem you're trying to solve
- Your proposed solution
- Alternative approaches you've considered
- Any relevant examples or mockups

### Adding New Agent Support

To add support for a new AI coding agent:

1. **Create an adapter** in `packages/agents/src/adapters/`

   ```typescript
   // packages/agents/src/adapters/new-agent.ts
   import type { AgentAdapter, Skill } from '../types.js';

   export const newAgentAdapter: AgentAdapter = {
     type: 'new-agent',
     name: 'New Agent',
     configFile: 'AGENTS.md',
     skillsDir: '.new-agent/skills/',
     globalSkillsDir: '~/.new-agent/skills/',

     generateConfig(skills: Skill[]): string {
       // Generate config content
     },

     detectPresence(): boolean {
       // Check if agent is present
     },
   };
   ```

2. **Register the adapter** in `packages/agents/src/adapters/index.ts`

3. **Add translator support** in `packages/core/src/translator/` if the agent uses a unique format

4. **Add tests** for the new adapter

5. **Update documentation**

### Adding New Skills

If you want to contribute skills to the ecosystem:

1. Follow the [Agent Skills specification](https://agentskills.io/specification)
2. Include a `SKILL.md` with proper frontmatter
3. Test with multiple agents using `skillkit translate`
4. Submit to the appropriate skill repository

## Code Style

### TypeScript

- Use TypeScript for all new code
- Define explicit types for function parameters and return values
- Use interfaces for object shapes
- Prefer `const` over `let`

### File Organization

- One export per file when possible
- Group related functionality in directories
- Use `index.ts` files for clean exports

### Testing

- Write unit tests for new functionality
- Use descriptive test names
- Test edge cases and error conditions

```typescript
describe('RecommendationEngine', () => {
  it('should score skills based on framework match', () => {
    // Test implementation
  });

  it('should return empty array when no skills match', () => {
    // Test implementation
  });
});
```

## Pull Request Guidelines

### Before Submitting

- [ ] Code builds without errors (`pnpm build`)
- [ ] All tests pass (`pnpm test`)
- [ ] New code has appropriate test coverage
- [ ] Documentation is updated if needed
- [ ] Commit messages follow conventions

### PR Description Template

```markdown
## Summary

Brief description of the changes.

## Changes

- Change 1
- Change 2

## Testing

How were these changes tested?

## Related Issues

Fixes #123
```

### Review Process

1. A maintainer will review your PR
2. Address any requested changes
3. Once approved, the PR will be merged

## Release Process

Releases are managed by maintainers. The process includes:

1. Version bump in package.json files
2. Changelog update
3. Git tag creation
4. npm publish

## Getting Help

- **GitHub Issues**: For bugs and feature requests
- **Discussions**: For questions and ideas
- **Documentation**: Check the README and docs/

## License

By contributing to SkillKit, you agree that your contributions will be licensed under the Apache License 2.0.

---

Thank you for contributing to SkillKit!
