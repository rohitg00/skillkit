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
