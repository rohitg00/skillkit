/**
 * Plan Generator
 *
 * Generates structured plans and converts them to markdown format.
 */

import type {
  StructuredPlan,
  PlanTask,
  TaskStep,
  PlanTaskFiles,
  GenerateOptions,
  StepType,
} from './types.js';

/**
 * Task template for common patterns
 */
export interface TaskTemplate {
  name: string;
  description: string;
  steps: Array<{
    type: StepType;
    description: string;
    code?: string;
    command?: string;
  }>;
  estimatedMinutes: number;
}

/**
 * Common task templates
 */
export const TASK_TEMPLATES: Record<string, TaskTemplate> = {
  'create-component': {
    name: 'Create Component',
    description: 'Create a new React component with tests',
    steps: [
      { type: 'test', description: 'Write failing tests for the component' },
      { type: 'implement', description: 'Create the component file' },
      { type: 'implement', description: 'Implement the component logic' },
      { type: 'verify', description: 'Run tests to verify implementation', command: 'npm test' },
      { type: 'commit', description: 'Commit the changes' },
    ],
    estimatedMinutes: 5,
  },
  'add-api-endpoint': {
    name: 'Add API Endpoint',
    description: 'Create a new API endpoint with validation and tests',
    steps: [
      { type: 'test', description: 'Write API tests for the endpoint' },
      { type: 'implement', description: 'Define the route and handler' },
      { type: 'implement', description: 'Add input validation' },
      { type: 'implement', description: 'Implement the business logic' },
      { type: 'verify', description: 'Run tests', command: 'npm test' },
      { type: 'commit', description: 'Commit the endpoint' },
    ],
    estimatedMinutes: 5,
  },
  'fix-bug': {
    name: 'Fix Bug',
    description: 'Fix a bug with a regression test',
    steps: [
      { type: 'test', description: 'Write a failing test that reproduces the bug' },
      { type: 'implement', description: 'Fix the bug' },
      { type: 'verify', description: 'Verify the test passes', command: 'npm test' },
      { type: 'commit', description: 'Commit the fix' },
    ],
    estimatedMinutes: 3,
  },
  'add-feature': {
    name: 'Add Feature',
    description: 'Add a new feature with TDD',
    steps: [
      { type: 'test', description: 'Write failing tests for the feature' },
      { type: 'implement', description: 'Implement the feature' },
      { type: 'verify', description: 'Run tests', command: 'npm test' },
      { type: 'review', description: 'Review the implementation' },
      { type: 'commit', description: 'Commit the feature' },
    ],
    estimatedMinutes: 5,
  },
  'refactor': {
    name: 'Refactor',
    description: 'Refactor code while maintaining behavior',
    steps: [
      { type: 'verify', description: 'Ensure all tests pass before refactoring', command: 'npm test' },
      { type: 'implement', description: 'Apply the refactoring' },
      { type: 'verify', description: 'Verify tests still pass', command: 'npm test' },
      { type: 'commit', description: 'Commit the refactoring' },
    ],
    estimatedMinutes: 4,
  },
};

/**
 * PlanGenerator - Generate and format structured plans
 */
export class PlanGenerator {
  private options: GenerateOptions;

  constructor(options?: GenerateOptions) {
    this.options = {
      targetTaskMinutes: 5,
      includeTests: true,
      includeCommits: true,
      ...options,
    };
  }

  /**
   * Create a new empty plan
   */
  createPlan(name: string, goal: string): StructuredPlan {
    return {
      name,
      goal,
      tasks: [],
      status: 'draft',
      createdAt: new Date(),
      author: this.options.author,
      techStack: this.options.techStack,
    };
  }

