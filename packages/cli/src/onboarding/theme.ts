import pc from 'picocolors';

export const AGENT_ICONS: Record<string, string> = {
  'claude-code': '\u27c1',
  'cursor': '\u25eb',
  'codex': '\u25ce',
  'gemini-cli': '\u2726',
  'opencode': '\u2b21',
  'github-copilot': '\u25c8',
  'windsurf': '\u224b',
  'droid': '\u25a3',
  'goose': '\u25c7',
  'amp': '\u25b3',
  'kilo': '\u25c9',
  'kiro-cli': '\u2b22',
  'roo': '\u2299',
  'trae': '\u25c6',
  'antigravity': '\u229b',
  'clawdbot': '\u27d0',
  'universal': '\u25cf',
};

export const AGENT_NAMES: Record<string, string> = {
  'claude-code': 'Claude Code',
  'cursor': 'Cursor',
  'codex': 'Codex CLI',
  'gemini-cli': 'Gemini CLI',
  'opencode': 'OpenCode',
  'github-copilot': 'Copilot',
  'windsurf': 'Windsurf',
  'droid': 'Droid',
  'goose': 'Goose',
  'amp': 'Amp',
  'kilo': 'Kilo Code',
  'kiro-cli': 'Kiro',
  'roo': 'Roo Code',
  'trae': 'Trae',
  'antigravity': 'Antigravity',
  'clawdbot': 'Clawdbot',
  'universal': 'Universal',
};

export const symbols = {
  stepPending: '\u25cb',
  stepActive: '\u25cf',
  stepComplete: '\u25cf',
  stepLine: '\u2502',
  selected: '\u25cf',
  unselected: '\u25cb',
  pointer: '\u25b8',
  progressFull: '\u2588',
  progressEmpty: '\u2591',
  success: '\u2713',
  error: '\u2717',
  warning: '\u26a0',
  info: '\u2139',
  arrowRight: '\u2192',
  arrowLeft: '\u2190',
  diamondOpen: '\u25c7',
  diamondFilled: '\u25c6',
  horizontalLine: '\u2500',
  verticalLine: '\u2502',
  frameCorner: '\u25c7',
  frameLine: '\u2500',
};

export const SPINNER_FRAMES = [
  '\u280b',
  '\u2819',
  '\u2839',
  '\u2838',
  '\u283c',
  '\u2834',
  '\u2826',
  '\u2827',
  '\u2807',
  '\u280f',
];

export const colors = {
  accent: (text: string) => pc.green(text),
  accentBright: (text: string) => pc.bold(pc.green(text)),
  primary: (text: string) => pc.white(text),
  secondary: (text: string) => pc.gray(text),
  muted: (text: string) => pc.dim(text),
  success: (text: string) => pc.green(text),
  error: (text: string) => pc.red(text),
  warning: (text: string) => pc.yellow(text),
  info: (text: string) => pc.blue(text),
  bold: (text: string) => pc.bold(text),
  dim: (text: string) => pc.dim(text),
  underline: (text: string) => pc.underline(text),
  cyan: (text: string) => pc.cyan(text),
  magenta: (text: string) => pc.magenta(text),
};

export function formatAgent(agentType: string): string {
  const icon = AGENT_ICONS[agentType] || symbols.stepActive;
  const name = AGENT_NAMES[agentType] || agentType;
  return `${icon} ${name}`;
}

export function getAgentIcon(agentType: string): string {
  return AGENT_ICONS[agentType] || symbols.stepActive;
}

export function formatAgentIconsInline(agents: string[]): string {
  return agents.map(a => getAgentIcon(a)).join(' ');
}

export function progressBar(value: number, total: number, width: number = 6): string {
  if (width <= 0 || total <= 0) return '';
  const clampedValue = Math.min(Math.max(value, 0), total);
  const filled = Math.round((clampedValue / total) * width);
  const safeFilled = Math.min(Math.max(filled, 0), width);
  const empty = width - safeFilled;
  return symbols.progressFull.repeat(safeFilled) + symbols.progressEmpty.repeat(empty);
}

export function formatScore(score: number): string {
  const bar = progressBar(score, 100, 6);
  let scoreColor: (text: string) => string;
  if (score >= 70) {
    scoreColor = colors.success;
  } else if (score >= 50) {
    scoreColor = colors.warning;
  } else {
    scoreColor = colors.muted;
  }
  return `${scoreColor(`${score}%`)} ${colors.dim(bar)}`;
}
