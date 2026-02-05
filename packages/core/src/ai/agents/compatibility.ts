import { AgentOptimizer, type AgentConstraints } from './optimizer.js';

export interface CompatibilityScore {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  limitations: string[];
  optimizations: string[];
}

export interface CompatibilityMatrix {
  [agentId: string]: CompatibilityScore;
}

export interface SkillRequirements {
  estimatedTokens: number;
  usesMCP: boolean;
  usesTools: boolean;
  hasCodeExamples: boolean;
  hasMarkdown: boolean;
  complexity: 'low' | 'medium' | 'high';
}

export class CompatibilityScorer {
  private optimizer: AgentOptimizer;

  constructor() {
    this.optimizer = new AgentOptimizer();
  }

  scoreSkillForAgent(skillContent: string, agentId: string): CompatibilityScore {
    const requirements = this.analyzeSkillRequirements(skillContent);
    const constraints = this.optimizer.getConstraints(agentId);

    return this.calculateScore(requirements, constraints, agentId);
  }

  generateMatrix(skillContent: string, agentIds?: string[]): CompatibilityMatrix {
    const agents = agentIds || this.optimizer.getSupportedAgents();
    const matrix: CompatibilityMatrix = {};

    for (const agentId of agents) {
      matrix[agentId] = this.scoreSkillForAgent(skillContent, agentId);
    }

    return matrix;
  }

  getBestAgents(skillContent: string, limit = 5): Array<{ agentId: string; score: CompatibilityScore }> {
    const matrix = this.generateMatrix(skillContent);

    const sorted = Object.entries(matrix)
      .map(([agentId, score]) => ({ agentId, score }))
      .sort((a, b) => b.score.score - a.score.score);

    return sorted.slice(0, limit);
  }

  analyzeSkillRequirements(content: string): SkillRequirements {
    const estimatedTokens = Math.ceil(content.length / 4);

    const usesMCP = /\bmcp[_-]?\w+|model context protocol|mcp server|mcp tool/i.test(content);

    const usesTools = /use\s+the\s+\w+\s+tool|call\s+\w+\s+tool|invoke\s+tool/i.test(content);

    const hasCodeExamples = /```[\s\S]*?```/.test(content);

    const hasMarkdown = /^#{1,6}\s|\*\*|__|\[.*\]\(.*\)|^[-*]\s/m.test(content);

    const complexity = this.assessComplexity(content);

    return {
      estimatedTokens,
      usesMCP,
      usesTools,
      hasCodeExamples,
      hasMarkdown,
      complexity,
    };
  }

  private calculateScore(
    requirements: SkillRequirements,
    constraints: AgentConstraints,
    agentId: string
  ): CompatibilityScore {
    let score = 10;
    const limitations: string[] = [];
    const optimizations: string[] = [];

    const contextRatio = requirements.estimatedTokens / constraints.maxContextLength;
    if (contextRatio > 1) {
      score -= 4;
      limitations.push(`Skill exceeds context limit (${Math.round(contextRatio * 100)}% of max)`);
      optimizations.push('Content will be truncated to fit');
    } else if (contextRatio > 0.8) {
      score -= 1;
      limitations.push('Skill uses most of available context');
    }

    if (requirements.usesMCP && !constraints.supportsMCP) {
      score -= 2;
      limitations.push('MCP features not supported');
      optimizations.push('MCP references will be removed');
    }

    if (requirements.usesTools && !constraints.supportsTools) {
      score -= 1;
      limitations.push('Tool invocations not supported');
      optimizations.push('Tool references will be generalized');
    }

    if (requirements.hasMarkdown && !constraints.supportsMarkdown) {
      score -= 1;
      limitations.push('Markdown formatting may not render');
    }

    if (requirements.complexity === 'high' && constraints.maxContextLength < 32000) {
      score -= 1;
      limitations.push('Complex skill may lose nuance in smaller context');
    }

    if (agentId === 'claude-code') {
      score = Math.min(score + 1, 10);
      if (requirements.usesMCP) {
        optimizations.push('Full MCP support available');
      }
    }

    score = Math.max(0, Math.min(10, score));

    return {
      score,
      grade: this.scoreToGrade(score),
      limitations,
      optimizations,
    };
  }

  private assessComplexity(content: string): 'low' | 'medium' | 'high' {
    const tokens = Math.ceil(content.length / 4);
    const headingCount = (content.match(/^#{1,6}\s/gm) || []).length;
    const codeBlockCount = (content.match(/```/g) || []).length / 2;
    const listItemCount = (content.match(/^[-*]\s/gm) || []).length;

    const complexityScore =
      tokens / 1000 +
      headingCount * 0.5 +
      codeBlockCount * 2 +
      listItemCount * 0.1;

    if (complexityScore > 20) return 'high';
    if (complexityScore > 8) return 'medium';
    return 'low';
  }

  private scoreToGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 9) return 'A';
    if (score >= 7) return 'B';
    if (score >= 5) return 'C';
    if (score >= 3) return 'D';
    return 'F';
  }
}

export { AgentOptimizer } from './optimizer.js';
