# SkillKit - Universal AI Agent Skills Platform

## Project Overview

SkillKit is a CLI tool and ecosystem for managing skills across multiple AI coding agents. It provides:
- Universal skill discovery and installation from GitHub repositories
- Cross-agent skill translation (17+ agents supported)
- Project context synchronization across agents
- Interactive TUI for skill management
- Team collaboration and skill sharing
- Extensible plugin system

## Architecture

```
skillkit/
├── packages/
│   ├── core/           # @skillkit/core - Shared logic
│   │   ├── src/
│   │   │   ├── context/      # Project context detection & sync
│   │   │   ├── translator/   # Cross-agent translation
│   │   │   ├── recommend/    # Smart recommendations
│   │   │   ├── memory/       # Session memory system
│   │   │   ├── marketplace/  # Skill marketplace
│   │   │   ├── testing/      # Skill testing framework
│   │   │   ├── workflow/     # Workflow orchestrator
│   │   │   ├── executor/     # Skill execution engine
│   │   │   ├── team/         # Team collaboration
│   │   │   ├── plugins/      # Plugin system
│   │   │   ├── cicd/         # CI/CD templates
│   │   │   └── session/      # Session management
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

### Phase 3: Project Context Sync ✅ COMPLETE
- [x] ProjectDetector - Analyzes package.json, configs, file structure
- [x] ContextManager - Manages .skillkit/context.yaml
- [x] ContextSync - Syncs skills across detected agents
- [x] Stack detection (languages, frameworks, styling, testing, databases)

### Phase 4: Smart Recommendations ✅ COMPLETE
- [x] RecommendationEngine with project profile matching
- [x] Task-based skill search with relevance scoring
- [x] Skill freshness checking
- [x] Quality scoring (popularity, freshness, compatibility)
- [x] TUI Recommend screen

### Phase 5: Quality & Testing ✅ COMPLETE
- [x] Skill testing framework with 18 assertion types
- [x] Test runner (`skillkit test`)
- [x] CI/CD templates (GitHub Actions, GitLab CI)
- [x] Setup/cleanup/global hooks
- [x] Test filtering (tags, skip, only)

### Phase 6: Workflows & Composition ✅ COMPLETE
- [x] Workflow YAML schema
- [x] Wave-based orchestration (parallel/sequential)
- [x] WorkflowOrchestrator with pause/resume/cancel
- [x] Pre/post hooks and environment variables
- [x] TUI Workflow screen

### Phase 7: Session Memory System ✅ COMPLETE
- [x] SessionManager for cross-agent learning
- [x] Memory compressor (rule-based + API fallback)
- [x] Learning store for skill observations
- [x] Memory index for fast lookups
- [x] Memory CLI commands
- [x] TUI Memory screen

### Phase 8: Skill Marketplace ✅ COMPLETE
- [x] Marketplace aggregator from multiple sources
- [x] Provider system (GitHub, GitLab, Bitbucket, Local)
- [x] Skill search and filtering
- [x] Cache management with TTL
- [x] TUI Marketplace screen

### Phase 9: Skill Execution Engine ✅ COMPLETE
- [x] Task-based execution with checkpoints
- [x] Auto/manual execution modes
- [x] Checkpoint types: decision, review, verification
- [x] Dry-run mode
- [x] Git commit integration
- [x] TUI Execute screen

### Phase 10: Team Collaboration ✅ COMPLETE
- [x] TeamManager for skill sharing
- [x] Team registry with sync support
- [x] Skill bundles (create, export, import)
- [x] Team CLI commands (`skillkit team`)
- [x] TUI Team screen

### Phase 11: Plugin System ✅ COMPLETE
- [x] PluginManager with lifecycle hooks
- [x] Plugin loader (files, npm packages, directories)
- [x] TranslatorPlugin - Add custom agent formats
- [x] ProviderPlugin - Add custom skill sources
- [x] CommandPlugin - Add custom CLI commands
- [x] Plugin CLI commands (`skillkit plugin`)
- [x] TUI Plugins screen

## Key Files

### Core Package
- `packages/core/src/translator/` - Universal skill translator
- `packages/core/src/context/` - Project context detection & sync
- `packages/core/src/recommend/` - Smart recommendation engine
- `packages/core/src/memory/` - Session memory system
- `packages/core/src/marketplace/` - Skill marketplace aggregator
- `packages/core/src/testing/` - Skill testing framework
- `packages/core/src/workflow/` - Workflow orchestrator
- `packages/core/src/executor/` - Skill execution engine
- `packages/core/src/team/` - Team collaboration (manager, bundle)
- `packages/core/src/plugins/` - Plugin system (manager, loader)
- `packages/core/src/cicd/` - CI/CD templates
- `packages/core/src/session/` - Session management

### CLI Commands
- `skillkit install <repo>` - Install skills from GitHub
- `skillkit list` - List installed skills
- `skillkit sync` - Sync skills to all agents
- `skillkit translate` - Translate skill to another format
- `skillkit recommend` - Get skill recommendations
- `skillkit test` - Run skill tests
- `skillkit workflow run|list|create` - Workflow management
- `skillkit memory list|search|export` - Memory management
- `skillkit marketplace search|install` - Marketplace browser
- `skillkit team init|share|import|list|sync|bundle-*` - Team collaboration
- `skillkit plugin list|install|uninstall|enable|disable` - Plugin management
- `skillkit cicd init` - Initialize CI/CD templates
- `skillkit settings` - Manage settings
- `skillkit tui` - Launch interactive TUI

### TUI Screens
- Home, Marketplace, Browse, Installed
- Workflow, Execute, History
- Team, Plugins
- Recommend, Translate, Context, Memory
- Sync, Settings

### Test Suites
- Total: 359 tests passing across all modules

## Commands

```bash
# Development
pnpm install          # Install dependencies
pnpm build            # Build all packages
pnpm test             # Run all tests
pnpm dev              # Development mode

# CLI Usage
skillkit install <repo>              # Install skills from GitHub
skillkit list                        # List installed skills
skillkit sync                        # Sync skills to all agents
skillkit translate                   # Translate skill to another format
skillkit recommend                   # Get recommendations
skillkit test                        # Run skill tests
skillkit workflow run <file>         # Run a workflow
skillkit memory list                 # List learnings
skillkit team init --name "Team"     # Initialize team
skillkit team bundle-create          # Create skill bundle
skillkit plugin list                 # List plugins
skillkit tui                         # Launch interactive TUI
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

### Plugin Interface
```typescript
interface Plugin {
  metadata: PluginMetadata;
  hooks?: PluginHooks;
  translators?: TranslatorPlugin[];
  providers?: ProviderPlugin[];
  commands?: CommandPlugin[];
  init?: (context: PluginContext) => Promise<void>;
  destroy?: () => Promise<void>;
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

## Future Enhancements

1. **API-Based Compression Enhancement**
   - LLM-powered learning extraction (Anthropic/OpenAI)
   - Smarter pattern recognition
   - Automatic skill generation from learnings

2. **Plugin Marketplace**
   - Plugin discovery and registry
   - Plugin dependency resolution
   - Automatic updates

3. **Advanced Testing**
   - Snapshot testing for skill outputs
   - Performance regression testing
   - Multi-agent compatibility testing

4. **Team Analytics**
   - Usage tracking and metrics
   - Skill popularity within teams
   - Collaboration insights
