import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname, basename } from 'node:path';
import type { ContextChunk } from '../providers/types.js';
import type { ContextSource, ContextFetchOptions } from './index.js';

interface CodePattern {
  type: 'framework' | 'testing' | 'config' | 'pattern';
  name: string;
  file: string;
  content: string;
  relevance: number;
}

export class CodebaseSource implements ContextSource {
  readonly name = 'codebase' as const;
  readonly displayName = 'Local Codebase';

  private projectPath: string;

  constructor(projectPath: string) {
    this.projectPath = projectPath;
  }

  async fetch(query: string, options: ContextFetchOptions = {}): Promise<ContextChunk[]> {
    const { maxChunks = 5, projectPath } = options;
    const basePath = projectPath || this.projectPath;

    const patterns = await this.analyzeCodebase(basePath, query);
    const chunks: ContextChunk[] = [];

    for (const pattern of patterns.slice(0, maxChunks)) {
      chunks.push({
        source: 'codebase',
        content: this.formatPattern(pattern),
        relevance: pattern.relevance,
        metadata: {
          type: pattern.type,
          name: pattern.name,
          file: pattern.file,
        },
      });
    }

    return chunks;
  }

  async isAvailable(): Promise<boolean> {
    return existsSync(this.projectPath);
  }

  private async analyzeCodebase(basePath: string, query: string): Promise<CodePattern[]> {
    const patterns: CodePattern[] = [];
    const queryLower = query.toLowerCase();

    const frameworkPatterns = await this.detectFrameworks(basePath);
    patterns.push(...frameworkPatterns.filter((p) => this.isRelevant(p, queryLower)));

    const testPatterns = await this.detectTestingSetup(basePath);
    patterns.push(...testPatterns.filter((p) => this.isRelevant(p, queryLower)));

    const configPatterns = await this.extractConfigs(basePath);
    patterns.push(...configPatterns.filter((p) => this.isRelevant(p, queryLower)));

    const codePatterns = await this.findRelevantCode(basePath, query);
    patterns.push(...codePatterns);

    return patterns.sort((a, b) => b.relevance - a.relevance);
  }

  private async detectFrameworks(basePath: string): Promise<CodePattern[]> {
    const patterns: CodePattern[] = [];
    const packageJsonPath = join(basePath, 'package.json');

    if (existsSync(packageJsonPath)) {
      try {
        const content = readFileSync(packageJsonPath, 'utf-8');
        const pkg = JSON.parse(content);
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };

        const frameworks = [
          { name: 'react', pattern: 'React' },
          { name: 'vue', pattern: 'Vue' },
          { name: 'svelte', pattern: 'Svelte' },
          { name: 'next', pattern: 'Next.js' },
          { name: 'nuxt', pattern: 'Nuxt' },
          { name: 'express', pattern: 'Express' },
          { name: 'fastify', pattern: 'Fastify' },
          { name: 'hono', pattern: 'Hono' },
        ];

        for (const { name, pattern } of frameworks) {
          if (deps[name]) {
            patterns.push({
              type: 'framework',
              name: pattern,
              file: 'package.json',
              content: `Detected ${pattern} framework (version: ${deps[name]})`,
              relevance: 0.8,
            });
          }
        }
      } catch {
        // Ignore parse errors
      }
    }

    const pyprojectPath = join(basePath, 'pyproject.toml');
    if (existsSync(pyprojectPath)) {
      patterns.push({
        type: 'framework',
        name: 'Python',
        file: 'pyproject.toml',
        content: 'Python project detected',
        relevance: 0.7,
      });
    }

    const cargoPath = join(basePath, 'Cargo.toml');
    if (existsSync(cargoPath)) {
      patterns.push({
        type: 'framework',
        name: 'Rust',
        file: 'Cargo.toml',
        content: 'Rust project detected',
        relevance: 0.7,
      });
    }

    const goModPath = join(basePath, 'go.mod');
    if (existsSync(goModPath)) {
      patterns.push({
        type: 'framework',
        name: 'Go',
        file: 'go.mod',
        content: 'Go project detected',
        relevance: 0.7,
      });
    }

