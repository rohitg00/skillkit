import { type Screen, SIDEBAR_NAV } from '../state/types.js';
import { terminalColors } from '../theme/colors.js';
import { symbols } from '../theme/symbols.js';
import { getVersion } from '../utils/helpers.js';

interface SidebarProps {
  screen: Screen;
  onNavigate: (screen: Screen) => void;
}

export function Sidebar({ screen }: SidebarProps) {
  const version = getVersion();

  return (
    <box flexDirection="column" width={18} paddingRight={1}>
      <text fg={terminalColors.accent}>
        <b>{symbols.brandIcon} skillkit</b>
      </text>
      <text fg={terminalColors.textMuted}>v{version}</text>
      <text> </text>

      {SIDEBAR_NAV.map(({ section, items }, idx) => (
        <box key={section} flexDirection="column">
          {idx > 0 && <text> </text>}
          <text fg={terminalColors.textMuted}>
            <i>{section}</i>
          </text>
          {items.map((item) => {
            const active = screen === item.screen;
            return (
              <text key={item.key} fg={active ? terminalColors.accent : terminalColors.text}>
                {active ? <b>{symbols.pointer} {item.label}</b> : <>{symbols.pointerInactive} {item.label}</>}
              </text>
            );
          })}
        </box>
      ))}

      <box flexGrow={1} />
      <text fg={terminalColors.textMuted}>{symbols.horizontalLine.repeat(14)}</text>
      <text fg={terminalColors.textMuted}>/ help  q quit</text>
    </box>
  );
}
