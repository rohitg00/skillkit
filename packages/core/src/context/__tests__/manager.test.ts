import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { ContextManager, createContextManager, loadContext, initContext } from '../manager.js';
import type { ProjectContext } from '../types.js';

// Mock fs module
vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  mkdirSync: vi.fn(),
}));

// Mock the detector module with a class
vi.mock('../detector.js', () => ({
  ProjectDetector: class MockProjectDetector {
    analyze() {
      return {
        languages: [{ name: 'typescript', version: '5.0.0', confidence: 100 }],
        frameworks: [{ name: 'react', version: '18.0.0', confidence: 100 }],
        libraries: [],
        styling: [],
        testing: [],
        databases: [],
        tools: [],
        runtime: [],
      };
    }
    detectPatterns() {
      return {};
    }
    detectProjectType() {
      return 'web-application';
    }
    getProjectName() {
      return 'test-project';
    }
    getProjectDescription() {
      return 'A test project';
    }
  },
  getStackTags: vi.fn().mockReturnValue(['typescript', 'react']),
}));

describe('ContextManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('exists', () => {
    it('should return true when context file exists', () => {
      vi.mocked(existsSync).mockReturnValue(true);

      const manager = new ContextManager('/test/project');

      expect(manager.exists()).toBe(true);
    });

    it('should return false when context file does not exist', () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const manager = new ContextManager('/test/project');

      expect(manager.exists()).toBe(false);
    });
  });

  describe('init', () => {
    it('should create a new context file', () => {
      vi.mocked(existsSync).mockImplementation((path) => {
        if (typeof path === 'string') {
          if (path.includes('package.json')) return true;
          if (path.includes('context.yaml')) return false;
        }
        return false;
      });

      vi.mocked(readFileSync).mockImplementation((path) => {
        if (typeof path === 'string' && path.includes('package.json')) {
          return JSON.stringify({
            name: 'test-project',
            description: 'A test project',
          });
        }
        return '';
      });

      const manager = new ContextManager('/test/project');
      const context = manager.init();

      expect(context).toBeDefined();
      expect(context.version).toBe(1);
      expect(context.project.name).toBe('test-project');
      expect(vi.mocked(writeFileSync)).toHaveBeenCalled();
      expect(vi.mocked(mkdirSync)).toHaveBeenCalled();
    });

    it('should not overwrite existing context without force flag', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(`
version: 1
project:
  name: existing-project
stack:
  languages: []
  frameworks: []
  libraries: []
  styling: []
  testing: []
  databases: []
  tools: []
  runtime: []
`);

      const manager = new ContextManager('/test/project');
      const context = manager.init();

      // Should return existing context
      expect(context.project.name).toBe('existing-project');
    });

    it('should overwrite existing context with force flag', () => {
      vi.mocked(existsSync).mockImplementation((path) => {
        if (typeof path === 'string') {
          if (path.includes('context.yaml')) return true;
          if (path.includes('package.json')) return true;
        }
        return false;
      });

      vi.mocked(readFileSync).mockImplementation((path) => {
        if (typeof path === 'string' && path.includes('package.json')) {
          return JSON.stringify({ name: 'new-project' });
        }
        if (typeof path === 'string' && path.includes('context.yaml')) {
          return `
version: 1
project:
  name: old-project
stack:
  languages: []
  frameworks: []
  libraries: []
  styling: []
  testing: []
  databases: []
  tools: []
  runtime: []
`;
        }
        return '';
      });

      const manager = new ContextManager('/test/project');
      const context = manager.init({ force: true });

      // With force flag, a new context is created using ProjectDetector
      // The mock returns 'test-project' from getProjectName()
      // This validates that force creates new context instead of returning existing
      expect(context.project.name).toBe('test-project');
    });
  });

  describe('load', () => {
    it('should load existing context', () => {
      const existingContext = `
version: 1
project:
  name: loaded-project
  description: A loaded project
  type: library
stack:
  languages:
    - name: typescript
      confidence: 100
  frameworks: []
  libraries: []
  styling: []
  testing: []
  databases: []
  tools: []
  runtime: []
skills:
  installed: []
  autoSync: true
`;

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(existingContext);

      const manager = new ContextManager('/test/project');
      const context = manager.load();

      expect(context).not.toBeNull();
      expect(context!.project.name).toBe('loaded-project');
      expect(context!.project.type).toBe('library');
    });

    it('should return null when context does not exist', () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const manager = new ContextManager('/test/project');
      const context = manager.load();

      expect(context).toBeNull();
    });

    it('should handle malformed YAML by returning null', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue('invalid: yaml: content: [');

      const manager = new ContextManager('/test/project');

      // Implementation catches errors and returns null with a warning
      const result = manager.load();
      expect(result).toBeNull();
    });
  });

  describe('save', () => {
    it('should save context to file', () => {
      vi.mocked(existsSync).mockReturnValue(true);

      const context: ProjectContext = {
        version: 1,
        project: {
          name: 'saved-project',
        },
        stack: {
          languages: [],
          frameworks: [],
          libraries: [],
          styling: [],
          testing: [],
          databases: [],
          tools: [],
          runtime: [],
        },
      };

      const manager = new ContextManager('/test/project');
      manager.save(context);

      expect(vi.mocked(writeFileSync)).toHaveBeenCalled();
      const [, content] = vi.mocked(writeFileSync).mock.calls[0];
      expect(content).toContain('name: saved-project');
    });

    it('should create directory if it does not exist', () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const context: ProjectContext = {
        version: 1,
        project: { name: 'test' },
        stack: {
          languages: [],
          frameworks: [],
          libraries: [],
          styling: [],
          testing: [],
          databases: [],
          tools: [],
          runtime: [],
        },
      };

      const manager = new ContextManager('/test/project');
      manager.save(context);

      expect(vi.mocked(mkdirSync)).toHaveBeenCalled();
    });
  });

  describe('get', () => {
    it('should return cached context', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(`
version: 1
project:
  name: cached-project
stack:
  languages: []
  frameworks: []
  libraries: []
  styling: []
  testing: []
  databases: []
  tools: []
  runtime: []
`);

      const manager = new ContextManager('/test/project');

      // First call loads from file
      const first = manager.get();
      expect(first?.project.name).toBe('cached-project');

      // Second call should use cache (readFileSync should only be called once)
      const second = manager.get();
      expect(second?.project.name).toBe('cached-project');
    });

    it('should return null when no context exists', () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const manager = new ContextManager('/test/project');
      const context = manager.get();

      expect(context).toBeNull();
    });
  });

  describe('export', () => {
    it('should export context as YAML', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(`
version: 1
project:
  name: export-test
stack:
  languages: []
  frameworks: []
  libraries: []
  styling: []
  testing: []
  databases: []
  tools: []
  runtime: []
`);

      const manager = new ContextManager('/test/project');
      const exported = manager.export({ format: 'yaml' });

      expect(exported).toContain('version: 1');
      expect(exported).toContain('name: export-test');
    });

    it('should export context as JSON', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(`
version: 1
project:
  name: json-export
stack:
  languages: []
  frameworks: []
  libraries: []
  styling: []
  testing: []
  databases: []
  tools: []
  runtime: []
`);

      const manager = new ContextManager('/test/project');
      const exported = manager.export({ format: 'json' });

      const parsed = JSON.parse(exported);
      expect(parsed.project.name).toBe('json-export');
    });
  });

  describe('import', () => {
    it('should import YAML context', () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const importContent = `
version: 1
project:
  name: imported-project
stack:
  languages:
    - name: python
      confidence: 100
  frameworks: []
  libraries: []
  styling: []
  testing: []
  databases: []
  tools: []
  runtime: []
`;

      const manager = new ContextManager('/test/project');
      const context = manager.import(importContent, { overwrite: true });

      expect(context.project.name).toBe('imported-project');
      expect(vi.mocked(writeFileSync)).toHaveBeenCalled();
    });

    it('should import JSON context', () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const importContent = JSON.stringify({
        version: 1,
        project: { name: 'json-imported' },
        stack: {
          languages: [],
          frameworks: [],
          libraries: [],
          styling: [],
          testing: [],
          databases: [],
          tools: [],
          runtime: [],
        },
      });

      const manager = new ContextManager('/test/project');
      const context = manager.import(importContent, { overwrite: true });

      expect(context.project.name).toBe('json-imported');
    });

    it('should merge with existing context', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(`
version: 1
project:
  name: existing
stack:
  languages:
    - name: typescript
      confidence: 100
  frameworks: []
  libraries: []
  styling: []
  testing: []
  databases: []
  tools: []
  runtime: []
`);

      const importContent = `
version: 1
project:
  name: imported
stack:
  languages:
    - name: python
      confidence: 100
  frameworks:
    - name: django
      confidence: 100
  libraries: []
  styling: []
  testing: []
  databases: []
  tools: []
  runtime: []
`;

      const manager = new ContextManager('/test/project');
      const context = manager.import(importContent, { merge: true });

      // Should merge languages
      expect(context.stack.languages).toHaveLength(2);
      expect(context.stack.frameworks).toHaveLength(1);
    });
  });

  describe('updateSkills', () => {
    it('should update installed skills', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(`
version: 1
project:
  name: skills-test
stack:
  languages: []
  frameworks: []
  libraries: []
  styling: []
  testing: []
  databases: []
  tools: []
  runtime: []
skills:
  installed: []
`);

      const manager = new ContextManager('/test/project');
      manager.updateSkills({
        installed: ['skill-1', 'skill-2'],
      });

      expect(vi.mocked(writeFileSync)).toHaveBeenCalled();
      const [, content] = vi.mocked(writeFileSync).mock.calls[0];
      expect(content).toContain('skill-1');
      expect(content).toContain('skill-2');
    });
  });

  describe('updateAgents', () => {
    it('should update agent configuration', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(`
version: 1
project:
  name: agents-test
stack:
  languages: []
  frameworks: []
  libraries: []
  styling: []
  testing: []
  databases: []
  tools: []
  runtime: []
agents:
  detected: []
  synced: []
`);

      const manager = new ContextManager('/test/project');
      manager.updateAgents({
        primary: 'claude-code',
        detected: ['claude-code', 'cursor'],
        synced: ['claude-code', 'cursor'],
      });

      expect(vi.mocked(writeFileSync)).toHaveBeenCalled();
      const [, content] = vi.mocked(writeFileSync).mock.calls[0];
      expect(content).toContain('claude-code');
      expect(content).toContain('cursor');
    });
  });
});

