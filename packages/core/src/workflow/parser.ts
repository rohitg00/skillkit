/**
 * Workflow Parser
 *
 * Parses workflow YAML files into Workflow objects.
 */

import { existsSync, readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { parse, stringify } from 'yaml';
import type { Workflow, WorkflowWave, WorkflowSkill } from './types.js';
import { WORKFLOWS_DIR, WORKFLOW_EXTENSION } from './types.js';

/**
 * Parse a workflow from YAML content
 */
export function parseWorkflow(content: string): Workflow {
  const data = parse(content) as Record<string, unknown>;

  if (!data.name || typeof data.name !== 'string') {
    throw new Error('Workflow must have a name');
  }

  if (!data.waves || !Array.isArray(data.waves)) {
    throw new Error('Workflow must have waves array');
  }

  const waves: WorkflowWave[] = data.waves.map((wave: unknown, index: number) => {
    if (typeof wave !== 'object' || wave === null) {
      throw new Error(`Wave ${index} must be an object`);
    }

    const waveObj = wave as Record<string, unknown>;
    const skills = waveObj.skills;

    if (!skills || !Array.isArray(skills)) {
      throw new Error(`Wave ${index} must have skills array`);
    }

    return {
      name: waveObj.name as string | undefined,
      parallel: waveObj.parallel === true,
      skills: skills.map((s: unknown) => {
        if (typeof s === 'string') {
          return s;
        }
        if (typeof s === 'object' && s !== null) {
          const skillObj = s as Record<string, unknown>;
          return {
            skill: skillObj.skill as string,
            config: skillObj.config as Record<string, unknown> | undefined,
            condition: skillObj.condition as string | undefined,
          } as WorkflowSkill;
        }
        throw new Error(`Invalid skill in wave ${index}`);
      }),
      continueOnError: waveObj.continueOnError === true,
    };
  });

  return {
    name: data.name as string,
    description: data.description as string | undefined,
    version: data.version as string | undefined,
    author: data.author as string | undefined,
    tags: data.tags as string[] | undefined,
    waves,
    env: data.env as Record<string, string> | undefined,
    preHooks: data.preHooks as string[] | undefined,
    postHooks: data.postHooks as string[] | undefined,
  };
}

/**
 * Load a workflow from a file
 */
export function loadWorkflow(filePath: string): Workflow {
  if (!existsSync(filePath)) {
    throw new Error(`Workflow file not found: ${filePath}`);
  }

  const content = readFileSync(filePath, 'utf-8');
  return parseWorkflow(content);
}

/**
 * Load a workflow by name from the project's workflows directory
 */
export function loadWorkflowByName(projectPath: string, name: string): Workflow | null {
  const workflowsDir = join(projectPath, '.skillkit', WORKFLOWS_DIR);

  if (!existsSync(workflowsDir)) {
    return null;
  }

  // Try exact name match first
  const exactPath = join(workflowsDir, `${name}${WORKFLOW_EXTENSION}`);
  if (existsSync(exactPath)) {
    return loadWorkflow(exactPath);
  }

  // Try finding by workflow name property
  const files = readdirSync(workflowsDir).filter((f) => f.endsWith(WORKFLOW_EXTENSION));

  for (const file of files) {
    try {
      const workflow = loadWorkflow(join(workflowsDir, file));
      if (workflow.name === name) {
        return workflow;
      }
    } catch {
      // Skip invalid workflow files
    }
  }

  return null;
}

/**
 * List all workflows in a project
 */
export function listWorkflows(projectPath: string): Workflow[] {
  const workflowsDir = join(projectPath, '.skillkit', WORKFLOWS_DIR);

  if (!existsSync(workflowsDir)) {
    return [];
  }

  const files = readdirSync(workflowsDir).filter((f) => f.endsWith(WORKFLOW_EXTENSION));
  const workflows: Workflow[] = [];

  for (const file of files) {
    try {
      const workflow = loadWorkflow(join(workflowsDir, file));
      workflows.push(workflow);
    } catch {
      // Skip invalid workflow files
    }
  }

  return workflows;
}

/**
 * Save a workflow to a file
 */
export function saveWorkflow(projectPath: string, workflow: Workflow): string {
  const workflowsDir = join(projectPath, '.skillkit', WORKFLOWS_DIR);

  if (!existsSync(workflowsDir)) {
    mkdirSync(workflowsDir, { recursive: true });
  }

  const fileName = `${workflow.name.replace(/[^a-z0-9-]/gi, '-').toLowerCase()}${WORKFLOW_EXTENSION}`;
  const filePath = join(workflowsDir, fileName);

  writeFileSync(filePath, stringify(workflow));

  return filePath;
}

/**
 * Serialize a workflow to YAML
 */
export function serializeWorkflow(workflow: Workflow): string {
  return stringify(workflow);
}

/**
 * Validate a workflow
 */
export function validateWorkflow(workflow: Workflow): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!workflow.name) {
    errors.push('Workflow must have a name');
  }

  if (!workflow.waves || workflow.waves.length === 0) {
    errors.push('Workflow must have at least one wave');
  }

  for (let i = 0; i < workflow.waves.length; i++) {
    const wave = workflow.waves[i];

    if (!wave.skills || wave.skills.length === 0) {
      errors.push(`Wave ${i + 1} must have at least one skill`);
    }

    for (let j = 0; j < wave.skills.length; j++) {
      const skill = wave.skills[j];
      const skillName = typeof skill === 'string' ? skill : skill.skill;

      if (!skillName) {
        errors.push(`Wave ${i + 1}, skill ${j + 1} must have a name`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Create a new workflow from a template
 */
export function createWorkflowTemplate(name: string, description?: string): Workflow {
  return {
    name,
    description: description || `Workflow: ${name}`,
    version: '1.0.0',
    waves: [
      {
        name: 'Setup',
        parallel: true,
        skills: [],
      },
      {
        name: 'Main',
        parallel: false,
        skills: [],
      },
    ],
  };
}
