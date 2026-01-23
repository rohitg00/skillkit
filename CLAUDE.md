# SkillKit - Universal AI Agent Skills Platform

## Project Overview

SkillKit is a CLI tool and ecosystem for managing skills across multiple AI coding agents. It provides:
- Universal skill discovery and installation from GitHub repositories
- Cross-agent skill translation (17+ agents supported)
- Project context synchronization across agents
- Interactive TUI for skill management

## Architecture

```
skillkit/
├── packages/
│   ├── core/           # @skillkit/core - Shared logic
│   │   ├── src/
│   │   │   ├── context/      # Project context detection & sync
│   │   │   ├── translator/   # Cross-agent translation
│   │   │   ├── skills.ts     # Skill discovery
│   │   │   └── types.ts      # Shared types
│   ├── cli/            # @skillkit/cli - Command line
│   ├── tui/            # @skillkit/tui - Terminal UI
│   └── agents/         # @skillkit/agents - Agent configs
├── apps/
│   └── skillkit/       # Main CLI entry point
└── turbo.json          # Turborepo config
```

## Supported Agents (17)

| Agent | Format | Skills Directory |
|-------|--------|------------------|
| claude-code | SKILL.md | `.claude/skills/` |
| cursor | MDC (.mdc) | `.cursor/skills/` |
| codex | SKILL.md | `.codex/skills/` |
| gemini-cli | SKILL.md | `.gemini/skills/` |
| opencode | SKILL.md | `.opencode/skills/` |
| antigravity | SKILL.md | `.antigravity/skills/` |
| amp | SKILL.md | `.amp/skills/` |
| clawdbot | SKILL.md | `.clawdbot/skills/` |
| droid | SKILL.md | `.factory/skills/` |
| github-copilot | Markdown | `.github/skills/` |
| goose | SKILL.md | `.goose/skills/` |
| kilo | SKILL.md | `.kilocode/skills/` |
| kiro-cli | SKILL.md | `.kiro/skills/` |
| roo | SKILL.md | `.roo/skills/` |
| trae | SKILL.md | `.trae/skills/` |
| windsurf | Markdown | `.windsurf/skills/` |
| universal | SKILL.md | `skills/` |

## Implementation Status

### Phase 1: Monorepo Foundation ✅ COMPLETE
- [x] Monorepo structure with pnpm workspaces
- [x] Turborepo configuration for builds
- [x] Package structure (@skillkit/core, cli, tui, agents)
- [x] Shared types and configurations

### Phase 2: Universal Skill Translator ✅ COMPLETE
- [x] TranslatorRegistry with format detection
- [x] SkillMdTranslator (SKILL.md format for 13 agents)
- [x] CursorTranslator (MDC format with globs, alwaysApply)
- [x] WindsurfTranslator (Markdown rules)
- [x] CopilotTranslator (GitHub Copilot format)
- [x] Cross-format translation (any-to-any via canonical form)
- [x] 97 translator tests passing

### Phase 3: Project Context Sync ✅ COMPLETE
- [x] ProjectDetector - Analyzes package.json, configs, file structure
- [x] ContextManager - Manages .skillkit/context.yaml
- [x] ContextSync - Syncs skills across detected agents
- [x] Stack detection (languages, frameworks, styling, testing, databases)
- [x] 73 context tests passing

### Phase 4: Smart Recommendations ✅ COMPLETE
- [x] Recommendation engine based on project profile
- [x] Task-based skill search
- [x] Skill freshness checking via marketplace
- [x] Enhanced TUI with recommendations

### Phase 5: Quality & Testing ✅ COMPLETE
- [x] Skill testing framework with assertions
- [x] Test runner in CLI (`skillkit test`)
- [x] CI integration templates (GitHub Actions, GitLab CI, CircleCI)
- [x] Pre-commit hook support

### Phase 6: Workflows & Composition ✅ COMPLETE
- [x] Workflow parser and orchestrator
- [x] Multi-wave skill execution
- [x] Workflow CLI commands (`skillkit workflow`)
- [x] Conditional execution support

### Phase 7: Session Memory System ✅ COMPLETE
- [x] Observation capture and storage
- [x] Learning compression with rule-based engine
- [x] Cross-agent memory injection
- [x] Memory CLI commands (`skillkit memory`)
- [x] Global and project-scoped memory
- [x] Learning export as skills

### Phase 8: Skill Marketplace ✅ COMPLETE
- [x] Marketplace aggregator from multiple sources
- [x] Skill search and filtering
- [x] Tag-based discovery
- [x] Cache management with TTL
- [x] TUI marketplace browser

## Key Files

### Core Package
- `packages/core/src/translator/` - Universal skill translator (97 tests)
- `packages/core/src/context/` - Project context detection & sync (73 tests)
- `packages/core/src/recommend/` - Smart recommendation engine
- `packages/core/src/memory/` - Session memory system (compressor, injector, stores)
- `packages/core/src/marketplace/` - Skill marketplace aggregator
- `packages/core/src/testing/` - Skill testing framework
- `packages/core/src/workflow/` - Workflow orchestrator
- `packages/core/src/executor/` - Skill execution engine
- `packages/core/src/cicd/` - CI/CD templates
- `packages/core/src/session/` - Session management (pause/resume)

### CLI Commands
- `packages/cli/src/commands/memory.ts` - Memory management command
- `packages/cli/src/commands/marketplace.ts` - Marketplace browser
- `packages/cli/src/commands/test.ts` - Test runner
- `packages/cli/src/commands/workflow/` - Workflow commands
- `packages/cli/src/commands/cicd.ts` - CI/CD template generator

### Test Suites
- Total: 346+ tests passing across all modules

## Commands

```bash
# Development
pnpm install          # Install dependencies
pnpm build            # Build all packages
pnpm test             # Run all tests
pnpm dev              # Development mode

# CLI Usage
skillkit install <repo>   # Install skills from GitHub
skillkit list             # List installed skills
skillkit sync             # Sync skills to all agents
skillkit translate        # Translate skill to another format
skillkit tui              # Launch interactive TUI
```

## Technical Notes

### Translation Flow
```
Source Format → parse() → CanonicalSkill → generate() → Target Format
```

### CanonicalSkill Interface
```typescript
interface CanonicalSkill {
  name: string;
  description?: string;
  version?: string;
  author?: string;
  tags?: string[];
  globs?: string[];
  alwaysApply?: boolean;
  content: string;
  metadata?: Record<string, unknown>;
}
```

### Context YAML Schema
```yaml
version: 1
project:
  name: string
  type: web-app | api | cli | library | unknown
stack:
  languages: Detection[]
  frameworks: Detection[]
  libraries: Detection[]
  styling: Detection[]
  testing: Detection[]
  databases: Detection[]
  tools: Detection[]
  runtime: Detection[]
agents:
  detected: AgentType[]
  synced: AgentType[]
```

## Next Steps (Future Enhancements)

1. **API-Based Compression**
   - LLM-powered learning extraction (Anthropic/OpenAI)
   - Smarter pattern recognition
   - Automatic skill generation from learnings

2. **Skill Quality Scoring**
   - Automated quality metrics
   - Community ratings
   - Usage analytics

3. **Team Collaboration**
   - Shared memory pools
   - Team skill bundles
   - Permission management

4. **Plugin System**
   - Custom translators
   - Agent adapters
   - Memory backends
