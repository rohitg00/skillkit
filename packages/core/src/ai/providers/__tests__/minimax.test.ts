import { describe, it, expect, afterEach, vi } from 'vitest';
import { MiniMaxProvider } from '../minimax.js';
import {
  createProvider,
  detectProviders,
  getDefaultProvider,
  getProviderEnvVars,
  getProviderModels,
  isProviderConfigured,
} from '../factory.js';
import type { ChatMessage } from '../types.js';

const ENVS = ['MINIMAX_API_KEY', 'MINIMAX_BASE_URL', 'MINIMAX_REGION', 'OPENROUTER_API_KEY', 'ANTHROPIC_API_KEY', 'OPENAI_API_KEY', 'GOOGLE_AI_KEY', 'GEMINI_API_KEY', 'OLLAMA_HOST'];

const restoreEnv = (): void => {
  for (const key of ENVS) {
    if (!(key in process.env)) continue;
    delete process.env[key];
  }
};

afterEach(() => {
  restoreEnv();
  vi.restoreAllMocks();
});

describe('MiniMaxProvider', () => {
  it('is configured when MINIMAX_API_KEY is set', () => {
    process.env.MINIMAX_API_KEY = 'test-key';
    const provider = new MiniMaxProvider();
    expect(provider.isConfigured()).toBe(true);
    expect(provider.name).toBe('minimax');
    expect(provider.displayName).toBe('MiniMax');
  });

  it('is not configured without an API key', () => {
    const provider = new MiniMaxProvider();
    expect(provider.isConfigured()).toBe(false);
  });

  it('defaults to the global base URL and MiniMax-M3 model', () => {
    process.env.MINIMAX_API_KEY = 'test-key';
    const provider = new MiniMaxProvider();
    expect(provider['model']).toBe('MiniMax-M3');
    expect(provider['baseUrl']).toBe('https://api.minimax.io/v1');
  });

  it('selects the CN base URL when MINIMAX_REGION is cn', () => {
    process.env.MINIMAX_API_KEY = 'test-key';
    process.env.MINIMAX_REGION = 'cn';
    const provider = new MiniMaxProvider();
    expect(provider['baseUrl']).toBe('https://api.minimaxi.com/v1');
  });

  it('honours an explicit config baseUrl over region defaults', () => {
    process.env.MINIMAX_API_KEY = 'test-key';
    process.env.MINIMAX_REGION = 'cn';
    const provider = new MiniMaxProvider({ baseUrl: 'https://custom.example.com/v1/' });
    expect(provider['baseUrl']).toBe('https://custom.example.com/v1');
  });

  it('honours MINIMAX_BASE_URL over region defaults', () => {
    process.env.MINIMAX_API_KEY = 'test-key';
    process.env.MINIMAX_REGION = 'cn';
    process.env.MINIMAX_BASE_URL = 'https://env.example.com/v1/';
    const provider = new MiniMaxProvider();
    expect(provider['baseUrl']).toBe('https://env.example.com/v1');
  });

  it('sends an OpenAI-compatible chat completion request and returns content', async () => {
    process.env.MINIMAX_API_KEY = 'test-key';
    const provider = new MiniMaxProvider({ model: 'MiniMax-M2.7' });

    const fetchMock = vi.fn(async (input: string, init?: RequestInit) => {
      return new Response(
        JSON.stringify({
          choices: [{ message: { role: 'assistant', content: 'hello' }, finish_reason: 'stop' }],
          usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    });

    vi.stubGlobal('fetch', fetchMock);

    const messages: ChatMessage[] = [{ role: 'user', content: 'hi' }];
    const result = await provider.chat(messages);

    expect(result).toBe('hello');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe('https://api.minimax.io/v1/chat/completions');
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.model).toBe('MiniMax-M2.7');
    expect(body.messages).toEqual([{ role: 'user', content: 'hi' }]);
    expect((init as RequestInit).headers).toMatchObject({
      Authorization: 'Bearer test-key',
      'Content-Type': 'application/json',
    });
  });

  it('throws a clear error when not configured', async () => {
    const provider = new MiniMaxProvider();
    await expect(provider.chat([{ role: 'user', content: 'hi' }])).rejects.toThrow(
      'MiniMax API key not configured',
    );
  });

  it('surfaces non-2xx responses as an API error', async () => {
    process.env.MINIMAX_API_KEY = 'test-key';
    const provider = new MiniMaxProvider();

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('bad request', { status: 400 })),
    );

    await expect(provider.chat([{ role: 'user', content: 'hi' }])).rejects.toThrow(
      'MiniMax API error: 400',
    );
  });
});

describe('MiniMax factory integration', () => {
  it('detects MiniMax when MINIMAX_API_KEY is set', () => {
    process.env.MINIMAX_API_KEY = 'test-key';
    const detected = detectProviders();
    const minimax = detected.find((d) => d.provider === 'minimax');
    expect(minimax).toBeDefined();
    expect(minimax?.configured).toBe(true);
    expect(minimax?.envVar).toBe('MINIMAX_API_KEY');
  });

  it('selects MiniMax as the default provider when only MINIMAX_API_KEY is set', () => {
    process.env.MINIMAX_API_KEY = 'test-key';
    expect(getDefaultProvider()).toBe('minimax');
  });

  it('creates a MiniMaxProvider via createProvider', () => {
    process.env.MINIMAX_API_KEY = 'test-key';
    const provider = createProvider('minimax');
    expect(provider.name).toBe('minimax');
    expect(provider.isConfigured()).toBe(true);
  });

  it('reports configuration status for MiniMax', () => {
    expect(isProviderConfigured('minimax')).toBe(false);
    process.env.MINIMAX_API_KEY = 'test-key';
    expect(isProviderConfigured('minimax')).toBe(true);
  });

  it('exposes MiniMax env vars and models', () => {
    expect(getProviderEnvVars().minimax).toEqual(['MINIMAX_API_KEY']);
    expect(getProviderModels('minimax')).toEqual(['MiniMax-M3', 'MiniMax-M2.7']);
  });
});
