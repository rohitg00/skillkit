import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, basename } from 'node:path';
import type { ProjectStack, Detection, ProjectPatterns } from './types.js';

/**
 * Framework detection patterns
 */
const FRAMEWORK_PATTERNS = {
  // Frontend frameworks
  react: {
    dependencies: ['react', 'react-dom'],
    files: [],
    category: 'frameworks' as const,
    tags: ['react', 'frontend', 'ui'],
  },
  nextjs: {
    dependencies: ['next'],
    files: ['next.config.js', 'next.config.mjs', 'next.config.ts'],
    category: 'frameworks' as const,
    tags: ['nextjs', 'react', 'ssr', 'frontend'],
  },
  vue: {
    dependencies: ['vue'],
    files: [],
    category: 'frameworks' as const,
    tags: ['vue', 'frontend', 'ui'],
  },
  nuxt: {
    dependencies: ['nuxt'],
    files: ['nuxt.config.js', 'nuxt.config.ts'],
    category: 'frameworks' as const,
    tags: ['nuxt', 'vue', 'ssr', 'frontend'],
  },
  angular: {
    dependencies: ['@angular/core'],
    files: ['angular.json'],
    category: 'frameworks' as const,
    tags: ['angular', 'frontend', 'ui'],
  },
  svelte: {
    dependencies: ['svelte'],
    files: ['svelte.config.js'],
    category: 'frameworks' as const,
    tags: ['svelte', 'frontend', 'ui'],
  },
  remix: {
    dependencies: ['@remix-run/react'],
    files: ['remix.config.js'],
    category: 'frameworks' as const,
    tags: ['remix', 'react', 'ssr', 'frontend'],
  },
  astro: {
    dependencies: ['astro'],
    files: ['astro.config.mjs', 'astro.config.ts'],
    category: 'frameworks' as const,
    tags: ['astro', 'static', 'frontend'],
  },
  solid: {
    dependencies: ['solid-js'],
    files: [],
    category: 'frameworks' as const,
    tags: ['solid', 'frontend', 'ui'],
  },

  // Backend frameworks
  express: {
    dependencies: ['express'],
    files: [],
    category: 'frameworks' as const,
    tags: ['express', 'nodejs', 'api', 'backend'],
  },
  fastify: {
    dependencies: ['fastify'],
    files: [],
    category: 'frameworks' as const,
    tags: ['fastify', 'nodejs', 'api', 'backend'],
  },
  hono: {
    dependencies: ['hono'],
    files: [],
    category: 'frameworks' as const,
    tags: ['hono', 'edge', 'api', 'backend'],
  },
  koa: {
    dependencies: ['koa'],
    files: [],
    category: 'frameworks' as const,
    tags: ['koa', 'nodejs', 'api', 'backend'],
  },
  nestjs: {
    dependencies: ['@nestjs/core'],
    files: ['nest-cli.json'],
    category: 'frameworks' as const,
    tags: ['nestjs', 'nodejs', 'api', 'backend'],
  },

  // Mobile
  'react-native': {
    dependencies: ['react-native'],
    files: ['metro.config.js', 'app.json'],
    category: 'frameworks' as const,
    tags: ['react-native', 'mobile', 'ios', 'android'],
  },
  expo: {
    dependencies: ['expo'],
    files: ['app.json', 'expo.json'],
    category: 'frameworks' as const,
    tags: ['expo', 'react-native', 'mobile'],
  },

  // Desktop
  electron: {
    dependencies: ['electron'],
    files: ['electron.js', 'electron-builder.json'],
    category: 'frameworks' as const,
    tags: ['electron', 'desktop'],
  },
  tauri: {
    dependencies: ['@tauri-apps/api'],
    files: ['tauri.conf.json', 'src-tauri'],
    category: 'frameworks' as const,
    tags: ['tauri', 'desktop', 'rust'],
  },
};

/**
 * Library detection patterns
 */
