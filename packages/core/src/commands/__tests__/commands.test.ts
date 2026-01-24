/**
 * Commands Module Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  CommandRegistry,
  createCommandRegistry,
  CommandGenerator,
  createCommandGenerator,
  getAgentFormat,
  supportsSlashCommands,
} from '../index.js';
import type { SlashCommand, CommandContext, AgentType } from '../types.js';

describe('CommandRegistry', () => {
  let registry: CommandRegistry;

  beforeEach(() => {
    registry = createCommandRegistry({ allowOverrides: true });
  });

  describe('register', () => {
    it('should register a valid command', () => {
      const command: SlashCommand = {
        name: 'test-cmd',
        description: 'Test command',
        skill: 'test-skill',
      };

      registry.register(command);

      expect(registry.has('test-cmd')).toBe(true);
      expect(registry.size).toBe(1);
    });

    it('should register command with aliases', () => {
      const command: SlashCommand = {
        name: 'test-cmd',
        description: 'Test command',
        skill: 'test-skill',
        aliases: ['tc', 'test'],
      };

      registry.register(command);

      expect(registry.has('test-cmd')).toBe(true);
      expect(registry.has('tc')).toBe(true);
      expect(registry.has('test')).toBe(true);
    });

    it('should throw on duplicate command without override', () => {
      const strictRegistry = createCommandRegistry({ allowOverrides: false });

      const command: SlashCommand = {
        name: 'test-cmd',
        description: 'Test command',
        skill: 'test-skill',
      };

      strictRegistry.register(command);

      expect(() => strictRegistry.register(command)).toThrow('Command already registered');
    });

    it('should allow override when enabled', () => {
      const command1: SlashCommand = {
        name: 'test-cmd',
        description: 'First version',
        skill: 'test-skill',
      };

      const command2: SlashCommand = {
        name: 'test-cmd',
        description: 'Second version',
        skill: 'test-skill-2',
      };

      registry.register(command1);
      registry.register(command2);

      expect(registry.get('test-cmd')?.description).toBe('Second version');
    });

    it('should validate command on register', () => {
      const invalidCommand: SlashCommand = {
        name: '', // Invalid: empty name
        description: 'Test',
        skill: 'test',
      };

      expect(() => registry.register(invalidCommand)).toThrow('Invalid command');
    });
  });

  describe('unregister', () => {
    it('should unregister a command', () => {
      const command: SlashCommand = {
        name: 'test-cmd',
        description: 'Test command',
        skill: 'test-skill',
        aliases: ['tc'],
      };

      registry.register(command);
      expect(registry.has('test-cmd')).toBe(true);

      const result = registry.unregister('test-cmd');

      expect(result).toBe(true);
      expect(registry.has('test-cmd')).toBe(false);
      expect(registry.has('tc')).toBe(false);
    });

    it('should return false for non-existent command', () => {
      const result = registry.unregister('non-existent');
      expect(result).toBe(false);
    });
  });

  describe('get', () => {
    it('should get command by name', () => {
      const command: SlashCommand = {
        name: 'test-cmd',
        description: 'Test command',
        skill: 'test-skill',
      };

      registry.register(command);

      const result = registry.get('test-cmd');
      expect(result?.name).toBe('test-cmd');
    });

    it('should get command by alias', () => {
      const command: SlashCommand = {
        name: 'test-cmd',
        description: 'Test command',
        skill: 'test-skill',
        aliases: ['tc'],
      };

      registry.register(command);

      const result = registry.get('tc');
      expect(result?.name).toBe('test-cmd');
    });

    it('should return undefined for non-existent command', () => {
      const result = registry.get('non-existent');
      expect(result).toBeUndefined();
    });
  });

  describe('search', () => {
    beforeEach(() => {
      registry.register({
        name: 'test-one',
        description: 'First test command',
        skill: 'skill-one',
        category: 'testing',
        tags: ['test', 'one'],
      });
      registry.register({
        name: 'test-two',
        description: 'Second test command',
        skill: 'skill-two',
        category: 'testing',
        tags: ['test', 'two'],
      });
      registry.register({
        name: 'deploy',
        description: 'Deploy command',
        skill: 'deploy-skill',
        category: 'deployment',
        tags: ['deploy'],
      });
    });

    it('should search by query', () => {
      const results = registry.search({ query: 'test' });
      expect(results).toHaveLength(2);
    });

    it('should search by category', () => {
      const results = registry.search({ category: 'testing' });
      expect(results).toHaveLength(2);
    });

    it('should search by tags', () => {
      const results = registry.search({ tags: ['deploy'] });
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('deploy');
    });

    it('should limit results', () => {
      const results = registry.search({ limit: 1 });
      expect(results).toHaveLength(1);
    });
  });

  describe('enable/disable', () => {
    it('should disable a command', () => {
      registry.register({
        name: 'test-cmd',
        description: 'Test command',
        skill: 'test-skill',
      });

      registry.disable('test-cmd');

      const cmd = registry.get('test-cmd');
      expect(cmd?.enabled).toBe(false);
    });

    it('should enable a command', () => {
      registry.register({
        name: 'test-cmd',
        description: 'Test command',
        skill: 'test-skill',
      });

      registry.disable('test-cmd');
      registry.enable('test-cmd');

      const cmd = registry.get('test-cmd');
      expect(cmd?.enabled).toBe(true);
    });
  });

  describe('execute', () => {
    it('should execute command with handler', async () => {
      registry.register(
        {
          name: 'test-cmd',
          description: 'Test command',
          skill: 'test-skill',
        },
        async () => ({
          success: true,
          output: 'Executed',
        })
      );

      const context: Omit<CommandContext, 'command'> = {
        args: {},
        agent: 'claude-code' as AgentType,
        cwd: '/test',
      };

      const result = await registry.execute('test-cmd', context);

      expect(result.success).toBe(true);
      expect(result.output).toBe('Executed');
    });

    it('should return error for non-existent command', async () => {
      const result = await registry.execute('non-existent', {
        args: {},
        agent: 'claude-code' as AgentType,
        cwd: '/test',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('should return error for disabled command', async () => {
      registry.register({
        name: 'test-cmd',
        description: 'Test command',
        skill: 'test-skill',
      });
      registry.disable('test-cmd');

      const result = await registry.execute('test-cmd', {
        args: {},
        agent: 'claude-code' as AgentType,
        cwd: '/test',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('disabled');
    });
  });

  describe('validate', () => {
    it('should validate valid command', () => {
      const command: SlashCommand = {
        name: 'test-cmd',
        description: 'Test command',
        skill: 'test-skill',
        examples: ['/test-cmd'],
      };

      const result = registry.validate(command);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject command without name', () => {
      const command: SlashCommand = {
        name: '',
        description: 'Test command',
        skill: 'test-skill',
      };

      const result = registry.validate(command);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Command must have a name');
    });

    it('should reject command with invalid name format', () => {
      const command: SlashCommand = {
        name: 'INVALID_NAME',
        description: 'Test command',
        skill: 'test-skill',
      };

      const result = registry.validate(command);

      expect(result.valid).toBe(false);
    });

    it('should warn about missing examples', () => {
      const command: SlashCommand = {
        name: 'test-cmd',
        description: 'Test command',
        skill: 'test-skill',
      };

      const result = registry.validate(command);

      expect(result.warnings).toContain('Command has no usage examples');
    });
  });

  describe('export/import', () => {
    it('should export commands to bundle', () => {
      registry.register({
        name: 'test-cmd',
        description: 'Test command',
        skill: 'test-skill',
      });

      const bundle = registry.export();

      expect(bundle.version).toBe('1.0.0');
      expect(bundle.commands).toHaveLength(1);
      expect(bundle.commands[0].name).toBe('test-cmd');
    });

    it('should import commands from bundle', () => {
      const bundle = {
        version: '1.0.0',
        commands: [
          {
            name: 'imported-cmd',
            description: 'Imported command',
            skill: 'imported-skill',
          },
        ],
      };

      const imported = registry.import(bundle);

      expect(imported).toBe(1);
      expect(registry.has('imported-cmd')).toBe(true);
    });
  });

  describe('getCategories', () => {
    it('should return unique categories', () => {
      registry.register({
        name: 'cmd-one',
        description: 'Command one',
        skill: 'skill',
        category: 'testing',
      });
      registry.register({
        name: 'cmd-two',
        description: 'Command two',
        skill: 'skill',
        category: 'debugging',
      });
      registry.register({
        name: 'cmd-three',
        description: 'Command three',
        skill: 'skill',
        category: 'testing',
      });

      const categories = registry.getCategories();

      expect(categories).toHaveLength(2);
      expect(categories).toContain('testing');
      expect(categories).toContain('debugging');
    });
  });
});

describe('CommandGenerator', () => {
  let generator: CommandGenerator;

  beforeEach(() => {
    generator = createCommandGenerator();
  });

  describe('fromSkill', () => {
    it('should generate command from skill', () => {
      const skill = {
        name: 'Test Skill',
        description: 'A test skill',
        content: 'Test content',
        tags: ['test'],
      };

      const command = generator.fromSkill(skill);

      expect(command.name).toBe('test-skill');
      expect(command.description).toBe('A test skill');
      expect(command.skill).toBe('Test Skill');
    });

    it('should use custom command name', () => {
      const skill = {
        name: 'Test Skill',
        description: 'A test skill',
        content: 'Test content',
      };

      const command = generator.fromSkill(skill, 'custom-name');

      expect(command.name).toBe('custom-name');
    });
  });

  describe('generateClaudeCommand', () => {
    it('should generate Claude Code command file', () => {
      const command: SlashCommand = {
        name: 'test-cmd',
        description: 'Test command',
        skill: 'test-skill',
        aliases: ['tc'],
        examples: ['/test-cmd'],
      };

      const content = generator.generateClaudeCommand(command);

      expect(content).toContain('name: test-cmd');
      expect(content).toContain('description: Test command');
      expect(content).toContain('aliases: [tc]');
      expect(content).toContain('# /test-cmd');
    });

    it('should include args in frontmatter', () => {
      const command: SlashCommand = {
        name: 'test-cmd',
        description: 'Test command',
        skill: 'test-skill',
        args: [
          {
            name: 'file',
            description: 'File path',
            required: true,
          },
        ],
      };

      const content = generator.generateClaudeCommand(command);

      expect(content).toContain('args:');
      expect(content).toContain('name: file');
      expect(content).toContain('required: true');
    });
  });

  describe('generateCursorRules', () => {
    it('should generate Cursor rules with @-mentions', () => {
      const commands: SlashCommand[] = [
        {
          name: 'test-cmd',
          description: 'Test command',
          skill: 'test-skill',
        },
      ];

      const content = generator.generateCursorRules(commands);

      expect(content).toContain('## @test-cmd');
      expect(content).toContain('Test command');
    });
  });

  describe('generate', () => {
    const commands: SlashCommand[] = [
      {
        name: 'test-cmd',
        description: 'Test command',
        skill: 'test-skill',
      },
    ];

    it('should generate for claude-code', () => {
      const result = generator.generate(commands, 'claude-code');

      expect(result instanceof Map).toBe(true);
      expect((result as Map<string, string>).has('test-cmd.md')).toBe(true);
    });

    it('should generate for cursor', () => {
      const result = generator.generate(commands, 'cursor');

      expect(typeof result).toBe('string');
      expect((result as string)).toContain('@test-cmd');
    });

    it('should generate for opencode', () => {
      const result = generator.generate(commands, 'opencode');

      expect(result instanceof Map).toBe(true);
    });

    it('should generate for github-copilot', () => {
      const result = generator.generate(commands, 'github-copilot');

      expect(result instanceof Map).toBe(true);
    });
  });

  describe('generateManifest', () => {
    it('should generate JSON manifest', () => {
      const commands: SlashCommand[] = [
        {
          name: 'test-cmd',
          description: 'Test command',
          skill: 'test-skill',
        },
      ];

      const manifest = generator.generateManifest(commands);
      const parsed = JSON.parse(manifest);

      expect(parsed.version).toBe('1.0.0');
      expect(parsed.commands).toHaveLength(1);
      expect(parsed.generatedAt).toBeDefined();
    });
  });
});

describe('getAgentFormat', () => {
  it('should return format for claude-code', () => {
    const format = getAgentFormat('claude-code');

    expect(format.agent).toBe('claude-code');
    expect(format.directory).toBe('.claude/commands');
    expect(format.extension).toBe('.md');
    expect(format.supportsSlashCommands).toBe(true);
  });

  it('should return format for cursor', () => {
    const format = getAgentFormat('cursor');

    expect(format.agent).toBe('cursor');
    expect(format.supportsSlashCommands).toBe(false);
  });

  it('should return universal format for unknown agent', () => {
    const format = getAgentFormat('unknown' as AgentType);

    expect(format.agent).toBe('universal');
  });
});

describe('supportsSlashCommands', () => {
  it('should return true for claude-code', () => {
    expect(supportsSlashCommands('claude-code')).toBe(true);
  });

  it('should return false for cursor', () => {
    expect(supportsSlashCommands('cursor')).toBe(false);
  });

  it('should return false for windsurf', () => {
    expect(supportsSlashCommands('windsurf')).toBe(false);
  });
});
