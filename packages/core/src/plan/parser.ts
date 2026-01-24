/**
 * Plan Parser
 *
 * Parses markdown plans into structured StructuredPlan format.
 * Supports multiple plan formats and extracts tasks, steps, and metadata.
 */

import type {
  StructuredPlan,
  PlanTask,
  TaskStep,
  PlanTaskFiles,
  StepType,
  ParseOptions,
} from './types.js';

/**
 * PlanParser - Parse markdown plans to structured format
 */
export class PlanParser {
  private defaultStepType: StepType;

  constructor(options?: { defaultStepType?: StepType }) {
    this.defaultStepType = options?.defaultStepType || 'implement';
  }

  /**
   * Parse a markdown plan into structured format
   */
  parse(markdown: string, _options?: ParseOptions): StructuredPlan {
    const lines = markdown.split('\n');
    const plan: StructuredPlan = {
      name: '',
      goal: '',
      tasks: [],
      status: 'draft',
      createdAt: new Date(),
    };

    let currentTask: Partial<PlanTask> | null = null;
    let currentStep: Partial<TaskStep> | null = null;
    let inCodeBlock = false;
    let codeBlockLang = '';
    let codeBlockContent: string[] = [];
    let section = '';
    let taskIdCounter = 1;
    let stepCounter = 1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Handle code blocks
      if (trimmed.startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeBlockLang = trimmed.slice(3).trim();
          codeBlockContent = [];
        } else {
          inCodeBlock = false;
          if (currentStep) {
            currentStep.code = codeBlockContent.join('\n');
            currentStep.language = codeBlockLang || undefined;
          }
          codeBlockLang = '';
          codeBlockContent = [];
        }
        continue;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        continue;
      }

      // Skip empty lines
      if (!trimmed) continue;

