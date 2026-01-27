import * as clack from '@clack/prompts';
import pc from 'picocolors';
import { symbols, colors, formatAgent, formatScore } from './theme.js';

export function isCancel(value: unknown): value is symbol {
  return clack.isCancel(value);
}

export function intro(message?: string): void {
  clack.intro(message ? pc.bold(message) : undefined);
}

export function outro(message: string): void {
  clack.outro(pc.green(message));
}

export function cancel(message: string = 'Operation cancelled'): void {
  clack.cancel(pc.yellow(message));
}

export function note(message: string, title?: string): void {
  clack.note(message, title);
}

export function log(message: string): void {
  clack.log.info(message);
}

export function step(message: string): void {
  clack.log.step(message);
}

export function success(message: string): void {
  clack.log.success(pc.green(message));
}

export function warn(message: string): void {
  clack.log.warn(pc.yellow(message));
}

export function error(message: string): void {
  clack.log.error(pc.red(message));
}

export function spinner(): ReturnType<typeof clack.spinner> {
  return clack.spinner();
}

export async function text(options: {
  message: string;
  placeholder?: string;
  defaultValue?: string;
  validate?: (value: string) => string | Error | undefined;
}): Promise<string | symbol> {
  return clack.text({
    message: options.message,
    placeholder: options.placeholder,
    defaultValue: options.defaultValue,
    validate: options.validate,
  });
}

export async function password(options: {
  message: string;
  validate?: (value: string) => string | Error | undefined;
}): Promise<string | symbol> {
  return clack.password({
    message: options.message,
    validate: options.validate,
  });
}

export async function confirm(options: {
  message: string;
  initialValue?: boolean;
}): Promise<boolean | symbol> {
  return clack.confirm({
    message: options.message,
    initialValue: options.initialValue,
  });
}

export async function select<T extends string>(options: {
  message: string;
  options: Array<{ value: T; label: string; hint?: string }>;
  initialValue?: T;
}): Promise<T | symbol> {
  return clack.select({
    message: options.message,
    options: options.options as { value: T; label?: string; hint?: string }[],
    initialValue: options.initialValue,
  });
}

export async function agentMultiselect(options: {
  message: string;
  agents: string[];
  initialValues?: string[];
  required?: boolean;
}): Promise<string[] | symbol> {
  const agentOptions = options.agents.map((agent) => ({
    value: agent,
    label: formatAgent(agent),
    hint: undefined as string | undefined,
  }));

  return clack.multiselect({
    message: options.message,
    options: agentOptions,
    initialValues: options.initialValues,
    required: options.required ?? true,
  });
}

export interface SkillOption {
  name: string;
  description?: string;
  score?: number;
  source?: string;
}

export async function skillMultiselect(options: {
  message: string;
  skills: SkillOption[];
  initialValues?: string[];
  required?: boolean;
}): Promise<string[] | symbol> {
  const skillOptions = options.skills.map((skill) => {
    const label = skill.name;
    let hint: string | undefined;

    if (skill.score !== undefined) {
      hint = formatScore(skill.score);
    } else if (skill.source) {
      hint = pc.dim(skill.source);
    }

    return { value: skill.name, label, hint };
  });

  return clack.multiselect({
    message: options.message,
    options: skillOptions,
    initialValues: options.initialValues,
    required: options.required ?? false,
  });
}

export async function groupMultiselect<T extends string>(options: {
  message: string;
  options: Record<string, Array<{ value: T; label: string; hint?: string }>>;
  required?: boolean;
}): Promise<T[] | symbol> {
  return clack.groupMultiselect({
    message: options.message,
    options: options.options as Record<string, { value: T; label?: string; hint?: string }[]>,
    required: options.required,
  });
}

export function stepTrail(steps: Array<{ label: string; status: 'pending' | 'active' | 'complete' }>): string {
  const lines: string[] = [];

  for (let i = 0; i < steps.length; i++) {
    const currentStep = steps[i];
    const isLast = i === steps.length - 1;

    let icon: string;
    let labelColor: (text: string) => string;

    switch (currentStep.status) {
      case 'complete':
        icon = colors.success(symbols.stepComplete);
        labelColor = colors.muted;
        break;
      case 'active':
        icon = colors.accent(symbols.stepActive);
        labelColor = colors.primary;
        break;
      case 'pending':
      default:
        icon = colors.muted(symbols.stepPending);
        labelColor = colors.muted;
        break;
    }

    lines.push(`${icon}  ${labelColor(currentStep.label)}`);

    if (!isLast) {
      lines.push(`${colors.muted(symbols.stepLine)}`);
    }
  }

  return lines.join('\n');
}

export async function selectInstallMethod(options: {
  message?: string;
}): Promise<'symlink' | 'copy' | symbol> {
  return clack.select({
    message: options.message || 'Installation method',
    options: [
      {
        value: 'symlink' as const,
        label: 'Symlink (Recommended)',
        hint: 'Single source, auto-updates',
      },
      {
        value: 'copy' as const,
        label: 'Copy to all agents',
        hint: 'Independent copies',
      },
    ],
  });
}

export async function tasks(
  taskList: Array<{
    title: string;
    task: (message: (msg: string) => void) => Promise<string | void>;
    enabled?: boolean;
  }>
): Promise<void> {
  return clack.tasks(taskList.filter((t) => t.enabled !== false));
}

export function summaryBox(options: {
  title: string;
  items: Array<{ label: string; value: string; icon?: string }>;
}): void {
  const lines: string[] = [];

  for (const item of options.items) {
    const icon = item.icon ? `${item.icon} ` : '';
    lines.push(`  ${icon}${colors.primary(item.label)}`);
    lines.push(`    ${colors.muted(item.value)}`);
  }

  clack.note(lines.join('\n'), options.title);
}
