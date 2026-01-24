# SkillKit

[![npm version](https://img.shields.io/npm/v/skillkit.svg)](https://www.npmjs.com/package/skillkit)
[![npm downloads](https://img.shields.io/npm/dm/skillkit.svg)](https://www.npmjs.com/package/skillkit)
[![CI](https://github.com/rohitg00/skillkit/actions/workflows/ci.yml/badge.svg)](https://github.com/rohitg00/skillkit/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

## One CLI. 17 AI Agents. Zero Lock-in.

**Write skills once, use everywhere.** SkillKit is the universal platform that lets your AI coding skills work across Claude Code, Cursor, Codex, Windsurf, GitHub Copilot, and 12 more agents.

```bash
npm install -g skillkit
```

## What's New in v1.6.0

- **Methodology Framework**: 5 ready-to-use development frameworks (Agile, TDD, DevOps, Security-First, Documentation-First) with 13 specialized skills
- **Hooks System**: Event-driven skill triggers - auto-activate on git commits, file changes, builds, tests, deployments
- **Agent Orchestration**: Multi-agent team coordination with leader/teammate roles and task assignment
- **Plan System**: Structured plan creation with validation and execution - parse, validate, and execute development plans
- **Slash Commands**: Generate agent-native commands from natural language for all 17 AI agents
- **Enhanced TUI**: New Methodology (o) and Plan (n) screens with improved navigation

## The Problem

You've built amazing skills for Claude Code. Now you want to try Cursor. Or your team uses different agents. Your options:

1. **Rewrite everything** - each agent has different formats, directories, and conventions
2. **Pick one agent** - lock yourself in, miss out on innovations
3. **Give up on skills** - lose the productivity gains

## The Solution

```bash
# Install a skill for ALL your agents at once
skillkit install anthropics/skills --agent claude-code,cursor,windsurf

# Or translate existing skills between any agents
skillkit translate my-skill --from claude --to cursor,codex,copilot

# Get smart recommendations based on your project
skillkit recommend
# > 92% match: vercel-react-best-practices
# > 87% match: tailwind-v4-patterns
# > 85% match: nextjs-app-router
```

![SkillKit Demo](https://raw.githubusercontent.com/rohitg00/skillkit/main/skillkit.gif)

## What Makes SkillKit Different

| Feature | Without SkillKit | With SkillKit |
|---------|-----------------|---------------|
| **Multi-Agent Support** | Manual rewrite for each agent | One command, all agents |
| **Team Collaboration** | Email skills back and forth | Git-based bundles, remote sync |
| **Skill Discovery** | Search GitHub manually | Smart recommendations for your stack |
| **Format Translation** | Learn each agent's format | Automatic conversion (17 formats) |
| **Context Sync** | Configure each agent separately | One config, synced everywhere |
| **Session Memory** | Knowledge dies with each session | Persistent learning across agents |
| **Skill Testing** | Hope it works | Test framework with assertions |

## 5-Minute Quick Start

```bash
# 1. Install SkillKit globally
npm install -g skillkit

# 2. Launch the interactive TUI (easiest way to start)
skillkit

# Or use CLI commands directly:

# 3. Get personalized skill recommendations
skillkit recommend

# 4. Install skills from the marketplace
skillkit install anthropics/skills

# 5. Sync to your AI agent
skillkit sync
```

## Core Features

### Cross-Agent Translation

Use any skill with any agent. SkillKit automatically converts between formats:

```bash
# Translate a Claude skill to Cursor format
skillkit translate react-patterns --to cursor

# Translate all your skills to a new agent
skillkit translate --all --to windsurf

# Preview translation without writing
skillkit translate my-skill --to codex --dry-run
```

**Supported Agents:** Claude Code, Cursor, Codex, Gemini CLI, OpenCode, Antigravity, Amp, Clawdbot, Droid, GitHub Copilot, Goose, Kilo, Kiro, Roo, Trae, Windsurf, Universal

### Smart Recommendations

SkillKit analyzes your project and suggests the perfect skills:

```bash
skillkit recommend

# Project: my-app (Next.js + TypeScript + Tailwind)
#
# Recommended Skills:
#   92% vercel-react-best-practices
#   87% tailwind-v4-patterns
#   85% nextjs-app-router
#   78% typescript-strict-mode
```

Filter by task, category, or minimum score:

```bash
skillkit recommend --search "auth"        # Task-based search
skillkit recommend --category security    # Category filter
skillkit recommend --min-score 80         # Quality threshold
```

### Session Memory System

Your AI agents learn, but that knowledge dies with the session. SkillKit captures learnings and makes them persistent:

```bash
# Compress session observations into reusable learnings
skillkit memory compress

# Search past learnings
skillkit memory search "authentication patterns"

# Export a learning as a shareable skill
skillkit memory export auth-insight --output auth-patterns.md

# Share memory across projects
skillkit memory --global
```

### Skill Marketplace

Browse and install from curated skill repositories:

```bash
# Browse all available skills
skillkit marketplace

# Search for specific skills
skillkit marketplace search "react hooks"

# Filter by tags
skillkit marketplace --tags typescript,testing

# Refresh the skill index
skillkit marketplace refresh
```

### Interactive TUI

Beautiful terminal interface for visual skill management:

```bash
skillkit ui
# or just
skillkit
```

**Navigation:** `h` Home | `b` Browse | `r` Recommend | `t` Translate | `c` Context | `l` List | `s` Sync | `q` Quit

### Skill Testing Framework

Test your skills with built-in assertions:

```bash
# Run all skill tests
skillkit test

# Test specific skills
skillkit test ./my-skill

# Run tests with specific tags
skillkit test --tags unit,integration

# JSON output for CI
skillkit test --json
```

### Workflow Orchestration

Compose skills into multi-step workflows:

```bash
# List available workflows
skillkit workflow list

# Run a workflow
skillkit workflow run feature-development

# Create new workflow
skillkit workflow create my-workflow
```

### CI/CD Integration

Generate CI/CD templates for automated skill management:

```bash
# GitHub Actions
skillkit cicd github-action

# GitLab CI
skillkit cicd gitlab-ci

# Pre-commit hooks
skillkit cicd pre-commit
```

## Supported Agents (17)

| Agent | Format | Skills Directory |
|-------|--------|------------------|
| Claude Code | SKILL.md | `.claude/skills/` |
| Cursor | MDC (.mdc) | `.cursor/skills/` |
| Codex | SKILL.md | `.codex/skills/` |
| Gemini CLI | SKILL.md | `.gemini/skills/` |
| OpenCode | SKILL.md | `.opencode/skills/` |
| Antigravity | SKILL.md | `.antigravity/skills/` |
| Amp | SKILL.md | `.amp/skills/` |
| Clawdbot | SKILL.md | `skills/` |
| Droid (Factory) | SKILL.md | `.factory/skills/` |
| GitHub Copilot | Markdown | `.github/skills/` |
| Goose | SKILL.md | `.goose/skills/` |
| Kilo Code | SKILL.md | `.kilocode/skills/` |
| Kiro CLI | SKILL.md | `.kiro/skills/` |
| Roo Code | SKILL.md | `.roo/skills/` |
| Trae | SKILL.md | `.trae/skills/` |
| Windsurf | Markdown | `.windsurf/skills/` |
| Universal | SKILL.md | `skills/` |

## All Commands

### Skill Management

```bash
skillkit install <source>     # Install skills from GitHub/GitLab/Bitbucket/local
skillkit remove <skills>      # Remove installed skills
skillkit update [skills]      # Update skills from source
skillkit list                 # List installed skills
skillkit enable <skills>      # Enable specific skills
skillkit disable <skills>     # Disable specific skills
skillkit sync                 # Sync skills to agent config
skillkit read <skills>        # Read skill content for AI
```

### Discovery & Recommendations

```bash
skillkit recommend            # Get smart recommendations
skillkit marketplace          # Browse skill marketplace
skillkit marketplace search   # Search marketplace
```

### Translation & Context

```bash
skillkit translate            # Translate between formats
skillkit context init         # Initialize project context
skillkit context sync         # Sync context to agents
```

### Memory System

```bash
skillkit memory status        # View memory status
skillkit memory search        # Search learnings
skillkit memory compress      # Compress observations
skillkit memory export        # Export as skill
```

### Testing & Workflows

```bash
skillkit test                 # Run skill tests
skillkit workflow run         # Execute workflow
skillkit cicd                 # Generate CI/CD templates
```

### Utilities

```bash
skillkit init                 # Initialize in project
skillkit validate             # Validate skill format
skillkit create               # Create new skill
```

## Creating Skills

### Quick Start

```bash
skillkit create my-skill
```

### Manual Creation

Create a `SKILL.md` file following the [Agent Skills specification](https://agentskills.io/specification):

```markdown
---
name: my-skill
description: What this skill does and when to use it
license: MIT
metadata:
  author: your-name
  version: "1.0"
---

# My Skill

Instructions for the AI agent.

## When to Use
- Scenario 1
- Scenario 2

## Steps
1. First step
2. Second step
```

## Programmatic API

```typescript
import {
  // Skill discovery
  findAllSkills,
  discoverSkills,
  detectAgent,
  getAdapter,

  // Translation
  translateSkill,
  translateSkillFile,

  // Recommendations
  RecommendationEngine,
  analyzeProject,

  // Context
  ContextManager,
  syncToAllAgents,

  // Memory
  createMemoryCompressor,
  createMemoryInjector,
  LearningStore,

  // Marketplace
  createMarketplaceAggregator,

  // Testing
  SkillTestRunner,

  // Workflows
  WorkflowOrchestrator,
} from 'skillkit';

// Example: Translate and install
const skill = await translateSkill(skillContent, 'cursor');
console.log(skill.content);

// Example: Get recommendations
const engine = new RecommendationEngine();
const profile = await analyzeProject('./my-project');
const recs = engine.recommend(profile);
```

## Popular Skill Repositories

| Repository | Description |
|------------|-------------|
| [anthropics/skills](https://github.com/anthropics/skills) | Official Claude Code marketplace - PDF, XLSX, DOCX processing |
| [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | React/Next.js best practices, web design guidelines |

## Installation Options

```bash
# npm (recommended)
npm install -g skillkit

# pnpm
pnpm add -g skillkit

# yarn
yarn global add skillkit

# bun
bun add -g skillkit

# npx (no install)
npx skillkit <command>
```

## Configuration

Create `skillkit.yaml` in your project:

```yaml
version: 1
agent: cursor           # Override auto-detection
autoSync: true          # Auto-sync on changes
enabledSkills:
  - pdf
  - xlsx
disabledSkills:
  - deprecated-skill
```

## Why SkillKit Exists

AI coding agents are amazing, but the ecosystem is fragmented:
- **Skills don't transfer** between agents
- **Knowledge dies** when sessions end
- **No standard** for skill quality or testing
- **Manual discovery** of useful skills

SkillKit solves these problems with a universal platform that works across all major AI coding agents.

## License

Apache License 2.0 - see [LICENSE](LICENSE) for details.

## Contributing

Contributions welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md).

## Links

- [Agent Skills Specification](https://agentskills.io/specification)
- [GitHub Repository](https://github.com/rohitg00/skillkit)
- [NPM Package](https://www.npmjs.com/package/skillkit)
