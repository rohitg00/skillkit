import { describe, it, expect, beforeEach } from 'vitest';
import { AIManager } from '../manager.js';
import type { SearchableSkill, SkillExample } from '../types.js';

describe('AIManager', () => {
  let manager: AIManager;
  let testSkills: SearchableSkill[];

  beforeEach(() => {
    manager = new AIManager({
      provider: 'mock',
    });

    testSkills = [
      {
        name: 'test-driven-development',
        description: 'Write tests before code using TDD methodology',
        content: 'TDD skill content',
        tags: ['testing', 'tdd', 'quality'],
        source: 'test-repo',
      },
      {
        name: 'code-review',
        description: 'Perform thorough code reviews',
        content: 'Code review skill content',
        tags: ['review', 'quality', 'collaboration'],
        source: 'test-repo',
      },
      {
        name: 'debugging-guide',
        description: 'Systematic approach to debugging issues',
        content: 'Debugging skill content',
        tags: ['debugging', 'troubleshooting'],
        source: 'test-repo',
      },
    ];
  });

  describe('searchSkills', () => {
    it('should search skills by query', async () => {
      const results = await manager.searchSkills('testing', testSkills, {
        minRelevance: 0,
      });

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].skill.name).toBe('test-driven-development');
      expect(results[0].relevance).toBeGreaterThan(0);
    });

    it('should respect limit option', async () => {
      const results = await manager.searchSkills('code', testSkills, {
        limit: 1,
      });

      expect(results.length).toBeLessThanOrEqual(1);
    });

    it('should filter by min relevance', async () => {
      const results = await manager.searchSkills('testing', testSkills, {
        minRelevance: 0.8,
      });

      for (const result of results) {
        expect(result.relevance).toBeGreaterThanOrEqual(0.8);
      }
    });

    it('should include reasoning when requested', async () => {
      const results = await manager.searchSkills('testing', testSkills, {
        includeReasoning: true,
      });

      if (results.length > 0) {
        expect(results[0].reasoning).toBeDefined();
        expect(results[0].reasoning.length).toBeGreaterThan(0);
      }
    });
  });

  describe('searchByIntent', () => {
    it('should search by user intent', async () => {
      const results = await manager.searchByIntent(
        'I want to improve my testing workflow',
        testSkills,
        { minRelevance: 0 }
      );

      expect(results.length).toBeGreaterThan(0);
      const names = results.map((r) => r.skill.name);
      expect(names).toContain('test-driven-development');
    });
  });

  describe('findSimilar', () => {
    it('should find similar skills', async () => {
      const targetSkill = testSkills[0];
      const results = await manager.findSimilar(targetSkill, testSkills, {
        minRelevance: 0,
      });

      expect(results.length).toBeGreaterThan(0);
      results.forEach((r) => {
        expect(r.skill.name).not.toBe(targetSkill.name);
      });
    });
  });

  describe('generateSkill', () => {
    it('should generate skill from example', async () => {
      const example: SkillExample = {
        description: 'Help with API testing',
        context: 'REST APIs using Jest',
      };

      const generated = await manager.generateSkill(example);

      expect(generated.name).toBeDefined();
      expect(generated.name.length).toBeGreaterThan(0);
      expect(generated.description).toBe(example.description);
      expect(generated.content).toBeDefined();
      expect(generated.tags).toBeDefined();
      expect(generated.confidence).toBeGreaterThan(0);
    });

    it('should include target agent metadata', async () => {
      const example: SkillExample = {
        description: 'Test skill',
      };

      const generated = await manager.generateSkill(example, {
        targetAgent: 'claude-code',
      });

      expect(generated.content).toContain('agent: claude-code');
    });
  });

  describe('generateFromCode', () => {
    it('should generate skill from code example', async () => {
      const code = `
function add(a: number, b: number): number {
  return a + b;
}
      `;
      const description = 'Simple addition function';

      const generated = await manager.generateFromCode(code, description);

      expect(generated.name).toBeDefined();
      expect(generated.description).toBe(description);
      expect(generated.content).toContain('Example');
    });
  });

  describe('generateFromTemplate', () => {
    it('should generate skill from template', async () => {
      const generated = await manager.generateFromTemplate(
        'api-testing',
        { framework: 'Jest', type: 'REST' }
      );

      expect(generated.name).toBeDefined();
      expect(generated.content).toBeDefined();
    });
  });

  describe('validateGenerated', () => {
    it('should validate valid generated skill', () => {
      const skill = {
        name: 'valid-skill-name',
        description: 'This is a valid description with enough length',
        content: 'This is valid content with enough length to pass validation checks',
        tags: ['test', 'valid'],
        confidence: 0.8,
        reasoning: 'Valid reasoning',
      };

      const result = manager.validateGenerated(skill);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject skill with short name', () => {
      const skill = {
        name: 'ab',
        description: 'Valid description',
        content: 'Valid content with enough length',
        tags: [],
        confidence: 0.8,
        reasoning: '',
      };

      const result = manager.validateGenerated(skill);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        'Skill name must be at least 3 characters'
      );
    });

    it('should reject skill with low confidence', () => {
      const skill = {
        name: 'valid-name',
        description: 'Valid description',
        content: 'Valid content with enough length',
        tags: [],
        confidence: 0.4,
        reasoning: '',
      };

      const result = manager.validateGenerated(skill);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        'Skill confidence is too low (< 0.6)'
      );
    });
  });

  describe('getProviderName', () => {
    it('should return provider name', () => {
      const name = manager.getProviderName();
      expect(name).toBe('mock');
    });
  });

  describe('updateConfig', () => {
    it('should update configuration', () => {
      manager.updateConfig({
        temperature: 0.5,
      });

      // Provider should be recreated
      expect(manager.getProviderName()).toBe('mock');
    });
  });
});
