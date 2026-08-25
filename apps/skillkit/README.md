# SkillKit

Universal skills manager for AI coding agents. Install, manage, and sync skills across 46 AI agents including Claude Code, Cursor, Codex, Gemini CLI, and more.

## Installation

```bash
# Full install (default) — every feature, everything works:
npm install -g skillkit

# Slim install — core commands only, ~75% smaller, no native addons:
npm install -g skillkit --omit=optional
```

### What's optional

Four power features ship as **optional dependencies** so the core CLI
stays lean. They install automatically with `npm install -g skillkit`,
and are skipped with `--omit=optional`:

| Feature                  | Package              | Command                        |
| ------------------------ | -------------------- | ------------------------------ |
| Interactive terminal UI  | `@skillkit/tui`      | `skillkit ui` / `skillkit tui` |
| REST/OpenAPI server      | `@skillkit/api`      | `skillkit serve`               |
| Peer mesh networking     | `@skillkit/mesh`     | `skillkit mesh …`              |
| Inter-agent messaging    | `@skillkit/messaging`| `skillkit message …`           |

Add one later with `npm install -g @skillkit/tui` (or `api` / `mesh` / `messaging`).

### Using `npx`

`npx skillkit add <owner/repo>` works with zero install. First run pulls
the package into the npx cache (`~/.npm/_npx/`); every subsequent run
from the same cache is instant.

```bash
npx skillkit add anthropics/skills                    # full
npx --omit=optional skillkit add anthropics/skills    # slim, 118 pkgs, 9 s
```

Running `npx` more than a couple of times? Install globally — no
prompt-to-proceed, no refetch on each release:

```bash
npm install -g skillkit --omit=optional
skillkit add anthropics/skills
```

## Quick Start

```bash
# Initialize skillkit in your project
skillkit init

# Install skills from GitHub
skillkit install anthropics/skills

# Get recommendations for your stack
skillkit recommend

# Launch interactive TUI
skillkit ui
```

## Core Features

### Cross-Agent Translation

```bash
# Translate a Claude skill to Cursor format
skillkit translate react-patterns --to cursor

# Translate all skills to multiple agents
skillkit translate --all --to windsurf,codex

# Preview translation
skillkit translate my-skill --to copilot --dry-run
```

### Smart Recommendations

```bash
# Get project-aware suggestions
skillkit recommend

# Filter by task
skillkit recommend --search "authentication"

# Quality threshold
skillkit recommend --min-score 85
```

### Team Collaboration

```bash
# Initialize team
skillkit team init --name "Engineering Team"

# Create skill bundle
skillkit team bundle-create

# Share with team
skillkit team share onboarding-bundle

# Sync with remote registry
skillkit team sync
```

### Plugin System

```bash
# List installed plugins
skillkit plugin list

# Install custom plugin
skillkit plugin install @company/custom-translator

# View plugin info
skillkit plugin info my-plugin
```

### Development Methodologies

```bash
# List available methodologies
skillkit methodology list

# Load TDD methodology
skillkit methodology load tdd

# Apply to project
skillkit methodology apply agile
```

### Plan System

```bash
# Parse and validate plan
skillkit plan parse ./implementation-plan.md
skillkit plan validate ./plan.md

# Execute plan
skillkit plan execute ./feature-plan.md

# Check status
skillkit plan status
```

### Hooks & Automation

```bash
# List hooks
skillkit hook list

# Register pre-commit hook
skillkit hook register pre-commit

# Trigger manually
skillkit hook trigger pre-commit
```

### Workflow Orchestration

```bash
# List workflows
skillkit workflow list

# Run workflow
skillkit workflow run feature-development

# Create new workflow
skillkit workflow create deployment-flow
```

### Session Memory

```bash
# View learnings
skillkit memory list

# Search past sessions
skillkit memory search "error handling"

# Compress observations
skillkit memory compress

# Export learning as skill
skillkit memory export auth-insight --output auth-skill.md
```

## Supported Agents (47)

**Primary (19):** Claude Code, Cursor, Codex, Gemini CLI, Windsurf, GitHub Copilot, OpenCode, Antigravity, Amp, Clawdbot, OpenClaw, Droid, Goose, Hermes Agent, Kilo, Kiro, Roo, Trae, Universal

**Extended (27):** Aider, Amazon Q, Augment Code, Bolt, Cline, CodeBuddy, CodeGPT, CommandCode, Continue, Crush, Devin, Factory, Lovable, MCPJam, Mux, Neovate, OpenHands, Pi, PlayCode Agent, Qoder, Qwen, Replit Agent, Sourcegraph Cody, Tabby, Tabnine, Vercel, Zencoder

## Usage Examples

### Install and Sync

```bash
# Install to multiple agents
skillkit install anthropics/skills --agent claude-code,cursor

# Sync all skills to detected agents
skillkit sync --all
```

### Context Management

```bash
# Initialize project context
skillkit context init

# View detected stack
skillkit context show

# Sync to all agents
skillkit context sync --all
```

### Testing

```bash
# Run all skill tests
skillkit test

# Test specific skills
skillkit test ./my-skill --tags unit

# CI/CD integration
skillkit cicd init
```

## Documentation

Full documentation: https://github.com/rohitg00/skillkit

## License

Apache-2.0
