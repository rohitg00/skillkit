export {
  AGENT_ICONS,
  AGENT_NAMES,
  symbols,
  SPINNER_FRAMES,
  colors,
  formatAgent,
  getAgentIcon,
  formatAgentIconsInline,
  progressBar,
  formatScore,
} from './theme.js';

export {
  getLogo,
  getFullLogo,
  getCompactLogo,
  getMinimalLogo,
  getHeader,
  getDivider,
} from './logo.js';

export * as prompts from './prompts.js';
export {
  isCancel,
  intro,
  outro,
  cancel,
  note,
  log,
  step,
  success,
  warn,
  error,
  spinner,
  text,
  password,
  confirm,
  select,
  agentMultiselect,
  skillMultiselect,
  groupMultiselect,
  stepTrail,
  selectInstallMethod,
  tasks,
  summaryBox,
  type SkillOption,
} from './prompts.js';

export {
  showInstallSummary,
  showNextSteps,
  showAgentSummary,
  showProjectSummary,
  showSyncSummary,
  showSkillList,
  showMarketplaceInfo,
  type InstallResult,
  type InstallSummary,
} from './summary.js';

export {
  loadPreferences,
  savePreferences,
  isOnboardingComplete,
  completeOnboarding,
  saveLastAgents,
  getLastAgents,
  saveInstallMethod,
  getInstallMethod,
  getPreferencesDir,
  getPreferencesPath,
  type UserPreferences,
} from './preferences.js';

import { getLogo, getHeader } from './logo.js';
import * as prompts from './prompts.js';
import { colors, formatAgent } from './theme.js';
import { showNextSteps } from './summary.js';
import {
  completeOnboarding,
  saveLastAgents,
  getLastAgents,
} from './preferences.js';

let VERSION = '1.7.2';
let AGENT_COUNT = 17;

export function setVersion(version: string): void {
  VERSION = version;
}

export function setAgentCount(count: number): void {
  AGENT_COUNT = count;
}

export function welcome(): void {
  console.log(getLogo(VERSION, AGENT_COUNT));
}

export function header(title: string): void {
  console.log(getHeader(title));
}

export async function runOnboarding(detectedAgents: string[]): Promise<{
  selectedAgents: string[];
  cancelled: boolean;
}> {
  welcome();

  if (detectedAgents.length === 0) {
    prompts.warn('No agents detected');
    completeOnboarding();
    return { selectedAgents: [], cancelled: false };
  }

  prompts.log(`Detected ${detectedAgents.length} agent${detectedAgents.length !== 1 ? 's' : ''}: ${detectedAgents.map(formatAgent).join(', ')}`);

  const agentResult = await prompts.agentMultiselect({
    message: 'Select agents to configure',
    agents: detectedAgents,
    initialValues: detectedAgents,
  });

  if (prompts.isCancel(agentResult)) {
    prompts.cancel('Setup cancelled');
    return { selectedAgents: [], cancelled: true };
  }

  saveLastAgents(agentResult as string[]);
  completeOnboarding();

  prompts.success(`Configured ${agentResult.length} agent${agentResult.length !== 1 ? 's' : ''}`);

  return { selectedAgents: agentResult as string[], cancelled: false };
}

export interface InstallFlowOptions {
  source: string;
  discoveredSkills: Array<{ name: string; path: string }>;
  detectedAgents: string[];
  showLogo?: boolean;
}

export interface InstallFlowResult {
  selectedSkills: string[];
  selectedAgents: string[];
  installMethod: 'symlink' | 'copy';
  cancelled: boolean;
}

export async function runInstallFlow(options: InstallFlowOptions): Promise<InstallFlowResult> {
  const { source, discoveredSkills, detectedAgents, showLogo = true } = options;

  if (showLogo) {
    welcome();
  }

  prompts.step(`Source: ${colors.cyan(source)}`);
  prompts.step(`Found ${discoveredSkills.length} skill${discoveredSkills.length !== 1 ? 's' : ''}`);

  const skillNames = discoveredSkills.map(s => s.name);
  const skillResult = await prompts.skillMultiselect({
    message: 'Select skills to install',
    skills: discoveredSkills.map(s => ({ name: s.name })),
    initialValues: skillNames,
  });

  if (prompts.isCancel(skillResult)) {
    prompts.cancel('Installation cancelled');
    return { selectedSkills: [], selectedAgents: [], installMethod: 'symlink', cancelled: true };
  }

  if (detectedAgents.length > 1) {
    prompts.step(`Detected ${detectedAgents.length} agents`);
  }

  const lastAgents = getLastAgents();
  const initialAgents = lastAgents.length > 0 ? lastAgents : detectedAgents;

  const agentResult = await prompts.agentMultiselect({
    message: 'Install to which agents?',
    agents: detectedAgents,
    initialValues: initialAgents.filter(a => detectedAgents.includes(a)),
  });

  if (prompts.isCancel(agentResult)) {
    prompts.cancel('Installation cancelled');
    return { selectedSkills: skillResult as string[], selectedAgents: [], installMethod: 'symlink', cancelled: true };
  }

  saveLastAgents(agentResult as string[]);

  const methodResult = await prompts.selectInstallMethod({
    message: 'Installation method',
  });

  if (prompts.isCancel(methodResult)) {
    prompts.cancel('Installation cancelled');
    return {
      selectedSkills: skillResult as string[],
      selectedAgents: agentResult as string[],
      installMethod: 'symlink',
      cancelled: true,
    };
  }

  return {
    selectedSkills: skillResult as string[],
    selectedAgents: agentResult as string[],
    installMethod: methodResult as 'symlink' | 'copy',
    cancelled: false,
  };
}

export function showCompletion(options: {
  skillNames: string[];
  agentTypes: string[];
  action?: 'install' | 'sync' | 'init';
}): void {
  const action = options.action || 'install';
  const messages: Record<string, string> = {
    install: 'Installation complete!',
    sync: 'Sync complete!',
    init: 'Initialization complete!',
  };

  prompts.outro(messages[action] || 'Done!');
  showNextSteps(options);
}

export function handleCancel(message?: string): void {
  prompts.cancel(message || 'Operation cancelled');
  process.exit(0);
}
