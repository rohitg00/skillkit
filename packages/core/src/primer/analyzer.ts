import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, basename } from 'node:path';
import type {
  PrimerAnalysis,
  PackageManager,
  CodeConvention,
  ProjectStructure,
  CIConfig,
  EnvConfig,
  DockerConfig,
} from './types.js';
import { ProjectDetector } from '../context/detector.js';
import type { Detection } from '../context/types.js';

const PACKAGE_MANAGER_FILES: Record<string, PackageManager> = {
  'package-lock.json': 'npm',
  'pnpm-lock.yaml': 'pnpm',
  'yarn.lock': 'yarn',
  'bun.lockb': 'bun',
  'requirements.txt': 'pip',
  'Pipfile.lock': 'pip',
  'poetry.lock': 'poetry',
  'uv.lock': 'uv',
  'Cargo.lock': 'cargo',
  'go.sum': 'go',
  'pom.xml': 'maven',
  'build.gradle': 'gradle',
  'build.gradle.kts': 'gradle',
  'composer.lock': 'composer',
  'Gemfile.lock': 'bundler',
  'Podfile.lock': 'cocoapods',
  'Package.resolved': 'swift-package-manager',
  'packages.lock.json': 'nuget',
};

const CI_CONFIG_FILES: Record<string, CIConfig['provider']> = {
  '.github/workflows': 'github-actions',
  '.gitlab-ci.yml': 'gitlab-ci',
  '.circleci/config.yml': 'circleci',
  'Jenkinsfile': 'jenkins',
  '.travis.yml': 'travis',
  'azure-pipelines.yml': 'azure-pipelines',
};

const IMPORTANT_CONFIG_FILES = [
  'package.json',
  'tsconfig.json',
  'pyproject.toml',
  'Cargo.toml',
  'go.mod',
  '.eslintrc.js',
  '.eslintrc.json',
  'eslint.config.js',
  '.prettierrc',
  'prettier.config.js',
  'biome.json',
  'tailwind.config.js',
  'tailwind.config.ts',
  'vite.config.ts',
  'next.config.js',
  'next.config.mjs',
  'webpack.config.js',
  'rollup.config.js',
  'turbo.json',
  'nx.json',
  'jest.config.js',
  'vitest.config.ts',
  'playwright.config.ts',
  '.env.example',
  'docker-compose.yml',
  'Dockerfile',
];

export class PrimerAnalyzer {
  private projectPath: string;
  private packageJson: Record<string, unknown> | null = null;
  private files: Set<string> = new Set();

  constructor(projectPath: string) {
    this.projectPath = projectPath;
  }

  analyze(): PrimerAnalysis {
    this.loadPackageJson();
    this.scanFiles();

    const detector = new ProjectDetector(this.projectPath);
    const stack = detector.analyze();
    const patterns = detector.detectPatterns();

    const analysis: PrimerAnalysis = {
      project: this.getProjectInfo(),
      languages: this.detectLanguages(),
      packageManagers: this.detectPackageManagers(),
      stack,
      patterns,
      structure: this.detectProjectStructure(),
      conventions: this.detectCodeConventions(),
      ci: this.detectCIConfig(),
      env: this.detectEnvConfig(),
      docker: this.detectDockerConfig(),
      buildCommands: this.extractBuildCommands(),
      importantFiles: this.findImportantFiles(),
      codebaseSize: this.estimateCodebaseSize(),
    };

    return analysis;
  }

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

