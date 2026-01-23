# @skillkit/core

[![npm version](https://img.shields.io/npm/v/@skillkit/core.svg)](https://www.npmjs.com/package/@skillkit/core)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

**Core engine for SkillKit** - skill discovery, cross-agent translation, recommendations, session memory, testing, and workflow orchestration.

## Installation

```bash
npm install @skillkit/core
```

## Key Features

- **Skill Discovery**: Find and parse SKILL.md files from any source
- **Cross-Agent Translation**: Convert skills between 17 agent formats (Claude Code, Cursor, Windsurf, etc.)
- **Project Context Detection**: Analyze project stack, dependencies, and configurations
- **Smart Recommendations**: AI-powered skill suggestions based on project profile
- **Session Memory**: Capture and persist learnings across AI coding sessions
- **Skill Testing**: Test framework with assertions for skill validation
- **Workflow Orchestration**: Compose skills into multi-step workflows
- **Marketplace Aggregation**: Browse and search curated skill repositories

## Usage

### Skill Discovery

```typescript
import { findAllSkills, discoverSkills, parseSkill } from '@skillkit/core';

// Find all installed skills
const skills = findAllSkills(['.claude/skills', '.cursor/skills']);

// Discover skills from a repository
const repoSkills = await discoverSkills('anthropics/skills');

// Parse a single skill file
const skill = parseSkill('./my-skill/SKILL.md');
```

### Cross-Agent Translation

```typescript
import { translateSkill, translateSkillFile, TranslatorRegistry } from '@skillkit/core';

// Translate skill content to Cursor format
const result = translateSkill(skillContent, 'cursor');
console.log(result.content); // MDC format for Cursor

// Translate a skill file
const translated = await translateSkillFile('./skill.md', 'windsurf');

// Get available translators
const registry = new TranslatorRegistry();
const formats = registry.getSupportedFormats();
```

### Project Context & Recommendations

```typescript
import { ProjectDetector, RecommendationEngine, ContextManager } from '@skillkit/core';

// Detect project context
const detector = new ProjectDetector();
const profile = await detector.analyze('./my-project');
// profile.stack includes: languages, frameworks, libraries, testing tools, etc.

// Get skill recommendations
const engine = new RecommendationEngine();
const recommendations = engine.recommend(profile, availableSkills);
// Returns skills sorted by match score

// Manage project context
const ctx = new ContextManager('./my-project');
await ctx.init();
const context = ctx.getContext();
```

### Session Memory

```typescript
import {
  createMemoryCompressor,
  createMemoryInjector,
  LearningStore,
  ObservationStore,
} from '@skillkit/core';

// Compress observations into learnings
const compressor = createMemoryCompressor('./my-project');
const learnings = compressor.compress();

// Inject relevant memories into prompts
const injector = createMemoryInjector('./my-project');
const memories = injector.search('authentication patterns');

// Manage learnings directly
const store = new LearningStore('./my-project');
const learning = store.add({
  title: 'React hooks best practices',
  content: 'Always cleanup effects...',
  tags: ['react', 'hooks'],
});
```

### Skill Testing

```typescript
import { SkillTestRunner, parseTestCases } from '@skillkit/core';

// Run skill tests
const runner = new SkillTestRunner('./my-project');
const results = await runner.runAll();

// Run specific tests
const result = await runner.run('./my-skill', {
  tags: ['unit'],
  verbose: true,
});

// Parse test cases from skill
const testCases = parseTestCases(skillContent);
```

### Workflow Orchestration

```typescript
import { WorkflowOrchestrator, parseWorkflow, WorkflowStore } from '@skillkit/core';

// Parse and run a workflow
const workflow = parseWorkflow('./workflow.yaml');
const orchestrator = new WorkflowOrchestrator(workflow);
await orchestrator.execute();

// Manage workflows
const store = new WorkflowStore('./my-project');
const workflows = store.list();
```

### Marketplace

```typescript
import { createMarketplaceAggregator, MarketplaceSource } from '@skillkit/core';

// Browse skill marketplace
const marketplace = createMarketplaceAggregator();
const results = await marketplace.search({ query: 'react' });

// Filter by tags
const filtered = await marketplace.search({
  query: 'authentication',
  tags: ['security', 'auth'],
  limit: 10,
});
```

## Supported Agents

The translator supports all 17 SkillKit-compatible agents:

| Agent | Format |
|-------|--------|
| Claude Code | SKILL.md |
| Cursor | MDC (.mdc) |
| Codex | SKILL.md |
| Gemini CLI | SKILL.md |
| Windsurf | Markdown |
| GitHub Copilot | Markdown |
| OpenCode, Antigravity, Amp, Goose, Kilo, Kiro, Roo, Trae | SKILL.md |
| Universal | SKILL.md |

## API Reference

### Skill Types

```typescript
interface CanonicalSkill {
  name: string;
  description?: string;
  version?: string;
  author?: string;
  tags?: string[];
  globs?: string[];
  alwaysApply?: boolean;
  content: string;
  metadata?: Record<string, unknown>;
}

interface TranslationResult {
  content: string;
  format: string;
  warnings?: string[];
}
```

### Context Types

```typescript
interface ProjectProfile {
  name: string;
  type: 'web-app' | 'api' | 'cli' | 'library' | 'unknown';
  stack: {
    languages: Detection[];
    frameworks: Detection[];
    libraries: Detection[];
    testing: Detection[];
    databases: Detection[];
  };
}
```

## Documentation

Full documentation: https://github.com/rohitg00/skillkit

## License

Apache-2.0
