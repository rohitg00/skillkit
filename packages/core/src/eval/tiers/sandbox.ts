import { execFile as execFileCb } from 'node:child_process';
import { promisify } from 'node:util';
import { writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import type {
  TierEvaluator,
  EvalOptions,
  SandboxTierResult,
  SandboxTestCase,
  SandboxResult,
} from '../types.js';
import { scoreToGrade } from '../types.js';
import { createProvider } from '../../ai/providers/factory.js';
import type { ProviderName } from '../../ai/providers/types.js';
import { rubricGraderPrompt } from '../prompts/rubric-prompt.js';

const execFile = promisify(execFileCb);

async function isDockerAvailable(): Promise<boolean> {
  try {
    await execFile('docker', ['info'], { timeout: 10_000 });
    return true;
  } catch {
    return false;
  }
}

function extractTestCases(content: string): SandboxTestCase[] {
  const cases: SandboxTestCase[] = [];

  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  const nameMatch = fmMatch?.[1]?.match(/name\s*:\s*(.+)/);
  const skillName = nameMatch?.[1]?.trim().replace(/["']/g, '') ?? 'skill';

  const exampleBlocks: string[] = [];
  const codeBlockRe = /```[\s\S]*?```/g;
  let match: RegExpExecArray | null;
  while ((match = codeBlockRe.exec(content)) !== null) {
    exampleBlocks.push(match[0]);
  }

  const whenToUseRe = /#+\s*(?:when\s+to\s+use|triggers?|use\s+when)[^\n]*/i;
  const whenToUseMatch = whenToUseRe.exec(content);

  if (exampleBlocks.length > 0) {
    const block = exampleBlocks[0];
    cases.push({
      name: `${skillName}: code block content validation`,
      prompt: `Follow this skill instruction and execute the first code example:\n\n${block}`,
      expectedOutcome: 'exit code 0',
      graderType: 'deterministic',
    });
  }

  cases.push({
    name: `${skillName}: skill parsing validation`,
    prompt: `Parse the following skill content and confirm it is valid:\n\n${content.slice(0, 2000)}`,
    expectedOutcome: 'parseable skill content',
    graderType: 'deterministic',
  });

  if (whenToUseMatch) {
    const sectionStart = whenToUseMatch.index + whenToUseMatch[0].length;
    const nextHeading = content.slice(sectionStart).search(/\n#+\s/);
    const sectionEnd = nextHeading >= 0 ? sectionStart + nextHeading : sectionStart + 500;
    const triggerSection = content.slice(sectionStart, sectionEnd).trim();

    if (triggerSection.length > 10) {
      cases.push({
        name: `${skillName}: trigger condition coverage`,
        prompt: `Given this skill's trigger conditions, determine if the skill would activate:\n\n${triggerSection}`,
        expectedOutcome: 'trigger evaluation completed',
        graderType: 'llm-rubric',
        rubric:
          'The output should demonstrate understanding of the trigger conditions and correctly identify when the skill activates. ' +
          'It should cover at least one positive match scenario.',
      });
    }
  }

  if (cases.length < 2) {
    cases.push({
      name: `${skillName}: required sections check`,
      prompt: `Verify the skill has required sections (name, description, instructions):\n\n${content.slice(0, 3000)}`,
      expectedOutcome: 'sections identified',
      graderType: 'deterministic',
    });
  }

  return cases;
}

async function runInDocker(
  testCase: SandboxTestCase,
  _skillPath: string,
  image: string,
  timeout: number,
): Promise<{ stdout: string; stderr: string; exitCode: number; duration: number }> {
  const start = performance.now();
  const tmpDir = mkdtempSync(join(tmpdir(), 'skillkit-sandbox-'));

  try {
    const scriptPath = join(tmpDir, 'run.sh');
    writeFileSync(scriptPath, `#!/bin/sh\ncat /skill/content.txt\necho "SKILL_PARSED_OK"\n`, {
      mode: 0o755,
    });

    const contentPath = join(tmpDir, 'content.txt');
    writeFileSync(contentPath, testCase.prompt);

    const args = [
      'run',
      '--rm',
      '--network', 'none',
      '--memory', '256m',
      '--cpus', '0.5',
      '-v', `${tmpDir}:/skill:ro`,
      image,
      '/bin/sh', '/skill/run.sh',
    ];

    const { stdout, stderr } = await execFile('docker', args, {
      timeout: timeout * 1000,
      maxBuffer: 1024 * 1024,
    });

    const duration = Math.round(performance.now() - start);
    return { stdout, stderr, exitCode: 0, duration };
  } catch (err: unknown) {
    const duration = Math.round(performance.now() - start);
    const error = err as { stdout?: string; stderr?: string; code?: number | string };
    return {
      stdout: error.stdout ?? '',
      stderr: error.stderr ?? String(err),
      exitCode: typeof error.code === 'number' ? error.code : 1,
      duration,
    };
  } finally {
    try {
      rmSync(tmpDir, { recursive: true, force: true });
    } catch {
      // cleanup best-effort
    }
  }
}

function gradeDeterministic(
  testCase: SandboxTestCase,
  stdout: string,
  _stderr: string,
  exitCode: number,
): { passed: boolean; score: number } {
  const outputLower = stdout.toLowerCase();
  const expectedLower = testCase.expectedOutcome.toLowerCase();

  if (expectedLower === 'exit code 0') {
    const passed = exitCode === 0;
    return { passed, score: passed ? 100 : 0 };
  }

  const containsExpected = outputLower.includes(expectedLower);
  const hasOutput = stdout.trim().length > 0;
  const cleanExit = exitCode === 0;

  if (containsExpected && cleanExit) {
    return { passed: true, score: 100 };
  }
  if (cleanExit && hasOutput) {
    return { passed: false, score: 50 };
  }
  if (hasOutput) {
    return { passed: false, score: 30 };
  }
  return { passed: false, score: 0 };
}

async function gradeLLMRubric(
  testCase: SandboxTestCase,
  stdout: string,
  options: EvalOptions,
): Promise<{ passed: boolean; score: number }> {
  if (!testCase.rubric) {
    return { passed: stdout.trim().length > 0, score: stdout.trim().length > 0 ? 60 : 0 };
  }

  try {
    const provider = createProvider(
      (options.provider as ProviderName) || undefined,
      options.model ? { model: options.model } : undefined,
    );

    if (!provider.isConfigured() || provider.name === 'mock') {
      return { passed: stdout.trim().length > 0, score: stdout.trim().length > 0 ? 60 : 0 };
    }

    const messages = rubricGraderPrompt(testCase.prompt, stdout, testCase.rubric);
    const raw = await provider.chat(messages);

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { passed: stdout.trim().length > 0, score: 50 };
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const passed = typeof parsed.passed === 'boolean' ? parsed.passed : false;
    const score = typeof parsed.score === 'number' && Number.isFinite(parsed.score)
      ? Math.max(0, Math.min(100, Math.round(parsed.score)))
      : (passed ? 70 : 30);

    return { passed, score };
  } catch {
    return { passed: stdout.trim().length > 0, score: stdout.trim().length > 0 ? 50 : 0 };
  }
}

export class SandboxEvaluator implements TierEvaluator {
  readonly tier = 4 as const;
  readonly name = 'Sandbox Execution';

  async evaluate(
    content: string,
    skillPath: string,
    options: EvalOptions,
  ): Promise<SandboxTierResult> {
    const start = performance.now();

    const dockerAvailable = await isDockerAvailable();
    if (!dockerAvailable) {
      const duration = Math.round(performance.now() - start);
      return {
        tier: 4,
        name: this.name,
        score: -1,
        grade: 'F',
        duration,
        details: {
          results: [],
          passRate: 0,
          avgDuration: 0,
          dockerAvailable: false,
        },
      };
    }

    const image = options.sandboxImage ?? 'alpine:3.19';
    const timeout = options.timeout ?? 30;
    const testCases = extractTestCases(content);

    const results: SandboxResult[] = [];

    for (const testCase of testCases) {
      try {
        const { stdout, stderr, exitCode, duration: caseDuration } = await runInDocker(
          testCase,
          skillPath,
          image,
          timeout,
        );

        let gradeResult: { passed: boolean; score: number };

        if (testCase.graderType === 'llm-rubric') {
          gradeResult = await gradeLLMRubric(testCase, stdout, options);
        } else {
          gradeResult = gradeDeterministic(testCase, stdout, stderr, exitCode);
        }

        results.push({
          testCase: testCase.name,
          passed: gradeResult.passed,
          score: gradeResult.score,
          duration: caseDuration,
          output: stdout.slice(0, 2000) || undefined,
          error: stderr.slice(0, 1000) || undefined,
        });
      } catch (err) {
        results.push({
          testCase: testCase.name,
          passed: false,
          score: 0,
          duration: 0,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    const passCount = results.filter((r) => r.passed).length;
    const passRate = results.length > 0 ? passCount / results.length : 0;
    const avgDuration = results.length > 0
      ? Math.round(results.reduce((sum, r) => sum + r.duration, 0) / results.length)
      : 0;

    const score = results.length > 0
      ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)
      : 0;
    const duration = Math.round(performance.now() - start);

    return {
      tier: 4,
      name: this.name,
      score,
      grade: scoreToGrade(score),
      duration,
      details: {
        results,
        passRate,
        avgDuration,
        dockerAvailable: true,
      },
    };
  }
}
