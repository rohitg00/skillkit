import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { createWriteStream } from 'node:fs';
import type { LocalModelConfig, IndexBuildCallback } from './types.js';
import { MODEL_REGISTRY } from './types.js';

const DEFAULT_MODEL_DIR = path.join(os.homedir(), '.skillkit', 'models');

type EmbeddingModelName = keyof typeof MODEL_REGISTRY.embeddings;
type LlmModelName = keyof typeof MODEL_REGISTRY.llm;

interface ModelInfo {
  url: string;
  size: number;
  description: string;
  dimensions?: number;
}

export class LocalModelManager {
  private config: Required<LocalModelConfig>;
  private embedModelPath: string | null = null;
  private llmModelPath: string | null = null;

  constructor(config: Partial<LocalModelConfig> = {}) {
    this.config = {
      embedModel: config.embedModel ?? 'nomic-embed-text-v1.5.Q4_K_M.gguf',
      llmModel: config.llmModel ?? 'gemma-2b-it-Q4_K_M.gguf',
      modelDir: config.modelDir ?? DEFAULT_MODEL_DIR,
      autoDownload: config.autoDownload ?? true,
      gpuLayers: config.gpuLayers ?? 0,
    };
  }

  async ensureModelsDirectory(): Promise<void> {
    if (!fs.existsSync(this.config.modelDir)) {
      await fs.promises.mkdir(this.config.modelDir, { recursive: true });
    }
  }

  getEmbedModelPath(): string {
    return path.join(this.config.modelDir, this.config.embedModel);
  }

  getLlmModelPath(): string {
    return path.join(this.config.modelDir, this.config.llmModel);
  }

  isEmbedModelAvailable(): boolean {
    return fs.existsSync(this.getEmbedModelPath());
  }

  isLlmModelAvailable(): boolean {
    return fs.existsSync(this.getLlmModelPath());
  }

  private getModelInfo(modelType: 'embed' | 'llm', modelName: string): ModelInfo | undefined {
    if (modelType === 'embed') {
      return MODEL_REGISTRY.embeddings[modelName as EmbeddingModelName] as ModelInfo | undefined;
    }
    return MODEL_REGISTRY.llm[modelName as LlmModelName] as ModelInfo | undefined;
  }

  async downloadModel(
    modelType: 'embed' | 'llm',
    onProgress?: IndexBuildCallback
  ): Promise<string> {
    await this.ensureModelsDirectory();

    const modelName = modelType === 'embed' ? this.config.embedModel : this.config.llmModel;
    const modelPath = modelType === 'embed' ? this.getEmbedModelPath() : this.getLlmModelPath();

    if (fs.existsSync(modelPath)) {
      return modelPath;
    }

    const modelInfo = this.getModelInfo(modelType, modelName);

    if (!modelInfo) {
      const availableModels = modelType === 'embed'
        ? Object.keys(MODEL_REGISTRY.embeddings)
        : Object.keys(MODEL_REGISTRY.llm);
      throw new Error(`Unknown model: ${modelName}. Available models: ${availableModels.join(', ')}`);
    }

    onProgress?.({
      phase: 'downloading',
      current: 0,
      total: modelInfo.size,
      message: `Downloading ${modelName}...`,
    });

    const response = await fetch(modelInfo.url);
    if (!response.ok) {
      throw new Error(`Failed to download model: ${response.statusText}`);
    }

    const contentLength = Number(response.headers.get('content-length')) || modelInfo.size;
    let downloaded = 0;

    const tempPath = `${modelPath}.tmp`;
    const fileStream = createWriteStream(tempPath);

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get response body reader');
    }

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const canContinue = fileStream.write(Buffer.from(value));
        if (!canContinue) {
          await new Promise<void>((resolve) => fileStream.once('drain', resolve));
        }
        downloaded += value.length;

        onProgress?.({
          phase: 'downloading',
          current: downloaded,
          total: contentLength,
          message: `Downloading ${modelName}: ${Math.round((downloaded / contentLength) * 100)}%`,
        });
      }

      fileStream.end();
      await new Promise<void>((resolve, reject) => {
        fileStream.on('finish', resolve);
        fileStream.on('error', reject);
      });

      await fs.promises.rename(tempPath, modelPath);
      return modelPath;
    } catch (error) {
      if (fs.existsSync(tempPath)) {
        await fs.promises.unlink(tempPath);
      }
      throw error;
    }
  }

  async ensureEmbedModel(onProgress?: IndexBuildCallback): Promise<string> {
    if (this.embedModelPath && fs.existsSync(this.embedModelPath)) {
      return this.embedModelPath;
    }

    if (!this.isEmbedModelAvailable()) {
      if (!this.config.autoDownload) {
        throw new Error(
          `Embedding model not found at ${this.getEmbedModelPath()}. ` +
          'Set autoDownload: true or manually download the model.'
        );
      }
      this.embedModelPath = await this.downloadModel('embed', onProgress);
    } else {
      this.embedModelPath = this.getEmbedModelPath();
    }

    return this.embedModelPath;
  }

  async ensureLlmModel(onProgress?: IndexBuildCallback): Promise<string> {
    if (this.llmModelPath && fs.existsSync(this.llmModelPath)) {
      return this.llmModelPath;
    }

    if (!this.isLlmModelAvailable()) {
      if (!this.config.autoDownload) {
        throw new Error(
          `LLM model not found at ${this.getLlmModelPath()}. ` +
          'Set autoDownload: true or manually download the model.'
        );
      }
      this.llmModelPath = await this.downloadModel('llm', onProgress);
    } else {
      this.llmModelPath = this.getLlmModelPath();
    }

    return this.llmModelPath;
  }

  async ensureAllModels(onProgress?: IndexBuildCallback): Promise<{
    embedModel: string;
    llmModel: string;
  }> {
    const embedModel = await this.ensureEmbedModel(onProgress);
    const llmModel = await this.ensureLlmModel(onProgress);
    return { embedModel, llmModel };
  }

  getPublicModelInfo(modelType: 'embed' | 'llm'): {
    name: string;
    path: string;
    available: boolean;
    size: number;
    description: string;
  } {
    const modelName = modelType === 'embed' ? this.config.embedModel : this.config.llmModel;
    const modelPath = modelType === 'embed' ? this.getEmbedModelPath() : this.getLlmModelPath();
    const modelInfo = this.getModelInfo(modelType, modelName);

    return {
      name: modelName,
      path: modelPath,
      available: fs.existsSync(modelPath),
      size: modelInfo?.size ?? 0,
      description: modelInfo?.description ?? 'Unknown model',
    };
  }

  async clearModels(): Promise<void> {
    const embedPath = this.getEmbedModelPath();
    const llmPath = this.getLlmModelPath();

    if (fs.existsSync(embedPath)) {
      await fs.promises.unlink(embedPath);
    }
    if (fs.existsSync(llmPath)) {
      await fs.promises.unlink(llmPath);
    }

    this.embedModelPath = null;
    this.llmModelPath = null;
  }

  getConfig(): Required<LocalModelConfig> {
    return { ...this.config };
  }
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function getDefaultModelDir(): string {
  return DEFAULT_MODEL_DIR;
}
