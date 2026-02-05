import type { LLMProvider } from '../providers/types.js';

export interface AgentConstraints {
  maxContextLength: number;
  supportsMarkdown: boolean;
  supportsMCP: boolean;
  supportsTools: boolean;
  format: string;
  fileExtension: string;
}

export interface OptimizationResult {
  content: string;
  agentId: string;
  changes: string[];
  estimatedTokens: number;
}

const AGENT_CONSTRAINTS: Record<string, AgentConstraints> = {
  'claude-code': {
    maxContextLength: 200000,
    supportsMarkdown: true,
    supportsMCP: true,
    supportsTools: true,
    format: 'SKILL.md',
    fileExtension: '.md',
  },
  cursor: {
    maxContextLength: 32000,
    supportsMarkdown: true,
    supportsMCP: false,
    supportsTools: false,
    format: '.cursorrules',
    fileExtension: '.cursorrules',
  },
  codex: {
    maxContextLength: 8000,
    supportsMarkdown: true,
    supportsMCP: false,
    supportsTools: false,
    format: 'concise-prompt',
    fileExtension: '.md',
  },
  'gemini-cli': {
    maxContextLength: 128000,
    supportsMarkdown: true,
    supportsMCP: false,
    supportsTools: false,
    format: 'GEMINI.md',
    fileExtension: '.md',
  },
  opencode: {
    maxContextLength: 100000,
    supportsMarkdown: true,
    supportsMCP: false,
    supportsTools: false,
    format: 'AGENTS.md',
    fileExtension: '.md',
  },
  'github-copilot': {
    maxContextLength: 8000,
    supportsMarkdown: true,
    supportsMCP: false,
    supportsTools: false,
    format: '.github/copilot-instructions.md',
    fileExtension: '.md',
  },
  windsurf: {
    maxContextLength: 32000,
    supportsMarkdown: true,
    supportsMCP: false,
    supportsTools: false,
    format: '.windsurfrules',
    fileExtension: '.windsurfrules',
  },
  cline: {
    maxContextLength: 128000,
    supportsMarkdown: true,
    supportsMCP: true,
    supportsTools: true,
    format: '.clinerules',
    fileExtension: '.clinerules',
  },
  roo: {
    maxContextLength: 128000,
    supportsMarkdown: true,
    supportsMCP: true,
    supportsTools: true,
    format: '.roo/rules.md',
    fileExtension: '.md',
  },
  universal: {
    maxContextLength: 8000,
    supportsMarkdown: true,
    supportsMCP: false,
    supportsTools: false,
    format: 'common-subset',
    fileExtension: '.md',
  },
};

export class AgentOptimizer {
  private provider?: LLMProvider;

  constructor(provider?: LLMProvider) {
    this.provider = provider;
  }

  async optimizeForAgent(content: string, agentId: string): Promise<OptimizationResult> {
    const constraints = this.getConstraints(agentId);
    const changes: string[] = [];

    let optimized = content;

    const estimatedTokens = Math.ceil(content.length / 4);
    if (estimatedTokens > constraints.maxContextLength * 0.9) {
      optimized = this.truncateContent(optimized, constraints.maxContextLength);
      changes.push(`Truncated to fit ${agentId} context limit (${constraints.maxContextLength} tokens)`);
    }

    if (!constraints.supportsMCP) {
      const { content: noMcpContent, removed } = this.removeMCPReferences(optimized);
      if (removed > 0) {
        optimized = noMcpContent;
        changes.push(`Removed ${removed} MCP-specific references`);
      }
    }

    if (!constraints.supportsTools) {
      const { content: noToolContent, removed } = this.removeToolReferences(optimized);
      if (removed > 0) {
        optimized = noToolContent;
        changes.push(`Removed ${removed} tool-specific references`);
      }
    }

    if (agentId === 'cursor' || agentId === 'windsurf') {
      optimized = this.convertToCursorFormat(optimized);
      changes.push('Converted to rules format');
    }

    if (agentId === 'codex' || agentId === 'github-copilot') {
      optimized = this.condenseContent(optimized);
      changes.push('Condensed for shorter context');
    }

    if (this.provider && changes.length > 0) {
      try {
        optimized = await this.provider.optimizeForAgent(optimized, agentId);
        changes.push('AI-enhanced optimization applied');
      } catch {
        // Use rule-based optimization if AI fails
      }
    }

    return {
      content: optimized,
      agentId,
      changes,
      estimatedTokens: Math.ceil(optimized.length / 4),
    };
  }

  async optimizeForMultipleAgents(
    content: string,
    agentIds: string[]
  ): Promise<Map<string, OptimizationResult>> {
    const results = new Map<string, OptimizationResult>();

    const optimizations = await Promise.all(
      agentIds.map((agentId) => this.optimizeForAgent(content, agentId))
    );

    for (let i = 0; i < agentIds.length; i++) {
      results.set(agentIds[i], optimizations[i]);
    }

    return results;
  }

