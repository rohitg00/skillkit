import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, basename } from 'node:path';
import type { AgentType } from '../types.js';
import {
  type FormatTranslator,
  type CanonicalSkill,
  type TranslationResult,
  type TranslationOptions,
  type FormatCategory,
  AGENT_FORMAT_MAP,
} from './types.js';
import { skillMdTranslator } from './formats/skill-md.js';
import { cursorTranslator } from './formats/cursor.js';
import { windsurfTranslator } from './formats/windsurf.js';
import { copilotTranslator } from './formats/copilot.js';

/**
 * Translator Registry
 *
 * Central registry for all format translators. Handles:
 * - Format detection
 * - Translation between any supported formats
 * - Finding the optimal translation path
 */
export class TranslatorRegistry {
  private translators: Map<FormatCategory, FormatTranslator> = new Map();
  private agentTranslators: Map<AgentType, FormatTranslator> = new Map();

  constructor() {
    // Register built-in translators
    this.register(skillMdTranslator);
    this.register(cursorTranslator);
    this.register(windsurfTranslator);
    this.register(copilotTranslator);
  }

  /**
   * Register a format translator
   */
  register(translator: FormatTranslator): void {
    this.translators.set(translator.format, translator);

    // Map agents to their translators
    for (const agent of translator.agents) {
      this.agentTranslators.set(agent, translator);
    }
  }

  /**
   * Get translator for a specific format
   */
  getTranslator(format: FormatCategory): FormatTranslator | undefined {
    return this.translators.get(format);
  }

  /**
   * Get translator for a specific agent
   */
  getTranslatorForAgent(agent: AgentType): FormatTranslator {
    // Check if we have a specific translator for this agent
    const specific = this.agentTranslators.get(agent);
    if (specific) {
      return specific;
    }

    // Fall back to SKILL.md translator (works for most agents)
    return skillMdTranslator;
  }

  /**
   * Get the format category for an agent
   */
  getFormatForAgent(agent: AgentType): FormatCategory {
    return AGENT_FORMAT_MAP[agent] || 'skill-md';
  }

  /**
   * Detect the format of content
   */
  detectFormat(content: string, filename?: string): FormatCategory | null {
    // Try each translator's detect method
    for (const [format, translator] of this.translators) {
      if (translator.detect(content, filename)) {
        return format;
      }
    }

    // Default to skill-md if content has YAML frontmatter
    if (content.startsWith('---')) {
      return 'skill-md';
    }

    return null;
  }

  /**
   * Detect the source agent from content
   */
  detectSourceAgent(content: string, filename?: string): AgentType | null {
    const format = this.detectFormat(content, filename);
    if (!format) return null;

    // Check filename for agent hints
    if (filename) {
      const lower = filename.toLowerCase();
      if (lower.includes('cursor') || lower.endsWith('.mdc')) return 'cursor';
      if (lower.includes('windsurf')) return 'windsurf';
      if (lower.includes('copilot')) return 'github-copilot';
    }

    // Return first agent that uses this format
    for (const [agent, agentFormat] of Object.entries(AGENT_FORMAT_MAP)) {
      if (agentFormat === format) {
        return agent as AgentType;
      }
    }

    return null;
  }

  /**
   * Parse content into canonical format
   */
  parse(content: string, filename?: string): CanonicalSkill | null {
    const format = this.detectFormat(content, filename);
    if (!format) {
      // Try skill-md as fallback
      return skillMdTranslator.parse(content, filename);
    }

    const translator = this.translators.get(format);
    if (!translator) {
      return null;
    }

    return translator.parse(content, filename);
  }

  /**
   * Translate skill to target agent format
   */
  translate(
    skill: CanonicalSkill,
    targetAgent: AgentType,
    options: TranslationOptions = {}
  ): TranslationResult {
    const translator = this.getTranslatorForAgent(targetAgent);
    return translator.generate(skill, targetAgent, options);
  }

  /**
   * Translate content directly from one agent to another
   */
  translateContent(
    content: string,
    targetAgent: AgentType,
    options: TranslationOptions & { sourceFilename?: string } = {}
  ): TranslationResult {
    // Parse source content
    const skill = this.parse(content, options.sourceFilename);
    if (!skill) {
      return {
        success: false,
        content: '',
        filename: '',
        warnings: [],
        incompatible: ['Failed to parse source content'],
        targetFormat: this.getFormatForAgent(targetAgent),
        targetAgent,
      };
    }

    // Translate to target format
    return this.translate(skill, targetAgent, options);
  }

  /**
   * Translate a skill file to target agent format
   */
  translateFile(
    sourcePath: string,
    targetAgent: AgentType,
    options: TranslationOptions = {}
  ): TranslationResult {
    if (!existsSync(sourcePath)) {
      return {
        success: false,
        content: '',
        filename: '',
        warnings: [],
        incompatible: [`Source file not found: ${sourcePath}`],
        targetFormat: this.getFormatForAgent(targetAgent),
        targetAgent,
      };
    }

    const content = readFileSync(sourcePath, 'utf-8');
    const filename = basename(sourcePath);

    return this.translateContent(content, targetAgent, {
      ...options,
      sourceFilename: filename,
    });
  }

  /**
   * Translate and write to target path
   */
  translateAndWrite(
    sourcePath: string,
    targetPath: string,
    targetAgent: AgentType,
    options: TranslationOptions = {}
  ): TranslationResult {
    const result = this.translateFile(sourcePath, targetAgent, options);

    if (result.success) {
      // Ensure target directory exists
      const targetDir = dirname(targetPath);
      if (!existsSync(targetDir)) {
        mkdirSync(targetDir, { recursive: true });
      }

      // Write translated content
      writeFileSync(targetPath, result.content, 'utf-8');
    }

    return result;
  }

  /**
   * Get all supported agents
   */
  getSupportedAgents(): AgentType[] {
    return Object.keys(AGENT_FORMAT_MAP) as AgentType[];
  }

  /**
   * Get all registered formats
   */
  getRegisteredFormats(): FormatCategory[] {
    return Array.from(this.translators.keys());
  }

  /**
   * Check if translation is supported between two agents
   */
  canTranslate(from: AgentType, to: AgentType): boolean {
    // All agents can translate to/from each other via the canonical format
    return this.getSupportedAgents().includes(from) && this.getSupportedAgents().includes(to);
  }

  /**
   * Get translation compatibility info
   */
  getCompatibilityInfo(from: AgentType, to: AgentType): {
    supported: boolean;
    warnings: string[];
    lossyFields: string[];
  } {
    const fromFormat = this.getFormatForAgent(from);
    const toFormat = this.getFormatForAgent(to);
    const warnings: string[] = [];
    const lossyFields: string[] = [];

    // Cursor-specific features
    if (fromFormat === 'cursor-mdc' && toFormat !== 'cursor-mdc') {
      lossyFields.push('globs', 'alwaysApply');
      warnings.push('Cursor-specific features (globs, alwaysApply) will be preserved but not used');
    }

    // SKILL.md features going to markdown-rules
    if (fromFormat === 'skill-md' && toFormat === 'markdown-rules') {
      lossyFields.push('allowed-tools', 'metadata');
      warnings.push('Advanced SKILL.md features will be stored as comments');
    }

    return {
      supported: this.canTranslate(from, to),
      warnings,
      lossyFields,
    };
  }
}

/**
 * Default registry instance
 */
export const translatorRegistry = new TranslatorRegistry();
