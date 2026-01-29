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

const ALL_AGENTS: AgentType[] = Object.keys(AGENT_CONFIG) as AgentType[];

type OutputFormat = 'markdown' | 'mdc' | 'json' | 'xml';

interface FormatRenderer {
  h1(text: string): string;
  h2(text: string): string;
  h3(text: string): string;
  bold(text: string): string;
  code(text: string): string;
  codeBlock(code: string, lang?: string): string;
  list(items: string[]): string;
  keyValue(key: string, value: string): string;
  paragraph(text: string): string;
  separator(): string;
  wrap(content: string, metadata?: Record<string, unknown>): string;
}

const markdownRenderer: FormatRenderer = {
  h1: (text) => `# ${text}`,
  h2: (text) => `## ${text}`,
  h3: (text) => `### ${text}`,
  bold: (text) => `**${text}**`,
  code: (text) => `\`${text}\``,
  codeBlock: (code, lang = '') => `\`\`\`${lang}\n${code}\n\`\`\``,
  list: (items) => items.map(item => `- ${item}`).join('\n'),
  keyValue: (key, value) => `**${key}:** ${value}`,
  paragraph: (text) => text,
  separator: () => '',
  wrap: (content) => content,
};

const mdcRenderer: FormatRenderer = {
  h1: (text) => `# ${text}`,
  h2: (text) => `## ${text}`,
  h3: (text) => `### ${text}`,
  bold: (text) => `**${text}**`,
  code: (text) => `\`${text}\``,
  codeBlock: (code, lang = '') => `\`\`\`${lang}\n${code}\n\`\`\``,
  list: (items) => items.map(item => `- ${item}`).join('\n'),
  keyValue: (key, value) => `**${key}:** ${value}`,
  paragraph: (text) => text,
  separator: () => '',
  wrap: (content, metadata) => {
    if (metadata && Object.keys(metadata).length > 0) {
      const yaml = Object.entries(metadata)
        .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
        .join('\n');
      return `---\n${yaml}\n---\n\n${content}`;
    }
    return content;
  },
};

const jsonRenderer: FormatRenderer = {
  h1: (text) => text,
  h2: (text) => text,
  h3: (text) => text,
  bold: (text) => text,
  code: (text) => text,
  codeBlock: (code) => code,
  list: (items) => items.join(', '),
  keyValue: (key, value) => `${key}: ${value}`,
  paragraph: (text) => text,
  separator: () => '',
  wrap: (content, metadata) => {
    try {
      const data = { ...metadata, content };
      return JSON.stringify(data, null, 2);
    } catch {
      return content;
    }
  },
};

