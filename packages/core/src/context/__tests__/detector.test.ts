import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { ProjectDetector, analyzeProject, getStackTags } from '../detector.js';
import type { ProjectStack } from '../types.js';

// Mock the fs module
vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  readdirSync: vi.fn(),
}));

describe('ProjectDetector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('language detection', () => {
    it('should detect TypeScript from tsconfig.json', () => {
      const mockPackageJson = {
        name: 'test-project',
        devDependencies: {
          typescript: '5.0.0',
        },
      };

      vi.mocked(existsSync).mockImplementation((path) => {
        if (typeof path === 'string') {
          if (path.includes('package.json')) return true;
          if (path.includes('tsconfig.json')) return true;
        }
        return false;
      });

      vi.mocked(readFileSync).mockImplementation((path) => {
        if (typeof path === 'string' && path.includes('package.json')) {
          return JSON.stringify(mockPackageJson);
        }
        return '';
      });

      // Return files including tsconfig.json for file scanning
      vi.mocked(readdirSync).mockReturnValue([
        { name: 'package.json', isDirectory: () => false },
        { name: 'tsconfig.json', isDirectory: () => false },
      ] as any);

      const detector = new ProjectDetector('/test/project');
      const stack = detector.analyze();

      expect(stack.languages).toContainEqual(
        expect.objectContaining({
          name: 'typescript',
          confidence: 100,
        })
      );
    });

    it('should detect JavaScript when no TypeScript config', () => {
      const mockPackageJson = {
        name: 'js-project',
        dependencies: {
          lodash: '4.0.0',
        },
      };

      vi.mocked(existsSync).mockImplementation((path) => {
        if (typeof path === 'string') {
          if (path.includes('package.json')) return true;
          if (path.includes('tsconfig.json')) return false;
        }
        return false;
      });

      vi.mocked(readFileSync).mockImplementation((path) => {
        if (typeof path === 'string' && path.includes('package.json')) {
          return JSON.stringify(mockPackageJson);
        }
        return '';
      });

      vi.mocked(readdirSync).mockReturnValue([
        { name: 'package.json', isDirectory: () => false },
      ] as any);

      const detector = new ProjectDetector('/test/project');
      const stack = detector.analyze();

      expect(stack.languages).toContainEqual(
        expect.objectContaining({
          name: 'javascript',
        })
      );
    });

    it('should detect Python from pyproject.toml', () => {
      vi.mocked(existsSync).mockImplementation((path) => {
        if (typeof path === 'string') {
          if (path.includes('pyproject.toml')) return true;
        }
        return false;
      });

      vi.mocked(readFileSync).mockReturnValue('');
      vi.mocked(readdirSync).mockReturnValue([
        { name: 'pyproject.toml', isDirectory: () => false },
      ] as any);

      const detector = new ProjectDetector('/test/project');
      const stack = detector.analyze();

      expect(stack.languages).toContainEqual(
        expect.objectContaining({
          name: 'python',
          confidence: 100,
        })
      );
    });

    it('should detect Rust from Cargo.toml', () => {
      vi.mocked(existsSync).mockImplementation((path) => {
        if (typeof path === 'string') {
          if (path.includes('Cargo.toml')) return true;
        }
        return false;
      });

      vi.mocked(readFileSync).mockReturnValue('');
      vi.mocked(readdirSync).mockReturnValue([
        { name: 'Cargo.toml', isDirectory: () => false },
      ] as any);

      const detector = new ProjectDetector('/test/project');
      const stack = detector.analyze();

      expect(stack.languages).toContainEqual(
        expect.objectContaining({
          name: 'rust',
          confidence: 100,
        })
      );
    });

    it('should detect Go from go.mod', () => {
      vi.mocked(existsSync).mockImplementation((path) => {
        if (typeof path === 'string') {
          if (path.includes('go.mod')) return true;
        }
        return false;
      });

      vi.mocked(readFileSync).mockReturnValue('');
      vi.mocked(readdirSync).mockReturnValue([
        { name: 'go.mod', isDirectory: () => false },
      ] as any);

      const detector = new ProjectDetector('/test/project');
      const stack = detector.analyze();

      expect(stack.languages).toContainEqual(
        expect.objectContaining({
          name: 'go',
          confidence: 100,
        })
      );
    });

    it('should detect .NET solution, project, SDK version, frameworks, testing, and tools', () => {
      vi.mocked(existsSync).mockImplementation((path) => {
        if (typeof path !== 'string') return false;
        return [
          'global.json',
          'Directory.Build.props',
          'Directory.Packages.props',
          'MarketplaceDemo.slnx',
          'Web.csproj',
        ].some((file) => path.endsWith(file));
      });

      vi.mocked(readFileSync).mockImplementation((path) => {
        if (typeof path !== 'string') return '';
        if (path.endsWith('global.json')) {
          return JSON.stringify({ sdk: { version: '9.0.100' } });
        }
        if (path.endsWith('src/Web/Web.csproj')) {
          return `
            <Project Sdk="Microsoft.NET.Sdk.Web">
              <PropertyGroup>
                <TargetFramework>net9.0</TargetFramework>
                <UseMaui>true</UseMaui>
              </PropertyGroup>
              <ItemGroup>
                <PackageReference Include="Microsoft.AspNetCore.Components.WebAssembly" Version="9.0.0" />
                <PackageReference Include="Microsoft.Maui.Controls" Version="9.0.0" />
                <PackageReference Include="xunit" Version="2.9.2" />
                <PackageReference Include="NUnit" Version="4.2.2" />
                <PackageReference Include="MSTest.TestFramework" Version="3.6.4" />
              </ItemGroup>
            </Project>
          `;
        }
        return '<Project />';
      });

      vi.mocked(readdirSync).mockImplementation((path) => {
        if (typeof path !== 'string') return [];
        if (path === '/test/project') {
          return [
            { name: 'MarketplaceDemo.slnx', isDirectory: () => false },
            { name: 'global.json', isDirectory: () => false },
            { name: 'Directory.Build.props', isDirectory: () => false },
            { name: 'Directory.Packages.props', isDirectory: () => false },
            { name: 'src', isDirectory: () => true },
          ] as any;
        }
        if (path.endsWith('/src')) {
          return [
            { name: 'Web', isDirectory: () => true },
          ] as any;
        }
        if (path.endsWith('/src/Web')) {
          return ['Web.csproj'] as any;
        }
        return [];
      });

      const detector = new ProjectDetector('/test/project');
      const stack = detector.analyze();

      expect(stack.languages).toContainEqual(expect.objectContaining({ name: 'csharp' }));
      expect(stack.runtime).toContainEqual(
        expect.objectContaining({ name: 'dotnet', version: '9.0.100' })
      );
      expect(stack.frameworks).toContainEqual(expect.objectContaining({ name: 'aspnetcore' }));
      expect(stack.frameworks).toContainEqual(expect.objectContaining({ name: 'blazor' }));
      expect(stack.frameworks).toContainEqual(expect.objectContaining({ name: 'maui' }));
      expect(stack.testing).toContainEqual(expect.objectContaining({ name: 'xunit' }));
      expect(stack.testing).toContainEqual(expect.objectContaining({ name: 'nunit' }));
      expect(stack.testing).toContainEqual(expect.objectContaining({ name: 'mstest' }));
      expect(stack.tools).toContainEqual(expect.objectContaining({ name: 'msbuild' }));
      expect(stack.tools).toContainEqual(expect.objectContaining({ name: 'nuget' }));
    });

    it('should detect F# project files without inferring C# from generic .NET SDK', () => {
      vi.mocked(existsSync).mockImplementation((path) => {
        if (typeof path !== 'string') return false;
        return path.endsWith('Library.fsproj');
      });

      vi.mocked(readFileSync).mockReturnValue('<Project Sdk="Microsoft.NET.Sdk" />');
      vi.mocked(readdirSync).mockReturnValue([
        { name: 'Library.fsproj', isDirectory: () => false },
      ] as any);

      const detector = new ProjectDetector('/test/project');
      const stack = detector.analyze();

      expect(stack.languages).toContainEqual(expect.objectContaining({ name: 'fsharp' }));
      expect(stack.languages).not.toContainEqual(expect.objectContaining({ name: 'csharp' }));
    });

    it('should not infer C# from F# solution files', () => {
      vi.mocked(existsSync).mockImplementation((path) => {
        if (typeof path !== 'string') return false;
        return path.endsWith('App.slnx') || path.endsWith('Library.fsproj');
      });

      vi.mocked(readFileSync).mockImplementation((path) => {
        if (typeof path !== 'string') return '';
        if (path.endsWith('App.slnx')) {
          return '<Project Path="src/Library/Library.fsproj" />';
        }
        return '<Project Sdk="Microsoft.NET.Sdk" />';
      });

      vi.mocked(readdirSync).mockImplementation((path) => {
        if (typeof path !== 'string') return [];
        if (path === '/test/project') {
          return [
            { name: 'App.slnx', isDirectory: () => false },
            { name: 'src', isDirectory: () => true },
          ] as any;
        }
        if (path.endsWith('/src')) {
          return [
            { name: 'Library', isDirectory: () => true },
          ] as any;
        }
        if (path.endsWith('/src/Library')) {
          return ['Library.fsproj'] as any;
        }
        return [];
      });

      const detector = new ProjectDetector('/test/project');
      const stack = detector.analyze();

      expect(stack.languages).toContainEqual(expect.objectContaining({ name: 'fsharp' }));
      expect(stack.languages).not.toContainEqual(expect.objectContaining({ name: 'csharp' }));
    });

    it('should read nested global.json files for .NET SDK version', () => {
      vi.mocked(existsSync).mockImplementation((path) => {
        if (typeof path !== 'string') return false;
        return path.endsWith('global.json') || path.endsWith('App.csproj');
      });

      vi.mocked(readFileSync).mockImplementation((path) => {
        if (typeof path !== 'string') return '';
        if (path.endsWith('samples/dotnet/global.json')) {
          return JSON.stringify({ sdk: { version: '8.0.204' } });
        }
        return '<Project Sdk="Microsoft.NET.Sdk" />';
      });

      vi.mocked(readdirSync).mockImplementation((path) => {
        if (typeof path !== 'string') return [];
        if (path === '/test/project') {
          return [
            { name: 'samples', isDirectory: () => true },
          ] as any;
        }
        if (path.endsWith('/samples')) {
          return [
            { name: 'dotnet', isDirectory: () => true },
          ] as any;
        }
        if (path.endsWith('/samples/dotnet')) {
          return [
            { name: 'global.json', isDirectory: () => false },
            { name: 'App.csproj', isDirectory: () => false },
          ] as any;
        }
        return [];
      });

      const detector = new ProjectDetector('/test/project');
      const stack = detector.analyze();

      expect(stack.runtime).toContainEqual(
        expect.objectContaining({
          name: 'dotnet',
          version: '8.0.204',
          source: 'samples/dotnet/global.json',
        })
      );
    });
  });

  describe('framework detection', () => {
    it('should detect React from package.json', () => {
      const mockPackageJson = {
        name: 'react-project',
        dependencies: {
          react: '18.2.0',
          'react-dom': '18.2.0',
        },
      };

      vi.mocked(existsSync).mockImplementation((path) => {
        if (typeof path === 'string' && path.includes('package.json')) return true;
        return false;
      });

      vi.mocked(readFileSync).mockImplementation((path) => {
        if (typeof path === 'string' && path.includes('package.json')) {
          return JSON.stringify(mockPackageJson);
        }
        return '';
      });

      vi.mocked(readdirSync).mockReturnValue([
        { name: 'package.json', isDirectory: () => false },
      ] as any);

      const detector = new ProjectDetector('/test/project');
      const stack = detector.analyze();

      expect(stack.frameworks).toContainEqual(
        expect.objectContaining({
          name: 'react',
          version: '18.2.0',
        })
      );
    });

    it('should detect Next.js from package.json', () => {
      const mockPackageJson = {
        name: 'nextjs-project',
        dependencies: {
          next: '14.0.0',
          react: '18.2.0',
        },
      };

      vi.mocked(existsSync).mockImplementation((path) => {
        if (typeof path === 'string' && path.includes('package.json')) return true;
        return false;
      });

      vi.mocked(readFileSync).mockImplementation((path) => {
        if (typeof path === 'string' && path.includes('package.json')) {
          return JSON.stringify(mockPackageJson);
        }
        return '';
      });

      vi.mocked(readdirSync).mockReturnValue([
        { name: 'package.json', isDirectory: () => false },
      ] as any);

      const detector = new ProjectDetector('/test/project');
      const stack = detector.analyze();

      expect(stack.frameworks).toContainEqual(
        expect.objectContaining({
          name: 'nextjs',
          version: '14.0.0',
        })
      );
    });

    it('should detect Vue from package.json', () => {
      const mockPackageJson = {
        name: 'vue-project',
        dependencies: {
          vue: '3.4.0',
        },
      };

      vi.mocked(existsSync).mockImplementation((path) => {
        if (typeof path === 'string' && path.includes('package.json')) return true;
        return false;
      });

      vi.mocked(readFileSync).mockImplementation((path) => {
        if (typeof path === 'string' && path.includes('package.json')) {
          return JSON.stringify(mockPackageJson);
        }
        return '';
      });

      vi.mocked(readdirSync).mockReturnValue([
        { name: 'package.json', isDirectory: () => false },
      ] as any);

      const detector = new ProjectDetector('/test/project');
      const stack = detector.analyze();

      expect(stack.frameworks).toContainEqual(
        expect.objectContaining({
          name: 'vue',
          version: '3.4.0',
        })
      );
    });

    it('should detect Express from package.json', () => {
      const mockPackageJson = {
        name: 'express-project',
        dependencies: {
          express: '4.18.0',
        },
      };

      vi.mocked(existsSync).mockImplementation((path) => {
        if (typeof path === 'string' && path.includes('package.json')) return true;
        return false;
      });

      vi.mocked(readFileSync).mockImplementation((path) => {
        if (typeof path === 'string' && path.includes('package.json')) {
          return JSON.stringify(mockPackageJson);
        }
        return '';
      });

      vi.mocked(readdirSync).mockReturnValue([
        { name: 'package.json', isDirectory: () => false },
      ] as any);

      const detector = new ProjectDetector('/test/project');
      const stack = detector.analyze();

      expect(stack.frameworks).toContainEqual(
        expect.objectContaining({
          name: 'express',
        })
      );
    });
  });

  describe('library detection', () => {
    it('should detect state management libraries', () => {
      const mockPackageJson = {
        name: 'state-project',
        dependencies: {
          zustand: '4.0.0',
          jotai: '2.0.0',
        },
      };

      vi.mocked(existsSync).mockImplementation((path) => {
        if (typeof path === 'string' && path.includes('package.json')) return true;
        return false;
      });

      vi.mocked(readFileSync).mockImplementation((path) => {
        if (typeof path === 'string' && path.includes('package.json')) {
          return JSON.stringify(mockPackageJson);
        }
        return '';
      });

      vi.mocked(readdirSync).mockReturnValue([
        { name: 'package.json', isDirectory: () => false },
      ] as any);

      const detector = new ProjectDetector('/test/project');
      const stack = detector.analyze();

      expect(stack.libraries).toContainEqual(
        expect.objectContaining({
          name: 'zustand',
        })
      );
      expect(stack.libraries).toContainEqual(
        expect.objectContaining({
          name: 'jotai',
        })
      );
    });

    it('should detect data fetching libraries', () => {
      const mockPackageJson = {
        name: 'fetch-project',
        dependencies: {
          '@tanstack/react-query': '5.0.0',
        },
      };

      vi.mocked(existsSync).mockImplementation((path) => {
        if (typeof path === 'string' && path.includes('package.json')) return true;
        return false;
      });

      vi.mocked(readFileSync).mockImplementation((path) => {
        if (typeof path === 'string' && path.includes('package.json')) {
          return JSON.stringify(mockPackageJson);
        }
        return '';
      });

      vi.mocked(readdirSync).mockReturnValue([
        { name: 'package.json', isDirectory: () => false },
      ] as any);

      const detector = new ProjectDetector('/test/project');
      const stack = detector.analyze();

      expect(stack.libraries).toContainEqual(
        expect.objectContaining({
          name: 'tanstack',
        })
      );
    });
  });

  describe('styling detection', () => {
    it('should detect Tailwind CSS', () => {
      const mockPackageJson = {
        name: 'tailwind-project',
        devDependencies: {
          tailwindcss: '3.4.0',
        },
      };

      vi.mocked(existsSync).mockImplementation((path) => {
        if (typeof path === 'string' && path.includes('package.json')) return true;
        return false;
      });

      vi.mocked(readFileSync).mockImplementation((path) => {
        if (typeof path === 'string' && path.includes('package.json')) {
          return JSON.stringify(mockPackageJson);
        }
        return '';
      });

      vi.mocked(readdirSync).mockReturnValue([
        { name: 'package.json', isDirectory: () => false },
      ] as any);

      const detector = new ProjectDetector('/test/project');
      const stack = detector.analyze();

      expect(stack.styling).toContainEqual(
        expect.objectContaining({
          name: 'tailwindcss',
        })
      );
    });

    it('should detect styled-components', () => {
      const mockPackageJson = {
        name: 'styled-project',
        dependencies: {
          'styled-components': '6.0.0',
        },
      };

      vi.mocked(existsSync).mockImplementation((path) => {
        if (typeof path === 'string' && path.includes('package.json')) return true;
        return false;
      });

      vi.mocked(readFileSync).mockImplementation((path) => {
        if (typeof path === 'string' && path.includes('package.json')) {
          return JSON.stringify(mockPackageJson);
        }
        return '';
      });

      vi.mocked(readdirSync).mockReturnValue([
        { name: 'package.json', isDirectory: () => false },
      ] as any);

      const detector = new ProjectDetector('/test/project');
      const stack = detector.analyze();

      expect(stack.styling).toContainEqual(
        expect.objectContaining({
          name: 'styled-components',
        })
      );
    });
  });

  describe('testing detection', () => {
    it('should detect Vitest', () => {
      const mockPackageJson = {
        name: 'test-project',
        devDependencies: {
          vitest: '1.0.0',
        },
      };

      vi.mocked(existsSync).mockImplementation((path) => {
        if (typeof path === 'string' && path.includes('package.json')) return true;
        return false;
      });

      vi.mocked(readFileSync).mockImplementation((path) => {
        if (typeof path === 'string' && path.includes('package.json')) {
          return JSON.stringify(mockPackageJson);
        }
        return '';
      });

      vi.mocked(readdirSync).mockReturnValue([
        { name: 'package.json', isDirectory: () => false },
      ] as any);

      const detector = new ProjectDetector('/test/project');
      const stack = detector.analyze();

      expect(stack.testing).toContainEqual(
        expect.objectContaining({
          name: 'vitest',
        })
      );
    });

    it('should detect Playwright', () => {
      const mockPackageJson = {
        name: 'e2e-project',
        devDependencies: {
          '@playwright/test': '1.40.0',
        },
      };

      vi.mocked(existsSync).mockImplementation((path) => {
        if (typeof path === 'string' && path.includes('package.json')) return true;
        return false;
      });

      vi.mocked(readFileSync).mockImplementation((path) => {
        if (typeof path === 'string' && path.includes('package.json')) {
          return JSON.stringify(mockPackageJson);
        }
        return '';
      });

      vi.mocked(readdirSync).mockReturnValue([
        { name: 'package.json', isDirectory: () => false },
      ] as any);

      const detector = new ProjectDetector('/test/project');
      const stack = detector.analyze();

      expect(stack.testing).toContainEqual(
        expect.objectContaining({
          name: 'playwright',
        })
      );
    });
  });

  describe('database detection', () => {
    it('should detect Prisma', () => {
      const mockPackageJson = {
        name: 'db-project',
        dependencies: {
          '@prisma/client': '5.0.0',
        },
        devDependencies: {
          prisma: '5.0.0',
        },
      };

      vi.mocked(existsSync).mockImplementation((path) => {
        if (typeof path === 'string' && path.includes('package.json')) return true;
        return false;
      });

      vi.mocked(readFileSync).mockImplementation((path) => {
        if (typeof path === 'string' && path.includes('package.json')) {
          return JSON.stringify(mockPackageJson);
        }
        return '';
      });

      vi.mocked(readdirSync).mockReturnValue([
        { name: 'package.json', isDirectory: () => false },
      ] as any);

      const detector = new ProjectDetector('/test/project');
      const stack = detector.analyze();

      expect(stack.databases).toContainEqual(
        expect.objectContaining({
          name: 'prisma',
        })
      );
    });

    it('should detect Supabase', () => {
      const mockPackageJson = {
        name: 'supabase-project',
        dependencies: {
          '@supabase/supabase-js': '2.0.0',
        },
      };

      vi.mocked(existsSync).mockImplementation((path) => {
        if (typeof path === 'string' && path.includes('package.json')) return true;
        return false;
      });

      vi.mocked(readFileSync).mockImplementation((path) => {
        if (typeof path === 'string' && path.includes('package.json')) {
          return JSON.stringify(mockPackageJson);
        }
        return '';
      });

      vi.mocked(readdirSync).mockReturnValue([
        { name: 'package.json', isDirectory: () => false },
      ] as any);

      const detector = new ProjectDetector('/test/project');
      const stack = detector.analyze();

      expect(stack.databases).toContainEqual(
        expect.objectContaining({
          name: 'supabase',
        })
      );
    });
  });

  describe('tool detection', () => {
    it('should detect ESLint', () => {
      const mockPackageJson = {
        name: 'lint-project',
        devDependencies: {
          eslint: '8.0.0',
        },
      };

      vi.mocked(existsSync).mockImplementation((path) => {
        if (typeof path === 'string' && path.includes('package.json')) return true;
        return false;
      });

      vi.mocked(readFileSync).mockImplementation((path) => {
        if (typeof path === 'string' && path.includes('package.json')) {
          return JSON.stringify(mockPackageJson);
        }
        return '';
      });

      vi.mocked(readdirSync).mockReturnValue([
        { name: 'package.json', isDirectory: () => false },
      ] as any);

      const detector = new ProjectDetector('/test/project');
      const stack = detector.analyze();

      expect(stack.tools).toContainEqual(
        expect.objectContaining({
          name: 'eslint',
        })
      );
    });

    it('should detect Prettier', () => {
      const mockPackageJson = {
        name: 'format-project',
        devDependencies: {
          prettier: '3.0.0',
        },
      };

      vi.mocked(existsSync).mockImplementation((path) => {
        if (typeof path === 'string' && path.includes('package.json')) return true;
        return false;
      });

      vi.mocked(readFileSync).mockImplementation((path) => {
        if (typeof path === 'string' && path.includes('package.json')) {
          return JSON.stringify(mockPackageJson);
        }
        return '';
      });

      vi.mocked(readdirSync).mockReturnValue([
        { name: 'package.json', isDirectory: () => false },
      ] as any);

      const detector = new ProjectDetector('/test/project');
      const stack = detector.analyze();

      expect(stack.tools).toContainEqual(
        expect.objectContaining({
          name: 'prettier',
        })
      );
    });
  });

  describe('project type detection', () => {
    it('should return unknown for projects without specific dependencies', () => {
      const mockPackageJson = {
        name: 'generic-project',
        dependencies: {},
      };

      vi.mocked(existsSync).mockImplementation((path) => {
        if (typeof path === 'string' && path.includes('package.json')) return true;
        return false;
      });

      vi.mocked(readFileSync).mockImplementation((path) => {
        if (typeof path === 'string' && path.includes('package.json')) {
          return JSON.stringify(mockPackageJson);
        }
        return '';
      });

      vi.mocked(readdirSync).mockReturnValue([
        { name: 'package.json', isDirectory: () => false },
      ] as any);

      const detector = new ProjectDetector('/test/project');
      const projectType = detector.detectProjectType();

      expect(projectType).toBe('unknown');
    });

    it('should detect library from build config', () => {
      const mockPackageJson = {
        name: 'my-library',
        dependencies: {},
      };

      vi.mocked(existsSync).mockImplementation((path) => {
        if (typeof path === 'string') {
          if (path.includes('package.json')) return true;
          // hasFile('tsup.config.ts') needs this to return true
          if (path.includes('tsup.config.ts')) return true;
        }
        return false;
      });

      vi.mocked(readFileSync).mockImplementation((path) => {
        if (typeof path === 'string' && path.includes('package.json')) {
          return JSON.stringify(mockPackageJson);
        }
        return '';
      });

      vi.mocked(readdirSync).mockReturnValue([
        { name: 'package.json', isDirectory: () => false },
        { name: 'tsup.config.ts', isDirectory: () => false },
      ] as any);

      const detector = new ProjectDetector('/test/project');
      // Must call analyze() first to populate the files set
      // detectProjectType() relies on hasFile() which checks the files set
      detector.analyze();
      const projectType = detector.detectProjectType();

      expect(projectType).toBe('library');
    });
  });
});

