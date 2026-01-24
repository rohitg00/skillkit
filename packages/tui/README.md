# @skillkit/tui

[![npm version](https://img.shields.io/npm/v/@skillkit/tui.svg)](https://www.npmjs.com/package/@skillkit/tui)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

**Interactive terminal UI for SkillKit** - browse, install, translate, and manage skills visually in your terminal.

## Installation

```bash
npm install @skillkit/tui
# or
npm install -g skillkit  # includes TUI
```

## Quick Start

```bash
skillkit ui
# or just
skillkit
```

## Features

- **Browse Skills**: Explore 33+ skill repositories with search and filtering
- **Smart Recommendations**: See project-aware skill suggestions with match scores
- **Cross-Agent Translation**: Convert skills between any of 17 agent formats
- **Context Management**: View detected stack and sync to all agents
- **Multi-Agent Install**: Install skills to multiple agents at once
- **Responsive Design**: Adapts to any terminal size

## Screens

### Home (h)
Overview of your project and quick actions. Shows detected agents, installed skills count, and navigation hints.

### Marketplace (m)
Browse curated skill marketplace:
- Search across 33+ repositories
- Filter by tags and categories
- View popularity metrics
- Install with one key

### Browse (b)
Explore available skills from curated repositories:
- Search skills with `/`
- Filter by tags
- View skill details
- One-key installation

### Workflow (w)
Manage and execute workflows:
- List available workflows
- View workflow steps
- Execute workflows
- Monitor progress

### Execute (x)
Execute skills with checkpoints:
- Task-based execution
- Decision and review checkpoints
- Dry-run mode
- Git integration

### Team (a)
Team collaboration management:
- Create and share skill bundles
- Import team bundles
- Sync with remote registry
- Manage team members

### Plugins (p)
Plugin system management:
- List installed plugins
- Install new plugins
- Enable/disable plugins
- View plugin details

### Methodology (o)
Development methodologies:
- Browse 5 methodologies (Agile, TDD, DevOps, Design Thinking, Feature Flags)
- View methodology skills
- Apply to project
- Track adoption

### Plan (n)
Structured plan system:
- Parse plan files
- Validate plan structure
- Execute plans step-by-step
- Track progress

### Recommend (r)
AI-powered skill suggestions based on your project:
- Analyzes your package.json, configs, and file structure
- Shows match percentage for each skill
- Explains why skills are recommended
- Filter by minimum score

### Translate (t)
Convert skills between agent formats:
- Select source skill
- Choose target agent(s)
- Preview translation
- Apply with confirmation

### Context (c)
View and manage project context:
- Detected languages and frameworks
- Found testing tools and databases
- Installed agents
- Sync context to all agents

### Memory (e)
Session memory system:
- View learnings
- Search past sessions
- Compress observations
- Export as skills

### Installed (i)
Manage your installed skills:
- View all installed skills
- Enable/disable skills
- Remove skills
- Update from source

### Sync (s)
Sync skills across agents:
- Select target agents
- Preview changes
- Apply sync

### Settings (,)
Configure SkillKit:
- Default agent
- Auto-sync settings
- Skill directories

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `h` | Home screen |
| `m` | Marketplace |
| `b` | Browse skills |
| `w` | Workflows |
| `x` | Execute |
| `a` | Team collaboration |
| `p` | Plugins |
| `o` | Methodology |
| `n` | Plan system |
| `r` | Recommendations |
| `t` | Translate skills |
| `c` | Context management |
| `e` | Memory/Learnings |
| `i` | Installed skills |
| `s` | Sync skills |
| `,` | Settings |
| `↑/↓` | Navigate lists |
| `Enter` | Select / Confirm |
| `/` | Search |
| `Tab` | Switch focus |
| `Esc` | Go back |
| `?` | Help |
| `q` | Quit |

## Programmatic Usage

```typescript
import { startTUI, TUIOptions } from '@skillkit/tui';

// Launch with defaults
await startTUI();

// Launch with options
await startTUI({
  projectPath: './my-project',
  initialScreen: 'browse',
  theme: 'dark',
});
```

## Architecture

Built with:
- **Ink** - React for CLIs
- **React** - Component architecture
- **@skillkit/core** - Core functionality

```
src/
├── app.tsx           # Main app component
├── screens/          # Screen components
│   ├── Home.tsx
│   ├── Browse.tsx
│   ├── Recommend.tsx
│   ├── Translate.tsx
│   ├── Context.tsx
│   └── ...
├── components/       # Reusable UI components
│   ├── SkillCard.tsx
│   ├── AgentSelector.tsx
│   └── ...
└── hooks/            # React hooks
    ├── useSkills.ts
    ├── useContext.ts
    └── ...
```

## Terminal Requirements

- Minimum: 80x24 characters
- Recommended: 120x40 characters
- Supports: True Color, 256 colors, basic ANSI

## Documentation

Full documentation: https://github.com/rohitg00/skillkit

## License

Apache-2.0
