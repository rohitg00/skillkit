import { createSignal, createEffect, onCleanup, createMemo, Show, For } from 'solid-js';
import { useKeyboard } from '@opentui/solid';
import { type Screen } from '../state/index.js';
import { terminalColors } from '../theme/colors.js';

interface SettingsProps {
  onNavigate: (screen: Screen) => void;
  cols?: number;
  rows?: number;
}

interface SettingItem {
  key: string;
  label: string;
  value: string;
  type: 'select' | 'path' | 'toggle';
}

const DEFAULT_SETTINGS: SettingItem[] = [
  { key: 'defaultAgent', label: 'Default Agent', value: 'claude-code', type: 'select' },
  { key: 'skillsDir', label: 'Skills Directory', value: '.claude/skills', type: 'path' },
  { key: 'autoSync', label: 'Auto Sync', value: 'enabled', type: 'toggle' },
  { key: 'theme', label: 'Theme', value: 'dark', type: 'select' },
  { key: 'telemetry', label: 'Telemetry', value: 'disabled', type: 'toggle' },
];

export function Settings(props: SettingsProps) {
  const [selectedIndex, setSelectedIndex] = createSignal(0);
  const [settings, setSettings] = createSignal<SettingItem[]>(DEFAULT_SETTINGS);
  const [animPhase, setAnimPhase] = createSignal(0);

  const cols = () => props.cols ?? 80;
  const isCompact = () => cols() < 60;
  const contentWidth = () => Math.max(1, Math.min(cols() - 4, 60));

  createEffect(() => {
    if (animPhase() >= 2) return;
    const timer = setTimeout(() => setAnimPhase(p => p + 1), 100);
    onCleanup(() => clearTimeout(timer));
  });

  const handleKeyNav = (delta: number) => {
    setSelectedIndex(prev => Math.max(0, Math.min(prev + delta, settings().length - 1)));
  };

  const handleToggle = () => {
    const setting = settings()[selectedIndex()];
    if (setting?.type === 'toggle') {
      setSettings(prev => prev.map((s, i) =>
        i === selectedIndex() ? { ...s, value: s.value === 'enabled' ? 'disabled' : 'enabled' } : s
      ));
    }
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  useKeyboard((key: { name?: string }) => {
    if (key.name === 'j' || key.name === 'down') handleKeyNav(1);
    else if (key.name === 'k' || key.name === 'up') handleKeyNav(-1);
    else if (key.name === 'return') handleToggle();
    else if (key.name === 'r') handleReset();
    else if (key.name === 'escape') props.onNavigate('home');
  });

  const divider = createMemo(() =>
    <text fg={terminalColors.textMuted}>{'─'.repeat(contentWidth())}</text>
  );

  const shortcuts = () => isCompact()
    ? 'j/k nav   enter toggle   r reset   esc back'
    : 'j/k navigate   enter toggle   r reset defaults   esc back';

  return (
    <box flexDirection="column" padding={1}>
      <Show when={animPhase() >= 1}>
        <box flexDirection="column">
          <box flexDirection="row" justifyContent="space-between" width={contentWidth()}>
            <text fg={terminalColors.text}>Settings</text>
            <text fg={terminalColors.textMuted}>{settings().length} options</text>
          </box>
          <text fg={terminalColors.textMuted}>configure skillkit</text>
          <text> </text>
        </box>
      </Show>

      <Show when={animPhase() >= 2}>
        <box flexDirection="column">
          {divider()}
          <text> </text>
          <text fg={terminalColors.text}>Configuration</text>
          <text> </text>

          <For each={settings()}>
            {(setting, idx) => {
              const selected = () => idx() === selectedIndex();
              const indicator = () => selected() ? '>' : ' ';
              const valueColor = () => setting.type === 'toggle'
                ? (setting.value === 'enabled' ? terminalColors.success : terminalColors.textMuted)
                : terminalColors.textMuted;
              const toggleIcon = () => setting.type === 'toggle'
                ? (setting.value === 'enabled' ? '* ' : 'o ')
                : '';
              return (
                <box flexDirection="row">
                  <text fg={terminalColors.text}>{indicator()}</text>
                  <text fg={selected() ? terminalColors.accent : terminalColors.text} width={18}>
                    {setting.label}
                  </text>
                  <text fg={valueColor()}>{toggleIcon()}{setting.value}</text>
                </box>
              );
            }}
          </For>
          <text> </text>
        </box>
      </Show>

      <Show when={animPhase() >= 2 && !isCompact()}>
        <box flexDirection="column">
          {divider()}
          <text fg={terminalColors.textMuted}>config: ~/.config/skillkit/config.json</text>
          <text> </text>
        </box>
      </Show>

      <Show when={animPhase() >= 2}>
        <box flexDirection="column">
          {divider()}
          <text fg={terminalColors.textMuted}>{shortcuts()}</text>
        </box>
      </Show>
    </box>
  );
}