  /**
   * Add a task to a plan
   */
  addTask(
    plan: StructuredPlan,
    name: string,
    options?: {
      description?: string;
      files?: PlanTaskFiles;
      steps?: Partial<TaskStep>[];
      estimatedMinutes?: number;
      dependencies?: number[];
      tags?: string[];
      priority?: number;
    }
  ): PlanTask {
    const id = plan.tasks.length > 0 ? Math.max(...plan.tasks.map((t) => t.id)) + 1 : 1;

    const task: PlanTask = {
      id,
      name,
      description: options?.description,
      files: options?.files || {},
      steps: (options?.steps || []).map((s, i) => ({
        number: i + 1,
        description: s.description || '',
        type: s.type || 'implement',
        code: s.code,
        language: s.language,
        command: s.command,
        expectedOutput: s.expectedOutput,
        critical: s.critical,
      })),
      estimatedMinutes: options?.estimatedMinutes || this.options.targetTaskMinutes,
      dependencies: options?.dependencies,
      tags: options?.tags,
      priority: options?.priority,
      status: 'pending',
    };

    // Add test step if required and not present
    if (this.options.includeTests && !task.steps.some((s) => s.type === 'test')) {
      task.steps.unshift({
        number: 0,
        description: 'Write tests for the implementation',
        type: 'test',
      });
      // Renumber steps
      task.steps.forEach((s, i) => (s.number = i + 1));
    }

    // Add commit step if required and not present
    if (this.options.includeCommits && !task.steps.some((s) => s.type === 'commit')) {
      task.steps.push({
        number: task.steps.length + 1,
        description: 'Commit changes',
        type: 'commit',
      });
    }

    plan.tasks.push(task);
    plan.updatedAt = new Date();

    return task;
  }

  /**
   * Add a task from a template
   */
  addTaskFromTemplate(
    plan: StructuredPlan,
    templateName: keyof typeof TASK_TEMPLATES | string,
    customization?: {
      name?: string;
      description?: string;
      files?: PlanTaskFiles;
      dependencies?: number[];
      tags?: string[];
    }
  ): PlanTask | undefined {
    const template = TASK_TEMPLATES[templateName];
    if (!template) return undefined;

    return this.addTask(plan, customization?.name || template.name, {
      description: customization?.description || template.description,
      files: customization?.files,
      steps: template.steps,
      estimatedMinutes: template.estimatedMinutes,
      dependencies: customization?.dependencies,
      tags: customization?.tags,
    });
  }

  /**
   * Generate markdown from a structured plan
   */
  toMarkdown(plan: StructuredPlan): string {
    const lines: string[] = [];

    // Title
    lines.push(`# ${plan.name}`);
    lines.push('');

    // Metadata
    if (plan.version) {
      lines.push(`Version: ${plan.version}`);
    }
    if (plan.author) {
      lines.push(`Author: ${plan.author}`);
    }
    if (plan.designDoc) {
      lines.push(`Design Doc: ${plan.designDoc}`);
    }
    if (plan.version || plan.author || plan.designDoc) {
      lines.push('');
    }

    // Goal
    lines.push('## Goal');
    lines.push('');
    lines.push(plan.goal);
    lines.push('');

    // Architecture
    if (plan.architecture) {
      lines.push('## Architecture');
      lines.push('');
      lines.push(plan.architecture);
      lines.push('');
    }

    // Tech Stack
    if (plan.techStack && plan.techStack.length > 0) {
      lines.push('## Tech Stack');
      lines.push('');
      for (const tech of plan.techStack) {
        lines.push(`- ${tech}`);
      }
      lines.push('');
    }

    // Tasks
    lines.push('## Tasks');
    lines.push('');

    for (const task of plan.tasks) {
      lines.push(`### Task ${task.id}: ${task.name}`);
      lines.push('');

      if (task.description) {
        lines.push(task.description);
        lines.push('');
      }

      // Files
      const hasFiles =
        (task.files.create && task.files.create.length > 0) ||
        (task.files.modify && task.files.modify.length > 0) ||
        (task.files.test && task.files.test.length > 0) ||
        (task.files.delete && task.files.delete.length > 0);

      if (hasFiles) {
        lines.push('**Files:**');
        if (task.files.create && task.files.create.length > 0) {
          lines.push(`- Create: ${task.files.create.map((f) => `\`${f}\``).join(', ')}`);
        }
        if (task.files.modify && task.files.modify.length > 0) {
          lines.push(`- Modify: ${task.files.modify.map((f) => `\`${f}\``).join(', ')}`);
        }
        if (task.files.test && task.files.test.length > 0) {
          lines.push(`- Test: ${task.files.test.map((f) => `\`${f}\``).join(', ')}`);
        }
        if (task.files.delete && task.files.delete.length > 0) {
          lines.push(`- Delete: ${task.files.delete.map((f) => `\`${f}\``).join(', ')}`);
        }
        lines.push('');
      }

      // Metadata
      if (task.estimatedMinutes) {
        lines.push(`Estimated: ${task.estimatedMinutes} minutes`);
      }
      if (task.dependencies && task.dependencies.length > 0) {
        lines.push(`Depends on: ${task.dependencies.map((d) => `Task ${d}`).join(', ')}`);
      }
      if (task.tags && task.tags.length > 0) {
        lines.push(`Tags: ${task.tags.join(', ')}`);
      }
      if (task.priority !== undefined) {
        lines.push(`Priority: ${task.priority}`);
      }
      if (task.estimatedMinutes || task.dependencies?.length || task.tags?.length || task.priority !== undefined) {
        lines.push('');
      }

      // Steps
      lines.push('**Steps:**');
      lines.push('');

      for (const step of task.steps) {
        const typeLabel = step.type !== 'implement' ? ` [${step.type}]` : '';
        lines.push(`${step.number}. ${step.description}${typeLabel}`);

        if (step.command) {
          lines.push(`   - Run: \`${step.command}\``);
        }
        if (step.expectedOutput) {
          lines.push(`   - Expect: ${step.expectedOutput}`);
        }
        if (step.critical) {
          lines.push(`   - Critical: Yes`);
        }

        if (step.code) {
          lines.push('');
          lines.push(`   \`\`\`${step.language || ''}`);
          for (const codeLine of step.code.split('\n')) {
            lines.push(`   ${codeLine}`);
          }
          lines.push('   ```');
        }
      }

