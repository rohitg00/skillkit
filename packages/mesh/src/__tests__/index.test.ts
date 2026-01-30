import { describe, it, expect } from 'vitest';

describe('@skillkit/mesh', () => {
  it('should export types and constants', async () => {
    const mesh = await import('../index.js');
    expect(mesh).toBeDefined();
    expect(mesh.DEFAULT_PORT).toBe(9876);
    expect(mesh.MESH_VERSION).toBe('1.0.0');
  });
});
