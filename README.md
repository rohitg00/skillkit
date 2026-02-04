<div align="center">

```
██ SKILLKIT
```
</div>

**Universal Skills for AI Coding Agents**

[![npm version](https://img.shields.io/npm/v/skillkit.svg)](https://www.npmjs.com/package/skillkit)
[![npm downloads](https://img.shields.io/npm/dm/skillkit.svg)](https://www.npmjs.com/package/skillkit)
[![CI](https://github.com/rohitg00/skillkit/actions/workflows/ci.yml/badge.svg)](https://github.com/rohitg00/skillkit/actions/workflows/ci.yml)
[![Website](https://img.shields.io/badge/Website-agenstskills.com-black)](https://agenstskills.com)
[![Docs](https://img.shields.io/badge/Docs-agenstskills.com/docs-blue)](https://agenstskills.com/docs)
[![API](https://img.shields.io/badge/API-agenstskills.com/api-green)](https://agenstskills.com/api)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![SKILL.md](https://img.shields.io/badge/SKILL.md-compatible-black?style=flat-square)](https://agenstskills.com)

Skills make AI coding agents smarter. But every agent uses a different format — Claude Code wants `.claude/skills/`, Cursor uses `.mdc`, Copilot expects `.github/skills/`. You end up rewriting the same skill for each agent, or locking into one platform.

SkillKit fixes this. Write a skill once, deploy it to all 32 agents.

```bash
npx skillkit@latest
```

## See It In Action

<video src="https://raw.githubusercontent.com/rohitg00/skillkit/main/docs/video/skillkit.mp4" controls width="100%"></video>

> If the video doesn't play above, [watch it here](https://raw.githubusercontent.com/rohitg00/skillkit/main/docs/video/skillkit.mp4)

## Quick Start

```bash
npx skillkit@latest init              # Detect agents, create dirs
skillkit recommend                    # Get smart suggestions
skillkit install anthropics/skills    # Install from marketplace
skillkit sync                         # Deploy to your agents
```

Four commands. Your agents now have skills for PDF processing, code review, and more.

## What Can You Do?

### Install skills from anywhere

```bash
skillkit install anthropics/skills          # GitHub
skillkit install gitlab:team/skills         # GitLab
skillkit install ./my-local-skills          # Local path
```

### Translate between agents

Write for Claude, deploy to Cursor:

```bash
skillkit translate my-skill --to cursor
skillkit translate --all --to windsurf
```

### Get smart recommendations

SkillKit reads your project, detects your stack, and suggests relevant skills:

```bash
skillkit recommend
# 92% vercel-react-best-practices
# 87% tailwind-v4-patterns
# 85% nextjs-app-router
```

### Discover skills at runtime

Start an API server and let agents find skills on demand:

```bash
skillkit serve
# Server running at http://localhost:3737

curl "http://localhost:3737/search?q=react+performance"
```

Or use MCP for native agent integration:

```json
{
  "mcpServers": {
    "skillkit": { "command": "npx", "args": ["@skillkit/mcp"] }
  }
}
```

Or use Python:

```bash
pip install skillkit-client
```

```python
from skillkit import SkillKitClient

async with SkillKitClient() as client:
    results = await client.search("react performance", limit=5)
```

[REST API docs](https://agenstskills.com/docs/rest-api) · [MCP Server docs](https://agenstskills.com/docs/mcp-server) · [Python Client docs](https://agenstskills.com/docs/python-client) · [Interactive API explorer](https://agenstskills.com/api)

### Auto-generate agent instructions

Let SkillKit analyze your codebase and create CLAUDE.md, .cursorrules, etc.:

```bash
skillkit primer --all-agents
```

### Session memory

Your AI agents learn patterns during sessions, then forget everything. SkillKit captures those learnings:

```bash
skillkit memory compress
skillkit memory search "auth patterns"
skillkit memory export auth-patterns
```

### Mesh network

Distribute agents across machines with encrypted P2P:

```bash
skillkit mesh init
skillkit mesh discover
```

### Team collaboration

Share skills via a Git-committable `.skills` manifest:

```bash
skillkit manifest init
skillkit manifest add anthropics/skills
git commit -m "add team skills"
```

Team members run `skillkit manifest install` and they're in sync.

### Interactive TUI

```bash
skillkit ui
```

`h` Home · `m` Marketplace · `r` Recommend · `t` Translate · `i` Installed · `s` Sync · `q` Quit

![SkillKit Interactive CLI](docs/img/inital-command.png)

## Supported Agents (32)

| Agent | Format | Directory |
|-------|--------|-----------|
| **Claude Code** | SKILL.md | `.claude/skills/` |
| **Cursor** | .mdc | `.cursor/skills/` |
| **Codex** | SKILL.md | `.codex/skills/` |
| **Gemini CLI** | SKILL.md | `.gemini/skills/` |
| **OpenCode** | SKILL.md | `.opencode/skills/` |
| **GitHub Copilot** | Markdown | `.github/skills/` |
| **Windsurf** | Markdown | `.windsurf/skills/` |

Plus 25 more: Amp, Antigravity, Clawdbot, Cline, CodeBuddy, CommandCode, Continue, Crush, Droid, Factory, Goose, Kilo Code, Kiro CLI, MCPJam, Mux, Neovate, OpenHands, Pi, Qoder, Qwen, Roo Code, Trae, Vercel, Zencoder, Universal

[Full agent details](https://agenstskills.com/docs/agents)

## Commands

### Core

```bash
skillkit install <source>        # Install skills
skillkit remove <skills>         # Remove skills
skillkit translate <skill> --to  # Translate between agents
skillkit sync                    # Deploy to agent config
skillkit recommend               # Smart recommendations
skillkit serve                   # Start REST API server
```

### Discovery

```bash
skillkit marketplace             # Browse skills
skillkit tree                    # Hierarchical taxonomy
skillkit find <query>            # Quick search
```

### Advanced

```bash
skillkit primer --all-agents     # Generate agent instructions
skillkit memory compress         # Capture session learnings
skillkit mesh init               # Multi-machine distribution
skillkit message send            # Inter-agent messaging
skillkit workflow run <name>     # Run workflows
skillkit test                    # Test skills
skillkit cicd init               # CI/CD templates
```

[Full command reference](https://agenstskills.com/docs/commands)

## Creating Skills

```bash
skillkit create my-skill
```

Or manually create a `SKILL.md`:

```markdown
---
name: my-skill
description: What this skill does
license: MIT
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
import { translateSkill, analyzeProject, RecommendationEngine } from 'skillkit';

const skill = await translateSkill(content, 'cursor');

const profile = await analyzeProject('./my-project');
const engine = new RecommendationEngine();
const recs = await engine.recommend(profile);
```

```typescript
import { startServer } from '@skillkit/api';
await startServer({ port: 3737, skills: [...] });
```

```typescript
import { MemoryCache, RelevanceRanker } from '@skillkit/core';
const cache = new MemoryCache({ maxSize: 500, ttlMs: 86_400_000 });
const ranker = new RelevanceRanker();
const results = ranker.rank(skills, 'react performance');
```

## Skill Sources

SkillKit aggregates skills from trusted sources. All original creators are credited with their licenses preserved.

### Official Partners

| Repository | Description |
|------------|-------------|
| [anthropics/skills](https://github.com/anthropics/skills) | Official Claude Code skills |
| [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | Next.js and React skills |
| [expo/skills](https://github.com/expo/skills) | Mobile development with Expo |
| [remotion-dev/skills](https://github.com/remotion-dev/skills) | Programmatic video creation |
| [supabase/agent-skills](https://github.com/supabase/agent-skills) | Database and auth skills |
| [stripe/ai](https://github.com/stripe/ai) | Payment integration patterns |

### Community

[trailofbits/skills](https://github.com/trailofbits/skills) · [obra/superpowers](https://github.com/obra/superpowers) · [wshobson/agents](https://github.com/wshobson/agents) · [ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills) · [travisvn/awesome-claude-skills](https://github.com/travisvn/awesome-claude-skills) · [langgenius/dify](https://github.com/langgenius/dify) · [better-auth/skills](https://github.com/better-auth/skills) · [onmax/nuxt-skills](https://github.com/onmax/nuxt-skills) · [elysiajs/skills](https://github.com/elysiajs/skills) · [kadajett/agent-nestjs-skills](https://github.com/kadajett/agent-nestjs-skills) · [cloudai-x/threejs-skills](https://github.com/cloudai-x/threejs-skills) · [dimillian/skills](https://github.com/dimillian/skills) · [waynesutton/convexskills](https://github.com/waynesutton/convexskills) · [kepano/obsidian-skills](https://github.com/kepano/obsidian-skills) · [giuseppe-trisciuoglio/developer-kit](https://github.com/giuseppe-trisciuoglio/developer-kit) · [openrouterteam/agent-skills](https://github.com/openrouterteam/agent-skills)

**Want to add your skills?** [Submit your repository](https://github.com/rohitg00/skillkit/issues/new?template=add-source.md)

## Install

```bash
npm install -g skillkit       # npm
pnpm add -g skillkit          # pnpm
yarn global add skillkit      # yarn
bun add -g skillkit           # bun
npx skillkit <command>        # no install
```

## License

Apache License 2.0 — see [LICENSE](LICENSE).

## Links

[Documentation](https://agenstskills.com/docs) · [Website](https://agenstskills.com) · [API Explorer](https://agenstskills.com/api) · [npm](https://www.npmjs.com/package/skillkit) · [GitHub](https://github.com/rohitg00/skillkit)
