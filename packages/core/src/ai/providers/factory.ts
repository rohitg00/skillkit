import type { LLMProvider, ProviderConfig, ProviderName } from './types.js';
import { AnthropicProvider } from './anthropic.js';
import { OpenAIProvider } from './openai.js';
import { GoogleProvider } from './google.js';
import { OllamaProvider } from './ollama.js';
import { OpenRouterProvider } from './openrouter.js';
import { MockAIProvider } from './mock.js';

export interface ProviderDetectionResult {
  provider: ProviderName;
  displayName: string;
  configured: boolean;
  envVar?: string;
}

export function detectProviders(): ProviderDetectionResult[] {
  const results: ProviderDetectionResult[] = [];

  if (process.env.ANTHROPIC_API_KEY) {
    results.push({
      provider: 'anthropic',
      displayName: 'Claude (Anthropic)',
      configured: true,
      envVar: 'ANTHROPIC_API_KEY',
    });
  }

  if (process.env.OPENAI_API_KEY) {
    results.push({
      provider: 'openai',
      displayName: 'GPT-4 (OpenAI)',
      configured: true,
      envVar: 'OPENAI_API_KEY',
    });
  }

  if (process.env.GOOGLE_AI_KEY || process.env.GEMINI_API_KEY) {
    results.push({
      provider: 'google',
      displayName: 'Gemini (Google)',
      configured: true,
      envVar: process.env.GOOGLE_AI_KEY ? 'GOOGLE_AI_KEY' : 'GEMINI_API_KEY',
    });
  }

  if (process.env.OPENROUTER_API_KEY) {
    results.push({
      provider: 'openrouter',
      displayName: 'OpenRouter (100+ Models)',
      configured: true,
      envVar: 'OPENROUTER_API_KEY',
    });
  }

  results.push({
    provider: 'ollama',
    displayName: 'Ollama (Local)',
    configured: true,
    envVar: 'OLLAMA_HOST',
  });

  return results;
}

export function getDefaultProvider(): ProviderName {
  if (process.env.ANTHROPIC_API_KEY) return 'anthropic';
  if (process.env.OPENAI_API_KEY) return 'openai';
  if (process.env.GOOGLE_AI_KEY || process.env.GEMINI_API_KEY) return 'google';
  if (process.env.OPENROUTER_API_KEY) return 'openrouter';
  if (process.env.OLLAMA_HOST) return 'ollama';

  return 'mock';
}

export function createProvider(
  providerName?: ProviderName,
  config: ProviderConfig = {}
): LLMProvider {
  const name = providerName || getDefaultProvider();

  switch (name) {
    case 'anthropic':
      return new AnthropicProvider(config);

    case 'openai':
      return new OpenAIProvider(config);

    case 'google':
      return new GoogleProvider(config);

    case 'ollama':
      return new OllamaProvider(config);

    case 'openrouter':
      return new OpenRouterProvider(config);

    case 'mock':
    default:
      return new MockAIProvider();
  }
}

export function isProviderConfigured(providerName: ProviderName): boolean {
  switch (providerName) {
    case 'anthropic':
      return Boolean(process.env.ANTHROPIC_API_KEY);
    case 'openai':
      return Boolean(process.env.OPENAI_API_KEY);
    case 'google':
      return Boolean(process.env.GOOGLE_AI_KEY || process.env.GEMINI_API_KEY);
    case 'openrouter':
      return Boolean(process.env.OPENROUTER_API_KEY);
    case 'ollama':
      return true;
    case 'mock':
      return true;
    default:
      return false;
  }
}

export function getProviderEnvVars(): Record<ProviderName, string[]> {
  return {
    anthropic: ['ANTHROPIC_API_KEY'],
    openai: ['OPENAI_API_KEY'],
    google: ['GOOGLE_AI_KEY', 'GEMINI_API_KEY'],
    ollama: ['OLLAMA_HOST'],
    openrouter: ['OPENROUTER_API_KEY'],
    mock: [],
  };
}

export function getProviderModels(providerName: ProviderName): string[] {
  const models: Record<ProviderName, string[]> = {
    anthropic: [
      'claude-sonnet-4-20250514',
      'claude-opus-4-20250514',
      'claude-3-5-sonnet-20241022',
      'claude-3-5-haiku-20241022',
    ],
    openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'o1-preview', 'o1-mini'],
    google: ['gemini-2.0-flash', 'gemini-2.0-pro', 'gemini-1.5-flash', 'gemini-1.5-pro'],
    ollama: ['llama3.2', 'llama3.1', 'mistral', 'codellama', 'deepseek-coder'],
    openrouter: [
      'anthropic/claude-3.5-sonnet',
      'openai/gpt-4o',
      'google/gemini-pro',
      'meta-llama/llama-3.1-70b-instruct',
      'mistralai/mistral-large',
    ],
    mock: ['mock'],
  };

  return models[providerName] || [];
}

export class ProviderFactory {
  private static instance: ProviderFactory;
  private providerCache: Map<string, LLMProvider> = new Map();

  static getInstance(): ProviderFactory {
    if (!ProviderFactory.instance) {
      ProviderFactory.instance = new ProviderFactory();
    }
    return ProviderFactory.instance;
  }

  getProvider(providerName?: ProviderName, config: ProviderConfig = {}): LLMProvider {
    const name = providerName || getDefaultProvider();
    const cacheKey = `${name}:${config.model || 'default'}:${config.apiKey ? 'custom-key' : 'env'}:${config.maxTokens ?? 'default'}:${config.temperature ?? 'default'}`;

    if (!this.providerCache.has(cacheKey)) {
      this.providerCache.set(cacheKey, createProvider(name, config));
    }

    return this.providerCache.get(cacheKey)!;
  }

  clearCache(): void {
    this.providerCache.clear();
  }

  getDetectedProviders(): ProviderDetectionResult[] {
    return detectProviders();
  }

  getDefaultProviderName(): ProviderName {
    return getDefaultProvider();
  }

  isConfigured(providerName: ProviderName): boolean {
    return isProviderConfigured(providerName);
  }
}
