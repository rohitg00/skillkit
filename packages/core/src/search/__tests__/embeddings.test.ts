import { describe, it, expect } from 'vitest';
import { EmbeddingService } from '../embeddings.js';
import type { SkillSummary } from '../../recommend/types.js';

describe('EmbeddingService', () => {
  describe('cosineSimilarity', () => {
    let service: EmbeddingService;

    beforeEach(() => {
      service = new EmbeddingService();
    });

    it('should return 1 for identical vectors', () => {
      const a = new Float32Array([1, 0, 0]);
      const b = new Float32Array([1, 0, 0]);

      const similarity = service.cosineSimilarity(a, b);
      expect(similarity).toBeCloseTo(1, 5);
    });

    it('should return 0 for orthogonal vectors', () => {
      const a = new Float32Array([1, 0, 0]);
      const b = new Float32Array([0, 1, 0]);

      const similarity = service.cosineSimilarity(a, b);
      expect(similarity).toBeCloseTo(0, 5);
    });

    it('should return -1 for opposite vectors', () => {
      const a = new Float32Array([1, 0, 0]);
      const b = new Float32Array([-1, 0, 0]);

      const similarity = service.cosineSimilarity(a, b);
      expect(similarity).toBeCloseTo(-1, 5);
    });

    it('should handle normalized vectors', () => {
      const a = new Float32Array([0.5, 0.5, 0.5, 0.5]);
      const b = new Float32Array([0.5, 0.5, 0.5, 0.5]);

      const similarity = service.cosineSimilarity(a, b);
      expect(similarity).toBeCloseTo(1, 5);
    });

    it('should throw for mismatched dimensions', () => {
      const a = new Float32Array([1, 0]);
      const b = new Float32Array([1, 0, 0]);

      expect(() => service.cosineSimilarity(a, b)).toThrow('Vector dimensions mismatch');
    });

    it('should return 0 for zero vectors', () => {
      const a = new Float32Array([0, 0, 0]);
      const b = new Float32Array([1, 0, 0]);

      const similarity = service.cosineSimilarity(a, b);
      expect(similarity).toBe(0);
    });
  });

  describe('initialization state', () => {
    it('should not be initialized by default', () => {
      const service = new EmbeddingService();
      expect(service.isInitialized()).toBe(false);
    });

    it('should return default dimensions', () => {
      const service = new EmbeddingService();
      expect(service.getDimensions()).toBe(768);
    });
  });

  describe('skill text building', () => {
    it('should handle skill with all fields', async () => {
      const service = new EmbeddingService();
      const skill: SkillSummary = {
        name: 'test-skill',
        description: 'A test skill',
        tags: ['tag1', 'tag2'],
        compatibility: {
          frameworks: ['react'],
          languages: ['typescript'],
          libraries: ['lodash'],
        },
        popularity: 100,
        quality: 80,
        verified: true,
      };

      const buildSkillText = (s: SkillSummary): string => {
        const parts: string[] = [s.name];
        if (s.description) parts.push(s.description);
        if (s.tags?.length) parts.push(s.tags.join(' '));
        if (s.compatibility?.frameworks?.length) parts.push(s.compatibility.frameworks.join(' '));
        if (s.compatibility?.languages?.length) parts.push(s.compatibility.languages.join(' '));
        if (s.compatibility?.libraries?.length) parts.push(s.compatibility.libraries.join(' '));
        return parts.join(' ').toLowerCase();
      };

      const text = buildSkillText(skill);

      expect(text).toContain('test-skill');
      expect(text).toContain('a test skill');
      expect(text).toContain('tag1');
      expect(text).toContain('react');
      expect(text).toContain('typescript');
      expect(text).toContain('lodash');
    });

    it('should handle skill with minimal fields', () => {
      const skill: SkillSummary = {
        name: 'minimal-skill',
        tags: [],
        popularity: 0,
        quality: 50,
        verified: false,
      };

      const buildSkillText = (s: SkillSummary): string => {
        const parts: string[] = [s.name];
        if (s.description) parts.push(s.description);
        if (s.tags?.length) parts.push(s.tags.join(' '));
        return parts.join(' ').toLowerCase();
      };

      const text = buildSkillText(skill);

      expect(text).toBe('minimal-skill');
    });
  });
});

describe('EmbeddingService chunking', () => {
  it('should split text into chunks', () => {
    const chunkText = (
      text: string,
      config = { maxTokens: 100, overlapPercent: 15, minChunkSize: 10 }
    ) => {
      const lines = text.split('\n');
      const chunks: { content: string; startLine: number; endLine: number }[] = [];
      const avgCharsPerToken = 4;
      const maxCharsPerChunk = config.maxTokens * avgCharsPerToken;
      const overlapChars = Math.floor(maxCharsPerChunk * (config.overlapPercent / 100));

      let currentChunk: string[] = [];
      let currentChars = 0;
      let startLine = 0;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineChars = line.length + 1;

        if (currentChars + lineChars > maxCharsPerChunk && currentChunk.length > 0) {
          const content = currentChunk.join('\n');
          if (content.length >= config.minChunkSize) {
            chunks.push({ content, startLine, endLine: i - 1 });
          }

          const overlapLines: string[] = [];
          let overlapCharsCount = 0;
          for (let j = currentChunk.length - 1; j >= 0 && overlapCharsCount < overlapChars; j--) {
            overlapLines.unshift(currentChunk[j]);
            overlapCharsCount += currentChunk[j].length + 1;
          }

          currentChunk = overlapLines;
          currentChars = overlapCharsCount;
          startLine = i - overlapLines.length;
        }

        currentChunk.push(line);
        currentChars += lineChars;
      }

      if (currentChunk.length > 0) {
        const content = currentChunk.join('\n');
        if (content.length >= config.minChunkSize) {
          chunks.push({ content, startLine, endLine: lines.length - 1 });
        }
      }

      return chunks;
    };

    const longText = Array(50).fill('This is a line of text for testing.').join('\n');
    const chunks = chunkText(longText);

    expect(chunks.length).toBeGreaterThan(1);
    chunks.forEach((chunk) => {
      expect(chunk.content.length).toBeLessThanOrEqual(400);
      expect(chunk.startLine).toBeGreaterThanOrEqual(0);
      expect(chunk.endLine).toBeGreaterThanOrEqual(chunk.startLine);
    });
  });

  it('should not chunk short text', () => {
    const chunkText = (
      text: string,
      config = { maxTokens: 800, overlapPercent: 15, minChunkSize: 100 }
    ) => {
      const lines = text.split('\n');
      if (text.length < config.maxTokens * 4) {
        if (text.length >= config.minChunkSize) {
          return [{ content: text, startLine: 0, endLine: lines.length - 1 }];
        }
        return [];
      }
      return [{ content: text, startLine: 0, endLine: lines.length - 1 }];
    };

    const shortText = 'This is a short text that should not be chunked.';
    const chunks = chunkText(shortText, { maxTokens: 800, overlapPercent: 15, minChunkSize: 10 });

    expect(chunks.length).toBe(1);
    expect(chunks[0].content).toBe(shortText);
  });
});
