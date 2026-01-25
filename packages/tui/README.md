# @skillkit/tui

[![npm version](https://img.shields.io/npm/v/@skillkit/tui.svg)](https://www.npmjs.com/package/@skillkit/tui)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

**Interactive terminal UI for SkillKit** - browse, install, translate, and manage skills visually in your terminal.

## Requirements

- **Bun runtime** (>=1.2.0) - Required for OpenTUI rendering
- Terminal with 80x24 minimum (120x40 recommended)

Install Bun: https://bun.sh

## Installation

```bash
npm install -g skillkit
```

## Quick Start

```bash
# Launch TUI with Bun
bun skillkit ui

# Or via pnpm in monorepo
pnpm ui
```

## Features

- **Monochromatic Design** - Clean B&W theme with colored accents
- **Animated UI** - Smooth entrance animations and transitions
- **Browse Skills** - Explore skill repositories with search and filtering
- **Smart Recommendations** - AI-powered skill suggestions with match scores
- **Cross-Agent Translation** - Convert skills between 17+ agent formats
- **Team Collaboration** - Share and sync skills across teams
- **Responsive Design** - Adapts to any terminal size

## Keyboard Shortcuts

### Navigation
| Key | Screen |
|-----|--------|
| `h` | Home |
| `b` | Browse skills |
| `m` | Marketplace |
| `r` | Recommendations |
| `i` | Installed skills |
| `s` | Sync settings |

### Actions
| Key | Screen |
|-----|--------|
| `t` | Translate skills |
| `w` | Workflows |
| `x` | Execute |
| `n` | Plan |
| `y` | History |

### Team & Config
| Key | Screen |
|-----|--------|
| `a` | Team |
| `c` | Context |
| `e` | Memory |
| `p` | Plugins |
| `o` | Methodology |
| `,` | Settings |

### Global
| Key | Action |
|-----|--------|
| `/` | Help screen |
| `esc` | Go back / Home |
| `q` | Quit |
| `j/k` | Navigate lists |
| `enter` | Select item |

## Screens Overview

- **Home** - Dashboard with stats, detected agents, and features
- **Browse** - Search and explore skill repositories
- **Marketplace** - Curated skill marketplace with popularity metrics
- **Recommend** - AI-powered suggestions based on your project
- **Installed** - Manage installed skills (enable/disable/remove)
- **Sync** - Sync skills across multiple agents
- **Translate** - Convert skills between agent formats
- **Workflow** - Manage and execute automation workflows
- **Execute** - Run skills with checkpoints
- **Plan** - Structured plan creation and execution
- **Team** - Share skills and bundles with team members
- **Context** - View detected stack and project context
- **Memory** - Session memory and learnings
- **Plugins** - Plugin management
- **Methodology** - Development methodology frameworks
- **Settings** - Configure SkillKit preferences

## Programmatic Usage

```typescript
import { startTUI } from '@skillkit/tui';

await startTUI();
```

## Architecture

Built with:
- **OpenTUI** - High-performance terminal UI framework
- **React** - Component architecture
- **@skillkit/core** - Core functionality

```
src/
├── index.tsx         # Entry point and startTUI
├── App.tsx           # Main app component
├── screens/          # Screen components
│   ├── Home.tsx
│   ├── Browse.tsx
│   ├── Help.tsx
│   └── ...
├── components/       # Reusable UI components
│   ├── Sidebar.tsx
│   ├── Splash.tsx
│   └── ...
├── state/            # State types and navigation
├── theme/            # Colors and symbols
└── utils/            # Helper functions
```

## Documentation

Full documentation: https://github.com/rohitg00/skillkit

## License

Apache-2.0