const LIBRARY_PATTERNS = {
  // State management
  redux: {
    dependencies: ['redux', '@reduxjs/toolkit'],
    category: 'libraries' as const,
    tags: ['redux', 'state-management'],
  },
  zustand: {
    dependencies: ['zustand'],
    category: 'libraries' as const,
    tags: ['zustand', 'state-management'],
  },
  jotai: {
    dependencies: ['jotai'],
    category: 'libraries' as const,
    tags: ['jotai', 'state-management'],
  },
  recoil: {
    dependencies: ['recoil'],
    category: 'libraries' as const,
    tags: ['recoil', 'state-management'],
  },
  mobx: {
    dependencies: ['mobx'],
    category: 'libraries' as const,
    tags: ['mobx', 'state-management'],
  },

  // Data fetching
  tanstack: {
    dependencies: ['@tanstack/react-query', '@tanstack/query-core'],
    category: 'libraries' as const,
    tags: ['tanstack', 'data-fetching', 'caching'],
  },
  swr: {
    dependencies: ['swr'],
    category: 'libraries' as const,
    tags: ['swr', 'data-fetching'],
  },
  trpc: {
    dependencies: ['@trpc/client', '@trpc/server'],
    category: 'libraries' as const,
    tags: ['trpc', 'api', 'typescript'],
  },
  graphql: {
    dependencies: ['graphql', '@apollo/client', 'urql'],
    category: 'libraries' as const,
    tags: ['graphql', 'api'],
  },

  // UI Components
  'shadcn-ui': {
    dependencies: ['@radix-ui/react-slot'],
    files: ['components.json'],
    category: 'libraries' as const,
    tags: ['shadcn', 'ui', 'components'],
  },
  'material-ui': {
    dependencies: ['@mui/material'],
    category: 'libraries' as const,
    tags: ['mui', 'material', 'ui', 'components'],
  },
  'chakra-ui': {
    dependencies: ['@chakra-ui/react'],
    category: 'libraries' as const,
    tags: ['chakra', 'ui', 'components'],
  },
  'ant-design': {
    dependencies: ['antd'],
    category: 'libraries' as const,
    tags: ['antd', 'ui', 'components'],
  },

  // Form handling
  'react-hook-form': {
    dependencies: ['react-hook-form'],
    category: 'libraries' as const,
    tags: ['forms', 'validation'],
  },
  formik: {
    dependencies: ['formik'],
    category: 'libraries' as const,
    tags: ['forms', 'validation'],
  },
  zod: {
    dependencies: ['zod'],
    category: 'libraries' as const,
    tags: ['validation', 'schema', 'typescript'],
  },

  // Animation
  'framer-motion': {
    dependencies: ['framer-motion'],
    category: 'libraries' as const,
    tags: ['animation', 'motion'],
  },
};

/**
 * Styling detection patterns
 */
const STYLING_PATTERNS = {
  tailwindcss: {
    dependencies: ['tailwindcss'],
    files: ['tailwind.config.js', 'tailwind.config.ts', 'tailwind.config.cjs'],
    category: 'styling' as const,
    tags: ['tailwind', 'css', 'utility-first'],
  },
  'styled-components': {
    dependencies: ['styled-components'],
    category: 'styling' as const,
    tags: ['styled-components', 'css-in-js'],
  },
  emotion: {
    dependencies: ['@emotion/react', '@emotion/styled'],
    category: 'styling' as const,
    tags: ['emotion', 'css-in-js'],
  },
  sass: {
    dependencies: ['sass', 'node-sass'],
    category: 'styling' as const,
    tags: ['sass', 'scss', 'css'],
  },
  less: {
    dependencies: ['less'],
    category: 'styling' as const,
    tags: ['less', 'css'],
  },
  'css-modules': {
    files: ['*.module.css', '*.module.scss'],
    category: 'styling' as const,
    tags: ['css-modules', 'css'],
  },
};

/**
 * Testing detection patterns
 */
const TESTING_PATTERNS = {
  jest: {
    dependencies: ['jest'],
    files: ['jest.config.js', 'jest.config.ts'],
    category: 'testing' as const,
    tags: ['jest', 'testing', 'unit-testing'],
  },
  vitest: {
    dependencies: ['vitest'],
    files: ['vitest.config.ts', 'vitest.config.js'],
    category: 'testing' as const,
    tags: ['vitest', 'testing', 'unit-testing'],
  },
  playwright: {
    dependencies: ['@playwright/test'],
    files: ['playwright.config.ts', 'playwright.config.js'],
    category: 'testing' as const,
    tags: ['playwright', 'e2e', 'testing'],
  },
  cypress: {
    dependencies: ['cypress'],
    files: ['cypress.config.ts', 'cypress.config.js', 'cypress.json'],
    category: 'testing' as const,
    tags: ['cypress', 'e2e', 'testing'],
  },
  mocha: {
    dependencies: ['mocha'],
    category: 'testing' as const,
    tags: ['mocha', 'testing'],
  },
  'testing-library': {
    dependencies: ['@testing-library/react', '@testing-library/vue'],
    category: 'testing' as const,
    tags: ['testing-library', 'testing'],
  },
};

/**
 * Database detection patterns
 */
