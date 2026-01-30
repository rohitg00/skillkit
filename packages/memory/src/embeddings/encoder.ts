import { pipeline, env } from '@xenova/transformers';
import { DEFAULT_EMBEDDING_DIMENSION } from '../types.js';

env.cacheDir = './.cache/transformers';

let embeddingPipeline: any = null;
let initPromise: Promise<void> | null = null;

const DEFAULT_MODEL = 'Xenova/all-MiniLM-L6-v2';

export interface EncoderOptions {
  model?: string;
  cacheDir?: string;
}

export async function initializeEncoder(options: EncoderOptions = {}): Promise<void> {
  if (embeddingPipeline) return;

  if (initPromise) {
    await initPromise;
    return;
  }

  initPromise = (async () => {
    if (options.cacheDir) {
      env.cacheDir = options.cacheDir;
    }

    const modelName = options.model ?? DEFAULT_MODEL;
    embeddingPipeline = await pipeline('feature-extraction', modelName, {
      quantized: true,
    } as any);
  })();

  await initPromise;
}

export async function encode(text: string): Promise<number[]> {
  if (!embeddingPipeline) {
    await initializeEncoder();
  }

  if (!embeddingPipeline) {
    throw new Error('Failed to initialize embedding pipeline');
  }

  const output = await embeddingPipeline(text, {
    pooling: 'mean',
    normalize: true,
  } as any);

  const embedding = Array.from((output as any).data as Float32Array);

  if (embedding.length !== DEFAULT_EMBEDDING_DIMENSION) {
    throw new Error(
      `Embedding dimension mismatch: expected ${DEFAULT_EMBEDDING_DIMENSION}, got ${embedding.length}`
    );
  }

  return embedding;
}

export async function encodeBatch(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];

  if (!embeddingPipeline) {
    await initializeEncoder();
  }

  if (!embeddingPipeline) {
    throw new Error('Failed to initialize embedding pipeline');
  }

  const embeddings: number[][] = [];

  for (const text of texts) {
    const output = await embeddingPipeline(text, {
      pooling: 'mean',
      normalize: true,
    } as any);
    embeddings.push(Array.from((output as any).data as Float32Array));
  }

  return embeddings;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same dimension');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;

  return dotProduct / denominator;
}

export function euclideanDistance(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same dimension');
  }

  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }

  return Math.sqrt(sum);
}

export function isEncoderReady(): boolean {
  return embeddingPipeline !== null;
}

export async function disposeEncoder(): Promise<void> {
  embeddingPipeline = null;
  initPromise = null;
}
