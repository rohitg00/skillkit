import { For, Show } from 'solid-js';
import { type Screen, SIDEBAR_NAV } from '../state/types.js';
import { terminalColors } from '../theme/colors.js';
import { symbols } from '../theme/symbols.js';
import { getVersion } from '../utils/helpers.js';

interface SidebarProps {
  screen: Screen;
  onNavigate: (screen: Screen) => void;
}

export function Sidebar(props: SidebarProps) {
  const version = getVersion();

  return (
    <box flexDirection="column" width={18} paddingRight={1}>
      <text fg={terminalColors.accent}>
        <b>{symbols.brandIcon} skillkit</b>
      </text>
      <text fg={terminalColors.textMuted}>v{version}</text>
      <text> </text>

      <For each={SIDEBAR_NAV}>
        {(nav, idx) => (
          <box flexDirection="column">
            <Show when={idx() > 0}>
              <text> </text>
            </Show>
            <text fg={terminalColors.textMuted}>
              <i>{nav.section}</i>
            </text>
            <For each={nav.items}>
              {(item) => {
                const active = () => props.screen === item.screen;
                return (
                  <text fg={active() ? terminalColors.accent : terminalColors.text}>
                    {active() ? (
                      <b>
                        {symbols.pointer} {item.label}
                      </b>
                    ) : (
                      <>
                        {symbols.pointerInactive} {item.label}
                      </>
                    )}
                  </text>
                );
              }}
            </For>
          </box>
        )}
      </For>

      <box flexGrow={1} />
      <text fg={terminalColors.textMuted}>{symbols.horizontalLine.repeat(14)}</text>
      <text fg={terminalColors.textMuted}>/ help  q quit</text>
    </box>
  );
}