const DATABASE_PATTERNS = {
  prisma: {
    dependencies: ['@prisma/client', 'prisma'],
    files: ['prisma/schema.prisma'],
    category: 'databases' as const,
    tags: ['prisma', 'orm', 'database'],
  },
  drizzle: {
    dependencies: ['drizzle-orm'],
    files: ['drizzle.config.ts'],
    category: 'databases' as const,
    tags: ['drizzle', 'orm', 'database'],
  },
  typeorm: {
    dependencies: ['typeorm'],
    category: 'databases' as const,
    tags: ['typeorm', 'orm', 'database'],
  },
  mongoose: {
    dependencies: ['mongoose'],
    category: 'databases' as const,
    tags: ['mongoose', 'mongodb', 'database'],
  },
  supabase: {
    dependencies: ['@supabase/supabase-js'],
    category: 'databases' as const,
    tags: ['supabase', 'postgres', 'database', 'auth'],
  },
  firebase: {
    dependencies: ['firebase', 'firebase-admin'],
    category: 'databases' as const,
    tags: ['firebase', 'database', 'auth'],
  },
};

/**
 * Tool detection patterns
 */
const TOOL_PATTERNS = {
  eslint: {
    dependencies: ['eslint'],
    files: ['.eslintrc', '.eslintrc.js', '.eslintrc.json', 'eslint.config.js'],
    category: 'tools' as const,
    tags: ['eslint', 'linting'],
  },
  prettier: {
    dependencies: ['prettier'],
    files: ['.prettierrc', '.prettierrc.js', 'prettier.config.js'],
    category: 'tools' as const,
    tags: ['prettier', 'formatting'],
  },
  biome: {
    dependencies: ['@biomejs/biome'],
    files: ['biome.json'],
    category: 'tools' as const,
    tags: ['biome', 'linting', 'formatting'],
  },
  husky: {
    dependencies: ['husky'],
    files: ['.husky'],
    category: 'tools' as const,
    tags: ['husky', 'git-hooks'],
  },
  'lint-staged': {
    dependencies: ['lint-staged'],
    category: 'tools' as const,
    tags: ['lint-staged', 'git-hooks'],
  },
  turbo: {
    dependencies: ['turbo'],
    files: ['turbo.json'],
    category: 'tools' as const,
    tags: ['turbo', 'monorepo', 'build'],
  },
  nx: {
    dependencies: ['nx'],
    files: ['nx.json'],
    category: 'tools' as const,
    tags: ['nx', 'monorepo', 'build'],
  },
  docker: {
    files: ['Dockerfile', 'docker-compose.yml', 'docker-compose.yaml'],
    category: 'tools' as const,
    tags: ['docker', 'containers'],
  },
};

/**
 * Project Detector
 *
 * Analyzes a project directory to detect the technology stack,
 * frameworks, libraries, and patterns used.
 */
export class ProjectDetector {
  private projectPath: string;
  private packageJson: Record<string, unknown> | null = null;
  private files: Set<string> = new Set();

  constructor(projectPath: string) {
    this.projectPath = projectPath;
  }

  /**
   * Analyze the project and return detected stack
   */
  analyze(): ProjectStack {
    // Load package.json if exists
    this.loadPackageJson();

    // Scan root files
    this.scanFiles();

    // Detect everything
    const stack: ProjectStack = {
      languages: this.detectLanguages(),
      frameworks: this.detectFromPatterns(FRAMEWORK_PATTERNS),
      libraries: this.detectFromPatterns(LIBRARY_PATTERNS),
      styling: this.detectFromPatterns(STYLING_PATTERNS),
      testing: this.detectFromPatterns(TESTING_PATTERNS),
      databases: this.detectFromPatterns(DATABASE_PATTERNS),
      tools: this.detectFromPatterns(TOOL_PATTERNS),
      runtime: this.detectRuntime(),
    };

    return stack;
  }

