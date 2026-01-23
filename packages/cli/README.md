# @skillkit/cli

CLI commands for SkillKit - install, manage, and sync skills across AI agents.

## Installation

```bash
npm install @skillkit/cli
```

## Commands

```bash
skillkit init              # Initialize skillkit in project
skillkit install <skill>   # Install a skill
skillkit remove <skill>    # Remove a skill
skillkit list              # List installed skills
skillkit update            # Update installed skills
skillkit sync              # Sync skills across agents
skillkit translate         # Translate skills between formats
skillkit recommend         # Get skill recommendations
skillkit context           # Manage project context
skillkit ui                # Launch interactive TUI
```

## Usage

```typescript
import { installCommand, listCommand, syncCommand } from '@skillkit/cli';

// Programmatic access to CLI commands
await installCommand('github.com/owner/repo:skill-name');
await listCommand();
await syncCommand({ all: true });
```

## Documentation

Full documentation: https://github.com/rohitg00/skillkit

## License

Apache-2.0
