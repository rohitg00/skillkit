/**
 * Sync Screen - Cross-Agent Synchronization
 * Clean monochromatic design
 */
import { useState, useEffect, useMemo } from 'react';
import { type Screen } from '../state/index.js';
import { terminalColors } from '../theme/colors.js';
import { AGENT_LOGOS } from '../theme/symbols.js';

interface SyncProps {
  onNavigate: (screen: Screen) => void;
  cols?: number;
  rows?: number;
}

const SPINNER = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

export function Sync({ onNavigate, cols = 80, rows = 24 }: SyncProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'done'>('idle');
  const [spinnerFrame, setSpinnerFrame] = useState(0);
  const [animPhase, setAnimPhase] = useState(0);

  const isCompact = cols < 60;
  const contentWidth = Math.min(cols - 4, 60);

  // Entrance animation
  useEffect(() => {
    if (animPhase >= 2) return;
    const timer = setTimeout(() => setAnimPhase(p => p + 1), 100);
    return () => clearTimeout(timer);
  }, [animPhase]);

  // Spinner animation
  useEffect(() => {
    if (syncStatus !== 'syncing') return;
    const interval = setInterval(() => {
      setSpinnerFrame(f => (f + 1) % SPINNER.length);
    }, 80);
    return () => clearInterval(interval);
  }, [syncStatus]);

  // Agents with sync data
  const agents = useMemo(() => {
    const agentTypes = ['claude-code', 'cursor', 'github-copilot', 'codex', 'gemini-cli', 'windsurf'];
    return agentTypes.slice(0, isCompact ? 4 : 6).map((type) => ({
      type,
      ...(AGENT_LOGOS[type] || { name: type, icon: '◇' }),
      synced: type === 'claude-code' || type === 'cursor',
      skillCount: type === 'claude-code' ? 12 : type === 'cursor' ? 8 : 0,
    }));
  }, [isCompact]);

  const syncedCount = agents.filter(a => a.synced).length;
  const totalSkills = agents.reduce((sum, a) => sum + a.skillCount, 0);

  const divider = useMemo(() =>
    <text fg={terminalColors.textMuted}>{'─'.repeat(contentWidth)}</text>,
    [contentWidth]
  );

  const shortcuts = isCompact
    ? 'j/k nav   enter sync   a sync all   esc back'
    : 'j/k navigate   enter sync selected   a sync all   esc back';

  return (
    <box flexDirection="column" padding={1}>
      {/* Header */}
      {animPhase >= 1 && (
        <box flexDirection="column">
          <box flexDirection="row" justifyContent="space-between" width={contentWidth}>
            <text fg={terminalColors.sync}>⇄ Sync</text>
            <text fg={terminalColors.textMuted}>{syncedCount}/{agents.length} synced</text>
          </box>
          <text fg={terminalColors.textMuted}>share skills across agents</text>
          <text> </text>
        </box>
      )}

      {/* Status */}
      {animPhase >= 2 && (
        <box flexDirection="column">
          {divider}
          <text> </text>
          {syncStatus === 'syncing' ? (
            <box flexDirection="row">
              <text fg={terminalColors.accent}>{SPINNER[spinnerFrame]} </text>
              <text fg={terminalColors.text}>Syncing skills...</text>
            </box>
          ) : syncStatus === 'done' ? (
            <box flexDirection="row">
              <text fg={terminalColors.success}>✓ </text>
              <text fg={terminalColors.text}>Sync complete</text>
              <text fg={terminalColors.textMuted}> · {totalSkills} skills synced</text>
            </box>
          ) : (
            <box flexDirection="row" gap={3}>
              <text fg={terminalColors.success}>● {syncedCount} synced</text>
              <text fg={terminalColors.textMuted}>○ {agents.length - syncedCount} pending</text>
            </box>
          )}
          <text> </text>
          {divider}
          <text> </text>
        </box>
      )}

      {/* Agents list */}
      {animPhase >= 2 && (
        <box flexDirection="column">
          <text fg={terminalColors.text}>Agents</text>
          <text> </text>

          {agents.map((agent, idx) => {
            const selected = idx === selectedIndex;
            const indicator = selected ? '▸' : ' ';
            const statusIcon = agent.synced ? '●' : '○';
            const statusColor = agent.synced ? terminalColors.success : terminalColors.textMuted;
            return (
              <box key={agent.type} flexDirection="row">
                <text fg={terminalColors.text}>{indicator}</text>
                <text fg={selected ? terminalColors.accent : terminalColors.text}>
                  {agent.icon} {agent.name}
                </text>
                <text fg={statusColor}> {statusIcon}</text>
                <text fg={terminalColors.textMuted}> {agent.skillCount} skills</text>
              </box>
            );
          })}
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
