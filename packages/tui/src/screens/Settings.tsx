/**
 * Settings Screen - Configuration
 * Clean monochromatic design
 */
import { useState, useEffect, useMemo } from 'react';
import { type Screen } from '../state/index.js';
import { terminalColors } from '../theme/colors.js';

interface SettingsProps {
  onNavigate: (screen: Screen) => void;
  cols?: number;
  rows?: number;
}

const SETTINGS = [
  { key: 'defaultAgent', label: 'Default Agent', value: 'claude-code', type: 'select' },
  { key: 'skillsDir', label: 'Skills Directory', value: '.claude/skills', type: 'path' },
  { key: 'autoSync', label: 'Auto Sync', value: 'enabled', type: 'toggle' },
  { key: 'theme', label: 'Theme', value: 'dark', type: 'select' },
  { key: 'telemetry', label: 'Telemetry', value: 'disabled', type: 'toggle' },
];

export function Settings({ onNavigate, cols = 80, rows = 24 }: SettingsProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [animPhase, setAnimPhase] = useState(0);

  const isCompact = cols < 60;
  const contentWidth = Math.min(cols - 4, 60);

  // Entrance animation
  useEffect(() => {
    if (animPhase >= 2) return;
    const timer = setTimeout(() => setAnimPhase(p => p + 1), 100);
    return () => clearTimeout(timer);
  }, [animPhase]);

  const divider = useMemo(() =>
    <text fg={terminalColors.textMuted}>{'─'.repeat(contentWidth)}</text>,
    [contentWidth]
  );

  const shortcuts = isCompact
    ? 'j/k nav   enter edit   r reset   esc back'
    : 'j/k navigate   enter edit   r reset defaults   esc back';

  return (
    <box flexDirection="column" padding={1}>
      {/* Header */}
      {animPhase >= 1 && (
        <box flexDirection="column">
          <box flexDirection="row" justifyContent="space-between" width={contentWidth}>
            <text fg={terminalColors.text}>⚙ Settings</text>
            <text fg={terminalColors.textMuted}>{SETTINGS.length} options</text>
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

          {SETTINGS.map((setting, idx) => {
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
