# SkillKit

Universal skills manager for AI coding agents. Install, manage, and sync skills across 32 AI agents including Claude Code, Cursor, Codex, Gemini CLI, and more.

## Installation

```bash
npm install -g skillkit
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

## Supported Agents (32)

**Primary (17):** Claude Code, Cursor, Codex, Gemini CLI, Windsurf, GitHub Copilot, OpenCode, Antigravity, Amp, Clawdbot, Droid, Goose, Kilo, Kiro, Roo, Trae, Universal

**Extended (15):** Cline, CodeBuddy, CommandCode, Continue, Crush, Factory, MCPJam, Mux, Neovate, OpenHands, Pi, Qoder, Qwen, Vercel, Zencoder

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
