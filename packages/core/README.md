# @skillkit/core

Core functionality for SkillKit - skill discovery, parsing, translation, and context management.

## Installation

```bash
npm install @skillkit/core
```

## Features

- **Skill Discovery**: Find and parse SKILL.md files
- **Skill Translation**: Convert between agent formats (Claude Code, Cursor, Windsurf, etc.)
- **Project Context Detection**: Analyze project stack and dependencies
- **Recommendation Engine**: Smart skill suggestions based on project profile

## Usage

```typescript
import {
  loadConfig,
  getSearchDirs,
  translateSkill,
  ProjectDetector,
  RecommendationEngine
} from '@skillkit/core';

// Load skillkit config
const config = loadConfig();

// Detect project context
const detector = new ProjectDetector();
const profile = await detector.analyze('./my-project');

// Get skill recommendations
const engine = new RecommendationEngine();
const recommendations = await engine.recommend(profile);
```

## Documentation

Full documentation: https://github.com/rohitg00/skillkit

## License

Apache-2.0