const xmlRenderer: FormatRenderer = {
  h1: (text) => `<h1>${escapeXml(text)}</h1>`,
  h2: (text) => `<h2>${escapeXml(text)}</h2>`,
  h3: (text) => `<h3>${escapeXml(text)}</h3>`,
  bold: (text) => `<strong>${escapeXml(text)}</strong>`,
  code: (text) => `<code>${escapeXml(text)}</code>`,
  codeBlock: (code, lang = '') => `<pre${lang ? ` lang="${lang}"` : ''}><code>${escapeXml(code)}</code></pre>`,
  list: (items) => `<ul>\n${items.map(item => `  <li>${escapeXml(item)}</li>`).join('\n')}\n</ul>`,
  keyValue: (key, value) => `<dt>${escapeXml(key)}</dt><dd>${escapeXml(value)}</dd>`,
  paragraph: (text) => `<p>${escapeXml(text)}</p>`,
  separator: () => '',
  wrap: (content, metadata) => {
    const attrs = metadata
      ? Object.entries(metadata).map(([k, v]) => `${k}="${escapeXml(String(v))}"`).join(' ')
      : '';
    return `<?xml version="1.0" encoding="UTF-8"?>\n<instructions${attrs ? ' ' + attrs : ''}>\n${content}\n</instructions>`;
  },
};

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function getRenderer(format: OutputFormat): FormatRenderer {
  switch (format) {
    case 'mdc':
      return mdcRenderer;
    case 'json':
      return jsonRenderer;
    case 'xml':
      return xmlRenderer;
    default:
      return markdownRenderer;
  }
}

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
    const formatMap: Record<string, OutputFormat> = {
      '.md': 'markdown',
      '.json': 'json',
      '.mdc': 'mdc',
      '.xml': 'xml',
    };
    const ext = config.configFile.includes('.')
      ? '.' + config.configFile.split('.').pop()
      : '.md';
    const format = formatMap[ext] || 'markdown';

    return {
      agent,
      filename: config.configFile,
      format,
      sectionOrder: ['overview', 'stack', 'commands', 'conventions', 'structure', 'guidelines'],
    };
  }

  private generateContent(template: AgentInstructionTemplate): string {
    if (!this.analysis) return '';

    const format = template.format as OutputFormat;
    const renderer = getRenderer(format);

    if (format === 'json') {
      return this.generateJsonContent(template);
    }

    const sections: string[] = [];

    for (const section of template.sectionOrder) {
      const content = this.generateSection(section, template, renderer);
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
      result += '\n\n' + renderer.h2('Custom Instructions') + '\n\n' + this.options.customInstructions;
    }

    const metadata = format === 'mdc' ? {
      title: this.analysis.project.name,
      type: this.analysis.project.type,
      generated: new Date().toISOString(),
    } : undefined;

    return renderer.wrap(result, metadata);
  }

  private generateJsonContent(template: AgentInstructionTemplate): string {
    if (!this.analysis) return '{}';

    const data: Record<string, unknown> = {
      project: this.analysis.project,
      languages: this.analysis.languages.map(l => l.name),
      packageManagers: this.analysis.packageManagers,
      stack: {
        frameworks: this.analysis.stack.frameworks.map(f => ({ name: f.name, version: f.version })),
        libraries: this.analysis.stack.libraries.map(l => ({ name: l.name, version: l.version })),
        styling: this.analysis.stack.styling.map(s => s.name),
        testing: this.analysis.stack.testing.map(t => t.name),
        databases: this.analysis.stack.databases.map(d => d.name),
      },
      commands: this.analysis.buildCommands,
      conventions: this.analysis.conventions,
      structure: this.analysis.structure,
      importantFiles: this.analysis.importantFiles,
      generated: {
        agent: template.agent,
        timestamp: new Date().toISOString(),
      },
    };

    if (this.options.customInstructions) {
      data.customInstructions = this.options.customInstructions;
    }

    return JSON.stringify(data, null, 2);
  }

  private generateSection(section: string, template: AgentInstructionTemplate, renderer: FormatRenderer): string {
    if (!this.analysis) return '';

    switch (section) {
      case 'overview':
        return this.generateOverviewSection(renderer);
      case 'stack':
        return this.generateStackSection(renderer);
      case 'commands':
        return this.generateCommandsSection(renderer);
      case 'conventions':
        return this.generateConventionsSection(renderer);
      case 'structure':
        return this.generateStructureSection(renderer);
      case 'guidelines':
        return this.generateGuidelinesSection(template.agent, renderer);
      default:
        return '';
    }
  }

  private generateOverviewSection(renderer: FormatRenderer): string {
    if (!this.analysis) return '';

    const { project, languages } = this.analysis;
    const lines: string[] = [];

    lines.push(renderer.h1(project.name));
    lines.push('');

    if (project.description) {
      lines.push(renderer.paragraph(project.description));
      lines.push('');
    }

    if (project.type) {
      lines.push(renderer.keyValue('Project Type', this.formatProjectType(project.type)));
    }

    if (languages.length > 0) {
      const langNames = languages.map(l => this.capitalize(l.name)).join(', ');
      lines.push(renderer.keyValue('Languages', langNames));
    }

    if (project.version) {
      lines.push(renderer.keyValue('Version', project.version));
    }

    return lines.join('\n');
  }

  private generateStackSection(renderer: FormatRenderer): string {
    if (!this.analysis) return '';

    const { stack, packageManagers } = this.analysis;
    const lines: string[] = [];

    lines.push(renderer.h2('Technology Stack'));
    lines.push('');

    if (stack.frameworks.length > 0) {
      lines.push(renderer.h3('Frameworks'));
      const items = stack.frameworks.map(fw => {
        const version = fw.version ? ` (${fw.version})` : '';
        return `${this.capitalize(fw.name)}${version}`;
      });
      lines.push(renderer.list(items));
      lines.push('');
    }

    if (stack.libraries.length > 0) {
      lines.push(renderer.h3('Libraries'));
      const items = stack.libraries.map(lib => {
        const version = lib.version ? ` (${lib.version})` : '';
        return `${this.capitalize(lib.name)}${version}`;
      });
      lines.push(renderer.list(items));
      lines.push('');
    }

    if (stack.styling.length > 0) {
      lines.push(renderer.h3('Styling'));
      lines.push(renderer.list(stack.styling.map(s => this.capitalize(s.name))));
      lines.push('');
    }

    if (stack.testing.length > 0) {
      lines.push(renderer.h3('Testing'));
      lines.push(renderer.list(stack.testing.map(t => this.capitalize(t.name))));
      lines.push('');
    }

    if (stack.databases.length > 0) {
      lines.push(renderer.h3('Databases'));
      lines.push(renderer.list(stack.databases.map(d => this.capitalize(d.name))));
      lines.push('');
    }

    if (packageManagers.length > 0) {
      lines.push(renderer.h3('Package Manager'));
      lines.push(renderer.list([packageManagers.map(pm => this.capitalize(pm)).join(', ')]));
      lines.push('');
    }

    return lines.join('\n');
  }

  private generateCommandsSection(renderer: FormatRenderer): string {
    if (!this.analysis || !this.analysis.buildCommands) return '';

    const { buildCommands } = this.analysis;
    const lines: string[] = [];
    const commands: string[] = [];

    lines.push(renderer.h2('Development Commands'));
    lines.push('');

    if (buildCommands.install) {
      commands.push(`# Install dependencies`);
      commands.push(buildCommands.install);
      commands.push('');
    }

    if (buildCommands.dev) {
      commands.push(`# Start development server`);
      commands.push(buildCommands.dev);
      commands.push('');
    }

    if (buildCommands.build) {
      commands.push(`# Build for production`);
      commands.push(buildCommands.build);
      commands.push('');
    }

    if (buildCommands.test) {
      commands.push(`# Run tests`);
      commands.push(buildCommands.test);
      commands.push('');
    }

    if (buildCommands.lint) {
      commands.push(`# Run linter`);
      commands.push(buildCommands.lint);
      commands.push('');
    }

    if (buildCommands.format) {
      commands.push(`# Format code`);
      commands.push(buildCommands.format);
    }

    lines.push(renderer.codeBlock(commands.join('\n'), 'bash'));

    return lines.join('\n');
  }

  private generateConventionsSection(renderer: FormatRenderer): string {
    if (!this.analysis) return '';

    const { conventions, patterns } = this.analysis;
    const lines: string[] = [];

    lines.push(renderer.h2('Code Conventions'));
    lines.push('');

    if (conventions) {
      const items: string[] = [];
      if (conventions.indentation) {
        items.push(`${renderer.bold('Indentation:')} ${conventions.indentation}`);
      }
      if (conventions.quotes) {
        items.push(`${renderer.bold('Quotes:')} ${conventions.quotes}`);
      }
      if (conventions.semicolons !== undefined) {
        items.push(`${renderer.bold('Semicolons:')} ${conventions.semicolons ? 'required' : 'omitted'}`);
      }
      if (conventions.trailingCommas) {
        items.push(`${renderer.bold('Trailing Commas:')} ${conventions.trailingCommas}`);
      }
      if (conventions.maxLineLength) {
        items.push(`${renderer.bold('Max Line Length:')} ${conventions.maxLineLength}`);
      }
      if (items.length > 0) {
        lines.push(renderer.list(items));
      }
    }

    if (patterns) {
      lines.push('');
      lines.push(renderer.h3('Patterns'));
      const items: string[] = [];
      if (patterns.components) {
        items.push(`${renderer.bold('Components:')} ${patterns.components}`);
      }
      if (patterns.stateManagement) {
        items.push(`${renderer.bold('State Management:')} ${patterns.stateManagement}`);
      }
      if (patterns.apiStyle) {
        items.push(`${renderer.bold('API Style:')} ${patterns.apiStyle}`);
      }
      if (patterns.styling) {
        items.push(`${renderer.bold('Styling:')} ${patterns.styling}`);
      }
      if (patterns.testing) {
        items.push(`${renderer.bold('Testing:')} ${patterns.testing}`);
      }
      if (patterns.linting) {
        items.push(`${renderer.bold('Linting:')} ${patterns.linting}`);
      }
      if (patterns.formatting) {
        items.push(`${renderer.bold('Formatting:')} ${patterns.formatting}`);
      }
      if (items.length > 0) {
        lines.push(renderer.list(items));
      }
    }

    return lines.join('\n');
  }

  private generateStructureSection(renderer: FormatRenderer): string {
    if (!this.analysis) return '';

    const { structure, importantFiles } = this.analysis;
    const lines: string[] = [];

    lines.push(renderer.h2('Project Structure'));
    lines.push('');

    if (structure) {
      if (structure.type) {
        lines.push(renderer.keyValue('Structure Type', structure.type));
      }
      if (structure.srcDir) {
        lines.push(renderer.keyValue('Source Directory', renderer.code(`${structure.srcDir}/`)));
      }
      if (structure.testDir) {
        lines.push(renderer.keyValue('Test Directory', renderer.code(`${structure.testDir}/`)));
      }
      if (structure.hasWorkspaces && structure.workspaces) {
        lines.push(renderer.keyValue('Workspaces', structure.workspaces.join(', ')));
      }
      lines.push('');
    }

    if (importantFiles.length > 0) {
      lines.push(renderer.h3('Important Files'));
      lines.push(renderer.list(importantFiles.slice(0, 15).map(f => renderer.code(f))));
    }

    return lines.join('\n');
  }

  private generateGuidelinesSection(_agent: AgentType, renderer: FormatRenderer): string {
    if (!this.analysis) return '';

    const { stack, patterns } = this.analysis;
    const lines: string[] = [];

    lines.push(renderer.h2('Development Guidelines'));
    lines.push('');

    const hasReact = stack.frameworks.some(f => f.name === 'react' || f.name === 'nextjs');
    const hasVue = stack.frameworks.some(f => f.name === 'vue' || f.name === 'nuxt');
    const hasTypeScript = this.analysis.languages.some(l => l.name === 'typescript');
    const hasTailwind = stack.styling.some(s => s.name === 'tailwindcss');
    const hasPrisma = stack.databases.some(d => d.name === 'prisma');
    const hasZod = stack.libraries.some(l => l.name === 'zod');

    if (hasTypeScript) {
      lines.push(renderer.h3('TypeScript'));
      lines.push(renderer.list([
        'Use strict TypeScript with proper type annotations',
        'Prefer `interface` for object types, `type` for unions/intersections',
        'Avoid `any` - use `unknown` when type is uncertain',
      ]));
      lines.push('');
    }

    if (hasReact) {
      lines.push(renderer.h3('React'));
      const reactItems = [
        'Use functional components with hooks',
        'Prefer composition over inheritance',
        'Keep components small and focused',
      ];
      if (patterns?.stateManagement) {
        reactItems.push(`Use ${patterns.stateManagement} for state management`);
      }
      lines.push(renderer.list(reactItems));
      lines.push('');
    }

    if (hasVue) {
      lines.push(renderer.h3('Vue'));
      lines.push(renderer.list([
        'Use Composition API with `<script setup>`',
        'Keep components small and focused',
      ]));
      lines.push('');
    }

    if (hasTailwind) {
      lines.push(renderer.h3('Styling'));
      lines.push(renderer.list([
        'Use Tailwind CSS utility classes',
        'Follow mobile-first responsive design',
        'Extract repeated patterns to components',
      ]));
      lines.push('');
    }

    if (hasPrisma) {
      lines.push(renderer.h3('Database'));
      lines.push(renderer.list([
        'Use Prisma for database operations',
        'Keep database queries in dedicated service files',
        'Use transactions for related operations',
      ]));
      lines.push('');
    }

    if (hasZod) {
      lines.push(renderer.h3('Validation'));
      lines.push(renderer.list([
        'Use Zod for runtime validation',
        'Define schemas alongside types',
      ]));
      lines.push('');
    }

    lines.push(renderer.h3('General'));
    lines.push(renderer.list([
      'Follow existing code patterns and conventions',
      'Write clear, self-documenting code',
      'Keep functions small and focused',
      'Add tests for new functionality',
    ]));

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
