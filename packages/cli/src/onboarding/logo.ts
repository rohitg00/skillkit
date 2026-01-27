import pc from 'picocolors';
import { symbols } from './theme.js';

function getTerminalWidth(): number {
  return process.stdout.columns || 80;
}

export function getFullLogo(version?: string, agentCount?: number): string {
  const lines = [
    '',
    pc.dim('    ') + pc.white('███████╗') + pc.gray('██╗  ██╗') + pc.dim('██╗') + pc.gray('██╗     ') + pc.dim('██╗     ') + pc.white('██╗  ██╗') + pc.gray('██╗') + pc.dim('████████╗'),
    pc.dim('    ') + pc.white('██╔════╝') + pc.gray('██║ ██╔╝') + pc.dim('██║') + pc.gray('██║     ') + pc.dim('██║     ') + pc.white('██║ ██╔╝') + pc.gray('██║') + pc.dim('╚══██╔══╝'),
    pc.dim('    ') + pc.white('███████╗') + pc.gray('█████╔╝ ') + pc.dim('██║') + pc.gray('██║     ') + pc.dim('██║     ') + pc.white('█████╔╝ ') + pc.gray('██║') + pc.dim('   ██║   '),
    pc.dim('    ') + pc.white('╚════██║') + pc.gray('██╔═██╗ ') + pc.dim('██║') + pc.gray('██║     ') + pc.dim('██║     ') + pc.white('██╔═██╗ ') + pc.gray('██║') + pc.dim('   ██║   '),
    pc.dim('    ') + pc.white('███████║') + pc.gray('██║  ██╗') + pc.dim('██║') + pc.gray('███████╗') + pc.dim('███████╗') + pc.white('██║  ██╗') + pc.gray('██║') + pc.dim('   ██║   '),
    pc.dim('    ') + pc.white('╚══════╝') + pc.gray('╚═╝  ╚═╝') + pc.dim('╚═╝') + pc.gray('╚══════╝') + pc.dim('╚══════╝') + pc.white('╚═╝  ╚═╝') + pc.gray('╚═╝') + pc.dim('   ╚═╝   '),
    '',
  ];

  if (version || agentCount) {
    const info: string[] = [];
    if (version) info.push(`v${version}`);
    if (agentCount) info.push(`${agentCount} agents`);
    lines.push(pc.dim('    ') + pc.dim(info.join('  │  ')));
    lines.push('');
  }

  return lines.join('\n');
}

export function getCompactLogo(version?: string, agentCount?: number): string {
  const frame = `${symbols.frameCorner}${symbols.frameLine.repeat(18)}${symbols.frameCorner}`;

  const lines = [
    '',
    pc.dim(`  ${frame}`),
    pc.dim('  ') + pc.white('   S K I L L K I T   '),
    pc.dim(`  ${frame}`),
  ];

  if (version || agentCount) {
    const info: string[] = [];
    if (version) info.push(`v${version}`);
    if (agentCount) info.push(`${agentCount} agents`);
    lines.push(pc.dim('     ') + pc.dim(info.join(' │ ')));
  }

  lines.push('');
  return lines.join('\n');
}

export function getMinimalLogo(version?: string): string {
  const lines = [
    '',
    pc.dim(`${symbols.diamondOpen}───`) + pc.white('SKILLKIT') + pc.dim(`───${symbols.diamondOpen}`),
  ];

  if (version) {
    lines.push(pc.dim(`     v${version}`));
  }

  lines.push('');
  return lines.join('\n');
}

export function getLogo(version?: string, agentCount?: number): string {
  const width = getTerminalWidth();

  if (width >= 70) {
    return getFullLogo(version, agentCount);
  }
  if (width >= 50) {
    return getCompactLogo(version, agentCount);
  }
  return getMinimalLogo(version);
}

export function getHeader(title: string): string {
  return `\n${pc.dim(symbols.diamondOpen)} ${pc.white(pc.bold('SkillKit'))} ${pc.dim('│')} ${pc.cyan(title)}\n`;
}

export function getDivider(width?: number): string {
  const fallback = Math.min(getTerminalWidth() - 4, 60);
  const w = Math.max(1, width ?? fallback);
  return pc.dim(symbols.horizontalLine.repeat(w));
}