    return patterns;
  }

  private async detectTestingSetup(basePath: string): Promise<CodePattern[]> {
    const patterns: CodePattern[] = [];
    const packageJsonPath = join(basePath, 'package.json');

    if (existsSync(packageJsonPath)) {
      try {
        const content = readFileSync(packageJsonPath, 'utf-8');
        const pkg = JSON.parse(content);
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };

        const testFrameworks = [
          { name: 'vitest', pattern: 'Vitest' },
          { name: 'jest', pattern: 'Jest' },
          { name: 'mocha', pattern: 'Mocha' },
          { name: '@playwright/test', pattern: 'Playwright' },
          { name: 'cypress', pattern: 'Cypress' },
          { name: '@testing-library/react', pattern: 'React Testing Library' },
        ];

        for (const { name, pattern } of testFrameworks) {
          if (deps[name]) {
            patterns.push({
              type: 'testing',
              name: pattern,
              file: 'package.json',
              content: `Testing framework: ${pattern}`,
              relevance: 0.85,
            });
          }
        }
      } catch {
        // Ignore parse errors
      }
    }

    const vitestConfig = join(basePath, 'vitest.config.ts');
    if (existsSync(vitestConfig)) {
      try {
        const content = readFileSync(vitestConfig, 'utf-8');
        patterns.push({
          type: 'testing',
          name: 'Vitest Config',
          file: 'vitest.config.ts',
          content: content.slice(0, 500),
          relevance: 0.9,
        });
      } catch {
        // Ignore read errors
      }
    }

    const jestConfig = join(basePath, 'jest.config.js');
    if (existsSync(jestConfig)) {
      try {
        const content = readFileSync(jestConfig, 'utf-8');
        patterns.push({
          type: 'testing',
          name: 'Jest Config',
          file: 'jest.config.js',
          content: content.slice(0, 500),
          relevance: 0.9,
        });
      } catch {
        // Ignore read errors
      }
    }

    return patterns;
  }

  private async extractConfigs(basePath: string): Promise<CodePattern[]> {
    const patterns: CodePattern[] = [];

    const configFiles = [
      { file: 'tsconfig.json', name: 'TypeScript' },
      { file: '.eslintrc.json', name: 'ESLint' },
      { file: 'eslint.config.js', name: 'ESLint' },
      { file: '.prettierrc', name: 'Prettier' },
      { file: 'tailwind.config.js', name: 'Tailwind' },
      { file: 'tailwind.config.ts', name: 'Tailwind' },
    ];

    for (const { file, name } of configFiles) {
      const filePath = join(basePath, file);
      if (existsSync(filePath)) {
        try {
          const content = readFileSync(filePath, 'utf-8');
          patterns.push({
            type: 'config',
            name: `${name} Config`,
            file,
            content: content.slice(0, 400),
            relevance: 0.6,
          });
        } catch {
          // Ignore read errors
        }
      }
    }

    return patterns;
  }

  private async findRelevantCode(basePath: string, query: string): Promise<CodePattern[]> {
    const patterns: CodePattern[] = [];
    const keywords = query.toLowerCase().split(/\s+/);

    const searchDirs = ['src', 'lib', 'app', 'pages', 'components'];

    for (const dir of searchDirs) {
      const dirPath = join(basePath, dir);
      if (existsSync(dirPath)) {
        const files = this.findFilesRecursive(dirPath, ['.ts', '.tsx', '.js', '.jsx', '.py', '.go', '.rs']);

        for (const file of files.slice(0, 20)) {
          try {
            const content = readFileSync(file, 'utf-8');
            const fileName = basename(file).toLowerCase();

            const relevance = this.calculateRelevance(fileName, content, keywords);
            if (relevance > 0.3) {
              patterns.push({
                type: 'pattern',
                name: basename(file),
                file: file.replace(basePath, ''),
                content: this.extractRelevantSection(content, keywords),
                relevance,
              });
            }
          } catch {
            // Ignore read errors
          }
        }
      }
    }

    return patterns.sort((a, b) => b.relevance - a.relevance).slice(0, 5);
  }

  private findFilesRecursive(dir: string, extensions: string[]): string[] {
    const files: string[] = [];

    try {
      const entries = readdirSync(dir);

      for (const entry of entries) {
        if (entry.startsWith('.') || entry === 'node_modules' || entry === 'dist') {
          continue;
        }

        const fullPath = join(dir, entry);
        try {
          const stat = statSync(fullPath);

          if (stat.isDirectory()) {
            files.push(...this.findFilesRecursive(fullPath, extensions));
          } else if (extensions.includes(extname(entry))) {
            files.push(fullPath);
          }
        } catch {
          // Skip inaccessible files
        }
      }
    } catch {
      // Skip inaccessible directories
    }

    return files;
  }

  private calculateRelevance(fileName: string, content: string, keywords: string[]): number {
    let score = 0;
    const contentLower = content.toLowerCase();

    for (const keyword of keywords) {
      if (fileName.includes(keyword)) {
        score += 0.3;
      }
      const matches = (contentLower.match(new RegExp(keyword, 'g')) || []).length;
      score += Math.min(matches * 0.05, 0.3);
    }

    return Math.min(score, 1);
  }

  private extractRelevantSection(content: string, keywords: string[]): string {
    const lines = content.split('\n');
    const relevantLines: number[] = [];

    for (let i = 0; i < lines.length; i++) {
      const lineLower = lines[i].toLowerCase();
      for (const keyword of keywords) {
        if (lineLower.includes(keyword)) {
          for (let j = Math.max(0, i - 2); j <= Math.min(lines.length - 1, i + 2); j++) {
            if (!relevantLines.includes(j)) {
              relevantLines.push(j);
            }
          }
          break;
        }
      }
    }

    if (relevantLines.length === 0) {
      return lines.slice(0, 20).join('\n');
    }

    relevantLines.sort((a, b) => a - b);
    return relevantLines.map((i) => lines[i]).join('\n').slice(0, 500);
  }

  private isRelevant(pattern: CodePattern, queryLower: string): boolean {
    const nameLower = pattern.name.toLowerCase();
    const contentLower = pattern.content.toLowerCase();

    const keywords = queryLower.split(/\s+/);

    for (const keyword of keywords) {
      if (nameLower.includes(keyword) || contentLower.includes(keyword)) {
        return true;
      }
    }

    const generalTerms = ['test', 'testing', 'framework', 'config', 'setup'];
    for (const term of generalTerms) {
      if (queryLower.includes(term) && (nameLower.includes(term) || pattern.type === 'testing')) {
        return true;
      }
    }

    return false;
  }

  private formatPattern(pattern: CodePattern): string {
    return `## ${pattern.name} (${pattern.type})
File: ${pattern.file}

${pattern.content}`;
  }
}
