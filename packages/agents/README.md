# @skillkit/agents

[![npm version](https://img.shields.io/npm/v/@skillkit/agents.svg)](https://www.npmjs.com/package/@skillkit/agents)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

**Agent adapters for SkillKit** - configuration and detection for 17 AI coding agents.

## Installation

```bash
npm install @skillkit/agents
```

## Supported Agents (17)

| Agent | Config Format | Project Skills | Global Skills |
|-------|--------------|----------------|---------------|
| Claude Code | SKILL.md | `.claude/skills/` | `~/.claude/skills/` |
| Cursor | MDC (.mdc) | `.cursor/skills/` | `~/.cursor/skills/` |
| Codex | SKILL.md | `.codex/skills/` | `~/.codex/skills/` |
| Gemini CLI | SKILL.md | `.gemini/skills/` | `~/.gemini/skills/` |
| OpenCode | SKILL.md | `.opencode/skills/` | `~/.config/opencode/skills/` |
| Antigravity | SKILL.md | `.antigravity/skills/` | `~/.gemini/antigravity/skills/` |
| Amp | SKILL.md | `.agents/skills/` | `~/.config/agents/skills/` |
| Clawdbot | SKILL.md | `skills/` | `~/.clawdbot/skills/` |
| Droid (Factory) | SKILL.md | `.factory/skills/` | `~/.factory/skills/` |
| GitHub Copilot | Markdown | `.github/skills/` | `~/.copilot/skills/` |
| Goose | SKILL.md | `.goose/skills/` | `~/.config/goose/skills/` |
| Kilo Code | SKILL.md | `.kilocode/skills/` | `~/.kilocode/skills/` |
| Kiro CLI | SKILL.md | `.kiro/skills/` | `~/.kiro/skills/` |
| Roo Code | SKILL.md | `.roo/skills/` | `~/.roo/skills/` |
| Trae | SKILL.md | `.trae/skills/` | `~/.trae/skills/` |
| Windsurf | Markdown | `.windsurf/skills/` | `~/.codeium/windsurf/skills/` |
| Universal | SKILL.md | `skills/` | `~/.agent/skills/` |

## Usage

### Get Agent Adapter

```typescript
import { getAdapter, AgentType } from '@skillkit/agents';

// Get adapter for specific agent
const adapter = getAdapter('claude-code');

console.log(adapter.name);          // 'claude-code'
console.log(adapter.skillsDir);     // '.claude/skills/'
console.log(adapter.globalSkillsDir); // '~/.claude/skills/'
console.log(adapter.configFile);    // 'AGENTS.md'
console.log(adapter.format);        // 'skill-md'
```

### Detect Installed Agents

```typescript
import { detectAgent, detectAllAgents } from '@skillkit/agents';

// Detect primary agent in current directory
const primary = await detectAgent();
console.log(primary); // 'claude-code'

// Detect all installed agents
const all = await detectAllAgents();
console.log(all); // ['claude-code', 'cursor', 'windsurf']

// Detect in specific directory
const agents = await detectAllAgents('./my-project');
```

### List All Adapters

```typescript
import { listAdapters, getAdapterNames } from '@skillkit/agents';

// Get all adapter configurations
const adapters = listAdapters();
adapters.forEach(adapter => {
  console.log(`${adapter.name}: ${adapter.skillsDir}`);
});

// Get just the names
const names = getAdapterNames();
console.log(names); // ['claude-code', 'cursor', 'codex', ...]
```

### Generate Agent Config

```typescript
import { getAdapter } from '@skillkit/agents';
import { findAllSkills } from '@skillkit/core';

const adapter = getAdapter('cursor');
const skills = findAllSkills([adapter.skillsDir]);

// Generate config file content
const config = adapter.generateConfig(skills);
console.log(config);
```

### Get Skills Directory

```typescript
import { getAdapter } from '@skillkit/agents';
import { homedir } from 'os';

const adapter = getAdapter('claude-code');

// Project-local skills directory
const projectDir = adapter.skillsDir; // '.claude/skills/'

// Global skills directory
const globalDir = adapter.globalSkillsDir.replace('~', homedir());
// '/Users/you/.claude/skills/'
```

## Adapter Interface

```typescript
interface AgentAdapter {
  // Agent identifier
  name: AgentType;

  // Display name
  displayName: string;

  // Skill file format
  format: 'skill-md' | 'mdc' | 'markdown';

  // Project skills directory (relative)
  skillsDir: string;

  // Global skills directory (with ~)
  globalSkillsDir: string;

  // Config file name
  configFile: string;

  // Generate config from skills
  generateConfig(skills: Skill[]): string;

  // Parse existing config
  parseConfig(content: string): Skill[];
}
```

## Agent Types

```typescript
type AgentType =
  | 'claude-code'
  | 'cursor'
  | 'codex'
  | 'gemini-cli'
  | 'opencode'
  | 'antigravity'
  | 'amp'
  | 'clawdbot'
  | 'droid'
  | 'github-copilot'
  | 'goose'
  | 'kilo'
  | 'kiro-cli'
  | 'roo'
  | 'trae'
  | 'windsurf'
  | 'universal';
```

## Format Details

### SKILL.md Format
Used by most agents. YAML frontmatter + Markdown content:
```markdown
---
name: my-skill
description: What this skill does
---
# My Skill
Instructions...
```

### MDC Format (Cursor)
Cursor-specific format with globs and alwaysApply:
```
---
description: What this skill does
globs: ["**/*.tsx"]
alwaysApply: false
---
Instructions...
```

### Markdown Format
Plain markdown used by Windsurf and Copilot:
```markdown
# Skill Name
Instructions for the agent...
```

## Documentation

Full documentation: https://github.com/rohitg00/skillkit

## License

Apache-2.0
