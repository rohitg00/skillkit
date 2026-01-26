import { useState, useEffect, useMemo, useCallback } from 'react';
import { useKeyboard } from '@opentui/react';
import { type Screen, loadSkills, filterSkills } from '../state/index.js';
import { terminalColors } from '../theme/colors.js';

interface InstalledProps {
  onNavigate: (screen: Screen) => void;
  cols?: number;
  rows?: number;
}

const SPINNER = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

export function Installed({ onNavigate, cols = 80, rows = 24 }: InstalledProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState(false);
  const [animPhase, setAnimPhase] = useState(0);
  const [spinnerFrame, setSpinnerFrame] = useState(0);
  const [skills, setSkills] = useState<ReturnType<typeof loadSkills>>({
    skills: [],
    loading: true,
    error: null,
  });

  const isCompact = cols < 60;
  const contentWidth = Math.max(1, Math.min(cols - 4, 60));

  // Entrance animation
  useEffect(() => {
    if (animPhase >= 2) return;
    const timer = setTimeout(() => setAnimPhase(p => p + 1), 100);
    return () => clearTimeout(timer);
  }, [animPhase]);

  // Loading spinner
  useEffect(() => {
    if (!skills.loading) return;
    const interval = setInterval(() => {
      setSpinnerFrame(f => (f + 1) % SPINNER.length);
    }, 80);
    return () => clearInterval(interval);
  }, [skills.loading]);

  // Load skills
  useEffect(() => {
    const data = loadSkills();
    setSkills(data);
  }, []);

  const filteredSkills = useMemo(() =>
    filterSkills(skills.skills, searchQuery),
    [skills.skills, searchQuery]
  );

  const handleKeyNav = useCallback((delta: number) => {
    setSelectedIndex(prev => Math.max(0, Math.min(prev + delta, filteredSkills.length - 1)));
  }, [filteredSkills.length]);

  const handleToggle = useCallback(() => {
    if (filteredSkills.length === 0) return;
    const skill = filteredSkills[selectedIndex];
    if (skill) {
      setSkills(prev => ({
        ...prev,
        skills: prev.skills.map(s =>
          s.name === skill.name ? { ...s, enabled: s.enabled === false } : s
        ),
      }));
    }
  }, [filteredSkills, selectedIndex]);

  const handleKeyboard = useCallback((key: { name?: string; sequence?: string }) => {
    if (searchMode) {
      if (key.name === 'escape') {
        setSearchMode(false);
      } else if (key.name === 'backspace') {
        setSearchQuery(prev => prev.slice(0, -1));
      } else if (key.name === 'return') {
        setSearchMode(false);
      } else if (key.sequence && key.sequence.length === 1 && /[a-zA-Z0-9\-_.]/.test(key.sequence)) {
        setSearchQuery(prev => prev + key.sequence);
        setSelectedIndex(0);
      }
      return;
    }

    if (key.name === 'j' || key.name === 'down') handleKeyNav(1);
    else if (key.name === 'k' || key.name === 'up') handleKeyNav(-1);
    else if (key.sequence === '/') setSearchMode(true);
    else if (key.name === 'return') handleToggle();
    else if (key.name === 'd') handleToggle();
    else if (key.name === 'escape') onNavigate('home');
  }, [searchMode, handleKeyNav, handleToggle, onNavigate]);

  useKeyboard(handleKeyboard);

  useEffect(() => {
    if (selectedIndex >= filteredSkills.length && filteredSkills.length > 0) {
      setSelectedIndex(filteredSkills.length - 1);
    }
  }, [filteredSkills.length, selectedIndex]);

  // Calculate visible items
  const maxVisible = Math.max(5, rows - 10);
  const startIdx = Math.max(0, Math.min(selectedIndex - Math.floor(maxVisible / 2), filteredSkills.length - maxVisible));
  const visibleSkills = filteredSkills.slice(startIdx, startIdx + maxVisible);

  const divider = useMemo(() =>
    <text fg={terminalColors.textMuted}>{'─'.repeat(contentWidth)}</text>,
    [contentWidth]
  );

  // Stats
  const enabledCount = skills.skills.filter(s => s.enabled !== false).length;
  const totalCount = skills.skills.length;

  const shortcuts = isCompact
    ? 'j/k nav   enter toggle   d disable   esc back'
    : 'j/k navigate   enter toggle   d disable   esc back';

  return (
    <box flexDirection="column" padding={1}>
      {/* Header */}
      {animPhase >= 1 && (
        <box flexDirection="column">
          <box flexDirection="row" justifyContent="space-between" width={contentWidth}>
            <text fg={terminalColors.success}>✓ Installed</text>
            <text fg={terminalColors.textMuted}>{enabledCount}/{totalCount} active</text>
          </box>
          <text fg={terminalColors.textMuted}>manage your skills</text>
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

      {/* Skills list */}
      {animPhase >= 2 && (
        <box flexDirection="column">
          {skills.loading ? (
            <box flexDirection="row">
              <text fg={terminalColors.accent}>{SPINNER[spinnerFrame]} </text>
              <text fg={terminalColors.text}>Loading skills...</text>
            </box>
          ) : skills.error ? (
            <box flexDirection="column">
              <text fg={terminalColors.error}>✗ Error loading skills</text>
              <text fg={terminalColors.textMuted}>{skills.error}</text>
            </box>
          ) : filteredSkills.length === 0 ? (
            <box flexDirection="column">
              <text fg={terminalColors.textMuted}>
                {skills.skills.length === 0
                  ? 'No skills installed yet'
                  : 'No skills match your search'}
              </text>
              {skills.skills.length === 0 && (
                <>
                  <text> </text>
                  <text fg={terminalColors.textMuted}>
                    Press 'b' to browse or 'm' for marketplace
                  </text>
                </>
              )}
            </box>
          ) : (
            <box flexDirection="column">
              <text fg={terminalColors.text}>Skills</text>
              <text> </text>
              {visibleSkills.map((skill, idx) => {
                const actualIdx = startIdx + idx;
                const selected = actualIdx === selectedIndex;
                const indicator = selected ? '▸' : ' ';
                const statusIcon = skill.enabled !== false ? '●' : '○';
                const statusColor = skill.enabled !== false ? terminalColors.success : terminalColors.textMuted;
                return (
                  <box key={skill.name} flexDirection="row">
                    <text fg={terminalColors.text}>{indicator}</text>
                    <text fg={statusColor}>{statusIcon} </text>
                    <text fg={selected ? terminalColors.accent : terminalColors.text}>
                      {skill.name}
                    </text>
                  </box>
                );
              })}

              {/* Scroll indicator */}
              {filteredSkills.length > maxVisible && (
                <text fg={terminalColors.textMuted}>
                  {'\n'}showing {startIdx + 1}-{Math.min(startIdx + maxVisible, filteredSkills.length)} of {filteredSkills.length}
                </text>
              )}
            </box>
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
