# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SkillKit is a universal skills loader for AI coding agents. It enables AI assistants (Claude Code, Cursor, Codex, Gemini CLI, etc.) to discover and invoke reusable skills through a common format.

## Commands

```bash
# Build
npm run build          # Build with tsup (outputs to dist/)
npm run dev            # Watch mode build

# Test
npm test               # Run all tests
npm run test:watch     # Watch mode
npm run test:coverage  # With coverage report

# Type checking
npm run typecheck      # tsc --noEmit

# Run single test file
npx vitest run tests/skills.test.ts

# Run tests matching pattern
npx vitest run -t "should parse"

# Test CLI locally
node dist/cli.js --help
node dist/cli.js init --list
```

## Architecture

### Module Structure

```
src/
├── agents/      # Agent adapters - one per AI tool (7 total)
├── commands/    # CLI commands using Clipanion (8 commands)
├── providers/   # Git provider adapters (GitHub, GitLab, Bitbucket, Local)
├── core/        # Business logic (types.ts, skills.ts, config.ts)
├── cli.ts       # Clipanion CLI entry point
└── index.ts     # Public API exports
```

### Key Patterns

**Adapter Pattern**: Both agents and providers implement strict interfaces:
- `AgentAdapter`: `generateConfig()`, `parseConfig()`, `isDetected()`
- `GitProviderAdapter`: `parseSource()`, `matches()`, `clone()`

**Zod Validation**: All data structures use Zod schemas in `core/types.ts`:
- `SkillFrontmatter` - SKILL.md YAML validation
- `SkillMetadata` - Installation tracking (.skillkit.json)
- `AgentType`, `GitProvider` - Type-safe enums

**Provider Detection Order**: Local → GitLab → Bitbucket → GitHub (important: GitHub catches `owner/repo` shorthand as fallback)

### Adding New Agent

1. Create `src/agents/my-agent.ts` implementing `AgentAdapter`
2. Export from `src/agents/index.ts`
3. Add to `adapters` record and `AgentType` enum in `core/types.ts`

### Adding New Provider

1. Create `src/providers/my-provider.ts` implementing `GitProviderAdapter`
2. Export from `src/providers/index.ts`
3. Add to `providers` array (order matters for detection)
4. Add to `GitProvider` enum in `core/types.ts`

## Skill Format

Skills are directories with a `SKILL.md` file:

```yaml
---
name: my-skill           # lowercase-with-hyphens
description: Brief desc  # 10-500 chars required
---
# Markdown instructions
```

Metadata stored in `.skillkit.json` alongside SKILL.md tracks source, installation date, and enabled state.

## CLI Framework

Commands use Clipanion with this pattern:

```typescript
export class MyCommand extends Command {
  static override paths = [['mycommand'], ['mc']];  // name + alias

  arg = Option.String({ required: true });
  flag = Option.String('--flag,-f', { description: '...' });

  async execute(): Promise<number> {
    // Return 0 for success, 1 for failure
  }
}
```

Register in `cli.ts` via `cli.register(MyCommand)`.
