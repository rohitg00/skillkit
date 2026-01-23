# @skillkit/agents

Agent adapters for SkillKit - supports 17+ AI coding agents.

## Installation

```bash
npm install @skillkit/agents
```

## Supported Agents

| Agent | Config Format | Skills Directory |
|-------|--------------|------------------|
| Claude Code | SKILL.md | `.claude/skills/` |
| Cursor | .cursorrules, .mdc | `.cursor/skills/` |
| Codex | SKILL.md | `.codex/skills/` |
| Gemini CLI | SKILL.md | `.gemini/skills/` |
| Windsurf | .windsurfrules | `.windsurf/skills/` |
| GitHub Copilot | Markdown | `.github/copilot-instructions.md` |
| OpenCode | SKILL.md | `.opencode/skills/` |
| Antigravity | SKILL.md | `.antigravity/skills/` |
| Amp | SKILL.md | `.amp/skills/` |
| Goose | SKILL.md | `.goose/skills/` |
| Kilo | SKILL.md | `.kilocode/skills/` |
| Roo | SKILL.md | `.roo/skills/` |
| Trae | SKILL.md | `.trae/skills/` |
| And more... | | |

## Usage

```typescript
import { getAdapter, detectAgent, listAdapters } from '@skillkit/agents';

// Get adapter for specific agent
const adapter = getAdapter('claude-code');
console.log(adapter.skillsDir); // .claude/skills/

// Detect installed agents
const detected = detectAgent();
console.log(detected); // ['claude-code', 'cursor']

// List all available adapters
const adapters = listAdapters();
```

## Documentation

Full documentation: https://github.com/rohitg00/skillkit

## License

Apache-2.0