  private scanFiles(maxDepth = 3): void {
    const scan = (dir: string, depth: number) => {
      if (depth > maxDepth) return;
      try {
        const entries = readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const relativePath = join(dir, entry.name).replace(this.projectPath + '/', '');
          if (entry.name.startsWith('.') && entry.name !== '.github' && entry.name !== '.env.example') {
            if (!entry.isDirectory()) {
              this.files.add(relativePath);
            }
            continue;
          }
          if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === 'build' || entry.name === '.git') {
            continue;
          }
          this.files.add(relativePath);
          if (entry.isDirectory()) {
            scan(join(dir, entry.name), depth + 1);
          }
        }
      } catch {
        // Ignore permission errors
      }
    };
    scan(this.projectPath, 0);
  }

  private getProjectInfo(): PrimerAnalysis['project'] {
    const info: PrimerAnalysis['project'] = {
      name: basename(this.projectPath),
    };

    if (this.packageJson) {
      if (typeof this.packageJson.name === 'string') {
        info.name = this.packageJson.name;
      }
      if (typeof this.packageJson.description === 'string') {
        info.description = this.packageJson.description;
      }
      if (typeof this.packageJson.version === 'string') {
        info.version = this.packageJson.version;
      }
      if (typeof this.packageJson.license === 'string') {
        info.license = this.packageJson.license;
      }
      const repo = this.packageJson.repository;
      if (typeof repo === 'string') {
        info.repository = repo;
      } else if (repo && typeof repo === 'object' && 'url' in repo) {
        info.repository = String(repo.url);
      }
    }

    const pyprojectPath = join(this.projectPath, 'pyproject.toml');
    if (!this.packageJson && existsSync(pyprojectPath)) {
      try {
        const content = readFileSync(pyprojectPath, 'utf-8');
        const nameMatch = content.match(/name\s*=\s*["']([^"']+)["']/);
        const versionMatch = content.match(/version\s*=\s*["']([^"']+)["']/);
        const descMatch = content.match(/description\s*=\s*["']([^"']+)["']/);
        if (nameMatch) info.name = nameMatch[1];
        if (versionMatch) info.version = versionMatch[1];
        if (descMatch) info.description = descMatch[1];
      } catch {
        // Ignore
      }
    }

    const cargoPath = join(this.projectPath, 'Cargo.toml');
    if (!this.packageJson && existsSync(cargoPath)) {
      try {
        const content = readFileSync(cargoPath, 'utf-8');
        const nameMatch = content.match(/name\s*=\s*["']([^"']+)["']/);
        const versionMatch = content.match(/version\s*=\s*["']([^"']+)["']/);
        const descMatch = content.match(/description\s*=\s*["']([^"']+)["']/);
        if (nameMatch) info.name = nameMatch[1];
        if (versionMatch) info.version = versionMatch[1];
        if (descMatch) info.description = descMatch[1];
      } catch {
        // Ignore
      }
    }

    const detector = new ProjectDetector(this.projectPath);
    info.type = detector.detectProjectType();

    return info;
  }

  private detectLanguages(): Detection[] {
    const languages: Detection[] = [];

    if (this.hasFile('tsconfig.json')) {
      const version = this.getDepVersion('typescript');
      languages.push({
        name: 'typescript',
        version,
        confidence: 100,
        source: 'tsconfig.json',
      });
    }

    if (this.packageJson && !this.hasFile('tsconfig.json')) {
      languages.push({
        name: 'javascript',
        confidence: 90,
        source: 'package.json',
      });
    }

    if (this.hasFile('pyproject.toml') || this.hasFile('requirements.txt') || this.hasFile('setup.py')) {
      languages.push({
        name: 'python',
        confidence: 100,
        source: 'pyproject.toml',
      });
    }

    if (this.hasFile('go.mod')) {
      languages.push({
        name: 'go',
        confidence: 100,
        source: 'go.mod',
      });
    }

    if (this.hasFile('Cargo.toml')) {
      languages.push({
        name: 'rust',
        confidence: 100,
        source: 'Cargo.toml',
      });
    }

    if (this.hasFile('pom.xml') || this.hasFile('build.gradle') || this.hasFile('build.gradle.kts')) {
      languages.push({
        name: 'java',
        confidence: 100,
        source: 'pom.xml',
      });
    }

    if (this.hasFile('Package.swift')) {
      languages.push({
        name: 'swift',
        confidence: 100,
        source: 'Package.swift',
      });
    }

    if (this.hasFile('Gemfile')) {
      languages.push({
        name: 'ruby',
        confidence: 100,
        source: 'Gemfile',
      });
    }

    if (this.hasFile('composer.json')) {
      languages.push({
        name: 'php',
        confidence: 100,
        source: 'composer.json',
      });
    }

    return languages;
  }

  private detectPackageManagers(): string[] {
    const managers: Set<string> = new Set();

    for (const [file, manager] of Object.entries(PACKAGE_MANAGER_FILES)) {
      if (this.hasFile(file)) {
        managers.add(manager);
      }
    }

    if (this.packageJson) {
      const packageManager = this.packageJson.packageManager;
      if (typeof packageManager === 'string') {
        const match = packageManager.match(/^(npm|pnpm|yarn|bun)@/);
        if (match) {
          managers.add(match[1]);
        }
      }
    }

    return Array.from(managers);
  }

  private detectProjectStructure(): ProjectStructure {
    const structure: ProjectStructure = {
      hasWorkspaces: false,
    };

    if (this.hasFile('src')) {
      structure.type = 'src-based';
      structure.srcDir = 'src';
    } else if (this.hasFile('packages') || this.hasFile('apps')) {
      structure.type = 'monorepo';
    } else if (this.hasFile('lib')) {
      structure.type = 'src-based';
      structure.srcDir = 'lib';
    } else {
      structure.type = 'flat';
    }

    if (this.hasFile('tests') || this.hasFile('test') || this.hasFile('__tests__')) {
      structure.testDir = this.hasFile('tests') ? 'tests' : this.hasFile('test') ? 'test' : '__tests__';
    }

    if (this.hasFile('docs') || this.hasFile('documentation')) {
      structure.docsDir = this.hasFile('docs') ? 'docs' : 'documentation';
    }

    if (this.packageJson) {
      const workspaces = this.packageJson.workspaces;
      if (Array.isArray(workspaces)) {
        structure.hasWorkspaces = true;
        structure.workspaces = workspaces.filter(w => typeof w === 'string') as string[];
        structure.type = 'monorepo';
      } else if (workspaces && typeof workspaces === 'object' && 'packages' in workspaces) {
        structure.hasWorkspaces = true;
        structure.workspaces = (workspaces.packages as string[]) || [];
        structure.type = 'monorepo';
      }
    }

    if (this.hasFile('pnpm-workspace.yaml')) {
      structure.hasWorkspaces = true;
      structure.type = 'monorepo';
    }

    if (this.hasFile('turbo.json') || this.hasFile('nx.json')) {
      structure.type = 'monorepo';
    }

    return structure;
  }

  private detectCodeConventions(): CodeConvention {
    const conventions: CodeConvention = {};

    const prettierConfig = this.readConfigFile([
      '.prettierrc',
      '.prettierrc.json',
      'prettier.config.js',
    ]);

    const biomeConfig = this.readConfigFile(['biome.json']);

    if (prettierConfig) {
      try {
        const config = typeof prettierConfig === 'string' ? JSON.parse(prettierConfig) : prettierConfig;
        if ('semi' in config) conventions.semicolons = config.semi;
        if ('singleQuote' in config) conventions.quotes = config.singleQuote ? 'single' : 'double';
        if ('tabWidth' in config) {
          conventions.indentation = config.useTabs ? 'tabs' : `spaces-${config.tabWidth}` as 'spaces-2' | 'spaces-4';
        }
        if ('trailingComma' in config) conventions.trailingCommas = config.trailingComma;
        if ('printWidth' in config) conventions.maxLineLength = config.printWidth;
      } catch {
        // Ignore parse errors
      }
    }

    if (biomeConfig) {
      try {
        const config = typeof biomeConfig === 'string' ? JSON.parse(biomeConfig) : biomeConfig;
        const formatter = config.formatter || {};
        const js = config.javascript?.formatter || {};
        if (formatter.indentStyle) conventions.indentation = formatter.indentStyle === 'tab' ? 'tabs' : 'spaces-2';
        if (formatter.lineWidth) conventions.maxLineLength = formatter.lineWidth;
        if (js.quoteStyle) conventions.quotes = js.quoteStyle;
        if (js.semicolons) conventions.semicolons = js.semicolons !== 'asNeeded';
        if (js.trailingCommas) conventions.trailingCommas = js.trailingCommas;
      } catch {
        // Ignore parse errors
      }
    }

    if (this.hasFile('tsconfig.json')) {
      try {
        const tsconfigPath = join(this.projectPath, 'tsconfig.json');
        const content = readFileSync(tsconfigPath, 'utf-8');
        const tsconfig = JSON.parse(content.replace(/\/\/.*$/gm, '').replace(/,\s*}/g, '}'));
        const paths = tsconfig.compilerOptions?.paths;
        if (paths && Object.keys(paths).some(k => k.startsWith('@'))) {
          conventions.namingStyle = 'camelCase';
        }
      } catch {
        // Ignore
      }
    }

    return conventions;
  }

  private detectCIConfig(): CIConfig {
    const ci: CIConfig = {
      hasCI: false,
      hasCD: false,
    };

    for (const [file, provider] of Object.entries(CI_CONFIG_FILES)) {
      if (this.hasFile(file)) {
        ci.hasCI = true;
        ci.provider = provider;
        ci.configFile = file;
        break;
      }
    }

    if (this.hasFile('.github/workflows')) {
      ci.hasCI = true;
      ci.provider = 'github-actions';
      ci.configFile = '.github/workflows';

      try {
        const workflowsDir = join(this.projectPath, '.github/workflows');
        const workflows = readdirSync(workflowsDir);
        const deployWorkflows = workflows.filter(f =>
          f.includes('deploy') || f.includes('release') || f.includes('publish')
        );
        if (deployWorkflows.length > 0) {
          ci.hasCD = true;
        }
      } catch {
        // Ignore
      }
    }

    return ci;
  }

  private detectEnvConfig(): EnvConfig {
    const env: EnvConfig = {
      hasEnvFile: false,
      hasEnvExample: false,
    };

    env.hasEnvFile = this.hasFile('.env');
    env.hasEnvExample = this.hasFile('.env.example') || this.hasFile('.env.template') || this.hasFile('.env.sample');

    if (env.hasEnvExample) {
      const envExamplePath = join(
        this.projectPath,
        this.hasFile('.env.example') ? '.env.example' : this.hasFile('.env.template') ? '.env.template' : '.env.sample'
      );
      try {
        const content = readFileSync(envExamplePath, 'utf-8');
        const variables = content
          .split('\n')
          .filter(line => line.trim() && !line.startsWith('#'))
          .map(line => line.split('=')[0].trim())
          .filter(v => v);
        env.envVariables = variables;
      } catch {
        // Ignore
      }
    }

    return env;
  }

  private detectDockerConfig(): DockerConfig {
    const docker: DockerConfig = {
      hasDockerfile: false,
      hasCompose: false,
    };

    docker.hasDockerfile = this.hasFile('Dockerfile');
    docker.hasCompose = this.hasFile('docker-compose.yml') || this.hasFile('docker-compose.yaml') || this.hasFile('compose.yml');

    if (docker.hasDockerfile) {
      try {
        const dockerfilePath = join(this.projectPath, 'Dockerfile');
        const content = readFileSync(dockerfilePath, 'utf-8');
        const fromMatch = content.match(/^FROM\s+(\S+)/m);
        if (fromMatch) {
          docker.baseImage = fromMatch[1];
        }
      } catch {
        // Ignore
      }
    }

    return docker;
  }

  private extractBuildCommands(): PrimerAnalysis['buildCommands'] {
    const commands: PrimerAnalysis['buildCommands'] = {};

    if (this.packageJson && this.packageJson.scripts) {
      const scripts = this.packageJson.scripts as Record<string, string>;
      if (scripts.build) commands.build = this.getRunCommand('build');
      if (scripts.test) commands.test = this.getRunCommand('test');
      if (scripts.lint) commands.lint = this.getRunCommand('lint');
      if (scripts.format) commands.format = this.getRunCommand('format');
      if (scripts.dev) commands.dev = this.getRunCommand('dev');
      if (scripts.start) commands.start = this.getRunCommand('start');
    }

    const packageManagers = this.detectPackageManagers();

    if (!commands.install) {
      if (packageManagers.includes('pnpm')) {
        commands.install = 'pnpm install';
      } else if (packageManagers.includes('yarn')) {
        commands.install = 'yarn install';
      } else if (packageManagers.includes('bun')) {
        commands.install = 'bun install';
      } else if (packageManagers.includes('npm')) {
        commands.install = 'npm install';
      } else if (packageManagers.includes('pip') || packageManagers.includes('poetry') || packageManagers.includes('uv')) {
        if (packageManagers.includes('poetry')) {
          commands.install = 'poetry install';
        } else if (packageManagers.includes('uv')) {
          commands.install = 'uv sync';
        } else {
          commands.install = 'pip install -r requirements.txt';
        }
      } else if (packageManagers.includes('cargo')) {
        commands.install = 'cargo build';
      } else if (packageManagers.includes('go')) {
        commands.install = 'go mod download';
      }
    }

    return commands;
  }

  private findImportantFiles(): string[] {
    const important: string[] = [];

    for (const file of IMPORTANT_CONFIG_FILES) {
      if (this.hasFile(file)) {
        important.push(file);
      }
    }

    if (this.hasFile('README.md')) {
      important.push('README.md');
    }

    if (this.hasFile('CONTRIBUTING.md')) {
      important.push('CONTRIBUTING.md');
    }

    if (this.hasFile('LICENSE') || this.hasFile('LICENSE.md')) {
      important.push(this.hasFile('LICENSE') ? 'LICENSE' : 'LICENSE.md');
    }

    return important;
  }

  private estimateCodebaseSize(): PrimerAnalysis['codebaseSize'] {
    let files = 0;
    let directories = 0;

    for (const file of this.files) {
      if (file.includes('/')) {
        directories++;
      }
      files++;
    }

    return {
      files,
      directories: Math.floor(directories / 3),
    };
  }

  private hasFile(name: string): boolean {
    if (name.includes('*')) {
      const regex = new RegExp(name.replace(/\*/g, '.*'));
      for (const file of this.files) {
        if (regex.test(file)) return true;
      }
      return false;
    }
    return this.files.has(name) || existsSync(join(this.projectPath, name));
  }

  private getDepVersion(dep: string): string | undefined {
    if (!this.packageJson) return undefined;
    const deps = this.packageJson.dependencies as Record<string, string> | undefined;
    const devDeps = this.packageJson.devDependencies as Record<string, string> | undefined;
    const version = deps?.[dep] || devDeps?.[dep];
    return version?.replace(/^[\^~>=<]+/, '');
  }

  private getRunCommand(script: string): string {
    const packageManagers = this.detectPackageManagers();
    if (packageManagers.includes('pnpm')) {
      return `pnpm ${script}`;
    } else if (packageManagers.includes('yarn')) {
      return `yarn ${script}`;
    } else if (packageManagers.includes('bun')) {
      return `bun run ${script}`;
    }
    return `npm run ${script}`;
  }

  private readConfigFile(files: string[]): unknown | null {
    for (const file of files) {
      const filePath = join(this.projectPath, file);
      if (existsSync(filePath)) {
        try {
          const content = readFileSync(filePath, 'utf-8');
          if (file.endsWith('.json')) {
            return JSON.parse(content);
          }
          return content;
        } catch {
          // Ignore
        }
      }
    }
    return null;
  }
}

export function analyzePrimer(projectPath: string): PrimerAnalysis {
  const analyzer = new PrimerAnalyzer(projectPath);
  return analyzer.analyze();
}
