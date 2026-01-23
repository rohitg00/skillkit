# @skillkit/tui

Interactive terminal UI for SkillKit - browse, install, and manage skills visually.

## Installation

```bash
npm install @skillkit/tui
```

## Features

- **Browse Skills**: Discover skills from the marketplace
- **Smart Recommendations**: Project-aware skill suggestions
- **Skill Translation**: Convert between agent formats
- **Context Management**: View and sync project context
- **Keyboard Navigation**: Fast, intuitive controls

## Usage

```typescript
import { startTUI } from '@skillkit/tui';

// Launch the interactive TUI
await startTUI();
```

Or via CLI:

```bash
skillkit ui
```

## Screens

- **Home**: Overview and quick actions
- **Browse**: Explore available skills
- **Recommend**: Get personalized recommendations
- **Translate**: Convert skills between formats
- **Context**: Manage project context
- **Installed**: View and manage installed skills
- **Sync**: Sync skills across agents
- **Settings**: Configure skillkit

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `↑/↓` | Navigate |
| `Enter` | Select |
| `Tab` | Switch focus |
| `?` | Help |
| `q` | Quit |

## Documentation

Full documentation: https://github.com/rohitg00/skillkit

## License

Apache-2.0
