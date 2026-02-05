import { describe, it, expect } from 'vitest';
import { AgentOptimizer } from '../agents/optimizer.js';
import { CompatibilityScorer } from '../agents/compatibility.js';

describe('AgentOptimizer', () => {
  const optimizer = new AgentOptimizer();

  describe('getConstraints', () => {
    it('should return constraints for claude-code', () => {
      const constraints = optimizer.getConstraints('claude-code');

      expect(constraints.maxContextLength).toBe(200000);
      expect(constraints.supportsMCP).toBe(true);
      expect(constraints.supportsTools).toBe(true);
      expect(constraints.supportsMarkdown).toBe(true);
    });

    it('should return constraints for cursor', () => {
      const constraints = optimizer.getConstraints('cursor');

      expect(constraints.maxContextLength).toBe(32000);
      expect(constraints.supportsMCP).toBe(false);
      expect(constraints.format).toBe('.cursorrules');
    });

    it('should return universal constraints for unknown agent', () => {
      const constraints = optimizer.getConstraints('unknown-agent');

      expect(constraints).toEqual(optimizer.getConstraints('universal'));
    });
  });

  describe('getSupportedAgents', () => {
    it('should return list of supported agents', () => {
      const agents = optimizer.getSupportedAgents();

      expect(agents).toContain('claude-code');
      expect(agents).toContain('cursor');
      expect(agents).toContain('codex');
      expect(agents).toContain('universal');
      expect(agents.length).toBeGreaterThan(5);
    });
  });

  describe('optimizeForAgent', () => {
    it('should optimize content for cursor', async () => {
      const content = `# My Skill

This skill uses MCP tools like mcp_search and mcp_fetch.

## Instructions
Use the Read tool to read files.
Call the mcp_api tool for API access.
`;

      const result = await optimizer.optimizeForAgent(content, 'cursor');

      expect(result.agentId).toBe('cursor');
      expect(result.changes.length).toBeGreaterThan(0);
      expect(result.content).not.toContain('mcp_');
    });

    it('should preserve content for claude-code', async () => {
      const content = `# My Skill

## Instructions
Do something with MCP tools.
`;

      const result = await optimizer.optimizeForAgent(content, 'claude-code');

      expect(result.agentId).toBe('claude-code');
      expect(result.content).toContain('MCP');
    });

    it('should truncate for small context agents', async () => {
      const longContent = '# Long Skill\n\n' + 'Content line.\n'.repeat(5000);

      const result = await optimizer.optimizeForAgent(longContent, 'codex');

      expect(result.estimatedTokens).toBeLessThan(8000);
      expect(result.changes.some((c) => c.includes('truncate') || c.includes('Truncate'))).toBe(true);
    });
  });

  describe('optimizeForMultipleAgents', () => {
    it('should optimize for multiple agents', async () => {
      const content = '# Test Skill\n\nInstructions here.';

      const results = await optimizer.optimizeForMultipleAgents(content, [
        'claude-code',
        'cursor',
        'codex',
      ]);

      expect(results.size).toBe(3);
      expect(results.has('claude-code')).toBe(true);
      expect(results.has('cursor')).toBe(true);
      expect(results.has('codex')).toBe(true);
    });
  });
});

describe('CompatibilityScorer', () => {
  const scorer = new CompatibilityScorer();

  describe('analyzeSkillRequirements', () => {
    it('should detect MCP usage', () => {
      const content = 'Use mcp_tool to do things with MCP server.';
      const reqs = scorer.analyzeSkillRequirements(content);

      expect(reqs.usesMCP).toBe(true);
    });

    it('should detect tool usage', () => {
      const content = 'Use the Read tool to read files.';
      const reqs = scorer.analyzeSkillRequirements(content);

      expect(reqs.usesTools).toBe(true);
    });

    it('should detect code examples', () => {
      const content = '```typescript\nconst x = 1;\n```';
      const reqs = scorer.analyzeSkillRequirements(content);

      expect(reqs.hasCodeExamples).toBe(true);
    });

    it('should estimate token count', () => {
      const content = 'A'.repeat(400);
      const reqs = scorer.analyzeSkillRequirements(content);

      expect(reqs.estimatedTokens).toBe(100);
    });
  });

  describe('scoreSkillForAgent', () => {
    it('should score highly for compatible agent', () => {
      const content = `# Simple Skill

## Instructions
Do the thing.
`;

      const score = scorer.scoreSkillForAgent(content, 'claude-code');

      expect(score.score).toBeGreaterThanOrEqual(8);
      expect(score.grade).toMatch(/A|B/);
    });

    it('should lower score for MCP skill on non-MCP agent', () => {
      const content = `# MCP Skill

Use mcp_tool and MCP server for everything.
`;

      const score = scorer.scoreSkillForAgent(content, 'cursor');

      expect(score.limitations).toContain('MCP features not supported');
      expect(score.optimizations.length).toBeGreaterThan(0);
    });

    it('should lower score for oversized content', () => {
      const content = '# Big Skill\n\n' + 'Line of content.\n'.repeat(10000);

      const score = scorer.scoreSkillForAgent(content, 'codex');

      expect(score.score).toBeLessThan(8);
      expect(score.limitations.some((l) => l.includes('context'))).toBe(true);
    });
  });

  describe('generateMatrix', () => {
    it('should generate scores for all agents', () => {
      const content = '# Test Skill\n\nDo something.';

      const matrix = scorer.generateMatrix(content);

      expect(Object.keys(matrix).length).toBeGreaterThan(5);
      expect(matrix['claude-code']).toBeDefined();
      expect(matrix['cursor']).toBeDefined();
    });

    it('should generate scores for specified agents only', () => {
      const content = '# Test Skill\n\nDo something.';

      const matrix = scorer.generateMatrix(content, ['claude-code', 'cursor']);

      expect(Object.keys(matrix)).toHaveLength(2);
    });
  });

  describe('getBestAgents', () => {
    it('should return sorted agents by score', () => {
      const content = '# Simple Skill\n\nSimple instructions.';

      const best = scorer.getBestAgents(content, 3);

      expect(best).toHaveLength(3);
      expect(best[0].score.score).toBeGreaterThanOrEqual(best[1].score.score);
      expect(best[1].score.score).toBeGreaterThanOrEqual(best[2].score.score);
    });
  });
});
