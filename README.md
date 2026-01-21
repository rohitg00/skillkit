# SkillKit

[![npm version](https://img.shields.io/npm/v/skillkit.svg)](https://www.npmjs.com/package/skillkit)
[![npm downloads](https://img.shields.io/npm/dm/skillkit.svg)](https://www.npmjs.com/package/skillkit)
[![CI](https://github.com/rohitg00/skillkit/actions/workflows/ci.yml/badge.svg)](https://github.com/rohitg00/skillkit/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Universal skills loader for AI coding agents. Install, manage, and sync skills across your favorite AI tools.

Skills follow the [Agent Skills](https://agentskills.io) open format—a simple, portable standard for giving agents new capabilities and expertise.

![SkillKit Demo](https://raw.githubusercontent.com/rohitg00/skillkit/main/skillkit.gif)

### Compatible With

| Agent | Status |
|-------|--------|
| Claude Code | ✅ Native |
| OpenAI Codex | ✅ Native |
| Cursor | ✅ Native |
| Gemini CLI | ✅ Native |
| OpenCode | ✅ Native |
| Antigravity | ✅ Native |
| Amp | ✅ Native |
| Clawdbot | ✅ Native |
| Droid (Factory) | ✅ Native |
| GitHub Copilot | ✅ Native |
| Goose | ✅ Native |
| Kilo Code | ✅ Native |
| Kiro CLI | ✅ Native |
| Roo Code | ✅ Native |
| Trae | ✅ Native |
| Windsurf | ✅ Native |
| *Any markdown-config agent* | ✅ Universal |

## Features

- **Multi-Agent Support**: Works with 17+ AI coding agents out of the box
- **Multi-Platform Git**: GitHub, GitLab, Bitbucket, and local paths
- **CI/CD Friendly**: Non-interactive flags for automation (`--skills`, `--all`, `--yes`)
- **Skill Toggle**: Enable/disable skills without removing them
- **Type-Safe**: Built with TypeScript and Zod validation
- **Zero Config**: Auto-detects your agent and configures appropriately

## Installation

```bash
npm install -g skillkit
# or
npx skillkit <command>
```

## Quick Start

```bash
# Initialize in your project (auto-detects agent)
skillkit init

# Install skills from GitHub
skillkit install owner/repo

# Install from GitLab
skillkit install gitlab:owner/repo

# Install specific skills (CI/CD friendly)
skillkit install owner/repo --skills=pdf,xlsx,docx

# Sync skills to your agent config
skillkit sync

# Read a skill (for AI consumption)
skillkit read pdf
```

## Popular Skill Repositories

Install skills from these community repositories:

```bash
# Anthropic's official skill marketplace
skillkit install anthropics/skills

# Vercel's React & Next.js best practices
skillkit install vercel-labs/agent-skills/skills
```

| Repository | Skills | Description |
|------------|--------|-------------|
| [anthropics/skills](https://github.com/anthropics/skills) | `pdf`, `xlsx`, `docx`, etc. | Official Claude Code skill marketplace |
| [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | `vercel-react-best-practices`, `web-design-guidelines` | React/Next.js optimization & UI review |


## Commands

### `skillkit install <source>`

Install skills from various sources.

```bash
# GitHub (default)
skillkit install owner/repo
skillkit install https://github.com/owner/repo

# Install from a subdirectory
skillkit install owner/repo/skills

# GitLab
skillkit install gitlab:owner/repo
skillkit install https://gitlab.com/owner/repo

# Bitbucket
skillkit install bitbucket:owner/repo

# Local path
skillkit install ./my-skills
skillkit install ~/dev/skills

# Options
--list               # List available skills without installing
--skills=pdf,xlsx    # Install specific skills only (CI/CD)
--all                # Install all discovered skills
--yes                # Skip confirmation prompts
--global             # Install to global directory
--force              # Overwrite existing skills
--provider=gitlab    # Force specific provider
--agent=cursor       # Install to specific agent (can specify multiple)
```

### `skillkit sync`

Sync installed skills to your agent's config file.

```bash
skillkit sync
skillkit sync --agent cursor
skillkit sync --output AGENTS.md
skillkit sync --enabled-only
```

### `skillkit read <skills>`

Read skill content for AI agent consumption.

```bash
skillkit read pdf
skillkit read pdf,xlsx,docx    # Multiple skills
```

### `skillkit list`

List all installed skills.

```bash
skillkit list
skillkit list --enabled
skillkit list --json
```

### `skillkit enable/disable <skills>`

Toggle skills on/off without removing them.

```bash
skillkit enable pdf xlsx
skillkit disable docx
```

### `skillkit update [skills]`

Update skills from their original sources.

```bash
skillkit update          # Update all
skillkit update pdf xlsx # Update specific
```

### `skillkit remove <skills>`

Remove installed skills.

```bash
skillkit remove pdf xlsx
```

### `skillkit init`

Initialize skillkit in a project.

```bash
skillkit init
skillkit init --agent cursor
skillkit init --list    # List supported agents
```

### `skillkit validate <path>`

Validate skills against the [Agent Skills specification](https://agentskills.io/specification).

```bash
skillkit validate ./my-skill        # Validate single skill
skillkit validate ./skills --all    # Validate all skills in directory
```

## Supported Agents

| Agent | Config File | Project Path | Global Path |
|-------|-------------|--------------|-------------|
| Claude Code | `AGENTS.md` | `.claude/skills/` | `~/.claude/skills/` |
| Cursor | `.cursorrules` | `.cursor/skills/` | `~/.cursor/skills/` |
| Codex | `AGENTS.md` | `.codex/skills/` | `~/.codex/skills/` |
| Gemini CLI | `GEMINI.md` | `.gemini/skills/` | `~/.gemini/skills/` |
| OpenCode | `AGENTS.md` | `.opencode/skills/` | `~/.config/opencode/skills/` |
| Antigravity | `AGENTS.md` | `.antigravity/skills/` | `~/.gemini/antigravity/skills/` |
| Amp | `AGENTS.md` | `.agents/skills/` | `~/.config/agents/skills/` |
| Clawdbot | `AGENTS.md` | `skills/` | `~/.clawdbot/skills/` |
| Droid (Factory) | `AGENTS.md` | `.factory/skills/` | `~/.factory/skills/` |
| GitHub Copilot | `AGENTS.md` | `.github/skills/` | `~/.copilot/skills/` |
| Goose | `AGENTS.md` | `.goose/skills/` | `~/.config/goose/skills/` |
| Kilo Code | `AGENTS.md` | `.kilocode/skills/` | `~/.kilocode/skills/` |
| Kiro CLI | `AGENTS.md` | `.kiro/skills/` | `~/.kiro/skills/` |
| Roo Code | `AGENTS.md` | `.roo/skills/` | `~/.roo/skills/` |
| Trae | `AGENTS.md` | `.trae/skills/` | `~/.trae/skills/` |
| Windsurf | `AGENTS.md` | `.windsurf/skills/` | `~/.codeium/windsurf/skills/` |
| Universal | `AGENTS.md` | `.agent/skills/` | `~/.agent/skills/` |

## Creating Skills

A skill is a directory with a `SKILL.md` file:

```
my-skill/
├── SKILL.md           # Required: Instructions for the AI
├── references/        # Optional: Documentation
├── scripts/           # Optional: Helper scripts
└── assets/            # Optional: Templates, configs
```

### SKILL.md Format

Follows the [Agent Skills specification](https://agentskills.io/specification):

```markdown
---
name: my-skill
description: What this skill does and when to use it. Include trigger keywords.
license: MIT
compatibility: Requires Node.js 18+
metadata:
  author: your-org
  version: "1.0"
---

# My Skill

Instructions for the AI agent on how to use this skill.

## When to Use

- Scenario 1
- Scenario 2

## Steps

1. First step
2. Second step
```

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Lowercase alphanumeric with hyphens (max 64 chars) |
| `description` | Yes | What it does and when to use it (max 1024 chars) |
| `license` | No | License name or reference |
| `compatibility` | No | Environment requirements |
| `metadata` | No | Arbitrary key-value pairs |

## CI/CD Usage

```yaml
# GitHub Actions example
- name: Setup skills
  run: |
    npx skillkit install owner/skills --skills=lint,test,deploy --yes
    npx skillkit sync --yes
```

## Programmatic API

```typescript
import {
  findAllSkills,
  discoverSkills,
  detectAgent,
  getAdapter,
} from 'skillkit';

// Find all installed skills
const skills = findAllSkills(searchDirs);

// Detect current agent
const agent = await detectAgent();

// Generate config
const adapter = getAdapter(agent);
const config = adapter.generateConfig(skills);
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

MIT License - see [LICENSE](LICENSE) for details.

## Contributing

Contributions welcome! Please read our contributing guidelines.

## Acknowledgments

Implements the [Agent Skills](https://agentskills.io) open format, originally developed by Anthropic and adopted by leading AI development tools.