      // Parse headers
      if (trimmed.startsWith('#')) {
        const headerMatch = trimmed.match(/^(#+)\s*(.+)$/);
        if (headerMatch) {
          const level = headerMatch[1].length;
          const title = headerMatch[2].trim();

          if (level === 1) {
            // Main plan title
            plan.name = title;
          } else if (level === 2) {
            // Section or task
            section = title.toLowerCase();

            // Check if this is a task (numbered or "Task X:")
            const taskMatch = title.match(/^(?:Task\s*)?(\d+)(?:\.|\:)?\s*(.+)$/i);
            if (taskMatch) {
              // Save current step to previous task first
              if (currentStep && currentStep.description && currentTask) {
                if (!currentTask.steps) currentTask.steps = [];
                currentTask.steps.push(this.finalizeStep(currentStep, stepCounter++));
              }

              // Save previous task
              if (currentTask && currentTask.name) {
                plan.tasks.push(this.finalizeTask(currentTask, stepCounter));
              }

              currentTask = {
                id: parseInt(taskMatch[1], 10) || taskIdCounter++,
                name: taskMatch[2].trim(),
                files: {},
                steps: [],
              };
              stepCounter = 1;
              currentStep = null;
              section = 'task';
            }
          } else if (level === 3 && currentTask) {
            // Sub-section within task
            const subSection = title.toLowerCase();
            if (subSection.includes('file')) {
              section = 'files';
            } else if (subSection.includes('step')) {
              section = 'steps';
            }
          }
        }
        continue;
      }

      // Parse plan metadata
      if (section === 'goal' || section === 'objective') {
        plan.goal = (plan.goal ? plan.goal + ' ' : '') + trimmed;
        continue;
      }

      if (section === 'architecture') {
        plan.architecture = (plan.architecture ? plan.architecture + '\n' : '') + trimmed;
        continue;
      }

      if (section === 'tech stack' || section === 'technology') {
        if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
          if (!plan.techStack) plan.techStack = [];
          plan.techStack.push(trimmed.slice(1).trim());
        }
        continue;
      }

      // Parse task content
      if (currentTask) {
        // Parse files section
        if (trimmed.toLowerCase() === 'files:' || trimmed.toLowerCase().startsWith('**files')) {
          section = 'files';
          continue;
        }

        if (section === 'files') {
          const files = this.parseFiles(trimmed);
          if (files) {
            currentTask.files = { ...currentTask.files, ...files };
          }
          continue;
        }

        // Parse steps
        const stepMatch = trimmed.match(/^(\d+)[\.\)]\s*(.+)$/);
        if (stepMatch) {
          // Exit files section when we encounter a step
          if (section === 'files') {
            section = 'steps';
          }
          // Save previous step
          if (currentStep && currentStep.description) {
            if (!currentTask.steps) currentTask.steps = [];
            currentTask.steps.push(this.finalizeStep(currentStep, stepCounter++));
          }

          currentStep = {
            description: stepMatch[2].trim(),
            type: this.inferStepType(stepMatch[2]),
          };
          continue;
        }

        // Parse bullet points as step details
        if ((trimmed.startsWith('-') || trimmed.startsWith('*')) && currentStep) {
          const detail = trimmed.slice(1).trim();

          // Check for command
          if (detail.toLowerCase().startsWith('run:') || detail.toLowerCase().startsWith('command:')) {
            currentStep.command = detail.split(':').slice(1).join(':').trim();
          }
          // Check for expected output
          else if (detail.toLowerCase().startsWith('expect:') || detail.toLowerCase().startsWith('output:')) {
            currentStep.expectedOutput = detail.split(':').slice(1).join(':').trim();
          }
          // Check for critical flag
          else if (detail.toLowerCase().includes('critical') || detail.toLowerCase().includes('required')) {
            currentStep.critical = true;
          }
          continue;
        }

        // Parse inline metadata
        if (trimmed.toLowerCase().startsWith('estimated:') || trimmed.toLowerCase().startsWith('time:')) {
          const timeMatch = trimmed.match(/(\d+)\s*(?:min|minutes?|m)/i);
          if (timeMatch) {
            currentTask.estimatedMinutes = parseInt(timeMatch[1], 10);
          }
          continue;
        }

        if (trimmed.toLowerCase().startsWith('depends on:') || trimmed.toLowerCase().startsWith('dependencies:')) {
          const depsStr = trimmed.split(':').slice(1).join(':').trim();
          currentTask.dependencies = depsStr
            .split(/[,\s]+/)
            .map((d) => parseInt(d.replace(/\D/g, ''), 10))
            .filter((d) => !isNaN(d));
          continue;
        }

        if (trimmed.toLowerCase().startsWith('priority:')) {
          const priority = parseInt(trimmed.split(':')[1].trim(), 10);
          if (!isNaN(priority)) {
            currentTask.priority = priority;
          }
          continue;
        }

        if (trimmed.toLowerCase().startsWith('tags:')) {
          currentTask.tags = trimmed
            .split(':')
            .slice(1)
            .join(':')
            .split(/[,\s]+/)
            .map((t) => t.trim())
            .filter(Boolean);
          continue;
        }

        // Add description content
        if (!currentTask.description) {
          currentTask.description = trimmed;
        } else if (section === 'task') {
          currentTask.description += ' ' + trimmed;
        }
      } else {
        // Parse top-level metadata
        if (trimmed.toLowerCase().startsWith('goal:') || trimmed.toLowerCase().startsWith('objective:')) {
          plan.goal = trimmed.split(':').slice(1).join(':').trim();
          section = 'goal';
          continue;
        }

        if (trimmed.toLowerCase().startsWith('architecture:')) {
          plan.architecture = trimmed.split(':').slice(1).join(':').trim();
          section = 'architecture';
          continue;
        }

        if (trimmed.toLowerCase().startsWith('author:')) {
          plan.author = trimmed.split(':').slice(1).join(':').trim();
          continue;
        }

        if (trimmed.toLowerCase().startsWith('version:')) {
          plan.version = trimmed.split(':').slice(1).join(':').trim();
          continue;
        }

        if (trimmed.toLowerCase().startsWith('design doc:') || trimmed.toLowerCase().startsWith('designdoc:')) {
          plan.designDoc = trimmed.split(':').slice(1).join(':').trim();
          continue;
        }
      }
    }

    // Save last step
    if (currentStep && currentStep.description && currentTask) {
      if (!currentTask.steps) currentTask.steps = [];
      currentTask.steps.push(this.finalizeStep(currentStep, stepCounter));
    }

    // Save last task
    if (currentTask && currentTask.name) {
      plan.tasks.push(this.finalizeTask(currentTask, stepCounter));
    }

    // Set plan to ready if it has tasks
    if (plan.tasks.length > 0) {
      plan.status = 'ready';
    }

    return plan;
  }

  /**
   * Parse files from a line
   */
  private parseFiles(line: string): Partial<PlanTaskFiles> | null {
    const files: Partial<PlanTaskFiles> = {};

    // Check for create files
    if (line.toLowerCase().includes('create:')) {
      const createPart = line.split(/create:/i)[1];
      if (createPart) {
        files.create = this.extractFilePaths(createPart);
      }
    }

    // Check for modify files
    if (line.toLowerCase().includes('modify:')) {
      const modifyPart = line.split(/modify:/i)[1];
      if (modifyPart) {
        files.modify = this.extractFilePaths(modifyPart);
      }
    }

    // Check for test files
    if (line.toLowerCase().includes('test:')) {
      const testPart = line.split(/test:/i)[1];
      if (testPart) {
        files.test = this.extractFilePaths(testPart);
      }
    }

    // Check for delete files
    if (line.toLowerCase().includes('delete:')) {
      const deletePart = line.split(/delete:/i)[1];
      if (deletePart) {
        files.delete = this.extractFilePaths(deletePart);
      }
    }

    // Check for bullet point with file path
    if (line.startsWith('-') || line.startsWith('*')) {
      const content = line.slice(1).trim();
      const pathMatch = content.match(/`([^`]+)`|(\S+\.\w+)/);
      if (pathMatch) {
        const path = pathMatch[1] || pathMatch[2];
        if (content.toLowerCase().includes('create')) {
          files.create = [path];
        } else if (content.toLowerCase().includes('test')) {
          files.test = [path];
        } else if (content.toLowerCase().includes('delete')) {
          files.delete = [path];
        } else {
          files.modify = [path];
        }
      }
    }

    return Object.keys(files).length > 0 ? files : null;
  }

  /**
   * Extract file paths from a string
   */
  private extractFilePaths(str: string): string[] {
    const paths: string[] = [];

    // Match paths in backticks
    const backtickMatches = str.match(/`([^`]+)`/g);
    if (backtickMatches) {
      paths.push(...backtickMatches.map((m) => m.slice(1, -1)));
    }

    // Match common file patterns
    const pathMatches = str.match(/[\w\-./]+\.\w+/g);
    if (pathMatches) {
      paths.push(...pathMatches.filter((p) => !paths.includes(p)));
    }

    return paths;
  }

  /**
   * Infer step type from description
   */
  private inferStepType(description: string): StepType {
    const lower = description.toLowerCase();

    if (lower.includes('test') || lower.includes('spec') || lower.includes('assert')) {
      return 'test';
    }
    if (lower.includes('verify') || lower.includes('check') || lower.includes('confirm') || lower.includes('ensure')) {
      return 'verify';
    }
    if (lower.includes('commit') || lower.includes('git')) {
      return 'commit';
    }
    if (lower.includes('review') || lower.includes('inspect')) {
      return 'review';
    }
    if (lower.includes('setup') || lower.includes('initialize') || lower.includes('configure')) {
      return 'setup';
    }
    if (lower.includes('cleanup') || lower.includes('clean up') || lower.includes('remove')) {
      return 'cleanup';
    }

    return this.defaultStepType;
  }

  /**
   * Finalize a step
   */
  private finalizeStep(step: Partial<TaskStep>, number: number): TaskStep {
    return {
      number,
      description: step.description || '',
      type: step.type || this.defaultStepType,
      code: step.code,
      language: step.language,
      command: step.command,
      expectedOutput: step.expectedOutput,
      critical: step.critical,
      metadata: step.metadata,
    };
  }

  /**
   * Finalize a task
   */
  private finalizeTask(task: Partial<PlanTask>, _stepCounter: number): PlanTask {
    return {
      id: task.id || 1,
      name: task.name || 'Unnamed Task',
      description: task.description,
      files: task.files || {},
      steps: task.steps || [],
      estimatedMinutes: task.estimatedMinutes,
      dependencies: task.dependencies,
      tags: task.tags,
      priority: task.priority,
      status: 'pending',
      metadata: task.metadata,
    };
  }

  /**
   * Parse a plan file from path
   */
  async parseFile(filePath: string, options?: ParseOptions): Promise<StructuredPlan> {
    const fs = await import('node:fs/promises');
    const content = await fs.readFile(filePath, 'utf-8');
    return this.parse(content, options);
  }
}

/**
 * Create a PlanParser instance
 */
export function createPlanParser(options?: { defaultStepType?: StepType }): PlanParser {
  return new PlanParser(options);
}
