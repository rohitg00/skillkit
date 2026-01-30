import { describe, it, expect } from 'vitest';
import {
  StoreMemoryInputSchema,
  SearchMemoryInputSchema,
  RecallMemoryInputSchema,
  ForgetMemoryInputSchema,
  LinkMemoriesInputSchema,
  GetMemoryInputSchema,
  ReinforceMemoryInputSchema,
} from './types.js';

describe('@skillkit/mcp-memory', () => {
  describe('input schemas', () => {
    it('validates StoreMemoryInput', () => {
      const valid = {
        content: 'Test memory',
        category: 'fact',
        tags: ['test'],
      };
      expect(() => StoreMemoryInputSchema.parse(valid)).not.toThrow();
    });

    it('validates SearchMemoryInput', () => {
      const valid = {
        query: 'test query',
        limit: 10,
        threshold: 0.5,
      };
      expect(() => SearchMemoryInputSchema.parse(valid)).not.toThrow();
    });

    it('validates RecallMemoryInput', () => {
      const valid = {
        category: 'decision',
        tier: 'warm',
        limit: 20,
      };
      expect(() => RecallMemoryInputSchema.parse(valid)).not.toThrow();
    });

    it('validates ForgetMemoryInput', () => {
      const valid = { id: 'test-id' };
      expect(() => ForgetMemoryInputSchema.parse(valid)).not.toThrow();
    });

    it('validates LinkMemoriesInput', () => {
      const valid = {
        sourceId: 'source-id',
        targetId: 'target-id',
        relationshipType: 'related',
        strength: 0.5,
      };
      expect(() => LinkMemoriesInputSchema.parse(valid)).not.toThrow();
    });

    it('validates GetMemoryInput', () => {
      const valid = { id: 'test-id' };
      expect(() => GetMemoryInputSchema.parse(valid)).not.toThrow();
    });

    it('validates ReinforceMemoryInput', () => {
      const valid = { id: 'test-id', amount: 0.1 };
      expect(() => ReinforceMemoryInputSchema.parse(valid)).not.toThrow();
    });

    it('rejects invalid category', () => {
      const invalid = {
        content: 'Test',
        category: 'invalid',
      };
      expect(() => StoreMemoryInputSchema.parse(invalid)).toThrow();
    });

    it('rejects invalid relationship type', () => {
      const invalid = {
        sourceId: 'a',
        targetId: 'b',
        relationshipType: 'invalid',
      };
      expect(() => LinkMemoriesInputSchema.parse(invalid)).toThrow();
    });
  });
});
