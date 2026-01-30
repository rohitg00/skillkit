<div align="center">

```
██ SKILLKIT
```
</div>

**Universal Skills for AI Coding Agents**

[![npm version](https://img.shields.io/npm/v/skillkit.svg)](https://www.npmjs.com/package/skillkit)
[![npm downloads](https://img.shields.io/npm/dm/skillkit.svg)](https://www.npmjs.com/package/skillkit)
[![GitHub Package](https://img.shields.io/badge/GitHub%20Package-@rohitg00/skillkit-blue?logo=github)](https://github.com/rohitg00/skillkit/pkgs/npm/skillkit)
[![CI](https://github.com/rohitg00/skillkit/actions/workflows/ci.yml/badge.svg)](https://github.com/rohitg00/skillkit/actions/workflows/ci.yml)
[![Website](https://img.shields.io/badge/Website-agenstskills.com-black)](https://agenstskills.com)
[![Docs](https://img.shields.io/badge/Docs-agenstskills.com/docs-blue)](https://agenstskills.com/docs)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

## Supercharge Every AI Coding Agent

**Give your AI agents new abilities with portable, reusable skills.** Install from a curated marketplace, create your own, and use them across Claude Code, Cursor, Codex, Windsurf, GitHub Copilot, and 27 more agents (32 total).

> **What are AI Agent Skills?** Skills are instruction files that teach AI coding agents how to handle specific tasks - like processing PDFs, following React best practices, or enforcing security patterns. Think of them as plugins for your AI assistant.

```bash
npm install -g skillkit
```

## Why SkillKit?

**The problem:** You've built amazing skills for Claude Code. Now you want to try Cursor. Or your team uses different agents. Each agent has different formats and directories. Without SkillKit, you either rewrite everything, lock yourself into one agent, or give up on skills entirely.

**The solution:** SkillKit translates skills between all 32 agents automatically. Write once, use everywhere.

## See It In Action

<video src="https://raw.githubusercontent.com/rohitg00/skillkit/main/docs/video/skillkit.mp4" controls width="100%"></video>

> **Note:** If the video doesn't play above, [watch it here](https://raw.githubusercontent.com/rohitg00/skillkit/main/docs/video/skillkit.mp4)

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

## Beautiful CLI Experience

SkillKit features a polished, interactive CLI with visual feedback:

![SkillKit Interactive CLI](docs/img/inital-command.png)

- **Adaptive Logo** - Full ASCII art on wide terminals, compact on narrow
- **Agent Icons** - Visual indicators: ⟁ Claude · ◫ Cursor · ◎ Codex · ✦ Gemini · ⬡ OpenCode
- **Interactive Selection** - Multi-select skills and agents with visual feedback
- **Progress Indicators** - Step trails, spinners, and progress bars
- **Smart Defaults** - Remembers your last selected agents

## What Makes SkillKit Different

| Feature | Without SkillKit | With SkillKit |
|---------|-----------------|---------------|
| **Multi-Agent Support** | Manual rewrite for each agent | One command, all agents |
| **Team Collaboration** | Email skills back and forth | Git-based bundles, remote sync |
| **Skill Discovery** | Search GitHub manually | Smart recommendations for your stack |
| **Format Translation** | Learn each agent's format | Automatic conversion (32 formats) |
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

# Batch translate from a custom source directory
skillkit agent translate --source ./my-skills --to cursor

# Recursively translate nested agent directories
skillkit agent translate --source ./kubernetes-skills --to cursor --recursive
```

**Supported Agents (32):** Claude Code, Cursor, Codex, Gemini CLI, OpenCode, Antigravity, Amp, Clawdbot, Droid, GitHub Copilot, Goose, Kilo, Kiro, Roo, Trae, Windsurf, Universal, Cline, CodeBuddy, CommandCode, Continue, Crush, Factory, MCPJam, Mux, Neovate, OpenHands, Pi, Qoder, Qwen, Vercel, Zencoder

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

## Supported Agents (32)

| Agent | Format | Skills Directory |
|-------|--------|------------------|
| Claude Code | SKILL.md | `.claude/skills/` |
| Cursor | MDC (.mdc) | `.cursor/skills/` |
| Codex | SKILL.md | `.codex/skills/` |
| Gemini CLI | SKILL.md | `.gemini/skills/` |
| OpenCode | SKILL.md | `.opencode/skills/` |
| Antigravity | SKILL.md | `.antigravity/skills/` |
| Amp | SKILL.md | `.amp/skills/` |
| Clawdbot | SKILL.md | `skills/` or `~/.clawdbot/skills/` |
| Droid (Factory) | SKILL.md | `.factory/skills/` |
| GitHub Copilot | Markdown | `.github/skills/` |
| Goose | SKILL.md | `.goose/skills/` |
| Kilo Code | SKILL.md | `.kilocode/skills/` |
| Kiro CLI | SKILL.md | `.kiro/skills/` |
| Roo Code | SKILL.md | `.roo/skills/` |
| Trae | SKILL.md | `.trae/skills/` |
| Windsurf | Markdown | `.windsurf/skills/` |
| Universal | SKILL.md | `skills/` |
| Cline | SKILL.md | `.cline/skills/` |
| CodeBuddy | SKILL.md | `.codebuddy/skills/` |
| CommandCode | SKILL.md | `.commandcode/skills/` |
| Continue | SKILL.md | `.continue/skills/` |
| Crush | SKILL.md | `.crush/skills/` |
| Factory | SKILL.md | `.factory/skills/` |
| MCPJam | SKILL.md | `.mcpjam/skills/` |
| Mux | SKILL.md | `.mux/skills/` |
| Neovate | SKILL.md | `.neovate/skills/` |
| OpenHands | SKILL.md | `.openhands/skills/` |
| Pi | SKILL.md | `.pi/skills/` |
| Qoder | SKILL.md | `.qoder/skills/` |
| Qwen | SKILL.md | `.qwen/skills/` |
| Vercel | SKILL.md | `.vercel/skills/` |
| Zencoder | SKILL.md | `.zencoder/skills/` |

## All Commands

### Skill Management

```bash
skillkit install <source>     # Install skills from GitHub/GitLab/Bitbucket/local
skillkit remove <skills>      # Remove installed skills
skillkit update [skills]      # Update skills from source
skillkit list                 # List installed skills
skillkit enable <skills>      # Enable specific skills
skillkit pause <skills>       # Temporarily pause skills
skillkit resume <skills>      # Resume paused skills
skillkit sync                 # Sync skills to agent config
skillkit read <skills>        # Read skill content for AI
skillkit status               # Show skill and agent status
```

### Discovery & Recommendations

```bash
skillkit recommend            # Get smart recommendations
skillkit marketplace          # Browse skill marketplace
skillkit marketplace search   # Search marketplace
skillkit find <query>         # Quick skill search
skillkit check                # Check skill health and updates
```

### Translation & Context

```bash
skillkit translate            # Translate between formats
skillkit context init         # Initialize project context
skillkit context sync         # Sync context to agents
```

### AI Instruction Generation (Primer)

Generate AI instruction files for all 32 supported agents based on your codebase analysis:

```bash
skillkit primer               # Analyze codebase, generate for detected agents
skillkit primer --all-agents  # Generate for all 32 agents
skillkit primer --agent claude-code,cursor  # Specific agents only
skillkit primer --dry-run     # Preview without writing files
skillkit primer --analyze-only  # Only show codebase analysis
skillkit primer --output ./instructions  # Write to custom directory
skillkit primer --json        # Output analysis as JSON (for scripting)
skillkit primer --json --analyze-only  # Machine-readable analysis
```

Inspired by [primer](https://github.com/pierceboggan/primer) but extended for all SkillKit agents.

### Custom AI Sub-Agents

```bash
skillkit agent list           # List all installed agents
skillkit agent show <name>    # Show agent details
skillkit agent create <name>  # Create a new agent
skillkit agent translate      # Translate agents between formats
  --source ./path             #   Source directory or file
  --to cursor                 #   Target agent format
  --recursive                 #   Scan subdirectories recursively
  --dry-run                   #   Preview without writing
skillkit agent sync           # Sync agents to target AI agent
skillkit agent validate       # Validate agent definitions
```

### Memory System

```bash
skillkit memory status        # View memory status
skillkit memory search        # Search learnings
skillkit memory compress      # Compress observations
skillkit memory export        # Export as skill
```

### Quality & Testing

```bash
skillkit test                 # Run skill tests
skillkit validate             # Validate skill format
skillkit fix                  # Auto-fix skill issues
skillkit audit                # Audit skills for security/quality
skillkit manifest             # Generate skill manifest
```

### Team Collaboration

```bash
skillkit team init            # Initialize team workspace
skillkit team share           # Share skills with team
skillkit team import          # Import team skills
skillkit team sync            # Sync team skills
skillkit team list            # List team members
```

### Workflows & Automation

```bash
skillkit workflow run         # Execute workflow
skillkit plan create          # Create execution plan
skillkit plan execute         # Execute a plan
skillkit cicd init            # Generate CI/CD templates
skillkit hook register        # Register lifecycle hooks
skillkit command generate     # Generate slash commands
```

### Plugins & Extensions

```bash
skillkit plugin list          # List available plugins
skillkit plugin install       # Install a plugin
skillkit plugin enable        # Enable a plugin
skillkit methodology list     # List methodologies
skillkit methodology load     # Load a methodology
```

### Publishing & Sharing

```bash
skillkit publish              # Publish skill to marketplace
skillkit create               # Create new skill
skillkit init                 # Initialize in project
```

### Configuration

```bash
skillkit settings             # View/edit settings
skillkit settings --set key=value  # Update setting
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

## Skill Sources & Attribution

SkillKit aggregates skills from trusted sources. We credit and link back to all original creators. Each source retains its original license.

### Official Partner Sources

| Repository | Description | License |
|------------|-------------|---------|
| [anthropics/skills](https://github.com/anthropics/skills) | Official Claude Code skills from Anthropic | Apache 2.0 |
| [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | Next.js, React, and Vercel platform skills | MIT |
| [expo/skills](https://github.com/expo/skills) | Mobile development with Expo and React Native | MIT |
| [remotion-dev/skills](https://github.com/remotion-dev/skills) | Programmatic video creation with React | MIT |
| [supabase/agent-skills](https://github.com/supabase/agent-skills) | Database, auth, and backend skills | Apache 2.0 |
| [stripe/ai](https://github.com/stripe/ai) | Payment integration and Stripe API patterns | MIT |

### Community Contributors

| Repository | Description | License |
|------------|-------------|---------|
| [trailofbits/skills](https://github.com/trailofbits/skills) | Security analysis and vulnerability detection | Apache 2.0 |
| [obra/superpowers](https://github.com/obra/superpowers) | Test-driven development and workflow automation | MIT |
| [wshobson/agents](https://github.com/wshobson/agents) | Development patterns and agent configurations (48 agents) | MIT |
| [ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills) | Curated collection of Claude Code skills | MIT |
| [travisvn/awesome-claude-skills](https://github.com/travisvn/awesome-claude-skills) | Community-curated skill collection | MIT |
| [langgenius/dify](https://github.com/langgenius/dify) | AI application development platform patterns | Apache 2.0 |
| [better-auth/skills](https://github.com/better-auth/skills) | Authentication and authorization patterns | MIT |
| [onmax/nuxt-skills](https://github.com/onmax/nuxt-skills) | Vue.js and Nuxt framework skills | MIT |
| [elysiajs/skills](https://github.com/elysiajs/skills) | Bun runtime and ElysiaJS framework | MIT |
| [kadajett/agent-nestjs-skills](https://github.com/kadajett/agent-nestjs-skills) | NestJS backend framework patterns | MIT |
| [cloudai-x/threejs-skills](https://github.com/cloudai-x/threejs-skills) | 3D graphics and WebGL development | MIT |
| [dimillian/skills](https://github.com/dimillian/skills) | iOS and SwiftUI development patterns | MIT |
| [waynesutton/convexskills](https://github.com/waynesutton/convexskills) | Convex backend development | MIT |
| [kepano/obsidian-skills](https://github.com/kepano/obsidian-skills) | Obsidian plugin and vault management | MIT |
| [giuseppe-trisciuoglio/developer-kit](https://github.com/giuseppe-trisciuoglio/developer-kit) | UI component libraries (Shadcn/Radix) | MIT |
| [openrouterteam/agent-skills](https://github.com/openrouterteam/agent-skills) | OpenRouter API integration patterns | MIT |

**Want to add your skills?** [Submit your repository](https://github.com/rohitg00/skillkit/issues/new?template=add-source.md) to be included in SkillKit

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

# GitHub Packages (alternative registry)
npm install -g @rohitg00/skillkit --registry=https://npm.pkg.github.com
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

## License

Apache License 2.0 - see [LICENSE](LICENSE) for details.

## Contributing

Contributions welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md).

## Links

- [Documentation](https://agenstskills.com/docs)
- [Website](https://agenstskills.com)
- [Agent Skills Specification](https://agentskills.io/specification)
- [GitHub Repository](https://github.com/rohitg00/skillkit)
- [NPM Package](https://www.npmjs.com/package/skillkit)
- [GitHub Package](https://github.com/rohitg00/skillkit/pkgs/npm/skillkit)
