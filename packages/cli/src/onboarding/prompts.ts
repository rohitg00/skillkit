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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return clack.select({
    message: options.message,
    options: options.options as any,
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

export async function quickAgentSelect(options: {
  message?: string;
  agents: string[];
  lastSelected?: string[];
}): Promise<{ agents: string[]; method: 'last' | 'all' | 'select' } | symbol> {
  const { agents, lastSelected = [] } = options;
  const hasLast = lastSelected.length > 0 && lastSelected.some(a => agents.includes(a));

  const selectOptions: Array<{ value: string; label: string; hint?: string }> = [];

  if (hasLast) {
    const validLast = lastSelected.filter(a => agents.includes(a));
    const agentList = validLast.slice(0, 3).map(formatAgent).join(', ');
    const more = validLast.length > 3 ? ` +${validLast.length - 3}` : '';

    selectOptions.push({
      value: 'last',
      label: `Same as last time (Recommended)`,
      hint: `${agentList}${more}`,
    });
  }

  selectOptions.push({
    value: 'all',
    label: 'All detected agents',
    hint: `${agents.length} agent${agents.length !== 1 ? 's' : ''}`,
  });

  selectOptions.push({
    value: 'select',
    label: 'Select specific agents',
    hint: 'Choose manually',
  });

  const result = await clack.select({
    message: options.message || 'Install to',
    options: selectOptions,
  });

  if (clack.isCancel(result)) {
    return result;
  }

  const method = result as 'last' | 'all' | 'select';

  if (method === 'last') {
    return { agents: lastSelected.filter(a => agents.includes(a)), method };
  }

  if (method === 'all') {
    return { agents, method };
  }

  const selected = await agentMultiselect({
    message: 'Select agents',
    agents,
    initialValues: lastSelected.length > 0 ? lastSelected : agents,
  });

  if (clack.isCancel(selected)) {
    return selected;
  }

  return { agents: selected as string[], method };
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

export async function quickSkillSelect(options: {
  message?: string;
  skills: SkillOption[];
}): Promise<{ skills: string[]; method: 'all' | 'select' } | symbol> {
  const { skills } = options;

  const result = await clack.select({
    message: options.message || `Found ${skills.length} skills — how would you like to install?`,
    options: [
      { value: 'all' as const, label: 'Install all skills', hint: `${skills.length} skills` },
      { value: 'select' as const, label: 'Select specific skills', hint: 'Choose manually' },
    ],
  });

  if (clack.isCancel(result)) {
    return result;
  }

  const method = result as 'all' | 'select';

  if (method === 'all') {
    return { skills: skills.map(s => s.name), method };
  }

  const selected = await skillMultiselect({
    message: 'Select skills to install',
    skills,
    initialValues: [],
  });

  if (clack.isCancel(selected)) {
    return selected;
  }

  return { skills: selected as string[], method };
}

export async function groupMultiselect<T extends string>(options: {
  message: string;
  options: Record<string, Array<{ value: T; label: string; hint?: string }>>;
  required?: boolean;
}): Promise<T[] | symbol> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return clack.groupMultiselect({
    message: options.message,
    options: options.options as any,
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return clack.tasks(taskList.filter((t) => t.enabled !== false) as any);
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
