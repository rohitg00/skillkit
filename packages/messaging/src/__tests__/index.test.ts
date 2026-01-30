import { describe, it, expect } from 'vitest';

describe('@skillkit/messaging', () => {
  it('should export types', async () => {
    const messaging = await import('../index.js');
    expect(messaging).toBeDefined();
    expect(messaging.MessageBuilder).toBeDefined();
  });
});
