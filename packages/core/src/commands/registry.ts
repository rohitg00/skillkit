/**
 * Command Registry
 *
 * Central registry for managing slash commands.
 */

import type {
  SlashCommand,
  RegisteredCommand,
  CommandRegistryOptions,
  CommandSearchOptions,
  CommandValidationResult,
  CommandHandler,
  CommandEvent,
  CommandEventListener,
  CommandContext,
  SlashCommandResult,
  CommandBundle,
} from './types.js';

/**
 * CommandRegistry - Central registry for slash commands
 */
export class CommandRegistry {
  private commands: Map<string, RegisteredCommand> = new Map();
  private aliases: Map<string, string> = new Map();
  private listeners: Set<CommandEventListener> = new Set();
  private options: CommandRegistryOptions;

  constructor(options?: CommandRegistryOptions) {
    this.options = {
      allowOverrides: false,
      validateOnRegister: true,
      ...options,
    };
  }

  /**
   * Register a command
   */
  register(command: SlashCommand, handler?: CommandHandler, source?: string): void {
    // Validate if enabled
    if (this.options.validateOnRegister) {
      const validation = this.validate(command);
      if (!validation.valid) {
        throw new Error(`Invalid command: ${validation.errors.join(', ')}`);
      }
    }

    // Check for existing command
    if (this.commands.has(command.name) && !this.options.allowOverrides) {
      throw new Error(`Command already registered: ${command.name}`);
    }

    // Create registered command
    const registered: RegisteredCommand = {
      ...command,
      handler: handler || this.options.defaultHandler,
      enabled: true,
      source,
    };

    // Register command
    this.commands.set(command.name, registered);

    // Register aliases
    if (command.aliases) {
      for (const alias of command.aliases) {
        this.aliases.set(alias, command.name);
      }
    }

    this.emit('command:registered', registered);
  }

  /**
   * Register multiple commands
   */
  registerAll(commands: SlashCommand[], handler?: CommandHandler, source?: string): void {
    for (const command of commands) {
      this.register(command, handler, source);
    }
  }

  /**
   * Unregister a command
   */
  unregister(name: string): boolean {
    const command = this.commands.get(name);
    if (!command) {
      return false;
    }

    // Remove aliases
    if (command.aliases) {
      for (const alias of command.aliases) {
        this.aliases.delete(alias);
      }
    }

    this.commands.delete(name);
    this.emit('command:unregistered', command);
    return true;
  }

  /**
   * Get a command by name or alias
   */
  get(name: string): RegisteredCommand | undefined {
    // Check direct name
    const command = this.commands.get(name);
    if (command) {
      return command;
    }

    // Check aliases
    const aliasTarget = this.aliases.get(name);
    if (aliasTarget) {
      return this.commands.get(aliasTarget);
    }

    return undefined;
  }

  /**
   * Check if a command exists
   */
  has(name: string): boolean {
    return this.commands.has(name) || this.aliases.has(name);
  }

  /**
   * Get all registered commands
   */
  getAll(includeDisabled = false): RegisteredCommand[] {
    const commands = Array.from(this.commands.values());
    return includeDisabled ? commands : commands.filter((c) => c.enabled);
  }

  /**
   * Search commands
   */
  search(options?: CommandSearchOptions): RegisteredCommand[] {
    let commands = this.getAll(options?.includeDisabled);

    // Filter hidden
    if (!options?.includeHidden) {
      commands = commands.filter((c) => !c.hidden);
    }

    // Filter by category
    if (options?.category) {
      commands = commands.filter((c) => c.category === options.category);
    }

    // Filter by tags
    if (options?.tags && options.tags.length > 0) {
      commands = commands.filter((c) => c.tags && options.tags!.some((t) => c.tags!.includes(t)));
    }

    // Search by query
    if (options?.query) {
      const query = options.query.toLowerCase();
      commands = commands.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.description.toLowerCase().includes(query) ||
          c.aliases?.some((a) => a.toLowerCase().includes(query))
      );
    }

    // Sort by priority
    commands.sort((a, b) => (b.priority || 0) - (a.priority || 0));

    // Limit results
    if (options?.limit) {
      commands = commands.slice(0, options.limit);
    }

