import { describe, it, expect } from 'vitest';

describe('@skillkit/memory', () => {
  it('should export types', async () => {
    const memory = await import('../index.js');
    expect(memory).toBeDefined();
    expect(memory.DEFAULT_EMBEDDING_DIMENSION).toBe(384);
  });
});
