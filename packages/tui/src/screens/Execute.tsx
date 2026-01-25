/**
 * Execute Screen
 * Live skill execution
 */
import { useState } from 'react';
import { type Screen } from '../state/index.js';
import { terminalColors } from '../theme/colors.js';
import { Header } from '../components/Header.js';
import { Spinner } from '../components/Spinner.js';
import { ProgressBar } from '../components/ProgressBar.js';

interface ExecuteProps {
  onNavigate: (screen: Screen) => void;
  cols?: number;
  rows?: number;
}

export function Execute({ onNavigate, cols = 80, rows = 24 }: ExecuteProps) {
  const [executing, setExecuting] = useState(false);
  const [progress, setProgress] = useState(0);

  return (
    <box flexDirection="column" paddingLeft={1}>
      <Header
        title="Execute"
        subtitle="Run skills in real-time"
        icon="&#x25B6;"
      />

      {executing ? (
        <box flexDirection="column">
          <Spinner label="Executing skill..." />
          <text> </text>
          <ProgressBar progress={progress} width={40} />
          <text> </text>
          <text fg={terminalColors.textMuted}>Press Esc to cancel</text>
        </box>
      ) : (
        <box flexDirection="column">
          <text fg={terminalColors.text}>Select a skill to execute:</text>
          <text> </text>
          <text fg={terminalColors.textMuted}>
            No skills available. Install skills first using 'b' (browse) or 'm' (marketplace).
          </text>
          <text> </text>
          <text fg={terminalColors.textMuted}>
            Press Enter to execute, 'i' to view installed skills
          </text>
        </box>
      )}
    </box>
  );
}