      lines.push('');
    }

    // Summary
    const totalMinutes = plan.tasks.reduce((sum, t) => sum + (t.estimatedMinutes || 3), 0);
    lines.push('---');
    lines.push('');
    lines.push(`**Summary:** ${plan.tasks.length} tasks, ~${totalMinutes} minutes estimated`);
    lines.push(`**Created:** ${plan.createdAt.toISOString().split('T')[0]}`);
    if (plan.updatedAt) {
      lines.push(`**Updated:** ${plan.updatedAt.toISOString().split('T')[0]}`);
    }

    return lines.join('\n');
  }

  /**
   * Generate a plan from a simple task list
   */
  fromTaskList(
    name: string,
    goal: string,
    taskNames: string[],
    options?: {
      architecture?: string;
      techStack?: string[];
      template?: keyof typeof TASK_TEMPLATES;
    }
  ): StructuredPlan {
    const plan = this.createPlan(name, goal);

    if (options?.architecture) {
      plan.architecture = options.architecture;
    }
    if (options?.techStack) {
      plan.techStack = options.techStack;
    }

    for (let i = 0; i < taskNames.length; i++) {
      const taskName = taskNames[i];

      if (options?.template) {
        this.addTaskFromTemplate(plan, options.template, {
          name: taskName,
          dependencies: i > 0 ? [i] : undefined,
        });
      } else {
        this.addTask(plan, taskName, {
          dependencies: i > 0 ? [i] : undefined,
        });
      }
    }

    return plan;
  }

  /**
   * Clone a plan
   */
  clonePlan(plan: StructuredPlan, newName?: string): StructuredPlan {
    return {
      ...plan,
      name: newName || `${plan.name} (copy)`,
      tasks: plan.tasks.map((t) => ({
        ...t,
        steps: [...t.steps],
        files: { ...t.files },
        dependencies: t.dependencies ? [...t.dependencies] : undefined,
        tags: t.tags ? [...t.tags] : undefined,
        status: 'pending',
        result: undefined,
      })),
      status: 'draft',
      createdAt: new Date(),
      updatedAt: undefined,
    };
  }

  /**
   * Merge two plans
   */
  mergePlans(plan1: StructuredPlan, plan2: StructuredPlan, newName?: string): StructuredPlan {
    const merged = this.clonePlan(plan1, newName || `${plan1.name} + ${plan2.name}`);

    // Offset task IDs from plan2
    const maxId = Math.max(...merged.tasks.map((t) => t.id), 0);

    for (const task of plan2.tasks) {
      const newTask: PlanTask = {
        ...task,
        id: task.id + maxId,
        steps: [...task.steps],
        files: { ...task.files },
        dependencies: task.dependencies?.map((d) => d + maxId),
        tags: task.tags ? [...task.tags] : undefined,
        status: 'pending',
        result: undefined,
      };
      merged.tasks.push(newTask);
    }

    // Merge tech stacks
    if (plan2.techStack) {
      merged.techStack = [...(merged.techStack || []), ...plan2.techStack.filter((t) => !(merged.techStack || []).includes(t))];
    }

    merged.goal = `${merged.goal}\n\n${plan2.goal}`;
    merged.updatedAt = new Date();

    return merged;
  }
}

/**
 * Create a PlanGenerator instance
 */
export function createPlanGenerator(options?: GenerateOptions): PlanGenerator {
  return new PlanGenerator(options);
}