  /**
   * Detect project patterns and conventions
   */
  detectPatterns(): ProjectPatterns {
    const patterns: ProjectPatterns = {};

    // Detect component style
    if (this.hasFile('*.tsx') || this.hasFile('*.jsx')) {
      // Check for class components vs functional
      patterns.components = 'functional'; // Modern default
    }

    // Detect state management
    const deps = this.getDependencies();
    if (deps.has('zustand')) patterns.stateManagement = 'zustand';
    else if (deps.has('@reduxjs/toolkit') || deps.has('redux')) patterns.stateManagement = 'redux';
    else if (deps.has('jotai')) patterns.stateManagement = 'jotai';
    else if (deps.has('recoil')) patterns.stateManagement = 'recoil';
    else if (deps.has('mobx')) patterns.stateManagement = 'mobx';

    // Detect API style
    if (deps.has('@trpc/client')) patterns.apiStyle = 'trpc';
    else if (deps.has('graphql') || deps.has('@apollo/client')) patterns.apiStyle = 'graphql';
    else if (deps.has('next') && this.hasFile('app/**/actions.ts')) patterns.apiStyle = 'server-actions';
    else patterns.apiStyle = 'rest';

    // Detect styling
    if (deps.has('tailwindcss')) patterns.styling = 'tailwind';
    else if (deps.has('styled-components')) patterns.styling = 'styled-components';
    else if (deps.has('@emotion/react')) patterns.styling = 'emotion';
    else if (this.hasFile('*.module.css')) patterns.styling = 'css-modules';

    // Detect testing
    if (deps.has('vitest')) patterns.testing = 'vitest';
    else if (deps.has('jest')) patterns.testing = 'jest';
    else if (deps.has('@playwright/test')) patterns.testing = 'playwright';
    else if (deps.has('cypress')) patterns.testing = 'cypress';

    // Detect linting
    if (deps.has('@biomejs/biome')) patterns.linting = 'biome';
    else if (deps.has('eslint')) patterns.linting = 'eslint';

    // Detect formatting
    if (deps.has('@biomejs/biome')) patterns.formatting = 'biome';
    else if (deps.has('prettier')) patterns.formatting = 'prettier';

    return patterns;
  }

  /**
   * Detect project type
   */
  detectProjectType(): string {
    const deps = this.getDependencies();

    // Check for specific project types
    if (deps.has('react-native') || deps.has('expo')) return 'mobile';
    if (deps.has('electron') || deps.has('@tauri-apps/api')) return 'desktop';
    if (deps.has('next') || deps.has('nuxt') || deps.has('remix')) return 'web-app';
    if (deps.has('express') || deps.has('fastify') || deps.has('hono')) return 'api';
    if (deps.has('commander') || deps.has('clipanion') || deps.has('yargs')) return 'cli';

    // Check for library indicators
    if (this.hasFile('rollup.config.js') || this.hasFile('tsup.config.ts')) return 'library';

    // Default
    if (deps.has('react') || deps.has('vue') || deps.has('svelte')) return 'web-app';

    return 'unknown';
  }

  /**
   * Get project name
   */
  getProjectName(): string {
    if (this.packageJson && typeof this.packageJson.name === 'string') {
      return this.packageJson.name;
    }
    return basename(this.projectPath);
  }

  /**
   * Get project description
   */
  getProjectDescription(): string | undefined {
    if (this.packageJson && typeof this.packageJson.description === 'string') {
      return this.packageJson.description;
    }
    return undefined;
  }

  // Private helpers

  private loadPackageJson(): void {
    const packageJsonPath = join(this.projectPath, 'package.json');
    if (existsSync(packageJsonPath)) {
      try {
        const content = readFileSync(packageJsonPath, 'utf-8');
        this.packageJson = JSON.parse(content);
      } catch {
        this.packageJson = null;
      }
    }
  }

