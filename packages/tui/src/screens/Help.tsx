import { useState, useEffect, useMemo } from 'react';
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

function ShortcutSection({ section, items, isLast }: { section: string; items: { key: string; desc: string }[]; isLast: boolean }) {
  return (
    <box flexDirection="column">
      <text fg={terminalColors.text}>{section}</text>
      {items.map((item) => (
        <box key={item.key} flexDirection="row">
          <text fg={terminalColors.accent} width={8}>  {item.key}</text>
          <text fg={terminalColors.textMuted}>{item.desc}</text>
        </box>
      ))}
      {!isLast && <text> </text>}
    </box>
  );
}

export function Help({ cols = 80 }: HelpProps) {
  const [animPhase, setAnimPhase] = useState(0);
  const isCompact = cols < 60;
  const rawWidth = cols - 4;
  const contentWidth = Math.max(1, Math.min(rawWidth, 60));
  const version = getVersion();

  useEffect(() => {
    if (animPhase >= 2) return;
    const timer = setTimeout(() => setAnimPhase(p => p + 1), 100);
    return () => clearTimeout(timer);
  }, [animPhase]);

  const divider = useMemo(() =>
    <text fg={terminalColors.textMuted}>{'─'.repeat(contentWidth)}</text>,
    [contentWidth]
  );

  return (
    <box flexDirection="column" padding={1}>
      {animPhase >= 1 && (
        <box flexDirection="column">
          <box flexDirection="row" justifyContent="space-between" width={contentWidth}>
            <text fg={terminalColors.text}>/ Help</text>
            <text fg={terminalColors.textMuted}>skillkit v{version}</text>
          </box>
          <text fg={terminalColors.textMuted}>keyboard shortcuts and navigation</text>
          <text> </text>
        </box>
      )}

      {animPhase >= 2 && (
        <box flexDirection="column">
          {divider}
          <text> </text>
          {isCompact ? (
            SHORTCUTS.map((s, idx) => (
              <ShortcutSection key={s.section} section={s.section} items={s.items} isLast={idx === SHORTCUTS.length - 1} />
            ))
          ) : (
            <box flexDirection="row">
              <box flexDirection="column" width={Math.floor(contentWidth / 2)}>
                {SHORTCUTS.slice(0, 2).map((s, idx) => (
                  <ShortcutSection key={s.section} section={s.section} items={s.items} isLast={idx === 1} />
                ))}
              </box>
              <box flexDirection="column" width={Math.floor(contentWidth / 2)}>
                {SHORTCUTS.slice(2).map((s, idx) => (
                  <ShortcutSection key={s.section} section={s.section} items={s.items} isLast={idx === 1} />
                ))}
              </box>
            </box>
          )}
          <text> </text>
        </box>
      )}

      {animPhase >= 2 && (
        <box flexDirection="column">
          {divider}
          <text fg={terminalColors.textMuted}>esc back  h home  q quit</text>
        </box>
      )}
    </box>
  );
}
