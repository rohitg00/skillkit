import * as prompts from './prompts.js';
import { symbols, colors, formatAgent, getAgentIcon, formatAgentIconsInline } from './theme.js';

export interface InstallResult {
  skillName: string;
  method: 'symlink' | 'copy';
  agents: string[];
  path: string;
}

export interface InstallSummary {
  totalSkills: number;
  totalAgents: number;
  results: InstallResult[];
  source?: string;
}

export function showInstallSummary(summary: InstallSummary): void {
  const title = `Installed ${summary.totalSkills} skill${summary.totalSkills !== 1 ? 's' : ''} to ${summary.totalAgents} agent${summary.totalAgents !== 1 ? 's' : ''}`;

  const lines: string[] = [];

  for (const result of summary.results) {
    lines.push(`${colors.success(symbols.success)} ${colors.primary(result.skillName)}`);

    const agentDisplay = result.agents.length <= 3
      ? result.agents.map(formatAgent).join(', ')
      : `${formatAgentIconsInline(result.agents.slice(0, 3))} +${result.agents.length - 3} more`;

    lines.push(`  ${result.method} ${symbols.arrowRight} ${agentDisplay}`);
    lines.push('');
  }

  prompts.note(lines.join('\n').trim(), title);
}

export function showNextSteps(options: {
  skillNames: string[];
  agentTypes: string[];
  syncNeeded?: boolean;
}): void {
  const lines: string[] = [];

  lines.push(`${colors.muted('1.')} Run ${colors.cyan('skillkit sync')} to update agent configs`);
  lines.push(`${colors.muted('2.')} Use ${colors.cyan(`skillkit read ${options.skillNames[0] || '<skill>'}`)} to view skill docs`);

  if (options.agentTypes.includes('claude-code')) {
    lines.push(`${colors.muted('3.')} Skills are available via ${colors.cyan('/@')} in Claude Code`);
  } else if (options.agentTypes.includes('cursor')) {
    lines.push(`${colors.muted('3.')} Skills are available in Cursor rules`);
  }

  console.log('');
  console.log(colors.dim('Next steps:'));
  console.log(lines.map(l => `  ${l}`).join('\n'));
  console.log('');
}

export function showAgentSummary(agents: string[]): void {
  console.log('');
  console.log(colors.dim('Detected agents:'));

  const iconLine = agents.map(a => `${getAgentIcon(a)} ${colors.muted(a)}`).join('  ');
  console.log(`  ${iconLine}`);
  console.log('');
}

export function showProjectSummary(profile: {
  name: string;
  type?: string;
  languages: string[];
  frameworks: string[];
}): void {
  const lines: string[] = [];

  lines.push(`${colors.primary('Project:')} ${profile.name}`);

  if (profile.type) {
    lines.push(`${colors.primary('Type:')} ${profile.type}`);
  }

  if (profile.languages.length > 0) {
    lines.push(`${colors.primary('Languages:')} ${profile.languages.join(', ')}`);
  }

  if (profile.frameworks.length > 0) {
    lines.push(`${colors.primary('Frameworks:')} ${profile.frameworks.join(', ')}`);
  }

  prompts.note(lines.join('\n'), 'Project Analysis');
}

export function showSyncSummary(options: {
  skillCount: number;
  agentType: string;
  configPath: string;
}): void {
  const lines: string[] = [];

  lines.push(`${colors.success(symbols.success)} Synced ${options.skillCount} skill${options.skillCount !== 1 ? 's' : ''}`);
  lines.push(`  Agent: ${formatAgent(options.agentType)}`);
  lines.push(`  Config: ${colors.muted(options.configPath)}`);

  console.log('');
  console.log(lines.join('\n'));
  console.log('');
}

export function showSkillList(skills: Array<{
  name: string;
  description?: string;
  score?: number;
  source?: string;
  installed?: boolean;
}>): void {
  console.log('');

  for (const skill of skills) {
    let line = '';

    if (skill.installed) {
      line += colors.success(symbols.success) + ' ';
    } else {
      line += colors.muted(symbols.stepPending) + ' ';
    }

    line += colors.primary(skill.name);

    if (skill.score !== undefined) {
      let scoreColor: (text: string) => string;
      if (skill.score >= 70) {
        scoreColor = colors.success;
      } else if (skill.score >= 50) {
        scoreColor = colors.warning;
      } else {
        scoreColor = colors.muted;
      }
      line += ` ${scoreColor(`${skill.score}%`)}`;
    }

    console.log(line);

    if (skill.description) {
      console.log(`    ${colors.muted(truncate(skill.description, 60))}`);
    }

    if (skill.source) {
      console.log(`    ${colors.dim(`Source: ${skill.source}`)}`);
    }
  }

  console.log('');
}

export function showMarketplaceInfo(options: {
  totalSkills: number;
  sourceCount: number;
  lastUpdated?: string;
}): void {
  const lines: string[] = [];

  lines.push(`Total skills: ${colors.cyan(String(options.totalSkills))}`);
  lines.push(`Sources: ${colors.cyan(String(options.sourceCount))}`);

  if (options.lastUpdated) {
    const date = new Date(options.lastUpdated).toLocaleDateString();
    lines.push(`Updated: ${colors.muted(date)}`);
  }

  prompts.note(lines.join('\n'), 'Skill Marketplace');
}

function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + '...';
}