  getConstraints(agentId: string): AgentConstraints {
    return AGENT_CONSTRAINTS[agentId] || AGENT_CONSTRAINTS.universal;
  }

  getSupportedAgents(): string[] {
    return Object.keys(AGENT_CONSTRAINTS);
  }

  private truncateContent(content: string, maxTokens: number): string {
    const targetChars = Math.floor(maxTokens * 4 * 0.95);

    if (content.length <= targetChars) {
      return content;
    }

    const sections = this.splitIntoSections(content);
    const prioritized = this.prioritizeSections(sections);

    let result = '';
    let currentLength = 0;

    for (const section of prioritized) {
      if (currentLength + section.content.length > targetChars) {
        const remaining = targetChars - currentLength;
        if (remaining > 200) {
          result += section.content.slice(0, remaining) + '\n...[truncated]';
        }
        break;
      }
      result += section.content + '\n\n';
      currentLength += section.content.length + 2;
    }

    return result.trim();
  }

  private splitIntoSections(content: string): Array<{ title: string; content: string; priority: number }> {
    const sections: Array<{ title: string; content: string; priority: number }> = [];
    const headingRegex = /^(#{1,3})\s+(.+)$/gm;

    let match;

    const matches: Array<{ level: number; title: string; index: number }> = [];
    while ((match = headingRegex.exec(content)) !== null) {
      matches.push({
        level: match[1].length,
        title: match[2],
        index: match.index,
      });
    }

    for (let i = 0; i < matches.length; i++) {
      const current = matches[i];
      const next = matches[i + 1];
      const endIndex = next ? next.index : content.length;
      const sectionContent = content.slice(current.index, endIndex).trim();

      sections.push({
        title: current.title,
        content: sectionContent,
        priority: this.getSectionPriority(current.title, sectionContent),
      });
    }

    if (sections.length === 0 && content.trim()) {
      sections.push({
        title: 'Main',
        content: content.trim(),
        priority: 5,
      });
    }

    return sections;
  }

  private prioritizeSections(
    sections: Array<{ title: string; content: string; priority: number }>
  ): Array<{ title: string; content: string; priority: number }> {
    return [...sections].sort((a, b) => b.priority - a.priority);
  }

  private getSectionPriority(title: string, content: string): number {
    const titleLower = title.toLowerCase();
    const contentLower = content.toLowerCase();

    if (titleLower.includes('trigger') || titleLower.includes('when')) {
      return 10;
    }

    if (titleLower.includes('rule') || contentLower.includes('must') || contentLower.includes('never')) {
      return 9;
    }

    if (titleLower.includes('instruction') || titleLower.includes('how')) {
      return 8;
    }

    if (titleLower.includes('example')) {
      return 5;
    }

    if (titleLower.includes('metadata') || titleLower.includes('version')) {
      return 2;
    }

    return 6;
  }

  private removeMCPReferences(content: string): { content: string; removed: number } {
    let removed = 0;
    let result = content;

    const mcpPatterns = [
      /\bmcp[_-]?\w+/gi,
      /model context protocol/gi,
      /\buse\s+mcp\s+/gi,
      /mcp server/gi,
      /mcp tool/gi,
    ];

    for (const pattern of mcpPatterns) {
      const matches = result.match(pattern);
      if (matches) {
        removed += matches.length;
        result = result.replace(pattern, '');
      }
    }

    result = result.replace(/\n{3,}/g, '\n\n');

    return { content: result.trim(), removed };
  }

  private removeToolReferences(content: string): { content: string; removed: number } {
    let removed = 0;
    let result = content;

    const toolPatterns = [
      /use\s+the\s+\w+\s+tool/gi,
      /call\s+the\s+\w+\s+tool/gi,
      /invoke\s+\w+\s+tool/gi,
    ];

    for (const pattern of toolPatterns) {
      const matches = result.match(pattern);
      if (matches) {
        removed += matches.length;
        result = result.replace(pattern, 'perform the action');
      }
    }

    return { content: result.trim(), removed };
  }

  private convertToCursorFormat(content: string): string {
    let result = content;

    result = result.replace(/^# (.+)$/gm, '# $1');

    result = result.replace(/^## (.+)$/gm, '\n## $1');

    result = result.replace(/^### (.+)$/gm, '\n### $1');

    result = result.replace(/\n{3,}/g, '\n\n');

    return result.trim();
  }

  private condenseContent(content: string): string {
    let result = content;

    result = result.replace(/^(#{1,3})\s+/gm, '$1 ');

    result = result.replace(/^\s+/gm, '');

    result = result.replace(/\n{2,}/g, '\n\n');

    const lines = result.split('\n');
    const condensed: string[] = [];

    for (const line of lines) {
      if (line.trim().length > 0) {
        condensed.push(line);
      } else if (condensed.length > 0 && condensed[condensed.length - 1].trim().length > 0) {
        condensed.push('');
      }
    }

    return condensed.join('\n').trim();
  }
}