describe('analyzeProject', () => {
  it('should return project stack', () => {
    const mockPackageJson = {
      name: 'full-project',
      dependencies: {
        react: '18.0.0',
      },
    };

    vi.mocked(existsSync).mockImplementation((path) => {
      if (typeof path === 'string' && path.includes('package.json')) return true;
      return false;
    });

    vi.mocked(readFileSync).mockImplementation((path) => {
      if (typeof path === 'string' && path.includes('package.json')) {
        return JSON.stringify(mockPackageJson);
      }
      return '';
    });

    vi.mocked(readdirSync).mockReturnValue([
      { name: 'package.json', isDirectory: () => false },
    ] as any);

    const stack = analyzeProject('/test/project');

    expect(stack).toHaveProperty('languages');
    expect(stack).toHaveProperty('frameworks');
    expect(stack).toHaveProperty('libraries');
  });
});

describe('getStackTags', () => {
  it('should generate tags from stack', () => {
    const stack: ProjectStack = {
      languages: [{ name: 'typescript', confidence: 100 }],
      frameworks: [{ name: 'react', confidence: 100 }],
      libraries: [],
      styling: [{ name: 'tailwindcss', confidence: 100 }],
      testing: [],
      databases: [],
      tools: [],
      runtime: [],
    };

    const tags = getStackTags(stack);

    expect(tags).toContain('typescript');
    expect(tags).toContain('react');
    // tailwindcss gets tags from STYLING_PATTERNS
    expect(tags.some(t => t === 'tailwind' || t === 'tailwindcss')).toBe(true);
  });
});
