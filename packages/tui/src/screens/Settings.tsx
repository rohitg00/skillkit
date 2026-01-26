import { useState, useEffect, useMemo, useCallback } from 'react';
import { useKeyboard } from '@opentui/react';
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

export function Settings({ onNavigate, cols = 80 }: SettingsProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [settings, setSettings] = useState<SettingItem[]>(DEFAULT_SETTINGS);
  const [animPhase, setAnimPhase] = useState(0);

  const isCompact = cols < 60;
  const contentWidth = Math.max(1, Math.min(cols - 4, 60));

  useEffect(() => {
    if (animPhase >= 2) return;
    const timer = setTimeout(() => setAnimPhase(p => p + 1), 100);
    return () => clearTimeout(timer);
  }, [animPhase]);

  const handleKeyNav = useCallback((delta: number) => {
    setSelectedIndex(prev => Math.max(0, Math.min(prev + delta, settings.length - 1)));
  }, [settings.length]);

  const handleToggle = useCallback(() => {
    const setting = settings[selectedIndex];
    if (setting?.type === 'toggle') {
      setSettings(prev => prev.map((s, i) =>
        i === selectedIndex ? { ...s, value: s.value === 'enabled' ? 'disabled' : 'enabled' } : s
      ));
    }
  }, [selectedIndex, settings]);

  const handleReset = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  const handleKeyboard = useCallback((key: { name?: string }) => {
    if (key.name === 'j' || key.name === 'down') handleKeyNav(1);
    else if (key.name === 'k' || key.name === 'up') handleKeyNav(-1);
    else if (key.name === 'return') handleToggle();
    else if (key.name === 'r') handleReset();
    else if (key.name === 'escape') onNavigate('home');
  }, [handleKeyNav, handleToggle, handleReset, onNavigate]);

  useKeyboard(handleKeyboard);

  const divider = useMemo(() =>
    <text fg={terminalColors.textMuted}>{'─'.repeat(contentWidth)}</text>,
    [contentWidth]
  );

  const shortcuts = isCompact
    ? 'j/k nav   enter toggle   r reset   esc back'
    : 'j/k navigate   enter toggle   r reset defaults   esc back';

  return (
    <box flexDirection="column" padding={1}>
      {/* Header */}
      {animPhase >= 1 && (
        <box flexDirection="column">
          <box flexDirection="row" justifyContent="space-between" width={contentWidth}>
            <text fg={terminalColors.text}>⚙ Settings</text>
            <text fg={terminalColors.textMuted}>{settings.length} options</text>
          </box>
          <text fg={terminalColors.textMuted}>configure skillkit</text>
          <text> </text>
        </box>
      )}

      {/* Settings list */}
      {animPhase >= 2 && (
        <box flexDirection="column">
          {divider}
          <text> </text>
          <text fg={terminalColors.text}>Configuration</text>
          <text> </text>

          {settings.map((setting, idx) => {
            const selected = idx === selectedIndex;
            const indicator = selected ? '▸' : ' ';
            const valueColor = setting.type === 'toggle'
              ? (setting.value === 'enabled' ? terminalColors.success : terminalColors.textMuted)
              : terminalColors.textMuted;
            const toggleIcon = setting.type === 'toggle'
              ? (setting.value === 'enabled' ? '● ' : '○ ')
              : '';
            return (
              <box key={setting.key} flexDirection="row">
                <text fg={terminalColors.text}>{indicator}</text>
                <text fg={selected ? terminalColors.accent : terminalColors.text} width={18}>
                  {setting.label}
                </text>
                <text fg={valueColor}>{toggleIcon}{setting.value}</text>
              </box>
            );
          })}
          <text> </text>
        </box>
      )}

      {/* Config location */}
      {animPhase >= 2 && !isCompact && (
        <box flexDirection="column">
          {divider}
          <text fg={terminalColors.textMuted}>config: ~/.config/skillkit/config.json</text>
          <text> </text>
        </box>
      )}

      {/* Footer */}
      {animPhase >= 2 && (
        <box flexDirection="column">
          {divider}
          <text fg={terminalColors.textMuted}>{shortcuts}</text>
        </box>
      )}
    </box>
  );
}
