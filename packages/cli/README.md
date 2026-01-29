# @skillkit/cli

[![npm version](https://img.shields.io/npm/v/@skillkit/cli.svg)](https://www.npmjs.com/package/@skillkit/cli)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

**Command-line interface for SkillKit** - install, manage, translate, and sync skills across 32 AI coding agents.

## Installation

```bash
npm install -g @skillkit/cli
# or
npm install -g skillkit  # includes CLI
```

## Quick Start

```bash
# Get skill recommendations for your project
skillkit recommend

# Install skills from GitHub
skillkit install anthropics/skills

# Translate skills between agents
skillkit translate my-skill --to cursor

# Launch interactive TUI
skillkit ui
```

## All Commands

### Skill Management

```bash
skillkit install <source>     # Install from GitHub/GitLab/Bitbucket/local
skillkit remove <skills>      # Remove installed skills
skillkit update [skills]      # Update skills from source
skillkit list                 # List installed skills
skillkit enable <skills>      # Enable specific skills
skillkit disable <skills>     # Disable specific skills
skillkit sync                 # Sync to agent config
skillkit read <skills>        # Read skill content
```

### Discovery & Recommendations

```bash
skillkit recommend                     # Project-based recommendations
skillkit recommend --search "auth"     # Task-based search
skillkit recommend --category security # Filter by category
skillkit recommend --min-score 80      # Quality threshold

skillkit marketplace                   # Browse skills
skillkit marketplace search "react"    # Search marketplace
skillkit marketplace --tags typescript # Filter by tags
skillkit marketplace refresh           # Refresh index
```

### Translation

```bash
skillkit translate <skill> --to <agent>  # Translate single skill
skillkit translate --all --to cursor     # Translate all skills
skillkit translate skill --dry-run       # Preview without writing
```

### Context Management

```bash
skillkit context init          # Analyze project, create context
skillkit context show          # Display current context
skillkit context sync --all    # Sync to all detected agents
skillkit context export        # Export context file
```

### Session Memory

```bash
skillkit memory status         # View memory status
skillkit memory search "auth"  # Search learnings
skillkit memory list           # List all learnings
skillkit memory compress       # Compress observations
skillkit memory export <id>    # Export as skill
skillkit memory add            # Add manual learning
skillkit memory --global       # Use global scope
```

### Testing & Workflows

```bash
skillkit test                  # Run all skill tests
skillkit test ./my-skill       # Test specific skill
skillkit test --tags unit      # Run tagged tests

skillkit workflow list         # List workflows
skillkit workflow run <name>   # Execute workflow
skillkit workflow create       # Create new workflow

skillkit cicd github-action    # Generate GitHub Actions
skillkit cicd gitlab-ci        # Generate GitLab CI
skillkit cicd pre-commit       # Generate pre-commit hook
skillkit cicd init             # Initialize CI/CD templates
```

### Team Collaboration

```bash
skillkit team init --name "Team"     # Initialize team
skillkit team share <bundle>         # Share skill bundle
skillkit team import <path>          # Import bundle
skillkit team list                   # List team bundles
skillkit team sync                   # Sync with remote
skillkit team remove <bundle>        # Remove bundle
skillkit team bundle-create          # Create new bundle
skillkit team bundle-export <id>     # Export bundle
skillkit team bundle-list            # List all bundles
```

### Plugin System

```bash
skillkit plugin list                 # List installed plugins
skillkit plugin install <name>       # Install plugin
skillkit plugin uninstall <name>     # Uninstall plugin
skillkit plugin enable <name>        # Enable plugin
skillkit plugin disable <name>       # Disable plugin
skillkit plugin info <name>          # Plugin details
```

### Methodologies & Plans

```bash
skillkit methodology list            # List methodologies
skillkit methodology load <name>     # Load methodology
skillkit methodology apply <name>    # Apply to project

skillkit plan parse <file>           # Parse plan file
skillkit plan validate <file>        # Validate plan
skillkit plan execute <file>         # Execute plan
skillkit plan status                 # Plan execution status
```

### Hooks & Automation

```bash
skillkit hook list                   # List registered hooks
skillkit hook register <event>       # Register new hook
skillkit hook trigger <event>        # Trigger hook manually
skillkit hook enable <id>            # Enable hook
skillkit hook disable <id>           # Disable hook
```

### Agent Commands

```bash
skillkit command generate <agent>    # Generate agent-native commands
skillkit command list <agent>        # List available commands
```

### Utilities

```bash
skillkit init                  # Initialize in project
skillkit init --agent cursor   # Initialize for specific agent
skillkit validate ./skill      # Validate skill format
skillkit create my-skill       # Create new skill
skillkit settings              # View all settings
skillkit settings --set key=value  # Update setting
```

## Install Options

```bash
skillkit install owner/repo              # GitHub repository
skillkit install gitlab:owner/repo       # GitLab repository
skillkit install ./local/path            # Local directory

# Options
--list                    # List available skills without installing
--skills=pdf,xlsx         # Install specific skills
--all                     # Install all discovered skills
--yes                     # Skip confirmation prompts
--global                  # Install globally
--force                   # Overwrite existing
--agent=cursor,windsurf   # Install to specific agents
```

## Programmatic Usage

```typescript
import {
  installCommand,
  listCommand,
  syncCommand,
  translateCommand,
  recommendCommand,
} from '@skillkit/cli';

// Install skills programmatically
await installCommand('anthropics/skills', {
  agent: ['claude-code', 'cursor'],
  yes: true,
});

// List installed skills
const skills = await listCommand({ json: true });

// Sync to agent
await syncCommand({ all: true });

// Translate skill
await translateCommand('my-skill', {
  to: 'cursor',
  dryRun: false,
});

// Get recommendations
const recs = await recommendCommand({
  path: './my-project',
  minScore: 70,
});
```

## CI/CD Usage

```yaml
# GitHub Actions example
- name: Setup skills
  run: |
    npx skillkit install owner/skills --skills=lint,test --yes
    npx skillkit sync --yes
```

## Supported Agents

| Agent | Format |
|-------|--------|
| Claude Code | SKILL.md |
| Cursor | MDC (.mdc) |
| Codex | SKILL.md |
| Gemini CLI | SKILL.md |
| Windsurf | Markdown |
| GitHub Copilot | Markdown |
| + 26 more | SKILL.md |

## Documentation

Full documentation: https://github.com/rohitg00/skillkit

## License

Apache-2.0
