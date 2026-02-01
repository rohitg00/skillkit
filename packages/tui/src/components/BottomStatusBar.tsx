import { type Screen } from '../state/types.js';
import { terminalColors } from '../theme/colors.js';
import { symbols } from '../theme/symbols.js';
import { getVersion } from '../utils/helpers.js';

interface BottomStatusBarProps {
  currentScreen: Screen;
}

const SCREEN_LABELS: Record<Screen, string> = {
  home: 'Home',
  browse: 'Browse',
  marketplace: 'Marketplace',
  installed: 'Installed',
  settings: 'Settings',
  recommend: 'Recommend',
  translate: 'Translate',
  context: 'Context',
  memory: 'Memory',
  team: 'Team',
  plugins: 'Plugins',
  methodology: 'Methodology',
  plan: 'Plan',
  workflow: 'Workflow',
  execute: 'Execute',
  history: 'History',
  sync: 'Sync',
  help: 'Help',
  mesh: 'Mesh',
  message: 'Message',
};

export function BottomStatusBar(props: BottomStatusBarProps) {
  const version = getVersion();

  return (
    <box
      flexDirection="row"
      height={1}
      borderTop
      borderColor={terminalColors.border}
      paddingX={1}
    >
      <text fg={terminalColors.accent}>
        <b>{symbols.brandIcon} skillkit</b> v{version}
      </text>
      <text fg={terminalColors.border}> {symbols.verticalLine} </text>
      <text fg={terminalColors.text}>
        <b>{SCREEN_LABELS[props.currentScreen]}</b>
      </text>
      <text fg={terminalColors.border}> {symbols.verticalLine} </text>
      <text fg={terminalColors.textMuted}>/ cmd  h home  m market  q quit</text>
    </box>
  );
}