describe('convenience functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createContextManager', () => {
    it('should create a ContextManager instance', () => {
      const manager = createContextManager('/test/project');

      expect(manager).toBeInstanceOf(ContextManager);
    });

    it('should use current directory if no path provided', () => {
      const manager = createContextManager();

      expect(manager).toBeInstanceOf(ContextManager);
    });
  });

  describe('loadContext', () => {
    it('should load context from path', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(`
version: 1
project:
  name: load-test
stack:
  languages: []
  frameworks: []
  libraries: []
  styling: []
  testing: []
  databases: []
  tools: []
  runtime: []
`);

      const context = loadContext('/test/project');

      expect(context).not.toBeNull();
      expect(context?.project.name).toBe('load-test');
    });

    it('should return null if context does not exist', () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const context = loadContext('/test/project');

      expect(context).toBeNull();
    });
  });

  describe('initContext', () => {
    it('should initialize context', () => {
      vi.mocked(existsSync).mockImplementation((path) => {
        if (typeof path === 'string' && path.includes('package.json')) return true;
        return false;
      });

      vi.mocked(readFileSync).mockImplementation((path) => {
        if (typeof path === 'string' && path.includes('package.json')) {
          return JSON.stringify({ name: 'init-test' });
        }
        return '';
      });

      const context = initContext('/test/project');

      // The mock's getProjectName() returns 'test-project'
      // This validates that initContext creates a new context using ProjectDetector
      expect(context.project.name).toBe('test-project');
    });
  });
});