    return commands;
  }

  /**
   * Enable a command
   */
  enable(name: string): boolean {
    const command = this.commands.get(name);
    if (!command) {
      return false;
    }

    command.enabled = true;
    this.emit('command:enabled', command);
    return true;
  }

  /**
   * Disable a command
   */
  disable(name: string): boolean {
    const command = this.commands.get(name);
    if (!command) {
      return false;
    }

    command.enabled = false;
    this.emit('command:disabled', command);
    return true;
  }

  /**
   * Execute a command
   */
  async execute(name: string, context: Omit<CommandContext, 'command'>): Promise<SlashCommandResult> {
    const command = this.get(name);
    if (!command) {
      return {
        success: false,
        error: `Command not found: ${name}`,
      };
    }

    if (!command.enabled) {
      return {
        success: false,
        error: `Command is disabled: ${name}`,
      };
    }

    if (!command.handler) {
      return {
        success: false,
        error: `Command has no handler: ${name}`,
      };
    }

    const startTime = Date.now();

    try {
      const result = await command.handler({
        ...context,
        command,
      });

      result.durationMs = Date.now() - startTime;
      this.emit('command:executed', command, result);
      return result;
    } catch (error) {
      const result: SlashCommandResult = {
        success: false,
        error: (error as Error).message,
        durationMs: Date.now() - startTime,
      };
      this.emit('command:failed', command, result);
      return result;
    }
  }

  /**
   * Validate a command
   */
  validate(command: SlashCommand): CommandValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Name is required
    if (!command.name || !command.name.trim()) {
      errors.push('Command must have a name');
    } else {
      // Name format validation
      if (!/^[a-z][a-z0-9-]*$/.test(command.name)) {
        errors.push('Command name must start with a letter and contain only lowercase letters, numbers, and hyphens');
      }
    }

    // Description is required
    if (!command.description || !command.description.trim()) {
      errors.push('Command must have a description');
    }

    // Skill is required
    if (!command.skill || !command.skill.trim()) {
      errors.push('Command must reference a skill');
    }

    // Validate aliases
    if (command.aliases) {
      for (const alias of command.aliases) {
        if (!/^[a-z][a-z0-9-]*$/.test(alias)) {
          errors.push(`Invalid alias format: ${alias}`);
        }
      }
    }

    // Validate args
    if (command.args) {
      const argNames = new Set<string>();
      for (const arg of command.args) {
        if (!arg.name || !arg.name.trim()) {
          errors.push('Argument must have a name');
        } else if (argNames.has(arg.name)) {
          errors.push(`Duplicate argument name: ${arg.name}`);
        } else {
          argNames.add(arg.name);
        }

        if (!arg.description || !arg.description.trim()) {
          warnings.push(`Argument ${arg.name} has no description`);
        }
      }
    }

    // Validate examples
    if (!command.examples || command.examples.length === 0) {
      warnings.push('Command has no usage examples');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Get categories
   */
  getCategories(): string[] {
    const categories = new Set<string>();
    for (const command of this.commands.values()) {
      if (command.category) {
        categories.add(command.category);
      }
    }
    return Array.from(categories).sort();
  }

  /**
   * Get commands by category
   */
  getByCategory(category: string): RegisteredCommand[] {
    return this.getAll().filter((c) => c.category === category);
  }

  /**
   * Export commands to bundle
   */
  export(includeDisabled = false): CommandBundle {
    const commands = this.getAll(includeDisabled).map((c) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { handler, enabled, source, ...command } = c;
      return command;
    });

    return {
      version: '1.0.0',
      commands,
      metadata: {
        createdAt: new Date(),
      },
    };
  }

  /**
   * Import commands from bundle
   */
  import(bundle: CommandBundle, handler?: CommandHandler, source?: string): number {
    let imported = 0;
    for (const command of bundle.commands) {
      try {
        this.register(command, handler, source);
        imported++;
      } catch {
        // Skip commands that fail to register
      }
    }
    return imported;
  }

  /**
   * Clear all commands
   */
  clear(): void {
    this.commands.clear();
    this.aliases.clear();
  }

  /**
   * Get command count
   */
  get size(): number {
    return this.commands.size;
  }

  /**
   * Add event listener
   */
  addListener(listener: CommandEventListener): void {
    this.listeners.add(listener);
  }

  /**
   * Remove event listener
   */
  removeListener(listener: CommandEventListener): void {
    this.listeners.delete(listener);
  }

  /**
   * Emit event
   */
  private emit(event: CommandEvent, command: RegisteredCommand, result?: SlashCommandResult): void {
    for (const listener of this.listeners) {
      try {
        listener(event, command, result);
      } catch {
        // Ignore listener errors
      }
    }
  }
}

/**
 * Create a CommandRegistry instance
 */
export function createCommandRegistry(options?: CommandRegistryOptions): CommandRegistry {
  return new CommandRegistry(options);
}
