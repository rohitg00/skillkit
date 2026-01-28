import React, { useState } from 'react';

interface DocSection {
  id: string;
  title: string;
  content: React.ReactNode;
}

const CodeBlock = ({ children, language = 'bash' }: { children: string; language?: string }) => (
  <pre className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 overflow-x-auto text-sm font-mono">
    <code className="text-zinc-300">{children}</code>
  </pre>
);

const Table = ({ headers, rows }: { headers: string[]; rows: string[][] }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="border-b border-zinc-700">
          {headers.map((h, i) => (
            <th key={i} className="text-left py-2 px-3 text-zinc-300 font-mono font-semibold">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="border-b border-zinc-800 hover:bg-zinc-900/50">
            {row.map((cell, j) => (
              <td key={j} className="py-2 px-3 text-zinc-400 font-mono">{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const sections: DocSection[] = [
  {
    id: 'overview',
    title: 'Overview',
    content: (
      <div className="space-y-4">
        <p className="text-zinc-300">
          SkillKit is a universal command-line interface (CLI) and programmatic toolkit for managing AI agent skills across 17+ AI coding platforms. It solves the fragmentation problem where each AI agent uses different skill formats and directory structures.
        </p>
        <h3 className="text-lg font-semibold text-white mt-6">Core Capabilities</h3>
        <ul className="list-disc list-inside space-y-2 text-zinc-400">
          <li><span className="text-white">Skill Discovery</span> - Browse 15,000+ skills from marketplace with AI-powered recommendations</li>
          <li><span className="text-white">Cross-Agent Translation</span> - Automatically convert skills between 17 agent-specific formats</li>
          <li><span className="text-white">Team Collaboration</span> - Share skills via .skills manifest files and publish to marketplace</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'installation',
    title: 'Installation',
    content: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Quick Start</h3>
        <CodeBlock>{`# Install globally via npm
npm install -g skillkit

# Or use npx directly
npx skillkit --help

# Or install via pnpm
pnpm add -g skillkit`}</CodeBlock>

        <h3 className="text-lg font-semibold text-white mt-6">Verify Installation</h3>
        <CodeBlock>{`skillkit --version
skillkit --help`}</CodeBlock>

        <h3 className="text-lg font-semibold text-white mt-6">First Steps</h3>
        <CodeBlock>{`# Initialize SkillKit in your project
skillkit init

# Browse available skills
skillkit marketplace

# Get AI-powered recommendations
skillkit recommend

# Install skills from a source
skillkit install anthropics/skills`}</CodeBlock>
      </div>
    ),
  },
  {
    id: 'architecture',
    title: 'Architecture',
    content: (
      <div className="space-y-4">
        <p className="text-zinc-300">
          SkillKit employs a three-tier design with clean separation of concerns:
        </p>

        <h3 className="text-lg font-semibold text-white mt-6">System Tiers</h3>
        <ul className="list-disc list-inside space-y-2 text-zinc-400">
          <li><span className="text-white">UI Tier</span> - CLI commands, Terminal UI (OpenTUI-based), and documentation website</li>
          <li><span className="text-white">Core Logic Tier</span> - @skillkit/core for business logic; @skillkit/agents for adapter implementations</li>
          <li><span className="text-white">Integration Tier</span> - File systems, Git repositories, marketplace APIs, and 17+ AI agents</li>
        </ul>

        <h3 className="text-lg font-semibold text-white mt-6">Monorepo Structure</h3>
        <CodeBlock language="text">{`skillkit-monorepo (pnpm workspace + Turbo)
├── apps/skillkit/          → Main CLI application (bin: skillkit, sk)
├── packages/core/          → Core business logic (no internal dependencies)
├── packages/agents/        → Agent adapters (depends on core)
├── packages/cli/           → Command implementations (depends on core, agents, tui)
├── packages/tui/           → Terminal UI (depends on core, agents)
└── docs/skillkit/          → Documentation website`}</CodeBlock>

        <h3 className="text-lg font-semibold text-white mt-6">Dependency Hierarchy</h3>
        <ul className="list-disc list-inside space-y-2 text-zinc-400">
          <li><code className="text-emerald-400">@skillkit/core</code> → Foundation (no SkillKit dependencies)</li>
          <li><code className="text-emerald-400">@skillkit/agents</code> → Adapters (depends on core)</li>
          <li><code className="text-emerald-400">@skillkit/cli</code>, <code className="text-emerald-400">@skillkit/tui</code> → UIs (depend on core and agents)</li>
          <li><code className="text-emerald-400">skillkit</code> app → Orchestrates all packages</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'agents',
    title: 'Supported Agents',
    content: (
      <div className="space-y-4">
        <p className="text-zinc-300">
          SkillKit supports 17+ AI coding agents with automatic format translation:
        </p>

        <Table
          headers={['Agent', 'Directory', 'Format']}
          rows={[
            ['Claude Code', '.claude/skills/', 'SKILL.md'],
            ['Cursor', '.cursor/skills/', '.mdc'],
            ['GitHub Copilot', '.github/skills/', 'Markdown'],
            ['Gemini CLI', '.gemini/skills/', 'SKILL.md'],
            ['Windsurf', '.windsurf/skills/', 'Markdown'],
            ['Codex', '.codex/skills/', 'SKILL.md'],
            ['OpenCode', '.opencode/skills/', 'SKILL.md'],
            ['Antigravity', '.antigravity/skills/', 'SKILL.md'],
            ['Amp', '.amp/skills/', 'SKILL.md'],
            ['Clawdbot', '.clawdbot/skills/', 'SKILL.md'],
            ['Droid', '.droid/skills/', 'SKILL.md'],
            ['Goose', '.goose/skills/', 'SKILL.md'],
            ['Kilo', '.kilo/skills/', 'SKILL.md'],
            ['Kiro CLI', '.kiro/skills/', 'SKILL.md'],
            ['Roo', '.roo/skills/', 'SKILL.md'],
            ['Trae', '.trae/skills/', 'SKILL.md'],
            ['Universal', 'skills/', 'SKILL.md'],
          ]}
        />
      </div>
    ),
  },
  {
    id: 'commands',
    title: 'CLI Commands',
    content: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Skill Management</h3>
        <CodeBlock>{`skillkit install <source>      # Install skills from source
skillkit remove <skill>        # Remove installed skill
skillkit update [skill]        # Update skills
skillkit list                  # List installed skills
skillkit sync                  # Sync skills across agents
skillkit enable <skill>        # Enable a skill
skillkit disable <skill>       # Disable a skill`}</CodeBlock>

        <h3 className="text-lg font-semibold text-white mt-6">Discovery</h3>
        <CodeBlock>{`skillkit recommend             # AI-powered skill recommendations
skillkit marketplace           # Browse marketplace skills
skillkit find <query>          # Search for skills
skillkit search <term>         # Search skill content`}</CodeBlock>

        <h3 className="text-lg font-semibold text-white mt-6">Translation</h3>
        <CodeBlock>{`skillkit translate --from claude --to cursor <skill>
skillkit agent translate <skill> --target cursor
skillkit context sync          # Sync context across agents`}</CodeBlock>

        <h3 className="text-lg font-semibold text-white mt-6">Team Collaboration</h3>
        <CodeBlock>{`skillkit manifest init         # Initialize .skills manifest
skillkit manifest add <source> # Add source to manifest
skillkit manifest install      # Install from manifest
skillkit publish               # Publish skill to marketplace
skillkit cicd init             # Setup CI/CD integration`}</CodeBlock>

        <h3 className="text-lg font-semibold text-white mt-6">Advanced</h3>
        <CodeBlock>{`skillkit ui                    # Launch Terminal UI
skillkit workflow              # Manage workflows
skillkit memory compress       # Compress memory
skillkit memory export         # Export memory
skillkit test                  # Run skill tests
skillkit validate              # Validate skill format & quality`}</CodeBlock>
      </div>
    ),
  },
  {
    id: 'configuration',
    title: 'Configuration',
    content: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Project Configuration (skillkit.yaml)</h3>
        <CodeBlock language="yaml">{`version: 1
agent: cursor
autoSync: true
enabledSkills:
  - pdf
  - xlsx
disabledSkills:
  - deprecated-skill`}</CodeBlock>

        <h3 className="text-lg font-semibold text-white mt-6">Team Manifest (.skills)</h3>
        <CodeBlock>{`# Team-wide skill sources
anthropics/skills
vercel-labs/agent-skills
./local-skills
owner/repo@v1.2.3`}</CodeBlock>

        <h3 className="text-lg font-semibold text-white mt-6">User Preferences (~/.skillkit/preferences.json)</h3>
        <CodeBlock language="json">{`{
  "lastSelectedAgents": ["claude", "cursor"],
  "autoSync": true,
  "marketplace": {
    "lastRefresh": "2024-01-01T00:00:00Z"
  }
}`}</CodeBlock>

        <h3 className="text-lg font-semibold text-white mt-6">File System Layout</h3>
        <CodeBlock language="text">{`project/
├── .skillkit/              # Project config & memory
├── .claude/skills/         # Claude Code skills
├── .cursor/skills/         # Cursor AI skills
├── .github/skills/         # GitHub Copilot skills
├── skills/                 # Universal format
└── .skills                 # Team manifest file

~/.skillkit/               # Global user config
├── preferences.json
├── memory/
└── cache/`}</CodeBlock>
      </div>
    ),
  },
  {
    id: 'api',
    title: 'API Reference',
    content: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Package Exports</h3>
        <p className="text-zinc-300">@skillkit/core provides multiple entry points for programmatic use:</p>

        <CodeBlock language="typescript">{`import { findAllSkills, findSkill } from '@skillkit/core/discovery';
import { parseSkillFile } from '@skillkit/core/parser';
import { translateSkill } from '@skillkit/core/translator';
import { syncContext } from '@skillkit/core/context';
import { getRecommendations } from '@skillkit/core/recommend';
import { evaluateSkillContent, getQualityGrade } from '@skillkit/core/quality';`}</CodeBlock>

        <h3 className="text-lg font-semibold text-white mt-6">Core Functions</h3>
        <CodeBlock language="typescript">{`// Discovery
findAllSkills(searchDirs: string[]): SkillInfo[]
findSkill(name: string, searchDirs: string[]): SkillInfo | null

// Parsing
parseSkillFile(filePath: string): ParsedSkill
parseSkillContent(content: string): ParsedSkill

// Translation
translateSkill(skill: ParsedSkill, targetAgent: AgentType): string
getAgentAdapter(agent: AgentType): AgentAdapter

// Quality Evaluation
evaluateSkillContent(content: string): QualityScore
evaluateSkillFile(filePath: string): QualityScore
getQualityGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F'
isHighQuality(score: QualityScore): boolean

// Recommendations
getRecommendations(context: ProjectContext): Recommendation[]`}</CodeBlock>

        <h3 className="text-lg font-semibold text-white mt-6">Type Definitions</h3>
        <CodeBlock language="typescript">{`interface SkillInfo {
  name: string;
  path: string;
  agent: AgentType;
  enabled: boolean;
}

interface ParsedSkill {
  name: string;
  description?: string;
  globs?: string[];
  triggers?: string[];
  content: string;
  frontmatter: Record<string, unknown>;
}

interface QualityScore {
  overall: number;
  structure: StructureScore;
  clarity: ClarityScore;
  specificity: SpecificityScore;
  advanced: AdvancedScore;
  warnings: string[];
  suggestions: string[];
}

type AgentType =
  | 'claude-code' | 'cursor' | 'codex' | 'gemini-cli'
  | 'opencode' | 'antigravity' | 'amp' | 'clawdbot'
  | 'droid' | 'github-copilot' | 'goose' | 'kilo'
  | 'kiro-cli' | 'roo' | 'trae' | 'windsurf' | 'universal';`}</CodeBlock>
      </div>
    ),
  },
  {
    id: 'skill-format',
    title: 'Skill Format',
    content: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">SKILL.md Structure</h3>
        <p className="text-zinc-300">Skills use YAML frontmatter followed by markdown content:</p>

        <CodeBlock language="markdown">{`---
name: my-skill
description: A helpful skill for coding tasks
globs:
  - "**/*.ts"
  - "**/*.tsx"
triggers:
  - "when working with TypeScript"
  - "when creating React components"
---

# My Skill

## When to Use

Use this skill when:
- Working with TypeScript files
- Creating React components

## Instructions

Follow these guidelines:

1. Always use TypeScript strict mode
2. Prefer functional components

\`\`\`typescript
function Example(): JSX.Element {
  return <div>Hello</div>;
}
\`\`\`

## Boundaries

This skill should NOT:
- Modify configuration files without asking
- Delete existing code without confirmation`}</CodeBlock>

        <h3 className="text-lg font-semibold text-white mt-6">Quality Scoring</h3>
        <p className="text-zinc-300">Skills are evaluated on four dimensions:</p>
        <Table
          headers={['Dimension', 'Weight', 'Criteria']}
          rows={[
            ['Structure', '35%', 'Metadata, description, triggers, examples, boundaries'],
            ['Clarity', '25%', 'Line count, token count, headers, readability'],
            ['Specificity', '25%', 'Concrete commands, file patterns, code examples'],
            ['Advanced', '15%', 'No deprecated patterns, security issues, completeness'],
          ]}
        />

        <h3 className="text-lg font-semibold text-white mt-6">Grade Scale</h3>
        <Table
          headers={['Grade', 'Score Range', 'Description']}
          rows={[
            ['A', '90-100', 'Excellent - Production ready'],
            ['B', '80-89', 'Good - Minor improvements possible'],
            ['C', '70-79', 'Acceptable - Some issues to address'],
            ['D', '60-69', 'Poor - Significant improvements needed'],
            ['F', '0-59', 'Failing - Major revision required'],
          ]}
        />
      </div>
    ),
  },
  {
    id: 'tech-stack',
    title: 'Technology Stack',
    content: (
      <div className="space-y-4">
        <Table
          headers={['Layer', 'Technology']}
          rows={[
            ['CLI Framework', 'Clipanion v4'],
            ['TUI Framework', '@opentui/react v0.1.75'],
            ['Validation', 'Zod v3.24'],
            ['YAML Parsing', 'yaml v2.6'],
            ['Git Operations', 'isomorphic-git v1.27'],
            ['HTTP Client', 'got v14.4'],
            ['Build System', 'Turbo v2.3, tsup v8.3, pnpm v9.0'],
            ['Testing', 'Vitest v2.1'],
            ['Runtime', 'Node.js 18+, Bun 1.2+ (for TUI)'],
          ]}
        />

        <h3 className="text-lg font-semibold text-white mt-6">Build Commands</h3>
        <CodeBlock>{`pnpm build              # Build all packages via Turbo
pnpm dev                # Watch mode development
pnpm test               # Unit tests via Vitest
pnpm test:e2e           # End-to-end tests
pnpm typecheck          # Type checking
pnpm clean              # Remove build artifacts`}</CodeBlock>
      </div>
    ),
  },
];

export function Documentation(): React.ReactElement {
  const [activeSection, setActiveSection] = useState('overview');

  const currentSection = sections.find(s => s.id === activeSection) || sections[0];

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2 font-mono">Documentation</h2>
        <p className="text-zinc-400 font-mono text-sm">
          Complete guide to using SkillKit
        </p>
        <a
          href="https://deepwiki.com/rohitg00/skillkit"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 mt-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <span>Powered by DeepWiki</span>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <nav className="lg:w-48 flex-shrink-0">
          <div className="sticky top-20 space-y-1">
            {sections.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full text-left px-3 py-2 text-sm font-mono rounded transition-colors ${
                  activeSection === section.id
                    ? 'bg-white text-black'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                {section.title}
              </button>
            ))}
          </div>
        </nav>

        <div className="flex-1 min-w-0">
          <div className="bg-surface border border-zinc-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-6 font-mono">{currentSection.title}</h2>
            <div className="prose prose-invert prose-zinc max-w-none">
              {currentSection.content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
