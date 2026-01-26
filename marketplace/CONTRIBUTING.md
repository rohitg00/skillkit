# Contributing Skills to SkillKit Marketplace

## How to Add Your Skill

1. Fork this repository
2. Add your skill to `marketplace/skills.json`
3. Submit a Pull Request

## Skill Format

```json
{
  "id": "your-username/your-repo/skill-name",
  "name": "Your Skill Name",
  "description": "Brief description of what the skill does",
  "source": "your-username/your-repo",
  "tags": ["tag1", "tag2"]
}
```

## Field Reference

| Field | Required | Description |
|-------|----------|-------------|
| `id` | Yes | Unique identifier: `owner/repo/skill-name` |
| `name` | Yes | Human-readable name (max 100 chars) |
| `description` | No | Brief description (max 500 chars) |
| `source` | Yes | GitHub repository: `owner/repo` |
| `tags` | Yes | 1-10 lowercase tags for categorization |
| `author` | No | Your name or GitHub username |
| `version` | No | Semantic version (e.g., `1.0.0`) |
| `agents` | No | Compatible agents (omit for universal) |

## Skill Repository Structure

Your skill repository should contain a `SKILL.md` file:

```
your-repo/
├── skills/
│   └── skill-name/
│       └── SKILL.md
└── README.md
```

## SKILL.md Format

```markdown
---
name: "skill-name"
description: "What this skill does"
version: "1.0.0"
tags: ["tag1", "tag2"]
globs: ["**/*.tsx", "**/*.ts"]
---

# Skill Title

Instructions for AI agents...

## Principles

- Principle 1
- Principle 2

## Patterns

### Pattern Name

Description and examples...
```

## Guidelines

- **Be specific**: Skills should focus on one topic
- **Include examples**: Code examples help AI agents understand patterns
- **Test your skill**: Verify it works with at least one agent
- **Keep it updated**: Maintain compatibility with latest agent versions

## Supported Agents

Skills can target specific agents or be universal:

- `claude-code` - Anthropic Claude Code
- `cursor` - Cursor IDE
- `codex` - OpenAI Codex CLI
- `gemini-cli` - Google Gemini CLI
- `windsurf` - Codeium Windsurf
- `github-copilot` - GitHub Copilot
- `universal` - All agents

## Questions?

Open an issue or join our Discord community.
