import { createSignal, createEffect, onCleanup, createMemo, Show, For } from 'solid-js';
import { type Screen } from '../state/index.js';
import { terminalColors } from '../theme/colors.js';
import { getVersion } from '../utils/helpers.js';

interface HelpProps {
  onNavigate: (screen: Screen) => void;
  cols?: number;
  rows?: number;
}

const SHORTCUTS = [
  { section: 'Navigation', items: [
    { key: 'h', desc: 'Home screen' },
    { key: 'b', desc: 'Browse skills' },
    { key: 'm', desc: 'Marketplace' },
    { key: 'r', desc: 'Recommendations' },
    { key: 'i', desc: 'Installed skills' },
    { key: 's', desc: 'Sync settings' },
    { key: 'f', desc: 'Find skills' },
  ]},
  { section: 'Actions', items: [
    { key: 't', desc: 'Translate skills' },
    { key: 'w', desc: 'Workflows' },
    { key: 'x', desc: 'Execute' },
    { key: 'n', desc: 'Plan' },
    { key: 'v', desc: 'Validate' },
    { key: 'u', desc: 'Publish' },
  ]},
  { section: 'Team & Config', items: [
    { key: 'a', desc: 'Team settings' },
    { key: 'c', desc: 'Context' },
    { key: 'e', desc: 'Memory' },
    { key: 'p', desc: 'Plugins' },
    { key: 'o', desc: 'Methodology' },
    { key: ',', desc: 'Settings' },
  ]},
  { section: 'Global', items: [
    { key: '/', desc: 'This help screen' },
    { key: 'd', desc: 'Open docs' },
    { key: 'esc', desc: 'Go back / Home' },
    { key: 'q', desc: 'Quit application' },
    { key: 'j/k', desc: 'Navigate lists' },
  ]},
];

interface ShortcutSectionProps {
  section: string;
  items: { key: string; desc: string }[];
  isLast: boolean;
}

function ShortcutSection(props: ShortcutSectionProps) {
  return (
    <box flexDirection="column">
      <text fg={terminalColors.text}>{props.section}</text>
      <For each={props.items}>
        {(item) => (
          <box flexDirection="row">
            <text fg={terminalColors.accent} width={8}>  {item.key}</text>
            <text fg={terminalColors.textMuted}>{item.desc}</text>
          </box>
        )}
      </For>
      <Show when={!props.isLast}>
        <text> </text>
      </Show>
    </box>
  );
}

export function Help(props: HelpProps) {
  const [animPhase, setAnimPhase] = createSignal(0);
  const cols = () => props.cols ?? 80;
  const isCompact = () => cols() < 60;
  const rawWidth = () => cols() - 4;
  const contentWidth = () => Math.max(1, Math.min(rawWidth(), 60));
  const version = getVersion();

  createEffect(() => {
    if (animPhase() >= 2) return;
    const timer = setTimeout(() => setAnimPhase(p => p + 1), 100);
    onCleanup(() => clearTimeout(timer));
  });

  const divider = createMemo(() =>
    <text fg={terminalColors.textMuted}>{'─'.repeat(contentWidth())}</text>
  );

  return (
    <box flexDirection="column" padding={1}>
      <Show when={animPhase() >= 1}>
        <box flexDirection="column">
          <box flexDirection="row" justifyContent="space-between" width={contentWidth()}>
            <text fg={terminalColors.text}>/ Help</text>
            <text fg={terminalColors.textMuted}>skillkit v{version}</text>
          </box>
          <text fg={terminalColors.textMuted}>keyboard shortcuts and navigation</text>
          <text> </text>
        </box>
      </Show>

      <Show when={animPhase() >= 2}>
        <box flexDirection="column">
          {divider()}
          <text> </text>
          <Show when={isCompact()} fallback={
            <box flexDirection="row">
              <box flexDirection="column" width={Math.floor(contentWidth() / 2)}>
                <For each={SHORTCUTS.slice(0, 2)}>
                  {(s, idx) => (
                    <ShortcutSection section={s.section} items={s.items} isLast={idx() === 1} />
                  )}
                </For>
              </box>
              <box flexDirection="column" width={Math.floor(contentWidth() / 2)}>
                <For each={SHORTCUTS.slice(2)}>
                  {(s, idx) => (
                    <ShortcutSection section={s.section} items={s.items} isLast={idx() === 1} />
                  )}
                </For>
              </box>
            </box>
          }>
            <For each={SHORTCUTS}>
              {(s, idx) => (
                <ShortcutSection section={s.section} items={s.items} isLast={idx() === SHORTCUTS.length - 1} />
              )}
            </For>
          </Show>
          <text> </text>
        </box>
      </Show>

      <Show when={animPhase() >= 2}>
        <box flexDirection="column">
          {divider()}
          <text fg={terminalColors.textMuted}>esc back  h home  q quit</text>
        </box>
      </Show>
    </box>
  );
}
