import { useState, useEffect, useMemo, useCallback } from 'react';
import { useKeyboard } from '@opentui/react';
import { type Screen, DEFAULT_REPOS } from '../state/index.js';
import { terminalColors } from '../theme/colors.js';

interface MarketplaceProps {
  onNavigate: (screen: Screen) => void;
  cols?: number;
  rows?: number;
}

const CATEGORIES = [
  { name: 'Development', count: 24 },
  { name: 'Testing', count: 18 },
  { name: 'DevOps', count: 15 },
  { name: 'Security', count: 12 },
];

export function Marketplace({ onNavigate, cols = 80, rows = 24 }: MarketplaceProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [animPhase, setAnimPhase] = useState(0);

  const isCompact = cols < 60;
  const contentWidth = Math.max(1, Math.min(cols - 4, 60));

  // Entrance animation
  useEffect(() => {
    if (animPhase >= 3) return;
    const timer = setTimeout(() => setAnimPhase(p => p + 1), 100);
    return () => clearTimeout(timer);
  }, [animPhase]);

  // Featured repos
  const featured = useMemo(() =>
    DEFAULT_REPOS.slice(0, 5).map((r, i) => ({
      name: r.name,
      stars: Math.floor(100 - i * 15),
      source: r.source,
    })),
    []
  );

  const maxVisible = Math.max(3, Math.floor((rows - 14) / 1));
  const visibleFeatured = featured.slice(0, maxVisible);

  const handleKeyNav = useCallback((delta: number) => {
    setSelectedIndex(prev => Math.max(0, Math.min(prev + delta, visibleFeatured.length - 1)));
  }, [visibleFeatured.length]);

  const handleInstall = useCallback(() => {
    const item = visibleFeatured[selectedIndex];
    if (item) {
      // Navigate to installed after "installing"
      onNavigate('installed');
    }
  }, [selectedIndex, visibleFeatured, onNavigate]);

  useKeyboard((key: { name?: string }) => {
    if (key.name === 'j' || key.name === 'down') handleKeyNav(1);
    else if (key.name === 'k' || key.name === 'up') handleKeyNav(-1);
    else if (key.name === 'return') handleInstall();
    else if (key.name === 'b') onNavigate('browse');
    else if (key.name === 'escape') onNavigate('home');
  });

  const divider = useMemo(() =>
    <text fg={terminalColors.textMuted}>{'─'.repeat(contentWidth)}</text>,
    [contentWidth]
  );

  const shortcuts = isCompact
    ? 'j/k nav   enter install   b browse   esc back'
    : 'j/k navigate   enter install   b full browse   esc back';

  return (
    <box flexDirection="column" padding={1}>
      {/* Header */}
      {animPhase >= 1 && (
        <box flexDirection="column">
          <box flexDirection="row" justifyContent="space-between" width={contentWidth}>
            <text fg={terminalColors.recommend}>★ Marketplace</text>
            <text fg={terminalColors.textMuted}>{DEFAULT_REPOS.length} available</text>
          </box>
          <text fg={terminalColors.textMuted}>discover featured skills</text>
          <text> </text>
        </box>
      )}

      {/* Categories */}
      {animPhase >= 2 && (
        <box flexDirection="column">
          {divider}
          <text> </text>
          <text fg={terminalColors.text}>Categories</text>
          <text> </text>
          <box flexDirection="row" gap={2}>
            {CATEGORIES.map(cat => (
              <text key={cat.name} fg={terminalColors.textMuted}>
                {cat.name} ({cat.count})
              </text>
            ))}
          </box>
          <text> </text>
          {divider}
          <text> </text>
        </box>
      )}

      {/* Featured section */}
      {animPhase >= 3 && (
        <box flexDirection="column">
          <box flexDirection="row">
            <text fg={terminalColors.text}>Featured</text>
            <text fg={terminalColors.textMuted}> · trending</text>
          </box>
          <text> </text>

          {visibleFeatured.map((item, idx) => {
            const selected = idx === selectedIndex;
            const indicator = selected ? '▸' : ' ';
            return (
              <box key={item.source} flexDirection="row">
                <text fg={terminalColors.text}>{indicator}</text>
                <text fg={selected ? terminalColors.accent : terminalColors.text}>
                  {item.name}
                </text>
                <text fg={terminalColors.recommend}> ★{item.stars}</text>
              </box>
            );
          })}

          {featured.length > maxVisible && (
            <text fg={terminalColors.textMuted}>
              {'\n'}+{featured.length - maxVisible} more
            </text>
          )}
          <text> </text>
        </box>
      )}

      {/* Footer */}
      {animPhase >= 3 && (
        <box flexDirection="column">
          {divider}
          <text fg={terminalColors.textMuted}>{shortcuts}</text>
        </box>
      )}
    </box>
  );
}
