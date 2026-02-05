import { describe, it, expect, beforeEach } from 'vitest';
import { ContextEngine } from '../context/index.js';
import { DocsSource } from '../context/docs-source.js';
import { SkillsSource } from '../context/skills-source.js';

describe('ContextEngine', () => {
  let engine: ContextEngine;

  beforeEach(() => {
    engine = new ContextEngine({
      projectPath: process.cwd(),
      maxTotalChunks: 10,
    });
  });

  describe('constructor', () => {
    it('should initialize with default options', () => {
      const defaultEngine = new ContextEngine();
      expect(defaultEngine.getAvailableSources()).toContain('docs');
      expect(defaultEngine.getAvailableSources()).toContain('codebase');
      expect(defaultEngine.getAvailableSources()).toContain('skills');
      expect(defaultEngine.getAvailableSources()).toContain('memory');
    });
  });

  describe('getAvailableSources', () => {
    it('should return all source names', () => {
      const sources = engine.getAvailableSources();

      expect(sources).toHaveLength(4);
      expect(sources).toContain('docs');
      expect(sources).toContain('codebase');
      expect(sources).toContain('skills');
      expect(sources).toContain('memory');
    });
  });

  describe('checkSourceAvailability', () => {
    it('should check all sources', async () => {
      const availability = await engine.checkSourceAvailability();

      expect(typeof availability.docs).toBe('boolean');
      expect(typeof availability.codebase).toBe('boolean');
      expect(typeof availability.skills).toBe('boolean');
      expect(typeof availability.memory).toBe('boolean');
    });
  });

  describe('gather', () => {
    it('should gather context from enabled sources', async () => {
      const result = await engine.gather('testing with vitest', [
        { name: 'docs', enabled: true, weight: 1.0 },
        { name: 'codebase', enabled: false, weight: 0.9 },
        { name: 'skills', enabled: true, weight: 0.8 },
        { name: 'memory', enabled: false, weight: 0.7 },
      ]);

      expect(result.chunks).toBeDefined();
      expect(result.sources).toBeDefined();
      expect(result.totalTokensEstimate).toBeGreaterThanOrEqual(0);
    });

    it('should respect maxTotalChunks', async () => {
      const limitedEngine = new ContextEngine({
        projectPath: process.cwd(),
        maxTotalChunks: 3,
      });

      const result = await limitedEngine.gather('testing');

      expect(result.chunks.length).toBeLessThanOrEqual(3);
    });
  });
});

describe('DocsSource', () => {
  const docsSource = new DocsSource();

  describe('isAvailable', () => {
    it('should return true', async () => {
      const available = await docsSource.isAvailable();
      expect(available).toBe(true);
    });
  });

  describe('fetch', () => {
    it('should return context chunks for known libraries', async () => {
      const chunks = await docsSource.fetch('react hooks', { maxChunks: 3 });

      expect(chunks.length).toBeGreaterThanOrEqual(0);
      for (const chunk of chunks) {
        expect(chunk.source).toBe('docs');
        expect(chunk.content).toBeDefined();
        expect(chunk.relevance).toBeGreaterThanOrEqual(0);
        expect(chunk.relevance).toBeLessThanOrEqual(1);
      }
    });

    it('should return fallback for unknown libraries', async () => {
      const chunks = await docsSource.fetch('some random query', { maxChunks: 2 });

      expect(chunks.length).toBeGreaterThan(0);
      expect(chunks[0].source).toBe('docs');
    });
  });
});

describe('SkillsSource', () => {
  const skillsSource = new SkillsSource();

  describe('isAvailable', () => {
    it('should check if skills index exists', async () => {
      const available = await skillsSource.isAvailable();
      expect(typeof available).toBe('boolean');
    });
  });

  describe('fetch', () => {
    it('should search for relevant skills', async () => {
      const chunks = await skillsSource.fetch('testing', { maxChunks: 5 });

      for (const chunk of chunks) {
        expect(chunk.source).toBe('skills');
        expect(chunk.content).toBeDefined();
        expect(chunk.relevance).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('searchSkills', () => {
    it('should return scored skills', async () => {
      const results = await skillsSource.searchSkills('react', 5);

      for (const { skill, score } of results) {
        expect(skill.name).toBeDefined();
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(1);
      }
    });
  });
});
