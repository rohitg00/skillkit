import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import type { AgentType } from '../types.js';
import { AGENT_CONFIG, type AgentDirectoryConfig } from '../agent-config.js';
import type {
  PrimerAnalysis,
  PrimerOptions,
  PrimerResult,
  GeneratedInstruction,
  AgentInstructionTemplate,
} from './types.js';
import { AGENT_INSTRUCTION_TEMPLATES } from './types.js';
import { analyzePrimer } from './analyzer.js';

const ALL_AGENTS: AgentType[] = [
  'claude-code',
  'cursor',
  'codex',
  'gemini-cli',
  'opencode',
  'antigravity',
  'amp',
  'clawdbot',
  'droid',
  'github-copilot',
  'goose',
  'kilo',
  'kiro-cli',
  'roo',
  'trae',
  'windsurf',
  'universal',
  'cline',
  'codebuddy',
  'commandcode',
  'continue',
  'crush',
  'factory',
  'mcpjam',
  'mux',
  'neovate',
  'openhands',
  'pi',
  'qoder',
  'qwen',
  'vercel',
  'zencoder',
];

export class PrimerGenerator {
  private projectPath: string;
  private options: PrimerOptions;
  private analysis: PrimerAnalysis | null = null;

  constructor(projectPath: string, options: PrimerOptions = {}) {
    this.projectPath = projectPath;
    this.options = options;
  }

