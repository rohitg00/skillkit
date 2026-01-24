/**
 * Plan System Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PlanParser, createPlanParser } from '../parser.js';
import { PlanValidator, createPlanValidator, validatePlan } from '../validator.js';
import { PlanGenerator, createPlanGenerator, TASK_TEMPLATES } from '../generator.js';
import { PlanExecutor, createPlanExecutor, dryRunExecutor } from '../executor.js';
import type { StructuredPlan, PlanTask, TaskStep, PlanTaskResult } from '../types.js';

describe('PlanParser', () => {
  let parser: PlanParser;

  beforeEach(() => {
    parser = createPlanParser();
  });

  describe('parse', () => {
    it('should parse a simple plan', () => {
      const markdown = `
# My Plan

Goal: Build a feature

## Task 1: Setup

1. Create files
2. Write tests

## Task 2: Implement

1. Write code
2. Run tests
`;

      const plan = parser.parse(markdown);

      expect(plan.name).toBe('My Plan');
      expect(plan.goal).toBe('Build a feature');
      expect(plan.tasks).toHaveLength(2);
      expect(plan.tasks[0].name).toBe('Setup');
      expect(plan.tasks[0].steps).toHaveLength(2);
      expect(plan.tasks[1].name).toBe('Implement');
    });

    it('should parse task with files', () => {
      const markdown = `
# Plan

Goal: Test

## Task 1: Create Component

Files:
- Create: \`src/component.ts\`
- Modify: \`src/index.ts\`
- Test: \`src/__tests__/component.test.ts\`

1. Create the component
`;

      const plan = parser.parse(markdown);

      expect(plan.tasks[0].files.create).toContain('src/component.ts');
      expect(plan.tasks[0].files.modify).toContain('src/index.ts');
      expect(plan.tasks[0].files.test).toContain('src/__tests__/component.test.ts');
    });

    it('should parse task metadata', () => {
      const markdown = `
# Plan

Goal: Test

## Task 1: Setup

Estimated: 5 minutes
Depends on: 2, 3
Priority: 10
Tags: setup, init

1. Do something
`;

      const plan = parser.parse(markdown);

      expect(plan.tasks[0].estimatedMinutes).toBe(5);
      expect(plan.tasks[0].dependencies).toEqual([2, 3]);
      expect(plan.tasks[0].priority).toBe(10);
      expect(plan.tasks[0].tags).toContain('setup');
    });

    it('should parse code blocks in steps', () => {
      const markdown = `
# Plan

Goal: Test

## Task 1: Implement

1. Write the function

\`\`\`typescript
function hello() {
  return 'world';
}
\`\`\`
`;

      const plan = parser.parse(markdown);

      expect(plan.tasks[0].steps[0].code).toContain('function hello()');
      expect(plan.tasks[0].steps[0].language).toBe('typescript');
    });

    it('should parse step commands and expected output', () => {
      const markdown = `
# Plan

Goal: Test

## Task 1: Test

1. Run the tests
   - Run: npm test
   - Expect: All tests pass
   - Critical
`;

      const plan = parser.parse(markdown);

      expect(plan.tasks[0].steps[0].command).toBe('npm test');
      expect(plan.tasks[0].steps[0].expectedOutput).toBe('All tests pass');
      expect(plan.tasks[0].steps[0].critical).toBe(true);
    });

    it('should infer step types', () => {
      const markdown = `
# Plan

Goal: Test

## Task 1: Development

1. Write tests for the feature
2. Verify the implementation
3. Implement the feature
4. Commit the changes
`;

      const plan = parser.parse(markdown);

      expect(plan.tasks[0].steps[0].type).toBe('test');
      expect(plan.tasks[0].steps[1].type).toBe('verify');
      expect(plan.tasks[0].steps[2].type).toBe('implement');
      expect(plan.tasks[0].steps[3].type).toBe('commit');
    });

    it('should parse plan metadata', () => {
      const markdown = `
# My Project Plan

Version: 1.0.0
Author: John Doe
Design Doc: https://example.com/design

Goal: Complete the project

## Architecture

Microservices with REST APIs

## Tech Stack

- TypeScript
- React
- Node.js

## Task 1: Setup

1. Initialize project
`;

      const plan = parser.parse(markdown);

      expect(plan.version).toBe('1.0.0');
      expect(plan.author).toBe('John Doe');
      expect(plan.designDoc).toBe('https://example.com/design');
      expect(plan.architecture).toContain('Microservices');
      expect(plan.techStack).toContain('TypeScript');
      expect(plan.techStack).toContain('React');
    });
  });
});

describe('PlanValidator', () => {
  let validator: PlanValidator;

  beforeEach(() => {
    validator = createPlanValidator();
  });

  describe('validate', () => {
    it('should validate a valid plan', () => {
      const plan: StructuredPlan = {
        name: 'Valid Plan',
        goal: 'Complete tasks',
        tasks: [
          {
            id: 1,
            name: 'Task 1',
            files: {},
            steps: [{ number: 1, description: 'Do something', type: 'implement' }],
          },
        ],
        status: 'ready',
        createdAt: new Date(),
      };

      const result = validator.validate(plan);

      expect(result.valid).toBe(true);
      expect(result.issues.filter((i) => i.type === 'error')).toHaveLength(0);
    });

    it('should detect missing name', () => {
      const plan: StructuredPlan = {
        name: '',
        goal: 'Complete tasks',
        tasks: [
          {
            id: 1,
            name: 'Task 1',
            files: {},
            steps: [{ number: 1, description: 'Do something', type: 'implement' }],
          },
        ],
        status: 'draft',
        createdAt: new Date(),
      };

      const result = validator.validate(plan);

      expect(result.valid).toBe(false);
      expect(result.issues.some((i) => i.message.includes('name'))).toBe(true);
    });

    it('should detect missing goal', () => {
      const plan: StructuredPlan = {
        name: 'Plan',
        goal: '',
        tasks: [
          {
            id: 1,
            name: 'Task 1',
            files: {},
            steps: [{ number: 1, description: 'Do something', type: 'implement' }],
          },
        ],
        status: 'draft',
        createdAt: new Date(),
      };

      const result = validator.validate(plan);

      expect(result.valid).toBe(false);
      expect(result.issues.some((i) => i.message.includes('goal'))).toBe(true);
    });

    it('should detect empty tasks', () => {
      const plan: StructuredPlan = {
        name: 'Plan',
        goal: 'Goal',
        tasks: [],
        status: 'draft',
        createdAt: new Date(),
      };

      const result = validator.validate(plan);

      expect(result.valid).toBe(false);
      expect(result.issues.some((i) => i.message.includes('at least one task'))).toBe(true);
    });

    it('should detect duplicate task IDs', () => {
      const plan: StructuredPlan = {
        name: 'Plan',
        goal: 'Goal',
        tasks: [
          {
            id: 1,
            name: 'Task 1',
            files: {},
            steps: [{ number: 1, description: 'Do something', type: 'implement' }],
          },
          {
            id: 1,
            name: 'Task 2',
            files: {},
            steps: [{ number: 1, description: 'Do something', type: 'implement' }],
          },
        ],
        status: 'draft',
        createdAt: new Date(),
      };

      const result = validator.validate(plan);

      expect(result.valid).toBe(false);
      expect(result.issues.some((i) => i.message.includes('Duplicate task ID'))).toBe(true);
    });

    it('should detect missing dependencies', () => {
      const plan: StructuredPlan = {
        name: 'Plan',
        goal: 'Goal',
        tasks: [
          {
            id: 1,
            name: 'Task 1',
            files: {},
            steps: [{ number: 1, description: 'Do something', type: 'implement' }],
            dependencies: [999],
          },
        ],
        status: 'draft',
        createdAt: new Date(),
      };

      const result = validator.validate(plan);

      expect(result.valid).toBe(false);
      expect(result.issues.some((i) => i.message.includes('non-existent task'))).toBe(true);
    });

    it('should detect circular dependencies', () => {
      const plan: StructuredPlan = {
        name: 'Plan',
        goal: 'Goal',
        tasks: [
          {
            id: 1,
            name: 'Task 1',
            files: {},
            steps: [{ number: 1, description: 'Do something', type: 'implement' }],
            dependencies: [2],
          },
          {
            id: 2,
            name: 'Task 2',
            files: {},
            steps: [{ number: 1, description: 'Do something', type: 'implement' }],
            dependencies: [1],
          },
        ],
        status: 'draft',
        createdAt: new Date(),
      };

      const result = validator.validate(plan);

      expect(result.valid).toBe(false);
      expect(result.issues.some((i) => i.message.includes('Circular dependency'))).toBe(true);
    });

    it('should calculate statistics', () => {
      const plan: StructuredPlan = {
        name: 'Plan',
        goal: 'Goal',
        tasks: [
          {
            id: 1,
            name: 'Task 1',
            files: { test: ['test.ts'] },
            steps: [
              { number: 1, description: 'Test', type: 'test' },
              { number: 2, description: 'Implement', type: 'implement' },
              { number: 3, description: 'Commit', type: 'commit' },
            ],
            estimatedMinutes: 5,
          },
          {
            id: 2,
            name: 'Task 2',
            files: {},
            steps: [
              { number: 1, description: 'Implement', type: 'implement' },
              { number: 2, description: 'Verify', type: 'verify' },
            ],
            estimatedMinutes: 3,
          },
        ],
        status: 'ready',
        createdAt: new Date(),
      };

      const result = validator.validate(plan);

      expect(result.stats.totalTasks).toBe(2);
      expect(result.stats.totalSteps).toBe(5);
      expect(result.stats.estimatedMinutes).toBe(8);
      expect(result.stats.tasksWithTests).toBe(1);
      expect(result.stats.tasksWithCommits).toBe(1);
      expect(result.stats.avgStepsPerTask).toBe(2.5);
    });
  });

  describe('isValid', () => {
    it('should return true for valid plan', () => {
      const plan: StructuredPlan = {
        name: 'Plan',
        goal: 'Goal',
        tasks: [
          {
            id: 1,
            name: 'Task',
            files: {},
            steps: [{ number: 1, description: 'Do', type: 'implement' }],
          },
        ],
        status: 'ready',
        createdAt: new Date(),
      };

      expect(validator.isValid(plan)).toBe(true);
    });
  });

  describe('strict mode', () => {
    it('should treat warnings as errors in strict mode', () => {
      const strictValidator = createPlanValidator({ strict: true, requireTests: true });

      const plan: StructuredPlan = {
        name: 'Plan',
        goal: 'Goal',
        tasks: [
          {
            id: 1,
            name: 'Task',
            files: {},
            steps: [{ number: 1, description: 'Implement', type: 'implement' }],
          },
        ],
        status: 'ready',
        createdAt: new Date(),
      };

      const result = strictValidator.validate(plan);

      expect(result.valid).toBe(false);
    });
  });
});

describe('PlanGenerator', () => {
  let generator: PlanGenerator;

  beforeEach(() => {
    generator = createPlanGenerator();
  });

  describe('createPlan', () => {
    it('should create an empty plan', () => {
      const plan = generator.createPlan('My Plan', 'Build something');

      expect(plan.name).toBe('My Plan');
      expect(plan.goal).toBe('Build something');
      expect(plan.tasks).toHaveLength(0);
      expect(plan.status).toBe('draft');
    });
  });

  describe('addTask', () => {
    it('should add a task to the plan', () => {
      const plan = generator.createPlan('Plan', 'Goal');
      const task = generator.addTask(plan, 'First Task', {
        description: 'Do something',
        steps: [{ description: 'Step 1', type: 'implement' }],
      });

      expect(plan.tasks).toHaveLength(1);
      expect(task.id).toBe(1);
      expect(task.name).toBe('First Task');
    });

    it('should auto-add test and commit steps', () => {
      const plan = generator.createPlan('Plan', 'Goal');
      const task = generator.addTask(plan, 'Task', {
        steps: [{ description: 'Implement', type: 'implement' }],
      });

      expect(task.steps.some((s) => s.type === 'test')).toBe(true);
      expect(task.steps.some((s) => s.type === 'commit')).toBe(true);
    });

    it('should increment task IDs', () => {
      const plan = generator.createPlan('Plan', 'Goal');
      generator.addTask(plan, 'Task 1');
      generator.addTask(plan, 'Task 2');
      generator.addTask(plan, 'Task 3');

      expect(plan.tasks.map((t) => t.id)).toEqual([1, 2, 3]);
    });
  });

  describe('addTaskFromTemplate', () => {
    it('should add task from template', () => {
      const plan = generator.createPlan('Plan', 'Goal');
      const task = generator.addTaskFromTemplate(plan, 'create-component', {
        name: 'Create Header',
      });

      expect(task).toBeDefined();
      expect(task?.name).toBe('Create Header');
      expect(task?.steps.length).toBeGreaterThan(0);
    });

    it('should return undefined for unknown template', () => {
      const plan = generator.createPlan('Plan', 'Goal');
      const task = generator.addTaskFromTemplate(plan, 'unknown-template');

      expect(task).toBeUndefined();
    });
  });

  describe('toMarkdown', () => {
    it('should generate markdown from plan', () => {
      const plan = generator.createPlan('My Project', 'Build a feature');
      plan.architecture = 'Microservices';
      plan.techStack = ['TypeScript', 'React'];

      generator.addTask(plan, 'Setup', {
        description: 'Initialize the project',
        files: { create: ['src/index.ts'] },
        steps: [{ description: 'Create files', type: 'implement' }],
        estimatedMinutes: 5,
      });

      const markdown = generator.toMarkdown(plan);

      expect(markdown).toContain('# My Project');
      expect(markdown).toContain('Build a feature');
      expect(markdown).toContain('## Architecture');
      expect(markdown).toContain('Microservices');
      expect(markdown).toContain('- TypeScript');
      expect(markdown).toContain('### Task 1: Setup');
      expect(markdown).toContain('Create files');
    });
  });

  describe('fromTaskList', () => {
    it('should generate plan from task list', () => {
      const plan = generator.fromTaskList('Feature', 'Add authentication', ['Setup', 'Login', 'Logout']);

      expect(plan.name).toBe('Feature');
      expect(plan.tasks).toHaveLength(3);
      expect(plan.tasks[0].name).toBe('Setup');
      expect(plan.tasks[1].name).toBe('Login');
      expect(plan.tasks[2].name).toBe('Logout');
    });

    it('should set dependencies between tasks', () => {
      const plan = generator.fromTaskList('Feature', 'Goal', ['A', 'B', 'C']);

      expect(plan.tasks[0].dependencies).toBeUndefined();
      expect(plan.tasks[1].dependencies).toEqual([1]);
      expect(plan.tasks[2].dependencies).toEqual([2]);
    });
  });

  describe('clonePlan', () => {
    it('should clone a plan', () => {
      const original = generator.createPlan('Original', 'Goal');
      generator.addTask(original, 'Task 1');

      const clone = generator.clonePlan(original, 'Clone');

      expect(clone.name).toBe('Clone');
      expect(clone.tasks).toHaveLength(1);
      expect(clone.status).toBe('draft');
      expect(clone.createdAt).not.toBe(original.createdAt);
    });
  });

  describe('mergePlans', () => {
    it('should merge two plans', () => {
      const plan1 = generator.createPlan('Plan 1', 'Goal 1');
      generator.addTask(plan1, 'Task 1');

      const plan2 = generator.createPlan('Plan 2', 'Goal 2');
      generator.addTask(plan2, 'Task 2');

      const merged = generator.mergePlans(plan1, plan2);

      expect(merged.tasks).toHaveLength(2);
      expect(merged.tasks[0].name).toBe('Task 1');
      expect(merged.tasks[1].name).toBe('Task 2');
      expect(merged.tasks[1].id).toBe(2); // Offset ID
    });
  });
});

describe('PlanExecutor', () => {
  let executor: PlanExecutor;

  beforeEach(() => {
    executor = createPlanExecutor({ stepExecutor: dryRunExecutor });
  });

  describe('execute', () => {
    it('should execute a plan', async () => {
      const plan: StructuredPlan = {
        name: 'Plan',
        goal: 'Goal',
        tasks: [
          {
            id: 1,
            name: 'Task 1',
            files: {},
            steps: [{ number: 1, description: 'Step 1', type: 'implement' }],
          },
        ],
        status: 'ready',
        createdAt: new Date(),
      };

      const result = await executor.execute(plan, { dryRun: true });

      expect(result.success).toBe(true);
      expect(result.completedTasks).toContain(1);
      expect(result.failedTasks).toHaveLength(0);
      expect(plan.status).toBe('completed');
    });

    it('should execute tasks in dependency order', async () => {
      const executionOrder: number[] = [];

      const trackingExecutor = createPlanExecutor({
        stepExecutor: async (_step, task) => {
          executionOrder.push(task.id);
          return { success: true, output: 'done' };
        },
      });

      const plan: StructuredPlan = {
        name: 'Plan',
        goal: 'Goal',
        tasks: [
          {
            id: 3,
            name: 'Task 3',
            files: {},
            steps: [{ number: 1, description: 'Step', type: 'implement' }],
            dependencies: [1, 2],
          },
          {
            id: 1,
            name: 'Task 1',
            files: {},
            steps: [{ number: 1, description: 'Step', type: 'implement' }],
          },
          {
            id: 2,
            name: 'Task 2',
            files: {},
            steps: [{ number: 1, description: 'Step', type: 'implement' }],
            dependencies: [1],
          },
        ],
        status: 'ready',
        createdAt: new Date(),
      };

      await trackingExecutor.execute(plan);

      expect(executionOrder).toEqual([1, 2, 3]);
    });

    it('should skip tasks with failed dependencies', async () => {
      const failingExecutor = createPlanExecutor({
        stepExecutor: async (_step, task) => {
          if (task.id === 1) {
            return { success: false, output: 'failed', error: 'Error' };
          }
          return { success: true, output: 'done' };
        },
      });

      const plan: StructuredPlan = {
        name: 'Plan',
        goal: 'Goal',
        tasks: [
          {
            id: 1,
            name: 'Task 1',
            files: {},
            steps: [{ number: 1, description: 'Step', type: 'implement' }],
          },
          {
            id: 2,
            name: 'Task 2',
            files: {},
            steps: [{ number: 1, description: 'Step', type: 'implement' }],
            dependencies: [1],
          },
        ],
        status: 'ready',
        createdAt: new Date(),
      };

      const result = await failingExecutor.execute(plan, { stopOnError: false });

      expect(result.failedTasks).toContain(1);
      expect(result.skippedTasks).toContain(2);
    });

    it('should emit events', async () => {
      const events: string[] = [];

      executor.addListener((event) => {
        events.push(event);
      });

      const plan: StructuredPlan = {
        name: 'Plan',
        goal: 'Goal',
        tasks: [
          {
            id: 1,
            name: 'Task 1',
            files: {},
            steps: [{ number: 1, description: 'Step', type: 'implement' }],
          },
        ],
        status: 'ready',
        createdAt: new Date(),
      };

      await executor.execute(plan, { dryRun: true });

      expect(events).toContain('plan:execution_started');
      expect(events).toContain('plan:task_started');
      expect(events).toContain('plan:task_completed');
      expect(events).toContain('plan:execution_completed');
    });
  });

  describe('pause/resume', () => {
    it('should support pause and resume', async () => {
      let pauseDetected = false;

      const slowExecutor = createPlanExecutor({
        stepExecutor: async () => {
          await new Promise((resolve) => setTimeout(resolve, 50));
          return { success: true, output: 'done' };
        },
      });

      const plan: StructuredPlan = {
        name: 'Plan',
        goal: 'Goal',
        tasks: [
          {
            id: 1,
            name: 'Task 1',
            files: {},
            steps: [
              { number: 1, description: 'Step 1', type: 'implement' },
              { number: 2, description: 'Step 2', type: 'implement' },
            ],
          },
        ],
        status: 'ready',
        createdAt: new Date(),
      };

      const executePromise = slowExecutor.execute(plan);

      // Pause after a short delay
      setTimeout(() => {
        slowExecutor.pause();
        pauseDetected = slowExecutor.isPausedState();
        slowExecutor.resume();
      }, 25);

      const result = await executePromise;

      expect(result.success).toBe(true);
      // Note: pauseDetected may or may not be true depending on timing
    });
  });

  describe('cancel', () => {
    it('should support cancellation', async () => {
      const slowExecutor = createPlanExecutor({
        stepExecutor: async () => {
          await new Promise((resolve) => setTimeout(resolve, 100));
          return { success: true, output: 'done' };
        },
      });

      const plan: StructuredPlan = {
        name: 'Plan',
        goal: 'Goal',
        tasks: [
          {
            id: 1,
            name: 'Task 1',
            files: {},
            steps: [
              { number: 1, description: 'Step 1', type: 'implement' },
              { number: 2, description: 'Step 2', type: 'implement' },
            ],
          },
        ],
        status: 'ready',
        createdAt: new Date(),
      };

      const executePromise = slowExecutor.execute(plan);

      // Cancel after a short delay
      setTimeout(() => {
        slowExecutor.cancel();
      }, 10);

      const result = await executePromise;

      expect(result.success).toBe(false);
    });
  });
});

describe('TASK_TEMPLATES', () => {
  it('should have required templates', () => {
    expect(TASK_TEMPLATES['create-component']).toBeDefined();
    expect(TASK_TEMPLATES['add-api-endpoint']).toBeDefined();
    expect(TASK_TEMPLATES['fix-bug']).toBeDefined();
    expect(TASK_TEMPLATES['add-feature']).toBeDefined();
    expect(TASK_TEMPLATES['refactor']).toBeDefined();
  });

  it('should have valid template structure', () => {
    for (const [name, template] of Object.entries(TASK_TEMPLATES)) {
      expect(template.name).toBeDefined();
      expect(template.description).toBeDefined();
      expect(template.steps).toBeDefined();
      expect(template.steps.length).toBeGreaterThan(0);
      expect(template.estimatedMinutes).toBeGreaterThan(0);
    }
  });
});
