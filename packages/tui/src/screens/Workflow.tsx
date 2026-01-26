/**
 * Workflow Screen - Automation Builder
 * Clean monochromatic design
 */
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useKeyboard } from '@opentui/react';
import { type Screen } from '../state/index.js';
import { terminalColors } from '../theme/colors.js';

interface WorkflowProps {
  onNavigate: (screen: Screen) => void;
  cols?: number;
  rows?: number;
}

const WORKFLOWS = [
  { name: 'test-and-commit', steps: 3, lastRun: '1 hour ago', status: 'success' as const },
  { name: 'deploy-preview', steps: 5, lastRun: '2 hours ago', status: 'success' as const },
  { name: 'full-ci', steps: 8, lastRun: '1 day ago', status: 'failed' as const },
  { name: 'quick-fix', steps: 2, lastRun: '3 days ago', status: 'pending' as const },
];

export function Workflow({ onNavigate, cols = 80, rows = 24 }: WorkflowProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [animPhase, setAnimPhase] = useState(0);

  const isCompact = cols < 60;
  const contentWidth = Math.max(1, Math.min(cols - 4, 60));

  // Entrance animation
  useEffect(() => {
    if (animPhase >= 2) return;
    const timer = setTimeout(() => setAnimPhase(p => p + 1), 100);
    return () => clearTimeout(timer);
  }, [animPhase]);

  const successCount = WORKFLOWS.filter(w => w.status === 'success').length;
  const failedCount = WORKFLOWS.filter(w => w.status === 'failed').length;

  const handleKeyNav = useCallback((delta: number) => {
    setSelectedIndex(prev => Math.max(0, Math.min(prev + delta, WORKFLOWS.length - 1)));
  }, []);

  useKeyboard((key: { name?: string }) => {
    if (key.name === 'j' || key.name === 'down') handleKeyNav(1);
    else if (key.name === 'k' || key.name === 'up') handleKeyNav(-1);
    else if (key.name === 'escape') onNavigate('home');
  });

  const divider = useMemo(() =>
    <text fg={terminalColors.textMuted}>{'─'.repeat(contentWidth)}</text>,
    [contentWidth]
  );

  const shortcuts = isCompact
    ? 'j/k nav   esc back'
    : 'j/k navigate   esc back';

  return (
    <box flexDirection="column" padding={1}>
      {/* Header */}
      {animPhase >= 1 && (
        <box flexDirection="column">
          <box flexDirection="row" justifyContent="space-between" width={contentWidth}>
            <text fg={terminalColors.workflow}>⟳ Workflows</text>
            <text fg={terminalColors.textMuted}>{WORKFLOWS.length} workflows</text>
          </box>
          <text fg={terminalColors.textMuted}>automate skill chains</text>
          <text> </text>
        </box>
      )}

      {/* Stats */}
      {animPhase >= 2 && (
        <box flexDirection="column">
          {divider}
          <text> </text>
          <box flexDirection="row" gap={3}>
            <text fg={terminalColors.success}>✓ {successCount} passed</text>
            {failedCount > 0 && (
              <text fg={terminalColors.error}>✗ {failedCount} failed</text>
            )}
          </box>
          <text> </text>
          {divider}
          <text> </text>
        </box>
      )}

      {/* Workflows list */}
      {animPhase >= 2 && (
        <box flexDirection="column">
          <text fg={terminalColors.text}>Workflows</text>
          <text> </text>

          {WORKFLOWS.length === 0 ? (
            <box flexDirection="column">
              <text fg={terminalColors.textMuted}>No workflows yet</text>
              <text> </text>
              <text fg={terminalColors.textMuted}>Press 'n' to create one</text>
            </box>
          ) : (
            WORKFLOWS.map((wf, idx) => {
              const selected = idx === selectedIndex;
              const indicator = selected ? '▸' : ' ';
              const statusIcon = wf.status === 'success' ? '✓'
                : wf.status === 'failed' ? '✗' : '○';
              const statusColor = wf.status === 'success' ? terminalColors.success
                : wf.status === 'failed' ? terminalColors.error : terminalColors.textMuted;
              return (
                <box key={wf.name} flexDirection="row">
                  <text fg={terminalColors.text}>{indicator}</text>
                  <text fg={selected ? terminalColors.accent : terminalColors.text} width={18}>
                    {wf.name}
                  </text>
                  <text fg={statusColor}>{statusIcon} </text>
                  <text fg={terminalColors.textMuted}>{wf.steps}s · {wf.lastRun}</text>
                </box>
              );
            })
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