  private scanFiles(): void {
    try {
      const entries = readdirSync(this.projectPath, { withFileTypes: true });
      for (const entry of entries) {
        this.files.add(entry.name);
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          // Scan one level deep for common config locations
          try {
            const subEntries = readdirSync(join(this.projectPath, entry.name));
            for (const subEntry of subEntries) {
              this.files.add(`${entry.name}/${subEntry}`);
            }
          } catch {
            // Ignore permission errors
          }
        }
      }
    } catch {
      // Ignore errors
    }
  }

  private getDependencies(): Set<string> {
    const deps = new Set<string>();
    if (!this.packageJson) return deps;

    const dependencies = this.packageJson.dependencies as Record<string, string> | undefined;
    const devDependencies = this.packageJson.devDependencies as Record<string, string> | undefined;

    if (dependencies) {
      for (const dep of Object.keys(dependencies)) {
        deps.add(dep);
      }
    }
    if (devDependencies) {
      for (const dep of Object.keys(devDependencies)) {
        deps.add(dep);
      }
    }

    return deps;
  }

  private getVersion(depName: string): string | undefined {
    if (!this.packageJson) return undefined;

    const dependencies = this.packageJson.dependencies as Record<string, string> | undefined;
    const devDependencies = this.packageJson.devDependencies as Record<string, string> | undefined;

    const version = dependencies?.[depName] || devDependencies?.[depName];
    if (version) {
      // Clean version string (remove ^, ~, etc.)
      return version.replace(/^[\^~>=<]+/, '');
    }
    return undefined;
  }

  private hasFile(pattern: string): boolean {
    if (pattern.includes('*')) {
      // Simple glob matching
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      for (const file of this.files) {
        if (regex.test(file)) return true;
      }
      return false;
    }
    return this.files.has(pattern);
  }

  private detectLanguages(): Detection[] {
    const languages: Detection[] = [];

    // TypeScript
    if (this.hasFile('tsconfig.json') || this.files.has('*.ts')) {
      const tsVersion = this.getVersion('typescript');
      languages.push({
        name: 'typescript',
        version: tsVersion,
        confidence: 100,
        source: 'tsconfig.json',
      });
    }

    // JavaScript (if no TypeScript, or alongside)
    if (this.hasFile('jsconfig.json') || (this.packageJson && !this.hasFile('tsconfig.json'))) {
      languages.push({
        name: 'javascript',
        confidence: 90,
        source: 'package.json',
      });
    }

    // Python
    if (this.hasFile('pyproject.toml') || this.hasFile('requirements.txt')) {
      languages.push({
        name: 'python',
        confidence: 100,
        source: 'pyproject.toml',
      });
    }

    // Rust
    if (this.hasFile('Cargo.toml')) {
      languages.push({
        name: 'rust',
        confidence: 100,
        source: 'Cargo.toml',
      });
    }

    // Go
    if (this.hasFile('go.mod')) {
      languages.push({
        name: 'go',
        confidence: 100,
        source: 'go.mod',
      });
    }

    return languages;
  }

  private detectRuntime(): Detection[] {
    const runtime: Detection[] = [];

    // Node.js
    if (this.packageJson) {
      const engines = this.packageJson.engines as Record<string, string> | undefined;
      const nodeVersion = engines?.node;
      runtime.push({
        name: 'nodejs',
        version: nodeVersion?.replace(/[>=<^~]+/g, ''),
        confidence: 100,
        source: 'package.json',
      });
    }

    // Bun
    if (this.hasFile('bun.lockb') || this.hasFile('bunfig.toml')) {
      runtime.push({
        name: 'bun',
        confidence: 100,
        source: 'bun.lockb',
      });
    }

    // Deno
    if (this.hasFile('deno.json') || this.hasFile('deno.jsonc')) {
      runtime.push({
        name: 'deno',
        confidence: 100,
        source: 'deno.json',
      });
    }

    return runtime;
  }

  private detectFromPatterns(
    patterns: Record<string, { dependencies?: string[]; files?: string[]; category: keyof ProjectStack; tags?: string[] }>
  ): Detection[] {
    const detected: Detection[] = [];
    const deps = this.getDependencies();

    for (const [name, pattern] of Object.entries(patterns)) {
      let found = false;
      let source: string | undefined;

      // Check dependencies
      if (pattern.dependencies) {
        for (const dep of pattern.dependencies) {
          if (deps.has(dep)) {
            found = true;
            source = 'package.json';
            break;
          }
        }
      }

      // Check files
      if (!found && pattern.files) {
        for (const file of pattern.files) {
          if (this.hasFile(file)) {
            found = true;
            source = file;
            break;
          }
        }
      }

      if (found) {
        const version = pattern.dependencies ? this.getVersion(pattern.dependencies[0]) : undefined;
        detected.push({
          name,
          version,
          confidence: 100,
          source,
        });
      }
    }

    return detected;
  }
}

/**
 * Analyze a project and return the detected stack
 */
export function analyzeProject(projectPath: string): ProjectStack {
  const detector = new ProjectDetector(projectPath);
  return detector.analyze();
}

/**
 * Get all relevant tags from a project stack
 */
export function getStackTags(stack: ProjectStack): string[] {
  const tags = new Set<string>();

  const addTags = (detections: Detection[], patterns: Record<string, { tags?: string[] }>) => {
    for (const detection of detections) {
      const pattern = patterns[detection.name];
      if (pattern?.tags) {
        for (const tag of pattern.tags) {
          tags.add(tag);
        }
      } else {
        tags.add(detection.name);
      }
    }
  };

  // Add language tags
  for (const lang of stack.languages) {
    tags.add(lang.name);
  }

  // Add framework tags
  addTags(stack.frameworks, FRAMEWORK_PATTERNS);
  addTags(stack.libraries, LIBRARY_PATTERNS);
  addTags(stack.styling, STYLING_PATTERNS);
  addTags(stack.testing, TESTING_PATTERNS);
  addTags(stack.databases, DATABASE_PATTERNS);

  return Array.from(tags);
}
