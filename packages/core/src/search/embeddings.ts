import type { SkillSummary } from '../recommend/types.js';
import type {
  SkillEmbedding,
  IndexBuildCallback,
} from './types.js';
import { DEFAULT_CHUNKING_CONFIG, MODEL_REGISTRY } from './types.js';
import { LocalModelManager } from './local-models.js';

export class EmbeddingService {
  private modelManager: LocalModelManager;
  private model: unknown = null;
  private context: unknown = null;
  private initialized = false;
  private dimensions: number = 768;

  constructor(modelManager?: LocalModelManager) {
    this.modelManager = modelManager ?? new LocalModelManager();
  }

  async initialize(onProgress?: IndexBuildCallback): Promise<void> {
    if (this.initialized) return;

    onProgress?.({
      phase: 'loading',
      current: 0,
      total: 1,
      message: 'Loading embedding model...',
    });

    const modelPath = await this.modelManager.ensureEmbedModel(onProgress);

    try {
      // @ts-expect-error - node-llama-cpp is an optional dependency
      const llama = await import('node-llama-cpp');
      const { getLlama, LlamaEmbeddingContext } = llama;

      const llamaInstance = await getLlama();
      this.model = await llamaInstance.loadModel({ modelPath });
      this.context = new LlamaEmbeddingContext({ model: this.model as never });

      const modelInfo = MODEL_REGISTRY.embeddings[
        this.modelManager.getConfig().embedModel as keyof typeof MODEL_REGISTRY.embeddings
      ];
      this.dimensions = modelInfo?.dimensions ?? 768;

      this.initialized = true;

      onProgress?.({
        phase: 'loading',
        current: 1,
        total: 1,
        message: 'Embedding model loaded successfully',
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Cannot find package 'node-llama-cpp'")
      ) {
        throw new Error(
          'node-llama-cpp is not installed. Install it with: pnpm add node-llama-cpp'
        );
      }
      throw error;
    }
  }

  async embed(text: string): Promise<Float32Array> {
    if (!this.initialized || !this.context) {
      throw new Error('EmbeddingService not initialized. Call initialize() first.');
    }

    const ctx = this.context as {
      getEmbeddingFor(text: string): Promise<{ vector: number[] }>;
    };
    const result = await ctx.getEmbeddingFor(text);
    return new Float32Array(result.vector);
  }

  async embedBatch(texts: string[]): Promise<Float32Array[]> {
    const results: Float32Array[] = [];
    for (const text of texts) {
      results.push(await this.embed(text));
    }
    return results;
  }

  async embedSkill(skill: SkillSummary): Promise<SkillEmbedding> {
    const textContent = this.buildSkillText(skill);
    const vector = await this.embed(textContent);

    return {
      skillName: skill.name,
      vector,
      textContent,
      generatedAt: new Date().toISOString(),
    };
  }

  async embedSkillWithChunks(
    skill: SkillSummary,
    fullContent?: string
  ): Promise<SkillEmbedding> {
    const textContent = this.buildSkillText(skill);
    const mainVector = await this.embed(textContent);

    const chunks = fullContent ? this.chunkText(fullContent) : undefined;
    let embeddedChunks: SkillEmbedding['chunks'] | undefined;

    if (chunks && chunks.length > 0) {
      embeddedChunks = [];
      for (const chunk of chunks) {
        const chunkVector = await this.embed(chunk.content);
        embeddedChunks.push({
          content: chunk.content,
          vector: chunkVector,
          startLine: chunk.startLine,
          endLine: chunk.endLine,
        });
      }
    }

    return {
      skillName: skill.name,
      vector: mainVector,
      textContent,
      chunks: embeddedChunks,
      generatedAt: new Date().toISOString(),
    };
  }

  async embedSkills(
    skills: SkillSummary[],
    onProgress?: IndexBuildCallback
  ): Promise<SkillEmbedding[]> {
    await this.initialize(onProgress);

    const embeddings: SkillEmbedding[] = [];
    const total = skills.length;

    for (let i = 0; i < skills.length; i++) {
      const skill = skills[i];

      onProgress?.({
        phase: 'embedding',
        current: i + 1,
        total,
        skillName: skill.name,
        message: `Embedding skill ${i + 1}/${total}: ${skill.name}`,
      });

      const embedding = await this.embedSkill(skill);
      embeddings.push(embedding);
    }

    onProgress?.({
      phase: 'complete',
      current: total,
      total,
      message: `Embedded ${total} skills`,
    });

    return embeddings;
  }

  private buildSkillText(skill: SkillSummary): string {
    const parts: string[] = [skill.name];

    if (skill.description) {
      parts.push(skill.description);
    }

    if (skill.tags && skill.tags.length > 0) {
      parts.push(skill.tags.join(' '));
    }

    if (skill.compatibility) {
      if (skill.compatibility.frameworks?.length) {
        parts.push(skill.compatibility.frameworks.join(' '));
      }
      if (skill.compatibility.languages?.length) {
        parts.push(skill.compatibility.languages.join(' '));
      }
      if (skill.compatibility.libraries?.length) {
        parts.push(skill.compatibility.libraries.join(' '));
      }
    }

    return parts.join(' ').toLowerCase();
  }

  private chunkText(
    text: string,
    config = DEFAULT_CHUNKING_CONFIG
  ): { content: string; startLine: number; endLine: number }[] {
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
          chunks.push({
            content,
            startLine,
            endLine: i - 1,
          });
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
        chunks.push({
          content,
          startLine,
          endLine: lines.length - 1,
        });
      }
    }

    return chunks;
  }

  cosineSimilarity(a: Float32Array, b: Float32Array): number {
    if (a.length !== b.length) {
      throw new Error(`Vector dimensions mismatch: ${a.length} vs ${b.length}`);
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
    if (magnitude === 0) return 0;

    return dotProduct / magnitude;
  }

  getDimensions(): number {
    return this.dimensions;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  async dispose(): Promise<void> {
    if (this.context && typeof (this.context as { dispose?: () => void }).dispose === 'function') {
      (this.context as { dispose: () => void }).dispose();
    }
    if (this.model && typeof (this.model as { dispose?: () => void }).dispose === 'function') {
      (this.model as { dispose: () => void }).dispose();
    }
    this.context = null;
    this.model = null;
    this.initialized = false;
  }
}

export function createEmbeddingService(modelManager?: LocalModelManager): EmbeddingService {
  return new EmbeddingService(modelManager);
}