  generate(): PrimerResult {
    const warnings: string[] = [];
    const errors: string[] = [];
    const generated: GeneratedInstruction[] = [];
    const seenPaths = new Map<string, string>();

    this.analysis = analyzePrimer(this.projectPath);

    if (this.options.analyzeOnly) {
      return {
        success: true,
        analysis: this.analysis,
        generated: [],
        warnings,
        errors,
      };
    }

    const targetAgents = this.getTargetAgents();

    for (const agent of targetAgents) {
      try {
        const instruction = this.generateForAgent(agent);
        if (instruction) {
          const existingAgent = seenPaths.get(instruction.filepath);
          if (existingAgent) {
            warnings.push(
              `Skipping ${agent}: output path "${instruction.filename}" already used by ${existingAgent}`
            );
            continue;
          }
          seenPaths.set(instruction.filepath, agent);

          if (!this.options.dryRun) {
            this.writeInstruction(instruction);
          }
          generated.push(instruction);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        errors.push(`Failed to generate for ${agent}: ${message}`);
      }
    }

    return {
      success: errors.length === 0,
      analysis: this.analysis,
      generated,
      warnings,
      errors,
    };
  }

  private getTargetAgents(): AgentType[] {
    if (this.options.allAgents) {
      return ALL_AGENTS;
    }

    if (this.options.agents && this.options.agents.length > 0) {
      return this.options.agents;
    }

    return this.detectInstalledAgents();
  }

  private detectInstalledAgents(): AgentType[] {
    const detected: AgentType[] = [];

    for (const [agent, config] of Object.entries(AGENT_CONFIG)) {
      const configPath = join(this.projectPath, config.configFile);
      const skillsPath = join(this.projectPath, config.skillsDir);

      if (existsSync(configPath) || existsSync(skillsPath)) {
        detected.push(agent as AgentType);
      }

      if (config.altSkillsDirs) {
        for (const altDir of config.altSkillsDirs) {
          if (existsSync(join(this.projectPath, altDir))) {
            if (!detected.includes(agent as AgentType)) {
              detected.push(agent as AgentType);
            }
            break;
          }
        }
      }
    }

    if (detected.length === 0) {
      detected.push('claude-code', 'cursor', 'github-copilot');
    }

    return detected;
  }

  private generateForAgent(agent: AgentType): GeneratedInstruction | null {
    if (!this.analysis) return null;

    const config = AGENT_CONFIG[agent];
    const template = AGENT_INSTRUCTION_TEMPLATES[agent] || this.getDefaultTemplate(agent, config);

    const content = this.generateContent(template);
    const outputDir = this.options.outputDir || this.projectPath;
    const filepath = join(outputDir, template.filename);

    return {
      agent,
      filename: template.filename,
      filepath,
      content,
      format: template.format,
    };
  }

  private getDefaultTemplate(agent: AgentType, config: AgentDirectoryConfig): AgentInstructionTemplate {
    return {
      agent,
      filename: config.configFile,
      format: 'markdown',
      sectionOrder: ['overview', 'stack', 'commands', 'conventions', 'structure', 'guidelines'],
    };
  }

  private generateContent(template: AgentInstructionTemplate): string {
    if (!this.analysis) return '';

    const sections: string[] = [];

    for (const section of template.sectionOrder) {
      const content = this.generateSection(section, template);
      if (content) {
        sections.push(content);
      }
    }

    let result = sections.join('\n\n');

    if (template.header) {
      result = template.header + '\n\n' + result;
    }

    if (template.footer) {
      result = result + '\n\n' + template.footer;
    }

    if (this.options.customInstructions) {
      result += '\n\n## Custom Instructions\n\n' + this.options.customInstructions;
    }

    return result;
  }

  private generateSection(section: string, template: AgentInstructionTemplate): string {
    if (!this.analysis) return '';

    switch (section) {
      case 'overview':
        return this.generateOverviewSection();
      case 'stack':
        return this.generateStackSection();
      case 'commands':
        return this.generateCommandsSection();
      case 'conventions':
        return this.generateConventionsSection();
      case 'structure':
        return this.generateStructureSection();
      case 'guidelines':
        return this.generateGuidelinesSection(template.agent);
      default:
        return '';
    }
  }

  private generateOverviewSection(): string {
    if (!this.analysis) return '';

    const { project, languages } = this.analysis;
    const lines: string[] = [];

    lines.push(`# ${project.name}`);
    lines.push('');

    if (project.description) {
      lines.push(project.description);
      lines.push('');
    }

    if (project.type) {
      lines.push(`**Project Type:** ${this.formatProjectType(project.type)}`);
    }

    if (languages.length > 0) {
      const langNames = languages.map(l => this.capitalize(l.name)).join(', ');
      lines.push(`**Languages:** ${langNames}`);
    }

    if (project.version) {
      lines.push(`**Version:** ${project.version}`);
    }

    return lines.join('\n');
  }

  private generateStackSection(): string {
    if (!this.analysis) return '';

    const { stack, packageManagers } = this.analysis;
    const lines: string[] = [];

    lines.push('## Technology Stack');
    lines.push('');

    if (stack.frameworks.length > 0) {
      lines.push('### Frameworks');
      for (const fw of stack.frameworks) {
        const version = fw.version ? ` (${fw.version})` : '';
        lines.push(`- ${this.capitalize(fw.name)}${version}`);
      }
      lines.push('');
    }

    if (stack.libraries.length > 0) {
      lines.push('### Libraries');
      for (const lib of stack.libraries) {
        const version = lib.version ? ` (${lib.version})` : '';
        lines.push(`- ${this.capitalize(lib.name)}${version}`);
      }
      lines.push('');
    }

    if (stack.styling.length > 0) {
      lines.push('### Styling');
      for (const style of stack.styling) {
        lines.push(`- ${this.capitalize(style.name)}`);
      }
      lines.push('');
    }

    if (stack.testing.length > 0) {
      lines.push('### Testing');
      for (const test of stack.testing) {
        lines.push(`- ${this.capitalize(test.name)}`);
      }
      lines.push('');
    }

    if (stack.databases.length > 0) {
      lines.push('### Databases');
      for (const db of stack.databases) {
        lines.push(`- ${this.capitalize(db.name)}`);
      }
      lines.push('');
    }

    if (packageManagers.length > 0) {
      lines.push('### Package Manager');
      lines.push(`- ${packageManagers.map(pm => this.capitalize(pm)).join(', ')}`);
      lines.push('');
    }

    return lines.join('\n');
  }

  private generateCommandsSection(): string {
    if (!this.analysis || !this.analysis.buildCommands) return '';

    const { buildCommands } = this.analysis;
    const lines: string[] = [];

    lines.push('## Development Commands');
    lines.push('');
    lines.push('```bash');

    if (buildCommands.install) {
      lines.push(`# Install dependencies`);
      lines.push(buildCommands.install);
      lines.push('');
    }

    if (buildCommands.dev) {
      lines.push(`# Start development server`);
      lines.push(buildCommands.dev);
      lines.push('');
    }

    if (buildCommands.build) {
      lines.push(`# Build for production`);
      lines.push(buildCommands.build);
      lines.push('');
    }

    if (buildCommands.test) {
      lines.push(`# Run tests`);
      lines.push(buildCommands.test);
      lines.push('');
    }

    if (buildCommands.lint) {
      lines.push(`# Run linter`);
      lines.push(buildCommands.lint);
      lines.push('');
    }

    if (buildCommands.format) {
      lines.push(`# Format code`);
      lines.push(buildCommands.format);
    }

    lines.push('```');

    return lines.join('\n');
  }

  private generateConventionsSection(): string {
    if (!this.analysis) return '';

    const { conventions, patterns } = this.analysis;
    const lines: string[] = [];

    lines.push('## Code Conventions');
    lines.push('');

    if (conventions) {
      if (conventions.indentation) {
        lines.push(`- **Indentation:** ${conventions.indentation}`);
      }
      if (conventions.quotes) {
        lines.push(`- **Quotes:** ${conventions.quotes}`);
      }
      if (conventions.semicolons !== undefined) {
        lines.push(`- **Semicolons:** ${conventions.semicolons ? 'required' : 'omitted'}`);
      }
      if (conventions.trailingCommas) {
        lines.push(`- **Trailing Commas:** ${conventions.trailingCommas}`);
      }
      if (conventions.maxLineLength) {
        lines.push(`- **Max Line Length:** ${conventions.maxLineLength}`);
      }
    }

    if (patterns) {
      lines.push('');
      lines.push('### Patterns');
      if (patterns.components) {
        lines.push(`- **Components:** ${patterns.components}`);
      }
      if (patterns.stateManagement) {
        lines.push(`- **State Management:** ${patterns.stateManagement}`);
      }
      if (patterns.apiStyle) {
        lines.push(`- **API Style:** ${patterns.apiStyle}`);
      }
      if (patterns.styling) {
        lines.push(`- **Styling:** ${patterns.styling}`);
      }
      if (patterns.testing) {
        lines.push(`- **Testing:** ${patterns.testing}`);
      }
      if (patterns.linting) {
        lines.push(`- **Linting:** ${patterns.linting}`);
      }
      if (patterns.formatting) {
        lines.push(`- **Formatting:** ${patterns.formatting}`);
      }
    }

    return lines.join('\n');
  }

  private generateStructureSection(): string {
    if (!this.analysis) return '';

    const { structure, importantFiles } = this.analysis;
    const lines: string[] = [];

    lines.push('## Project Structure');
    lines.push('');

    if (structure) {
      if (structure.type) {
        lines.push(`**Structure Type:** ${structure.type}`);
      }
      if (structure.srcDir) {
        lines.push(`**Source Directory:** \`${structure.srcDir}/\``);
      }
      if (structure.testDir) {
        lines.push(`**Test Directory:** \`${structure.testDir}/\``);
      }
      if (structure.hasWorkspaces && structure.workspaces) {
        lines.push(`**Workspaces:** ${structure.workspaces.join(', ')}`);
      }
      lines.push('');
    }

    if (importantFiles.length > 0) {
      lines.push('### Important Files');
      for (const file of importantFiles.slice(0, 15)) {
        lines.push(`- \`${file}\``);
      }
    }

    return lines.join('\n');
  }

  private generateGuidelinesSection(_agent: AgentType): string {
    if (!this.analysis) return '';

    const { stack, patterns } = this.analysis;
    const lines: string[] = [];

    lines.push('## Development Guidelines');
    lines.push('');

    const hasReact = stack.frameworks.some(f => f.name === 'react' || f.name === 'nextjs');
    const hasVue = stack.frameworks.some(f => f.name === 'vue' || f.name === 'nuxt');
    const hasTypeScript = this.analysis.languages.some(l => l.name === 'typescript');
    const hasTailwind = stack.styling.some(s => s.name === 'tailwindcss');
    const hasPrisma = stack.databases.some(d => d.name === 'prisma');
    const hasZod = stack.libraries.some(l => l.name === 'zod');

    if (hasTypeScript) {
      lines.push('### TypeScript');
      lines.push('- Use strict TypeScript with proper type annotations');
      lines.push('- Prefer `interface` for object types, `type` for unions/intersections');
      lines.push('- Avoid `any` - use `unknown` when type is uncertain');
      lines.push('');
    }

    if (hasReact) {
      lines.push('### React');
      lines.push('- Use functional components with hooks');
      lines.push('- Prefer composition over inheritance');
      lines.push('- Keep components small and focused');
      if (patterns?.stateManagement) {
        lines.push(`- Use ${patterns.stateManagement} for state management`);
      }
      lines.push('');
    }

    if (hasVue) {
      lines.push('### Vue');
      lines.push('- Use Composition API with `<script setup>`');
      lines.push('- Keep components small and focused');
      lines.push('');
    }

    if (hasTailwind) {
      lines.push('### Styling');
      lines.push('- Use Tailwind CSS utility classes');
      lines.push('- Follow mobile-first responsive design');
      lines.push('- Extract repeated patterns to components');
      lines.push('');
    }

    if (hasPrisma) {
      lines.push('### Database');
      lines.push('- Use Prisma for database operations');
      lines.push('- Keep database queries in dedicated service files');
      lines.push('- Use transactions for related operations');
      lines.push('');
    }

    if (hasZod) {
      lines.push('### Validation');
      lines.push('- Use Zod for runtime validation');
      lines.push('- Define schemas alongside types');
      lines.push('');
    }

    lines.push('### General');
    lines.push('- Follow existing code patterns and conventions');
    lines.push('- Write clear, self-documenting code');
    lines.push('- Keep functions small and focused');
    lines.push('- Add tests for new functionality');

    return lines.join('\n');
  }

  private writeInstruction(instruction: GeneratedInstruction): void {
    const dir = dirname(instruction.filepath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(instruction.filepath, instruction.content, 'utf-8');
  }

  private formatProjectType(type: string): string {
    const typeMap: Record<string, string> = {
      'web-app': 'Web Application',
      'api': 'API / Backend',
      'cli': 'CLI Tool',
      'library': 'Library / Package',
      'mobile': 'Mobile Application',
      'desktop': 'Desktop Application',
      'unknown': 'Project',
    };
    return typeMap[type] || type;
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

export function generatePrimer(projectPath: string, options: PrimerOptions = {}): PrimerResult {
  const generator = new PrimerGenerator(projectPath, options);
  return generator.generate();
}

export function generatePrimerForAgent(
  projectPath: string,
  agent: AgentType,
  options: Omit<PrimerOptions, 'agents' | 'allAgents'> = {}
): PrimerResult {
  return generatePrimer(projectPath, { ...options, agents: [agent] });
}

export function analyzeForPrimer(projectPath: string): PrimerAnalysis {
  const generator = new PrimerGenerator(projectPath, { analyzeOnly: true });
  const result = generator.generate();
  return result.analysis;
}
