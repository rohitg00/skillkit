/**
 * Browse Screen - Repository Explorer
 * Clean monochromatic design
 */
import { useState, useEffect, useMemo } from 'react';
import { type Screen, DEFAULT_REPOS } from '../state/index.js';
import { terminalColors } from '../theme/colors.js';

interface BrowseProps {
  onNavigate: (screen: Screen) => void;
  cols?: number;
  rows?: number;
}

export function Browse({ onNavigate, cols = 80, rows = 24 }: BrowseProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [animPhase, setAnimPhase] = useState(0);

  const isCompact = cols < 60;
  const contentWidth = Math.min(cols - 4, 60);

  // Entrance animation
  useEffect(() => {
    if (animPhase >= 2) return;
    const timer = setTimeout(() => setAnimPhase(p => p + 1), 100);
    return () => clearTimeout(timer);
  }, [animPhase]);

  const repos = useMemo(() =>
    DEFAULT_REPOS.map((r) => ({
      name: r.name,
      source: r.source,
    })),
    []
  );

  const filteredRepos = useMemo(() =>
    searchQuery
      ? repos.filter(
          (r) =>
            r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.source.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : repos,
    [repos, searchQuery]
  );

  // Calculate visible repos
  const maxVisible = Math.max(5, rows - 10);
  const startIdx = Math.max(0, Math.min(selectedIndex - Math.floor(maxVisible / 2), filteredRepos.length - maxVisible));
  const visibleRepos = filteredRepos.slice(startIdx, startIdx + maxVisible);

  const divider = useMemo(() =>
    <text fg={terminalColors.textMuted}>{'─'.repeat(contentWidth)}</text>,
    [contentWidth]
  );

  const shortcuts = isCompact
    ? 'j/k nav   enter open   / search   esc back'
    : 'j/k navigate   enter open   / search   esc back';

  return (
    <box flexDirection="column" padding={1}>
      {/* Header */}
      {animPhase >= 1 && (
        <box flexDirection="column">
          <box flexDirection="row" justifyContent="space-between" width={contentWidth}>
            <text fg={terminalColors.browse}>⌕ Browse</text>
            <text fg={terminalColors.textMuted}>{filteredRepos.length} repos</text>
          </box>
          <text fg={terminalColors.textMuted}>explore skill repositories</text>
          <text> </text>
        </box>
      )}

      {/* Search */}
      {animPhase >= 2 && (
        <box flexDirection="column">
          {divider}
          <text> </text>
          <box flexDirection="row">
            <text fg={terminalColors.textMuted}>/ </text>
            <text fg={searchQuery ? terminalColors.text : terminalColors.textMuted}>
              {searchQuery || 'type to filter...'}
            </text>
          </box>
          <text> </text>
          {divider}
          <text> </text>
        </box>
      )}

      {/* Repository list */}
      {animPhase >= 2 && (
        <box flexDirection="column">
          <text fg={terminalColors.text}>Repositories</text>
          <text> </text>

          {filteredRepos.length === 0 ? (
            <text fg={terminalColors.textMuted}>No repositories match your search</text>
          ) : (
            <box flexDirection="column">
              {visibleRepos.map((repo, idx) => {
                const actualIdx = startIdx + idx;
                const selected = actualIdx === selectedIndex;
                const indicator = selected ? '▸' : ' ';
                // Truncate source if needed
                const maxLen = contentWidth - repo.name.length - 6;
                const displaySource = repo.source.length > maxLen
                  ? repo.source.slice(0, maxLen - 3) + '...'
                  : repo.source;
                return (
                  <box key={repo.source} flexDirection="row">
                    <text fg={terminalColors.text}>{indicator}</text>
                    <text fg={selected ? terminalColors.accent : terminalColors.text}>
                      {repo.name}
                    </text>
                    <text fg={terminalColors.textMuted}> · {displaySource}</text>
                  </box>
                );
              })}
            </box>
          )}

          {/* Scroll indicator */}
          {filteredRepos.length > maxVisible && (
            <text fg={terminalColors.textMuted}>
              {'\n'}showing {startIdx + 1}-{Math.min(startIdx + maxVisible, filteredRepos.length)} of {filteredRepos.length}
            </text>
          )}
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
